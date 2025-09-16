import { create } from 'zustand'

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

interface ActionRecordingState {
  isRecording: boolean
  records: ActionRecord[]
  lastActionTime: number | null
  lastElementPositions: Record<string, { x: number, z: number, yOffset: number }> // Son element pozisyonları
  addElementDelay: boolean // Element eklerken delay ekleme ayarı
  
  // Actions
  startRecording: () => void
  stopRecording: () => void
  clearRecords: () => void
  deleteRecord: (id: string) => void
  
  // Record actions
  recordRotate: (elementIds: string[], angle: number, center: { x: number, y: number }) => void
  recordScale: (elementIds: string[], scaleFactor: number, originalPositions: { id: string, x: number, z: number, yOffset: number }[]) => void
  recordMove: (elementIds: string[], deltaX: number, deltaZ: number, deltaYOffset?: number) => void
  recordColorChange: (elementIds: string[], color: string) => void
  recordParticleCountChange: (elementIds: string[], particleCount: number) => void
  recordSelect: (elementIds: string[], selectionType: 'single' | 'box' | 'clear', selectionBox?: { start: { x: number, y: number }, end: { x: number, y: number } }) => void
  recordMoveContinuous: (elementIds: string[], positions: { id: string, x: number, z: number, yOffset: number }[]) => void
  
  // New transform recording functions
  recordTransformUpdate: (elementIds: string[], transformType: 'translate' | 'rotate' | 'scale', currentPositions?: { id: string, x: number, z: number, yOffset: number }[], currentRotations?: { id: string, rotation: number }[], currentScales?: { id: string, scale: number }[]) => void
  recordTransformEnd: (elementIds: string[], transformType: 'translate' | 'rotate' | 'scale', finalPositions?: { id: string, x: number, z: number, yOffset: number }[], finalRotations?: { id: string, rotation: number }[], finalScales?: { id: string, scale: number }[]) => void
  
  // Enhanced select recording
  recordSelectSingle: (elementId: string) => void
  recordSelectBox: (elementIds: string[], selectionBox: { start: { x: number, y: number }, end: { x: number, y: number } }) => void
  recordSelectClear: () => void
  
  // Element add recording
  recordElementAdd: (elementId: string, elementType: string, position: { x: number, z: number }, yOffset: number, color: string, elementCount: number) => void
  
  // Idle recording (elementleri korumak için)
  recordIdle: (elementIds: string[], duration: number) => void
  
  // Settings
  toggleAddElementDelay: () => void
  
  // Utility
  calculateDelayTicks: (currentTime: number) => number
}

