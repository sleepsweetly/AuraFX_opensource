import { create } from "zustand";
import type { Layer, Element } from "../types";
import { useElementStore } from "./useElementStore";

interface LayerStore {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
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
  setLayers: (layers) => {
    // Tüm layerlardaki elementleri ElementStore'a yükle (hydrate)
    const allElements: Element[] = [];
    layers.forEach(l => {
      if (l.elements) {
        allElements.push(...l.elements);
      }
    });
    if (allElements.length > 0) {
      useElementStore.getState().addElements(allElements);
    }

    set((state) => ({
      layers,
      currentLayerId: state.currentLayerId || (layers.find(l => l.id === "default")?.id ?? (layers[0]?.id ?? null)),
    }));
  },
  setCurrentLayerId: (id) => set({ currentLayerId: id }),
  setPerformanceMode: (enabled) => set({ performanceMode: enabled }),
  setCopiedLayer: (layer) => set({ copiedLayer: layer }),
  addLayer: (layer) => {
    if (layer.elements && layer.elements.length > 0) {
      useElementStore.getState().addElements(layer.elements);
    }
    set((state) => ({
      layers: [...state.layers, layer],
      currentLayerId: state.currentLayerId || layer.id
    }));
  },
  addElementsToLayer: (layerId, elements, clearExisting = false) => {
    useElementStore.getState().addElements(elements);
    
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
    }));
  },
  copyLayer: (layerId) => {
    const state = get();
    const layerToCopy = state.layers.find(layer => layer.id === layerId);
    if (layerToCopy) {
      // Elementleri en güncel halleriyle ElementStore'dan alarak kopyala
      const currentElementMap = useElementStore.getState().elements;
      
      const copiedLayer: Layer = {
        ...layerToCopy,
        id: `copied_${Date.now()}`, // Geçici ID
        name: `${layerToCopy.name} (Copy)`,
        elements: layerToCopy.elements.map(element => {
          const freshElement = currentElementMap[element.id] || element;
          return {
            ...freshElement,
            id: `copied_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Yeni element ID'leri
          };
        })
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
      
      if (newLayer.elements.length > 0) {
        useElementStore.getState().addElements(newLayer.elements);
      }
      
      set((state) => ({
        layers: [...state.layers, newLayer],
        currentLayerId: newLayer.id
      }));
    }
  },
})); 