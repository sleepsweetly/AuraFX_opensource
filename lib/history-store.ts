import { create } from 'zustand'
import type { Layer, Element } from "../types"

// History'de saklanacak state snapshot'ı
interface HistorySnapshot {
  id: string
  timestamp: number
  layers: Layer[]
  elements: Record<string, Element>
  settings: any
  modes: any
  currentTool: string
  selectedShapeIds: string[]
  action?: string // İşlem türü (opsiyonel, geriye uyumluluk için)
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

const MAX_HISTORY_SIZE = 50

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  
  pushSnapshot: (snapshot) => {
    const newSnapshot: HistorySnapshot = {
      ...snapshot,
      // Verileri derin kopyala (önemli!)
      layers: JSON.parse(JSON.stringify(snapshot.layers)),
      elements: JSON.parse(JSON.stringify(snapshot.elements || {})),
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    
    set((state) => {
      const newPast = [...state.past, newSnapshot]
      // Limit uygula
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift()
      }
      return {
        past: newPast,
        future: [] // Yeni işlem yapıldığında future'ı temizle
      }
    })
  },
  
  undo: () => {
    const { past, future } = get()
    if (past.length <= 1) return null // Şu anki state'i tutmak için en az 1 eleman lazım mı?
    // Aslında past'ın sonuncusu şu anki state ise, bir öncekine gitmeliyiz.
    
    const newPast = [...past]
    const currentSnapshot = newPast.pop()!
    const previousSnapshot = newPast[newPast.length - 1]
    
    if (!previousSnapshot) return null
    
    set({
      past: newPast,
      future: [currentSnapshot, ...future]
    })
    
    return previousSnapshot
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