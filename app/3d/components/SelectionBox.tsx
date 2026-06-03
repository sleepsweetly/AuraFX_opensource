"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useThree } from "@react-three/fiber"
import { Vector3, Raycaster, Vector2 } from "three"
import { use3DStore } from "../store/use3DStore"

export function SelectionBox() {
  const { gl, camera } = useThree()
  // OPTIMIZATION: Only subscribe to minimal state
  const currentTool = use3DStore((state) => state.currentTool)
  const xrayMode = use3DStore((state) => state.xrayMode)

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
        use3DStore.getState().clearAllSelections()
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

        // OPTIMIZATION: Get vertices from store
        const store = use3DStore.getState()
        const vertices = store.vertices

        // OPTIMIZATION: Early exit if no vertices
        if (vertices.size === 0) {
          if (!event.shiftKey) store.clearAllSelections()
          setIsSelecting(false)
          setStartPoint(null)
          setEndPoint(null)
          return
        }

        // OPTIMIZATION: Use Array.from once, not creating new array in loop
        const vertexArray = Array.from(vertices.values())
        const intersections: Array<{ vertexId: string, distance: number }> = []
        const selectionRadius = xrayMode ? 0.3 : 0.2

        // Check all vertices for intersection with proper depth testing
        for (let i = 0; i < vertexArray.length; i++) {
          const vertex = vertexArray[i]
          const vertexPos = new Vector3(vertex.position.x, vertex.position.y, vertex.position.z)
          const rayDistance = raycaster.ray.distanceToPoint(vertexPos)
          
          if (rayDistance < selectionRadius) {
            const distanceFromCamera = camera.position.distanceTo(vertexPos)
            intersections.push({ vertexId: vertex.id, distance: distanceFromCamera })
          }
        }

        if (intersections.length > 0) {
          // Sort by distance from camera (closest first)
          intersections.sort((a, b) => a.distance - b.distance)
          
          if (xrayMode) {
            // X-ray mode: Select all intersecting vertices
            const vertexIds = intersections.map(i => i.vertexId)
            if (event.shiftKey) {
              vertexIds.forEach(id => store.selectVertex(id, true))
            } else {
              store.clearAllSelections()
              vertexIds.forEach(id => store.selectVertex(id, true))
            }
          } else {
            // Normal mode: Select only the closest vertex (proper depth testing)
            const closestVertexId = intersections[0].vertexId
            store.selectVertex(closestVertexId, event.shiftKey)
          }
        } else {
          // No vertex clicked, clear selection if not holding shift
          if (!event.shiftKey) {
            store.clearAllSelections()
          }
        }
      } else {
        // Box selection - optimized for large datasets (vertices only)
        let selectedVertices: any[] = []

        // OPTIMIZATION: Get store once
        const store = use3DStore.getState()
        const vertices = store.vertices

        // OPTIMIZATION: Use requestAnimationFrame for smoother experience
        const processSelection = () => {
          const vertexArray = Array.from(vertices.entries())
          // OPTIMIZATION: Larger batch size for better performance
          const batchSize = Math.min(2000, Math.max(500, Math.floor(vertexArray.length / 5)))

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
                  // Normal mode: Add with distance for later filtering
                  const distance = camera.position.distanceTo(worldPos)
                  selectedVertices.push({ id, distance })
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
                  store.selectMultipleVertices(selectedVertices as string[], true)
                } else {
                  // OPTIMIZATION: O(N log N) sort and slice - much faster than O(N²)
                  const candidateVertices = (selectedVertices as Array<{ id: string, distance: number }>).sort((a, b) => a.distance - b.distance)
                  
                  // Take closest half or at least 50 elements
                  const visibleLimit = Math.max(50, Math.min(candidateVertices.length, Math.floor(candidateVertices.length / 2)));
                  const visibleVertices = candidateVertices.slice(0, visibleLimit).map(v => v.id);

                  store.selectMultipleVertices(visibleVertices, true)
                }
              }
            }
          }

          processBatch()
        }

        // OPTIMIZATION: Increase threshold for immediate processing
        if (vertices.size < 5000) {
          // OPTIMIZATION: Use single loop for both modes
          const candidateVertices: Array<{ id: string, distance: number }> = []

          vertices.forEach((vertex, id) => {
            const worldPos = new Vector3(vertex.position.x, vertex.position.y, vertex.position.z)
            const screenPos = worldPos.clone()
            screenPos.project(camera)

            const screenX = (screenPos.x * 0.5 + 0.5) * rect.width
            const screenY = (-screenPos.y * 0.5 + 0.5) * rect.height

            if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
              if (xrayMode) {
                // X-Ray mode: Just collect IDs
                selectedVertices.push(id)
              } else {
                // Normal mode: Collect with distance
                const distance = camera.position.distanceTo(worldPos)
                candidateVertices.push({ id, distance })
              }
            }
          })

          // Apply selection based on mode
          if (xrayMode) {
            // X-Ray mode: Select all
            if (selectedVertices.length > 0) {
              store.selectMultipleVertices(selectedVertices as string[], true)
            }
          } else {
            // Normal mode: Sort and take closest
            if (candidateVertices.length > 0) {
              candidateVertices.sort((a, b) => a.distance - b.distance)
              const visibleLimit = Math.max(50, Math.min(candidateVertices.length, Math.floor(candidateVertices.length / 2)));
              const visibleVertices = candidateVertices.slice(0, visibleLimit).map(v => v.id);
              store.selectMultipleVertices(visibleVertices, true)
            }
          }
        } else {
          // For large datasets (5000+), process asynchronously
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
    currentTool,
    isSelecting,
    startPoint,
    endPoint,
    isTransformControlsActive,
    xrayMode,
    // OPTIMIZATION: Removed vertices, shapes, selectVertex, etc - they cause re-creation of handlers
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
