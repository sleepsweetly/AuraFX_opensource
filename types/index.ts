import { EffectType } from "../app/page";

export interface Position {
  x: number;
  y?: number;
  z: number;
}

export interface Element {
  id: string
  type: "free" | "circle" | "square" | "triangle" | "line" | "image" | "obj" | "gif"
  position: Position
  color?: string
  yOffset?: number
  groupId?: string
  elementCount?: number
  particle?: string
  alpha?: number
  repeat?: number
  interval?: number
  scale?: { x: number; y: number; z: number }
  meta?: any
  chainOrder?: number // Chain mode için sıra numarası
  frameIndex?: number // GIF frame numarası
  timestamp?: number // GIF frame zamanı (ms)
  animationGroup?: string // GIF animasyon grubu
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  elements: Element[]
  tickStart: number
  tickEnd: number
  tickDelay: number
  particle: string
  color: string
  alpha: number
  shapeSize: number
  repeat: number
  yOffset: number
  repeatInterval: number
  targeter: string
  effectType: EffectType
  frameIndex?: number // GIF frame numarası
  isGifFrame?: boolean // GIF frame'i mi?
  gifFrameCount?: number // Toplam GIF frame sayısı
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

export type Tool = "select" | "free" | "circle" | "square" | "triangle" | "line" | "eraser"

export interface ActionRecord {
  id: string
  timestamp: number
  type: 'rotate' | 'scale' | 'move' | 'color' | 'particle_count' | 'select' | 'move_continuous' | 'transform_update' | 'transform_end' | 'select_single' | 'select_box' | 'element_add' | 'idle'
  elementIds: string[]
  data: {
    // Rotate data
    angle?: number
    center?: { x: number, y: number }
    
    // Scale data
    scaleFactor?: number
    originalPositions?: { id: string, x: number, z: number, yOffset: number }[]
    
    // Move data
    deltaX?: number
    deltaZ?: number
    deltaYOffset?: number
    
    // Color data
    color?: string
    
    // Particle count data
    particleCount?: number
    
    // Select data
    selectionType?: 'single' | 'box' | 'clear'
    selectionBox?: { start: { x: number, y: number }, end: { x: number, y: number } }
    
    // Continuous move data
    positions?: { id: string, x: number, z: number, yOffset: number }[]
    
    // Transform data
    transformType?: 'translate' | 'rotate' | 'scale'
    startPositions?: { id: string, x: number, z: number, yOffset: number }[]
    currentPositions?: { id: string, x: number, z: number, yOffset: number }[]
    startRotations?: { id: string, rotation: number }[]
    currentRotations?: { id: string, rotation: number }[]
    startScales?: { id: string, scale: number }[]
    currentScales?: { id: string, scale: number }[]
    
    // Element add data
    elementType?: string
    position?: { x: number, z: number }
    yOffset?: number
    elementCount?: number
    
    // Idle data
    idleDuration?: number // ms cinsinden bekleme süresi
    lastPositions?: { id: string, x: number, z: number, yOffset: number }[] // Son pozisyonlar
  }
  delayTicks: number
}

// Lanyard component types

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

// Extend Three.js JSX elements
declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: any;
    meshLineMaterial: any;
  }
}
