"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import {
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Layers as LayersIcon,
  Settings,
  Hash,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Clipboard,
  GripVertical,
} from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import type { Layer } from "@/types"
import { useLayerStore } from "@/store/useLayerStore"
import { motion, AnimatePresence } from "framer-motion"

interface LayerPanelProps {
  layers: Layer[]
  currentLayer: Layer | null
  onLayerSelect: (layer: Layer) => void
  onAddLayer: () => void
  onDeleteLayer: () => void
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void
  onClearAllLayers?: () => void
  settings: any
  onSettingsChange: (settings: any) => void
}

export function LayerPanel({
  layers,
  currentLayer,
  onLayerSelect,
  onAddLayer,
  onDeleteLayer,
  onUpdateLayer,
  onClearAllLayers,
  settings,
  onSettingsChange,
}: LayerPanelProps) {
  const [isEffectTypeModalOpen, setIsEffectTypeModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const currentLayerId = useLayerStore((state) => state.currentLayerId)
  const setCurrentLayerId = useLayerStore((state) => state.setCurrentLayerId)
  const copyLayer = useLayerStore((state) => state.copyLayer)
  const pasteLayer = useLayerStore((state) => state.pasteLayer)
  const copiedLayer = useLayerStore((state) => state.copiedLayer)
  const setLayers = useLayerStore((state) => state.setLayers)

  // Drag & Drop state
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null)
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<"above" | "below" | null>(null)
  const [dragEnableId, setDragEnableId] = useState<string | null>(null)

  const reorderLayers = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return
    const current = [...layers]
    const fromIndex = current.findIndex((l) => l.id === sourceId)
    const toIndex = current.findIndex((l) => l.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return
    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)
    setLayers(current)
  }

  useEffect(() => {
    if (!currentLayerId && layers.length > 0) {
      setCurrentLayerId(layers[0].id)
    }
  }, [currentLayerId, layers, setCurrentLayerId])

  const handleLayerSelect = (layer: Layer) => {
    setCurrentLayerId(layer.id)
    onLayerSelect(layer)
  }

  const handleLayerUpdate = (updatedLayer: Layer) => {
    onUpdateLayer(updatedLayer.id, updatedLayer)
  }

  return (
    <motion.section
      className="flex-1 h-full flex flex-col bg-[#000000] p-0 text-white"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Compact Header - Fixed */}
      <motion.div
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <LayersIcon className="w-4 h-4 text-white" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight text-white">Layers</h2>
          <p className="text-white/50 text-xs font-medium">
            {layers.length} layer{layers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy Layer Button */}
          {currentLayerId && (
            <motion.button
              onClick={() => copyLayer(currentLayerId)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/30 transition-all duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              title="Copy Layer"
            >
              <Copy className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {/* Paste Layer Button */}
          {copiedLayer && (
            <motion.button
              onClick={pasteLayer}
              className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              title="Paste Layer"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {onClearAllLayers && layers.some((layer) => layer.elements.length > 0) && (
            <motion.button
              onClick={onClearAllLayers}
              className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              title="Clear All Layers"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
          <motion.button
            onClick={onAddLayer}
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/30 hover:border-white/50 transition-all duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            title="Add Layer"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Scrollable Layer List Container */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 pt-3 pb-4 space-y-2">
          <AnimatePresence>
            {layers.map((layer, index) => (
              <motion.div
                key={layer.id}
                className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 overflow-hidden
                  ${
                    currentLayerId === layer.id
                      ? "border-white/40 bg-white/8 shadow-[0_0_12px_0_rgba(255,255,255,0.08)]"
                      : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6"
                  } ${dragOverLayerId === layer.id ? "ring-2 ring-white/40" : ""} ${draggingLayerId === layer.id ? "scale-[0.995]" : ""}`}
                onClick={() => handleLayerSelect(layer)}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{
                  delay: index * 0.03,
                  duration: 0.25,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                draggable={dragEnableId === layer.id}
                onDragStart={(e) => {
                  ;(e as unknown as React.DragEvent).dataTransfer.effectAllowed = "move"
                  setDraggingLayerId(layer.id)
                }}
                onDragOver={(e) => {
                  ;(e as unknown as React.DragEvent).preventDefault()
                  if (draggingLayerId) {
                    const target = e.currentTarget as unknown as HTMLElement
                    const rect = target.getBoundingClientRect()
                    const y = (e as unknown as React.DragEvent).clientY
                    const pos = y < rect.top + rect.height / 2 ? "above" : "below"
                    setDragOverLayerId(layer.id)
                    setDragOverPosition(pos)
                  }
                }}
                onDrop={(e) => {
                  ;(e as unknown as React.DragEvent).preventDefault()
                  if (draggingLayerId) {
                    // Eğer hedef altına bırakılıyorsa, reorder hedef index + 1 konumuna taşıyalım
                    if (dragOverPosition === "below") {
                      const current = [...layers]
                      const toIndex = current.findIndex((l) => l.id === layer.id)
                      const sourceId = draggingLayerId
                      if (toIndex !== -1) {
                        // Geçici olarak hedefin bir sonrasına bir hayali id ile taşıyalım
                        const afterId = current[toIndex + 1]?.id ?? layer.id
                        reorderLayers(sourceId, afterId)
                      } else {
                        reorderLayers(draggingLayerId, layer.id)
                      }
                    } else {
                      reorderLayers(draggingLayerId, layer.id)
                    }
                  }
                  setDraggingLayerId(null)
                  setDragOverLayerId(null)
                  setDragOverPosition(null)
                }}
                onDragEnd={() => {
                  setDraggingLayerId(null)
                  setDragOverLayerId(null)
                  setDragOverPosition(null)
                  setDragEnableId(null)
                }}
              >
                {/* Active indicator */}
                {currentLayerId === layer.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-white rounded-r-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Drop indicator */}
                {dragOverLayerId === layer.id && dragOverPosition && (
                  <div
                    className={`absolute left-2 right-2 z-20 ${dragOverPosition === "above" ? "-top-1.5" : "-bottom-1.5"}`}
                  >
                    <div className="h-[3px] bg-white/90 rounded shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                    <div className="absolute -left-2 -top-[5px] w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  </div>
                )}

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out rounded-lg" />

                <div className="relative z-10">
                  {/* Layer Header - Compact */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Order Badge */}
                      <span className="w-5 h-5 rounded-md bg-white/10 border border-white/20 text-[10px] text-white/80 flex items-center justify-center font-semibold select-none">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm text-white truncate max-w-[120px]">{layer.name}</span>
                      {currentLayerId === layer.id && (
                        <motion.span
                          className="bg-white text-black text-xs rounded-full px-1.5 py-0.5 font-bold text-[10px]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                        >
                          ACTIVE
                        </motion.span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Drag Handle */}
                      <motion.button
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setDragEnableId(layer.id)
                        }}
                        onMouseUp={(e) => {
                          e.stopPropagation()
                          setDragEnableId(null)
                        }}
                        className="w-6 h-6 rounded-md bg-white/8 hover:bg-white/15 text-white/60 hover:text-white/90 border border-white/15 hover:border-white/25 flex items-center justify-center transition-all duration-200 backdrop-blur-sm cursor-grab active:cursor-grabbing"
                        whileHover={{ scale: 1.1, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3 h-3" />
                      </motion.button>
                      {/* Copy Layer Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyLayer(layer.id)
                        }}
                        className="w-6 h-6 rounded-md bg-white/8 hover:bg-white/15 text-white/60 hover:text-white/90 border border-white/15 hover:border-white/25 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                        whileHover={{ scale: 1.1, y: -1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Copy Layer"
                      >
                        <Copy className="w-3 h-3" />
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdateLayer(layer.id, { visible: !layer.visible })
                        }}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 backdrop-blur-sm ${
                          layer.visible
                            ? "bg-white/15 text-white border border-white/25 hover:bg-white/20 hover:border-white/35"
                            : "bg-white/8 text-white/50 border border-white/15 hover:bg-white/12 hover:text-white/70 hover:border-white/20"
                        }`}
                        whileHover={{ scale: 1.1, y: -1 }}
                        whileTap={{ scale: 0.9 }}
                        title={layer.visible ? "Hide Layer" : "Show Layer"}
                      >
                        {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </motion.button>
                    </div>
                  </div>

                  {/* Layer Info - Compact Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center p-1.5 rounded-md bg-white/5 border border-white/10">
                      <div className="text-white/50 text-[10px] font-medium">Elements</div>
                      <div className="text-white text-sm font-bold">{layer.elements.length}</div>
                    </div>
                    <div className="text-center p-1.5 rounded-md bg-white/5 border border-white/10">
                      <div className="text-white/50 text-[10px] font-medium">Particle</div>
                      <div className="text-white text-xs font-semibold truncate">{layer.particle}</div>
                    </div>
                    <div className="text-center p-1.5 rounded-md bg-white/5 border border-white/10">
                      <div className="text-white/50 text-[10px] font-medium">Delay</div>
                      <div className="text-white text-sm font-bold">{layer.tickDelay}</div>
                    </div>
                  </div>

                  {/* Layer Color - Compact */}
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[10px] font-medium">Color:</span>
                    <ColorPicker
                      value={layer.color}
                      onChange={(color) => {
                        onUpdateLayer(layer.id, { color })
                        onSettingsChange({ ...settings, color })
                      }}
                      className="w-5 h-5"
                      showAlpha={false}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Card - Fixed at Bottom */}
      {currentLayer && (
        <motion.div
          className="mx-4 mb-4 rounded-lg bg-white/5 border border-white/10 shadow-lg overflow-hidden flex-shrink-0"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {/* Settings Header - Collapsible */}
          <motion.div
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-all duration-200 cursor-pointer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Settings className="w-3 h-3 text-white" />
              </motion.div>
              <span className="text-white font-semibold text-sm flex items-center gap-2">
                Settings
                <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border border-white/30">
                  {currentLayer.name}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {layers.length > 1 && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteLayer()
                  }}
                  className="px-2 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-medium flex items-center gap-1 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </motion.button>
              )}

              <motion.div
                animate={{ rotate: isSettingsOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/60"
              >
                {isSettingsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </motion.div>
            </div>
          </motion.div>

          {/* Settings Content - Collapsible */}
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-3 pt-0 border-t border-white/10">
                  {/* Settings Grid - Compact */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Y Offset */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-white/60 text-xs font-medium flex items-center gap-1">
                        <Hash className="w-3 h-3" />Y Offset
                        <span className="bg-white/10 text-white rounded px-1.5 py-0.5 text-[10px] ml-1 border border-white/20">
                          {currentLayer.yOffset ?? 0}
                        </span>
                      </Label>
                      <input
                        type="range"
                        min={-10}
                        max={10}
                        step={0.1}
                        value={currentLayer.yOffset ?? 0}
                        onChange={(e) => onUpdateLayer(currentLayer.id, { yOffset: Number.parseFloat(e.target.value) })}
                        className="w-full accent-white"
                      />
                      <input
                        type="number"
                        min={-10}
                        max={10}
                        step={0.1}
                        value={currentLayer.yOffset ?? 0}
                        onChange={(e) => onUpdateLayer(currentLayer.id, { yOffset: Number.parseFloat(e.target.value) })}
                        className="w-full bg-white/5 border border-white/20 rounded-md px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                        placeholder="0.0"
                      />
                    </div>

                    {/* Tick Delay */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-white/60 text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Tick Delay
                        <span className="bg-white/10 text-white rounded px-1.5 py-0.5 text-[10px] ml-1 border border-white/20">
                          {currentLayer.tickDelay ?? 0}
                        </span>
                      </Label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        step={1}
                        value={currentLayer.tickDelay ?? 0}
                        onChange={(e) =>
                          onUpdateLayer(currentLayer.id, { tickDelay: Number.parseInt(e.target.value) || 0 })
                        }
                        className="w-full bg-white/5 border border-white/20 rounded-md px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                        placeholder="20"
                      />
                      <span className="text-[10px] text-white/40">Delay between ticks (ms)</span>
                    </div>
                  </div>

                  {/* Additional Settings Row */}
                  <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t border-white/10">
                    {/* Alpha */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-white/60 text-xs font-medium flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/20 border border-white/30" />
                        Amount
                        <span className="bg-white/10 text-white rounded px-1.5 py-0.5 text-[10px] ml-1 border border-white/20">
                          {currentLayer.alpha ?? 1}
                        </span>
                      </Label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={currentLayer.alpha ?? 1}
                        onChange={(e) => onUpdateLayer(currentLayer.id, { alpha: Number.parseFloat(e.target.value) })}
                        className="w-full accent-white"
                      />
                    </div>

                    {/* Repeat */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-white/60 text-xs font-medium flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/20 border border-white/30 flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">R</span>
                        </div>
                        Repeat
                        <span className="bg-white/10 text-white rounded px-1.5 py-0.5 text-[10px] ml-1 border border-white/20">
                          {currentLayer.repeat ?? 1}
                        </span>
                      </Label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={currentLayer.repeat ?? 1}
                        onChange={(e) =>
                          onUpdateLayer(currentLayer.id, { repeat: Number.parseInt(e.target.value) || 1 })
                        }
                        className="w-full bg-white/5 border border-white/20 rounded-md px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <motion.button
                      onClick={() => onUpdateLayer(currentLayer.id, { visible: !currentLayer.visible })}
                      className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                        currentLayer.visible
                          ? "bg-white/15 text-white border border-white/25"
                          : "bg-white/8 text-white/50 border border-white/15"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {currentLayer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {currentLayer.visible ? "Visible" : "Hidden"}
                    </motion.button>

                    <motion.button
                      onClick={() => onUpdateLayer(currentLayer.id, { elements: [] })}
                      className="flex-1 px-2 py-1.5 rounded-md bg-white/8 text-white/50 border border-white/15 text-xs font-medium transition-all duration-200 hover:bg-white/15 hover:text-white hover:border-white/25 flex items-center justify-center gap-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  )
}
