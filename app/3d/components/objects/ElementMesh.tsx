"use client"

import { useRef, useEffect, useMemo } from "react"
import type { Mesh } from "three"
import { useFrame } from "@react-three/fiber"
import { use3DStore } from "../../store/use3DStore"
import type { Element, Layer } from "@/types"

interface ElementMeshProps {
  element: Element
  layer: Layer
  isSelected: boolean
  isCurrentLayer: boolean
}

export function ElementMesh({ element, layer, isSelected, isCurrentLayer }: ElementMeshProps) {
  const meshRef = useRef<Mesh>(null)
  const lastUpdateTime = useRef(0)
  const { selectElement, exportVerticesToMainSystem, performanceMode } = use3DStore()

  // Pozisyonu doğrudan vertex'ten al - memoized
  const vertex = use3DStore(state => state.vertices.get(element.id));
  const position = useMemo(() => 
    vertex ? vertex.position : element.position,
    [vertex?.position, element.position]
  );

  // Vertex pozisyonu değiştiğinde ana sisteme aktar - throttled
  useEffect(() => {
    if (meshRef.current) {
      const meshPosition = meshRef.current.position
      element.position = {
        x: meshPosition.x,
        y: meshPosition.y,
        z: meshPosition.z
      }
      
      // Throttle export calls to prevent performance issues
      const now = Date.now()
      if (now - lastUpdateTime.current > 100) { // Max 10 updates per second
        exportVerticesToMainSystem()
        lastUpdateTime.current = now
      }
    }
  }, [element.position, exportVerticesToMainSystem])

  // Enhanced animation for selected elements - more visible
  useFrame((state) => {
    if (!meshRef.current) return
    
    const now = state.clock.elapsedTime
    if (now - lastUpdateTime.current < 0.016) return // ~60fps throttle
    
    if (isSelected) {
      // Much more visible selection animation
      const pulse = Math.sin(now * 8) * 0.3 + 1.5 // Scale between 1.2 and 1.8
      meshRef.current.scale.setScalar(pulse)
    } else {
      meshRef.current.scale.setScalar(1)
    }
    
    lastUpdateTime.current = now
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    // Only allow selection when select tool is active
    const { currentTool } = use3DStore.getState()
    if (currentTool !== "select") return
    
    // Always use multi-select when select tool is active
    const isMultiSelect = event.shiftKey || currentTool === "select"
    selectElement(element.id, isMultiSelect)
  }

  // Memoized geometry based on element type and performance mode
  const geometry = useMemo(() => {
    const lowPoly = performanceMode
    
    switch (element.type) {
      case "circle":
      case "free":
        return <sphereGeometry args={[0.1, lowPoly ? 6 : 8, lowPoly ? 6 : 8]} />
      case "square":
        return <boxGeometry args={[0.2, 0.2, 0.2]} />
      case "line":
        return <cylinderGeometry args={[0.05, 0.05, 0.2, lowPoly ? 6 : 8]} />
      default:
        return <sphereGeometry args={[0.1, lowPoly ? 6 : 8, lowPoly ? 6 : 8]} />
    }
  }, [element.type, performanceMode])

  // Enhanced material properties for better selection visibility
  const materialProps = useMemo(() => {
    if (isSelected) {
      return {
        color: "#ffffff", // Bright white for selected elements
        opacity: 1, // Full opacity
        emissive: "#00ff00", // Bright green glow
        emissiveIntensity: 0.8, // Strong glow
        metalness: 0.1,
        roughness: 0.3
      }
    }
    
    return {
      color: element.color || layer.color,
      opacity: isCurrentLayer ? layer.alpha : layer.alpha * 0.5,
      emissive: "#000000",
      emissiveIntensity: 0,
      metalness: 0.5,
      roughness: 0.7
    }
  }, [element.color, layer.color, layer.alpha, isCurrentLayer, isSelected])

  // Memoized position array
  const meshPosition = useMemo((): [number, number, number] => [
    position.x, 
    (element.yOffset || 0) + (layer.yOffset || 0), 
    position.z
  ], [position.x, position.z, element.yOffset, layer.yOffset])

  return (
    <mesh
      ref={meshRef}
      position={meshPosition}
      onClick={handleClick}
      visible={layer.visible}
      frustumCulled={true} // Enable frustum culling for better performance
    >
      {geometry}
      <meshStandardMaterial
        {...materialProps}
        transparent
      />
    </mesh>
  )
}
