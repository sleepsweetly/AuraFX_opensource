"use client"

import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { Vector2, Vector3, Spherical } from "three"
import { use3DStore } from "../store/use3DStore"

export function BlenderCameraControls() {
  const { gl, camera } = useThree()
  const { updateCamera } = use3DStore()

  const isOrbiting = useRef(false)
  const isPanning = useRef(false)
  const isZooming = useRef(false)
  const lastMouse = useRef(new Vector2())
  const cameraTarget = useRef(new Vector3(0, 0, 0))

  useEffect(() => {
    const canvas = gl.domElement

    let isDragging = false

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 1) return // Only middle mouse button
      if (event.altKey) return // Skip if Alt is pressed (for MiddleMouseRotate)

      event.preventDefault()
      event.stopPropagation()

      const rect = canvas.getBoundingClientRect()
      lastMouse.current.set(event.clientX - rect.left, event.clientY - rect.top)

      if (event.shiftKey) {
        isPanning.current = true
        canvas.style.cursor = "move"
      } else if (event.ctrlKey) {
        isZooming.current = true
        canvas.style.cursor = "ns-resize"
      } else {
        isOrbiting.current = true
        canvas.style.cursor = "grab"
      }
      isDragging = true
      window.addEventListener("mousemove", handleMouseMove, true)
      window.addEventListener("mouseup", handleMouseUp, true)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const currentMouse = new Vector2(event.clientX - rect.left, event.clientY - rect.top)
      const deltaX = currentMouse.x - lastMouse.current.x
      const deltaY = currentMouse.y - lastMouse.current.y

      if (isOrbiting.current) {
        const orbitFactor = 0.005
        const spherical = new Spherical()
        const target = cameraTarget.current

        const offset = new Vector3().subVectors(camera.position, target)
        spherical.setFromVector3(offset)

        const radius = spherical.radius
        spherical.theta -= deltaX * orbitFactor
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY * orbitFactor))
        spherical.radius = radius

        offset.setFromSpherical(spherical)
        camera.position.copy(target).add(offset)
        camera.lookAt(target)

        updateCamera({
          position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          target: { x: target.x, y: target.y, z: target.z },
        })
      } else if (isPanning.current) {
        const distance = camera.position.distanceTo(cameraTarget.current)
        const panSpeed = distance * 0.001

        const right = new Vector3()
        const up = new Vector3()

        camera.getWorldDirection(new Vector3())
        right.setFromMatrixColumn(camera.matrix, 0)
        up.setFromMatrixColumn(camera.matrix, 1)

        const panOffset = new Vector3()
        panOffset.addScaledVector(right, -deltaX * panSpeed)
        panOffset.addScaledVector(up, deltaY * panSpeed)

        camera.position.add(panOffset)
        cameraTarget.current.add(panOffset)
        camera.lookAt(cameraTarget.current)

        updateCamera({
          position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          target: { x: cameraTarget.current.x, y: cameraTarget.current.y, z: cameraTarget.current.z },
        })
      } else if (isZooming.current) {
        const distance = camera.position.distanceTo(cameraTarget.current)
        const zoomSpeed = distance * 0.002

        const forward = new Vector3()
        camera.getWorldDirection(forward)

        const zoomOffset = forward.multiplyScalar(-deltaY * zoomSpeed)
        camera.position.add(zoomOffset)
        camera.lookAt(cameraTarget.current)

        updateCamera({
          position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          target: { x: cameraTarget.current.x, y: cameraTarget.current.y, z: cameraTarget.current.z },
        })
      }

      lastMouse.current.copy(currentMouse)
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button !== 1) return

      isOrbiting.current = false
      isPanning.current = false
      isZooming.current = false
      canvas.style.cursor = "default"
      isDragging = false
      window.removeEventListener("mousemove", handleMouseMove, true)
      window.removeEventListener("mouseup", handleMouseUp, true)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()

      const distance = camera.position.distanceTo(cameraTarget.current)
      const zoomSpeed = distance * 0.001

      const forward = new Vector3()
      camera.getWorldDirection(forward)

      const zoomOffset = forward.multiplyScalar(-event.deltaY * zoomSpeed)
      camera.position.add(zoomOffset)
      camera.lookAt(cameraTarget.current)

      updateCamera({
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        target: { x: cameraTarget.current.x, y: cameraTarget.current.y, z: cameraTarget.current.z },
      })
    }

    const handleContextMenu = (event: MouseEvent) => {
      if (event.button === 1) {
        event.preventDefault()
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown, { capture: true })
    canvas.addEventListener("wheel", handleWheel, { passive: false })
    canvas.addEventListener("contextmenu", handleContextMenu)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("mousemove", handleMouseMove, true)
      window.removeEventListener("mouseup", handleMouseUp, true)
    }
  }, [gl, camera, updateCamera])

  return null
}
