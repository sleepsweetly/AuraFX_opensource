import { create } from 'zustand';

interface SelectionStore {
  selectedElementIds: string[];
  setSelectedElementIds: (ids: string[]) => void;
  clearSelection: () => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedElementIds: [],
  
  setSelectedElementIds: (ids: string[]) => set({ selectedElementIds: ids }),
  
  clearSelection: () => set({ selectedElementIds: [] }),
  
  addToSelection: (id: string) => set((state) => ({
    selectedElementIds: [...state.selectedElementIds, id]
  })),
  
  removeFromSelection: (id: string) => set((state) => ({
    selectedElementIds: state.selectedElementIds.filter(existingId => existingId !== id)
  })),
  
  toggleSelection: (id: string) => set((state) => {
    const isSelected = state.selectedElementIds.includes(id);
    return {
      selectedElementIds: isSelected 
        ? state.selectedElementIds.filter(existingId => existingId !== id)
        : [...state.selectedElementIds, id]
    };
  }),
}));