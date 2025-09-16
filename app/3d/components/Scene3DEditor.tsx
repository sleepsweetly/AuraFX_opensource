"use client"

import { Canvas } from "@react-three/fiber"
import { Grid, Html, Instances, Instance } from "@react-three/drei"
import { Suspense, useMemo, useRef, useEffect, useState } from "react"
import { VertexRenderer } from "./VertexRenderer"
import { ShapeRenderer } from "./ShapeRenderer"
import { SceneAxes } from "./SceneAxes"
import { TransformControlsManager } from "./TransformControlsManager"
import { SelectionBox } from "./SelectionBox"
import { BlenderCameraControls } from "./BlenderCameraControls"
import { ZoomControls, ZoomLogic } from "./ZoomControls"
import { use3DStore } from "../store/use3DStore"
import * as THREE from "three"
import { useLayerStore } from "@/store/useLayerStore"
import type { Layer, Element } from "@/types"
import { InstancedMesh, Object3D, Color } from "three"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { FloatingPropertiesPanel } from "./FloatingPropertiesPanel"

// Optimized Instanced Elements (VR modu gibi)
interface InstancedElementsProps {
  elements: any[];
  geometryType: string;
  colorKey?: string;
  geometryArgs?: number[];
}

function InstancedElements({ elements, geometryType, colorKey = "color", geometryArgs = [] }: InstancedElementsProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const isTransforming = use3DStore((state) => state.isTransforming)
  const tempPositions = use3DStore((state) => state.tempPositions)
  
  // Geometry oluştur
  const geometry = useMemo(() => {
    if (geometryType === "sphere") {
      return new THREE.SphereGeometry(...geometryArgs)
    } else if (geometryType === "box") {
      return new THREE.BoxGeometry(...geometryArgs)
    } else if (geometryType === "line") {
      return new THREE.BoxGeometry(...geometryArgs)
    }
    return null
  }, [geometryType, geometryArgs])
  
  useEffect(() => {
    if (!meshRef.current || !geometry) return
    
    const mesh = meshRef.current
    const dummy = new THREE.Object3D()
    
    // 1) Matrisleri ayarla - geçici pozisyonları kullan
    elements.forEach((el: any, i: number) => {
      let position = el.position
      
      // Transform sırasında geçici pozisyonları kullan
      if (isTransforming && tempPositions.has(el.id)) {
        const tempPos = tempPositions.get(el.id)!
        position = { x: tempPos.x, y: tempPos.y, z: tempPos.z }
      }
      
      dummy.position.set(position.x, position.y || 0, position.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    
    // 2) Renk buffer'ını hazırla - seçili elementler için özel renk
    const { selectedVertices } = use3DStore.getState()
    const count = elements.length
    const colorArray = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const element = elements[i]
      const isSelected = selectedVertices.includes(element.id)
      
      // Seçili elementler için parlak yeşil, diğerleri için normal renk
      let r = 1.0, g = 1.0, b = 1.0 // Default beyaz
      
      if (isSelected) {
        // Bright green for selected elements
        r = 0.0
        g = 1.0
        b = 0.0
      } else {
        const color = element.color || "#ffffff"
        
        if (color.startsWith('#')) {
          const hex = color.slice(1) // # işaretini kaldır
          if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16) / 255
            g = parseInt(hex.slice(2, 4), 16) / 255
            b = parseInt(hex.slice(4, 6), 16) / 255
          } else if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16) / 255
            g = parseInt(hex[1] + hex[1], 16) / 255
            b = parseInt(hex[2] + hex[2], 16) / 255
          }
        }
        
        // NaN kontrolü - eğer dönüşüm başarısızsa beyaz kullan
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
          r = g = b = 1.0
        }
      }
      
      colorArray[i * 3 + 0] = r
      colorArray[i * 3 + 1] = g
      colorArray[i * 3 + 2] = b
    }
    const instancedColors = new THREE.InstancedBufferAttribute(colorArray, 3)
    instancedColors.setUsage(THREE.DynamicDrawUsage)
    
    // 3) Doğrudan mesh'e ata
    mesh.instanceColor = instancedColors
    instancedColors.needsUpdate = true
    mesh.count = elements.length
    
  }, [elements, geometry, isTransforming, tempPositions])

  if (!geometry) return null

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, elements.length]}>
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  )
}

