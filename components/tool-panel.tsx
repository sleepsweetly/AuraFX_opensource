"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  MousePointer, 
  Pencil, 
  Circle, 
  Square, 
  Minus, 
  Eraser, 
  Palette, 
  Settings2, 
  Trash2, 
  Grid3X3,
  Pipette,
  ChevronRight,
  FlipHorizontal,
  Triangle
} from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import type { Tool } from "@/types"
import type { Element } from "@/types"
import { Input } from "@/components/ui/input"
import { useLayerStore } from "@/store/useLayerStore"
import { Shapes } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

interface ToolPanelProps {
  currentTool: Tool
  onToolChange: (tool: Tool) => void
  settings: {
    particleCount: number
    shapeSize: number
    color: string
    particle: string
    alpha: number
    repeat: number
    yOffset: number
    skillName: string
    pngSize: number
    objScale: number
    performanceMode: boolean
    imageColorMode: boolean
    snapToGridMode: boolean
    gridSize: number
    mirrorMode: boolean
  }
  onSettingsChange: (settings: any) => void
  updateSelectedElementsColor?: (color: string) => void
  shapes: { id: string; name: string; elementIds: string[]; type: string }[]
  onShapeSelect?: (elementIds: string[]) => void
  selectedShapeIds?: string[]
  onElementCountChange?: (count: number, groupId: string) => void
  elements?: Element[]
  onRotateSelectedElements?: (angle: number, selectedIds: string[]) => void
  onCopy?: (elements: Element[]) => void
  onPaste?: () => void
}

const TOOL_ICONS = {
  select: MousePointer,
  free: Pencil,
  circle: Circle,
  square: Square,
  triangle: Triangle,
  line: Minus,
  eraser: Eraser,
}

const TOOL_LABELS = {
  select: "Select",
  free: "Free",
  circle: "Circle", 
  square: "Square",
  triangle: "Triangle",
  line: "Line",
  eraser: "Eraser",
}

