"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
// Custom Slider to avoid CSS issues
import { ColorPicker } from "@/components/ui/color-picker"

// Custom Slider Component
interface CustomSliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  className?: string
}

function CustomSlider({ min, max, step, value, onChange, className = "" }: CustomSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    onChange(Number((e.target as HTMLInputElement).value))
  }

  return (
    <div className={`relative py-2 ${className}`}>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onInput={handleInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
          background: 'transparent',
        }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-all duration-200 hover:scale-110 pointer-events-none"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  )
}
import { X, Settings, Trash2, Box, Layers, Edit3, Lock, AlertTriangle, Info, RotateCcw } from "lucide-react"
import { use3DStore } from "../store/use3DStore"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingPropertiesPanelProps {
  position?: { x: number; y: number }
  onClose?: () => void
}

export function FloatingPropertiesPanel({ position = { x: 100, y: 100 }, onClose }: FloatingPropertiesPanelProps) {
  const {
    selectedVertices,
    selectedShapes,
    vertices,
    shapes,
    updateVertex,
    updateShape,
  } = use3DStore()

  const [panelPosition, setPanelPosition] = useState(position)
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const selectedVertex = selectedVertices.length === 1 ? Array.from(vertices.values()).find((v) => v.id === selectedVertices[0]) : null
  const selectedShape = selectedShapes.length === 1 ? shapes.find((s) => s.id === selectedShapes[0]) : null
  const allSelectedVertices = Array.from(vertices.values()).filter((v) => selectedVertices.includes(v.id))

  // Local state for multi-position editing
  const [localMultiPosition, setLocalMultiPosition] = useState<{ x: string; y: string; z: string }>({ x: "", y: "", z: "" })

  // Calculate initial multi-position values
  const calculatedMultiPosition = useMemo(() => {
    if (selectedVertices.length > 1 && allSelectedVertices.length > 0) {
      const first = allSelectedVertices[0]
      const allSame = (axis: "x" | "y" | "z") => {
        const baseValue = first.position[axis]
        return allSelectedVertices.every(v => v.position[axis] === baseValue)
      }

      return {
        x: allSame("x") ? first.position.x.toString() : "",
        y: allSame("y") ? first.position.y.toString() : "",
        z: allSame("z") ? first.position.z.toString() : "",
      }
    }
    return { x: "", y: "", z: "" }
  }, [selectedVertices.length, selectedVertices.join(',')])

  // Update local state when selection changes
  useEffect(() => {
    setLocalMultiPosition(calculatedMultiPosition)
  }, [calculatedMultiPosition])

  // Debounced color change handlers
  const colorTimeoutRef = useRef<number | undefined>(undefined)
  const batchColorTimeoutRef = useRef<number | undefined>(undefined)

  const debouncedSingleColorChange = (color: string) => {
    if (colorTimeoutRef.current) {
      window.clearTimeout(colorTimeoutRef.current)
    }
    colorTimeoutRef.current = window.setTimeout(() => {
      if (selectedVertex) {
        updateVertex(selectedVertex.id, { color })
      }
    }, 100)
  }

  const debouncedBatchColorChange = (color: string) => {
    if (batchColorTimeoutRef.current) {
      window.clearTimeout(batchColorTimeoutRef.current)
    }
    batchColorTimeoutRef.current = window.setTimeout(() => {
      allSelectedVertices.forEach((v: any) => updateVertex(v.id, { color }))
    }, 100)
  }

  // Determine shape type and status
  const shapeInfo = useMemo(() => {
    if (!selectedShape) return null

    const isProcedural = ['cube', 'sphere', 'circle', 'line'].includes(selectedShape.type)
    const isEdited = selectedShape.type === 'edited'
    const isImported = selectedShape.type === 'imported'
    const actualVertexCount = selectedShape.vertices.filter(vId => vertices.has(vId)).length
    const definedCount = selectedShape.elementCount || 0

    return {
      isProcedural,
      isEdited,
      isImported,
      actualVertexCount,
      definedCount,
      hasDiscrepancy: actualVertexCount !== definedCount,
      canModifyCount: isProcedural, // Only procedural shapes can modify element count
    }
  }, [selectedShape?.id, selectedShape?.type, selectedShape?.elementCount, selectedShape?.vertices.length, vertices.size])

  // Shape panel logic
  let showShapePanel = false;
  let shapeForPanel = null;
  if (selectedVertices.length > 0 && shapes.length > 0) {
    for (const shape of shapes) {
      if (
        shape.vertices.length === selectedVertices.length &&
        shape.vertices.every(id => selectedVertices.includes(id)) &&
        selectedVertices.every(id => shape.vertices.includes(id))
      ) {
        showShapePanel = true;
        shapeForPanel = shape;
        break;
      }
    }
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      isDraggingRef.current = true
      dragOffsetRef.current = {
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y
      }
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current) {
      const panelWidth = Math.min(360, window.innerWidth * 0.9)
      const panelHeight = 400 // Estimated, will adjust based on content

      const maxX = window.innerWidth - panelWidth - 20
      const maxY = window.innerHeight - panelHeight - 20

      setPanelPosition({
        x: Math.max(20, Math.min(maxX, e.clientX - dragOffsetRef.current.x)),
        y: Math.max(20, Math.min(maxY, e.clientY - dragOffsetRef.current.y))
      })
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  if (!selectedVertex && !selectedShape && selectedVertices.length === 0) {
    return null
  }

  // Get shape type icon and color
  const getShapeTypeInfo = (type: string) => {
    switch (type) {
      case 'cube': return { icon: Box, color: 'text-blue-400', name: 'Cube' }
      case 'sphere': return { icon: Box, color: 'text-green-400', name: 'Sphere' }
      case 'circle': return { icon: Box, color: 'text-yellow-400', name: 'Circle' }
      case 'line': return { icon: Box, color: 'text-red-400', name: 'Line' }
      case 'edited': return { icon: Edit3, color: 'text-orange-400', name: 'Edited Shape' }
      case 'imported': return { icon: Layers, color: 'text-purple-400', name: 'Imported' }
      default: return { icon: Box, color: 'text-gray-400', name: 'Unknown' }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bg-black/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50"
        style={{
          left: panelPosition.x,
          top: panelPosition.y,
          width: '360px',
          maxWidth: '90vw'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="drag-handle flex items-center justify-between p-4 border-b border-white/10 cursor-move">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm">Properties</span>
              <div className="text-white/60 text-xs">
                {selectedVertices.length > 1
                  ? `${selectedVertices.length} elements selected`
                  : selectedShape
                    ? `${getShapeTypeInfo(selectedShape.type).name}`
                    : "Element settings"
                }
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Single Element */}
          {selectedVertex && selectedVertices.length === 1 && !selectedShape && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Box className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Element Properties</span>
              </div>

              {/* Position */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-white/80 text-sm font-medium mb-3">Position</div>
                <div className="grid grid-cols-3 gap-3">
                  {(["x", "y", "z"] as const).map((axis) => (
                    <div key={axis} className="space-y-1">
                      <label className="text-xs text-white/60 uppercase font-medium">{axis}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={
                          selectedVertex && selectedVertex.position[axis] !== undefined
                            ? Number(selectedVertex.position[axis]).toFixed(2)
                            : ""
                        }
                        onChange={e => {
                          if (selectedVertex) {
                            updateVertex(selectedVertex.id, {
                              position: { ...selectedVertex.position, [axis]: Number.parseFloat(e.target.value) || 0 }
                            })
                          }
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all"
                        placeholder="0.0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-white/80 text-sm font-medium mb-3">Color</div>
                <ColorPicker
                  value={selectedVertex?.color || "#ffffff"}
                  onChange={debouncedSingleColorChange}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}

          {/* Shape Properties */}
          {(selectedShape || showShapePanel) && !(selectedVertex && selectedVertices.length === 1) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {selectedShape && shapeInfo && (
                <>
                  {/* Shape Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const { icon: Icon, color, name } = getShapeTypeInfo(selectedShape.type)
                        return (
                          <>
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="text-white font-medium">{name}</span>
                          </>
                        )
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      {shapeInfo.isEdited && (
                        <div className="flex items-center gap-1 text-orange-400 text-xs bg-orange-400/10 px-2 py-1 rounded-full">
                          <Edit3 className="w-3 h-3" />
                          <span>Edited</span>
                        </div>
                      )}
                      <div className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded-full">
                        {shapeInfo.actualVertexCount} elements
                      </div>
                    </div>
                  </div>

                  {/* Status Info */}
                  {shapeInfo.hasDiscrepancy && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="text-yellow-400 font-medium">Element Count Mismatch</div>
                          <div className="text-yellow-400/80 text-xs mt-1">
                            Defined: {shapeInfo.definedCount} • Actual: {shapeInfo.actualVertexCount}
                            {shapeInfo.isEdited && " (Shape was manually edited)"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Element Count Control */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white/80 text-sm font-medium">Element Count</div>
                      <div className="flex items-center gap-2">
                        {!shapeInfo.canModifyCount && (
                          <Lock className="w-3 h-3 text-white/40" />
                        )}
                        <div className="text-white text-sm font-mono bg-white/10 px-2 py-1 rounded">
                          {selectedShape.elementCount || 0}
                        </div>
                      </div>
                    </div>

                    {shapeInfo.canModifyCount ? (
                      <>
                        <CustomSlider
                          value={selectedShape.elementCount || 8}
                          onChange={(value) => {
                            if (value !== selectedShape.elementCount) {
                              updateShape(selectedShape.id, { elementCount: value })
                            }
                          }}
                          min={3}
                          max={1000}
                          step={1}
                          className="mb-3"
                        />

                        <input
                          type="number"
                          min="3"
                          max="10000"
                          value={selectedShape.elementCount || 8}
                          onChange={e => {
                            const newValue = Math.max(3, Math.min(10000, Number.parseInt(e.target.value) || 8));
                            if (newValue !== selectedShape.elementCount) {
                              updateShape(selectedShape.id, { elementCount: newValue })
                            }
                          }}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all"
                        />
                      </>
                    ) : (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Info className="w-4 h-4" />
                          <span>
                            {shapeInfo.isEdited
                              ? "Element count is locked because this shape was manually edited"
                              : "Element count cannot be modified for this shape type"
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-white/80 text-sm font-medium mb-3">Actions</div>
                    <div className="space-y-2">
                      {shapeInfo.isEdited && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // Convert back to procedural by regenerating
                            const originalType = selectedShape.name?.includes('Cube') ? 'cube' :
                              selectedShape.name?.includes('Sphere') ? 'sphere' :
                                selectedShape.name?.includes('Circle') ? 'circle' :
                                  selectedShape.name?.includes('Line') ? 'line' : 'cube'

                            updateShape(selectedShape.id, {
                              type: originalType,
                              name: selectedShape.name?.replace(' (Edited)', '') || 'Shape'
                            })
                          }}
                          className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset to Procedural
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const { deleteShape } = use3DStore.getState()
                          deleteShape(selectedShape.id)
                          onClose?.()
                        }}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Shape
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Multi Selection */}
          {selectedVertices.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Box className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">
                  {selectedVertices.length} Elements Selected
                </span>
              </div>

              {/* Batch Position */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-white/80 text-sm font-medium mb-3">Batch Position</div>
                <div className="grid grid-cols-3 gap-3">
                  {(["x", "y", "z"] as const).map((axis) => (
                    <div key={axis} className="space-y-1">
                      <label className="text-xs text-white/60 uppercase font-medium">{axis}</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Mixed"
                        value={localMultiPosition[axis]}
                        onChange={e => {
                          const value = e.target.value
                          setLocalMultiPosition(prev => ({ ...prev, [axis]: value }))
                          if (value !== "") {
                            allSelectedVertices.forEach((v: any) => updateVertex(v.id, { position: { ...v.position, [axis]: Number.parseFloat(value) } }))
                          }
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-green-400/50 focus:bg-white/15 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch Color */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-white/80 text-sm font-medium mb-3">Batch Color</div>
                <ColorPicker
                  value="#ffffff"
                  onChange={debouncedBatchColorChange}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}