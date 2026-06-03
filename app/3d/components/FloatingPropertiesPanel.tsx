"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react"
import { ColorPicker } from "@/components/ui/color-picker"
import { AlertTriangle, Box, Edit3, GripHorizontal, Info, Layers, Lock, RotateCcw, Trash2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { use3DStore } from "../store/use3DStore"

interface FloatingPropertiesPanelProps {
  position?: { x: number; y: number }
  onClose?: () => void
}

interface MiniSliderProps {
  min: number
  max: number
  step: number
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

function MiniSlider({ min, max, step, value, disabled, onChange }: MiniSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="relative h-8">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />
      <div
        className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-white"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-black bg-white shadow-sm"
        style={{ left: `calc(${percentage}% - 6px)` }}
      />
    </div>
  )
}

function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04]">
      <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/60">{title}</h3>
        {right}
      </div>
      <div className="p-3">{children}</div>
    </section>
  )
}

function NumberField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string | number
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</span>
      <input
        type="number"
        step="0.1"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-white/10 bg-black px-2 text-center text-sm font-medium text-white outline-none transition-colors [appearance:textfield] placeholder:text-white/25 focus:border-white/35 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  )
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
  const [localMultiPosition, setLocalMultiPosition] = useState({ x: "", y: "", z: "" })
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const colorTimeoutRef = useRef<number | undefined>(undefined)
  const batchColorTimeoutRef = useRef<number | undefined>(undefined)

  const selectedVerticesSet = useMemo(() => new Set(selectedVertices), [selectedVertices])
  const selectedVertex = selectedVertices.length === 1 ? vertices.get(selectedVertices[0]) : null
  const selectedShape = selectedShapes.length === 1 ? shapes.find((shape) => shape.id === selectedShapes[0]) : null
  const allSelectedVertices = useMemo(
    () => Array.from(vertices.values()).filter((vertex) => selectedVerticesSet.has(vertex.id)),
    [vertices, selectedVerticesSet]
  )

  const shapeFromVertices = useMemo(() => {
    if (selectedVertices.length === 0) return null

    return shapes.find((shape) => {
      return (
        shape.vertices.length === selectedVertices.length &&
        shape.vertices.every((id) => selectedVerticesSet.has(id)) &&
        selectedVertices.every((id) => shape.vertices.includes(id))
      )
    }) || null
  }, [selectedVertices, selectedVerticesSet, shapes])

  const activeShape = selectedShape || shapeFromVertices
  const showSingleVertex = selectedVertex && selectedVertices.length === 1 && !selectedShape
  const showShape = activeShape && !showSingleVertex
  const showMulti = selectedVertices.length > 1

  const shapeInfo = useMemo(() => {
    if (!activeShape) return null

    const isProcedural = ["cube", "sphere", "circle", "line"].includes(activeShape.type)
    const isEdited = activeShape.type === "edited"
    const isImported = activeShape.type === "imported"
    const actualVertexCount = activeShape.vertices.filter((id) => vertices.has(id)).length
    const definedCount = activeShape.elementCount || 0

    return {
      isProcedural,
      isEdited,
      isImported,
      actualVertexCount,
      definedCount,
      canModifyCount: isProcedural,
      hasDiscrepancy: definedCount > 0 && actualVertexCount !== definedCount,
    }
  }, [activeShape, vertices])

  const panelSubtitle = useMemo(() => {
    if (showMulti) return `${selectedVertices.length} elements selected`
    if (activeShape && shapeInfo) return `${formatShapeType(activeShape.type)} • ${shapeInfo.actualVertexCount} elements`
    return "Element settings"
  }, [activeShape, shapeInfo, selectedVertices.length, showMulti])

  const calculatedMultiPosition = useMemo(() => {
    if (selectedVertices.length <= 1 || allSelectedVertices.length === 0) {
      return { x: "", y: "", z: "" }
    }

    const first = allSelectedVertices[0]
    const valueFor = (axis: "x" | "y" | "z") => {
      const baseValue = first.position[axis]
      return allSelectedVertices.every((vertex) => vertex.position[axis] === baseValue) ? String(baseValue) : ""
    }

    return {
      x: valueFor("x"),
      y: valueFor("y"),
      z: valueFor("z"),
    }
  }, [allSelectedVertices, selectedVertices.length])

  useEffect(() => {
    setLocalMultiPosition(calculatedMultiPosition)
  }, [calculatedMultiPosition])

  const debouncedSingleColorChange = (color: string) => {
    if (colorTimeoutRef.current) window.clearTimeout(colorTimeoutRef.current)
    colorTimeoutRef.current = window.setTimeout(() => {
      if (selectedVertex) updateVertex(selectedVertex.id, { color })
    }, 100)
  }

  const debouncedBatchColorChange = (color: string) => {
    if (batchColorTimeoutRef.current) window.clearTimeout(batchColorTimeoutRef.current)
    batchColorTimeoutRef.current = window.setTimeout(() => {
      // OPTIMIZATION: Use batch update instead of forEach
      const updates = allSelectedVertices.map((vertex) => ({
        id: vertex.id,
        updates: { color }
      }))
      use3DStore.getState().updateVerticesBatch(updates)
    }, 100)
  }

  const handleMouseDown = (event: ReactMouseEvent) => {
    if (!(event.target as HTMLElement).closest(".drag-handle")) return

    isDraggingRef.current = true
    dragOffsetRef.current = {
      x: event.clientX - panelPosition.x,
      y: event.clientY - panelPosition.y,
    }
  }

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current) return

    const panelWidth = 340
    const panelHeight = 520
    const maxX = window.innerWidth - panelWidth - 20
    const maxY = window.innerHeight - panelHeight - 20

    setPanelPosition({
      x: Math.max(20, Math.min(maxX, event.clientX - dragOffsetRef.current.x)),
      y: Math.max(20, Math.min(maxY, event.clientY - dragOffsetRef.current.y)),
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  if (!selectedVertex && !activeShape && selectedVertices.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="fixed z-50 flex max-h-[calc(100vh-160px)] w-[340px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-black/95 text-white shadow-2xl"
        style={{ left: panelPosition.x, top: panelPosition.y }}
        onMouseDown={handleMouseDown}
      >
        <div className="drag-handle flex cursor-move items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GripHorizontal className="h-4 w-4 text-white/40" />
              <h2 className="text-sm font-semibold">Properties</h2>
            </div>
            <p className="mt-0.5 truncate pl-6 text-xs text-white/45">{panelSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close properties panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          {showSingleVertex && selectedVertex && (
            <>
              <Section
                title="Element"
                right={<span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">Vertex</span>}
              >
                <div className="grid grid-cols-3 gap-2">
                  {(["x", "y", "z"] as const).map((axis) => (
                    <NumberField
                      key={axis}
                      label={axis}
                      value={Number(selectedVertex.position[axis]).toFixed(2)}
                      onChange={(value) => {
                        updateVertex(selectedVertex.id, {
                          position: {
                            ...selectedVertex.position,
                            [axis]: Number.parseFloat(value) || 0,
                          },
                        })
                      }}
                    />
                  ))}
                </div>
              </Section>

              <Section
                title="Color"
                right={
                  <span
                    className="h-4 w-4 rounded-full border border-white/30"
                    style={{ backgroundColor: selectedVertex.color || "#ffffff" }}
                  />
                }
              >
                <ColorPicker
                  value={selectedVertex.color || "#ffffff"}
                  onChange={debouncedSingleColorChange}
                  className="w-full"
                />
              </Section>
            </>
          )}

          {showShape && activeShape && shapeInfo && (
            <>
              <Section
                title="Shape"
                right={
                  <div className="flex items-center gap-1.5">
                    {shapeInfo.isEdited && (
                      <span className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/60">
                        <Edit3 className="h-3 w-3" />
                        Edited
                      </span>
                    )}
                    {shapeInfo.isImported && (
                      <span className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/60">
                        <Layers className="h-3 w-3" />
                        OBJ
                      </span>
                    )}
                  </div>
                }
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Box className="h-4 w-4 text-white/70" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{activeShape.name || formatShapeType(activeShape.type)}</div>
                    <div className="text-xs text-white/45">{formatShapeType(activeShape.type)}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-white/70">
                    {shapeInfo.actualVertexCount}
                  </div>
                </div>
              </Section>

              {shapeInfo.hasDiscrepancy && (
                <div className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/55">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                  <div>
                    <div className="font-medium text-white/80">Element count mismatch</div>
                    <div className="mt-0.5">Defined {shapeInfo.definedCount}, actual {shapeInfo.actualVertexCount}.</div>
                  </div>
                </div>
              )}

              <Section
                title="Element Count"
                right={
                  <div className="flex items-center gap-2">
                    {!shapeInfo.canModifyCount && <Lock className="h-3.5 w-3.5 text-white/35" />}
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono text-white/70">
                      {activeShape.elementCount || 0}
                    </span>
                  </div>
                }
              >
                {shapeInfo.canModifyCount ? (
                  <div className="space-y-3">
                    <MiniSlider
                      min={3}
                      max={1000}
                      step={1}
                      value={activeShape.elementCount || 8}
                      onChange={(value) => {
                        if (value !== activeShape.elementCount) updateShape(activeShape.id, { elementCount: value })
                      }}
                    />
                    <input
                      type="number"
                      min="3"
                      max="10000"
                      value={activeShape.elementCount || 8}
                      onChange={(event) => {
                        const newValue = Math.max(3, Math.min(10000, Number.parseInt(event.target.value) || 8))
                        if (newValue !== activeShape.elementCount) updateShape(activeShape.id, { elementCount: newValue })
                      }}
                      className="h-9 w-full rounded-lg border border-white/10 bg-black px-3 text-sm text-white outline-none transition-colors [appearance:textfield] focus:border-white/35 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                ) : (
                  <div className="flex gap-2 rounded-lg border border-white/10 bg-black p-3 text-xs leading-relaxed text-white/50">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {shapeInfo.isEdited
                        ? "Element count is locked because this shape was manually edited."
                        : "Element count cannot be modified for this shape type."}
                    </span>
                  </div>
                )}
              </Section>

              <Section title="Actions">
                <div className="grid gap-2">
                  {shapeInfo.isEdited && (
                    <button
                      onClick={() => {
                        const originalType = activeShape.name?.includes("Cube") ? "cube" :
                          activeShape.name?.includes("Sphere") ? "sphere" :
                            activeShape.name?.includes("Circle") ? "circle" :
                              activeShape.name?.includes("Line") ? "line" : "cube"

                        updateShape(activeShape.id, {
                          type: originalType,
                          name: activeShape.name?.replace(" (Edited)", "") || "Shape",
                        })
                      }}
                      className="flex h-9 items-center justify-center gap-2 rounded-lg border border-white/15 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to Procedural
                    </button>
                  )}

                  <button
                    onClick={() => {
                      use3DStore.getState().deleteShape(activeShape.id)
                      onClose?.()
                    }}
                    className="flex h-9 items-center justify-center gap-2 rounded-lg border border-white/15 text-sm font-medium text-white/75 transition-colors hover:bg-white hover:text-black"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Shape
                  </button>
                </div>
              </Section>
            </>
          )}

          {showMulti && (
            <>
              <Section
                title="Selection"
                right={<span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">{selectedVertices.length} vertices</span>}
              >
                <div className="grid grid-cols-3 gap-2">
                  {(["x", "y", "z"] as const).map((axis) => (
                    <NumberField
                      key={axis}
                      label={axis}
                      value={localMultiPosition[axis]}
                      placeholder="Mixed"
                      onChange={(value) => {
                        setLocalMultiPosition((previous) => ({ ...previous, [axis]: value }))
                        if (value === "") return

                        // OPTIMIZATION: Use batch update instead of forEach
                        const updates = allSelectedVertices.map((vertex) => ({
                          id: vertex.id,
                          updates: {
                            position: { ...vertex.position, [axis]: Number.parseFloat(value) || 0 }
                          }
                        }))
                        use3DStore.getState().updateVerticesBatch(updates)
                      }}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Batch Color">
                <ColorPicker value="#ffffff" onChange={debouncedBatchColorChange} className="w-full" />
              </Section>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function formatShapeType(type: string) {
  switch (type) {
    case "cube":
      return "Cube"
    case "sphere":
      return "Sphere"
    case "circle":
      return "Circle"
    case "line":
      return "Line"
    case "edited":
      return "Edited Shape"
    case "imported":
      return "Imported Shape"
    default:
      return "Shape"
  }
}
