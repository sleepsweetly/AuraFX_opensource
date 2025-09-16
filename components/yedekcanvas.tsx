"use client"

import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState, useMemo, useLayoutEffect } from "react"
import type { Element, Layer, Tool } from "@/types"
import { Trash2, Settings, Palette, Hash } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import { Slider } from "@/components/ui/slider"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { AxisWidget } from "./axis-widget"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCw, MoveDiagonal, ChevronLeft, ChevronRight } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Pencil, MousePointerClick, Eraser, Circle, Square, Slash } from "lucide-react"

interface CanvasProps {
  currentTool: Tool
  setCurrentTool: (tool: Tool) => void
  layers: Layer[]
  currentLayerId: string | null
  settings: any
  onSettingsChange?: (settings: any) => void
  modes: any
  onAddElement: (element: Element | Element[]) => void
  onClearCanvas: () => void
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
  selectedElementIds: string[]
  setSelectedElementIds: (ids: string[]) => void
  performanceMode?: boolean;
  onShapeCreated?: (type: string) => void;
  onStartBatchMode?: () => void;
  onEndBatchMode?: () => void;
  chainSequence?: string[];
  onChainSequenceChange?: (sequence: string[]) => void;
  chainItems?: Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }>;
}

// Web Workers for optimization
let selectionWorker: Worker | null = null;
let chainAnimationWorker: Worker | null = null;

