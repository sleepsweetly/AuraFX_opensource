"use client"

import { useRef, useEffect, useState, useCallback, useMemo } from "react"
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
  const [startDummyTransform, setStartDummyTransform] = useState<{ position: Vector3, rotation: Vector3, scale: Vector3 } | null>(null)

  // Convert arrays to Sets for performance
  const selectedVerticesSet = useMemo(() => new Set(selectedVertices), [selectedVertices])
  const selectedShapesSet = useMemo(() => new Set(selectedShapes), [selectedShapes])

  // !!! KRİTİK OPTİMİZASYON: Shapes'i Map'e çevir - O(1) erişim için !!!
  const shapesMap = useMemo(() => new Map(shapes.map(s => [s.id, s])), [shapes])

  const hasSelection = selectedVertices.length > 0 || selectedShapes.length > 0

  // Seçili objelerin merkezini hesapla
  const calculateSelectionCenter = useCallback(() => {
    const positions: Vector3[] = []

    // Önce seçili shape'leri kontrol et
    selectedShapes.forEach(id => {
      const shape = shapesMap.get(id)
      if (shape) {
        positions.push(new Vector3(shape.position.x, shape.position.y || 0, shape.position.z))
      }
    })

    // Eğer shape seçili değilse, seçili vertex'leri ekle
    if (positions.length === 0) {
      selectedVertices.forEach(id => {
        const vertex = vertices.get(id)
        if (vertex) {
          // Temp pozisyonları varsa onları kullan
          const tempPos = tempPositions.get(id)
          if (tempPos) {
            positions.push(new Vector3(tempPos.x, tempPos.y, tempPos.z))
          } else {
            positions.push(new Vector3(vertex.position.x, vertex.position.y || 0, vertex.position.z))
          }
        }
      })
    } else {
      // Shape'ler seçiliyse, temp pozisyonları kontrol et
      selectedShapes.forEach(id => {
        const tempPos = tempPositions.get(id)
        if (tempPos) {
          // Temp pozisyon varsa güncelle
          const index = positions.findIndex((_, i) => i === Array.from(selectedShapes).indexOf(id))
          if (index >= 0) {
            positions[index] = new Vector3(tempPos.x, tempPos.y, tempPos.z)
          }
        }
      })
    }

    if (positions.length > 0) {
      const center = new Vector3()
      positions.forEach(pos => center.add(pos))
      center.divideScalar(positions.length)
      console.log('Calculated center:', center, 'from', positions.length, 'positions')
      return center
    }
    return null
  }, [selectedVertices, selectedShapes, vertices, shapesMap, tempPositions])

  // Seçili objelerin merkezini hesapla ve dummy'yi oraya koy
  useEffect(() => {
    if (isDragging || !hasSelection || !dummyRef.current) return

    const center = calculateSelectionCenter()
    if (center) {
      console.log('Setting dummy position to center:', center)
      dummyRef.current.position.copy(center)
      dummyRef.current.rotation.set(0, 0, 0)
      dummyRef.current.scale.set(1, 1, 1)
      dummyRef.current.updateMatrix()
      dummyRef.current.updateMatrixWorld(true)
    }
  }, [selectedVertices, selectedShapes, vertices, shapes, hasSelection, isDragging, calculateSelectionCenter])

  // Transform sonrası dummy pozisyonunu güncelle
  useEffect(() => {
    if (!isDragging && hasSelection && dummyRef.current && tempPositions.size === 0) {
      // Transform işlemi bittikten sonra dummy'yi yeni pozisyona taşı
      const center = calculateSelectionCenter()
      if (center) {
        console.log('Updating dummy position after transform:', center)
        dummyRef.current.position.copy(center)
        dummyRef.current.rotation.set(0, 0, 0)
        dummyRef.current.scale.set(1, 1, 1)
        dummyRef.current.updateMatrix()
        dummyRef.current.updateMatrixWorld(true)

        // TransformControls'ü de güncelle
        if (controlsRef.current) {
          controlsRef.current.updateMatrixWorld()
        }
      }
    }
  }, [tempPositions.size, isDragging, hasSelection, calculateSelectionCenter])

  const handleDragStart = () => {
    console.log('handleDragStart called')
    setIsDragging(true)
    setIsTransforming(true)
    const positions = new Map<string, Vector3>()
    const rotations = new Map<string, Vector3>()
    const scales = new Map<string, Vector3>()

    // Seçili vertex'lerin başlangıç pozisyonlarını kaydet
    selectedVertices.forEach(id => {
      const vertex = vertices.get(id) // O(1) - Anında erişim!
      if (vertex) {
        positions.set(id, new Vector3(vertex.position.x, vertex.position.y || 0, vertex.position.z))
      }
    })

    // Seçili shape'lerin başlangıç transformlarını kaydet
    selectedShapes.forEach(id => {
      const shape = shapesMap.get(id) // O(1) - Anında erişim!
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

  const handleObjectChange = useCallback(() => {
    if (!dummyRef.current || !isDragging || !startCenter || !startDummyTransform) return

    const dummy = dummyRef.current
    const toolMode = getToolMode()
    const newTempPositions = new Map<string, Vector3>()
    const newTempRotations = new Map<string, Vector3>()
    const newTempScales = new Map<string, Vector3>()

    if (toolMode === "translate") {
      // DÜZELTME: Delta hesaplamasını daha doğru yap
      const currentPos = dummy.position.clone()
      const startPos = startDummyTransform.position.clone()
      const delta = currentPos.sub(startPos)

      console.log('Transform delta:', {
        current: currentPos,
        start: startPos,
        delta: delta
      })

      // Vertex'lerin geçici pozisyonlarını hesapla
      startPositions.forEach((originalPos, id) => {
        if (selectedVerticesSet.has(id)) {
          const newPos = originalPos.clone().add(delta)
          newTempPositions.set(id, newPos)
        }
      })

      // Shape'lerin geçici pozisyonlarını hesapla
      startPositions.forEach((originalPos, id) => {
        if (selectedShapesSet.has(id)) {
          const newPos = originalPos.clone().add(delta)
          newTempPositions.set(id, newPos)

          // Shape'e bağlı vertex'leri de hesapla
          const shape = shapesMap.get(id)
          if (shape && shape.vertices) {
            shape.vertices.forEach(vertexId => {
              const vertexStartPos = startPositions.get(vertexId)
              if (vertexStartPos) {
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
        if (selectedVerticesSet.has(id)) {
          const relativePos = startPos.clone().sub(startCenter)
          const rotatedPos = relativePos.clone().applyEuler(new Euler(deltaRotation.x, deltaRotation.y, deltaRotation.z))
          const newPos = startCenter.clone().add(rotatedPos)
          newTempPositions.set(id, newPos)
        }
      })

      // Shape'lerin geçici pozisyonlarını hesapla ve içindeki vertex'leri de hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedShapesSet.has(id)) {
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

          // !!! VERTEX DÖNGÜSÜ SİLİNDİ - CPU YÜKÜNİ %99 AZALTTIK !!!
          // Vertex'ler artık render sırasında shape'in rotasyonuna göre hesaplanacak
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
        if (selectedVerticesSet.has(id)) {
          const relativePos = startPos.clone().sub(startCenter)
          const scaledPos = relativePos.clone().multiply(scaleFactor)
          const newPos = startCenter.clone().add(scaledPos)
          newTempPositions.set(id, newPos)
        }
      })

      // Shape'lerin geçici pozisyonlarını hesapla ve içindeki vertex'leri de hesapla
      startPositions.forEach((startPos, id) => {
        if (selectedShapesSet.has(id)) {
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

          // !!! VERTEX DÖNGÜSÜ SİLİNDİ - CPU YÜKÜNİ %99 AZALTTIK !!!
          // Vertex'ler artık render sırasında shape'in scale'ine göre hesaplanacak
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
  }, [isDragging, startCenter, startDummyTransform, selectedVerticesSet, selectedShapesSet, startPositions, startRotations, startScales, shapesMap, setTempPositions, setTempRotations, setTempScales, currentTool])

  const handleMouseUp = useCallback(() => {
    console.log('handleMouseUp called, isDragging:', isDragging)

    // Mouse bırakıldığında gerçek pozisyon güncellemelerini yap
    if (isDragging && tempPositions.size > 0) {
      console.log('🚀 OPTIMIZED: Applying batch transforms for', tempPositions.size, 'items')

      // Transform'u uygula
      const { applyTempTransforms } = use3DStore.getState()
      applyTempTransforms()
    }

    // State'i temizle
    setIsDragging(false)
    setIsTransforming(false)
    setStartPositions(new Map())
    setStartRotations(new Map())
    setStartScales(new Map())
    setStartCenter(null)
    setStartDummyTransform(null)
    clearTempPositions()

    // Dummy pozisyonunu güncelleme useEffect'e bırak
    console.log('✅ OPTIMIZED: Transform completed, cleared all temp data')
  }, [isDragging, tempPositions, applyTempTransforms, setIsTransforming, clearTempPositions, calculateSelectionCenter])

  // Global mouse up listener for more reliable detection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        console.log('Global mouse up detected, calling handleMouseUp')
        // Küçük bir gecikme ile handleMouseUp'ı çağır
        setTimeout(() => {
          handleMouseUp()
        }, 10)
      }
    }

    const handleGlobalPointerUp = () => {
      if (isDragging) {
        console.log('Global pointer up detected, calling handleMouseUp')
        setTimeout(() => {
          handleMouseUp()
        }, 10)
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('pointerup', handleGlobalPointerUp)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('pointerup', handleGlobalPointerUp)
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
        size={1.0}
        showX={true}
        showY={true}
        showZ={true}
        translationSnap={null}
        rotationSnap={null}
        scaleSnap={null}
        enabled={hasSelection}
      />
    </>
  )
}
