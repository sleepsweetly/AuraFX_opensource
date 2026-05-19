"use client"

import { useState } from "react"
import { X, Box, Circle, Minus, Plus } from "lucide-react"
import { use3DStore } from "../store/use3DStore"
import { Slider } from "@/components/ui/slider"

interface AddObjectsMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function AddObjectsMenu({ isOpen, onClose }: AddObjectsMenuProps) {
  const { addShape } = use3DStore()
  const [selectedType, setSelectedType] = useState<"cube" | "sphere" | "circle" | "line">("cube")
  const [elementCount, setElementCount] = useState(8)

  const shapes = [
    { type: "cube", label: "Cube", icon: Box, color: "bg-blue-500" },
    { type: "sphere", label: "Sphere", icon: Circle, color: "bg-green-500" },
    { type: "circle", label: "Circle", icon: Circle, color: "bg-yellow-500" },
    { type: "line", label: "Line", icon: Minus, color: "bg-red-500" },
  ]

  const handleAddShape = () => {
    addShape({
      type: selectedType,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
      visible: true,
      selected: false,
      elementCount,
      name: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add 3D Shape</h2>
              <p className="text-sm text-gray-500">Choose a shape to add</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Shape Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Shape Type</label>
            <div className="grid grid-cols-2 gap-3">
              {shapes.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${selectedType === type
                    ? `${color} border-current text-white`
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Element Count */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Element Count</label>
              <div className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                {elementCount}
              </div>
            </div>
            <Slider
              value={[elementCount]}
              onValueChange={([value]) => setElementCount(value)}
              min={3}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>3</span>
              <span>200</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 h-12 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAddShape}
            className="flex-1 h-12 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
          >
            Add {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
          </button>
        </div>
      </div>
    </div>
  )
}