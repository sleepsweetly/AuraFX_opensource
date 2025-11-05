"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Box, Send, Layers, Eye, EyeOff } from "lucide-react"
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
      // Get elements from selected layers
      const elementsToTransfer: Element[] = []
      
      selectedLayers.forEach(layerId => {
        const layer = layers.find(l => l.id === layerId)
        if (layer) {
          console.log(`Adding ${layer.elements.length} elements from layer: ${layer.name}`)
          elementsToTransfer.push(...layer.elements)
        }
      })

      console.log('Total elements to transfer:', elementsToTransfer.length)

      // Element olmasa bile 3D editöre yönlendir
      if (elementsToTransfer.length === 0) {
        console.warn('No elements found to transfer, but opening 3D editor anyway')
      } else {
        // Callback kullanarak export et (yedekteki sistem gibi)
        if (onExportElements) {
          onExportElements(elementsToTransfer, clearExisting)
        }
      }

      // 3D editöre yönlendir (element olsun olmasın)
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - 2D Style */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Export to 3D Editor</h2>
                <p className="text-gray-500 text-sm mt-1">Transfer layers to 3D workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content - Modern Light */}
          <div className="p-6 space-y-6">
            {/* Layer Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Select Layers to Export
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="h-7 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="h-7 px-3 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedLayers.includes(layer.id)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleLayerToggle(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Layers className="w-3 h-3 text-gray-600" />
                      </div>
                      {layer.visible !== false ? (
                        <Eye className="w-3 h-3 text-green-500" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{layer.name}</div>
                      <div className="text-xs text-gray-500">
                        {layer.elements.length} elements
                      </div>
                    </div>

                    <div 
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedLayers.includes(layer.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedLayers.includes(layer.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Replace Mode
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Clear existing 3D elements before import</div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    clearExisting ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setClearExisting(!clearExisting)}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      clearExisting ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 text-blue-700">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {selectedElementCount > 0 
                      ? `Ready to export ${selectedElementCount} elements`
                      : 'Ready to open 3D Editor'
                    }
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {selectedLayers.length > 0 
                      ? `From ${selectedLayers.length} layer${selectedLayers.length !== 1 ? 's' : ''}`
                      : 'No layers selected'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - 2D Style */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={isTransferring}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opening 3D...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {selectedElementCount > 0 ? `Export ${selectedElementCount} elements` : 'Open 3D Editor'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}