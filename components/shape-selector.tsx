"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Circle, Square, Triangle, Minus } from "lucide-react"

interface ShapeSelectorProps {
  onSelect: (shapeType: "circle" | "square" | "triangle" | "line", vertexCount?: number) => void
  onClose: () => void
}

export function ShapeSelector({ onSelect, onClose }: ShapeSelectorProps) {
  const [selectedShape, setSelectedShape] = useState<"circle" | "square" | "triangle" | "line" | null>(null)
  const [vertexCount, setVertexCount] = useState<number>(8)

  const shapes = [
    { type: "circle" as const, icon: Circle, label: "Circle", key: "C", defaultCount: 8, minCount: 3 },
    { type: "square" as const, icon: Square, label: "Square", key: "S", defaultCount: 4, minCount: 4 },
    { type: "triangle" as const, icon: Triangle, label: "Triangle", key: "T", defaultCount: 3, minCount: 3 },
    { type: "line" as const, icon: Minus, label: "Line", key: "L", defaultCount: 2, minCount: 2 },
  ]

  const handleShapeClick = (shapeType: (typeof shapes)[0]["type"]) => {
    const shape = shapes.find((s) => s.type === shapeType)
    if (shape) {
      setSelectedShape(shapeType)
      setVertexCount(shape.defaultCount)
    }
  }

  const handleCreate = () => {
    if (selectedShape) {
      onSelect(selectedShape, vertexCount)
    }
  }

  const selectedShapeData = shapes.find((s) => s.type === selectedShape)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-black/90 backdrop-blur border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Add Shape</h3>
          <p className="text-white/60 text-sm">Select a shape and customize vertex count</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {shapes.map(({ type, icon: Icon, label, key }) => (
            <Button
              key={type}
              variant="ghost"
              onClick={() => handleShapeClick(type)}
              className={`h-20 flex flex-col items-center justify-center space-y-2 border transition-all ${
                selectedShape === type
                  ? "bg-white/20 border-white/40"
                  : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
              }`}
            >
              <Icon className="w-6 h-6 text-white" />
              <div className="text-center">
                <div className="text-white text-sm font-medium">{label}</div>
                <div className="text-white/40 text-xs">Press {key}</div>
              </div>
            </Button>
          ))}
        </div>

        {selectedShape && selectedShapeData && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <Label className="text-white/80 text-sm mb-2 block">Vertex Count for {selectedShapeData.label}</Label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min={selectedShapeData.minCount}
                max={20}
                value={vertexCount}
                onChange={(e) =>
                  setVertexCount(
                    Math.max(selectedShapeData.minCount, Number.parseInt(e.target.value) || selectedShapeData.minCount),
                  )
                }
                className="flex-1 bg-white/5 border-white/20 text-white focus:border-white/40"
              />
              <div className="text-white/60 text-sm">Min: {selectedShapeData.minCount}</div>
            </div>
            <div className="text-white/40 text-xs mt-2">
              {selectedShape === "circle" && "More vertices = smoother circle"}
              {selectedShape === "square" && "Vertices distributed around perimeter"}
              {selectedShape === "triangle" && "Vertices distributed around triangle"}
              {selectedShape === "line" && "Vertices distributed along line"}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
            Cancel (Esc)
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedShape}
            className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Shape
          </Button>
        </div>
      </div>
    </div>
  )
}
