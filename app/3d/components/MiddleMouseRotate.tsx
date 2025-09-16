"use client"

import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { Vector2, Euler, Vector3 } from "three"
import { use3DStore } from "../store/use3DStore"

export function MiddleMouseRotate() {
  const { gl, camera } = useThree()
  const { selectedVertices, selectedShapes, vertices, shapes, updateVertex, updateShape } = use3DStore()

  const isRotating = useRef(false)
  const lastMouse = useRef(new Vector2())
  const rotationCenter = useRef(new Vector3())

  useEffect(() => {
    const canvas = gl.domElement

    const getSelectionCenter = () => {
      const allPositions: Array<{ x: number; y: number; z: number }> = []

      selectedVertices.forEach((id) => {
        const vertex = Array.from(vertices.values()).find((v) => v.id === id)
        if (vertex) allPositions.push(vertex.position)
      })

      selectedShapes.forEach((id) => {
        const shape = Array.from(shapes.values()).find((s) => s.id === id)
        if (shape) allPositions.push(shape.position)
      })

      if (allPositions.length === 0) return { x: 0, y: 0, z: 0 }

      const center = allPositions.reduce(
        (acc, pos) => ({
          x: acc.x + pos.x,
          y: acc.y + pos.y,
          z: acc.z + pos.z,
        }),
        { x: 0, y: 0, z: 0 },
      )

      return {
        x: center.x / allPositions.length,
        y: center.y / allPositions.length,
        z: center.z / allPositions.length,
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 1) return // Only middle mouse button
      if (!event.altKey) return // Only when Alt key is pressed
      if (selectedVertices.length === 0 && selectedShapes.length === 0) return

      event.preventDefault()
      isRotating.current = true

      const rect = canvas.getBoundingClientRect()
      lastMouse.current.set(event.clientX - rect.left, event.clientY - rect.top)

      // Calculate rotation center
      const center = getSelectionCenter()
      rotationCenter.current.set(center.x, center.y, center.z)

      canvas.style.cursor = "grabbing"
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isRotating.current) return

      const rect = canvas.getBoundingClientRect()
      const currentMouse = new Vector2(event.clientX - rect.left, event.clientY - rect.top)

      const deltaX = (currentMouse.x - lastMouse.current.x) * 0.01
      const deltaY = (currentMouse.y - lastMouse.current.y) * 0.01

      // Create rotation around Y and X axes
      const rotationY = new Euler(0, -deltaX, 0)
      const rotationX = new Euler(-deltaY, 0, 0)

      // Rotate selected vertices
      selectedVertices.forEach((id) => {
        const vertex = Array.from(vertices.values()).find((v) => v.id === id)
        if (!vertex) return

        const pos = new Vector3(vertex.position.x, vertex.position.y, vertex.position.z)

        // Translate to rotation center
        pos.sub(rotationCenter.current)

        // Apply rotations
        pos.applyEuler(rotationY)
        pos.applyEuler(rotationX)

        // Translate back
        pos.add(rotationCenter.current)

        updateVertex(id, {
          position: { x: pos.x, y: pos.y, z: pos.z },
        })
      })

      // Rotate selected shapes
      selectedShapes.forEach((id) => {
        const shape = Array.from(shapes.values()).find((s) => s.id === id)
        if (!shape) return

        const pos = new Vector3(shape.position.x, shape.position.y, shape.position.z)

        // Translate to rotation center
        pos.sub(rotationCenter.current)

        // Apply rotations
        pos.applyEuler(rotationY)
        pos.applyEuler(rotationX)

        // Translate back
        pos.add(rotationCenter.current)

        // Also rotate the shape itself
        const newRotation = {
          x: shape.rotation.x - deltaY,
          y: shape.rotation.y - deltaX,
          z: shape.rotation.z,
        }

        updateShape(id, {
          position: { x: pos.x, y: pos.y, z: pos.z },
          rotation: newRotation,
        })
      })

      lastMouse.current.copy(currentMouse)
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button !== 1) return

      isRotating.current = false
      canvas.style.cursor = "default"
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
    }
  }, [gl, selectedVertices, selectedShapes, vertices, shapes, updateVertex, updateShape])

  return null
}
