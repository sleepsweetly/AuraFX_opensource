"use client"

import { useState, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { Vector3, Raycaster, Vector2 } from "three"
import { use3DStore } from "../store/use3DStore"

export function SelectionBox() {
  const { gl, camera } = useThree()
  const { vertices, shapes, selectVertex, selectShape, clearAllSelections, currentTool, xrayMode } = use3DStore()

  const [isSelecting, setIsSelecting] = useState(false)
  const [startPoint, setStartPoint] = useState<Vector2 | null>(null)
  const [endPoint, setEndPoint] = useState<Vector2 | null>(null)
  const [isTransformControlsActive, setIsTransformControlsActive] = useState(false)

  useEffect(() => {
    const canvas = gl.domElement

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return // Only left mouse button

      // Only work when select tool is active
      if (currentTool !== "select") return

      // OPTIMIZATION: Skip expensive raycasting for single clicks
      // Let VertexRenderer components handle their own clicks for better performance

      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      // Only start drag selection, don't do raycasting for single clicks
      setStartPoint(new Vector2(mouseX, mouseY))
      setEndPoint(new Vector2(mouseX, mouseY))
      setIsSelecting(true)

      // Clear selection if not holding shift
      if (!event.shiftKey) {
        clearAllSelections()
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      // DON'T SHOW SELECTION BOX IF TRANSFORM CONTROLS ARE ACTIVE
      if (!isSelecting || !startPoint || isTransformControlsActive) return

      const rect = canvas.getBoundingClientRect()
      setEndPoint(new Vector2(event.clientX - rect.left, event.clientY - rect.top))
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (isTransformControlsActive) {
        setIsTransformControlsActive(false)
        setIsSelecting(false)
        setStartPoint(null)
        setEndPoint(null)
        return
      }

      if (!isSelecting || !startPoint || !endPoint) {
        setIsSelecting(false)
        setStartPoint(null)
        setEndPoint(null)
        return
      }

      const rect = canvas.getBoundingClientRect()

      // Ensure startPoint and endPoint are valid Vector2 objects
      if (!startPoint || !endPoint || typeof startPoint.x === 'undefined' || typeof endPoint.x === 'undefined') {
        setIsSelecting(false)
        setStartPoint(null)
        setEndPoint(null)
        return
      }

      // Calculate selection rectangle in screen space
      const minX = Math.min(startPoint.x, endPoint.x)
      const maxX = Math.max(startPoint.x, endPoint.x)
      const minY = Math.min(startPoint.y, endPoint.y)
      const maxY = Math.max(startPoint.y, endPoint.y)

      // If it's just a click (small rectangle), do single selection or clear
      if (Math.abs(maxX - minX) < 5 && Math.abs(maxY - minY) < 5) {
        // Single click selection with improved raycasting
        const mouse = new Vector2()
        mouse.x = (startPoint.x / rect.width) * 2 - 1
        mouse.y = -(startPoint.y / rect.height) * 2 + 1

        const raycaster = new Raycaster()
        raycaster.setFromCamera(mouse, camera)

        // Improved single click selection
        const vertexArray = Array.from(vertices.values())
        const intersections: Array<{ vertex: any, distance: number }> = []

        // Check all vertices for intersection with proper depth testing
        vertexArray.forEach(vertex => {
          const vertexPos = new Vector3(vertex.position.x, vertex.position.y, vertex.position.z)
          const distance = raycaster.ray.distanceToPoint(vertexPos)
          
          // Slightly more generous selection radius
          const selectionRadius = xrayMode ? 0.3 : 0.2
          
          if (distance < selectionRadius) {
            const distanceFromCamera = camera.position.distanceTo(vertexPos)
            intersections.push({ vertex, distance: distanceFromCamera })
          }
        })

        if (intersections.length > 0) {
          // Sort by distance from camera (closest first)
          intersections.sort((a, b) => a.distance - b.distance)
          
          if (xrayMode) {
            // X-ray mode: Select all intersecting vertices
            const vertexIds = intersections.map(i => i.vertex.id)
            if (event.shiftKey) {
              vertexIds.forEach(id => selectVertex(id, true))
            } else {
              clearAllSelections()
              vertexIds.forEach(id => selectVertex(id, true))
            }
          } else {
            // Normal mode: Select only the closest vertex (proper depth testing)
            const closestVertex = intersections[0].vertex
            selectVertex(closestVertex.id, event.shiftKey)
          }
        } else {
          // No vertex clicked, clear selection if not holding shift
          if (!event.shiftKey) {
            clearAllSelections()
          }
        }
      } else {
        // Box selection - optimized for large datasets (vertices only)
        let selectedVertices: any[] = []

        // Optimize: Use requestIdleCallback for large datasets
        const processSelection = () => {
          const vertexArray = Array.from(vertices.entries())
          const batchSize = Math.min(1000, Math.max(100, Math.floor(vertexArray.length / 10)))

          let processedCount = 0

          const processBatch = () => {
            const endIndex = Math.min(processedCount + batchSize, vertexArray.length)

            // Process vertices in batches
            for (let i = processedCount; i < endIndex; i++) {
              const [id, vertex] = vertexArray[i]
              const screenPos = new Vector3(vertex.position.x, vertex.position.y, vertex.position.z)
              const worldPos = screenPos.clone()
              screenPos.project(camera)

              const screenX = (screenPos.x * 0.5 + 0.5) * rect.width
              const screenY = (-screenPos.y * 0.5 + 0.5) * rect.height

              if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
                if (xrayMode) {
                  // X-Ray mode: Select all
                  selectedVertices.push(id)
                } else {
                  // Normal mode: Add with distance and world position for later filtering
                  const distance = camera.position.distanceTo(worldPos)
                  selectedVertices.push({ id, distance, worldPos })
                }
              }
            }

            processedCount = endIndex

            if (processedCount < vertexArray.length) {
              // Continue processing in next frame
              requestAnimationFrame(processBatch)
            } else {
              // Apply vertex selections only
              if (selectedVertices.length > 0) {
                if (xrayMode) {
                  // X-Ray mode: Select all vertices
                  use3DStore.getState().selectMultipleVertices(selectedVertices as string[], true)
                } else {
                  // === OPTIMIZED: O(N log N) instead of O(N²) ===
                  const candidateVertices = (selectedVertices as Array<{ id: string, distance: number, worldPos: Vector3 }>).sort((a, b) => a.distance - b.distance)
                  
                  // Instead of O(N²) occlusion culling, just take the closest elements
                  // This is much faster and still provides reasonable selection behavior
                  const visibleLimit = Math.max(50, Math.min(candidateVertices.length, candidateVertices.length / 2));
                  const visibleVertices = candidateVertices.slice(0, visibleLimit).map(v => v.id);

                  use3DStore.getState().selectMultipleVertices(visibleVertices, true)
                }
              }
            }
          }

          processBatch()
        }

        // For small datasets, process immediately
        if (vertices.size < 1000) {
          if (xrayMode) {
            // X-Ray mode: Select all vertices in box, ignore depth
            vertices.forEach((vertex, id) => {
              const screenPos = new Vector3(vertex.position.x, vertex.position.y, vertex.position.z)
              screenPos.project(camera)

              const screenX = (screenPos.x * 0.5 + 0.5) * rect.width
              const screenY = (-screenPos.y * 0.5 + 0.5) * rect.height

              if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
                selectedVertices.push(id)
              }
            })
          } else {
            // Normal mode: Improved selection with better depth handling
            const candidateVertices: Array<{ id: string, distance: number, worldPos: Vector3, screenPos: Vector3 }> = []

            // Collect candidates with their distances and world positions
            vertices.forEach((vertex, id) => {
              const worldPos = new Vector3(vertex.position.x, vertex.position.y, vertex.position.z)
              const screenPos = worldPos.clone()
              screenPos.project(camera)

              const screenX = (screenPos.x * 0.5 + 0.5) * rect.width
              const screenY = (-screenPos.y * 0.5 + 0.5) * rect.height

              if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
                const distance = camera.position.distanceTo(worldPos)
                candidateVertices.push({ id, distance, worldPos, screenPos })
              }
            })

            // Sort by distance (closest first)
            candidateVertices.sort((a, b) => a.distance - b.distance)

            // === OPTIMIZED: O(N log N) instead of O(N²) ===
            if (xrayMode) {
              // X-Ray mode: Select all candidates
              selectedVertices = candidateVertices.map(v => v.id)
            } else {
              // Normal mode: Select closest elements without expensive occlusion culling
              // This is much faster and still provides reasonable selection behavior
              const visibleLimit = Math.max(50, Math.min(candidateVertices.length, candidateVertices.length / 2));
              selectedVertices = candidateVertices.slice(0, visibleLimit).map(v => v.id);
            }
          }

          // Apply vertex selections only
          if (selectedVertices.length > 0) {
            use3DStore.getState().selectMultipleVertices(selectedVertices as string[], true)
          }
        } else {
          // For large datasets, process asynchronously
          processSelection()
        }
      }

      setIsSelecting(false)
      setStartPoint(null)
      setEndPoint(null)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    gl,
    camera,
    vertices,
    shapes,
    selectVertex,
    selectShape,
    clearAllSelections,
    isSelecting,
    startPoint,
    endPoint,
    isTransformControlsActive,
  ])

  // SELECTION BOX - Only show if not using transform controls
  useEffect(() => {
    if (!isSelecting || !startPoint || !endPoint || isTransformControlsActive) return

    const canvas = gl.domElement
    const rect = canvas.getBoundingClientRect()

    // Create or update selection box overlay
    let overlay = document.getElementById("selection-overlay") as HTMLDivElement
    if (!overlay) {
      overlay = document.createElement("div")
      overlay.id = "selection-overlay"
      overlay.style.position = "absolute"
      overlay.style.border = "2px dashed #3b82f6"
      overlay.style.backgroundColor = "rgba(59, 130, 246, 0.15)"
      overlay.style.pointerEvents = "none"
      overlay.style.zIndex = "1000"
      overlay.style.borderRadius = "4px"
      document.body.appendChild(overlay)
    }

    const minX = Math.min(startPoint.x, endPoint.x)
    const maxX = Math.max(startPoint.x, endPoint.x)
    const minY = Math.min(startPoint.y, endPoint.y)
    const maxY = Math.max(startPoint.y, endPoint.y)

    overlay.style.left = `${rect.left + minX}px`
    overlay.style.top = `${rect.top + minY}px`
    overlay.style.width = `${maxX - minX}px`
    overlay.style.height = `${maxY - minY}px`
    overlay.style.display = "block"

    return () => {
      if (overlay) {
        overlay.style.display = "none"
      }
    }
  }, [isSelecting, startPoint, endPoint, gl, isTransformControlsActive])

  // Cleanup overlay on unmount
  useEffect(() => {
    return () => {
      const overlay = document.getElementById("selection-overlay")
      if (overlay) {
        overlay.remove()
      }
    }
  }, [])

  return null
}
