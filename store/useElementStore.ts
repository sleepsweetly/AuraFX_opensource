import { create } from "zustand";
import type { Element } from "../types";

interface ElementStore {
  elements: Record<string, Element>;
  setElements: (elements: Record<string, Element>) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  updateElements: (updates: Record<string, Partial<Element>>) => void;
  updateElementsBatch: (ids: string[], updates: Partial<Element>) => void;
  removeElements: (ids: string[]) => void;
  addElements: (elements: Element[]) => void;
  clearElements: () => void;
}

export const useElementStore = create<ElementStore>((set, get) => ({
  elements: {},
  setElements: (elements) => set({ elements }),
  updateElement: (id, updates) => set((state) => {
    if (!state.elements[id]) return state;
    return {
      elements: {
        ...state.elements,
        [id]: { ...state.elements[id], ...updates }
      }
    };
  }),
  updateElements: (updates) => set((state) => {
    let hasChanges = false;
    const nextElements = { ...state.elements };
    for (const id in updates) {
      if (nextElements[id]) {
        nextElements[id] = { ...nextElements[id], ...updates[id] };
        hasChanges = true;
      }
    }
    return hasChanges ? { elements: nextElements } : state;
  }),
  updateElementsBatch: (ids, updates) => set((state) => {
    let hasChanges = false;
    const nextElements = { ...state.elements };
    for (const id of ids) {
      if (nextElements[id]) {
        nextElements[id] = { ...nextElements[id], ...updates };
        hasChanges = true;
      }
    }
    return hasChanges ? { elements: nextElements } : state;
  }),
  removeElements: (ids) => set((state) => {
    const nextElements = { ...state.elements };
    let hasChanges = false;
    ids.forEach(id => {
      if (nextElements[id]) {
        delete nextElements[id];
        hasChanges = true;
      }
    });
    return hasChanges ? { elements: nextElements } : state;
  }),
  addElements: (newElements) => set((state) => {
    const nextElements = { ...state.elements };
    newElements.forEach(el => {
      nextElements[el.id] = el;
    });
    return { elements: nextElements };
  }),
  clearElements: () => set({ elements: {} })
}));