// Performance optimized vertex list component (Instanced)
function OptimizedVertexList({ vertices }: { vertices: Map<string, any> }) {
  const performanceMode = use3DStore((state) => state.performanceMode)
  const isTransforming = use3DStore((state) => state.isTransforming)
  const tempPositions = use3DStore((state) => state.tempPositions)

  const visibleVertices = useMemo(() => {
    const allVisible = Array.from(vertices.values()).filter(
      (vertex) => vertex.visible
    )
    
    if (performanceMode) {
      return allVisible.filter((_, index) => index % 2 === 0)
    }
    return allVisible
  }, [vertices, performanceMode])

  // Element sayısı azsa normal render, çoksa instanced
  if (visibleVertices.length < 100) {
    return (
      <>
        {visibleVertices.map((vertex) => (
          <VertexRenderer key={vertex.id} vertex={vertex} />
        ))}
      </>
    )
  }

  // Çok element varsa instanced render kullan (VR modu gibi)
  // InstancedElements kendi içinde geçici pozisyonları kontrol edecek
  return (
    <InstancedElements 
      elements={visibleVertices} 
      geometryType="sphere" 
      geometryArgs={[0.07, 8, 8]} 
    />
  )
}

// Custom double-sided grid
function DoubleSidedGrid({ size = 50, divisions = 50, color = "#404040" }) {
  const ref = useRef<THREE.Group>(null)
  const xrayMode = use3DStore((state) => state.xrayMode)
  
  useEffect(() => {
    if (!ref.current) return
    const gridHelper = new THREE.GridHelper(size, divisions, color, color)
    gridHelper.material.side = THREE.DoubleSide
    gridHelper.material.transparent = true
    gridHelper.material.opacity = xrayMode ? 0.8 : 0.7
    gridHelper.material.depthTest = !xrayMode
    ref.current.add(gridHelper)
    return () => {
      if (ref.current) {
        ref.current.remove(gridHelper)
      }
    }
  }, [size, divisions, color, xrayMode])
  return <group ref={ref} />
}

// BlenderAxisGizmo: Blender-style clickable axis widget (SVG version)
function BlenderAxisGizmo({ onAxisClick }: { onAxisClick: (axis: 'x' | 'y' | 'z') => void }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ background: 'rgba(24,24,24,0.7)', borderRadius: 36, boxShadow: '0 2px 8px #0008' }}>
      {/* Z Axis (Blue, up) */}
      <g style={{ cursor: 'pointer' }} onClick={() => onAxisClick('z')}>
        <line x1="36" y1="36" x2="36" y2="12" stroke="#3182ce" strokeWidth="4" />
        <polygon points="36,6 32,16 40,16" fill="#3182ce" />
        <text x="36" y="10" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#4dabf7" style={{ pointerEvents: 'none' }}>Z</text>
      </g>
      {/* X Axis (Red, right) */}
      <g style={{ cursor: 'pointer' }} onClick={() => onAxisClick('x')}>
        <line x1="36" y1="36" x2="60" y2="36" stroke="#e53e3e" strokeWidth="4" />
        <polygon points="66,36 56,32 56,40" fill="#e53e3e" />
        <text x="62" y="40" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#ff6b6b" style={{ pointerEvents: 'none' }}>X</text>
      </g>
      {/* Y Axis (Green, down) */}
      <g style={{ cursor: 'pointer' }} onClick={() => onAxisClick('y')}>
        <line x1="36" y1="36" x2="36" y2="60" stroke="#38a169" strokeWidth="4" />
        <polygon points="36,66 32,56 40,56" fill="#38a169" />
        <text x="36" y="64" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#51cf66" style={{ pointerEvents: 'none' }}>Y</text>
      </g>
      {/* Center dot */}
      <circle cx="36" cy="36" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
    </svg>
  );
}

