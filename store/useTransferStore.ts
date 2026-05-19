import { create } from "zustand"
import type { Element, Layer } from "@/types"

interface TransferData {
  elements: Element[]
  layers: Layer[]
  clearExisting: boolean
  timestamp: number
  layerNames: string[]
}

interface TransferStore {
  transferData: TransferData | null
  setTransferData: (data: TransferData) => void
  clearTransferData: () => void
  hasTransferData: () => boolean
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  transferData: null,
  
  setTransferData: (data: TransferData) => {
    console.log('Transfer Store: Setting transfer data:', data)
    set({ transferData: data })
  },
  
  clearTransferData: () => {
    console.log('Transfer Store: Clearing transfer data')
    set({ transferData: null })
  },
  
  hasTransferData: () => {
    const data = get().transferData
    if (!data) return false
    
    // Check if data is recent (within 5 minutes)
    const now = Date.now()
    const isRecent = now - data.timestamp < 5 * 60 * 1000
    
    if (!isRecent) {
      get().clearTransferData()
      return false
    }
    
    return true
  }
}))