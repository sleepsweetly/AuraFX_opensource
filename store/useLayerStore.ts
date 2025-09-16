import { create } from "zustand";
import type { Layer, Element } from "../types";

interface LayerStore {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  addElementsToLayer: (layerId: string, elements: Element[], clearExisting?: boolean) => void;
  currentLayerId: string | null;
  setCurrentLayerId: (id: string) => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  // Kopyalama fonksiyonları
  copyLayer: (layerId: string) => void;
  pasteLayer: () => void;
  copiedLayer: Layer | null;
  setCopiedLayer: (layer: Layer | null) => void;
}

export const useLayerStore = create<LayerStore>((set, get) => ({
  layers: [],
  currentLayerId: null,
  performanceMode: false,
  copiedLayer: null,
  setLayers: (layers) => set((state) => ({
    layers,
    currentLayerId: state.currentLayerId || (layers.find(l => l.id === "default")?.id ?? (layers[0]?.id ?? null)),
  })),
  setCurrentLayerId: (id) => set({ currentLayerId: id }),
  setPerformanceMode: (enabled) => set({ performanceMode: enabled }),
  setCopiedLayer: (layer) => set({ copiedLayer: layer }),
  addElementsToLayer: (layerId, elements, clearExisting = false) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { 
              ...layer, 
              elements: clearExisting 
                ? [...elements] // Sade geçiş: mevcut elementleri temizle
                : [...layer.elements, ...elements] // Normal geçiş: mevcut elementlerin üzerine ekle
            }
          : layer
      ),
    })),
  copyLayer: (layerId) => {
    const state = get();
    const layerToCopy = state.layers.find(layer => layer.id === layerId);
    if (layerToCopy) {
      // Elementleri de kopyalayarak yeni bir layer oluştur
      const copiedLayer: Layer = {
        ...layerToCopy,
        id: `copied_${Date.now()}`, // Geçici ID
        name: `${layerToCopy.name} (Copy)`,
        elements: layerToCopy.elements.map(element => ({
          ...element,
          id: `copied_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Yeni element ID'leri
        }))
      };
      set({ copiedLayer: copiedLayer });
    }
  },
  pasteLayer: () => {
    const state = get();
    if (state.copiedLayer) {
      const newLayer: Layer = {
        ...state.copiedLayer,
        id: `layer_${Date.now()}`,
        name: state.copiedLayer.name.replace(' (Copy)', '') + ` (Copy ${Date.now()})`,
        elements: state.copiedLayer.elements.map(element => ({
          ...element,
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      set((state) => ({
        layers: [...state.layers, newLayer],
        currentLayerId: newLayer.id
      }));
    }
  },
})); 