export function Scene3DEditor() {
  const { camera, scene, vertices, shapes, performanceMode, currentTool, updateCamera, xrayMode, setXrayMode, selectedVertices, selectedShapes } = use3DStore()
  const layers: Layer[] = useLayerStore((state) => state.layers)
  const addElementsToLayer: (layerId: string, elements: Element[]) => void = useLayerStore((state) => state.addElementsToLayer)
  
  // Floating panel state
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [panelPosition, setPanelPosition] = useState({ x: 100, y: 100 })

  // Show panel when something is selected
  useEffect(() => {
    const hasSelection = selectedVertices.length > 0 || selectedShapes.length > 0

    setShowPropertiesPanel(hasSelection)
    
    // Responsive positioning - adapt to screen size
    if (hasSelection && !showPropertiesPanel) {
      const panelWidth = 320
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // Position based on screen size
      let x, y
      if (screenWidth > 1200) {
        // Large screens: right side
        x = screenWidth - panelWidth - 40
        y = 120
      } else if (screenWidth > 800) {
        // Medium screens: center-right
        x = screenWidth - panelWidth - 20
        y = 100
      } else {
        // Small screens: center
        x = Math.max(20, (screenWidth - panelWidth) / 2)
        y = 80
      }
      
      setPanelPosition({ x, y })
    }
  }, [selectedVertices.length, selectedShapes.length])

  const sceneConfig = useMemo(
    () => ({
      cameraPosition: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
      isPerspective: camera.isPerspective,
      showGrid: scene.showGrid,
      showAxes: scene.showAxes,
      gridSize: scene.gridSize,
    }),
    [camera, scene],
  )

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: sceneConfig.cameraPosition,
          fov: sceneConfig.isPerspective ? 50 : undefined,
          near: 0.1,
          far: 1000,
        }}
        orthographic={!sceneConfig.isPerspective}
        gl={{
          antialias: !performanceMode,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={performanceMode ? [0.5, 1] : [1, 2]}
        frameloop="always"
        style={{ 
          background: xrayMode ? '#0a0a0a' : '#000000',
          filter: xrayMode ? 'contrast(1.2) brightness(0.9)' : 'none'
        }}
      >
        {/* Simple lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow={!performanceMode && Array.from(vertices.values()).length < 1000}
          shadow-mapSize-width={performanceMode ? 512 : 1024}
          shadow-mapSize-height={performanceMode ? 512 : 1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        <pointLight position={[10, -10, 10]} intensity={0.3} />

        {/* Grid */}
        {sceneConfig.showGrid && (!performanceMode || Array.from(vertices.values()).length < 2000) && (
          <DoubleSidedGrid size={50} divisions={50} color={xrayMode ? "#555555" : "#333333"} />
        )}

        {/* Axes */}
        {sceneConfig.showAxes && <SceneAxes />}

        {/* Optimized Vertex Rendering (Instanced) */}
        <Suspense fallback={null}>
          <OptimizedVertexList vertices={vertices} />
        </Suspense>

        {/* Selection Box */}
        {currentTool === "select" && <SelectionBox />}

        {/* Transform Controls */}
        <TransformControlsManager />

        {/* Blender-style Camera Controls */}
        <BlenderCameraControls />

        {/* Zoom Logic */}
        <ZoomLogic />

        {/* Blender-style Axis Gizmo (bottom-right overlay) */}
        {/* <Html position={[0, 0, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ position: "fixed", right: 32, bottom: 32, zIndex: 20, pointerEvents: "auto" }}>
            <BlenderAxisGizmo onAxisClick={(axis) => {
              // Kamera pozisyonlarını Blender-style ayarla
              const dist = 10;
              if (axis === "x") updateCamera({ position: { x: dist, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } });
              if (axis === "y") updateCamera({ position: { x: 0, y: dist, z: 0 }, target: { x: 0, y: 0, z: 0 } });
              if (axis === "z") updateCamera({ position: { x: 0, y: 0, z: dist }, target: { x: 0, y: 0, z: 0 } });
            }} />
          </div>
        </Html> */}
      </Canvas>

      {/* Zoom Controls */}
      <ZoomControls />
      
      {/* X-Ray Mode Toggle - Scene Overlay */}
      <div className="absolute bottom-4 right-4 z-30">
        <Button
          size="sm"
          onClick={() => setXrayMode(!xrayMode)}
          className={`h-12 w-12 p-0 rounded-full shadow-lg transition-all duration-200 ${
            xrayMode 
              ? "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30" 
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-600"
          }`}
          title={`X-Ray Mode: ${xrayMode ? "ON" : "OFF"} (Alt+Z)`}
        >
          {xrayMode ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Floating Properties Panel */}
      {showPropertiesPanel && (
        <FloatingPropertiesPanel
          position={panelPosition}
          onClose={() => setShowPropertiesPanel(false)}
        />
      )}
    </div>
  )
}
