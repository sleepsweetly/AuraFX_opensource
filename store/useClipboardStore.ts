import { create } from "zustand"
import type { Element } from "../types"
import { v4 as uuidv4 } from "uuid"

interface ClipboardStore {
  copiedElements: Element[]
  copyElements: (elements: Element[]) => void
  clearClipboard: () => void
  pasteElements: (offsetX?: number, offsetY?: number) => Element[]
}

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  copiedElements: [],
  
  copyElements: (elements: Element[]) => {
    set({ copiedElements: elements })
  },
  
  clearClipboard: () => {
    set({ copiedElements: [] })
  },
  
  pasteElements: (offsetX = 0, offsetY = 0) => {
    const { copiedElements } = get()
    
    // Create new elements with new IDs and offset positions
    const pastedElements = copiedElements.map(element => ({
      ...element,
      id: uuidv4(),
      position: {
        ...element.position,
        x: element.position.x + offsetX,
        z: element.position.z + offsetY
      },
      // yOffset'i de koru
      yOffset: element.yOffset,
      // Diğer önemli özellikleri de koru
      color: element.color,
      particle: element.particle,
      alpha: element.alpha,
      repeat: element.repeat,
      interval: element.interval,
      scale: element.scale,
      meta: element.meta,
      elementCount: element.elementCount,
      groupId: element.groupId
    }))
    
    return pastedElements
  }
})) 