export const useActionRecordingStore = create<ActionRecordingState>((set, get) => ({
  isRecording: false,
  records: [],
  lastActionTime: null,
  lastElementPositions: {},
  addElementDelay: true, // Varsayılan olarak delay ekle
  
  startRecording: () => {
    set({ 
      isRecording: true, 
      records: [],
      lastActionTime: null 
    })
  },
  
  stopRecording: () => {
    set({ isRecording: false })
  },
  
  clearRecords: () => {
    set({ 
      records: [],
      lastActionTime: null 
    })
  },
  
  deleteRecord: (id: string) => {
    set(state => ({
      records: state.records.filter(record => record.id !== id)
    }))
  },
  
  
  calculateDelayTicks: (currentTime: number) => {
    const { lastActionTime } = get()
    if (!lastActionTime) return 1
    
    const timeDiffMs = currentTime - lastActionTime
    // Convert milliseconds to ticks: 1 second = 20 ticks, so 1 tick = 50ms
    return Math.max(1, Math.round(timeDiffMs / 50))
  },
  
  recordRotate: (elementIds: string[], angle: number, center: { x: number, y: number }) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `rotate-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'rotate',
      elementIds,
      data: {
        angle,
        center
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },
  
  recordScale: (elementIds: string[], scaleFactor: number, originalPositions: { id: string, x: number, z: number, yOffset: number }[]) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `scale-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'scale',
      elementIds,
      data: {
        scaleFactor,
        originalPositions
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },
  
  recordMove: (elementIds: string[], deltaX: number, deltaZ: number, deltaYOffset?: number) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `move-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'move',
      elementIds,
      data: {
        deltaX,
        deltaZ,
        deltaYOffset
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },
  
  recordColorChange: (elementIds: string[], color: string) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `color-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'color',
      elementIds,
      data: {
        color
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },
  
  recordParticleCountChange: (elementIds: string[], particleCount: number) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `particle-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'particle_count',
      elementIds,
      data: {
        particleCount
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },

  recordSelect: (elementIds: string[], selectionType: 'single' | 'box' | 'clear', selectionBox?: { start: { x: number, y: number }, end: { x: number, y: number } }) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `select-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'select',
      elementIds,
      data: {
        selectionType,
        selectionBox
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },

  recordMoveContinuous: (elementIds: string[], positions: { id: string, x: number, z: number, yOffset: number }[]) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `move-continuous-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'move_continuous',
      elementIds,
      data: {
        positions
      },
      delayTicks
    }
    
    // Son pozisyonları güncelle
    const updatedPositions = { ...get().lastElementPositions }
    positions.forEach(pos => {
      updatedPositions[pos.id] = {
        x: pos.x,
        z: pos.z,
        yOffset: pos.yOffset
      }
    })
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime,
      lastElementPositions: updatedPositions
    }))
  },

  // New transform recording functions

  recordTransformUpdate: (elementIds: string[], transformType: 'translate' | 'rotate' | 'scale', currentPositions?: { id: string, x: number, z: number, yOffset: number }[], currentRotations?: { id: string, rotation: number }[], currentScales?: { id: string, scale: number }[]) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `transform-update-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'transform_update',
      elementIds,
      data: {
        transformType,
        currentPositions,
        currentRotations,
        currentScales
      },
      delayTicks
    }
    
    // Son pozisyonları güncelle
    const updatedPositions = { ...get().lastElementPositions }
    if (currentPositions) {
      currentPositions.forEach(pos => {
        updatedPositions[pos.id] = {
          x: pos.x,
          z: pos.z,
          yOffset: pos.yOffset
        }
      })
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime,
      lastElementPositions: updatedPositions
    }))
  },

  recordTransformEnd: (elementIds: string[], transformType: 'translate' | 'rotate' | 'scale', finalPositions?: { id: string, x: number, z: number, yOffset: number }[], finalRotations?: { id: string, rotation: number }[], finalScales?: { id: string, scale: number }[]) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `transform-end-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'transform_end',
      elementIds,
      data: {
        transformType,
        currentPositions: finalPositions,
        currentRotations: finalRotations,
        currentScales: finalScales
      },
      delayTicks
    }
    
    // Son pozisyonları güncelle
    const updatedPositions = { ...get().lastElementPositions }
    if (finalPositions) {
      finalPositions.forEach(pos => {
        updatedPositions[pos.id] = {
          x: pos.x,
          z: pos.z,
          yOffset: pos.yOffset
        }
      })
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime,
      lastElementPositions: updatedPositions
    }))
  },

  // Enhanced select recording
  recordSelectSingle: (elementId: string) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `select-single-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'select_single',
      elementIds: [elementId],
      data: {
        selectionType: 'single'
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },

  recordSelectBox: (elementIds: string[], selectionBox: { start: { x: number, y: number }, end: { x: number, y: number } }) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `select-box-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'select_box',
      elementIds,
      data: {
        selectionType: 'box',
        selectionBox
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },

  recordSelectClear: () => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `select-clear-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'select',
      elementIds: [],
      data: {
        selectionType: 'clear'
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },

  recordElementAdd: (elementId: string, elementType: string, position: { x: number, z: number }, yOffset: number, color: string, elementCount: number) => {
    const { isRecording, calculateDelayTicks } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    const record: ActionRecord = {
      id: `element-add-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'element_add',
      elementIds: [elementId], // Element ID'sini ekle
      data: {
        elementType,
        position,
        yOffset,
        color,
        elementCount
      },
      delayTicks
    }
    
    // Son pozisyonları güncelle
    const updatedPositions = { ...get().lastElementPositions }
    updatedPositions[elementId] = {
      x: position.x,
      z: position.z,
      yOffset: yOffset
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime,
      lastElementPositions: updatedPositions
    }))
  },

  recordIdle: (elementIds: string[], duration: number) => {
    const { isRecording, calculateDelayTicks, lastElementPositions } = get()
    if (!isRecording) return
    
    const currentTime = Date.now()
    const delayTicks = calculateDelayTicks(currentTime)
    
    // Son pozisyonları al
    const lastPositions = elementIds.map(id => {
      const pos = lastElementPositions[id]
      return pos ? { id, ...pos } : { id, x: 0, z: 0, yOffset: 0 }
    })
    
    const record: ActionRecord = {
      id: `idle-${currentTime}-${Math.random()}`,
      timestamp: currentTime,
      type: 'idle',
      elementIds,
      data: {
        idleDuration: duration,
        lastPositions // Son pozisyonları data'ya ekle
      },
      delayTicks
    }
    
    set(state => ({
      records: [...state.records, record],
      lastActionTime: currentTime
    }))
  },

  toggleAddElementDelay: () => {
    set(state => ({
      addElementDelay: !state.addElementDelay
    }))
  }
}))
