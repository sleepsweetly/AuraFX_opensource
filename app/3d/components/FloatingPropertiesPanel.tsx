"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { X, Move } from "lucide-react"
import { use3DStore } from "../store/use3DStore"

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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const selectedVertex = selectedVertices.length === 1 ? Array.from(vertices.values()).find((v) => v.id === selectedVertices[0]) : null
  const selectedShape = selectedShapes.length === 1 ? shapes.find((s) => s.id === selectedShapes[0]) : null
  const allSelectedVertices = Array.from(vertices.values()).filter((v) => selectedVertices.includes(v.id))

  // State management
  const [multiPosition, setMultiPosition] = useState<{ x: string; y: string; z: string }>({ x: "", y: "", z: "" })

  useEffect(() => {
    if (selectedVertices.length > 1 && allSelectedVertices.length > 0) {
      const first = allSelectedVertices[0]
      const allSame = (axis: "x" | "y" | "z") => {
        const baseValue = first.position[axis]
        return allSelectedVertices.every(v => v.position[axis] === baseValue)
      }

      const newPosition = {
        x: allSame("x") ? first.position.x.toString() : "",
        y: allSame("y") ? first.position.y.toString() : "",
        z: allSame("z") ? first.position.z.toString() : "",
      }

      if (newPosition.x !== multiPosition.x ||
        newPosition.y !== multiPosition.y ||
        newPosition.z !== multiPosition.z) {
        setMultiPosition(newPosition)
      }
    }
  }, [selectedVertices])

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
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const panelWidth = 320
      const panelHeight = 400 // Estimated height
      
      // Responsive positioning - keep panel within screen bounds
      const maxX = window.innerWidth - panelWidth - 20 // 20px margin
      const maxY = window.innerHeight - panelHeight - 20 // 20px margin
      
      setPanelPosition({
        x: Math.max(20, Math.min(maxX, e.clientX - dragOffset.x)),
        y: Math.max(20, Math.min(maxY, e.clientY - dragOffset.y))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  if (!selectedVertex && !selectedShape && selectedVertices.length === 0) {
    return null
  }



  return (
    <div
      className="fixed bg-[#000000] border border-zinc-700 rounded-lg shadow-xl z-50 w-80"
      style={{
        left: panelPosition.x,
        top: panelPosition.y,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between p-3 border-b border-zinc-700 cursor-move">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-zinc-400" />
          <span className="text-white font-medium text-sm">Properties</span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        {/* Single Element */}
        {selectedVertex && selectedVertices.length === 1 && !selectedShape && (
          <div className="space-y-4">
            <div className="text-white text-sm font-medium">Element</div>
            
            {/* Position */}
            <div>
              <div className="text-zinc-400 text-xs mb-2">Position</div>
              <div className="grid grid-cols-3 gap-2">
                {(["x", "y", "z"] as const).map((axis) => (
                  <div key={axis}>
                    <label className="text-xs text-zinc-500 uppercase">{axis}</label>
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
                      className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-zinc-400"
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <div className="text-zinc-400 text-xs mb-2">Color</div>
              <ColorPicker
                value={selectedVertex?.color || "#ffffff"}
                onChange={(color) => {
                  if (selectedVertex) {
                    updateVertex(selectedVertex.id, { color })
                  }
                }}
                className="w-full"
                showAlpha={false}
              />
            </div>
          </div>
        )}

        {/* Shape Properties */}
        {(selectedShape || showShapePanel) && !(selectedVertex && selectedVertices.length === 1) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm font-medium capitalize">
                {(selectedShape || shapeForPanel)?.type} Shape
              </div>
              <div className="text-zinc-400 text-xs">
                {(selectedShape || shapeForPanel)?.vertices.length || 0} elements
              </div>
            </div>
            
            {selectedShape && (
              <>
                {/* Element Count */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-zinc-400 text-xs">Element Count</div>
                    <div className="text-white text-xs font-mono">
                      {selectedShape.elementCount || 8}
                    </div>
                  </div>
                  
                  <Slider
                    value={[selectedShape.elementCount || 8]}
                    onValueChange={([value]) => {
                      if (value !== selectedShape.elementCount) {
                        updateShape(selectedShape.id, { elementCount: value })
                      }
                    }}
                    min={3}
                    max={1000}
                    step={1}
                    className="mb-2"
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
                    className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>

                {/* Delete Shape Button */}
                <button
                  onClick={() => {
                    const { deleteShape } = use3DStore.getState()
                    deleteShape(selectedShape.id)
                    onClose?.() // Close panel after deletion
                  }}
                  className="w-full bg-red-900/20 hover:bg-red-900/30 border border-red-800/50 text-red-400 text-sm py-2 rounded transition-colors"
                >
                  Delete Shape
                </button>
              </>
            )}
          </div>
        )}

        {/* Multi Selection */}
        {selectedVertices.length > 1 && (
          <div className="space-y-4">
            <div className="text-white text-sm font-medium">
              {selectedVertices.length} Elements Selected
            </div>
            
            {/* Batch Position */}
            <div>
              <div className="text-zinc-400 text-xs mb-2">Batch Position</div>
              <div className="grid grid-cols-3 gap-2">
                {(["x", "y", "z"] as const).map((axis) => (
                  <div key={axis}>
                    <label className="text-xs text-zinc-500 uppercase">{axis}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Mixed"
                      value={multiPosition[axis]}
                      onChange={e => {
                        const value = e.target.value
                        setMultiPosition(prev => ({ ...prev, [axis]: value }))
                        if (value !== "") {
                          allSelectedVertices.forEach((v: any) => updateVertex(v.id, { position: { ...v.position, [axis]: Number.parseFloat(value) } }))
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Batch Color */}
            <div>
              <div className="text-zinc-400 text-xs mb-2">Batch Color</div>
              <ColorPicker
                value="#ffffff"
                onChange={(color) => allSelectedVertices.forEach((v: any) => updateVertex(v.id, { color }))}
                className="w-full"
                showAlpha={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}