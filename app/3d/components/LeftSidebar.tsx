"use client"

import { useState } from "react"
import { Plus, Trash2, Box, Layers, Search, Pencil, Check, X } from "lucide-react"
import { use3DStore } from "../store/use3DStore"
import { Vertex, Shape } from "../store/use3DStore"
import { useLayerStore } from "@/store/useLayerStore"

export function LeftSidebar() {
  const {
    shapes,
    vertices,
    selectShape,
    deleteShape,
    selectVertex,
    deleteVertex,
    selectAllObjects,
    updateShape,
  } = use3DStore()

  const layers = useLayerStore((state) => state.layers)

  const [searchQuery, setSearchQuery] = useState("")
  const [expandedShapes, setExpandedShapes] = useState<Set<string>>(new Set())
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const toggleShapeExpanded = (shapeId: string) => {
    const newExpanded = new Set(expandedShapes)
    if (newExpanded.has(shapeId)) {
      newExpanded.delete(shapeId)
    } else {
      newExpanded.add(shapeId)
    }
    setExpandedShapes(newExpanded)
  }

  const startEditing = (shape: Shape) => {
    setEditingShapeId(shape.id)
    setEditingName(shape.name || shape.type)
  }

  const saveEdit = (shapeId: string) => {
    if (editingName.trim()) {
      updateShape(shapeId, { name: editingName.trim() })
    }
    setEditingShapeId(null)
    setEditingName("")
  }

  const cancelEdit = () => {
    setEditingShapeId(null)
    setEditingName("")
  }

  const getShapeIcon = (type: string) => {
    const iconClass = "h-4 w-4 text-white/60"

    switch (type) {
      case "cube":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
      case "sphere":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        )
      case "circle":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )
      case "line":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <circle cx="5" cy="12" r="2" fill="currentColor" />
            <circle cx="19" cy="12" r="2" fill="currentColor" />
          </svg>
        )
      default:
        return <Box className={iconClass} />
    }
  }

  const ungroupedVertices = Array.from(vertices.values()).filter((v: Vertex) => !v.groupId)

  const filteredShapes = shapes.filter(shape =>
    (shape.name || shape.type).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredVertices = ungroupedVertices.filter(vertex =>
    "vertex".toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-64 bg-[#000000] border-r flex flex-col h-full select-none overflow-hidden" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="flex-none p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-white font-semibold">3D Scene</h2>
          </div>
          <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded border border-white/10">
            {shapes.length + layers.length} items
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search objects..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 transition-colors placeholder:text-white/40"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={selectAllObjects}
            className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            Select All
          </button>
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', shiftKey: true }))}
            className="px-3 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-medium transition-colors"
            title="Add Shape (Shift+A)"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-px bg-white/8 mx-4" />

      {/* Content Area - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Layers Section */}
        {layers.length > 0 && (
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white font-medium">Layers</div>
              <div className="text-xs text-white/60">{layers.length} items</div>
            </div>
            <div className="space-y-1">
              {layers.map(layer => (
                <div key={layer.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center border border-white/10">
                    <Layers className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-white font-medium flex-1">{layer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separator */}
        {layers.length > 0 && <div className="h-px bg-white/8 mx-4 my-2" />}

        {/* Şekiller Listesi */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white font-medium">Shapes</div>
            <div className="text-xs text-white/60">{filteredShapes.length} items</div>
          </div>

          {filteredShapes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Box className="h-6 w-6 text-white/40" />
              </div>
              <p className="text-sm text-white/60">No shapes added yet</p>
              <p className="text-xs text-white/40 mt-1">Press Shift+A to add shapes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredShapes.map((shape: Shape) => (
                <div key={shape.id} className="group">
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10"
                    onClick={() => {
                      // Select the shape to open full shape panel on the right
                      use3DStore.getState().selectShape(shape.id, false)
                    }}
                  >
                    <div className="flex-shrink-0">
                      {getShapeIcon(shape.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingShapeId === shape.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 h-7 px-2 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(shape.id)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              saveEdit(shape.id)
                            }}
                            className="p-1 rounded hover:bg-green-500/20 text-green-400"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              cancelEdit()
                            }}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-white font-medium truncate">
                            {shape.name || shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
                          </div>
                          <div className="text-xs text-white/50">
                            {shape.vertices.length} vertices • {shape.type}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingShapeId !== shape.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(shape)
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title="Rename"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteShape(shape.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
