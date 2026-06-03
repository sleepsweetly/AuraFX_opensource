"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight } from "lucide-react"
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
  const [isTransferring, setIsTransferring] = useState(false)

  useEffect(() => {
    if (isOpen && currentLayer) {
      setSelectedLayers([currentLayer.id])
    }
  }, [isOpen, currentLayer])

  const handleTransfer = async () => {
    setIsTransferring(true)
    
    try {
      const elementsToTransfer: Element[] = []
      const currentElementMap = useElementStore.getState().elements
      
      selectedLayers.forEach(layerId => {
        const layer = layers.find(l => l.id === layerId)
        if (layer?.elements) {
          const freshElements = layer.elements.map(el => {
            const fresh = currentElementMap[el.id]
            return fresh ? { ...el, ...fresh } : el
          })
          elementsToTransfer.push(...freshElements)
        }
      })

      if (elementsToTransfer.length > 0 && onExportElements) {
        onExportElements(elementsToTransfer, false)
      }

      window.location.href = '/3d'
    } catch (error) {
      console.error('Transfer failed:', error)
    } finally {
      setIsTransferring(false)
    }
  }

  const selectedCount = selectedLayers.reduce((count, layerId) => {
    const layer = layers.find(l => l.id === layerId)
    return count + (layer?.elements.length || 0)
  }, 0)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transfer to 3D</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Layers */}
        <div className="p-5 space-y-2 max-h-80 overflow-y-auto">
          {layers.map((layer) => {
            const isSelected = selectedLayers.includes(layer.id)
            return (
              <button
                key={layer.id}
                onClick={() => {
                  setSelectedLayers(prev => 
                    prev.includes(layer.id) 
                      ? prev.filter(id => id !== layer.id)
                      : [...prev, layer.id]
                  )
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-zinc-600"
                }`}>
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{layer.name}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">{layer.elements.length} elements</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-zinc-900">
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            {selectedCount} selected
          </span>
          <button
            onClick={handleTransfer}
            disabled={isTransferring}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {isTransferring ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Opening
              </>
            ) : (
              <>
                Transfer
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
