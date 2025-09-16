"use client"

import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import type { Mesh } from "three"
import { use3DStore, type Vertex } from "../store/use3DStore"
import { Euler, Vector3 as ThreeVector3 } from "three"

interface VertexRendererProps {
  vertex: Vertex
}

export function VertexRenderer({ vertex }: VertexRendererProps) {
  const meshRef = useRef<Mesh>(null)
  const { selectVertex, selectedVertices, currentTool, camera, shapes, isTransforming, tempPositions, xrayMode } = use3DStore()
  const { gl } = useThree()

  const isSelected = selectedVertices.includes(vertex.id)

  // Enhanced animation for selected vertices
  useFrame((state) => {
    if (!meshRef.current) return

    if (isSelected) {
      const now = state.clock.elapsedTime
      // More visible selection animation
      const pulse = Math.sin(now * 8) * 0.4 + 1.6 // Scale between 1.2 and 2.0
      meshRef.current.scale.setScalar(pulse)
    } else {
      meshRef.current.scale.setScalar(1)
    }
  })

  // Find parent shape if any
  const parentShape = shapes.find((s) => s.vertices.includes(vertex.id))

  // Calculate transformed position for imported shapes
  let pos = { ...vertex.position }
  if (parentShape && parentShape.type === "imported") {
    // 1. Scale
    pos = {
      x: pos.x * parentShape.scale.x,
      y: pos.y * parentShape.scale.y,
      z: pos.z * parentShape.scale.z,
    }
    // 2. Rotation (Euler)
    const v = new ThreeVector3(pos.x, pos.y, pos.z)
    v.applyEuler(new Euler(parentShape.rotation.x, parentShape.rotation.y, parentShape.rotation.z))
    // 3. Position
    pos = {
      x: v.x + parentShape.position.x,
      y: v.y + parentShape.position.y,
      z: v.z + parentShape.position.z,
    }
  }

  // Transform sırasında geçici pozisyonları kullan
  if (isTransforming && tempPositions.has(vertex.id)) {
    const tempPos = tempPositions.get(vertex.id)!
    pos = { x: tempPos.x, y: tempPos.y, z: tempPos.z }
  }

  // Simplified LOD - no FPS limiting
  const { geometry, shouldRender } = useMemo(() => {
    const distance = Math.sqrt(
      Math.pow(pos.x - camera.position.x, 2) +
      Math.pow(pos.y - camera.position.y, 2) +
      Math.pow(pos.z - camera.position.z, 2),
    )

    // Don't render if too far away
    if (distance > 100) {
      return { geometry: null, shouldRender: false }
    }

    // Use lower quality geometry for distant objects but no FPS limiting
    const segments = distance > 30 ? 4 : distance > 15 ? 6 : 8

    return {
      geometry: <sphereGeometry args={[0.05, segments, segments]} />,
      shouldRender: true,
    }
  }, [pos, camera.position])

  // Animation - no throttling, let it run at full speed
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.2 + 1
      meshRef.current.scale.setScalar(pulse)
    }
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    // Only allow selection when select tool is active
    if (currentTool !== "select") return
    
    // Always use multi-select when select tool is active
    const isMultiSelect = event.shiftKey || currentTool === "select"
    selectVertex(vertex.id, isMultiSelect)
  }

  const handlePointerOver = () => {
    // Show pointer cursor for all tools
    gl.domElement.style.cursor = "pointer"
  }

  const handlePointerOut = () => {
    gl.domElement.style.cursor = "default"
  }

  if (!vertex.visible || !shouldRender) return null

  return (
    <mesh
      ref={meshRef}
      position={[pos.x, pos.y, pos.z]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {geometry}
      <meshStandardMaterial
        color={isSelected ? "#ffffff" : (vertex.color || "#ffffff")}
        emissive={isSelected ? "#00ff00" : "#000000"}
        emissiveIntensity={isSelected ? 0.9 : 0}
        metalness={isSelected ? 0.1 : 0.5}
        roughness={isSelected ? 0.2 : 0.7}
        transparent
        opacity={xrayMode ? (isSelected ? 1 : 0.4) : (isSelected ? 1 : 0.85)}
        depthTest={!xrayMode}
        depthWrite={!xrayMode}
        wireframe={xrayMode && !isSelected}
      />
    </mesh>
  )
}
