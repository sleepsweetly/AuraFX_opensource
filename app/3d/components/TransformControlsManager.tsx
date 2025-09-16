"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { TransformControls } from "@react-three/drei"
import { Vector3, Object3D, Euler } from "three"
import { use3DStore } from "../store/use3DStore"

export function TransformControlsManager() {
  const {
    selectedVertices,
    selectedShapes,
    currentTool,
    vertices,
    shapes,
    updateVertex,
    updateShape,
    setTempPositions,
    setTempRotations,
    setTempScales,
    setIsTransforming,
    clearTempPositions,
    tempPositions,
    tempRotations,
    tempScales,
    applyTempTransforms,
  } = use3DStore()

  const controlsRef = useRef<any>(null)
  const dummyRef = useRef<Object3D>(new Object3D())
  const [isDragging, setIsDragging] = useState(false)
  const [startPositions, setStartPositions] = useState<Map<string, Vector3>>(new Map())
  const [startRotations, setStartRotations] = useState<Map<string, Vector3>>(new Map())
  const [startScales, setStartScales] = useState<Map<string, Vector3>>(new Map())
  const [startCenter, setStartCenter] = useState<Vector3 | null>(null)
  const [startDummyTransform, setStartDummyTransform] = useState<{position: Vector3, rotation: Vector3, scale: Vector3} | null>(null)
  
  const hasSelection = selectedVertices.length > 0 || selectedShapes.length > 0

  // Seçili objelerin merkezini hesapla ve dummy'yi oraya koy
  useEffect(() => {
    if (isDragging || !hasSelection || !dummyRef.current) return

    const positions: Vector3[] = []

    // Seçili vertex'leri ekle
    selectedVertices.forEach(id => {
      const vertex = Array.from(vertices.values()).find(v => v.id === id)
      if (vertex) {
        positions.push(new Vector3(vertex.position.x, vertex.position.y || 0, vertex.position.z))
      }
    })

    // Seçili shape'leri ekle
    selectedShapes.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        positions.push(new Vector3(shape.position.x, shape.position.y || 0, shape.position.z))
      }
    })

    if (positions.length > 0) {
      const center = new Vector3()
      positions.forEach(pos => center.add(pos))
      center.divideScalar(positions.length)
      
      dummyRef.current.position.copy(center)
      dummyRef.current.rotation.set(0, 0, 0)
      dummyRef.current.scale.set(1, 1, 1)
    }
  }, [selectedVertices, selectedShapes, vertices, shapes, hasSelection, isDragging])

  const handleDragStart = () => {
    console.log('handleDragStart called')
    setIsDragging(true)
    setIsTransforming(true)
    const positions = new Map<string, Vector3>()
    const rotations = new Map<string, Vector3>()
    const scales = new Map<string, Vector3>()

    // Seçili vertex'lerin başlangıç pozisyonlarını kaydet
    selectedVertices.forEach(id => {
      const vertex = Array.from(vertices.values()).find(v => v.id === id)
      if (vertex) {
        positions.set(id, new Vector3(vertex.position.x, vertex.position.y || 0, vertex.position.z))
      }
    })

    // Seçili shape'lerin başlangıç transformlarını kaydet
    selectedShapes.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        positions.set(id, new Vector3(shape.position.x, shape.position.y || 0, shape.position.z))
        rotations.set(id, new Vector3(shape.rotation.x, shape.rotation.y, shape.rotation.z))
        scales.set(id, new Vector3(shape.scale.x, shape.scale.y, shape.scale.z))
      }
    })

    // Başlangıç merkez pozisyonunu kaydet
    const centerPositions: Vector3[] = []
    positions.forEach(pos => centerPositions.push(pos))
    
    if (centerPositions.length > 0) {
      const center = new Vector3()
      centerPositions.forEach(pos => center.add(pos))
      center.divideScalar(centerPositions.length)
      setStartCenter(center)
    }

    // Dummy'nin başlangıç transformunu kaydet
    if (dummyRef.current) {
      setStartDummyTransform({
        position: dummyRef.current.position.clone(),
        rotation: new Vector3(dummyRef.current.rotation.x, dummyRef.current.rotation.y, dummyRef.current.rotation.z),
        scale: dummyRef.current.scale.clone()
      })
    }

    setStartPositions(positions)
    setStartRotations(rotations)
    setStartScales(scales)
    
    console.log('Drag started:', {
      selectedVertices: selectedVertices.length,
      selectedShapes: selectedShapes.length,
      startPositions: positions.size
    })
  }

  const handleObjectChange = () => {
    if (!dummyRef.current || !isDragging || !startCenter || !startDummyTransform) return

    const dummy = dummyRef.current
    const toolMode = getToolMode()
    const newTempPositions = new Map<string, Vector3>()
    const newTempRotations = new Map<string, Vector3>()
    const newTempScales = new Map<string, Vector3>()

    if (toolMode === "translate") {
      // Translate işlemi - sadece geçici pozisyonları hesapla
      const delta = dummy.position.clone().sub(startDummyTransform.position)
      
      // Vertex'lerin geçici pozisyonlarını hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedVertices.includes(id)) {
          const newPos = startPos.clone().add(delta)
          newTempPositions.set(id, newPos)
        }
      })

      // Shape'lerin geçici pozisyonlarını hesapla ve içindeki vertex'leri de hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedShapes.includes(id)) {
          const newPos = startPos.clone().add(delta)
          newTempPositions.set(id, newPos)
          
          // Bu shape'in içindeki tüm vertex'lerin geçici pozisyonlarını hesapla
          const shape = shapes.find(s => s.id === id)
          if (shape && shape.vertices) {
            shape.vertices.forEach(vertexId => {
              const vertex = Array.from(vertices.values()).find(v => v.id === vertexId)
              if (vertex) {
                const vertexStartPos = new Vector3(vertex.position.x, vertex.position.y || 0, vertex.position.z)
                const newVertexPos = vertexStartPos.clone().add(delta)
                newTempPositions.set(vertexId, newVertexPos)
              }
            })
          }
        }
      })
    } else if (toolMode === "rotate") {
      // Rotate işlemi - sadece geçici pozisyonları hesapla
      const deltaRotation = new Vector3(
        dummy.rotation.x - startDummyTransform.rotation.x,
        dummy.rotation.y - startDummyTransform.rotation.y,
        dummy.rotation.z - startDummyTransform.rotation.z
      )

      // Vertex'lerin geçici pozisyonlarını hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedVertices.includes(id)) {
          const relativePos = startPos.clone().sub(startCenter)
          const rotatedPos = relativePos.clone().applyEuler(new Euler(deltaRotation.x, deltaRotation.y, deltaRotation.z))
          const newPos = startCenter.clone().add(rotatedPos)
          newTempPositions.set(id, newPos)
        }
      })

      // Shape'lerin geçici pozisyonlarını hesapla ve içindeki vertex'leri de hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedShapes.includes(id)) {
          const relativePos = startPos.clone().sub(startCenter)
          const rotatedPos = relativePos.clone().applyEuler(new Euler(deltaRotation.x, deltaRotation.y, deltaRotation.z))
          const newPos = startCenter.clone().add(rotatedPos)
          newTempPositions.set(id, newPos)
          
          const startRot = startRotations.get(id) || new Vector3(0, 0, 0)
          const newRotation = {
            x: startRot.x + deltaRotation.x,
            y: startRot.y + deltaRotation.y,
            z: startRot.z + deltaRotation.z
          }
          newTempRotations.set(id, new Vector3(newRotation.x, newRotation.y, newRotation.z))
          
          // Bu shape'in içindeki tüm vertex'lerin geçici pozisyonlarını hesapla
          const shape = shapes.find(s => s.id === id)
          if (shape && shape.vertices) {
            shape.vertices.forEach(vertexId => {
              const vertex = Array.from(vertices.values()).find(v => v.id === vertexId)
              if (vertex) {
                const vertexStartPos = new Vector3(vertex.position.x, vertex.position.y || 0, vertex.position.z)
                const relativeVertexPos = vertexStartPos.clone().sub(startCenter)
                const rotatedVertexPos = relativeVertexPos.clone().applyEuler(new Euler(deltaRotation.x, deltaRotation.y, deltaRotation.z))
                const newVertexPos = startCenter.clone().add(rotatedVertexPos)
                newTempPositions.set(vertexId, newVertexPos)
              }
            })
          }
        }
      })
    } else if (toolMode === "scale") {
      // Scale işlemi - sadece geçici pozisyonları hesapla
      const scaleFactor = new Vector3(
        dummy.scale.x / startDummyTransform.scale.x,
        dummy.scale.y / startDummyTransform.scale.y,
        dummy.scale.z / startDummyTransform.scale.z
      )

      // Vertex'lerin geçici pozisyonlarını hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedVertices.includes(id)) {
          const relativePos = startPos.clone().sub(startCenter)
          const scaledPos = relativePos.clone().multiply(scaleFactor)
          const newPos = startCenter.clone().add(scaledPos)
          newTempPositions.set(id, newPos)
        }
      })

      // Shape'lerin geçici pozisyonlarını hesapla ve içindeki vertex'leri de hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedShapes.includes(id)) {
          const relativePos = startPos.clone().sub(startCenter)
          const scaledPos = relativePos.clone().multiply(scaleFactor)
          const newPos = startCenter.clone().add(scaledPos)
          newTempPositions.set(id, newPos)
          
          const startScale = startScales.get(id) || new Vector3(1, 1, 1)
          const newScale = {
            x: Math.max(0.1, startScale.x * scaleFactor.x),
            y: Math.max(0.1, startScale.y * scaleFactor.y),
            z: Math.max(0.1, startScale.z * scaleFactor.z)
          }
          newTempScales.set(id, new Vector3(newScale.x, newScale.y, newScale.z))
          
          // Bu shape'in içindeki tüm vertex'lerin geçici pozisyonlarını hesapla
          const shape = shapes.find(s => s.id === id)
          if (shape && shape.vertices) {
            shape.vertices.forEach(vertexId => {
              const vertex = Array.from(vertices.values()).find(v => v.id === vertexId)
              if (vertex) {
                const vertexStartPos = new Vector3(vertex.position.x, vertex.position.y || 0, vertex.position.z)
                const relativeVertexPos = vertexStartPos.clone().sub(startCenter)
                const scaledVertexPos = relativeVertexPos.clone().multiply(scaleFactor)
                const newVertexPos = startCenter.clone().add(scaledVertexPos)
                newTempPositions.set(vertexId, newVertexPos)
              }
            })
          }
        }
      })
    }

    // Geçici pozisyonları güncelle (sadece görsel güncelleme için)
    setTempPositions(newTempPositions)
    setTempRotations(newTempRotations)
    setTempScales(newTempScales)
    
    // Debug
    console.log('Transform update:', {
      isDragging,
      toolMode,
      tempPositionsCount: newTempPositions.size,
      selectedVertices: selectedVertices.length,
      selectedShapes: selectedShapes.length
    })
  }

  const handleMouseUp = useCallback(() => {
    console.log('handleMouseUp called, isDragging:', isDragging)
    
    // Mouse bırakıldığında gerçek pozisyon güncellemelerini yap
    if (isDragging && tempPositions.size > 0) {
      console.log('🚀 OPTIMIZED: Applying batch transforms for', tempPositions.size, 'items')
      
      // OPTIMIZED: Use batch update instead of individual updates
      const { applyTempTransforms } = use3DStore.getState()
      applyTempTransforms()
    }

    setIsDragging(false)
    setIsTransforming(false)
    setStartPositions(new Map())
    setStartRotations(new Map())
    setStartScales(new Map())
    setStartCenter(null)
    setStartDummyTransform(null)
    clearTempPositions()
    
    if (dummyRef.current) {
      dummyRef.current.rotation.set(0, 0, 0)
      dummyRef.current.scale.set(1, 1, 1)
    }
    
    console.log('✅ OPTIMIZED: Transform completed, cleared all temp data')
  }, [isDragging, tempPositions, tempRotations, tempScales, selectedVertices, selectedShapes, applyTempTransforms, setIsTransforming, clearTempPositions])

  // Global mouse up listener for more reliable detection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        console.log('Global mouse up detected, calling handleMouseUp')
        handleMouseUp()
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, handleMouseUp])

  const getToolMode = (): "translate" | "rotate" | "scale" => {
    if (currentTool === "move") return "translate"
    if (currentTool === "rotate") return "rotate"
    if (currentTool === "scale") return "scale"
    return "translate"
  }

  if (!hasSelection || currentTool === "select") return null

  return (
    <>
      <primitive object={dummyRef.current} />
      <TransformControls
        ref={controlsRef}
        object={dummyRef.current}
        onMouseDown={handleDragStart}
        onObjectChange={handleObjectChange}
        onMouseUp={handleMouseUp}
        mode={getToolMode()}
        space="world"
        size={0.5}
        showX={true}
        showY={true}
        showZ={true}
      />
    </>
  )
}
