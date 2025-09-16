"use client"

import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState, useMemo, useLayoutEffect } from "react"
import type { Element, Layer, Tool } from "@/types"
import { Trash2, Settings, Palette, Hash, Grid3X3, Zap } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import { Slider } from "@/components/ui/slider"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { AxisWidget } from "./axis-widget"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCw, MoveDiagonal, ChevronLeft, ChevronRight } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Pencil, MousePointerClick, Eraser, Circle, Square, Slash, Triangle } from "lucide-react"
import { useActionRecordingStore } from "@/store/useActionRecordingStore"

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
  optimize?: boolean;
  showGridCoordinates?: boolean;
  onToggleGridCoordinates?: () => void;
  updateSelectedElementsParticle?: (particle: string) => void;
  onElementCountChange?: (count: number, groupId: string) => void;
}

// Web Workers for optimization
let selectionWorker: Worker | null = null;
// let chainAnimationWorker: Worker | null = null;

if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
  // @ts-ignore
  selectionWorker = new Worker(new URL('../worker/selectionWorker.ts', import.meta.url), { type: 'module' });
  // @ts-ignore
  // chainAnimationWorker = new Worker(new URL('../worker/chainAnimationWorker.ts', import.meta.url), { type: 'module' });
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(
  { currentTool, setCurrentTool, layers, currentLayerId, settings, onSettingsChange, modes, onAddElement, onClearCanvas, onUpdateLayer, selectedElementIds, setSelectedElementIds, performanceMode = false, onShapeCreated, onStartBatchMode, onEndBatchMode, chainSequence = [], onChainSequenceChange, chainItems = [], optimize = false, showGridCoordinates = true, onToggleGridCoordinates, updateSelectedElementsParticle, onElementCountChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)
  
  // Action Recording Store
  const { 
    recordRotate, 
    recordScale, 
    recordMove, 
    recordColorChange, 
    recordParticleCountChange,
    recordSelect,
    recordMoveContinuous,
    recordSelectSingle,
    recordSelectBox,
    recordSelectClear,
    recordTransformUpdate,
    recordTransformEnd,
    recordIdle,
    recordElementAdd,
    calculateDelayTicks,
    addElementDelay
  } = useActionRecordingStore()

  // Helper: Determine current particle count for selected shape/group
  const getCurrentParticleCount = () => {
    if (selectedElementIds.length > 0) {
      const currentLayer = layers.find(layer => layer.id === currentLayerId)
      if (currentLayer) {
        const selectedElement = currentLayer.elements.find(el => selectedElementIds.includes(el.id))
        if (selectedElement && selectedElement.groupId) {
          // Daha güvenilir: grup boyutunu say
          const groupCount = currentLayer.elements.filter(el => el.groupId === selectedElement.groupId).length
          if (groupCount > 0) return groupCount
        }
      }
    }
    return settings.particleCount || 10
  }

  // Helper: Determine current shape type if any
  const getCurrentShapeType = (): "circle" | "square" | "line" | null => {
    if (selectedElementIds.length > 0) {
      const currentLayer = layers.find(layer => layer.id === currentLayerId)
      if (currentLayer) {
        const el = currentLayer.elements.find(e => selectedElementIds.includes(e.id))
        if (el && (el.type === "circle" || el.type === "square" || el.type === "line")) return el.type
      }
    }
    return null
  }

  const getCurrentMinCount = () => {
    const type = getCurrentShapeType()
    if (type === "circle") return 3
    if (type === "square") return 8
    if (type === "line") return 2
    return 1
  }

  const [isDrawing, setIsDrawing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [lastElementTime, setLastElementTime] = useState<number | null>(null)
  const [lastMoveRecordTime, setLastMoveRecordTime] = useState<number | null>(null)
  const [lastRotateRecordTime, setLastRotateRecordTime] = useState<number | null>(null)
  const [lastScaleRecordTime, setLastScaleRecordTime] = useState<number | null>(null)
  const [lastIdleRecordTime, setLastIdleRecordTime] = useState<number | null>(null)
  const [animationTick, setAnimationTick] = useState(0)
  const [lastActionTime, setLastActionTime] = useState<number | null>(null)
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null)
  // const [chainAnimationData, setChainAnimationData] = useState<any[]>([])

  // Recording wrapper for onAddElement
  const addElementWithRecording = (element: Element | Element[]) => {
    const elements = Array.isArray(element) ? element : [element]
    
    // Mirror mode aktifse simetrik elementleri de ekle
    if (settings.mirrorMode) {
      const mirroredElements = elements.map(el => {
        const mirroredElement = { ...el }
        mirroredElement.id = Date.now().toString() + '_mirror'
        
        // View mode'a göre simetri uygula
        if (viewMode === 'side') {
          // Side view: X ekseni etrafında simetri
          mirroredElement.position = {
            ...el.position,
            x: -el.position.x
          }
        } else if (viewMode === 'front') {
          // Front view: Z ekseni etrafında simetri
          mirroredElement.position = {
            ...el.position,
            z: -el.position.z
          }
        } else {
          // Top view: X ekseni etrafında simetri
          mirroredElement.position = {
            ...el.position,
            x: -el.position.x
          }
        }
        
        return mirroredElement
      })
      
      // Hem orijinal hem de simetrik elementleri ekle
      onAddElement([...elements, ...mirroredElements])
    } else {
      onAddElement(element)
    }

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

    // Action Recording: Yeni element eklendiğinde kaydet
    if (modes.actionRecordingMode) {
      const currentTime = Date.now()
      const delayTicks = addElementDelay ? calculateDelayTicks(currentTime) : 0
      
      // Her yeni element için action record oluştur
      elements.forEach(element => {
        // Eğer element zaten mevcutsa action kaydetme (recording başlarken tekrar eklenen elementler için)
        const currentLayer = layers.find(layer => layer.id === currentLayerId)
        const existingElement = currentLayer?.elements.find(el => el.id === element.id)
        if (existingElement) {
          return // Bu element zaten mevcut, action kaydetme
        }
        // recordElementAdd fonksiyonunu kullan (son pozisyonları da günceller)
        recordElementAdd(
          element.id,
          element.type,
          element.position,
          element.yOffset || 0,
          element.color || '#ffffff',
          element.elementCount || 1
        )
      })
    }
  }

  // Idle action'ları otomatik kaydetmek için
  useEffect(() => {
    if (!modes.actionRecordingMode || !currentLayerId) return

    const checkForIdle = () => {
      const currentTime = Date.now()
      const lastAction = useActionRecordingStore.getState().lastActionTime
      
      // Son action'dan 50ms geçtiyse sürekli idle action kaydet
      if (lastAction && currentTime - lastAction > 300) {
        // Idle action'ları için throttle (1ms) - çok sık
        if (!lastIdleRecordTime || currentTime - lastIdleRecordTime > 1) {
          const currentLayer = layers.find(layer => layer.id === currentLayerId)
          if (currentLayer) {
            const allElementIds = currentLayer.elements.map(el => el.id)
            if (allElementIds.length > 0) {
              recordIdle(allElementIds, 1) // 1ms idle duration - çok sık
              setLastIdleRecordTime(currentTime)
            }
          }
        }
      }
    }

    // Her 1ms'de bir kontrol et ve idle action kaydet - çok sık
    const interval = setInterval(checkForIdle, 1)
    
    return () => clearInterval(interval)
  }, [modes.actionRecordingMode, currentLayerId, layers, recordIdle, lastIdleRecordTime])

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
  const [rotateStart, setRotateStart] = useState<{ mouseX: number, mouseY: number, boxCenter: { x: number, y: number }, initialPositions: { id: string, x: number, z: number, yOffset: number }[], startAngle: number, startRadius: number, boxMinX: number, boxMinY: number, boxMaxX: number, boxMaxY: number } | null>(null)
  const [rotateBox, setRotateBox] = useState<{ cx: number, cy: number, minX: number, minY: number, maxX: number, maxY: number } | null>(null)
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [viewMode, setViewMode] = useState<'top' | 'side' | 'diagonal' | 'isometric' | 'front'>('top')
  const orbitLastPos = useRef<{ x: number, y: number } | null>(null)
  const isPanningRef = useRef<boolean>(false)
  const panLastPos = useRef<{ x: number, y: number } | null>(null)
  const [selectionBoxWorld, setSelectionBoxWorld] = useState<null | { start: { x: number, y: number }, end: { x: number, y: number } }>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [isScaling, setIsScaling] = useState(false)
  const [scaleStart, setScaleStart] = useState<{ mouseX: number, mouseY: number, boxCenter: { x: number, y: number }, initialPositions: { id: string, x: number, z: number, yOffset: number }[], boxMinX: number, boxMinY: number, boxMaxX: number, boxMaxY: number } | null>(null)
  const [showQuickSettings, setShowQuickSettings] = useState(false)
  const [showParticleModal, setShowParticleModal] = useState(false)
  const isMouseOverUIRef = useRef(false)
  const [sliderValue, setSliderValue] = useState<number | null>(null)
  // State for worker-based selection
  const [workerSelection, setWorkerSelection] = useState<{
    selectedIds: string[];
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null>(null);

  // State for current selection bounds (butonlar için)
  const [currentSelectionBounds, setCurrentSelectionBounds] = useState<{
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

  // Canvas boyutu değiştiğinde hızlı tepki için useLayoutEffect
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      // Canvas boyutu değiştiğinde hemen yeniden hesapla
      if (selectedElementIds.length > 0 && currentLayer) {
        const bounds = getSelectionBoxBounds()
        if (bounds) {
          setCurrentSelectionBounds(bounds)
        }
      }
    }

    // ResizeObserver kullanarak daha hassas boyut değişikliği tespiti
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    return () => resizeObserver.disconnect()
  }, [selectedElementIds, currentLayer, viewMode, scale, offset])

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

      // Canvas boyutu değiştiğinde selection box koordinatlarını yeniden hesapla
      if (selectedElementIds.length > 0 && currentLayer) {
        setForceUpdate(prev => prev + 1)
        // Selection box'ı yeniden hesapla
        setTimeout(() => {
          const bounds = getSelectionBoxBounds()
          if (bounds) {
            setCurrentSelectionBounds(bounds)
          }
        }, 10)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [selectedElementIds, currentLayer])

  // Canvas boyutu değiştiğinde mouse position'ı güncelle
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      // Mouse position'ı temizle çünkü canvas boyutu değişti
      setMousePosition(null)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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

    // Dikey çizgiler için başlangıç noktasını merkeze göre hesapla
    const startX = centerX % gridSize;
    for (let x = startX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let x = startX - gridSize; x >= 0; x -= gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Yatay çizgiler için başlangıç noktasını merkeze göre hesapla
    const startY = centerY % gridSize;
    for (let y = startY; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    for (let y = startY - gridSize; y >= 0; y -= gridSize) {
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

    // Draw grid coordinates (Desmos style) - User toggleable
    if (showGridCoordinates) {
      ctx.fillStyle = "#666666";
      ctx.font = "11px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "center";

      // X-axis numbers (center'dan başlayarak her iki yöne)
      for (let i = 1; centerX + i * gridSize < canvas.width; i++) {
        const x = centerX + i * gridSize;
        const worldX = (x - centerX) / (10 * scale);
        const roundedX = Math.round(worldX);

        ctx.fillText(roundedX.toString(), x, centerY + 15);
      }

      for (let i = 1; centerX - i * gridSize >= 0; i++) {
        const x = centerX - i * gridSize;
        const worldX = (x - centerX) / (10 * scale);
        const roundedX = Math.round(worldX);

        ctx.fillText(roundedX.toString(), x, centerY + 15);
      }

      // Y-axis numbers (center'dan başlayarak her iki yöne)
      ctx.textAlign = "right";
      for (let i = 1; centerY + i * gridSize < canvas.height; i++) {
        const y = centerY + i * gridSize;
        const worldY = -(y - centerY) / (10 * scale);
        const roundedY = Math.round(worldY);

        ctx.fillText(roundedY.toString(), centerX - 8, y + 4);
      }

      for (let i = 1; centerY - i * gridSize >= 0; i++) {
        const y = centerY - i * gridSize;
        const worldY = -(y - centerY) / (10 * scale);
        const roundedY = Math.round(worldY);

        ctx.fillText(roundedY.toString(), centerX - 8, y + 4);
      }

      // Origin (0,0) label - always show when coordinates are enabled
      ctx.textAlign = "left";
      ctx.fillStyle = "#888888";
      ctx.fillText("0", centerX + 4, centerY + 15);

      ctx.textAlign = "start"; // Reset text alignment
    }

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

    // Draw chain sequence - Minimal Animation
    if (modes.chainMode && chainItems && chainItems.length > 0 && currentLayer) {
      const chainPositions: { x: number, y: number, elementId: string }[] = []

      // Collect all element positions in chain order
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

      // Minimal Animation - Simple pulsing ring
      if (chainPositions.length > 0) {
        ctx.save()

        const time = Date.now() * 0.001
        const pulseSpeed = 2

        chainPositions.forEach((pos, index) => {
          // Simple pulse effect
          const pulsePhase = (time + index * 0.5) % pulseSpeed
          const pulseIntensity = Math.sin(pulsePhase * Math.PI) * 0.5 + 0.5

          // Minimal ring
          const ringRadius = (6 + pulseIntensity * 4) * scale
          const ringAlpha = 0.4 + pulseIntensity * 0.3

          ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`
          ctx.lineWidth = 1 * scale
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, ringRadius, 0, 2 * Math.PI)
          ctx.stroke()
        })

        ctx.restore()
      }
    }

    // Draw drag preview for shapes (circle, square, line)
    if (isDragging && (currentTool === "circle" || currentTool === "square" || currentTool === "triangle" || currentTool === "line")) {
      // Apply snap to grid to both start and end points for overlay
      const { x: snapStartX, y: snapStartY } = snapToGrid(dragStart.x, dragStart.y)
      const { x: snapEndX, y: snapEndY } = snapToGrid(dragEnd.x, dragEnd.y)
      
      const startX = snapStartX
      const startY = snapStartY
      const endX = snapEndX
      const endY = snapEndY
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      if (currentTool === "circle") {
        ctx.beginPath()
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
        ctx.stroke()

        // Ultra Modern Coordinate Display
        if (radius > 0) {
          const worldRadius = radius / (10 * scale)
          const centerWorld = canvasToWorld(startX, startY)

          ctx.save()
          ctx.setLineDash([])

          // Koordinat bilgileri
          const centerText = `(${centerWorld.x.toFixed(1)}, ${centerWorld.z.toFixed(1)})`
          const radiusText = `r = ${worldRadius.toFixed(1)}`

          // Modern font
          ctx.font = "600 13px -apple-system, system-ui, 'SF Pro Display', sans-serif"
          const centerMetrics = ctx.measureText(centerText)
          ctx.font = "500 12px -apple-system, system-ui, 'SF Pro Display', sans-serif"
          const radiusMetrics = ctx.measureText(radiusText)
          const maxWidth = Math.max(centerMetrics.width, radiusMetrics.width)

          // Box boyutları
          const padding = 16
          const boxWidth = maxWidth + padding * 2
          const boxHeight = 48
          const cornerRadius = 12

          // Pozisyon (circle'ın sağ üstü)
          const boxX = startX + radius + 16
          const boxY = startY - radius - 16

          // Glassmorphism background
          const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight)
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.25)")
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")

          // Backdrop blur simulation (multiple layers)
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.08 - i * 0.02})`
            ctx.beginPath()
            ctx.roundRect(boxX - i, boxY - i, boxWidth + i * 2, boxHeight + i * 2, cornerRadius + i)
            ctx.fill()
          }

          // Main glassmorphism container
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius)
          ctx.fill()

          // Border gradient
          const borderGradient = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight)
          borderGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)")
          borderGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)")
          borderGradient.addColorStop(1, "rgba(255, 255, 255, 0.4)")

          ctx.strokeStyle = borderGradient
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius)
          ctx.stroke()

          // Inner highlight
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.roundRect(boxX + 1, boxY + 1, boxWidth - 2, boxHeight - 2, cornerRadius - 1)
          ctx.stroke()

          // Center koordinatları (modern typography)
          ctx.fillStyle = "#000000"
          ctx.font = "600 13px -apple-system, system-ui, 'SF Pro Display', sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(centerText, boxX + boxWidth / 2, boxY + 18)

          // Radius (siyah)
          ctx.fillStyle = "#000000"
          ctx.font = "500 12px -apple-system, system-ui, 'SF Pro Display', sans-serif"
          ctx.fillText(radiusText, boxX + boxWidth / 2, boxY + 34)

          // Modern center point (white with subtle shadow)
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
          ctx.shadowBlur = 4
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(startX, startY, 4, 0, 2 * Math.PI)
          ctx.fill()

          // Inner black dot for contrast
          ctx.shadowBlur = 0
          ctx.fillStyle = "#000000"
          ctx.beginPath()
          ctx.arc(startX, startY, 1.5, 0, 2 * Math.PI)
          ctx.fill()

          ctx.textAlign = "start"
          ctx.restore()
        }
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
      } else if (currentTool === "triangle") {
        const triAngles = [ -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI / 3), (-Math.PI / 2) + (4 * Math.PI / 3) ]
        const verts = triAngles.map(a => ({ x: startX + Math.cos(a) * radius, y: startY + Math.sin(a) * radius }))
        ctx.beginPath()
        ctx.moveTo(verts[0].x, verts[0].y)
        ctx.lineTo(verts[1].x, verts[1].y)
        ctx.lineTo(verts[2].x, verts[2].y)
        ctx.closePath()
        ctx.stroke()
      }

      ctx.setLineDash([])
    }

    // Draw selection rectangle if active (only when dragging with select tool)
    // NOT: Element seçildikten sonra bu box gizlenir, sadece çizgili box kalır
    if (currentTool === "select" && selectionBox && selectedElementIds.length === 0) {
      // Selection box'ı her zaman çiz
      const dx = Math.abs(selectionBox.end.x - selectionBox.start.x)
      const dy = Math.abs(selectionBox.end.y - selectionBox.start.y)

      if (dx > 1 || dy > 1) { // Çok küçük bir minimum mesafe
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
    }

    // Draw bounding box around selected elements (only when not dragging a selection)
    const MIN_BOX_SIZE = 80
    if (currentTool === "select" && ((selectedElementIds?.length ?? 0) > 0 && currentLayer)) {
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
          const BOX_PADDING = 30;
          minX -= BOX_PADDING;
          minY -= BOX_PADDING;
          maxX += BOX_PADDING;
          maxY += BOX_PADDING;

          // Modern solid selection box'ı çiz (kesik çizgi değil)

          // Selection box koordinatlarını state'e kaydet (butonlar için)
          // Canvas boyutu değiştiğinde koordinatları güncelle
          if (canvas.width > 0 && canvas.height > 0) {
            setCurrentSelectionBounds({ minX, minY, maxX, maxY });
          }
        }
      }
    }

    // Draw eraser cursor (kırmızı yuvarlak)
    if (currentTool === "eraser" && mousePosition) {
      ctx.save();
      ctx.strokeStyle = "#ff0000";
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

  }, [layers, performanceMode, modes, scale, offset, viewMode, currentLayer, dragStart, dragEnd, isDragging, currentTool, selectionBox, selectedElementIds, isRotating, isScaling, scaleStart, chainItems, animationTick, forceUpdate, mousePosition, showGridCoordinates]);

  // Chain Animation Web Worker - Kaldırıldı
  // useEffect(() => {
  //   if (!selectionWorker) return;
  //   const handleWorkerMessage = (e: MessageEvent) => {
  //     if (e.data.type === 'animationFrame') {
  //       // Force re-render with new array reference and animation tick
  //       // setChainAnimationData([...e.data.data]);
  //       setAnimationTick(prev => prev + 1);
  //       // Debug: Check if worker data is coming
  //       console.log('Worker data received:', e.data.data.length, 'items');
  //     }
  //   };

  //   selectionWorker.addEventListener('message', handleWorkerMessage);
  //   return () => selectionWorker.removeEventListener('message', handleWorkerMessage);
  // }, []);

  // Chain mode animation control - Basitleştirildi
  const [isChainAnimationRunning, setIsChainAnimationRunning] = useState(false);
  const chainItemsRef = useRef(chainItems);

  // Update chainItems ref when it changes
  useEffect(() => {
    chainItemsRef.current = chainItems;
  }, [chainItems]);

  // Basit chain mode kontrolü
  useEffect(() => {
    if (modes.chainMode && chainItems && chainItems.length > 0) {
      setIsChainAnimationRunning(true);
    } else {
      setIsChainAnimationRunning(false);
    }
  }, [modes.chainMode, chainItems]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsChainAnimationRunning(false);
    };
  }, []);

  const getCanvasCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    // Canvas boyutu ile DOM boyutu arasındaki farkı hesapla
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Mouse pozisyonunu canvas koordinatlarına dönüştür
    const canvasX = (e.clientX - rect.left) * scaleX
    const canvasY = (e.clientY - rect.top) * scaleY

    return { x: canvasX, y: canvasY }
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
    if (isMouseOverUIRef.current) return
    // Canvas boyutunu kontrol et
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0 || canvas.height === 0) return
    // Middle mouse button: pan canvas
    if (e.button === 1) {
      e.preventDefault()
      isPanningRef.current = true
      const rect = canvas.getBoundingClientRect()
      panLastPos.current = { x: e.clientX, y: e.clientY }
      canvas.style.cursor = "move"
      window.addEventListener("mousemove", handlePanMove)
      window.addEventListener("mouseup", handlePanUp)
      return
    }

    // Chain mode'da sadece canvas pan/zoom hareketini engelle, element eklemeye izin ver
    // if (modes.chainMode && currentTool !== "select") {
    //   return;
    // }

    // Batch mode'u başlat (mouse down)
    if (onStartBatchMode) {
      onStartBatchMode();
    }

    const MIN_BOX_SIZE = 80;
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
          const startRadius = Math.sqrt(Math.pow(mouseX - boxCenter.x, 2) + Math.pow(mouseY - boxCenter.y, 2))
          const initialPositions = selectedEls.map(el => ({
            id: el.id,
            x: el.position.x,
            z: el.position.z,
            yOffset: typeof el.yOffset === 'number' ? el.yOffset : (typeof el.position.y === 'number' ? el.position.y : 0)
          }))
          
          setRotateStart({
            mouseX,
            mouseY,
            boxCenter,
            initialPositions,
            startAngle,
            startRadius,
            boxMinX: minX,
            boxMinY: minY,
            boxMaxX: maxX,
            boxMaxY: maxY
          })
          
          // Action Recording: Rotate start - gereksiz, sadece update ve end yeterli
          
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
          const padding = 20
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
        // Önce mevcut selectionBox'ı temizle
        setSelectionBox(null)
        setSelectionBox({ start: { x, y }, end: { x, y } })
        setSelectedElementIds([])
        setWorkerSelection(null) // Seçim iptalinde workerSelection'ı da temizle
        
        // Action Recording: Clear selection - gereksiz, sadece UI durumu
      } else if (clickedOnSelected) {
        // Start dragging selected element
        setDraggingSelection(true)
        setDragOffset({ x, y })
        
        // Action Recording: Move start
        if (modes.actionRecordingMode && selectedElementIds.length > 0 && currentLayer) {
          const initialPositions = selectedElementIds.map(id => {
            const element = currentLayer.elements.find(el => el.id === id);
            if (!element) return { id, x: 0, z: 0, yOffset: 0 };
            return {
              id,
              x: element.position.x,
              z: element.position.z,
              yOffset: typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
            };
          });
          
          // Action Recording: Move start - gereksiz, sadece update ve end yeterli
        }
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
    } else if (currentTool === "circle" || currentTool === "square" || currentTool === "triangle" || currentTool === "line") {
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

  const handlePanMove = (e: MouseEvent) => {
    if (!isPanningRef.current || !panLastPos.current) return
    const dx = e.clientX - panLastPos.current.x
    const dy = e.clientY - panLastPos.current.y
    setOffset(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
    panLastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePanUp = () => {
    isPanningRef.current = false
    panLastPos.current = null
    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = "default"
    window.removeEventListener("mousemove", handlePanMove)
    window.removeEventListener("mouseup", handlePanUp)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Canvas boyutunu kontrol et
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0 || canvas.height === 0) return

    // Chain mode'da sadece canvas pan/zoom hareketini engelle, element eklemeye izin ver
    // if (modes.chainMode && currentTool !== "select") {
    //   return;
    // }

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
      
      // Action Recording: Scale update (throttled)
      if (modes.actionRecordingMode && selectedElementIds.length > 0) {
        const currentTime = Date.now()
        if (!lastScaleRecordTime || currentTime - lastScaleRecordTime > 16) { // 16ms throttle (~60fps)
          // Minimum ölçeklendirme threshold'u (çok küçük değişiklikleri kaydetme)
          const minScaleChange = 0.01 // %1 minimum ölçeklendirme değişikliği
          if (Math.abs(scaleFactor - 1) > minScaleChange) {
            const currentPositions = selectedElementIds.map(id => {
              const element = currentLayer.elements.find(el => el.id === id);
              if (!element) return { id, x: 0, z: 0, yOffset: 0 };
              return {
                id,
                x: element.position.x,
                z: element.position.z,
                yOffset: typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
              };
            });
            
            recordTransformUpdate(selectedElementIds, 'scale', currentPositions, undefined, 
              currentPositions.map(p => ({ id: p.id, scale: scaleFactor })));
            setLastScaleRecordTime(currentTime)
          }
        }
      }

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

    // Mouse position'ı sadece eraser tool'da güncelle
    if (currentTool === 'eraser') {
      setMousePosition({ x, y });
    }

    if (isRotating && rotateStart && currentLayer && onUpdateLayer) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Canvas koordinatlarına dönüştür (offset ve scale'i dikkate al)
      const canvasX = (mouseX - canvas.width / 2 - offset.x) / (10 * scale);
      const canvasY = (mouseY - canvas.height / 2 - offset.y) / (10 * scale);
      
      // Box center'ı da canvas koordinatlarına dönüştür
      const boxCenterCanvasX = (rotateStart.boxCenter.x - canvas.width / 2 - offset.x) / (10 * scale);
      const boxCenterCanvasY = (rotateStart.boxCenter.y - canvas.height / 2 - offset.y) / (10 * scale);
      
      const currAngle = Math.atan2(canvasY - boxCenterCanvasY, canvasX - boxCenterCanvasX);
      const deltaAngle = currAngle - rotateStart.startAngle;

      // Combined transform: if Shift is held, also scale relative to center based on radius change
      const mouseEvent = e.nativeEvent as MouseEvent
      const currRadiusPx = Math.sqrt(Math.pow(mouseX - rotateStart.boxCenter.x, 2) + Math.pow(mouseY - rotateStart.boxCenter.y, 2))
      // Convert pixel radius ratio to world scale ratio (both scale with pixels, so ratio is fine)
      const scaleFactorCombined = mouseEvent.shiftKey && rotateStart.startRadius > 0
        ? Math.max(0.1, Math.min(5, currRadiusPx / rotateStart.startRadius))
        : 1
      
      // Action Recording: Rotate update (throttled)
      if (modes.actionRecordingMode && selectedElementIds.length > 0) {
        const currentTime = Date.now()
        if (!lastRotateRecordTime || currentTime - lastRotateRecordTime > 16) { // 16ms throttle (~60fps)
          // Minimum döndürme threshold'u (çok küçük döndürmeleri kaydetme)
          const minRotation = 0.01 // ~0.57 derece minimum döndürme
          if (Math.abs(deltaAngle) > minRotation) {
            const currentPositions = selectedElementIds.map(id => {
              const element = currentLayer.elements.find(el => el.id === id);
              if (!element) return { id, x: 0, z: 0, yOffset: 0 };
              return {
                id,
                x: element.position.x,
                z: element.position.z,
                yOffset: typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
              };
            });
            
            recordTransformUpdate(selectedElementIds, 'rotate', currentPositions, 
              currentPositions.map(p => ({ id: p.id, rotation: deltaAngle })), undefined);
            setLastRotateRecordTime(currentTime)
          }
        }
      }

      if (viewMode === 'side') {
        // Side view: Z ekseni etrafında döndürme (X ve Y koordinatlarını değiştir)
        const centerX = rotateStart.initialPositions.reduce((sum, p) => sum + p.x, 0) / rotateStart.initialPositions.length;
        const centerY = rotateStart.initialPositions.reduce((sum, p) => sum + p.yOffset, 0) / rotateStart.initialPositions.length;

        const updatedElements = currentLayer.elements.map(el => {
          const found = rotateStart.initialPositions.find(p => p.id === el.id);
          if (!found) return el;
          // Merkezden vektör (X ve Y düzleminde)
          let dx = found.x - centerX;
          let dy = found.yOffset - centerY;
          // Apply optional scaling
          dx *= scaleFactorCombined; 
          dy *= scaleFactorCombined;
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
          let dx = found.x - centerX;
          let dz = found.z - centerZ;
          // Apply optional scaling
          dx *= scaleFactorCombined;
          dz *= scaleFactorCombined;
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
      
      // Action Recording: Sürekli move kayıt (throttled)
      if (modes.actionRecordingMode && selectedElementIds.length > 0) {
        const currentTime = Date.now()
        if (!lastMoveRecordTime || currentTime - lastMoveRecordTime > 16) { // 16ms throttle (~60fps)
          const positions = selectedElementIds.map(id => {
            const element = updatedElements.find(el => el.id === id)
            if (!element) return null
            return {
              id,
              x: element.position.x,
              z: element.position.z,
              yOffset: typeof element.yOffset === 'number' ? element.yOffset : 0
            }
          }).filter(Boolean) as { id: string, x: number, z: number, yOffset: number }[]
          
          // Minimum hareket threshold'u (çok küçük hareketleri kaydetme)
          const minMovement = 0.01 // 0.01 birim minimum hareket
          const hasSignificantMovement = positions.some(pos => 
            Math.abs(pos.x) > minMovement || Math.abs(pos.z) > minMovement || Math.abs(pos.yOffset) > minMovement
          )
          
          if (hasSignificantMovement) {
            recordMoveContinuous(selectedElementIds, positions)
            setLastMoveRecordTime(currentTime)
          }
        }
      }
      
      setDragOffset({ x, y })
      return
    }

    if (currentTool === "select" && selectionBox && !draggingSelection) {
      // Selection box'ı sürekli güncelle (minimum drag mesafesi kontrolü kaldırıldı)
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
    } else if (isDragging && (currentTool === "circle" || currentTool === "square" || currentTool === "triangle" || currentTool === "line")) {
      // Apply snap to grid to drag end point
      const coords = snapToGrid(x, y)
      setDragEnd({ x: coords.x, y: coords.y })
    } else if (isDrawing && currentTool === "eraser") {
      eraseElements(x, y)
    }
  }

  const handleMouseUp = () => {
    // Canvas boyutunu kontrol et
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0 || canvas.height === 0) return

    // Chain mode'da sadece canvas pan/zoom hareketini engelle, element eklemeye izin ver
    // if (modes.chainMode && currentTool !== "select") {
    //   return;
    // }

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

        // Önce selectionBox'ı temizle, sonra element'leri seç
        setSelectionBox(null)
        setSelectedElementIds(selected)
        
        // Element seçildiğinde select tool'una geç
        if (selected.length > 0) {
          setCurrentTool("select")
        }

        // Action Recording: Selection box ile seçim yapıldığında kaydet - SADECE transform işlemi yapılacaksa
        // Sadece seçim yapmak action recording'e eklenmemeli

        if (selected.length === 0) {
          setWorkerSelection(null) // Seçim kutusu boşsa workerSelection'ı da temizle
        }
      }

      if (draggingSelection) {
        setDraggingSelection(false)
        setDragOffset(null)
      }

      // Her durumda selectionBox'ı temizle
      if (selectionBox) {
        setSelectionBox(null)
      }

      return
    }

    // Güvenlik: olası pan durumu varsa kapat
    if (isPanningRef.current) {
      handlePanUp()
    }

    if (isDragging && (currentTool === "circle" || currentTool === "square" || currentTool === "triangle" || currentTool === "line")) {
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
      } else if (currentTool === "triangle") {
        const start = dragStart
        const end = dragEnd
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        createTriangle(start.x, start.y, radius)
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

  // ✅ TRIANGLE CREATION - MULTIPLE ELEMENTS (equilateral along perimeter)
  const createTriangle = (centerX: number, centerY: number, radius: number) => {
    const { x: snapCenterX, y: snapCenterY } = snapToGrid(centerX, centerY)
    const count = Math.max(3, settings.particleCount || 10)
    const elements: Element[] = []
    const groupId = `triangle-group-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const worldCenter = canvasToWorld(snapCenterX, snapCenterY)

    // Equilateral triangle vertices
    const angles = [ -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI / 3), (-Math.PI / 2) + (4 * Math.PI / 3) ]
    const vertices = angles.map(a => ({ x: snapCenterX + Math.cos(a) * radius, y: snapCenterY + Math.sin(a) * radius }))

    // Corner points first
    const points: Array<{x:number;y:number}> = [
      { x: vertices[0].x, y: vertices[0].y },
      { x: vertices[1].x, y: vertices[1].y },
      { x: vertices[2].x, y: vertices[2].y },
    ]

    // Remaining points distribute per-edge without duplicating corners
    let remaining = count - 3
    if (remaining > 0) {
      const base = Math.floor(remaining / 3)
      const rem = remaining % 3
      const perEdge = [base, base, base]
      for (let r = 0; r < rem; r++) perEdge[r]++
      for (let e = 0; e < 3; e++) {
        const v0 = vertices[e]
        const v1 = vertices[(e + 1) % 3]
        const m = perEdge[e]
        for (let j = 0; j < m; j++) {
          const t = (j + 1) / (m + 1) // exclude exact corners
          points.push({ x: v0.x + (v1.x - v0.x) * t, y: v0.y + (v1.y - v0.y) * t })
        }
      }
    }

    points.slice(0, count).forEach((p, i) => {
      const worldPos = canvasToWorld(p.x, p.y)
      let yOffset: number
      if (viewMode === 'side') {
        yOffset = -((p.y - (canvasRef.current!.height / 2 + offset.y)) / (10 * scale))
      } else if (viewMode === 'front') {
        yOffset = (p.x - (canvasRef.current!.width / 2 + offset.x)) / (10 * scale)
      } else {
        yOffset = settings.yOffset
      }

      elements.push({
        id: `triangle-${Date.now()}-${i}`,
        type: "triangle",
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
    })
    addElementWithRecording(elements)
    if (onShapeCreated) onShapeCreated("triangle");
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
    // Canvas boyutunu kontrol et
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0 || canvas.height === 0) return



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
        
        // Action Recording: Move end
        if (modes.actionRecordingMode && draggingSelection && selectedElementIds.length > 0 && currentLayer) {
          const finalPositions = selectedElementIds.map(id => {
            const element = currentLayer.elements.find(el => el.id === id);
            if (!element) return { id, x: 0, z: 0, yOffset: 0 };
            return {
              id,
              x: element.position.x,
              z: element.position.z,
              yOffset: typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
            };
          });
          
          recordTransformEnd(selectedElementIds, 'translate', finalPositions, undefined, undefined);
        }
        
        setDraggingSelection(false)
        setDragOffset(null)
      }
      setIsDrawing(false)
      setIsDragging(false)
      if (isRotating || rotateStart) {
        // Action Recording: Rotate işlemini kaydet
        if (modes.actionRecordingMode && rotateStart && selectedElementIds.length > 0 && mousePosition) {
          const currentAngle = Math.atan2(
            mousePosition.y - rotateStart.boxCenter.y, 
            mousePosition.x - rotateStart.boxCenter.x
          )
          const angleDiff = currentAngle - rotateStart.startAngle
          const angleDegrees = (angleDiff * 180) / Math.PI
          
          // Final positions for transform end
          const finalPositions = selectedElementIds.map(id => {
            const element = currentLayer?.elements.find(el => el.id === id);
            if (!element) return { id, x: 0, z: 0, yOffset: 0 };
            return {
              id,
              x: element.position.x,
              z: element.position.z,
              yOffset: typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
            };
          });
          
          recordTransformEnd(selectedElementIds, 'rotate', finalPositions, 
            finalPositions.map(p => ({ id: p.id, rotation: angleDiff })), undefined);
        }
        
        setIsRotating(false)
        setRotateStart(null)
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [currentTool, selectionBox, currentLayer, viewMode, scale, offset, isRotating, rotateStart, selectedElementIds])

  // Canvas'ta gösterilecek minimal şekil listesi
  const canvasShapesList = useMemo(() => {
    if (!currentLayer?.elements) return []
    
    const allowedTypes = ["circle", "square", "triangle", "line"]
    const groups: Record<string, { id: string; name: string; elementIds: string[]; type: string; isFreeDraw?: boolean }> = {}
    
    // Önce groupId olan şekilleri grupla
    for (const el of currentLayer.elements) {
      if (!el.groupId) continue
      if (!allowedTypes.includes(el.type)) continue
      if (!groups[el.groupId]) {
        groups[el.groupId] = {
          id: el.groupId,
          name: el.type.charAt(0).toUpperCase() + el.type.slice(1),
          elementIds: [],
          type: el.type,
          isFreeDraw: false
        }
      }
      groups[el.groupId].elementIds.push(el.id)
    }
    
    // Free draw elementlerini grupla (groupId olmayan, free draw tool ile çizilen)
    const freeDrawElements = currentLayer.elements.filter(el => !el.groupId && el.type === "free")
    if (freeDrawElements.length > 0) {
      const freeDrawGroupId = "free-draw-group"
      groups[freeDrawGroupId] = {
        id: freeDrawGroupId,
        name: "Free Draw",
        elementIds: freeDrawElements.map(el => el.id),
        type: "free",
        isFreeDraw: true
      }
    }
    
    return Object.values(groups)
  }, [currentLayer?.elements])

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
        // Action Recording: Scale işlemini kaydet
        if (modes.actionRecordingMode && scaleStart && selectedElementIds.length > 0 && mousePosition) {
          const currentMouseX = mousePosition.x
          const currentMouseY = mousePosition.y
          const deltaX = currentMouseX - scaleStart.mouseX
          const deltaY = currentMouseY - scaleStart.mouseY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          const scaleFactor = 1 + (distance / 100) // Basit scale hesaplama
          
          // Final positions for transform end
          const finalPositions = selectedElementIds.map(id => {
            const element = currentLayer?.elements.find(el => el.id === id);
            if (!element) return { id, x: 0, z: 0, yOffset: 0 };
            return {
              id,
              x: element.position.x,
              z: element.position.z,
              yOffset: typeof element.yOffset === 'number' ? element.yOffset : (typeof element.position.y === 'number' ? element.position.y : 0)
            };
          });
          
          recordTransformEnd(selectedElementIds, 'scale', finalPositions, undefined, 
            finalPositions.map(p => ({ id: p.id, scale: scaleFactor })));
        }
        
        setIsScaling(false)
        setScaleStart(null)
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isScaling, selectedElementIds, currentLayer])

  // Quick Settings açıldığında veya seçim değiştiğinde slider başlangıç değerini güncelle
  useEffect(() => {
    if (showQuickSettings) {
      setSliderValue(getCurrentParticleCount())
    }
  }, [showQuickSettings, selectedElementIds])

  // Selection box koordinatlarını hesapla
  function getSelectionBoxBounds() {
    if (!currentLayer || !selectedElementIds || selectedElementIds.length === 0) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Canvas boyutlarını kontrol et
    if (canvas.width === 0 || canvas.height === 0) return null;

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
    const BOX_PADDING = 30;
    minX -= BOX_PADDING;
    minY -= BOX_PADDING;
    maxX += BOX_PADDING;
    maxY += BOX_PADDING;

    // Canvas sınırları içinde olduğundan emin ol
    minX = Math.max(0, minX);
    minY = Math.max(0, minY);
    maxX = Math.min(canvas.width, maxX);
    maxY = Math.min(canvas.height, maxY);

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
    
    // Canvas koordinatlarına dönüştür
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasX = (mouseX - canvas.width / 2 - offset.x) / (10 * scale);
    const canvasY = (mouseY - canvas.height / 2 - offset.y) / (10 * scale);
    const boxCenterCanvasX = (boxCenter.x - canvas.width / 2 - offset.x) / (10 * scale);
    const boxCenterCanvasY = (boxCenter.y - canvas.height / 2 - offset.y) / (10 * scale);
    
    const startAngle = Math.atan2(canvasY - boxCenterCanvasY, canvasX - boxCenterCanvasX);
    const startRadius = Math.sqrt(Math.pow(mouseX - boxCenter.x, 2) + Math.pow(mouseY - boxCenter.y, 2));

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
      startRadius,
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
    const initialPositions = selectedEls.map(el => ({
      id: el.id,
      x: el.position.x,
      z: el.position.z,
      yOffset: typeof el.yOffset === 'number' ? el.yOffset : 0
    }));

    setScaleStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxCenter,
      initialPositions,
      boxMinX: bounds.minX,
      boxMinY: bounds.minY,
      boxMaxX: bounds.maxX,
      boxMaxY: bounds.maxY
    });
    
    // Action Recording: Scale start - gereksiz, sadece update ve end yeterli
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
      // Canvas boyutunu kontrol et
      const canvas = canvasRef.current
      if (!canvas || canvas.width === 0 || canvas.height === 0) return

      e.preventDefault()
      e.stopPropagation()

      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)))
    }

    canvas.addEventListener('wheel', handleWheelEvent, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheelEvent)
    }
  }, [modes.chainMode])

  return (
    <div className="canvas-area relative w-full h-full bg-[#000000] overflow-hidden">

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
      <div className="absolute top-6 left-6 flex items-center gap-4" onMouseEnter={() => { isMouseOverUIRef.current = true }} onMouseLeave={() => { isMouseOverUIRef.current = false }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTool}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="bg-[#000000] rounded-lg px-3 py-2 flex items-center gap-3"
            style={{ minWidth: 120 }}
          >
            <span className={`px-2 py-1 rounded-md text-xs font-medium tracking-wide transition-colors duration-200 ${currentTool === "free" ? "bg-white/10 text-white border border-white/20" :
              currentTool === "select" ? "bg-white/10 text-white border border-white/20" :
                currentTool === "eraser" ? "bg-white/10 text-white border border-white/20" :
                  "bg-white/10 text-white/80"
              }`}>
              {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}
            </span>
            <span className={`text-[11px] font-medium transition-colors duration-200 ${
              currentTool === "free" || currentTool === "select" || currentTool === "eraser"
                ? "text-white/90" 
                : "text-white/60"
            }`}>
              {currentTool === "circle" || currentTool === "square" || currentTool === "triangle" || currentTool === "line"
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
        <div className="flex items-center gap-1">
          {[
            { key: 'free', icon: <Pencil className="w-4 h-4" />, label: 'Free' },
            { key: 'select', icon: <MousePointerClick className="w-4 h-4" />, label: 'Select' },
            { key: 'eraser', icon: <Eraser className="w-4 h-4" />, label: 'Eraser' },
            { key: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
            { key: 'square', icon: <Square className="w-4 h-4" />, label: 'Square' },
            { key: 'triangle', icon: <Triangle className="w-4 h-4" />, label: 'Triangle' },
            { key: 'line', icon: <Slash className="w-4 h-4" />, label: 'Line' }
          ].map(tool => (
            <motion.button
              key={tool.key}
              onClick={() => setCurrentTool(tool.key as Tool)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 ${currentTool === tool.key
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-[#000000] text-white/60 hover:text-white border-white/10 hover:border-white/20'
                }`}
              title={tool.label}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {tool.icon}
            </motion.button>
          ))}
        </div>

        {/* Quick Settings Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className="flex items-center gap-2 bg-[#000000] border border-white/10 text-white/80 hover:text-white hover:border-white/20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Settings</span>
          </motion.button>

          <AnimatePresence>
            {showQuickSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 left-0 bg-black border border-white/10 rounded-lg p-4 shadow-xl z-50 min-w-[280px]"
                onMouseEnter={() => { isMouseOverUIRef.current = true }}
                onMouseLeave={() => { isMouseOverUIRef.current = false; setShowQuickSettings(false) }}
                onMouseDown={(e) => { e.stopPropagation() }}
              >
                <div className="space-y-3">
                  {/* View Options */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="w-3 h-3 text-white/60" />
                      <span className="text-xs font-medium text-white/80">Grid Coordinates</span>
                    </div>
                    <button
                      onClick={() => {
                        if (onToggleGridCoordinates) onToggleGridCoordinates();
                        else onSettingsChange?.({ ...settings, showGridCoordinates: !showGridCoordinates })
                      }}
                      className={`px-2 py-1 text-xs rounded border transition-all ${showGridCoordinates ? 'bg-white/20 border-white/30 text-white' : 'bg-white/10 border-white/20 text-white/70 hover:text-white'}`}
                    >
                      {showGridCoordinates ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-white/60" />
                      <span className="text-xs font-medium text-white/80">Performance Mode</span>
                    </div>
                    <button
                      onClick={() => onSettingsChange?.({ ...settings, performanceMode: !settings.performanceMode })}
                      className={`px-2 py-1 text-xs rounded border transition-all ${settings.performanceMode ? 'bg-white/20 border-white/30 text-white' : 'bg-white/10 border-white/20 text-white/70 hover:text-white'}`}
                    >
                      {settings.performanceMode ? 'On' : 'Off'}
                    </button>
                  </div>
                  {/* Particle Count */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3 h-3 text-white/60" />
                        <span className="text-xs font-medium text-white/80">Particle Count</span>
                      </div>
                      <span className="text-xs text-white/60">{sliderValue ?? getCurrentParticleCount()}</span>
                    </div>
                    <Slider
                      value={[sliderValue ?? getCurrentParticleCount()]}
                      onValueChange={([value]) => {
                        setSliderValue(value)
                      }}
                      onValueCommit={([value]) => {
                        if (selectedElementIds.length > 0 && onElementCountChange) {
                          const currentLayer = layers.find(layer => layer.id === currentLayerId)
                          if (currentLayer) {
                            const selectedElement = currentLayer.elements.find(el => selectedElementIds.includes(el.id))
                            if (selectedElement && selectedElement.groupId) {
                              onElementCountChange(value, selectedElement.groupId)
                              // Action Recording: Particle count change - commit anında kaydet
                              if (modes.actionRecordingMode) {
                                recordParticleCountChange(selectedElementIds, value)
                              }
                            }
                          }
                        } else {
                          onSettingsChange?.({ ...settings, particleCount: value })
                          // Global ayar değişimi için kayıt gerekirse buraya eklenebilir
                        }
                      }}
                      min={getCurrentMinCount()}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Color Picker */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-3 h-3 text-white/60" />
                      <span className="text-xs font-medium text-white/80">Color</span>
                    </div>
                    <ColorPicker
                      value={settings.color || "#ffffff"}
                      onChange={(color) => {
                        // Varsayılan çizim rengi
                        onSettingsChange?.({ ...settings, color })

                        // Seçili shape varsa doğrudan onların rengini güncelle
                        if (selectedElementIds.length > 0 && onUpdateLayer && currentLayerId) {
                          const layer = layers.find(l => l.id === currentLayerId)
                          if (layer) {
                            const updatedElements = layer.elements.map(el =>
                              selectedElementIds.includes(el.id) ? { ...el, color } : el
                            )
                            onUpdateLayer(currentLayerId, { elements: updatedElements })
                            // Action Recording: Color change - anında kaydet
                            if (modes.actionRecordingMode) {
                              recordColorChange(selectedElementIds, color)
                            }
                          }
                        }
                        
                      }}
                      className="w-auto"
                      showAlpha={false}
                    />
                  </div>

                  {/* Particle Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/80">Particle</span>
                    <button
                      onClick={() => setShowParticleModal(true)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs rounded px-2 py-1 transition-all"
                    >
                      {settings.particle || "reddust"}
                    </button>
                  </div>

                  {/* Shapes List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-xs font-medium text-white/80">Shapes</span>
                      </div>
                      <span className="text-xs text-white/60">{canvasShapesList.length}</span>
                    </div>
                    
                    {canvasShapesList.length === 0 ? (
                      <div className="text-center py-2">
                        <div className="text-xs text-white/40">No shapes</div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {canvasShapesList.map((shape) => (
                          <div
                            key={shape.id}
                            className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                            onClick={() => {
                              setSelectedElementIds(shape.elementIds)
                              // Quick Settings açık kalsın
                            }}
                          >
                            <span className="text-xs text-white/70 capitalize">{shape.name}</span>
                            <span className="text-xs text-white/50">{shape.elementIds.length}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Layer Button */}
        <motion.button
          onClick={onClearCanvas}
          className="flex items-center gap-2 bg-[#000000] border border-white/10 text-white/80 hover:text-red-400 hover:border-red-500/50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2' /></svg>
          <span className="hidden sm:inline">Clear Layer</span>
        </motion.button>

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
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
              transition-all duration-200 focus:outline-none
              ${isRecording
                ? 'bg-red-600 border border-red-500 text-white hover:bg-red-700'
                : 'bg-[#000000] border border-white/10 text-white/80 hover:text-blue-400 hover:border-blue-500/50'
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
      <div className="absolute left-6 flex flex-col items-center" style={{ top: 'calc(50% - 25px)', zIndex: 100 }}>
        <motion.button
          onClick={toggleSidebar}
          className="w-10 h-10 mb-3 flex items-center justify-center rounded-lg bg-[#000000] border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-all duration-200 focus:outline-none"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* --- Modern overlay kutusu ve butonlar --- */}
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

          {/* Delete Button - Sağ Üst */}
          <motion.button
            className="
              absolute right-[-20px] top-[-20px]
              w-8 h-8
              bg-[#000000] border border-white/20
              rounded-lg flex items-center justify-center
              shadow-lg hover:scale-110 hover:shadow-white/40
              transition-all duration-200 pointer-events-auto
              backdrop-blur
            "
            onClick={handleDeleteClick}
            style={{ pointerEvents: 'auto' }}
            title="Seçiliyi Sil"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </motion.button>

          {/* Rotate Button - Sağ Alt */}
          <motion.button
            className="
              absolute right-[-20px] bottom-[-20px]
              w-8 h-8
              bg-[#000000] border border-white/20
              rounded-lg flex items-center justify-center
              shadow-lg hover:scale-110 hover:shadow-white/40
              transition-all duration-200 pointer-events-auto
              backdrop-blur
            "
            onMouseDown={handleRotateMouseDown}
            style={{ pointerEvents: 'auto' }}
            title={viewMode === 'side' ? "Döndür (Z ekseni)" : "Döndür"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCw className="w-4 h-4 text-white" />
          </motion.button>

          {/* Scale Button - Sol Alt */}
          <motion.button
            className="
              absolute left-[-20px] bottom-[-20px]
              w-8 h-8
              bg-[#000000] border border-white/20
              rounded-lg flex items-center justify-center
              shadow-lg hover:scale-110 hover:shadow-white/40
              transition-all duration-200 pointer-events-auto
              backdrop-blur
            "
            onMouseDown={handleScaleMouseDown}
            style={{ pointerEvents: 'auto' }}
            title="Ölçekle (Tüm yönlerde)"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoveDiagonal className="w-4 h-4 text-white" />
          </motion.button>
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

      {/* Controls */}
      <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2">
        <AxisWidget viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Modern Zoom Controls - Sol Alt Köşe */}
      <div className="absolute bottom-6 left-6 z-30">
        <div className="flex flex-col gap-2">
          <motion.button
            onClick={() => setScale(s => Math.min(5, s * 1.15))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#000000] border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-all duration-200 focus:outline-none"
            title="Zoom In"
            style={{ userSelect: 'none' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm font-medium">+</span>
          </motion.button>
          <motion.button
            onClick={() => setScale(s => Math.max(0.2, s / 1.15))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#000000] border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-all duration-200 focus:outline-none"
            title="Zoom Out"
            style={{ userSelect: 'none' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm font-medium">−</span>
          </motion.button>
        </div>
      </div>


    </div>
  );
});

export { Canvas };
