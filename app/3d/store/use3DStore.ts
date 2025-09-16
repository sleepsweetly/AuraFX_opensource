import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"
import type { Layer, Element } from "@/types"
enableMapSet()

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Vertex {
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

export interface Shape {
  id: string
  type: "cube" | "sphere" | "circle" | "line" | "imported"
  position: Vector3
  rotation: Vector3
  scale: Vector3
  vertices: string[]
  visible: boolean
  selected: boolean
  elementCount?: number
  radius?: number
  lineLength?: number
  particle?: string
  name?: string
  color?: string
}

export interface CameraState {
  position: Vector3
  target: Vector3
  isPerspective: boolean
}

export interface SceneSettings {
  showGrid: boolean
  showAxes: boolean
  gridSize: number
  snapToGrid: boolean
  gridOpacity: number
}

// Optimized History Entry
interface HistoryEntry {
  vertices: [string, Vertex][];
  shapes: Shape[];
  layers: Layer[];
  timestamp: number;
}

interface Store3D {
  // Core Data - Changed to Map for O(1) lookup
  vertices: Map<string, Vertex>
  shapes: Shape[]
  layers: Layer[]

  // Selection & UI State
  selectedVertices: string[]
  selectedShapes: string[]
  currentTool: "select" | "move" | "rotate" | "scale"
  transformMode: "translate" | "rotate" | "scale"

  // Transform state for multi-selection
  transformCenter?: Vector3
  initialTransformPositions?: {
    vertices: Array<{ id: string; position: Vector3 }>
    shapes: Array<{ id: string; position: Vector3; rotation: Vector3; scale: Vector3 }>
  }

  // Temporary positions for performance optimization
  tempPositions: Map<string, Vector3>
  tempRotations: Map<string, Vector3>
  tempScales: Map<string, Vector3>
  isTransforming: boolean

  // Scene State
  camera: CameraState
  scene: SceneSettings
  isLoading: boolean

  // Optimized History
  history: HistoryEntry[]
  historyIndex: number

  // Performance tracking
  performanceMode: boolean
  vertexCount: number
  renderCount: number

  // Actions - Vertex Management
  addVertex: (vertex: Omit<Vertex, "id">) => string
  addVerticesBatch: (vertices: Array<Omit<Vertex, "id">>) => string[]
  updateVertex: (id: string, updates: Partial<Vertex>) => void
  updateMultipleVertices: (updates: Array<{ id: string; updates: Partial<Vertex> }>) => void
  deleteVertex: (id: string) => void
  selectVertex: (id: string, multi?: boolean) => void
  selectMultipleVertices: (ids: string[], multi?: boolean) => void
  clearVertexSelection: () => void

  // Actions - Shape Management
  addShape: (shape: Omit<Shape, "id" | "vertices">) => string
  updateShape: (id: string, updates: Partial<Shape>) => void
  updateMultipleShapes: (updates: Array<{ id: string; updates: Partial<Shape> }>) => void
  deleteShape: (id: string) => void
  selectShape: (id: string, multi?: boolean) => void
  clearShapeSelection: () => void

  // Actions - Selection
  selectAllObjects: () => void
  clearAllSelections: () => void
  deleteSelectedObjects: () => void

  // Actions - Layer Management
  addLayer: (layer: Omit<Layer, "id" | "vertices">) => string
  updateLayer: (id: string, updates: Partial<Layer>) => void
  deleteLayer: (id: string) => void

  // Actions - Tools
  setCurrentTool: (tool: Store3D["currentTool"]) => void
  setTransformMode: (mode: Store3D["transformMode"]) => void

  // Actions - Scene
  updateCamera: (camera: Partial<CameraState>) => void
  updateScene: (scene: Partial<SceneSettings>) => void

  // Actions - Optimized History
  saveToHistory: (force?: boolean) => void
  undo: () => void
  redo: () => void
  clearHistory: () => void

  // Actions - Import/Export
  exportScene: () => string
  exportToMythicMobs: () => string
  importScene: (data: string) => void

  // Performance Actions
  setPerformanceMode: (enabled: boolean) => void
  updatePerformanceStats: () => void

  // Utility
  getVerticesByLayer: (layerId: string) => Vertex[]
  getVerticesByShape: (shapeId: string) => Vertex[]
  clearScene: () => void

  // Ana sistemle entegrasyon
  exportToMainSystem: () => Element[]
  importFromMainSystem: (elements: Element[], clearExisting?: boolean) => void
  syncWithMainSystem: (elements: Element[]) => void
  importLayerStructure: (layer: Layer) => void

  // New actions
  importOBJ: (objContent: string) => void

  // Add Menu State
  showAddMenu: boolean
  toggleAddMenu: () => void

  // Shape Creation
  createBox: (position: { x: number; z: number }, size: number) => void
  createSphere: (position: { x: number; z: number }, radius: number) => void
  createLine: (start: { x: number; z: number }, end: { x: number; z: number }) => void
  addElement: (element: { type: string; position: { x: number; z: number }; yOffset: number; color: string }) => void

  // Layer Management
  currentLayer: Layer | null

  // Element Management
  selectElement: (id: string, multi?: boolean) => void
  exportVerticesToMainSystem: () => void

  // Mode State
  mode: string
  setMode: (mode: string) => void

  // X-Ray Mode
  xrayMode: boolean
  setXrayMode: (enabled: boolean) => void

  // Yeni fonksiyon: Sadece shape'in vertex'lerini sil, shape'i tut
  clearShapeVertices: (id: string) => void

  // Actions - Transform
  setTransformCenter: (center?: Vector3) => void
  setInitialTransformPositions: (positions?: Store3D["initialTransformPositions"] | null) => void

  // Actions - Temporary Positions
  setTempPositions: (positions: Map<string, Vector3>) => void
  setTempRotations: (rotations: Map<string, Vector3>) => void
  setTempScales: (scales: Map<string, Vector3>) => void
  setIsTransforming: (transforming: boolean) => void
  clearTempPositions: () => void

  // OPTIMIZED: Batch operations for performance
  updateVerticesBatch: (updates: Array<{ id: string; updates: Partial<Vertex> }>) => void
  updateShapesBatch: (updates: Array<{ id: string; updates: Partial<Shape> }>) => void
  applyTempTransforms: () => void
}

export const use3DStore = create<Store3D>()(
  subscribeWithSelector(
    immer<Store3D>((set, get) => ({
      // Initial State
      vertices: new Map<string, Vertex>(),
      shapes: [] as Shape[],
      layers: [
        {
          id: "default",
          name: "Default Layer",
          visible: true,
          color: "#ffffff",
          effectType: "particles",
          elements: [],
          tickStart: 0,
          tickEnd: 0,
          tickDelay: 0,
          particle: "",
          alpha: 1,
          shapeSize: 1,
          repeat: 1,
          yOffset: 0,
          repeatInterval: 1,
          targeter: "@self",
        },
      ],

      selectedVertices: [],
      selectedShapes: [],
      currentTool: "select",
      transformMode: "translate",

      // Actions - Transform
      setTransformCenter: (center) => set({ transformCenter: center }),
      setInitialTransformPositions: (positions) => set({ initialTransformPositions: positions as any }),

      camera: {
        position: { x: 10, y: 10, z: 10 },
        target: { x: 0, y: 0, z: 0 },
        isPerspective: true,
      },

      scene: {
        showGrid: true,
        showAxes: true,
        gridSize: 1,
        snapToGrid: false,
        gridOpacity: 0.5,
      },

      isLoading: false,

      // Optimized History
      history: [],
      historyIndex: -1,

      // Performance
      performanceMode: false,
      vertexCount: 0,
      renderCount: 0,

      // X-Ray Mode
      xrayMode: false,
      setXrayMode: (enabled) => set({ xrayMode: enabled }),

      // Vertex Management - Updated for Map
      addVertex: (vertexData) => {
        const id = `vertex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const vertex: Vertex = { ...vertexData, id }

        set((state) => {
          state.vertices.set(id, vertex)
          state.vertices = new Map(state.vertices)
          state.vertexCount = state.vertices.size
        })

        get().saveToHistory()
        return id
      },

      addVerticesBatch: (verticesData) => {
        const ids: string[] = []

        set((state) => {
          verticesData.forEach((vertexData) => {
            const id = `vertex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const vertex: Vertex = { ...vertexData, id }
            state.vertices.set(id, vertex)
            ids.push(id)
          })
          state.vertices = new Map(state.vertices)
          state.vertexCount = state.vertices.size
        })

        get().saveToHistory()
        return ids
      },

      updateVertex: (id, updates) => {
        set((state) => {
          const vertex = state.vertices.get(id)
          if (vertex) {
            // OPTIMIZED: Direct map update without recreation
            const updatedVertex = { ...vertex, ...updates }
            state.vertices.set(id, updatedVertex)
            
            // OPTIMIZED: Only update layers if position changed
            if (updates.position) {
              state.layers = state.layers.map(layer => ({
                ...layer,
                elements: layer.elements.map(el =>
                  el.id === id
                    ? { ...el, position: { ...el.position, ...updates.position } }
                    : el
                )
              }))
            }
          }
        })
      },

      updateMultipleVertices: (updates) => {
        set((state) => {
          updates.forEach(({ id, updates }) => {
            const vertex = state.vertices.get(id)
            if (vertex) {
              state.vertices.set(id, { ...vertex, ...updates })
            }
          })
          state.vertices = new Map(state.vertices)
        })
      },

      deleteVertex: (id) => {
        set((state) => {
          state.vertices.delete(id)
          state.vertices = new Map(state.vertices)
          state.selectedVertices = state.selectedVertices.filter((vid: string) => vid !== id)
          state.vertexCount = state.vertices.size

          // Update shapes and layers
          state.shapes = state.shapes.map((shape: Shape) => ({
            ...shape,
            vertices: shape.vertices.filter((vid: string) => vid !== id),
          }))

          state.layers = state.layers.map((layer: Layer) => ({
            ...layer,
            elements: layer.elements.filter((el: Element) => el.id !== id),
          }))
        })
        get().saveToHistory()
      },

      selectVertex: (id, multi = false) => {
        set((state) => {
          if (multi) {
            const isSelected = state.selectedVertices.includes(id)
            if (isSelected) {
              state.selectedVertices = state.selectedVertices.filter((vid: string) => vid !== id)
            } else {
              state.selectedVertices.push(id)
            }
            const vertex = state.vertices.get(id)
            if (vertex) {
              state.vertices.set(id, { ...vertex, selected: !isSelected })
            }
          } else {
            state.selectedVertices = [id]
            // OPTIMIZED: Batch update - avoid forEach for large datasets
            if (state.vertices.size > 500) {
              // For large datasets, use requestIdleCallback for non-blocking updates
              const updateBatch = () => {
                const updates = new Map()
                state.vertices.forEach((vertex: Vertex) => {
                  updates.set(vertex.id, { ...vertex, selected: vertex.id === id })
                })
                state.vertices = updates
              }
              if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(updateBatch)
              } else {
                setTimeout(updateBatch, 0)
              }
            } else {
              // For smaller datasets, update immediately
              state.vertices.forEach((vertex: Vertex) => {
                state.vertices.set(vertex.id, { ...vertex, selected: vertex.id === id })
              })
            }
          }

          // AUTO-SELECT SHAPE: If all vertices of a shape are selected, select the shape too
          state.shapes.forEach((shape: Shape) => {
            const allVerticesSelected = shape.vertices.length > 0 && 
              shape.vertices.every(vertexId => state.selectedVertices.includes(vertexId))
            
            if (allVerticesSelected && !state.selectedShapes.includes(shape.id)) {
              state.selectedShapes.push(shape.id)
              state.shapes = state.shapes.map((s: Shape) => 
                s.id === shape.id ? { ...s, selected: true } : s
              )
            } else if (!allVerticesSelected && state.selectedShapes.includes(shape.id)) {
              state.selectedShapes = state.selectedShapes.filter((sid: string) => sid !== shape.id)
              state.shapes = state.shapes.map((s: Shape) => 
                s.id === shape.id ? { ...s, selected: false } : s
              )
            }
          })
        })
      },

      selectMultipleVertices: (ids, multi = false) => {
        set((state) => {
          const uniqueIds = Array.from(new Set(ids))

          if (multi) {
            uniqueIds.forEach((id) => {
              const isSelected = state.selectedVertices.includes(id)
              if (isSelected) {
                state.selectedVertices = state.selectedVertices.filter((vid: string) => vid !== id)
              } else {
                state.selectedVertices.push(id)
              }
              const vertex = state.vertices.get(id)
              if (vertex) {
                state.vertices.set(id, { ...vertex, selected: !isSelected })
              }
            })
          } else {
            state.selectedVertices = uniqueIds
            state.vertices.forEach((vertex: Vertex) => {
              state.vertices.set(vertex.id, { ...vertex, selected: uniqueIds.includes(vertex.id) })
            })
          }

          // AUTO-SELECT SHAPE: If all vertices of a shape are selected, select the shape too
          state.shapes.forEach((shape: Shape) => {
            const allVerticesSelected = shape.vertices.length > 0 && 
              shape.vertices.every(vertexId => state.selectedVertices.includes(vertexId))
            
            if (allVerticesSelected && !state.selectedShapes.includes(shape.id)) {
              state.selectedShapes.push(shape.id)
              state.shapes = state.shapes.map((s: Shape) => 
                s.id === shape.id ? { ...s, selected: true } : s
              )
            } else if (!allVerticesSelected && state.selectedShapes.includes(shape.id)) {
              state.selectedShapes = state.selectedShapes.filter((sid: string) => sid !== shape.id)
              state.shapes = state.shapes.map((s: Shape) => 
                s.id === shape.id ? { ...s, selected: false } : s
              )
            }
          })
        })
      },

      clearVertexSelection: () => {
        set((state) => {
          state.selectedVertices = []
          state.vertices.forEach((vertex: Vertex) => {
            state.vertices.set(vertex.id, { ...vertex, selected: false })
          })
        })
      },

      // Shape Management - FIXED ROTATION
      addShape: (shapeData) => {
        const id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const shape: Shape = { ...shapeData, id, vertices: [] }

        // Generate vertices for the shape
        const verticesData = generateShapeVertices(shapeData)

        // Renk kaynağı: layer.color veya #ffffff
        const color = get().layers?.[0]?.color || "#ffffff"

        const vertexIds = get().addVerticesBatch(
          verticesData.map((vertexPos) => ({
            position: vertexPos,
            effectType: "particles",
            layer: "default",
            color,
            visible: true,
            selected: false,
            groupId: id,
          })),
        )

        shape.vertices = vertexIds

        set((state) => ({
          shapes: [...state.shapes, shape],
        }))

        // Auto-enable performance mode for heavy scenes
        const currentVertexCount = Array.from(get().vertices.values()).length
        if (currentVertexCount > 1000 && !get().performanceMode) {
          get().setPerformanceMode(true)
          // Show notification to user
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('showPerformanceNotification', {
              detail: { 
                message: `Performance mode enabled automatically (${currentVertexCount} elements)`,
                type: 'info'
              }
            })
            window.dispatchEvent(event)
          }
        }

        // Force save to history after adding shape and vertices
        get().saveToHistory(true)

        return id
      },

      // FIXED: Shape update with proper vertex rotation
      updateShape: (id, updates) => {
        const shape = get().shapes.find((s) => s.id === id)
        if (!shape) return

        const newSelectedShapes = [id]
        
        if (shape.type === "imported") {
          set((state) => ({
            shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
            selectedShapes: newSelectedShapes,
            selectedVertices: [],
          }))
          if (updates.scale && shape.scale) {
            set((state) => {
              shape.vertices.forEach((vertexId) => {
                const vertex = state.vertices.get(vertexId)
                if (vertex) {
                  state.vertices.set(vertexId, {
                    ...vertex,
                    position: {
                      x: (vertex.position.x / (shape.scale.x || 1)) * updates.scale!.x,
                      y: (vertex.position.y / (shape.scale.y || 1)) * updates.scale!.y,
                      z: (vertex.position.z / (shape.scale.z || 1)) * updates.scale!.z,
                    },
                  })
                }
              })
            })
          }
          return
        }

        // Always regenerate vertices for any transform or density change
        const shouldRegenerateVertices = (
          updates.position || updates.scale || updates.rotation ||
          updates.radius || updates.lineLength || updates.elementCount
        )

        if (shouldRegenerateVertices) {
          const updatedShape = { ...shape, ...updates }
          set((state) => {
            const verticesToDelete = Array.from(state.vertices.values()).filter((v) => 
              shape.vertices.includes(v.id) || v.groupId === id
            )
            const remainingVertices = Array.from(state.vertices.values()).filter((v) => 
              !shape.vertices.includes(v.id) && v.groupId !== id
            )
            return {
              vertices: new Map(remainingVertices.map(v => [v.id, v])),
              vertexCount: state.vertexCount - verticesToDelete.length,
            }
          })
          // Renk kaynağı: layer.color veya #ffffff
          const color = get().layers?.[0]?.color || "#ffffff"
          const newVerticesData = generateShapeVertices(updatedShape)
          const newVertexIds = get().addVerticesBatch(
            newVerticesData.map((vertexPos) => ({
              position: vertexPos,
              effectType: "particles",
              layer: "default",
              color,
              visible: true,
              selected: false,
              groupId: id,
            })),
          )
          set((state) => ({
            shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...updates, vertices: newVertexIds } : s)),
            selectedShapes: newSelectedShapes,
            selectedVertices: [],
          }))
        } else {
          set((state) => ({
            shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
            selectedShapes: newSelectedShapes,
            selectedVertices: [],
          }))
        }
      },

      updateMultipleShapes: (updates) => {
        set((state) => ({
          shapes: state.shapes.map((s: Shape) => {
            const update = updates.find((u) => u.id === s.id)
            return update ? { ...s, ...update.updates } : s
          }),
        }))
      },

      deleteShape: (id) => {
        const shape = get().shapes.find((s: Shape) => s.id === id)
        if (shape) {
          set((state) => {
            // Delete vertices that belong to this shape (primarily through groupId)
            const verticesToDelete = Array.from(state.vertices.values()).filter((v: Vertex) => 
              v.groupId === id || shape.vertices.includes(v.id)
            )
            
            console.log(`Deleting shape ${id} with ${verticesToDelete.length} vertices`)
            console.log(`Shape vertices array: ${shape.vertices.length}`, shape.vertices)
            console.log(`Vertices with groupId ${id}:`, verticesToDelete.map(v => v.id))
            
            const remainingVertices = Array.from(state.vertices.values()).filter((v: Vertex) => 
              v.groupId !== id && !shape.vertices.includes(v.id)
            )
            
            return {
              vertices: new Map(remainingVertices.map(v => [v.id, v])),
              vertexCount: state.vertexCount - verticesToDelete.length,
              shapes: state.shapes.filter((s: Shape) => s.id !== id),
              selectedShapes: state.selectedShapes.filter((sid: string) => sid !== id),
            }
          })
        } else {
          set((state) => ({
            shapes: state.shapes.filter((s: Shape) => s.id !== id),
            selectedShapes: state.selectedShapes.filter((sid: string) => sid !== id),
          }))
        }

        get().saveToHistory()
      },

      // Yeni fonksiyon: Sadece shape'in vertex'lerini sil, shape'i tut
      clearShapeVertices: (id) => {
        const shape = get().shapes.find((s: Shape) => s.id === id)
        if (shape) {
          set((state) => {
            // Delete vertices that belong to this shape (primarily through groupId)
            const verticesToDelete = Array.from(state.vertices.values()).filter((v: Vertex) => 
              v.groupId === id || shape.vertices.includes(v.id)
            )
            
            console.log(`Clearing ${verticesToDelete.length} vertices from shape ${id}`)
            
            const remainingVertices = Array.from(state.vertices.values()).filter((v: Vertex) => 
              v.groupId !== id && !shape.vertices.includes(v.id)
            )
            
            return {
              vertices: new Map(remainingVertices.map(v => [v.id, v])),
              vertexCount: state.vertexCount - verticesToDelete.length,
              shapes: state.shapes.map((s: Shape) => s.id === id ? { 
                ...s, 
                vertices: [],
                elementCount: 0 // Reset elementCount to 0 when all vertices are cleared
              } : s),
            }
          })
          
          get().saveToHistory()
        }
      },

      selectShape: (id, multi = false) => {
        set((state) => {
          const shape = state.shapes.find(s => s.id === id)
          if (!shape) return state

          if (multi) {
            const isSelected = state.selectedShapes.includes(id)
            
            if (isSelected) {
              // Shape'i ve vertex'lerini seçimden çıkar
              const updatedVertices = new Map(Array.from(state.vertices.values()).map(vertex => [
                vertex.id,
                { ...vertex, selected: shape.vertices.includes(vertex.id) ? false : vertex.selected }
              ]))
              
              return {
                selectedShapes: state.selectedShapes.filter((sid: string) => sid !== id),
                selectedVertices: state.selectedVertices.filter(vid => !shape.vertices.includes(vid)),
                shapes: state.shapes.map((s: Shape) => (s.id === id ? { ...s, selected: false } : s)),
                vertices: updatedVertices,
              }
            } else {
              // Shape'i ve vertex'lerini seç
              const updatedVertices = new Map(Array.from(state.vertices.values()).map(vertex => [
                vertex.id,
                { ...vertex, selected: shape.vertices.includes(vertex.id) ? true : vertex.selected }
              ]))
              
              return {
                selectedShapes: [...state.selectedShapes, id],
                selectedVertices: [...state.selectedVertices, ...shape.vertices],
                shapes: state.shapes.map((s: Shape) => (s.id === id ? { ...s, selected: true } : s)),
                vertices: updatedVertices,
              }
            }
          } else {
            // Tek seçim: sadece bu shape'i ve vertex'lerini seç
            const updatedVertices = new Map(Array.from(state.vertices.values()).map(vertex => [
              vertex.id,
              { ...vertex, selected: shape.vertices.includes(vertex.id) }
            ]))
            
            return {
              selectedShapes: [id],
              selectedVertices: shape.vertices,
              shapes: state.shapes.map((s: Shape) => ({ ...s, selected: s.id === id })),
              vertices: updatedVertices,
            }
          }
        })
      },

      clearShapeSelection: () => {
        set((state) => ({
          selectedShapes: [],
          shapes: state.shapes.map((s: Shape) => ({ ...s, selected: false })),
        }))
      },

      // Selection Actions
      selectAllObjects: () => {
        set((state) => ({
          selectedVertices: Array.from(state.vertices.values()).map((v: Vertex) => v.id),
          selectedShapes: state.shapes.map((s: Shape) => s.id),
          vertices: new Map(Array.from(state.vertices.values()).map((v: Vertex) => [v.id, { ...v, selected: true }])),
          shapes: state.shapes.map((s: Shape) => ({ ...s, selected: true })),
        }))
      },

      clearAllSelections: () => {
        set((state) => {
          // Clear vertex selections
          const updatedVertices = new Map(Array.from(state.vertices.values()).map((vertex: Vertex) => [vertex.id, { ...vertex, selected: false }]))
          
          return {
            selectedVertices: [],
            selectedShapes: [],
            vertices: updatedVertices,
            shapes: state.shapes.map((s: Shape) => ({ ...s, selected: false }))
          }
        })
      },

      deleteSelectedObjects: () => {
        const { selectedVertices, selectedShapes } = get()

        // Store the selected items before clearing selections
        const shapesToDelete = [...selectedShapes]
        const verticesToDelete = [...selectedVertices]

        // Clear selections first to prevent any side effects during deletion
        get().clearAllSelections()

        // Delete shapes
        shapesToDelete.forEach((shapeId) => {
          get().deleteShape(shapeId)
        })

        // Delete vertices and update shape elementCount
        verticesToDelete.forEach((vertexId) => {
          const vertex = get().vertices.get(vertexId)
          if (vertex) {
            set((state) => {
              // Remove vertex
              const newVertices = new Map(Array.from(state.vertices.values()).filter((v: Vertex) => v.id !== vertexId).map(v => [v.id, v]))
              
              // Update shapes that contain this vertex
              const updatedShapes = state.shapes.map(shape => {
                if (shape.vertices.includes(vertexId)) {
                  const newVertices = shape.vertices.filter(id => id !== vertexId)
                  return {
                    ...shape,
                    vertices: newVertices,
                    elementCount: Math.max(0, newVertices.length) // Update elementCount to match actual vertex count, minimum 0
                  }
                }
                return shape
              })
              
              return {
                vertices: newVertices,
                shapes: updatedShapes,
                vertexCount: state.vertexCount - 1,
              }
            })
          }
        })

        get().saveToHistory()
      },

      // Layer Management
      addLayer: (layerData) => {
        const id = `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const layer: Layer = { ...layerData, id, elements: [] }

        set((state) => ({
          layers: [...state.layers, layer],
        }))

        return id
      },

      updateLayer: (id, updates) => {
        set((state) => ({
          layers: state.layers.map((l: Layer) => (l.id === id ? { ...l, ...updates } : l)),
        }))
      },

      deleteLayer: (id) => {
        set((state) => ({
          layers: state.layers.filter((l: Layer) => l.id !== id),
        }))
      },

      // Tools
      setCurrentTool: (tool) => {
        set({ currentTool: tool })
        if (tool === "move") set({ transformMode: "translate" })
        else if (tool === "rotate") set({ transformMode: "rotate" })
        else if (tool === "scale") set({ transformMode: "scale" })
      },

      setTransformMode: (mode) => {
        set({ transformMode: mode })
      },

      // Scene
      updateCamera: (camera) => {
        set((state) => ({
          camera: { ...state.camera, ...camera },
        }))
      },

      updateScene: (scene) => {
        set((state) => ({
          scene: { ...state.scene, ...scene },
        }))
      },

      // OPTIMIZED HISTORY
      saveToHistory: (force = false) => {
        const state = get();
        const now = Date.now();
        const snapshot: HistoryEntry = {
          vertices: Array.from(state.vertices.entries()),
          shapes: JSON.parse(JSON.stringify(state.shapes)),
          layers: JSON.parse(JSON.stringify(state.layers)),
          timestamp: now,
        };
        set((state) => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(snapshot);
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const previousState = state.history[state.historyIndex - 1];
          set({
            vertices: new Map(previousState.vertices),
            shapes: JSON.parse(JSON.stringify(previousState.shapes)),
            layers: JSON.parse(JSON.stringify(previousState.layers)),
            historyIndex: state.historyIndex - 1,
            selectedVertices: [],
            selectedShapes: [],
            vertexCount: previousState.vertices.length,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const nextState = state.history[state.historyIndex + 1];
          set({
            vertices: new Map(nextState.vertices),
            shapes: JSON.parse(JSON.stringify(nextState.shapes)),
            layers: JSON.parse(JSON.stringify(nextState.layers)),
            historyIndex: state.historyIndex + 1,
            selectedVertices: [],
            selectedShapes: [],
            vertexCount: nextState.vertices.length,
          });
        }
      },

      clearHistory: () => {
        set({
          history: [],
          historyIndex: -1,
        })
      },

      // Performance
      setPerformanceMode: (enabled) => {
        set({ performanceMode: enabled })
        if (enabled) {
          console.log("🚀 Performance mode enabled - reducing visual quality for better FPS")
        }
      },

      updatePerformanceStats: () => {
        set((state) => ({
          renderCount: state.renderCount + 1,
        }))
      },

      // Export/Import
      exportScene: () => {
        const state = get()
        return JSON.stringify(
          {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            vertices: Array.from(state.vertices.values()),
            shapes: state.shapes,
            layers: state.layers,
            camera: state.camera,
            scene: state.scene,
            performanceStats: {
              vertexCount: state.vertexCount,
              performanceMode: state.performanceMode,
            },
          },
          null,
          2,
        )
      },

      exportToMythicMobs: () => {
        const state = get()
        let yaml = "# AuraFX Generated MythicMobs Skill\n"
        yaml += `# Generated at: ${new Date().toISOString()}\n`
        yaml += `# Total Elements: ${state.vertices.size}\n\n`

        yaml += "GeneratedSkill:\n"
        yaml += "  Skills:\n"

        const effectGroups: { [key: string]: typeof state.vertices } = {}
        state.vertices.forEach((vertex) => {
          if (!effectGroups[vertex.effectType]) {
            effectGroups[vertex.effectType] = new Map()
          }
          effectGroups[vertex.effectType].set(vertex.id, vertex)
        })

        Object.entries(effectGroups).forEach(([effectType, vertices]) => {
          yaml += `  # ${effectType.toUpperCase()} Effects (${vertices.size} elements)\n`
          vertices.forEach((vertex) => {
            const x = vertex.position.x.toFixed(4)
            const y = vertex.position.y.toFixed(4)
            const z = vertex.position.z.toFixed(4)

            yaml += `  - effect:particles{p=${vertex.effectType};c=${vertex.color};a=1} @Origin{xoffset=${x};yoffset=${y};zoffset=${z}}\n`
          })
          yaml += "\n"
        })

        return yaml
      },

      importScene: (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.vertices && parsed.shapes && parsed.layers) {
            set({
              vertices: new Map(parsed.vertices.map((v: Vertex) => [v.id, v])),
              shapes: parsed.shapes,
              layers: parsed.layers,
              camera: parsed.camera || get().camera,
              scene: parsed.scene || get().scene,
              selectedVertices: [],
              selectedShapes: [],
              vertexCount: parsed.vertices.length,
            })
            get().clearHistory()
            get().saveToHistory(true)
          }
        } catch (error) {
          console.error("Failed to import scene:", error)
        }
      },

      // Utility
      getVerticesByLayer: (layerId) => {
        const state = get()
        const layer = state.layers.find((l: Layer) => l.id === layerId)
        if (!layer) return []
        return layer.elements.map(el => state.vertices.get(el.id)).filter(Boolean) as Vertex[]
      },

      getVerticesByShape: (shapeId) => {
        const state = get()
        const shape = state.shapes.find((s: Shape) => s.id === shapeId)
        if (!shape) return []

        return Array.from(state.vertices.values()).filter((v: Vertex) => shape.vertices.includes(v.id))
      },

      clearScene: () => {
        set({
          vertices: new Map(),
          shapes: [],
          layers: [
            {
              id: "default",
              name: "Default Layer",
              visible: true,
              color: "#ffffff",
              effectType: "particles",
              elements: [],
              tickStart: 0,
              tickEnd: 0,
              tickDelay: 0,
              particle: "",
              alpha: 1,
              shapeSize: 1,
              repeat: 1,
              yOffset: 0,
              repeatInterval: 1,
              targeter: "@self",
            },
          ],
          selectedVertices: [],
          selectedShapes: [],
          vertexCount: 0,
          performanceMode: false,
        })
        get().clearHistory()
        get().saveToHistory(true)
      },

      // Ana sistemle entegrasyon fonksiyonları
      exportToMainSystem: () => {
        const { vertices, shapes } = get()
        const elements: Element[] = []

        // Vertex'leri dönüştür
        vertices.forEach((vertex) => {
          elements.push({
            id: vertex.id,
            type: "free",
            position: {
              x: vertex.position.x,
              y: vertex.position.y,
              z: vertex.position.z
            },
            yOffset: vertex.position.y,
            color: vertex.color,
            particle: vertex.effectType,
            groupId: vertex.groupId || undefined
          })
        })

        // Shape'leri dönüştür
        shapes.forEach((shape) => {
          elements.push({
            id: shape.id,
            type: shape.type === "cube" ? "square" : shape.type === "sphere" ? "circle" : shape.type === "imported" ? "obj" : shape.type,
            position: {
              x: shape.position.x,
              y: shape.position.y,
              z: shape.position.z
            },
            yOffset: shape.position.y,
            color: "#ffffff",
            particle: "particles",
            scale: shape.scale
          })
        })

        return elements
      },

      importFromMainSystem: (elements: Element[], clearExisting = false) => {
        console.log('3D Store: Importing elements from main system:', elements)
        
        if (elements.length === 0) {
          console.log('No elements to import.')
          return
        }

        const scaleFactor = 0.4 // 2D elementleri 3D'de daha küçük yapmak için
        
        // Tüm elementlerin pozisyonlarını scale et ve yOffset'i doğru kullan
        const scaledElements = elements.map(element => ({
          ...element,
          position: {
            x: element.position.x * scaleFactor,
            y: (element.yOffset || 0) * scaleFactor, // yOffset'i kullan, position.y değil
            z: element.position.z * scaleFactor
          }
        }))
        
        // Çizimin merkezini hesapla
        const centerX = scaledElements.reduce((sum, el) => sum + el.position.x, 0) / scaledElements.length
        const centerY = scaledElements.reduce((sum, el) => sum + el.position.y, 0) / scaledElements.length
        const centerZ = scaledElements.reduce((sum, el) => sum + el.position.z, 0) / scaledElements.length
        
        // Tek shape oluştur ve (0,0,0) merkezine yerleştir
        const shapeId = `imported_drawing_${Date.now()}`
        const singleShape: Shape = {
          id: shapeId,
          type: 'imported',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          vertices: [], 
          visible: true,
          selected: false,
          particle: "particles"
        }
        
        // Her vertex'i çizim merkezine göre konumlandır
        const newVertices: Vertex[] = scaledElements.map((element, index) => {
          const vertexId = `vertex_${shapeId}_${index}`
          return {
            id: vertexId,
            position: { 
              x: element.position.x - centerX,
              y: element.position.y - centerY, // yOffset'ten gelen değer
              z: element.position.z - centerZ
          },
          effectType: element.particle || "particles",
          layer: "default",
          color: element.color || "#ffffff",
          visible: true,
          selected: false
          }
        })
        
        singleShape.vertices = newVertices.map(v => v.id)
        
        console.log('3D Store: Created single shape at origin:', singleShape)
        console.log('3D Store: Created relative vertices:', newVertices)
        
        set((state) => {
          if (clearExisting) {
            // Sade geçiş: mevcut vertex'leri ve shape'leri temizle
            const newVertexEntries = newVertices.map(v => [v.id, v] as [string, Vertex])
            return {
              vertices: new Map(newVertexEntries),
              shapes: [singleShape]
            }
          } else {
            // Normal geçiş: mevcut vertex'lerin üzerine ekle
            const existingVertices = Array.from(state.vertices.entries())
            const newVertexEntries = newVertices.map(v => [v.id, v] as [string, Vertex])
            const allVertices = new Map([...existingVertices, ...newVertexEntries])
            
            return {
              vertices: allVertices,
              shapes: [...state.shapes, singleShape]
            }
          }
        })
        
        console.log('3D Store: Successfully set single shape and vertices in store')
      },

      syncWithMainSystem: (elements: Element[]) => {
        const { vertices } = get()
        const updatedVertices = Array.from(vertices.values()).map((v: Vertex) => {
          const element = elements.find(e => e.id === v.id)
          if (element) {
            return {
              ...v,
              position: {
                x: element.position.x,
                y: element.position.y || 0,
                z: element.position.z
              },
              color: element.color || v.color,
              effectType: element.particle || v.effectType
            }
          }
          return v
        })

        set({ vertices: new Map(updatedVertices.map((v) => [v.id, v])) })
      },

      importLayerStructure: (layer: Layer) => {
        set((state) => {
          // Mevcut katmanı güncelle veya yeni katman ekle
          const existingLayerIndex = state.layers.findIndex(l => l.id === layer.id)
          
          if (existingLayerIndex !== -1) {
            // Mevcut katmanı güncelle (elementleri koru)
            state.layers[existingLayerIndex] = {
              ...layer,
              elements: state.layers[existingLayerIndex].elements // Mevcut elementleri koru
            }
          } else {
            // Yeni katman ekle (elementleri boş)
            state.layers.push({
              ...layer,
              elements: [] // Elementleri boş bırak
            })
          }
        })
        
        get().saveToHistory()
      },

      // New action
      importOBJ: (objContent: string) => {
        const lines = objContent.split('\n')
        const vertices: Omit<Vertex, 'id'>[] = []
        const state = get()
        const currentLayer = state.layers[0] // veya aktif layer mantığına göre değiştir
        if (!currentLayer) {
          console.error('No active layer found')
          return
        }
        const groupId = `obj_import_${Date.now()}`
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/)
          if (
            parts[0] === 'v' &&
            parts.length >= 4 &&
            !isNaN(Number(parts[1])) &&
            !isNaN(Number(parts[2])) &&
            !isNaN(Number(parts[3]))
          ) {
            vertices.push({
              position: {
                x: parseFloat(parts[1]),
                y: parseFloat(parts[2]),
                z: parseFloat(parts[3]),
              },
              effectType: 'particles',
              layer: currentLayer.id,
              color: currentLayer.color,
              visible: true,
              selected: false,
              groupId,
            })
          }
        })
        if (vertices.length === 0) return;
        const ids = state.addVerticesBatch(vertices)
        // Layer'ın elements dizisine ekle
        set((s) => ({
          layers: s.layers.map(l => l.id === currentLayer.id ? { ...l, elements: [...l.elements, ...ids] } : l)
        }))
        // Shape oluştur
        const shapeId = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        set((s) => ({
          shapes: [
            ...s.shapes,
            {
              id: shapeId,
              type: 'imported',
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              vertices: ids,
              visible: true,
              selected: false,
            },
          ],
        }))
      },

      // Add Menu State
      showAddMenu: false,
      toggleAddMenu: () => {
        set((state) => {
          state.showAddMenu = !state.showAddMenu
        })
      },

      // Shape Creation
      createBox: (position, size) => {
        const id = get().addShape({
          type: "cube",
          position: { x: position.x, y: 0, z: position.z },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: size, y: size, z: size },
          visible: true,
          selected: false,
          elementCount: 8,
        })
      },

      createSphere: (position, radius) => {
        const id = get().addShape({
          type: "sphere",
          position: { x: position.x, y: 0, z: position.z },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          selected: false,
          elementCount: 16,
          radius,
        })
      },

      createLine: (start, end) => {
        const id = get().addShape({
          type: "line",
          position: { x: (start.x + end.x) / 2, y: 0, z: (start.z + end.z) / 2 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          selected: false,
          elementCount: 2,
          lineLength: Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)),
        })
      },

      addElement: (element) => {
        const id = get().addVertex({
          position: { x: element.position.x, y: element.yOffset, z: element.position.z },
          effectType: "particles",
          layer: "default",
          color: element.color,
          visible: true,
          selected: false,
        })
      },

      // Layer Management
      currentLayer: {
        id: "default",
        name: "Default Layer",
        visible: true,
        color: "#ffffff",
        effectType: "particles",
        elements: [],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "@self",
      },

      // Element Management
      selectElement: (id: string, multi: boolean = false) => {
        set((state) => {
          if (!multi) {
            state.selectedVertices = []
            state.selectedShapes = []
          }
          // Add to selected vertices if it's a vertex
          if (state.vertices.has(id)) {
            if (!state.selectedVertices.includes(id)) {
              state.selectedVertices.push(id)
            }
          }
          // Add to selected shapes if it's a shape
          const shapeIndex = state.shapes.findIndex(s => s.id === id)
          if (shapeIndex !== -1) {
            if (!state.selectedShapes.includes(id)) {
              state.selectedShapes.push(id)
            }
          }
        })
      },

      exportVerticesToMainSystem: () => {
        const state = get()
        const elements = state.exportToMainSystem()
        // Here you would typically send the elements to the main system
        // For now, we'll just log them
        console.log('Exported elements:', elements)
      },

      // Mode State
      mode: "edit",
      setMode: (mode: string) => set({ mode }),

      // Temporary positions for performance optimization
      tempPositions: new Map(),
      tempRotations: new Map(),
      tempScales: new Map(),
      isTransforming: false,

      // Actions - Temporary Positions
      setTempPositions: (positions: Map<string, Vector3>) => set({ tempPositions: positions }),
      setTempRotations: (rotations: Map<string, Vector3>) => set({ tempRotations: rotations }),
      setTempScales: (scales: Map<string, Vector3>) => set({ tempScales: scales }),
      setIsTransforming: (transforming: boolean) => set({ isTransforming: transforming }),
      clearTempPositions: () => set({ tempPositions: new Map(), tempRotations: new Map(), tempScales: new Map(), isTransforming: false }),

      // OPTIMIZED: Batch vertex updates for performance
      updateVerticesBatch: (updates: Array<{ id: string; updates: Partial<Vertex> }>) => {
        if (updates.length === 0) return
        
        console.log('🚀 Batch updating', updates.length, 'vertices')
        const startTime = performance.now()
        
        // Use requestIdleCallback for non-blocking updates on large datasets
        if (updates.length > 100) {
          const batchSize = 50
          let currentIndex = 0
          
          const processBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, updates.length)
            const batch = updates.slice(currentIndex, endIndex)
            
            set((state) => {
              batch.forEach(({ id, updates: vertexUpdates }) => {
                const vertex = state.vertices.get(id)
                if (vertex) {
                  state.vertices.set(id, { ...vertex, ...vertexUpdates })
                }
              })
              // Only recreate Map once per batch
              state.vertices = new Map(state.vertices)
            })
            
            currentIndex = endIndex
            
            if (currentIndex < updates.length) {
              if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(processBatch, { timeout: 16 }) // 16ms timeout for 60fps
              } else {
                setTimeout(processBatch, 0)
              }
            } else {
              const duration = performance.now() - startTime
              console.log('✅ Batch vertex update completed in', duration.toFixed(2), 'ms')
            }
          }
          
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(processBatch, { timeout: 16 })
          } else {
            setTimeout(processBatch, 0)
          }
        } else {
          // Small updates can be processed immediately
          set((state) => {
            updates.forEach(({ id, updates: vertexUpdates }) => {
              const vertex = state.vertices.get(id)
              if (vertex) {
                state.vertices.set(id, { ...vertex, ...vertexUpdates })
              }
            })
            state.vertices = new Map(state.vertices)
          })
          
          const duration = performance.now() - startTime
          console.log('✅ Small batch vertex update completed in', duration.toFixed(2), 'ms')
        }
      },

      // OPTIMIZED: Batch shape updates for performance
      updateShapesBatch: (updates: Array<{ id: string; updates: Partial<Shape> }>) => {
        if (updates.length === 0) return
        
        console.log('🚀 Batch updating', updates.length, 'shapes')
        const startTime = performance.now()
        
        set((state) => {
          const updatedShapes = state.shapes.map((shape: Shape) => {
            const update = updates.find((u) => u.id === shape.id)
            return update ? { ...shape, ...update.updates } : shape
          })
          
          return { shapes: updatedShapes }
        })
        
        const duration = performance.now() - startTime
        console.log('✅ Batch shape update completed in', duration.toFixed(2), 'ms')
      },

      // OPTIMIZED: Apply all temporary transforms at once
      applyTempTransforms: () => {
        const state = get()
        const { tempPositions, tempRotations, tempScales, selectedVertices, selectedShapes } = state
        
        if (tempPositions.size === 0) return
        
        console.log('🚀 Applying temp transforms:', {
          tempPositions: tempPositions.size,
          selectedVertices: selectedVertices.length,
          selectedShapes: selectedShapes.length
        })
        
        const startTime = performance.now()
        
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
          get().updateVerticesBatch(vertexUpdates)
        }

        if (shapeUpdates.length > 0) {
          get().updateShapesBatch(shapeUpdates)
        }
        
        const duration = performance.now() - startTime
        console.log('✅ Temp transforms applied in', duration.toFixed(2), 'ms')
      }
    }))
  )
)

