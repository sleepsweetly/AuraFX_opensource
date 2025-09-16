"use client"

import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"

import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import { use3DStore } from "../store/use3DStore"

interface AddObjectsMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function AddObjectsMenu({ isOpen, onClose }: AddObjectsMenuProps) {
  const { addShape } = use3DStore()

  const [shapeSettings, setShapeSettings] = useState({
    type: "cube" as "cube" | "sphere" | "circle" | "line",
    elementCount: 8,
    size: 2,
    radius: 2,
    lineLength: 4,
  })

  const handleAddShape = () => {
    const { type, elementCount, size, radius, lineLength } = shapeSettings

    addShape({
      type,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: size, y: size, z: size },
      visible: true,
      selected: false,
      elementCount,
      radius: type === "sphere" || type === "circle" ? radius : undefined,
      lineLength: type === "line" ? lineLength : undefined,
    })
    onClose()
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
  }

  // Custom SVG icons for each shape
  const CubeIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )

  const SphereIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  )

  const CircleIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  )

  const LineIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  )

  const shapeOptions = [
    { type: "cube", label: "Cube", icon: <CubeIcon /> },
    { type: "sphere", label: "Sphere", icon: <SphereIcon /> },
    { type: "circle", label: "Circle", icon: <CircleIcon /> },
    { type: "line", label: "Line", icon: <LineIcon /> },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50 bg-black/70"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            className="w-[450px]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#000000] border border-zinc-700 shadow-2xl rounded-xl">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-lg font-semibold">Add Shape</h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
              <div className="px-6 pb-6 space-y-6">
                <div className="grid grid-cols-4 gap-3">
                  {shapeOptions.map(({ type, label, icon }) => (
                    <motion.div key={type} className="relative">
                      <button
                        onClick={() => setShapeSettings((prev) => ({ ...prev, type: type as any }))}
                        className={`h-20 w-full flex flex-col gap-2 items-center justify-center rounded-lg transition-all ${shapeSettings.type === type
                          ? "bg-blue-600 text-white border-2 border-blue-500"
                          : "bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white"
                          }`}
                      >
                        {icon}
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4">
                  {shapeSettings.type === "cube" && (
                    <div className="space-y-3">
                      <label className="text-white text-sm font-medium">Size</label>
                      <Slider
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={[shapeSettings.size]}
                        onValueChange={([val]) => setShapeSettings(prev => ({ ...prev, size: val }))}
                        className="w-full"
                      />
                    </div>
                  )}
                  {(shapeSettings.type === "sphere" || shapeSettings.type === "circle") && (
                    <div className="space-y-3">
                      <label className="text-white text-sm font-medium">Radius</label>
                      <Slider
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={[shapeSettings.radius]}
                        onValueChange={([val]) => setShapeSettings(prev => ({ ...prev, radius: val }))}
                        className="w-full"
                      />
                    </div>
                  )}
                  {shapeSettings.type === "line" && (
                    <div className="space-y-3">
                      <label className="text-white text-sm font-medium">Length</label>
                      <Slider
                        min={0.1}
                        max={20}
                        step={0.1}
                        value={[shapeSettings.lineLength]}
                        onValueChange={([val]) => setShapeSettings(prev => ({ ...prev, lineLength: val }))}
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="text-white text-sm font-medium">Element Count</label>
                    <Slider
                      min={2}
                      max={100}
                      step={1}
                      value={[shapeSettings.elementCount]}
                      onValueChange={([val]) => setShapeSettings(prev => ({ ...prev, elementCount: val }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 h-10 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddShape}
                    className="flex-1 h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add {shapeSettings.type.charAt(0).toUpperCase() + shapeSettings.type.slice(1)}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}