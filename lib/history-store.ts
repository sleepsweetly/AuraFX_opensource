import { create } from 'zustand'
import type { Layer, Element } from "../types"

// History'de saklanacak state snapshot'ı
interface HistorySnapshot {
  id: string
  timestamp: number
  layers: Layer[]
  settings: any
  modes: any
  currentTool: string
  selectedShapeIds: string[]
}

interface HistoryState {
  past: HistorySnapshot[]
  future: HistorySnapshot[]
  
  // History'ye snapshot ekle
  pushSnapshot: (snapshot: Omit<HistorySnapshot, 'id' | 'timestamp'>) => void
  
  // Geri al
  undo: () => HistorySnapshot | null
  
  // İleri al
  redo: () => HistorySnapshot | null
  
  // History'yi temizle
  clear: () => void
  
  // History boyutunu kontrol et
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  
  pushSnapshot: (snapshot) => {
    const newSnapshot: HistorySnapshot = {
      ...snapshot,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    
    set((state) => ({
      past: [...state.past, newSnapshot],
      future: [] // Yeni işlem yapıldığında future'ı temizle
    }))
  },
  
  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return null
    
    const lastSnapshot = past[past.length - 1]
    const newPast = past.slice(0, -1)
    
    set({
      past: newPast,
      future: [lastSnapshot, ...future]
    })
    
    return lastSnapshot
  },
  
  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return null
    
    const nextSnapshot = future[0]
    const newFuture = future.slice(1)
    
    set({
      past: [...past, nextSnapshot],
      future: newFuture
    })
    
    return nextSnapshot
  },
  
  clear: () => {
    set({ past: [], future: [] })
  },
  
  canUndo: () => {
    return get().past.length > 0
  },
  
  canRedo: () => {
    return get().future.length > 0
  }
})) 