// FIXED Helper Functions - Now includes rotation in vertex generation
function generateShapeVertices(shapeData: Omit<Shape, "id" | "vertices">): Vector3[] {
  const startTime = performance.now()
  const vertices: Vector3[] = []
  const { type, position, scale, rotation, elementCount = 8, radius = 2, lineLength = 4 } = shapeData

  // Helper function to apply rotation to a point
  const applyRotation = (point: Vector3, rot: Vector3): Vector3 => {
    // Apply rotation in order: X, Y, Z
    let x = point.x
    let y = point.y
    let z = point.z

    // Rotate around X axis
    if (rot.x !== 0) {
      const cosX = Math.cos(rot.x)
      const sinX = Math.sin(rot.x)
      const newY = y * cosX - z * sinX
      const newZ = y * sinX + z * cosX
      y = newY
      z = newZ
    }

    // Rotate around Y axis
    if (rot.y !== 0) {
      const cosY = Math.cos(rot.y)
      const sinY = Math.sin(rot.y)
      const newX = x * cosY + z * sinY
      const newZ = -x * sinY + z * cosY
      x = newX
      z = newZ
    }

    // Rotate around Z axis
    if (rot.z !== 0) {
      const cosZ = Math.cos(rot.z)
      const sinZ = Math.sin(rot.z)
      const newX = x * cosZ - y * sinZ
      const newY = x * sinZ + y * cosZ
      x = newX
      y = newY
    }

    return { x, y, z }
  }

  switch (type) {
    case "cube": {
      type Axis = 'x' | 'y' | 'z'
      // Pair-balanced allocation across opposite faces (x±, y±, z±)
      const pairTargets = [0, 0, 0]
      const basePerPair = Math.floor(elementCount / 3)
      let extraPairs = elementCount % 3
      for (let p = 0; p < 3; p++) {
        pairTargets[p] = basePerPair + (extraPairs > 0 ? 1 : 0)
        if (extraPairs > 0) extraPairs--
      }

      const pairs: Array<{ axis: Axis, faces: Array<{ axis: Axis, fixed: number, u: Axis, v: Axis }> }> = [
        { axis: 'x', faces: [ { axis: 'x', fixed: -0.5, u: 'y', v: 'z' }, { axis: 'x', fixed: 0.5, u: 'y', v: 'z' } ] },
        { axis: 'y', faces: [ { axis: 'y', fixed: -0.5, u: 'x', v: 'z' }, { axis: 'y', fixed: 0.5, u: 'x', v: 'z' } ] },
        { axis: 'z', faces: [ { axis: 'z', fixed: -0.5, u: 'x', v: 'y' }, { axis: 'z', fixed: 0.5, u: 'x', v: 'y' } ] },
      ]

      const placePointsOnFace = (count: number, fixedAxis: Axis, fixedVal: number, uAxis: Axis, vAxis: Axis) => {
        if (count <= 0) return
        const rows = Math.max(1, Math.round(Math.sqrt(count)))
        const colsBase = Math.floor(count / rows)
        const rowsWithExtra = count % rows
        let placed = 0
        for (let i = 0; i < rows; i++) {
          const cols = colsBase + (i < rowsWithExtra ? 1 : 0)
          if (cols === 0) continue
          const vStep = 1 / rows
          const vVal = -0.5 + (i + 0.5) * vStep
          const uStep = 1 / cols
          for (let j = 0; j < cols; j++) {
            const uVal = -0.5 + (j + 0.5) * uStep
            const localPos: Record<Axis, number> = { x: 0, y: 0, z: 0 }
            localPos[fixedAxis] = fixedVal
            localPos[uAxis] = uVal
            localPos[vAxis] = vVal
            const scaledPos = { x: localPos.x * scale.x, y: localPos.y * scale.y, z: localPos.z * scale.z }
            const rotatedPos = applyRotation(scaledPos, rotation)
            vertices.push({ x: position.x + rotatedPos.x, y: position.y + rotatedPos.y, z: position.z + rotatedPos.z })
            placed++
            if (placed >= count) break
          }
        }
      }

      for (let p = 0; p < 3; p++) {
        const target = pairTargets[p]
        const left = Math.floor(target / 2)
        const right = target - left
        const [faceA, faceB] = pairs[p].faces
        placePointsOnFace(left, faceA.axis, faceA.fixed, faceA.u, faceA.v)
        placePointsOnFace(right, faceB.axis, faceB.fixed, faceB.u, faceB.v)
      }
      break
    }

    case "sphere":
      const goldenRatio = (1 + Math.sqrt(5)) / 2
      const angleIncrement = (2 * Math.PI) / goldenRatio

      for (let i = 0; i < elementCount; i++) {
        const t = i / elementCount
        const inclination = Math.acos(1 - 2 * t)
        const azimuth = angleIncrement * i

        const localPos = {
          x: Math.sin(inclination) * Math.cos(azimuth) * radius,
          y: Math.cos(inclination) * radius,
          z: Math.sin(inclination) * Math.sin(azimuth) * radius,
        }

        // Apply scale
        const scaledPos = {
          x: localPos.x * scale.x,
          y: localPos.y * scale.y,
          z: localPos.z * scale.z,
        }

        // Apply rotation
        const rotatedPos = applyRotation(scaledPos, rotation)

        // Apply position
        vertices.push({
          x: position.x + rotatedPos.x,
          y: position.y + rotatedPos.y,
          z: position.z + rotatedPos.z,
        })
      }
      break

    case "circle":
      for (let i = 0; i < elementCount; i++) {
        const angle = (i * 2 * Math.PI) / elementCount
        const localPos = {
          x: Math.cos(angle) * radius,
          y: 0,
          z: Math.sin(angle) * radius,
        }

        // Apply scale
        const scaledPos = {
          x: localPos.x * scale.x,
          y: localPos.y * scale.y,
          z: localPos.z * scale.z,
        }

        // Apply rotation
        const rotatedPos = applyRotation(scaledPos, rotation)

        // Apply position
        vertices.push({
          x: position.x + rotatedPos.x,
          y: position.y + rotatedPos.y,
          z: position.z + rotatedPos.z,
        })
      }
      break

    case "line":
      for (let i = 0; i < elementCount; i++) {
        const t = elementCount > 1 ? i / (elementCount - 1) : 0.5
        const localPos = {
          x: -lineLength * 0.5 + t * lineLength,
          y: 0,
          z: 0,
        }

        // Apply scale
        const scaledPos = {
          x: localPos.x * scale.x,
          y: localPos.y * scale.y,
          z: localPos.z * scale.z,
        }

        // Apply rotation
        const rotatedPos = applyRotation(scaledPos, rotation)

        // Apply position
        vertices.push({
          x: position.x + rotatedPos.x,
          y: position.y + rotatedPos.y,
          z: position.z + rotatedPos.z,
        })
      }
      break

    default:
      vertices.push({ x: position.x, y: position.y, z: position.z })
  }

  const endTime = performance.now()
  console.log(`Generated ${vertices.length} vertices in ${(endTime - startTime).toFixed(2)}ms`)

  return vertices
}
