"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

interface LODSystemProps {
  elements: any[]
  maxDistance: number
  performanceMode: boolean
}

// Level of Detail system for 3D elements
export function LODSystem({ elements, maxDistance = 50, performanceMode }: LODSystemProps) {
  const { camera } = useThree()
  
  // Categorize elements by distance from camera
  const categorizedElements = useMemo(() => {
    const cameraPosition = camera.position
    
    return elements.map(element => {
      const distance = cameraPosition.distanceTo(
        new THREE.Vector3(element.position.x, element.position.y || 0, element.position.z)
      )
      
      let lodLevel: 'high' | 'medium' | 'low' | 'culled'
      
      if (distance < maxDistance * 0.3) {
        lodLevel = 'high'
      } else if (distance < maxDistance * 0.6) {
        lodLevel = 'medium'
      } else if (distance < maxDistance) {
        lodLevel = 'low'
      } else {
        lodLevel = 'culled' // Don't render at all
      }
      
      return {
        ...element,
        distance,
        lodLevel
      }
    }).filter(el => el.lodLevel !== 'culled') // Remove culled elements
  }, [elements, camera.position, maxDistance])
  
  // Group elements by LOD level for batch rendering
  const lodGroups = useMemo(() => {
    const groups = {
      high: [] as any[],
      medium: [] as any[],
      low: [] as any[]
    }
    
    categorizedElements.forEach(element => {
      if (element.lodLevel !== 'culled') {
        const level = element.lodLevel as keyof typeof groups
        groups[level].push(element)
      }
    })
    
    return groups
  }, [categorizedElements])
  
  return (
    <>
      {/* High detail elements (close to camera) */}
      {lodGroups.high.map(element => (
        <mesh key={`high-${element.id}`} position={[element.position.x, element.position.y || 0, element.position.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={element.color} />
        </mesh>
      ))}
      
      {/* Medium detail elements */}
      {lodGroups.medium.map(element => (
        <mesh key={`medium-${element.id}`} position={[element.position.x, element.position.y || 0, element.position.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={element.color} />
        </mesh>
      ))}
      
      {/* Low detail elements (far from camera) */}
      {lodGroups.low.map(element => (
        <mesh key={`low-${element.id}`} position={[element.position.x, element.position.y || 0, element.position.z]}>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial color={element.color} />
        </mesh>
      ))}
      
      {/* Performance mode: Use instanced rendering for low detail elements */}
      {performanceMode && lodGroups.low.length > 100 && (
        <InstancedLODMesh elements={lodGroups.low} />
      )}
    </>
  )
}

// Instanced mesh for rendering many low-detail elements efficiently
function InstancedLODMesh({ elements }: { elements: any[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  useFrame(() => {
    if (!meshRef.current) return
    
    const matrix = new THREE.Matrix4()
    elements.forEach((element, index) => {
      matrix.setPosition(element.position.x, element.position.y || 0, element.position.z)
      meshRef.current!.setMatrixAt(index, matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, elements.length]}>
      <sphereGeometry args={[0.1, 4, 4]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  )
}