// OPTIMIZED BATCH UPDATE FUNCTIONS FOR 3D STORE
// Bu dosya 900+ element güncellemelerinde performans sorunlarını çözer

import type { Vertex, Shape, Vector3 } from "./use3DStore"

// Batch vertex updates with performance optimization
export function createOptimizedBatchUpdater() {
  let updateQueue: Array<{ id: string; updates: Partial<Vertex> }> = []
  let isProcessing = false
  let timeoutId: NodeJS.Timeout | null = null

  const processBatch = (
    vertices: Map<string, Vertex>,
    setVertices: (vertices: Map<string, Vertex>) => void
  ) => {
    if (updateQueue.length === 0) {
      isProcessing = false
      return
    }

    const batchSize = 100 // Process 100 elements at a time
    const currentBatch = updateQueue.splice(0, batchSize)
    
    // Create new Map with updates
    const newVertices = new Map(vertices)
    currentBatch.forEach(({ id, updates }) => {
      const vertex = newVertices.get(id)
      if (vertex) {
        newVertices.set(id, { ...vertex, ...updates })
      }
    })
    
    setVertices(newVertices)

    // Continue processing remaining items
    if (updateQueue.length > 0) {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => processBatch(vertices, setVertices), { timeout: 16 })
      } else {
        setTimeout(() => processBatch(vertices, setVertices), 0)
      }
    } else {
      isProcessing = false
    }
  }

  return {
    addToQueue: (updates: Array<{ id: string; updates: Partial<Vertex> }>) => {
      updateQueue.push(...updates)
    },
    
    flush: (
      vertices: Map<string, Vertex>,
      setVertices: (vertices: Map<string, Vertex>) => void
    ) => {
      if (!isProcessing && updateQueue.length > 0) {
        isProcessing = true
        processBatch(vertices, setVertices)
      }
    },
    
    clear: () => {
      updateQueue = []
      isProcessing = false
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }
}

// Optimized transform application
export function applyTransformsBatch(
  tempPositions: Map<string, Vector3>,
  tempRotations: Map<string, Vector3>,
  tempScales: Map<string, Vector3>,
  selectedVertices: string[],
  selectedShapes: string[],
  updateVertex: (id: string, updates: Partial<Vertex>) => void,
  updateShape: (id: string, updates: Partial<Shape>) => void,
  updateVerticesBatch: (updates: Array<{ id: string; updates: Partial<Vertex> }>) => void,
  updateShapesBatch: (updates: Array<{ id: string; updates: Partial<Shape> }>) => void
) {
  console.log('🚀 Applying batch transforms:', {
    tempPositions: tempPositions.size,
    selectedVertices: selectedVertices.length,
    selectedShapes: selectedShapes.length
  })

  // Prepare batch updates
  const vertexUpdates: Array<{ id: string; updates: Partial<Vertex> }> = []
  const shapeUpdates: Array<{ id: string; updates: Partial<Shape> }> = []

  // Collect vertex updates
  tempPositions.forEach((newPos, id) => {
    if (selectedVertices.includes(id)) {
      vertexUpdates.push({
        id,
        updates: { position: { x: newPos.x, y: newPos.y, z: newPos.z } }
      })
    }
  })

  // Collect shape updates
  tempPositions.forEach((newPos, id) => {
    if (selectedShapes.includes(id)) {
      const updates: any = {
        position: { x: newPos.x, y: newPos.y, z: newPos.z }
      }
      
      // Add rotation if exists
      const newRotation = tempRotations.get(id)
      if (newRotation) {
        updates.rotation = { x: newRotation.x, y: newRotation.y, z: newRotation.z }
      }
      
      // Add scale if exists
      const newScale = tempScales.get(id)
      if (newScale) {
        updates.scale = { x: newScale.x, y: newScale.y, z: newScale.z }
      }
      
      shapeUpdates.push({ id, updates })
    }
  })

  // Apply batch updates
  if (vertexUpdates.length > 0) {
    console.log('📦 Batch updating', vertexUpdates.length, 'vertices')
    updateVerticesBatch(vertexUpdates)
  }

  if (shapeUpdates.length > 0) {
    console.log('📦 Batch updating', shapeUpdates.length, 'shapes')
    updateShapesBatch(shapeUpdates)
  }
}

// Debounced update function for real-time transforms
export function createDebouncedUpdater(delay: number = 16) {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (callback: () => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(callback, delay)
  }
}

// Performance monitoring
export function createPerformanceMonitor() {
  let startTime = 0
  let operationCount = 0
  
  return {
    start: (operation: string) => {
      startTime = performance.now()
      console.log(`⏱️ Starting ${operation}`)
    },
    
    end: (operation: string) => {
      const duration = performance.now() - startTime
      operationCount++
      console.log(`✅ ${operation} completed in ${duration.toFixed(2)}ms (operation #${operationCount})`)
      
      if (duration > 100) {
        console.warn(`⚠️ Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`)
      }
    }
  }
}