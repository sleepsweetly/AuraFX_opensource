"use client"

import React, { useRef, useCallback, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface OptimizedCanvasProps {
  elements: any[]
  performanceMode: boolean
}

// Optimized rendering with dirty flagging
export function OptimizedCanvas({ elements, performanceMode }: OptimizedCanvasProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dirtyFlags = useRef(new Set<string>())
  const lastUpdateTime = useRef(0)
  
  // Batch update system - only update changed elements
  const updateBatch = useCallback((deltaTime: number) => {
    if (!meshRef.current || dirtyFlags.current.size === 0) return
    
    // Throttle updates to 60fps max
    if (deltaTime - lastUpdateTime.current < 16) return
    
    const matrix = new THREE.Matrix4()
    let updateCount = 0
    
    // Only update dirty elements
    dirtyFlags.current.forEach(elementId => {
      const element = elements.find(el => el.id === elementId)
      if (element && updateCount < 100) { // Limit batch size
        const index = elements.indexOf(element)
        matrix.setPosition(element.position.x, element.position.y, element.position.z)
        meshRef.current!.setMatrixAt(index, matrix)
        updateCount++
      }
    })
    
    if (updateCount > 0) {
      meshRef.current.instanceMatrix.needsUpdate = true
      dirtyFlags.current.clear()
      lastUpdateTime.current = deltaTime
    }
  }, [elements])
  
  // Mark elements as dirty when they change
  const markDirty = useCallback((elementId: string) => {
    dirtyFlags.current.add(elementId)
  }, [])
  
  useFrame((state, delta) => {
    updateBatch(state.clock.elapsedTime * 1000)
  })
  
  // Memoized geometry to prevent recreation
  const geometry = useMemo(() => {
    return performanceMode 
      ? new THREE.SphereGeometry(0.5, 8, 6)  // Low poly
      : new THREE.SphereGeometry(0.5, 16, 12) // High poly
  }, [performanceMode])
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, elements.length]}
      frustumCulled={true}
    >
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  )
}