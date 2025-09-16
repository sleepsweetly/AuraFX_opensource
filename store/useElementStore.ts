import { create } from "zustand"
import type { Element } from "../types"
import { autoGroupCirclesOnElements } from "../components/import-panel"

interface ElementStore {
  elements: Element[]
  setElements: (elements: Element[]) => void
  addElement: (element: Element) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
}

export const useElementStore = create<ElementStore>((set) => ({
  elements: [],
  setElements: (elements) => {
    autoGroupCirclesOnElements(elements, 5)
    set({ elements })
  },
  addElement: (element) => set((state) => {
    const newElements = [...state.elements, element]
    autoGroupCirclesOnElements(newElements, 5)
    return { elements: newElements }
  }),
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      ),
    })),
  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((element) => element.id !== id),
    })),
})) 