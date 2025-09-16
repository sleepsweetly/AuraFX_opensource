"use client"

import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { TransformControls } from "@react-three/drei"
import { type Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, PlaneGeometry } from "three"
import { use3DStore } from "../../store/use3DStore"

interface ParticleObject3DProps {
  object: any // Geçici olarak any, çünkü tip yok
}

export function ParticleObject3D({ object }: ParticleObject3DProps) {
  const meshRef = useRef<Mesh>(null)
  const { /* use3DStore'dan bir şey çekilmiyor */ } = use3DStore()
  const { camera, gl } = useThree()
  const [isHovered, setIsHovered] = useState(false)

  // Create geometry based on object type
  const createGeometry = () => {
    switch (object.type) {
      case "box":
        return new BoxGeometry(1, 1, 1)
      case "sphere":
        return new SphereGeometry(0.5, 16, 16)
      case "cylinder":
        return new CylinderGeometry(0.5, 0.5, 1, 16)
      case "cone":
        return new ConeGeometry(0.5, 1, 16)
      case "plane":
        return new PlaneGeometry(1, 1)
      case "point":
        return new SphereGeometry(0.1, 8, 8)
      default:
        return new BoxGeometry(1, 1, 1)
    }
  }

  if (!object.visible) {
    return null
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[
          (object.rotation.x * Math.PI) / 180,
          (object.rotation.y * Math.PI) / 180,
          (object.rotation.z * Math.PI) / 180,
        ]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
        geometry={createGeometry()}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={object.color}
          transparent={true}
          opacity={0.7}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}
