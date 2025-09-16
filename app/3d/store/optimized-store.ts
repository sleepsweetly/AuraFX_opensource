import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

interface Vector3 {
  x: number
  y: number
  z: number
}

interface Vertex {
  id: string
  position: Vector3
  effectType: string
  layer: string
  color: string
  visible: boolean
  selected: boolean
  groupId?: string
  particle?: string
}

interface BoundingBox {
  min: Vector3
  max: Vector3
}

// Optimized 3D Store with performance improvements
interface OptimizedStore3D {
  // Core data with spatial indexing
  vertices: Map<string, Vertex>
  spatialIndex: Map<string, Set<string>> // Grid-based spatial indexing
  dirtyVertices: Set<string> // Track changed vertices
  
  // Batch operations
  batchUpdateVertices: (updates: Array<{id: string, position: Vector3}>) => void
  batchDeleteVertices: (ids: string[]) => void
  
  // Optimized selection
  selectVerticesInBounds: (bounds: BoundingBox) => string[]
  
  // Performance monitoring
  performanceStats: {
    updateTime: number
    renderTime: number
    vertexCount: number
    batchSize: number
  }
}

// Spatial indexing for fast lookups
const GRID_SIZE = 10
const getGridKey = (x: number, z: number) => 
  `${Math.floor(x / GRID_SIZE)},${Math.floor(z / GRID_SIZE)}`

export const useOptimized3DStore = create<OptimizedStore3D>()(
  subscribeWithSelector((set, get) => ({
    vertices: new Map(),
    spatialIndex: new Map(),
    dirtyVertices: new Set(),
    
    performanceStats: {
      updateTime: 0,
      renderTime: 0,
      vertexCount: 0,
      batchSize: 50
    },
    
    // Batch vertex updates - much faster than individual updates
    batchUpdateVertices: (updates) => {
      const startTime = performance.now()
      
      set((state) => {
        const newVertices = new Map(state.vertices)
        const newSpatialIndex = new Map(state.spatialIndex)
        const newDirtyVertices = new Set(state.dirtyVertices)
        
        updates.forEach(({ id, position }) => {
          const vertex = newVertices.get(id)
          if (vertex) {
            // Remove from old spatial grid
            const oldGridKey = getGridKey(vertex.position.x, vertex.position.z)
            const oldGrid = newSpatialIndex.get(oldGridKey)
            if (oldGrid) {
              oldGrid.delete(id)
              if (oldGrid.size === 0) {
                newSpatialIndex.delete(oldGridKey)
              }
            }
            
            // Update vertex
            const updatedVertex = { ...vertex, position }
            newVertices.set(id, updatedVertex)
            
            // Add to new spatial grid
            const newGridKey = getGridKey(position.x, position.z)
            if (!newSpatialIndex.has(newGridKey)) {
              newSpatialIndex.set(newGridKey, new Set())
            }
            newSpatialIndex.get(newGridKey)!.add(id)
            
            // Mark as dirty for rendering
            newDirtyVertices.add(id)
          }
        })
        
        return {
          vertices: newVertices,
          spatialIndex: newSpatialIndex,
          dirtyVertices: newDirtyVertices,
          performanceStats: {
            ...state.performanceStats,
            updateTime: performance.now() - startTime,
            vertexCount: newVertices.size
          }
        }
      })
    },
    
    // Fast spatial selection
    selectVerticesInBounds: (bounds) => {
      const { spatialIndex } = get()
      const selectedIds: string[] = []
      
      // Calculate grid range
      const minGridX = Math.floor(bounds.min.x / GRID_SIZE)
      const maxGridX = Math.floor(bounds.max.x / GRID_SIZE)
      const minGridZ = Math.floor(bounds.min.z / GRID_SIZE)
      const maxGridZ = Math.floor(bounds.max.z / GRID_SIZE)
      
      // Check only relevant grid cells
      for (let x = minGridX; x <= maxGridX; x++) {
        for (let z = minGridZ; z <= maxGridZ; z++) {
          const gridKey = `${x},${z}`
          const gridVertices = spatialIndex.get(gridKey)
          if (gridVertices) {
            gridVertices.forEach(id => selectedIds.push(id))
          }
        }
      }
      
      return selectedIds
    },
    
    // Batch delete with spatial index cleanup
    batchDeleteVertices: (ids) => {
      set((state) => {
        const newVertices = new Map(state.vertices)
        const newSpatialIndex = new Map(state.spatialIndex)
        const newDirtyVertices = new Set(state.dirtyVertices)
        
        ids.forEach(id => {
          const vertex = newVertices.get(id)
          if (vertex) {
            // Remove from spatial index
            const gridKey = getGridKey(vertex.position.x, vertex.position.z)
            const grid = newSpatialIndex.get(gridKey)
            if (grid) {
              grid.delete(id)
              if (grid.size === 0) {
                newSpatialIndex.delete(gridKey)
              }
            }
            
            // Remove vertex
            newVertices.delete(id)
            newDirtyVertices.delete(id)
          }
        })
        
        return {
          vertices: newVertices,
          spatialIndex: newSpatialIndex,
          dirtyVertices: newDirtyVertices,
          performanceStats: {
            ...state.performanceStats,
            vertexCount: newVertices.size
          }
        }
      })
    }
  }))
)