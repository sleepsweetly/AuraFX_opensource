"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Box, Send, Layers, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Send to 3D Editor</h2>
                <p className="text-xs text-gray-500">Transfer layers to 3D workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Layer Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Select Layers</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 px-2 text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-7 px-2 text-xs"
                  >
                    None
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedLayers.includes(layer.id)
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleLayerToggle(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        layer.visible !== false ? 'bg-gray-100' : 'bg-gray-200 opacity-50'
                      }`}>
                        <Layers className="w-3 h-3 text-gray-600" />
                      </div>
                      {layer.visible !== false ? (
                        <Eye className="w-3 h-3 text-gray-500" />
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

                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedLayers.includes(layer.id)
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}>
                      {selectedLayers.includes(layer.id) && (
                        <div className="w-2 h-2 bg-white rounded-sm" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Clear Existing</div>
                  <div className="text-xs text-gray-500">Remove current 3D elements</div>
                </div>
                <Switch
                  checked={clearExisting}
                  onCheckedChange={setClearExisting}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedElementCount > 0 
                    ? `Ready to transfer ${selectedElementCount} elements from ${selectedLayers.length} layer${selectedLayers.length !== 1 ? 's' : ''}`
                    : 'Ready to open 3D Editor (no elements selected)'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={isTransferring}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isTransferring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Opening 3D...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {selectedElementCount > 0 ? `Send ${selectedElementCount} elements to 3D` : 'Open 3D Editor'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}