"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Link2,
  Plus,
  Clock,
  X,
  ChevronDown,
  Trash2,
  Settings,
  Layers,
  Timer
} from "lucide-react"
import type { Element, Layer } from "@/types"
import { Play } from "next/font/google"

type ChainItem = {
  type: "element" | "delay"
  id: string
  elementId?: string
  elementIds?: string[]
  delay?: number
}

interface ChainPanelProps {
  layers?: Layer[]
  currentLayerId?: string | null
  chainSequence?: string[]
  onChainSequenceChange?: (sequence: string[]) => void
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
  selectedElementIds?: string[]
  chainItems?: ChainItem[]
  onChainItemsChange?: (items: ChainItem[]) => void
}

export function ChainPanel({
  layers = [],
  currentLayerId,
  selectedElementIds = [],
  chainItems = [],
  onChainItemsChange = () => { },
}: ChainPanelProps) {
  const [defaultDelay, setDefaultDelay] = useState(1)
  const [sequenceExpanded, setSequenceExpanded] = useState(true)
  const [settingsExpanded, setSettingsExpanded] = useState(false)


  const currentLayer = layers.find((layer) => layer.id === currentLayerId)

  const getElementById = (elementId: string): Element | undefined => {
    return currentLayer?.elements.find((el) => el.id === elementId)
  }

  const addSelectedToChain = () => {
    if (selectedElementIds.length === 0) return

    const newItems = [...chainItems]
    const groupId = `group-${Date.now()}`

    const existingElementIds = new Set<string>()
    newItems.forEach((item) => {
      if (item.elementId) existingElementIds.add(item.elementId)
      if (item.elementIds) item.elementIds.forEach((id) => existingElementIds.add(id))
    })

    const elementsToAdd = selectedElementIds.filter((elementId) => !existingElementIds.has(elementId))

    if (elementsToAdd.length > 0) {
      if (elementsToAdd.length === 1) {
        newItems.push({
          type: "element",
          id: groupId,
          elementId: elementsToAdd[0],
        })
      } else {
        newItems.push({
          type: "element",
          id: groupId,
          elementIds: elementsToAdd,
        })
      }
      onChainItemsChange(newItems)
    }
  }

  const removeItem = (index: number) => {
    const newItems = [...chainItems]
    newItems.splice(index, 1)
    onChainItemsChange(newItems)
  }

  const addDelay = () => {
    const newItems = [...chainItems]
    newItems.push({
      type: "delay",
      id: `delay-${Date.now()}`,
      delay: defaultDelay,
    })
    onChainItemsChange(newItems)
  }

  const addDelayAt = (index: number) => {
    const newItems = [...chainItems]
    newItems.splice(index, 0, {
      type: "delay",
      id: `delay-${Date.now()}`,
      delay: defaultDelay,
    })
    onChainItemsChange(newItems)
  }

  const updateDelay = (index: number, delay: number) => {
    const newItems = [...chainItems]
    if (newItems[index].type === "delay") {
      newItems[index].delay = delay
      onChainItemsChange(newItems)
    }
  }

  const clearChain = () => {
    onChainItemsChange([])
  }

  const activeCount = chainItems.length

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto scrollbar-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Chain Sequence</h3>
            <p className="text-sm text-gray-500">
              {activeCount} {activeCount === 1 ? "item" : "items"} in sequence
            </p>
          </div>
        </div>
      </div>

      {/* Add Elements Section */}
      <div className="flex-shrink-0 mb-6">
        <div className="space-y-3">
          {selectedElementIds.length > 0 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addSelectedToChain}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {selectedElementIds.length} Selected Element{selectedElementIds.length > 1 ? 's' : ''}
            </motion.button>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <Layers className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Select elements to add to chain</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addDelay}
              className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Clock className="w-4 h-4" />
              Add Delay
            </motion.button>

            {chainItems.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearChain}
                className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Chain Sequence Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSequenceExpanded(!sequenceExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">Sequence Items</h4>
              <p className="text-xs text-gray-500">{activeCount} items in chain</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: sequenceExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {sequenceExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                {chainItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Link2 className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No items in chain sequence</p>
                    <p className="text-xs text-gray-400 mt-1">Add elements or delays to create a sequence</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chainItems.map((item, index) => (
                      <div key={item.id}>
                        {/* Add Delay Button (before each item except first) */}
                        {index > 0 && (
                          <div className="flex justify-center py-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addDelayAt(index)}
                              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Delay
                            </motion.button>
                          </div>
                        )}

                        {/* Chain Item */}
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          {item.type === "element" ? (
                            <>
                              <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                                <Layers className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.elementIds ? `${item.elementIds.length} Elements` : "1 Element"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Step {index + 1}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center">
                                <Timer className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  Delay: {item.delay}s
                                </div>
                                <div className="text-xs text-gray-500">
                                  Step {index + 1}
                                </div>
                              </div>
                              <input
                                type="number"
                                value={item.delay || 1}
                                onChange={(e) => updateDelay(index, Number(e.target.value))}
                                className="w-16 px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
                                min="0.1"
                                step="0.1"
                              />
                            </>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(index)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Add Delay Button (after last item) */}
                        {index === chainItems.length - 1 && (
                          <div className="flex justify-center py-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addDelayAt(index + 1)}
                              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Delay
                            </motion.button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSettingsExpanded(!settingsExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">Chain Settings</h4>
              <p className="text-xs text-gray-500">Configure sequence behavior</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: settingsExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {settingsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Default Delay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Default Delay</span>
                    <span className="text-xs text-gray-500">{defaultDelay}s</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={defaultDelay}
                    onChange={(e) => setDefaultDelay(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}