if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
  // @ts-ignore
  selectionWorker = new Worker(new URL('../worker/selectionWorker.ts', import.meta.url), { type: 'module' });
  // @ts-ignore
  chainAnimationWorker = new Worker(new URL('../worker/chainAnimationWorker.ts', import.meta.url), { type: 'module' });
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(
  { currentTool, setCurrentTool, layers, currentLayerId, settings, onSettingsChange, modes, onAddElement, onClearCanvas, onUpdateLayer, selectedElementIds, setSelectedElementIds, performanceMode = false, onShapeCreated, onStartBatchMode, onEndBatchMode, chainSequence = [], onChainSequenceChange, chainItems = [] },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)

  const [isDrawing, setIsDrawing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [lastElementTime, setLastElementTime] = useState<number | null>(null)
  const [animationTick, setAnimationTick] = useState(0)
  const [chainAnimationData, setChainAnimationData] = useState<any[]>([])

  // Recording wrapper for onAddElement
  const addElementWithRecording = (element: Element | Element[]) => {
    onAddElement(element)

    // If recording is active, add to chain sequence
    if (isRecording && modes.chainMode) {
      const currentTime = Date.now()
      let delayTicks = 1 // Default delay for first element

      // Calculate delay based on time since last element
      if (lastElementTime) {
        const timeDiffMs = currentTime - lastElementTime
        // Convert milliseconds to ticks: 1 second = 20 ticks, so 1 tick = 50ms
        delayTicks = Math.max(1, Math.round(timeDiffMs / 50))
      }

      const elements = Array.isArray(element) ? element : [element]



      // Dispatch event to add elements to chain with calculated delay
      const event = new CustomEvent('addToChainRecording', {
        detail: {
          elements: elements,
          delayTicks: delayTicks
        }
      })
      window.dispatchEvent(event)

      // Update last element time for next calculation
      setLastElementTime(currentTime)
    }
  }
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 })
  const [rotation, setRotation] = useState({ x: 20, y: 0, z: 0 })
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectionBox, setSelectionBox] = useState<null | { start: { x: number, y: number }, end: { x: number, y: number } }>(null)
  const [draggingSelection, setDraggingSelection] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [rotateStart, setRotateStart] = useState<{ mouseX: number, mouseY: number, boxCenter: { x: number, y: number }, initialPositions: { id: string, x: number, z: number, yOffset: number }[], startAngle: number, boxMinX: number, boxMinY: number, boxMaxX: number, boxMaxY: number } | null>(null)
  const [rotateBox, setRotateBox] = useState<{ cx: number, cy: number, minX: number, minY: number, maxX: number, maxY: number } | null>(null)
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [viewMode, setViewMode] = useState<'top' | 'side' | 'diagonal' | 'isometric' | 'front'>('top')
  const orbitLastPos = useRef<{ x: number, y: number } | null>(null)
  const [selectionBoxWorld, setSelectionBoxWorld] = useState<null | { start: { x: number, y: number }, end: { x: number, y: number } }>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [isScaling, setIsScaling] = useState(false)
  const [scaleStart, setScaleStart] = useState<{ mouseX: number, mouseY: number, boxCenter: { x: number, y: number }, initialPositions: { id: string, x: number, z: number, yOffset: number }[], boxMinX: number, boxMinY: number, boxMaxX: number, boxMaxY: number } | null>(null)
  const [showQuickSettings, setShowQuickSettings] = useState(false)
  const [showParticleModal, setShowParticleModal] = useState(false)
  // State for worker-based selection
  const [workerSelection, setWorkerSelection] = useState<{
    selectedIds: string[];
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null>(null);

  const currentLayer = layers.find(layer => layer.id === currentLayerId) || null

  const { state: sidebarState, toggleSidebar } = useSidebar ? useSidebar() : { state: "expanded", toggleSidebar: () => { } };
  const isSidebarCollapsed = sidebarState === "collapsed";

  // Sayfa yenilendiğinde veya kapatıldığında uyarı göster
  useEffect(() => {
    // Uyarı kaldırıldı
  }, [])

  // Debounce utility function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Canvas'ı otomatik yenilemek için useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(prev => prev + 1)
    }, 100) // 100ms sonra canvas'ı yenile

    return () => clearTimeout(timer)
  }, [currentLayerId, layers])

  // Chain mode animasyon timer - sürekli canvas'ı yenile
  useEffect(() => {
    if (!modes.chainMode) return;

    const interval = setInterval(() => {
      setAnimationTick(prev => prev + 1);
    }, 50); // 50ms = 20 FPS

    return () => clearInterval(interval);
  }, [modes.chainMode])

  // Rainbow mode animasyon timer - sürekli canvas'ı yenile
  useEffect(() => {
    if (!modes.rainbowMode) return;

    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 50); // 50ms = 20 FPS

    return () => clearInterval(interval);
  }, [modes.rainbowMode])

  // Canvas'ı yeniden boyutlandır
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      setForceUpdate(prev => prev + 1) // Canvas boyutu değiştiğinde yenile
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Canvas'ı çiz - OPTIMIZED VERSION
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;

    // Clear canvas - only clear dirty regions if possible
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    const gridSize = 20 * scale;

    for (let x = offset.x % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = offset.y % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw center lines
    ctx.strokeStyle = "#404040";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Draw elements for all visible layers (batch drawing)
    if (layers && layers.length > 0) {
      const rainbowColors = [
        "#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff", "#0000ff", "#8000ff", "#ff00ff", "#ff0080"
      ];
      let globalIdx = 0;
      layers.filter(layer => layer.visible).forEach(layer => {
        const elementsToRender = performanceMode
          ? layer.elements.filter((_, index) => index % 2 === 0)
          : layer.elements;

        // === BATCH DRAWING ===
        // Grupla: renk + tip (image/normal)
        const grouped: Record<string, { element: Element; idx: number }[]> = {};
        elementsToRender.forEach((element: Element, idx: number) => {
          let color = element.color || layer.color;
          if (modes.rainbowMode) {
            // Dynamic rainbow - tüm elementler aynı renkte, zamana göre değişir
            const hue = (Date.now() * 0.001) % 1.0;
            const r = Math.floor(255 * Math.max(0, Math.min(1, Math.abs(hue * 6 - 3) - 1)));
            const g = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 2))));
            const b = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 4))));
            color = `rgb(${r},${g},${b})`;
          } else if (modes.staticRainbowMode) {
            // Static rainbow - her element farklı renkte, sabit
            const hue = elementsToRender.length > 1 ? idx / (elementsToRender.length - 1) : 0;
            const r = Math.floor(255 * Math.max(0, Math.min(1, Math.abs(hue * 6 - 3) - 1)));
            const g = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 2))));
            const b = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 4))));
            color = `rgb(${r},${g},${b})`;
          }
          const key = `${color}_${element.type}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({ element, idx });
        });

        Object.entries(grouped).forEach(([key, arr]) => {
          const [color, type] = key.split("_");
          ctx.fillStyle = color;
          ctx.beginPath();
          (arr as { element: Element; idx: number }[]).forEach(({ element }) => {
            let screenX: number, screenY: number;
            if (viewMode === 'top') {
              screenX = centerX + element.position.x * 10 * scale;
              screenY = centerY + element.position.z * 10 * scale;
            } else if (viewMode === 'side') {
              screenX = centerX + element.position.x * 10 * scale;
              const yVal = typeof element.position.y === 'number' ? element.position.y : (element.yOffset || 0);
              screenY = centerY - yVal * 10 * scale;
            } else if (viewMode === 'diagonal') {
              // 45° diagonal view
              const worldX = element.position.x;
              const worldZ = element.position.z;
              screenX = centerX + (worldX * 0.707 + worldZ * 0.707) * 10 * scale;
              screenY = centerY + (worldX * 0.707 - worldZ * 0.707) * 10 * scale;
            } else if (viewMode === 'isometric') {
              // Isometric view
              const worldX = element.position.x;
              const worldZ = element.position.z;
              screenX = centerX + (worldX * 0.866 + worldZ * 0.5) * 10 * scale;
              screenY = centerY + (worldX * 0.5 - worldZ * 0.866) * 10 * scale;
            } else if (viewMode === 'front') {
              // Front view
              const yVal = typeof element.position.y === 'number' ? element.position.y : (element.yOffset || 0);
              screenX = centerX + yVal * 10 * scale;
              screenY = centerY + element.position.z * 10 * scale;
            } else {
              // Default to top view
              screenX = centerX + element.position.x * 10 * scale;
              screenY = centerY + element.position.z * 10 * scale;
            }
            const isPng = element.type === 'image';
            ctx.moveTo(screenX + (isPng ? 0.6 : 3 * scale), screenY);
            ctx.arc(screenX, screenY, isPng ? 0.6 : 3 * scale, 0, 2 * Math.PI);
          });
          ctx.fill();
        });
        // === BATCH DRAWING END ===

        globalIdx += elementsToRender.length;
      });
    } else if (currentLayer?.elements) {
      // fallback: eski davranış
      const rainbowColors = [
        "#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff", "#0000ff", "#8000ff", "#ff00ff", "#ff0080"
      ]
      const elementsToRender = performanceMode
        ? currentLayer.elements.filter((_, index) => index % 2 === 0)
        : currentLayer.elements;

      elementsToRender.forEach((element, idx) => {
        const posY = typeof element.position.y === 'number' ? element.position.y : 0;
        const { x: screenX, y: screenY } = project3DTo2D(element.position.x, posY, element.position.z)
        let color = element.color || currentLayer.color
        if (modes.rainbowMode) {
          // Dynamic rainbow - tüm elementler aynı renkte, zamana göre değişir
          const hue = (Date.now() * 0.001) % 1.0;
          const r = Math.floor(255 * Math.max(0, Math.min(1, Math.abs(hue * 6 - 3) - 1)));
          const g = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 2))));
          const b = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 4))));
          color = `rgb(${r},${g},${b})`;
        } else if (modes.staticRainbowMode) {
          // Static rainbow - her element farklı renkte, sabit
          const hue = elementsToRender.length > 1 ? idx / (elementsToRender.length - 1) : 0;
          const r = Math.floor(255 * Math.max(0, Math.min(1, Math.abs(hue * 6 - 3) - 1)));
          const g = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 2))));
          const b = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 4))));
          color = `rgb(${r},${g},${b})`;
        }
        ctx.fillStyle = color
        ctx.beginPath()
        const isPng = element.type === 'image';
        ctx.arc(screenX, screenY, isPng ? 0.6 : 3 * scale, 0, 2 * Math.PI)
        ctx.fill()

        // Mirror mode preview
        if (modes.mirrorMode) {
          const mirrorX = screenX - screenX
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(mirrorX, screenY, 3 * scale, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
    }

    // Draw chain sequence - Pulse Effect Animation
    if (modes.chainMode && chainItems && chainItems.length > 0 && currentLayer) {
      const chainPositions: { x: number, y: number, elementId: string }[] = []

      // Collect all element positions in chain order (first added = first animated)
      chainItems.forEach((item) => {
        if (item.type !== 'element') return

        const elementIds = item.elementIds || (item.elementId ? [item.elementId] : [])
        const elements = elementIds.map(id => currentLayer.elements.find(el => el.id === id)).filter((el): el is Element => el !== undefined)

        elements.forEach((element) => {
          let screenX: number, screenY: number
          if (viewMode === 'top') {
            screenX = centerX + element.position.x * 10 * scale
            screenY = centerY + element.position.z * 10 * scale
          } else if (viewMode === 'side') {
            screenX = centerX + element.position.x * 10 * scale
            const yVal = typeof element.position.y === 'number' ? element.position.y : (element.yOffset || 0)
            screenY = centerY - yVal * 10 * scale
          } else {
            screenX = centerX + element.position.x * 10 * scale
            screenY = centerY + element.position.z * 10 * scale
          }
          chainPositions.push({ x: screenX, y: screenY, elementId: element.id })
        })
      })

      // Pulse Effect Animation
      if (chainPositions.length > 0) {
        ctx.save()

        // Animation timing
        const time = Date.now() * 0.002
        const cycleDuration = 3
        const totalElements = chainPositions.length

        chainPositions.forEach((pos, index) => {
          // Get animation data from Web Worker
          const animData = chainAnimationData.find(data => data.elementId === pos.elementId);
          
          let pulseIntensity: number;
          let isActive: boolean;
          let time: number;
          
          if (animData) {
            // Use Web Worker data
            pulseIntensity = animData.pulseIntensity;
            isActive = animData.isActive;
            time = animData.time;
          } else {
            // Fallback: Calculate animation locally
            time = Date.now() * 0.002;
            const elementDelay = (index / totalElements) * cycleDuration;
            const animationPhase = (time + elementDelay) % cycleDuration;
            const pulseProgress = animationPhase / cycleDuration;
            
            pulseIntensity = Math.sin(pulseProgress * Math.PI * 2) * 0.5 + 0.5;
            isActive = pulseProgress < 0.3;
          }

          // Pulse ring around element
          const baseRadius = 8 * scale
          const pulseRadius = baseRadius + (pulseIntensity * 10 * scale)
          const alpha = isActive ? 0.8 : 0.3

          // Glow effect
          const gradient = ctx.createRadialGradient(
            pos.x, pos.y, 0,
            pos.x, pos.y, pulseRadius * 1.5
          )
          gradient.addColorStop(0, `rgba(0, 255, 136, ${alpha})`)
          gradient.addColorStop(0.7, `rgba(0, 255, 136, ${alpha * 0.3})`)
          gradient.addColorStop(1, 'rgba(0, 255, 136, 0)')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, pulseRadius * 1.5, 0, 2 * Math.PI)
          ctx.fill()

          // Pulse ring
          ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`
          ctx.lineWidth = 2 * scale
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, pulseRadius, 0, 2 * Math.PI)
          ctx.stroke()

          // Extra sparkle effect for active elements
          if (isActive) {
            const sparkleCount = 4
            for (let i = 0; i < sparkleCount; i++) {
              const angle = (i / sparkleCount) * Math.PI * 2 + time * 3
              const sparkleDistance = (baseRadius + 8) * scale
              const sparkleX = pos.x + Math.cos(angle) * sparkleDistance
              const sparkleY = pos.y + Math.sin(angle) * sparkleDistance

              ctx.fillStyle = `rgba(0, 255, 136, ${pulseIntensity * 0.8})`
              ctx.beginPath()
              ctx.arc(sparkleX, sparkleY, 1.5 * scale, 0, 2 * Math.PI)
              ctx.fill()
            }
          }
        })

        ctx.restore()
      }

    }

    // Draw drag preview for shapes (circle, square, line)
    if (isDragging && (currentTool === "circle" || currentTool === "square" || currentTool === "line")) {
      const startX = dragStart.x
      const startY = dragStart.y
      const endX = dragEnd.x
      const endY = dragEnd.y
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      if (currentTool === "circle") {
        ctx.beginPath()
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (currentTool === "square") {
        const size = radius
        ctx.beginPath()
        ctx.rect(startX - size, startY - size, size * 2, size * 2)
        ctx.stroke()
      } else if (currentTool === "line") {
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }

      ctx.setLineDash([])
    }

    // Draw selection rectangle if active (only when dragging with select tool)
    if (currentTool === "select" && selectionBox) {
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      const x = Math.min(selectionBox.start.x, selectionBox.end.x);
      const y = Math.min(selectionBox.start.y, selectionBox.end.y);
      const w = Math.abs(selectionBox.end.x - selectionBox.start.x);
      const h = Math.abs(selectionBox.end.y - selectionBox.start.y);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw bounding box around selected elements (only when not dragging a selection)
    const MIN_BOX_SIZE = 60
    if (currentTool === "select" && !selectionBox && ((selectedElementIds?.length ?? 0) > 0 && currentLayer)) {
      const canvas = canvasRef.current
      if (canvas) {
        const centerX = canvas.width / 2 + offset.x
        const centerY = canvas.height / 2 + offset.y
        const selectedEls = currentLayer.elements.filter(element => selectedElementIds.includes(element.id))
        if (selectedEls.length > 0) {
          const xs = selectedEls.map(element => centerX + element.position.x * 10 * scale)
          const ys = selectedEls.map(element => {
            if (viewMode === 'side') {
              const yVal = typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
              return centerY - yVal * 10 * scale
            } else {
              return centerY + element.position.z * 10 * scale
            }
          })
          let minX = Math.min(...xs)
          let minY = Math.min(...ys)
          let maxX = Math.max(...xs)
          let maxY = Math.max(...ys)
          // --- SELECTION BOX PADDING ---
          const BOX_PADDING = 20;
          minX -= BOX_PADDING;
          minY -= BOX_PADDING;
          maxX += BOX_PADDING;
          maxY += BOX_PADDING;
          ctx.save()
          ctx.strokeStyle = "#fff"
          ctx.setLineDash([6, 6])
          ctx.lineWidth = 2.5
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
          ctx.setLineDash([])
          ctx.restore()
          // Butonlar artık DOM elementleri olarak render ediliyor
        }
      }
    }

    // Draw eraser preview at cursor
    if (currentTool === 'eraser' && mousePosition) {
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      ctx.save();
      const eraseRadius = 20;
      ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
      ctx.fillStyle = "rgba(255, 80, 80, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, eraseRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [layers, performanceMode, modes, scale, offset, viewMode, currentLayer, dragStart, dragEnd, isDragging, currentTool, selectionBox, selectedElementIds, mousePosition, isRotating, isScaling, scaleStart, chainItems, chainAnimationData, animationTick]);

  // Chain Animation Web Worker
  useEffect(() => {
    if (!chainAnimationWorker) return;

    const handleWorkerMessage = (e: MessageEvent) => {
      if (e.data.type === 'animationFrame') {
        // Force re-render with new array reference and animation tick
        setChainAnimationData([...e.data.data]);
        setAnimationTick(prev => prev + 1);
        // Debug: Check if worker data is coming
        console.log('Worker data received:', e.data.data.length, 'elements');
      }
    };

    chainAnimationWorker.addEventListener('message', handleWorkerMessage);
    return () => chainAnimationWorker.removeEventListener('message', handleWorkerMessage);
  }, []);

  // Chain mode animation control
  const [isChainAnimationRunning, setIsChainAnimationRunning] = useState(false);
  const chainItemsRef = useRef(chainItems);
  
  // Update chainItems ref when it changes
  useEffect(() => {
    chainItemsRef.current = chainItems;
  }, [chainItems]);

  useEffect(() => {
    if (!chainAnimationWorker) return;

    if (modes.chainMode && chainItems && chainItems.length > 0) {
      if (!isChainAnimationRunning) {
        // Start animation in worker only if not already running
        console.log('Starting chain animation worker with', chainItems.length, 'items');
        chainAnimationWorker.postMessage({
          type: 'start',
          chainItems,
          cycleDuration: 3
        });
        setIsChainAnimationRunning(true);
      } else {
        // Update existing animation with new chain items
        console.log('Updating chain animation worker with', chainItems.length, 'items');
        chainAnimationWorker.postMessage({
          type: 'update',
          chainItems,
          cycleDuration: 3
        });
      }
    } else {
      if (isChainAnimationRunning) {
        // Stop animation in worker
        console.log('Stopping chain animation worker');
        chainAnimationWorker.postMessage({ type: 'stop' });
        setChainAnimationData([]);
        setIsChainAnimationRunning(false);
      }
    }

    return () => {
      if (chainAnimationWorker && isChainAnimationRunning) {
        chainAnimationWorker.postMessage({ type: 'stop' });
        setIsChainAnimationRunning(false);
      }
    };
  }, [modes.chainMode]); // Only depend on chainMode to prevent unnecessary restarts
  
  // Separate effect to handle chainItems updates
  useEffect(() => {
    if (!chainAnimationWorker || !modes.chainMode || !isChainAnimationRunning) return;
    
    if (chainItems && chainItems.length > 0) {
      // Update existing animation with new chain items
      console.log('Updating chain animation worker with', chainItems.length, 'items');
      chainAnimationWorker.postMessage({
        type: 'update',
        chainItems,
        cycleDuration: 3
      });
    }
  }, [chainItems, modes.chainMode, isChainAnimationRunning]);



  const getCanvasCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const canvasToWorld = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, z: 0 }

    const centerX = canvas.width / 2 + offset.x
    const centerY = canvas.height / 2 + offset.y

    if (viewMode === 'side') {
      return {
        x: (canvasX - centerX) / (10 * scale),
        z: 0,
      };
    } else if (viewMode === 'diagonal') {
      // 45° diagonal view - X and Z mixed
      const worldX = (canvasX - centerX) / (10 * scale);
      const worldZ = (canvasY - centerY) / (10 * scale);
      return {
        x: worldX * 0.707 + worldZ * 0.707, // cos(45°) = 0.707
        z: worldX * 0.707 - worldZ * 0.707,
      };
    } else if (viewMode === 'isometric') {
      // Isometric view - 30° rotation
      const worldX = (canvasX - centerX) / (10 * scale);
      const worldZ = (canvasY - centerY) / (10 * scale);
      return {
        x: worldX * 0.866 + worldZ * 0.5, // cos(30°) = 0.866, sin(30°) = 0.5
        z: worldX * 0.5 - worldZ * 0.866,
      };
    } else if (viewMode === 'front') {
      // Front view - Y and Z
      return {
        x: 0,
        z: (canvasY - centerY) / (10 * scale),
      };
    } else {
      // Top view (default)
      return {
        x: (canvasX - centerX) / (10 * scale),
        z: (canvasY - centerY) / (10 * scale),
      };
    }
  }

  const eraseElements = (mouseX: number, mouseY: number) => {
    if (!currentLayer || !onUpdateLayer) return

    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2 + offset.x
    const centerY = canvas.height / 2 + offset.y
    const eraseRadius = 20

    // Yeni element listesini oluştur
    const newElements = currentLayer.elements.filter((element) => {
      let elementX, elementY;
      if (viewMode === 'top') {
        elementX = centerX + element.position.x * 10 * scale;
        elementY = centerY + element.position.z * 10 * scale;
      } else {
        elementX = centerX + element.position.x * 10 * scale;
        const yVal = typeof element.position.y === 'number' ? element.position.y : (element.yOffset || 0);
        elementY = centerY - yVal * 10 * scale;
      }
      const distance = Math.sqrt(Math.pow(mouseX - elementX, 2) + Math.pow(mouseY - elementY, 2));
      return distance > eraseRadius;
    });

    // Parent'a bildir
    onUpdateLayer(currentLayer.id, { elements: newElements })
  }

  // Handle keydown for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentTool === "select" && selectedElementIds.length > 0 && (e.key === "Backspace" || e.key === "Delete")) {
        if (!currentLayer || !onUpdateLayer) return
        const newElements = currentLayer.elements.filter(element => !selectedElementIds.includes(element.id))
        onUpdateLayer(currentLayer.id, { elements: newElements })
        setSelectedElementIds([])
        setWorkerSelection(null) // Seçim silindiğinde workerSelection'ı da temizle
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentTool, selectedElementIds, currentLayer, onUpdateLayer])

  // Icon hit area padding
  const ICON_HIT_PADDING = 12
  const ICON_SIZE = 32

  function canvasToWorldXY(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;

    if (viewMode === 'side') {
      return {
        x: (x - centerX) / (10 * scale),
        y: -((y - centerY) / (10 * scale)),
      };
    } else if (viewMode === 'diagonal') {
      // 45° diagonal view - X and Z mixed
      const worldX = (x - centerX) / (10 * scale);
      const worldZ = (y - centerY) / (10 * scale);
      return {
        x: worldX * 0.707 + worldZ * 0.707, // cos(45°) = 0.707
        y: worldX * 0.707 - worldZ * 0.707,
      };
    } else if (viewMode === 'isometric') {
      // Isometric view - 30° rotation
      const worldX = (x - centerX) / (10 * scale);
      const worldZ = (y - centerY) / (10 * scale);
      return {
        x: worldX * 0.866 + worldZ * 0.5, // cos(30°) = 0.866, sin(30°) = 0.5
        y: worldX * 0.5 - worldZ * 0.866,
      };
    } else if (viewMode === 'front') {
      // Front view - Y and Z
      return {
        x: (y - centerY) / (10 * scale), // Y becomes X
        y: -((x - centerX) / (10 * scale)), // X becomes Y
      };
    } else {
      // Top view (default)
      return {
        x: (x - centerX) / (10 * scale),
        y: (y - centerY) / (10 * scale),
      };
    }
  }

  function worldToCanvasXY(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;

    if (viewMode === 'side') {
      return {
        x: centerX + x * 10 * scale,
        y: centerY - y * 10 * scale,
      };
    } else if (viewMode === 'diagonal') {
      // Inverse of diagonal transformation
      const worldX = x * 0.707 + y * 0.707;
      const worldZ = x * 0.707 - y * 0.707;
      return {
        x: centerX + worldX * 10 * scale,
        y: centerY + worldZ * 10 * scale,
      };
    } else if (viewMode === 'isometric') {
      // Inverse of isometric transformation
      const worldX = x * 0.866 + y * 0.5;
      const worldZ = x * 0.5 - y * 0.866;
      return {
        x: centerX + worldX * 10 * scale,
        y: centerY + worldZ * 10 * scale,
      };
    } else if (viewMode === 'front') {
      // Front view inverse
      return {
        x: centerX - y * 10 * scale, // Y becomes X
        y: centerY + x * 10 * scale, // X becomes Y
      };
    } else {
      // Top view (default)
      return {
        x: centerX + x * 10 * scale,
        y: centerY + y * 10 * scale,
      };
    }
  }

  // Izgaraya yapışma fonksiyonu
  function snapToGrid1(x: number, y: number) {
    const gridSize = 20 * scale;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Chain mode'da canvas hareket etmesin - sadece animasyon çalışsın
    if (modes.chainMode && currentTool !== "select") {
      return;
    }

    // Batch mode'u başlat (mouse down)
    if (onStartBatchMode) {
      onStartBatchMode();
    }

    const MIN_BOX_SIZE = 60;
    if (currentTool === "select" && ((selectedElementIds?.length ?? 0) > 0 && currentLayer)) {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const centerX = canvas.width / 2 + offset.x
      const centerY = canvas.height / 2 + offset.y
      const selectedEls = currentLayer.elements.filter(element => selectedElementIds.includes(element.id))
      if (selectedEls.length > 0) {
        const xs = selectedEls.map(element => centerX + element.position.x * 10 * scale)
        const ys = selectedEls.map(element => centerY + element.position.z * 10 * scale)
        let minX = Math.min(...xs)
        let minY = Math.min(...ys)
        let maxX = Math.max(...xs)
        let maxY = Math.max(...ys)
        // En az MIN_BOX_SIZE olacak şekilde kutuyu büyüt
        const boxW = maxX - minX
        const boxH = maxY - minY
        if (boxW < MIN_BOX_SIZE) {
          const pad = (MIN_BOX_SIZE - boxW) / 2
          minX -= pad
          maxX += pad
        }
        if (boxH < MIN_BOX_SIZE) {
          const pad = (MIN_BOX_SIZE - boxH) / 2
          minY -= pad
          maxY += pad
        }
        // Rotate handle hit test (sağ alt köşe)
        const rotateIconX = maxX - ICON_SIZE / 2
        const rotateIconY = maxY - ICON_SIZE / 2
        const distToRotate = Math.sqrt(
          Math.pow(mouseX - (rotateIconX + ICON_SIZE / 2), 2) +
          Math.pow(mouseY - (rotateIconY + ICON_SIZE / 2), 2)
        )
        if (distToRotate < ICON_SIZE / 2 + 4) {
          setIsRotating(true)
          const boxCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
          const startAngle = Math.atan2(mouseY - boxCenter.y, mouseX - boxCenter.x)
          setRotateStart({
            mouseX,
            mouseY,
            boxCenter,
            initialPositions: selectedEls.map(el => ({
              id: el.id,
              x: el.position.x,
              z: el.position.z,
              yOffset: typeof el.yOffset === 'number' ? el.yOffset : (typeof el.position.y === 'number' ? el.position.y : 0)
            })),
            startAngle,
            boxMinX: minX,
            boxMinY: minY,
            boxMaxX: maxX,
            boxMaxY: maxY
          })
          return
        }
      }
    }
    if (!currentLayer) {
      // Show warning when no layer is selected
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'warning',
          title: 'No Layer Selected',
          message: 'To start drawing, please select a layer from the left panel. Each layer can contain different elements and effects.',
          duration: 6000
        }
      });
      window.dispatchEvent(event);
      return;
    }

    if (isRotating) return

    // Show warning when layer is hidden
    if (!currentLayer.visible) {
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'warning',
          title: 'Layer is Hidden',
          message: `The layer "${currentLayer.name}" is currently hidden. Click the eye icon next to the layer name to make it visible.`,
          duration: 5000
        }
      });
      window.dispatchEvent(event);
      return;
    }

    let { x, y } = getCanvasCoordinates(e)
    // Izgaraya yapıştır
    const coords = snapToGrid(x, y)
    x = coords.x
    y = coords.y
    setDragStart({ x, y })
    setDragEnd({ x, y })

    if (currentTool === "select") {
      const canvas = canvasRef.current
      if (!canvas) return
      const centerX = canvas.width / 2 + offset.x
      const centerY = canvas.height / 2 + offset.y

      // Check if clicking on a selected element
      let clickedOnSelected = false
      let clickedOnSelectionBox = false

      if ((selectedElementIds?.length ?? 0) > 0) {
        // Calculate selection box bounds
        const selectedEls = currentLayer.elements.filter(el => selectedElementIds.includes(el.id))
        if (selectedEls.length > 0) {
          const xs = selectedEls.map(el => centerX + el.position.x * 10 * scale)
          const ys = selectedEls.map(el => {
            if (viewMode === 'side') {
              const yVal = typeof el.yOffset === 'number' ? el.yOffset : (typeof el.position.y === 'number' ? el.position.y : 0)
              return centerY - yVal * 10 * scale
            } else {
              return centerY + el.position.z * 10 * scale
            }
          })

          const minX = Math.min(...xs)
          const minY = Math.min(...ys)
          const maxX = Math.max(...xs)
          const maxY = Math.max(...ys)

          // Add padding to selection box for easier clicking
          const padding = 10
          if (x >= minX - padding && x <= maxX + padding && y >= minY - padding && y <= maxY + padding) {
            clickedOnSelectionBox = true
          }

          // Check if clicking on any selected element
          for (const element of selectedEls) {
            let elementX, elementY
            if (viewMode === 'side') {
              elementX = centerX + element.position.x * 10 * scale
              const yVal = typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
              elementY = centerY - yVal * 10 * scale
            } else {
              elementX = centerX + element.position.x * 10 * scale
              elementY = centerY + element.position.z * 10 * scale
            }
            const distance = Math.sqrt(Math.pow(x - elementX, 2) + Math.pow(y - elementY, 2))
            if (distance <= 7 * scale) {
              clickedOnSelected = true
              break
            }
          }
        }
      }

      // If clicking inside selection box but not on an element, start dragging the box
      if (clickedOnSelectionBox && !clickedOnSelected) {
        setDraggingSelection(true)
        setDragOffset({ x, y })
        return
      }



      // Chain mode: Check if clicking on any element to add to chain sequence
      if (modes.chainMode && onChainSequenceChange) {
        // Find clicked element
        let clickedElementId: string | null = null
        for (const element of currentLayer.elements) {
          let elementX, elementY
          if (viewMode === 'side') {
            elementX = centerX + element.position.x * 10 * scale
            const yVal = typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
            elementY = centerY - yVal * 10 * scale
          } else {
            elementX = centerX + element.position.x * 10 * scale
            elementY = centerY + element.position.z * 10 * scale
          }
          const distance = Math.sqrt(Math.pow(x - elementX, 2) + Math.pow(y - elementY, 2))
          if (distance <= 7 * scale) {
            clickedElementId = element.id
            break
          }
        }

        if (clickedElementId) {
          const newSequence = [...chainSequence]
          const existingIndex = newSequence.indexOf(clickedElementId)

          if (existingIndex !== -1) {
            // Element already in sequence, remove it
            newSequence.splice(existingIndex, 1)
          } else {
            // Add element to sequence
            newSequence.push(clickedElementId)
          }

          onChainSequenceChange(newSequence)
          return
        }
      }

      // If not clicking on selection box or selected element, start new selection
      if (!clickedOnSelectionBox && !clickedOnSelected) {
        setSelectionBox({ start: { x, y }, end: { x, y } })
        setSelectedElementIds([])
        setWorkerSelection(null) // Seçim iptalinde workerSelection'ı da temizle
      } else if (clickedOnSelected) {
        // Start dragging selected element
        setDraggingSelection(true)
        setDragOffset({ x, y })
      }
      return
    }

    if (currentTool === "free") {
      setIsDrawing(true)
      const worldPos = canvasToWorld(x, y)
      let element: Element

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        const yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
        element = {
          id: Date.now().toString(),
          type: "free",
          position: worldPos,
          color: settings.color,
          yOffset,
        }
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        const yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
        element = {
          id: Date.now().toString(),
          type: "free",
          position: worldPos,
          color: settings.color,
          yOffset,
        }
      } else {
        // Top, diagonal, isometric views
        element = {
          id: Date.now().toString(),
          type: "free",
          position: worldPos,
          color: settings.color,
          yOffset: settings.yOffset,
        }
      }
      addElementWithRecording(element)
    } else if (currentTool === "circle" || currentTool === "square" || currentTool === "line") {
      setIsDragging(true)
      setDragStart({ x, y })
      setDragEnd({ x, y })
    } else if (currentTool === "eraser") {
      setIsDrawing(true)
      eraseElements(x, y)
    }
  }

  const handleOrbitMove = (e: MouseEvent) => {
    if (!isOrbiting || !orbitLastPos.current) return
    const dx = e.clientX - orbitLastPos.current.x
    const dy = e.clientY - orbitLastPos.current.y

    // Daha yumuşak rotasyon için hassasiyeti azalt
    setRotation(r => ({
      x: r.x + dy * 0.2,
      y: r.y + dx * 0.2,
      z: r.z
    }))

    orbitLastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleOrbitUp = (e: MouseEvent) => {
    setIsOrbiting(false)
    orbitLastPos.current = null
    window.removeEventListener("mousemove", handleOrbitMove)
    window.removeEventListener("mouseup", handleOrbitUp)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Chain mode'da canvas hareket etmesin - sadece animasyon çalışsın
    if (modes.chainMode && currentTool !== "select") {
      return;
    }

    // SCALE HANDLE: Canlı scale işlemi
    if (isScaling && scaleStart && currentLayer && onUpdateLayer) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      // Drag mesafesine göre scaleFactor hesapla
      const startDist = Math.sqrt(
        Math.pow(scaleStart.mouseX - scaleStart.boxCenter.x, 2) +
        Math.pow(scaleStart.mouseY - scaleStart.boxCenter.y, 2)
      );
      const currDist = Math.sqrt(
        Math.pow(mouseX - scaleStart.boxCenter.x, 2) +
        Math.pow(mouseY - scaleStart.boxCenter.y, 2)
      );
      let scaleFactor = currDist / (startDist || 1);
      scaleFactor = Math.max(0.1, Math.min(5, scaleFactor)); // 0.1x - 5x arası sınırla

      // TÜM YÖNLERDE SCALE: X, Y, Z eksenlerinde aynı anda ölçeklendirme
      const centerX = scaleStart.initialPositions.reduce((sum, p) => sum + p.x, 0) / scaleStart.initialPositions.length;
      const centerZ = scaleStart.initialPositions.reduce((sum, p) => sum + p.z, 0) / scaleStart.initialPositions.length;
      const centerY = scaleStart.initialPositions.reduce((sum, p) => sum + p.yOffset, 0) / scaleStart.initialPositions.length;

      const updatedElements = currentLayer.elements.map(el => {
        const found = scaleStart.initialPositions.find(p => p.id === el.id);
        if (!found) return el;
        return {
          ...el,
          position: {
            x: centerX + (found.x - centerX) * scaleFactor,
            z: centerZ + (found.z - centerZ) * scaleFactor,
            y: el.position.y // Y position'ı koruyalım (eğer varsa)
          },
          yOffset: centerY + (found.yOffset - centerY) * scaleFactor
        };
      });
      onUpdateLayer(currentLayer.id, { elements: updatedElements });
      return;
    }

    let { x, y } = getCanvasCoordinates(e);
    setMousePosition({ x, y });

    if (isRotating && rotateStart && currentLayer && onUpdateLayer) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const currAngle = Math.atan2(mouseY - rotateStart.boxCenter.y, mouseX - rotateStart.boxCenter.x);
      const deltaAngle = currAngle - rotateStart.startAngle;

      if (viewMode === 'side') {
        // Side view: Z ekseni etrafında döndürme (X ve Y koordinatlarını değiştir)
        const centerX = rotateStart.initialPositions.reduce((sum, p) => sum + p.x, 0) / rotateStart.initialPositions.length;
        const centerY = rotateStart.initialPositions.reduce((sum, p) => sum + p.yOffset, 0) / rotateStart.initialPositions.length;

        const updatedElements = currentLayer.elements.map(el => {
          const found = rotateStart.initialPositions.find(p => p.id === el.id);
          if (!found) return el;
          // Merkezden vektör (X ve Y düzleminde)
          const dx = found.x - centerX;
          const dy = found.yOffset - centerY;
          // Z ekseni etrafında dönüş
          const cosA = Math.cos(deltaAngle);
          const sinA = Math.sin(deltaAngle);
          return {
            ...el,
            position: {
              ...el.position,
              x: centerX + dx * cosA - dy * sinA
            },
            yOffset: centerY + dx * sinA + dy * cosA
          };
        });
        onUpdateLayer(currentLayer.id, { elements: updatedElements });
      } else {
        // Top view: Y ekseni etrafında döndürme (X ve Z koordinatlarını değiştir) - mevcut davranış
        const centerX = rotateStart.initialPositions.reduce((sum, p) => sum + p.x, 0) / rotateStart.initialPositions.length;
        const centerZ = rotateStart.initialPositions.reduce((sum, p) => sum + p.z, 0) / rotateStart.initialPositions.length;
        const updatedElements = currentLayer.elements.map(el => {
          const found = rotateStart.initialPositions.find(p => p.id === el.id);
          if (!found) return el;
          // Merkezden vektör
          const dx = found.x - centerX;
          const dz = found.z - centerZ;
          // Dönüş
          const cosA = Math.cos(deltaAngle);
          const sinA = Math.sin(deltaAngle);
          return {
            ...el,
            position: {
              x: centerX + dx * cosA - dz * sinA,
              z: centerZ + dx * sinA + dz * cosA
            },
            // yOffset'i koru
            yOffset: found.yOffset
          };
        });
        onUpdateLayer(currentLayer.id, { elements: updatedElements });
      }
      return;
    }

    if (currentTool === "select" && draggingSelection && dragOffset && currentLayer) {
      const dx = (x - dragOffset.x) / (10 * scale)
      const dy = viewMode === 'side'
        ? -(y - dragOffset.y) / (10 * scale)  // Invert Y for side view
        : (y - dragOffset.y) / (10 * scale)

      const updatedElements = currentLayer.elements.map(element => {
        if (!selectedElementIds.includes(element.id)) return element

        // yOffset'i koruyarak güncelle
        const currentYOffset = typeof element.yOffset === 'number' ? element.yOffset : 0

        return {
          ...element,
          position: {
            x: element.position.x + dx,
            z: element.position.z + (viewMode === 'side' ? 0 : dy)
          },
          yOffset: viewMode === 'side'
            ? currentYOffset + dy
            : currentYOffset  // Side view dışında da yOffset'i koru
        }
      })

      if (onUpdateLayer) {
        onUpdateLayer(currentLayer.id, { elements: updatedElements })
      }
      setDragOffset({ x, y })
      return
    }

    if (currentTool === "select" && selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, end: { x, y } } : null)
      return
    }

    if (isDrawing && currentTool === "free" && currentLayer) {
      // Izgaraya yapıştır
      const coords = snapToGrid(x, y)
      x = coords.x
      y = coords.y

      const worldPos = canvasToWorld(x, y)
      let element: Element

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        const yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
        element = {
          id: Date.now().toString(),
          type: "free",
          position: worldPos,
          color: settings.color,
          yOffset,
        }
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        const yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
        element = {
          id: Date.now().toString(),
          type: "free",
          position: worldPos,
          color: settings.color,
          yOffset,
        }
      } else {
        // Top, diagonal, isometric views
        element = {
          id: Date.now().toString(),
          type: "free",
          position: worldPos,
          color: settings.color,
          yOffset: settings.yOffset,
        }
      }
      addElementWithRecording(element)
    } else if (isDragging && (currentTool === "circle" || currentTool === "square" || currentTool === "line")) {
      setDragEnd({ x, y })
    } else if (isDrawing && currentTool === "eraser") {
      eraseElements(x, y)
    }
  }

  const handleMouseUp = () => {
    // Chain mode'da canvas hareket etmesin - sadece animasyon çalışsın
    if (modes.chainMode && currentTool !== "select") {
      return;
    }

    if (currentTool === "select") {
      if (selectionBox && currentLayer) {
        const canvas = canvasRef.current
        if (!canvas) return
        const centerX = canvas.width / 2 + offset.x
        const centerY = canvas.height / 2 + offset.y
        const x1 = Math.min(selectionBox.start.x, selectionBox.end.x)
        const y1 = Math.min(selectionBox.start.y, selectionBox.end.y)
        const x2 = Math.max(selectionBox.start.x, selectionBox.end.x)
        const y2 = Math.max(selectionBox.start.y, selectionBox.end.y)

        // Free draw'lar da dahil tüm elementler seçilebilsin
        let selected: string[] = [];
        if (viewMode === 'side') {
          selected = currentLayer.elements.filter(element => {
            const ex = centerX + element.position.x * 10 * scale;
            const yVal = typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0);
            const ey = centerY - yVal * 10 * scale;
            return ex >= x1 && ex <= x2 && ey >= y1 && ey <= y2;
          }).map(element => element.id);
        } else {
          selected = currentLayer.elements.filter(element => {
            const ex = centerX + element.position.x * 10 * scale;
            const ez = centerY + element.position.z * 10 * scale;
            return ex >= x1 && ex <= x2 && ez >= y1 && ez <= y2;
          }).map(element => element.id);
        }
        setSelectedElementIds(selected)
        setSelectionBox(null)
        if (selected.length === 0) {
          setWorkerSelection(null) // Seçim kutusu boşsa workerSelection'ı da temizle
        }
      }

      if (draggingSelection) {
        setDraggingSelection(false)
        setDragOffset(null)
      }
      return
    }

    if (isDragging && (currentTool === "circle" || currentTool === "square" || currentTool === "line")) {
      if (currentTool === "circle") {
        const start = dragStart
        const end = dragEnd
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        createCircle(start.x, start.y, radius)
      } else if (currentTool === "square") {
        const start = dragStart
        const end = dragEnd
        const size = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        createSquare(start.x, start.y, size)
      } else if (currentTool === "line") {
        createLine(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y)
      }
    }
    setIsDrawing(false)
    setIsDragging(false)

    // Batch mode'u bitir ve history'yi ekle
    if (onEndBatchMode) {
      onEndBatchMode();
    }
  }

  // ✅ CIRCLE CREATION - MULTIPLE ELEMENTS
  const createCircle = (centerX: number, centerY: number, radius: number) => {
    // Izgaraya yapıştır
    const { x: snapCenterX, y: snapCenterY } = snapToGrid(centerX, centerY)
    const count = settings.particleCount || 10
    const elements: Element[] = []
    const groupId = `circle-group-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    // World merkezini hesapla (ilk noktanın world pozisyonu ile aynı mantık)
    const worldCenter = canvasToWorld(snapCenterX, snapCenterY);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI
      const x = snapCenterX + Math.cos(angle) * radius
      const y = snapCenterY + Math.sin(angle) * radius

      const worldPos = canvasToWorld(x, y)
      let yOffset: number

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
      } else {
        // Top, diagonal, isometric views
        yOffset = settings.yOffset
      }

      elements.push({
        id: `circle-${Date.now()}-${i}`,
        type: "circle",
        position: worldPos,
        color: settings.color,
        yOffset,
        groupId,
        meta: {
          center: { x: snapCenterX, y: snapCenterY },
          worldCenter,
          radius,
          count,
        },
      })
    }
    addElementWithRecording(elements)
    if (onShapeCreated) onShapeCreated("circle");
  }

  // ✅ SQUARE CREATION - MULTIPLE ELEMENTS
  const createSquare = (centerX: number, centerY: number, size: number) => {
    // Izgaraya yapıştır
    const { x: snapCenterX, y: snapCenterY } = snapToGrid(centerX, centerY)
    const count = settings.particleCount || 10
    const perSide = Math.ceil(count / 4)
    const elements: Element[] = []
    const groupId = `square-group-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    // Top edge
    for (let i = 0; i < perSide && elements.length < count; i++) {
      const x = snapCenterX - size + (i / Math.max(1, perSide - 1)) * (size * 2)
      const y = snapCenterY - size
      const worldPos = canvasToWorld(x, y)
      let yOffset: number

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
      } else {
        // Top, diagonal, isometric views
        yOffset = settings.yOffset
      }

      elements.push({
        id: `square-${Date.now()}-top-${i}`,
        type: "square",
        position: worldPos,
        color: settings.color,
        yOffset,
        groupId,
      })
    }

    // Right edge
    for (let i = 1; i < perSide && elements.length < count; i++) {
      const x = snapCenterX + size
      const y = snapCenterY - size + (i / Math.max(1, perSide - 1)) * (size * 2)
      const worldPos = canvasToWorld(x, y)
      let yOffset: number

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
      } else {
        // Top, diagonal, isometric views
        yOffset = settings.yOffset
      }

      elements.push({
        id: `square-${Date.now()}-right-${i}`,
        type: "square",
        position: worldPos,
        color: settings.color,
        yOffset,
        groupId,
      })
    }

    // Bottom edge
    for (let i = 1; i < perSide && elements.length < count; i++) {
      const x = snapCenterX + size - (i / Math.max(1, perSide - 1)) * (size * 2)
      const y = snapCenterY + size
      const worldPos = canvasToWorld(x, y)
      let yOffset: number

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
      } else {
        // Top, diagonal, isometric views
        yOffset = settings.yOffset
      }

      elements.push({
        id: `square-${Date.now()}-bottom-${i}`,
        type: "square",
        position: worldPos,
        color: settings.color,
        yOffset,
        groupId,
      })
    }

    // Left edge
    for (let i = 1; i < perSide - 1 && elements.length < count; i++) {
      const x = snapCenterX - size
      const y = snapCenterY + size - (i / Math.max(1, perSide - 1)) * (size * 2)
      const worldPos = canvasToWorld(x, y)
      let yOffset: number

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
      } else {
        // Top, diagonal, isometric views
        yOffset = settings.yOffset
      }

      elements.push({
        id: `square-${Date.now()}-left-${i}`,
        type: "square",
        position: worldPos,
        color: settings.color,
        yOffset,
        groupId,
      })
    }
    addElementWithRecording(elements)
    if (onShapeCreated) onShapeCreated("square");
  }

  // ✅ LINE CREATION - MULTIPLE ELEMENTS
  const createLine = (startX: number, startY: number, endX: number, endY: number) => {
    // Izgaraya yapıştır
    const { x: snapStartX, y: snapStartY } = snapToGrid(startX, startY)
    const { x: snapEndX, y: snapEndY } = snapToGrid(endX, endY)
    const count = settings.particleCount || 10
    const elements: Element[] = []
    const groupId = `line-group-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0
      const x = snapStartX + (snapEndX - snapStartX) * t
      const y = snapStartY + (snapEndY - snapStartY) * t

      const worldPos = canvasToWorld(x, y)
      let yOffset: number

      if (viewMode === 'side') {
        // Side view: yOffset hesaplama
        yOffset = -((y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
      } else if (viewMode === 'front') {
        // Front view: yOffset hesaplama
        yOffset = (x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
      } else {
        // Top, diagonal, isometric views
        yOffset = settings.yOffset
      }

      elements.push({
        id: `line-${Date.now()}-${i}`,
        type: "line",
        position: worldPos,
        color: settings.color,
        yOffset,
        groupId,
      })
    }
    addElementWithRecording(elements)
    if (onShapeCreated) onShapeCreated("line");
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.preventDefault()
    e.nativeEvent.stopPropagation()

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)))
  }

  // 2. 3D projeksiyon fonksiyonu
  function project3DTo2D(x: number, y: number, z: number) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    // Apply rotation
    const radX = (rotation.x * Math.PI) / 180
    const radY = (rotation.y * Math.PI) / 180

    // Rotate around X axis
    const y1 = y * Math.cos(radX) - z * Math.sin(radX)
    const z1 = y * Math.sin(radX) + z * Math.cos(radX)

    // Rotate around Y axis
    const x1 = x * Math.cos(radY) + z1 * Math.sin(radY)
    const z2 = -x * Math.sin(radY) + z1 * Math.cos(radY)

    // Apply perspective
    const fov = 1000
    const scale = fov / (fov + z2)

    // Project to 2D
    const screenX = x1 * scale
    const screenY = y1 * scale

    // Apply canvas offset and scale
    const centerX = canvas.width / 2 + offset.x
    const centerY = canvas.height / 2 + offset.y

    return {
      x: centerX + screenX * scale,
      y: centerY + screenY * scale
    }
  }

  // 5. 3D çizgi ve kutu fonksiyonları
  type Position3D = { x: number, y?: number, z: number }
  function create3DLine(start: Position3D, end: Position3D) {
    const elements: Element[] = []
    const count = settings.particleCount || 10
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      elements.push({
        id: `line-${Date.now()}-${i}`,
        type: "line",
        position: {
          x: start.x + (end.x - start.x) * t,
          y: (start.y ?? 0) + ((end.y ?? 0) - (start.y ?? 0)) * t,
          z: start.z + (end.z - start.z) * t
        },
        color: settings.color,
        yOffset: settings.yOffset
      })
    }
    addElementWithRecording(elements)
  }
  function create3DBox(center: Position3D, size: number) {
    const s = size
    const cy = center.y ?? 0
    const vertices = [
      { x: center.x - s, y: cy - s, z: center.z - s },
      { x: center.x + s, y: cy - s, z: center.z - s },
      { x: center.x + s, y: cy + s, z: center.z - s },
      { x: center.x - s, y: cy + s, z: center.z - s },
      { x: center.x - s, y: cy - s, z: center.z + s },
      { x: center.x + s, y: cy - s, z: center.z + s },
      { x: center.x + s, y: cy + s, z: center.z + s },
      { x: center.x - s, y: cy + s, z: center.z + s }
    ]
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ]
    edges.forEach(edge => {
      create3DLine(vertices[edge[0]], vertices[edge[1]])
    })
  }

  // 6. 3D rotasyon için butonlar ve klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q') setRotation(r => ({ ...r, x: r.x + 5 }))
      if (e.key === 'a') setRotation(r => ({ ...r, x: r.x - 5 }))
      if (e.key === 'w') setRotation(r => ({ ...r, y: r.y + 5 }))
      if (e.key === 's') setRotation(r => ({ ...r, y: r.y - 5 }))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Global mouse up handler
  useEffect(() => {
    function handleGlobalMouseUp() {
      if (currentTool === "select") {
        if (selectionBox && currentLayer) {
          const canvas = canvasRef.current
          if (!canvas) return
          const centerX = canvas.width / 2 + offset.x
          const centerY = canvas.height / 2 + offset.y
          const x1 = Math.min(selectionBox.start.x, selectionBox.end.x)
          const y1 = Math.min(selectionBox.start.y, selectionBox.end.y)
          const x2 = Math.max(selectionBox.start.x, selectionBox.end.x)
          const y2 = Math.max(selectionBox.start.y, selectionBox.end.y)

          let selected: string[] = []
          if (viewMode === 'side') {
            selected = currentLayer.elements.filter(element => {
              const ex = centerX + element.position.x * 10 * scale
              const yVal = typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
              const ey = centerY - yVal * 10 * scale
              return ex >= x1 && ex <= x2 && ey >= y1 && ey <= y2
            }).map(element => element.id)
          } else {
            selected = currentLayer.elements.filter(element => {
              const ex = centerX + element.position.x * 10 * scale
              const ez = centerY + element.position.z * 10 * scale
              return ex >= x1 && ex <= x2 && ez >= y1 && ez <= y2
            }).map(element => element.id)
          }
          setSelectedElementIds(selected)
        }
        setSelectionBox(null)
        setDraggingSelection(false)
        setDragOffset(null)
      }
      setIsDrawing(false)
      setIsDragging(false)
      if (isRotating || rotateStart) {
        setIsRotating(false)
        setRotateStart(null)
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [currentTool, selectionBox, currentLayer, viewMode, scale, offset, isRotating, rotateStart])

  // Izgaraya yapışma fonksiyonu (mod ve sıklık ayarlı)
  function snapToGrid(x: number, y: number) {
    if (!settings.snapToGridMode) return { x, y };
    const gridSize = (settings.gridSize || 20) * scale;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }

  useEffect(() => {
    function handleGlobalMouseUp() {
      if (isScaling) {
        setIsScaling(false)
        setScaleStart(null)
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isScaling])

  // Selection box koordinatlarını hesapla
  function getSelectionBoxBounds() {
    if (!currentLayer || !selectedElementIds || selectedElementIds.length === 0) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;
    const selectedEls = currentLayer.elements.filter(element => selectedElementIds.includes(element.id));
    if (selectedEls.length === 0) return null;
    const xs = selectedEls.map(element => centerX + element.position.x * 10 * scale);
    const ys = selectedEls.map(element => {
      if (viewMode === 'side') {
        const yVal = typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0);
        return centerY - yVal * 10 * scale;
      } else {
        return centerY + element.position.z * 10 * scale;
      }
    });
    let minX = Math.min(...xs);
    let minY = Math.min(...ys);
    let maxX = Math.max(...xs);
    let maxY = Math.max(...ys);
    // Padding ekle
    const BOX_PADDING = 20;
    minX -= BOX_PADDING;
    minY -= BOX_PADDING;
    maxX += BOX_PADDING;
    maxY += BOX_PADDING;
    return { minX, minY, maxX, maxY };
  }
  const selectionBounds = getSelectionBoxBounds();

  // Overlay butonları için event handler'ları
  const handleDeleteClick = () => {
    if (!currentLayer || !onUpdateLayer) return;
    const newElements = currentLayer.elements.filter(element => !selectedElementIds.includes(element.id));
    onUpdateLayer(currentLayer.id, { elements: newElements });
    setSelectedElementIds([]);
    setWorkerSelection(null); // Seçim silindiğinde workerSelection'ı da temizle
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentLayer || selectedElementIds.length === 0) return;

    const bounds = getSelectionBoxBounds();
    if (!bounds) return;

    setIsRotating(true);
    const boxCenter = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
    const selectedEls = currentLayer.elements.filter(element => selectedElementIds.includes(element.id));
    const startAngle = Math.atan2(e.clientY - boxCenter.y, e.clientX - boxCenter.x);

    setRotateStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxCenter,
      initialPositions: selectedEls.map(el => ({
        id: el.id,
        x: el.position.x,
        z: el.position.z,
        yOffset: typeof el.yOffset === 'number' ? el.yOffset : 0
      })),
      startAngle,
      boxMinX: bounds.minX,
      boxMinY: bounds.minY,
      boxMaxX: bounds.maxX,
      boxMaxY: bounds.maxY
    });
  };

  const handleScaleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentLayer || selectedElementIds.length === 0) return;

    const bounds = getSelectionBoxBounds();
    if (!bounds) return;

    setIsScaling(true);
    const boxCenter = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
    const selectedEls = currentLayer.elements.filter(element => selectedElementIds.includes(element.id));

    setScaleStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxCenter,
      initialPositions: selectedEls.map(el => ({
        id: el.id,
        x: el.position.x,
        z: el.position.z,
        yOffset: typeof el.yOffset === 'number' ? el.yOffset : 0
      })),
      boxMinX: bounds.minX,
      boxMinY: bounds.minY,
      boxMaxX: bounds.maxX,
      boxMaxY: bounds.maxY
    });
  };

  // --- yardımcı fonksiyon: bir noktayı merkez etrafında döndür ---
  function rotatePoint(x: number, y: number, cx: number, cy: number, angleRad: number) {
    const dx = x - cx;
    const dy = y - cy;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  }

  // --- döndürülmüş selection box köşeleri ---
  function getRotatedBoxCorners(bounds: { minX: number, minY: number, maxX: number, maxY: number }, center: { x: number, y: number }, angleRad: number) {
    return [
      rotatePoint(bounds.minX, bounds.minY, center.x, center.y, angleRad), // sol üst
      rotatePoint(bounds.maxX, bounds.minY, center.x, center.y, angleRad), // sağ üst
      rotatePoint(bounds.maxX, bounds.maxY, center.x, center.y, angleRad), // sağ alt
      rotatePoint(bounds.minX, bounds.maxY, center.x, center.y, angleRad), // sol alt
    ];
  }

  // --- döndürme açısı ---
  const rotating = isRotating && rotateStart;
  const rotateAngle = rotating && rotateStart ? (() => {
    if (!mousePosition) return 0;
    const currAngle = Math.atan2(mousePosition.y - rotateStart.boxCenter.y, mousePosition.x - rotateStart.boxCenter.x);
    return currAngle - rotateStart.startAngle;
  })() : 0;

  // --- döndürülmüş kutu köşeleri ---
  const rotatedBox = (rotating && rotateStart)
    ? getRotatedBoxCorners(
      { minX: rotateStart.boxMinX, minY: rotateStart.boxMinY, maxX: rotateStart.boxMaxX, maxY: rotateStart.boxMaxY },
      rotateStart.boxCenter,
      rotateAngle
    )
    : null;

  // --- canvas'ta kutuyu döndürülmüş çiz ---
  // useEffect içindeki kutu çizimini güncelle:
  // if (rotatedBox) { ctx.beginPath(); ctx.moveTo(...); ... ctx.closePath(); ctx.stroke(); } else { ...eski rect çizimi... }

  // Worker message handler
  useEffect(() => {
    if (!selectionWorker) return;
    const handler = (e: MessageEvent) => {
      setWorkerSelection(e.data);
    };
    selectionWorker.addEventListener('message', handler);
    return () => selectionWorker.removeEventListener('message', handler);
  }, []);

  // Offload selection calculation to worker
  useEffect(() => {
    if (
      !selectionWorker ||
      !selectionBox ||
      !currentLayer ||
      !canvasRef.current ||
      !canvasRef.current.width ||
      !canvasRef.current.height ||
      canvasRef.current.width === 0 ||
      canvasRef.current.height === 0
    ) return;
    const elements = currentLayer.elements.map(el => ({
      id: el.id,
      x: el.position.x,
      y: el.position.y,
      z: el.position.z,
      yOffset: el.yOffset,
    }));
    selectionWorker.postMessage({
      elements,
      selectionBox,
      viewMode,
      offset,
      scale,
      canvasWidth: canvasRef.current.width,
      canvasHeight: canvasRef.current.height,
    });
  }, [
    selectionBox,
    currentLayer,
    viewMode,
    offset,
    scale,
    canvasRef.current?.width,
    canvasRef.current?.height
  ]);

  // Use worker result for selection (optional: fallback to old logic if workerSelection is null)
  const selectedElementIdsOptimized = workerSelection?.selectedIds || selectedElementIds;
  const selectionBoundsOptimized = workerSelection
    ? { minX: workerSelection.minX, minY: workerSelection.minY, maxX: workerSelection.maxX, maxY: workerSelection.maxY }
    : selectionBounds;

  // Wheel event'i için özel useEffect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)))
    }

    canvas.addEventListener('wheel', handleWheelEvent, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheelEvent)
    }
  }, [])

  return (
    <div className="canvas-area relative w-full h-full bg-black overflow-hidden">

      <canvas
        ref={canvasRef}
        className={`w-full h-full ${currentTool === "eraser"
          ? "cursor-none"
          : "cursor-default"
          }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setMousePosition(null);
        }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
        <AxisWidget viewMode={viewMode} setViewMode={setViewMode} />
      </div>
      {/* 2D Zoom Buttons - sol alt köşe - Tüm view modlarında çalışır */}
      <div className="absolute bottom-8 left-4 z-30 flex flex-col gap-2">
        <button
          onClick={() => setScale(s => Math.min(5, s * 1.15))}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#000] border border-zinc-800 text-white text-2xl font-bold transition active:scale-95 focus:outline-none hover:border-indigo-500 hover:text-indigo-400"
          title="Zoom In"
          style={{ userSelect: 'none' }}
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.2, s / 1.15))}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#000] border border-zinc-800 text-white text-2xl font-bold transition active:scale-95 focus:outline-none hover:border-indigo-500 hover:text-indigo-400"
          title="Zoom Out"
          style={{ userSelect: 'none' }}
        >
          –
        </button>
      </div>

      {/* Tool indicator & Clear Layer - sol üst */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTool}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="bg-[#000] border border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-none"
            style={{ minWidth: 120 }}
          >
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold tracking-wide transition-colors duration-200 ${currentTool === "free" ? "bg-indigo-500/80 text-white" :
              currentTool === "select" ? "bg-green-500/80 text-white" :
                currentTool === "eraser" ? "bg-red-500/80 text-white" :
                  "bg-zinc-900 text-zinc-200"
              }`}>
              {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}
            </span>
            <span className="text-zinc-300 text-[11px] font-bold">
              {currentTool === "circle" || currentTool === "square" || currentTool === "line"
                ? `Drag to create (${settings.particleCount || 10} particles)`
                : currentTool === "free"
                  ? "Freehand drawing"
                  : currentTool === "eraser"
                    ? "Erase elements"
                    : currentTool === "select"
                      ? "Select & move"
                      : ""}
            </span>
          </motion.div>
        </AnimatePresence>
        {/* Tool Buttons */}
        <div className="flex items-center gap-1 ml-2">
          {[
            { key: 'free', icon: <Pencil className="w-5 h-5" />, label: 'Free' },
            { key: 'select', icon: <MousePointerClick className="w-5 h-5" />, label: 'Select' },
            { key: 'eraser', icon: <Eraser className="w-5 h-5" />, label: 'Eraser' },
            { key: 'circle', icon: <Circle className="w-5 h-5" />, label: 'Circle' },
            { key: 'square', icon: <Square className="w-5 h-5" />, label: 'Square' },
            { key: 'line', icon: <Slash className="w-5 h-5" />, label: 'Line' }
          ].map(tool => (
            <button
              key={tool.key}
              onClick={() => setCurrentTool(tool.key as Tool)}
              className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-150 ${currentTool === tool.key ? 'bg-[#000000] text-white border-indigo-500 scale-105' : 'bg-[#000000] text-zinc-300 border-zinc-800 hover:border-indigo-500 hover:text-white'}`}
              title={tool.label}
              type="button"
            >
              {tool.icon}
            </button>
          ))}
        </div>
        {/* Quick Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className="flex items-center gap-2 bg-[#000] border border-zinc-800 hover:border-indigo-500 hover:text-indigo-400 text-white px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 focus:outline-none shadow-none"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Settings</span>
          </button>

          <AnimatePresence>
            {showQuickSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 left-0 bg-black border border-zinc-700 rounded-xl p-4 shadow-xl z-50 min-w-[280px]"
                onMouseLeave={() => setShowQuickSettings(false)}
              >
                <div className="space-y-3">
                  {/* Particle Count */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3 h-3 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-300">Particle Count</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => settings.particleCount > 1 && onSettingsChange?.({ ...settings, particleCount: settings.particleCount - 1 })}
                          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded text-zinc-300 hover:text-white transition-all text-xs font-bold flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-xs font-mono text-white min-w-[24px] text-center">{settings.particleCount || 10}</span>
                        <button
                          onClick={() => onSettingsChange?.({ ...settings, particleCount: (settings.particleCount || 10) + 1 })}
                          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded text-zinc-300 hover:text-white transition-all text-xs font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Slider */}
                    <div className="px-1">
                      <Slider
                        value={[settings.particleCount || 10]}
                        onValueChange={([value]) => onSettingsChange?.({ ...settings, particleCount: value })}
                        min={1}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>1</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-300">Color</span>
                    </div>
                    <ColorPicker
                      value={settings.color || "#ffffff"}
                      onChange={(color) => onSettingsChange?.({ ...settings, color })}
                      className="w-auto"
                      showAlpha={false}
                    />
                  </div>

                  {/* Particle Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">Particle</span>
                    <button
                      onClick={() => setShowParticleModal(true)}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white text-xs rounded px-2 py-1 transition-all focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {settings.particle || "reddust"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onClearCanvas}
          className="flex items-center gap-2 bg-[#000] border border-zinc-800 hover:border-red-500 hover:text-red-400 text-white px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 focus:outline-none shadow-none"
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2' /></svg>
          <span className="hidden sm:inline">Clear Layer</span>
        </button>

        {/* REC Button - Chain Mode Recording */}
        {modes.chainMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              if (isRecording) {
                // Stop recording
                setIsRecording(false)
                setLastElementTime(null)
              } else {
                // Start recording
                setIsRecording(true)
                setLastElementTime(null) // Reset timer
                // Clear existing chain items when starting new recording
                if (chainItems) {
                  // Reset chain items
                  const event = new CustomEvent('resetChainItems')
                  window.dispatchEvent(event)
                }
              }
            }}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold 
              transition-all duration-200 active:scale-95 focus:outline-none shadow-none
              ${isRecording
                ? 'bg-red-600 border border-red-500 text-white hover:bg-red-700'
                : 'bg-[#000] border border-zinc-800 hover:border-blue-500 hover:text-blue-400 text-white'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? (
              <>
                <motion.div
                  className="w-3 h-3 bg-white rounded-sm"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="hidden sm:inline">STOP REC</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="hidden sm:inline">START REC</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Sidebar toggle butonu - sol, zoom butonlarının üstünde */}
      <div className="absolute left-4 flex flex-col items-center z-30" style={{ top: 'calc(50% - 25px)' }}>
        <button
          onClick={toggleSidebar}
          className="w-11 h-11 mb-3 flex items-center justify-center rounded-full bg-[#000] border border-zinc-800 text-white transition active:scale-95 focus:outline-none hover:border-indigo-500 hover:text-indigo-400"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* --- Modern overlay kutusu ve butonlar (her renderda güncel) --- */}
      {selectionBounds && selectedElementIds.length > 0 && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: selectionBounds.minX,
            top: selectionBounds.minY,
            width: selectionBounds.maxX - selectionBounds.minX,
            height: selectionBounds.maxY - selectionBounds.minY,
            pointerEvents: 'none',
          }}
        >
          {/* Modern overlay kutusu */}
          <div className="
            absolute inset-0
            border-2 border-white
            rounded-xl
            bg-black/30
            shadow-[0_0_24px_0_rgba(255,255,255,0.10)]
            transition-all
            pointer-events-none
          " />

          {/* Sil butonu (sağ üst) */}
          <button
            className="
              absolute right-[-22px] top-[-22px]
              w-10 h-10
              bg-[#000] border-2 border-white
              rounded-full flex items-center justify-center
              shadow-lg hover:scale-110 hover:shadow-white/40
              transition pointer-events-auto
              backdrop-blur
            "
            onClick={handleDeleteClick}
            style={{ pointerEvents: 'auto' }}
            title="Seçiliyi Sil"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
          {/* Döndürme butonu (sağ alt) - Side view'de farklı davranış */}
          <button
            className="
              absolute right-[-22px] bottom-[-22px]
              w-10 h-10
              bg-[#000] border-2 border-white
              rounded-full flex items-center justify-center
              shadow-lg hover:scale-110 hover:shadow-white/40
              transition pointer-events-auto
              backdrop-blur
            "
            onMouseDown={handleRotateMouseDown}
            style={{ pointerEvents: 'auto' }}
            title={viewMode === 'side' ? "Döndür (Z ekseni)" : "Döndür"}
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
          {/* Ölçekleme butonu (sol alt) - Side view'de X ve Y (yOffset) ölçeklendirmesi */}
          <button
            className="
              absolute left-[-22px] bottom-[-22px]
              w-10 h-10
              bg-[#000] border-2 border-white
              rounded-full flex items-center justify-center
              shadow-lg hover:scale-110 hover:shadow-white/40
              transition pointer-events-auto
              backdrop-blur
            "
            onMouseDown={handleScaleMouseDown}
            style={{ pointerEvents: 'auto' }}
            title="Ölçekle (Tüm yönlerde)"
          >
            <MoveDiagonal className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Particle Selection Modal */}
      {showParticleModal && (
        <ParticleSelectModal
          currentParticle={settings.particle || "reddust"}
          onSelectParticle={(particle) => {
            onSettingsChange?.({ ...settings, particle })
            setShowParticleModal(false)
          }}
          onClose={() => setShowParticleModal(false)}
        />
      )}
    </div>
  );
});

export { Canvas };
