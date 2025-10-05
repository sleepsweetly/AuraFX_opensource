"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Link2, Plus, Clock, X } from "lucide-react"
import type { Element, Layer } from "@/types"

type ChainItem = {
  type: "element" | "delay"
  id: string
  elementId?: string
  elementIds?: string[]
  delay?: number
}

interface ChainPanelProps {
  layers: Layer[]
  currentLayerId: string | null
  chainSequence: string[]
  onChainSequenceChange: (sequence: string[]) => void
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
  selectedElementIds?: string[]
  chainItems?: ChainItem[]
  onChainItemsChange?: (items: ChainItem[]) => void
}

export function ChainPanel({
  layers,
  currentLayerId,
  selectedElementIds = [],
  chainItems = [],
  onChainItemsChange,
}: ChainPanelProps) {
  const [defaultDelay, setDefaultDelay] = useState(1)
  const [showDropZones, setShowDropZones] = useState(false)

  if (!chainItems) {
    console.error("ChainPanel: chainItems prop is undefined!")
    return <div>Error: chainItems prop is missing</div>
  }
  const currentLayer = layers.find((layer) => layer.id === currentLayerId)

  console.log("ChainPanel Debug:", {
    layersCount: layers.length,
    currentLayerId,
    currentLayer: currentLayer?.name,
    currentLayerElementsCount: currentLayer?.elements.length || 0,
    selectedElementIds,
    selectedElementIdsCount: selectedElementIds.length,
    chainItemsCount: chainItems.length,
    chainItemsActual: chainItems,
    onChainItemsChange: !!onChainItemsChange,
    chainItemsType: typeof chainItems,
    chainItemsIsArray: Array.isArray(chainItems),
  })

  const getElementById = (elementId: string): Element | undefined => {
    return currentLayer?.elements.find((el) => el.id === elementId)
  }

  const addSelectedToChain = () => {
    console.log("addSelectedToChain called:", {
      onChainItemsChange: !!onChainItemsChange,
      selectedElementIds,
      selectedElementIdsLength: selectedElementIds.length,
      chainItemsLength: chainItems.length,
    })

    if (!onChainItemsChange || selectedElementIds.length === 0) {
      console.log("Early return:", {
        hasCallback: !!onChainItemsChange,
        hasSelected: selectedElementIds.length > 0,
      })
      return
    }

    const newItems = [...chainItems]
    const groupId = `group-${Date.now()}`

    const existingElementIds = new Set<string>()
    newItems.forEach((item) => {
      if (item.elementId) existingElementIds.add(item.elementId)
      if (item.elementIds) item.elementIds.forEach((id) => existingElementIds.add(id))
    })

    const elementsToAdd = selectedElementIds.filter((elementId) => !existingElementIds.has(elementId))

    console.log("Elements to add:", {
      existingElementIds: Array.from(existingElementIds),
      elementsToAdd,
      elementsToAddLength: elementsToAdd.length,
    })

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

      console.log("Calling onChainItemsChange with:", newItems)
      onChainItemsChange(newItems)
    } else {
      console.log("No new elements to add - all already exist in chain")
    }
  }

  const removeItem = (index: number) => {
    if (!onChainItemsChange) return
    const newItems = [...chainItems]
    newItems.splice(index, 1)
    onChainItemsChange(newItems)
  }

  const updateDelay = (index: number, delay: number) => {
    if (!onChainItemsChange) return
    const newItems = [...chainItems]
    if (newItems[index].type === "delay") {
      newItems[index].delay = delay
      onChainItemsChange(newItems)
    }
  }

  const clearChain = () => {
    if (!onChainItemsChange) return
    onChainItemsChange([])
  }

  const addDelayAt = (index: number) => {
    if (!onChainItemsChange) return

    const newItems = [...chainItems]
    newItems.splice(index, 0, {
      type: "delay",
      id: `delay-${Date.now()}`,
      delay: defaultDelay,
    })
    onChainItemsChange(newItems)
    setShowDropZones(false)
  }

  const activeCount = chainItems.length

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
              <Link2 className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Chain Sequence</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeCount} {activeCount === 1 ? "item" : "items"} in sequence
              </p>
            </div>
          </div>
          {chainItems.length > 0 && (
            <button
              onClick={clearChain}
              className="text-xs font-medium text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f9fafb;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 4px;
                        transition: background 0.2s;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                `}</style>

        <div className="space-y-3">
          {selectedElementIds.length > 0 ? (
            <Button
              onClick={addSelectedToChain}
              size="sm"
              className="w-full h-11 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-sm hover:shadow-md transition-all font-medium"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Add Selected Elements ({selectedElementIds.length})
            </Button>
          ) : (
            <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mx-auto mb-3">
                <Link2 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No Elements Selected</p>
              <p className="text-xs text-gray-500">Select elements on canvas to add them to the chain</p>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <Label className="text-sm font-medium text-gray-700">Default Delay:</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={defaultDelay}
                onChange={(e) => setDefaultDelay(Number(e.target.value))}
                className="w-20 h-9 text-sm border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-500">ticks</span>
            </div>
            <Button
              onClick={() => setShowDropZones(!showDropZones)}
              size="sm"
              variant={showDropZones ? "default" : "outline"}
              className={`h-9 px-3 transition-all ${
                showDropZones
                  ? "bg-gray-900 hover:bg-black text-white"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Plus className={`w-4 h-4 transition-transform duration-300 ${showDropZones ? "rotate-45" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {chainItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-sm">
                <Link2 className="w-9 h-9 text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-700 mb-2">Empty Chain Sequence</h4>
              <p className="text-sm text-gray-500 max-w-xs mb-4 leading-relaxed">
                Build your animation chain by selecting elements on the canvas and adding them to the sequence
              </p>
              {selectedElementIds.length > 0 && (
                <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                  {selectedElementIds.length} element{selectedElementIds.length !== 1 ? "s" : ""} selected
                </div>
              )}
              {!currentLayer && (
                <div className="inline-flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 px-4 py-2 rounded-full border border-red-200 mt-2">
                  <X className="w-3 h-3" />
                  No active layer found
                </div>
              )}
            </div>
          ) : (
            chainItems.map((item, index) => (
              <div key={item.id}>
                {showDropZones && index > 0 && chainItems[index - 1].type === "element" && (
                  <div
                    onClick={() => addDelayAt(index)}
                    className="h-10 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:from-gray-100 hover:to-gray-200/50 transition-all mb-3 group"
                  >
                    <Clock className="w-4 h-4 text-gray-400 mr-2 group-hover:text-gray-600 transition-colors" />
                    <span className="text-gray-500 text-xs font-medium group-hover:text-gray-700 transition-colors">
                      Add delay ({defaultDelay} ticks)
                    </span>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
                  {item.type === "element" ? (
                    (() => {
                      const isGroup = item.elementIds && item.elementIds.length > 1
                      const elementIds = isGroup ? item.elementIds! : [item.elementId!]
                      const elements = elementIds.map((id) => getElementById(id)).filter(Boolean)

                      if (elements.length === 0) return null

                      const groupNumber = chainItems.filter(
                        (_, i) => i <= index && chainItems[i].type === "element",
                      ).length

                      return (
                        <div className="group relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                {groupNumber}
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-900 block">
                                  {isGroup ? `Element Group` : "Single Element"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {elements.length} {elements.length === 1 ? "element" : "elements"}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(index)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 border border-gray-200 hover:border-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                            </button>
                          </div>

                          {isGroup && (
                            <div className="grid grid-cols-6 gap-2">
                              {elements.map((element) => {
                                if (!element) return null
                                return (
                                  <div
                                    key={element.id}
                                    className="p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 text-center hover:shadow-sm transition-all"
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full mx-auto mb-1.5 shadow-sm"
                                      style={{ backgroundColor: element.color || currentLayer?.color || "#000" }}
                                    />
                                    <div className="text-[10px] font-medium text-gray-600 truncate">{element.type}</div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })()
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <Label className="text-sm font-medium text-gray-700">Delay:</Label>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={item.delay || 1}
                            onChange={(e) => updateDelay(index, Number(e.target.value))}
                            className="w-20 h-9 text-sm border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                          />
                          <span className="text-sm text-gray-500 font-medium">ticks</span>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 border border-gray-200 hover:border-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {showDropZones && chainItems.length > 0 && chainItems[chainItems.length - 1].type === "element" && (
            <div
              onClick={() => addDelayAt(chainItems.length)}
              className="h-10 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:from-gray-100 hover:to-gray-200/50 transition-all group"
            >
              <Clock className="w-4 h-4 text-gray-400 mr-2 group-hover:text-gray-600 transition-colors" />
              <span className="text-gray-500 text-xs font-medium group-hover:text-gray-700 transition-colors">
                Add delay ({defaultDelay} ticks)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
