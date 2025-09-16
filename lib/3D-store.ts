import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { Element } from "../types"
import { useElementStore } from "../store/useElementStore"

export type EffectType = 
  | "particles"
  | "particlelinehelix"
  | "particleorbital"
  | "particlering"
  | "particleline"
  | "particlelinering"
  | "particlesphere"
  | "particletornado"

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Vertex {
  id: string
  position: Vector3
  effectType: EffectType
  layer: string
  color: string
  visible: boolean
  selected: boolean
  groupId?: string
}

export interface Shape {
  id: string
  type: "cube" | "circle" | "line" | "square" | "free" | "image" | "obj" | "spiral"
  position: Vector3
  rotation: Vector3
  scale: Vector3
  vertices: string[]
  visible: boolean
  selected: boolean
  elementCount?: number
  radius?: number
  lineLength?: number
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  color: string
  effectType: EffectType
  vertices: string[]
  elements: Element[]
  tickStart: number
  tickEnd: number
  tickDelay: number
  particle: string
  alpha: number
  shapeSize: number
  repeat: number
  yOffset: number
  repeatInterval: number
  targeter: string
  effectParams?: {
    distanceBetween?: number
    startYOffset?: number
    targetYOffset?: number
    fromOrigin?: boolean
    helixLength?: number
    helixRadius?: number
    helixRotation?: number
    maxDistance?: number
    radius?: number
    points?: number
    ticks?: number
    interval?: number
    rotationX?: number
    rotationY?: number
    rotationZ?: number
    offsetX?: number
    offsetY?: number
    offsetZ?: number
    angularVelocityX?: number
    angularVelocityY?: number
    angularVelocityZ?: number
    rotate?: boolean
    reversed?: boolean
    ringPoints?: number
    ringRadius?: number
    zigzag?: boolean
    zigzags?: number
    zigzagOffset?: number
    sphereRadius?: number
    maxRadius?: number
    tornadoHeight?: number
    tornadoInterval?: number
    tornadoDuration?: number
    rotationSpeed?: number
    sliceHeight?: number
    stopOnCasterDeath?: boolean
    stopOnEntityDeath?: boolean
    cloudParticle?: string
    cloudSize?: number
    cloudAmount?: number
    cloudHSpread?: number
    cloudVSpread?: number
    cloudPSpeed?: number
    cloudYOffset?: number
    ringpoints?: number
    ringradius?: number
    spiralRadius?: number
    spiralHeight?: number
    spiralTurns?: number
    spiralPoints?: number
    spiralInterval?: number
    spiralRotation?: number
  }
}

interface Store3D {
  // Core Data
  vertices: Vertex[]
  shapes: Shape[]
  layers: Layer[]
  currentLayer: Layer | null
  selectedElementIds: string[]

  // Selection & UI State
  selectedVertices: string[]
  selectedShapes: string[]
  currentTool: "select" | "move" | "rotate" | "scale"
  transformMode: "translate" | "rotate" | "scale"

  // Transform state for multi-selection
  transformCenter?: Vector3
  initialTransformPositions?: {
    vertices: Array<{ id: string; position: Vector3 }>
    shapes: Array<{ id: string; position: Vector3 }>
  }

  // Scene State
  camera: {
    position: Vector3
    target: Vector3
    isPerspective: boolean
  }
  scene: {
    showGrid: boolean
    showAxes: boolean
    gridSize: number
    snapToGrid: boolean
    gridOpacity: number
    gridVisible: boolean
    axesVisible: boolean
  }
  isLoading: boolean

  // Ana sistemle entegrasyon
  exportToMainSystem: () => Element[]
  importFromMainSystem: (elements: Element[]) => void
  syncWithMainSystem: (elements: Element[]) => void
  exportVerticesToMainSystem: () => void

  // Element işlemleri
  selectElement: (elementId: string, multi?: boolean) => void
}

export const use3DStore = create<Store3D>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    vertices: [],
    shapes: [],
    layers: [
      {
        id: "default",
        name: "Default Layer",
        visible: true,
        color: "#ffffff",
        effectType: "particles",
        vertices: [],
        elements: [],
        tickStart: 0,
        tickEnd: 100,
        tickDelay: 0,
        particle: "particles",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "self"
      },
    ],
    currentLayer: null,
    selectedElementIds: [],

    selectedVertices: [],
    selectedShapes: [],
    currentTool: "select",
    transformMode: "translate",

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
      gridVisible: true,
      axesVisible: true,
    },

    isLoading: false,

    // Ana sistemle entegrasyon fonksiyonları
    exportToMainSystem: () => {
      const { vertices, shapes } = get()
      const elements: Element[] = []

      // Vertex'leri dönüştür
      vertices.forEach(vertex => {
        elements.push({
          id: vertex.id,
          type: "free",
          position: {
            x: vertex.position.x,
            y: vertex.position.y,
            z: vertex.position.z
          },
          color: vertex.color,
          particle: vertex.effectType
        })
      })

      // Shape'leri dönüştür
      shapes.forEach(shape => {
        elements.push({
          id: shape.id,
          type: shape.type === "cube" ? "square" : (shape.type === "spiral" ? "free" : shape.type),
          position: {
            x: shape.position.x,
            y: shape.position.y,
            z: shape.position.z
          },
          color: "#ffffff",
          particle: "particles"
        })
      })

      return elements
    },

    importFromMainSystem: (elements: Element[]) => {
      const vertices: Vertex[] = elements.map(element => ({
        id: element.id,
        position: {
          x: element.position.x,
          y: element.position.y || 0,
          z: element.position.z
        },
        effectType: 'particles',
        layer: "default",
        color: element.color || "#ffffff",
        visible: true,
        selected: false
      }))

      set({ vertices })
    },

    syncWithMainSystem: (elements: Element[]) => {
      const { vertices } = get()
      const updatedVertices = vertices.map(vertex => {
        const element = elements.find(e => e.id === vertex.id)
        if (element) {
          return {
            ...vertex,
            position: {
              x: element.position.x,
              y: element.position.y || 0,
              z: element.position.z
            },
            color: element.color || vertex.color,
            effectType: (element.particle as EffectType) || vertex.effectType
          }
        }
        return vertex
      })

      set({ vertices: updatedVertices })
    },

    // Vertex'leri ana sisteme aktar
    exportVerticesToMainSystem: () => {
      const { vertices } = get()
      const elements: Element[] = vertices.map(vertex => ({
        id: vertex.id,
        type: "free", // Vertex'ler için "free" tipini kullanıyoruz
        position: {
          x: vertex.position.x,
          y: vertex.position.y,
          z: vertex.position.z
        },
        color: vertex.color,
        particle: vertex.effectType,
        yOffset: vertex.position.y // yOffset olarak y pozisyonunu kullanıyoruz
      }))

      // Ana sistemin store'unu güncelle
      const mainStore = useElementStore.getState()
      mainStore.setElements(elements)
    },

    // Element işlemleri
    selectElement: (elementId: string, multi = false) => {
      set((state) => {
        if (multi) {
          const isSelected = state.selectedVertices.includes(elementId)
          return {
            selectedVertices: isSelected
              ? state.selectedVertices.filter((id) => id !== elementId)
              : [...state.selectedVertices, elementId],
          }
        } else {
          return { selectedVertices: [elementId] }
        }
      })
    }
  }))
) 