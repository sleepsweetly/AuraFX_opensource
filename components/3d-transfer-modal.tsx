"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Box, Send, Layers, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useElementStore } from "@/store/useElementStore"
import type { Layer, Element } from "@/types"

interface Transfer3DModalProps {
  isOpen: boolean
  onClose: () => void
  layers: Layer[]
  currentLayer: Layer | null
  onExportElements?: (elements: Element[], simpleTransfer?: boolean) => void
}

export function Transfer3DModal({ isOpen, onClose, layers, currentLayer, onExportElements }: Transfer3DModalProps) {
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])
  const [clearExisting, setClearExisting] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)

  // Auto-select current layer when modal opens
  useEffect(() => {
    if (isOpen && currentLayer) {
      setSelectedLayers([currentLayer.id])
    }
  }, [isOpen, currentLayer])

  const handleLayerToggle = (layerId: string) => {
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    )
  }

  const handleSelectAll = () => {
    const visibleLayers = layers.filter(layer => layer.visible !== false)
    setSelectedLayers(visibleLayers.map(layer => layer.id))
  }

  const handleDeselectAll = () => {
    setSelectedLayers([])
  }

  const handleTransfer = async () => {
    setIsTransferring(true)
    
    try {
      // Get fresh elements from ElementStore for selected layers
      const elementsToTransfer: Element[] = []
      const currentElementMap = useElementStore.getState().elements
      
      selectedLayers.forEach(layerId => {
        const layer = layers.find(l => l.id === layerId)
        if (layer && layer.elements) {
          console.log(`Syncing ${layer.elements.length} elements from layer: ${layer.name}`)
          
          // Map to fresh elements from ElementStore
          const freshElements = layer.elements.map(el => {
            const fresh = currentElementMap[el.id]
            return fresh ? { ...el, ...fresh } : el
          })
          
          elementsToTransfer.push(...freshElements)
        }
      })

      console.log('Total elements to transfer:', elementsToTransfer.length)

      // Element olmasa bile 3D editöre yönlendir
      if (elementsToTransfer.length === 0) {
        console.warn('No elements found to transfer, but opening 3D editor anyway')
      } else {
        // Callback kullanarak export et
        if (onExportElements) {
          onExportElements(elementsToTransfer, clearExisting)
        }
      }

      // 3D editöre yönlendir
      window.location.href = '/3d'
      
    } catch (error) {
      console.error('Transfer failed:', error)
      alert('Transfer failed: ' + error)
    } finally {
      setIsTransferring(false)
    }
  }

  const selectedElementCount = selectedLayers.reduce((count, layerId) => {
    const layer = layers.find(l => l.id === layerId)
    return count + (layer?.elements.length || 0)
  }, 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          className="relative w-full max-w-md bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-150 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Send to 3D Editor</h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Transfer layers to 3D workspace</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Layer Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider">Select Layers</h3>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-6 px-2.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/45 rounded-full"
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-6 px-2.5 text-[11px] font-semibold text-slate-500 dark:text-zinc-450 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full"
                  >
                    None
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hidden">
                {layers.map((layer) => {
                  const isSelected = selectedLayers.includes(layer.id)
                  return (
                    <motion.div
                      key={layer.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 text-blue-900 dark:text-blue-100"
                          : "border-gray-200/60 dark:border-zinc-800/60 hover:border-gray-300 dark:hover:border-zinc-700 bg-transparent text-slate-700 dark:text-zinc-300"
                      }`}
                      onClick={() => handleLayerToggle(layer.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                          layer.visible !== false 
                            ? 'bg-slate-50 dark:bg-zinc-900 border-gray-150 dark:border-zinc-800' 
                            : 'bg-gray-100 dark:bg-zinc-800 opacity-60 border-transparent'
                        }`}>
                          <Layers className={`w-3.5 h-3.5 ${layer.visible !== false ? 'text-slate-650 dark:text-zinc-400' : 'text-slate-400'}`} />
                        </div>
                        {layer.visible !== false ? (
                          <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-350 dark:text-zinc-650" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{layer.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                          {layer.elements.length} element{layer.elements.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-zinc-700 bg-transparent"
                      }`}>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-3 border-t border-gray-150 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-350">Clear Existing Elements</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-450">Remove current active 3D workspace elements</div>
                </div>
                <button
                  onClick={() => setClearExisting(!clearExisting)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                    clearExisting ? 'bg-slate-900 dark:bg-zinc-100' : 'bg-gray-250 dark:bg-zinc-800'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-200 ${
                      clearExisting 
                        ? 'translate-x-5.5 bg-white dark:bg-zinc-900' 
                        : 'translate-x-1 bg-white dark:bg-zinc-400'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-2xl p-4 border border-blue-500/10 dark:border-blue-500/20">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <div className="w-5 h-5 rounded-md bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Send className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold">
                  {selectedElementCount > 0 
                    ? `Ready to transfer ${selectedElementCount} elements from ${selectedLayers.length} layer${selectedLayers.length !== 1 ? 's' : ''}`
                    : 'Ready to open 3D Editor (no elements selected)'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-150 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/30">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-650 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTransfer}
              disabled={isTransferring}
              className="h-9 px-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-650 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/15"
            >
              {isTransferring ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Opening 3D...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {selectedElementCount > 0 ? `Send ${selectedElementCount} elements` : 'Open 3D Editor'}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}