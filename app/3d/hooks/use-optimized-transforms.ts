import { useCallback, useRef } from 'react'
import { use3DStore, type Vertex, type Shape } from '../store/use3DStore'
import { useBatchUpdates } from '@/hooks/use-batch-updates'

interface TransformUpdate {
  position?: { x: number; y: number; z: number }
  rotation?: { x: number; y: number; z: number }
  scale?: { x: number; y: number; z: number }
}

export function useOptimizedTransforms() {
  const { updateMultipleVertices, updateMultipleShapes } = use3DStore()
  const workerRef = useRef<Worker | null>(null)

  // Initialize worker
  const initWorker = useCallback(() => {
    if (typeof window !== 'undefined' && !workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL('../../../worker/transform-worker.ts', import.meta.url),
          { type: 'module' }
        )
      } catch (error) {
        console.warn('Transform worker not available, falling back to main thread')
      }
    }
  }, [])

  // Batch vertex updates
  const { addToBatch: addVertexUpdate, flush: flushVertexUpdates } = useBatchUpdates<Partial<Vertex>>(
    (updates) => {
      const transformUpdates = updates.map(({ id, data }) => ({
        id,
        updates: data as Partial<Vertex>
      }))
      updateMultipleVertices(transformUpdates)
    },
    { batchSize: 100, delay: 16 }
  )

  // Batch shape updates  
  const { addToBatch: addShapeUpdate, flush: flushShapeUpdates } = useBatchUpdates<Partial<Shape>>(
    (updates) => {
      const transformUpdates = updates.map(({ id, data }) => ({
        id,
        updates: data as Partial<Shape>
      }))
      updateMultipleShapes(transformUpdates)
    },
    { batchSize: 50, delay: 16 }
  )

  // Optimized transform function using worker when available
  const transformVertices = useCallback(async (
    vertexIds: string[],
    transform: TransformUpdate
  ) => {
    initWorker()
    
    if (workerRef.current && vertexIds.length > 100) {
      // Use worker for large batches
      return new Promise<void>((resolve) => {
        const vertices = vertexIds.map(id => {
          const vertex = use3DStore.getState().vertices.get(id)
          return vertex ? { id, position: vertex.position } : null
        }).filter(Boolean)

        workerRef.current!.postMessage({
          type: 'BATCH_TRANSFORM',
          data: { vertices, transform }
        })

        workerRef.current!.onmessage = (event) => {
          const { vertices: transformedVertices } = event.data
          
          // Apply results in batches
          transformedVertices.forEach((vertex: any) => {
            addVertexUpdate(vertex.id, { position: vertex.position })
          })
          
          resolve()
        }
      })
    } else {
      // Use main thread for smaller batches
      vertexIds.forEach(id => {
        const vertex = use3DStore.getState().vertices.get(id)
        if (vertex) {
          const newPosition = {
            x: vertex.position.x + (transform.position?.x || 0),
            y: vertex.position.y + (transform.position?.y || 0),
            z: vertex.position.z + (transform.position?.z || 0)
          }
          addVertexUpdate(id, { position: newPosition })
        }
      })
    }
  }, [addVertexUpdate, initWorker])

  // Rotate vertices around a point
  const rotateVerticesAroundPoint = useCallback(async (
    vertexIds: string[],
    center: { x: number; y: number; z: number },
    angle: number
  ) => {
    initWorker()
    
    if (workerRef.current && vertexIds.length > 100) {
      return new Promise<void>((resolve) => {
        const vertices = vertexIds.map(id => {
          const vertex = use3DStore.getState().vertices.get(id)
          return vertex ? { id, position: vertex.position } : null
        }).filter(Boolean)

        workerRef.current!.postMessage({
          type: 'ROTATE_VERTICES',
          data: { vertices, center, angle }
        })

        workerRef.current!.onmessage = (event) => {
          const { vertices: rotatedVertices } = event.data
          
          rotatedVertices.forEach((vertex: any) => {
            addVertexUpdate(vertex.id, { position: vertex.position })
          })
          
          resolve()
        }
      })
    } else {
      // Main thread rotation
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      
      vertexIds.forEach(id => {
        const vertex = use3DStore.getState().vertices.get(id)
        if (vertex) {
          const x = vertex.position.x - center.x
          const z = vertex.position.z - center.z
          
          const newPosition = {
            x: center.x + (x * cos - z * sin),
            y: vertex.position.y,
            z: center.z + (x * sin + z * cos)
          }
          
          addVertexUpdate(id, { position: newPosition })
        }
      })
    }
  }, [addVertexUpdate, initWorker])

  // Cleanup
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  return {
    transformVertices,
    rotateVerticesAroundPoint,
    addVertexUpdate,
    addShapeUpdate,
    flushVertexUpdates,
    flushShapeUpdates,
    cleanup
  }
}