export function ToolPanel({
  currentTool,
  onToolChange,
  settings,
  onSettingsChange,
  updateSelectedElementsColor,
  shapes,
  onShapeSelect,
  selectedShapeIds = [],
  onElementCountChange,
  elements = [],
  onRotateSelectedElements,
  onCopy,
  onPaste
}: ToolPanelProps) {

  const [rotateValue, setRotateValue] = useState(0)
  const [localElementCounts, setLocalElementCounts] = useState<Record<string, string>>({})
  const [isShapesOpen, setIsShapesOpen] = useState(false)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentTool === "select") {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === "c") {
            e.preventDefault()
            const selectedElements = elements.filter(el => selectedShapeIds.includes(el.id))
            console.log("Copying elements:", selectedElements)
            onCopy?.(selectedElements)
          } else if (e.key === "v") {
            e.preventDefault()
            console.log("Pasting elements")
            onPaste?.()
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentTool, selectedShapeIds, elements, onCopy, onPaste])

  // Group elements by groupId for shapes list + free draw elements
  const groupedShapes = (() => {
    const allowedTypes = ["circle", "square", "triangle", "line"]
    const groups: Record<string, { id: string; name: string; elementIds: string[]; type: string; isFreeDraw?: boolean }> = {}
    
    // Önce groupId olan şekilleri grupla
    for (const el of elements) {
      if (!el.groupId) continue
      if (!allowedTypes.includes(el.type)) continue
      if (!groups[el.groupId]) {
        groups[el.groupId] = {
          id: el.groupId,
          name: el.type.charAt(0).toUpperCase() + el.type.slice(1),
          elementIds: [],
          type: el.type,
          isFreeDraw: false
        }
      }
      groups[el.groupId].elementIds.push(el.id)
    }
    
    // Free draw elementlerini grupla (groupId olmayan, free draw tool ile çizilen)
    const freeDrawElements = elements.filter(el => !el.groupId && el.type === "free")
    if (freeDrawElements.length > 0) {
      // Free draw elementlerini tek bir grup olarak göster
      const freeDrawGroupId = "free-draw-group"
      groups[freeDrawGroupId] = {
        id: freeDrawGroupId,
        name: "Free Draw",
        elementIds: freeDrawElements.map(el => el.id),
        type: "free",
        isFreeDraw: true
      }
    }
    
    return Object.values(groups)
  })()

  // Shapes değiştiğinde localElementCounts'u otomatik güncelle
  useEffect(() => {
    setLocalElementCounts(prev => {
      const updated = { ...prev };
      shapes.forEach(shape => {
        if (!updated[shape.id]) {
          updated[shape.id] = shape.elementIds.length.toString();
        }
      });
      return updated;
    });
  }, [shapes]);

  const handleColorChange = (newColor: string) => {
    onSettingsChange({ ...settings, color: newColor })
    updateSelectedElementsColor?.(newColor)
  }

  return (
    <motion.section 
      className="flex-1 h-full flex flex-col bg-[#000000] p-0 text-white overflow-y-auto"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Modern Header */}
      <motion.div 
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Settings2 className="w-4 h-4 text-white" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight text-white">Tools</h2>
          <p className="text-white/50 text-xs font-medium">Drawing & selection tools</p>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div className="px-4 pt-3">
        <Label className="text-white/60 text-xs font-medium mb-3 block">Select Tool</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TOOL_ICONS).map(([id, Icon]) => (
            <motion.button
              key={id}
              onClick={() => onToolChange(id as Tool)}
              className={`group relative p-3 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 overflow-hidden
                ${currentTool === id 
                  ? "border-white/40 bg-white/8 shadow-[0_0_12px_0_rgba(255,255,255,0.08)]" 
                  : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6"
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out rounded-lg" />
              
              {/* Active indicator */}
              {currentTool === id && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-white rounded-t-lg"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <div className="relative z-10">
                <Icon className={`w-5 h-5 transition-colors duration-200 ${
                  currentTool === id ? "text-white" : "text-white/60 group-hover:text-white"
                }`} />
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  currentTool === id ? "text-white" : "text-white/60 group-hover:text-white"
                }`}>
                  {TOOL_LABELS[id as Tool]}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color Section */}
      <div className="px-4 pt-4">
        <Label className="text-white/60 text-xs font-medium mb-2 block flex items-center gap-1">
          <Palette className="w-3 h-3" />
          Color
        </Label>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <ColorPicker
            value={settings.color}
            onChange={handleColorChange}
            className="w-full"
            showAlpha={false}
          />
        </div>
      </div>

      {/* Grid Settings */}
      <div className="px-4 pt-4">
        <Label className="text-white/60 text-xs font-medium mb-2 block flex items-center gap-1">
          <Grid3X3 className="w-3 h-3" />
          Grid Settings
        </Label>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
          {/* Snap to Grid Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium">Snap to Grid</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={!!settings.snapToGridMode}
                onChange={e => onSettingsChange({ ...settings, snapToGridMode: e.target.checked })}
                className="sr-only"
                id="snapToGridToggle"
              />
              <label
                htmlFor="snapToGridToggle"
                className={`flex items-center w-10 h-5 rounded-full cursor-pointer transition-all duration-200 ${
                  settings.snapToGridMode 
                    ? 'bg-white' 
                    : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 bg-black rounded-full transition-all duration-200 transform mx-0.5 ${
                  settings.snapToGridMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </label>
            </div>
          </div>
          
          {/* Grid Size */}
          {settings.snapToGridMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Grid Size</span>
                <span className="text-white text-xs font-mono bg-white/10 px-2 py-1 rounded border border-white/20">
                  {settings.gridSize || 20}px
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={settings.gridSize || 20}
                onChange={e => onSettingsChange({ ...settings, gridSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${((settings.gridSize || 20) - 5) / 95 * 100}%, rgba(255,255,255,0.2) ${((settings.gridSize || 20) - 5) / 95 * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-white/40">
                <span>5px</span>
                <span>100px</span>
              </div>
            </div>
          )}

          {/* Mirror Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlipHorizontal className="w-4 h-4 text-white/60" />
              <span className="text-white/80 text-sm font-medium">Mirror Mode</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={!!settings.mirrorMode}
                onChange={e => onSettingsChange({ ...settings, mirrorMode: e.target.checked })}
                className="sr-only"
                id="mirrorModeToggle"
              />
              <label
                htmlFor="mirrorModeToggle"
                className={`flex items-center w-10 h-5 rounded-full cursor-pointer transition-all duration-200 ${
                  settings.mirrorMode 
                    ? 'bg-white' 
                    : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 bg-black rounded-full transition-all duration-200 transform mx-0.5 ${
                  settings.mirrorMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Shapes Section - Collapsible */}
      <div className="px-4 pt-4">
        <motion.button
          onClick={() => setIsShapesOpen(!isShapesOpen)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Shapes className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">Shapes</span>
            <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
              {groupedShapes.length}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isShapesOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/60"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* Shapes Content - Collapsible */}
        <AnimatePresence>
          {isShapesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2">
                {groupedShapes.length === 0 ? (
                  <div className="text-center p-4 text-white/40 text-xs border border-white/10 rounded-lg bg-white/3">
                    No shapes found. Create shapes using Circle, Square, or Line tools.
                  </div>
                ) : (
                  groupedShapes.map((shape) => {
                    const isSelected = selectedShapeIds.some(id => shape.elementIds.includes(id))
                    return (
                      <motion.div
                        key={shape.id}
                        className={`group relative p-3 rounded-lg border transition-all duration-200 overflow-hidden
                          ${isSelected 
                            ? "border-white/40 bg-white/8 shadow-[0_0_8px_0_rgba(255,255,255,0.06)]" 
                            : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6"
                          }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out rounded-lg" />

                        <div className="relative z-10 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm text-white capitalize">{shape.name}</span>
                              <span className="text-white/50 text-xs">{shape.elementIds.length} elements</span>
                            </div>
                            
                            {!shape.isFreeDraw && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={shape.type === 'square' ? 4 : 3}
                                  value={localElementCounts[shape.id] || ''}
                                  onChange={e => {
                                    setLocalElementCounts(prev => ({ ...prev, [shape.id]: e.target.value }));
                                  }}
                                  onBlur={e => {
                                    const input = e.target as HTMLInputElement;
                                    const value = input.value === '' ? 10 : Number(input.value);
                                    if (onElementCountChange) {
                                      onElementCountChange(value, shape.id);
                                    }
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      const input = e.target as HTMLInputElement;
                                      const value = input.value === '' ? 10 : Number(input.value);
                                      if (onElementCountChange) {
                                        onElementCountChange(value, shape.id);
                                      }
                                    }
                                  }}
                                  className="w-16 bg-white/5 border border-white/20 text-white rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                                />
                                <span className="text-white/50 text-xs">count</span>
                              </div>
                            )}
                            {shape.isFreeDraw && (
                              <div className="text-white/40 text-xs italic">
                                Free hand drawing
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <motion.button
                              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white border border-white/20 flex items-center justify-center transition-all duration-200"
                              onClick={() => onShapeSelect && onShapeSelect(shape.elementIds)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Select shape"
                            >
                              <Pipette className="w-3 h-3" />
                            </motion.button>
                            
                            {!shape.isFreeDraw && (
                              <motion.button
                                className="w-7 h-7 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 flex items-center justify-center transition-all duration-200"
                                onClick={() => onElementCountChange && onElementCountChange(0, shape.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Delete shape"
                              >
                                <Trash2 className="w-3 h-3" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pt-4 pb-6">
        <motion.button
          onClick={() => onSettingsChange({ ...settings, color: "#ffffff" })}
          className="w-full py-2.5 rounded-lg bg-white text-black hover:bg-white/90 font-semibold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Palette className="w-4 h-4" />
          Reset Color
        </motion.button>
      </div>
    </motion.section>
  )
}
