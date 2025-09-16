"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useMemo, useRef, useEffect, useState } from "react"
import { use3DStore } from "../store/use3DStore"
import { VertexRenderer } from "./VertexRenderer"
import { SceneAxes } from "./SceneAxes"
import { BlenderCameraControls } from "./BlenderCameraControls"
import { ZoomControls, ZoomLogic } from "./ZoomControls"
import { SelectionBox } from "./SelectionBox"
import { TransformControlsManager } from "./TransformControlsManager"
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

        elements.forEach((element, index) => {
            const position = isTransforming && tempPositions.has(element.id)
                ? tempPositions.get(element.id)!
                : element.position

            dummy.position.set(position.x, position.y, position.z)
            dummy.updateMatrix()
            mesh.setMatrixAt(index, dummy.matrix)

            // Renk ayarla - seçili elementler için özel renk
            const { selectedVertices } = use3DStore.getState()
            const isSelected = selectedVertices.includes(element.id)
            
            const color = isSelected 
                ? new Color("#00ff00") // Bright green for selected
                : new Color(element[colorKey] || "#ffffff")
            mesh.setColorAt(index, color)
        })

        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }, [elements, isTransforming, tempPositions, colorKey, geometry])

    if (!geometry) return null

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, elements.length]}>
            <meshStandardMaterial />
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

export function OptimizedScene3D() {
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
                {/* Simple lighting - Same as Scene3DEditor */}
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

                {/* Grid - Same as Scene3DEditor */}
                {sceneConfig.showGrid && (!performanceMode || Array.from(vertices.values()).length < 2000) && (
                    <DoubleSidedGrid size={50} divisions={50} color={xrayMode ? "#555555" : "#333333"} />
                )}

                {/* Axes - Same as Scene3DEditor */}
                {sceneConfig.showAxes && <SceneAxes />}

                {/* Optimized Vertex Rendering (Instanced) - Same as Scene3DEditor */}
                <Suspense fallback={null}>
                    <OptimizedVertexList vertices={vertices} />
                </Suspense>

                {/* Selection Box - Same as Scene3DEditor */}
                {currentTool === "select" && <SelectionBox />}

                {/* Transform Controls - Same as Scene3DEditor */}
                <TransformControlsManager />

                {/* Blender-style Camera Controls - Same as Scene3DEditor */}
                <BlenderCameraControls />

                {/* Zoom Logic - Same as Scene3DEditor */}
                <ZoomLogic />
            </Canvas>

            {/* Zoom Controls - Same as Scene3DEditor */}
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