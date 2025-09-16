"use client"

import { use3DStore } from "../store/use3DStore"
import { useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import { useCallback } from "react"

// Global tip tanımı
declare global {
  interface Window {
    _zoomCamera?: {
      zoomIn: () => void
      zoomOut: () => void
    }
  }
}

// Canvas içinde çalışacak zoom mantığı
export function ZoomLogic() {
  const { camera } = useThree()
  const { updateCamera } = use3DStore()

  // Global window nesnesine zoom fonksiyonlarını ekle
  window._zoomCamera = {
    zoomIn: () => {
      const currentPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z)
      const targetPosition = new Vector3(0, 0, 0)
      
      const distance = currentPosition.distanceTo(targetPosition)
      const zoomSpeed = distance * 0.2
      
      const direction = currentPosition.clone().sub(targetPosition).normalize()
      const newPosition = currentPosition.clone().sub(direction.multiplyScalar(zoomSpeed))
      
      camera.position.copy(newPosition)
      camera.lookAt(targetPosition)
      
      updateCamera({
        position: {
          x: newPosition.x,
          y: newPosition.y,
          z: newPosition.z
        }
      })
    },
    zoomOut: () => {
      const currentPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z)
      const targetPosition = new Vector3(0, 0, 0)
      
      const distance = currentPosition.distanceTo(targetPosition)
      const zoomSpeed = distance * 0.2
      
      const direction = currentPosition.clone().sub(targetPosition).normalize()
      const newPosition = currentPosition.clone().add(direction.multiplyScalar(zoomSpeed))
      
      camera.position.copy(newPosition)
      camera.lookAt(targetPosition)
      
      updateCamera({
        position: {
          x: newPosition.x,
          y: newPosition.y,
          z: newPosition.z
        }
      })
    }
  }

  return null
}

// Canvas dışında çalışacak butonlar
export function ZoomControls() {
  const handleZoomIn = useCallback(() => {
    window._zoomCamera?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    window._zoomCamera?.zoomOut()
  }, [])

  return (
    <div className="absolute top-20 right-4 flex flex-col gap-2 z-10">
      <button
        onClick={handleZoomIn}
        className="w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
        title="Zoom In (+)"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
        title="Zoom Out (-)"
      >
        -
      </button>
    </div>
  )
} 