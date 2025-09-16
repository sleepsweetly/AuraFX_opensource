"use client"

import { useRef } from "react"
import type { Mesh } from "three"
import { use3DStore, type Shape } from "../store/use3DStore"

interface ShapeRendererProps {
  shape: Shape
}

export function ShapeRenderer({ shape }: ShapeRendererProps) {
  const meshRef = useRef<Mesh>(null)
  const { selectShape, selectedShapes, currentTool, isTransforming, tempPositions, tempRotations, tempScales, xrayMode } = use3DStore()

  const isSelected = selectedShapes.includes(shape.id)

  // Transform sırasında geçici pozisyonları kullan
  const position = isTransforming && tempPositions.has(shape.id) 
    ? tempPositions.get(shape.id)! 
    : shape.position

  const rotation = isTransforming && tempRotations.has(shape.id)
    ? tempRotations.get(shape.id)!
    : shape.rotation

  const scale = isTransforming && tempScales.has(shape.id)
    ? tempScales.get(shape.id)!
    : shape.scale

  const getGeometry = () => {
    switch (shape.type) {
      case "cube":
        return <boxGeometry args={[shape.scale.x, shape.scale.y, shape.scale.z]} />
      case "sphere":
        return <sphereGeometry args={[shape.scale.x * 0.5, 16, 16]} />
      case "circle":
        return <ringGeometry args={[shape.scale.x * 0.4, shape.scale.x * 0.5, 32]} />
      case "line":
        return <boxGeometry args={[shape.lineLength || 2, 0.05, 0.05]} />
      case "imported":
        return null;
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }

  const geometry = getGeometry();
  if (!geometry) return null;

  const handleClick = (event: any) => {
    event.stopPropagation()
    // Only allow selection when select tool is active
    if (currentTool !== "select") return
    
    selectShape(shape.id, event.shiftKey)
  }

  if (!shape.visible) return null

  // X-Ray modunda shape'leri gösterme, sadece vertex'leri göster
  if (xrayMode) return null

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
      onClick={handleClick}
    >
      {geometry}
      <meshStandardMaterial
        color={isSelected ? "#00ff00" : (shape.color || "#ffffff")}
        transparent
        opacity={isSelected ? 0.8 : 0.3}
        wireframe={isSelected}
      />
    </mesh>
  )
}
