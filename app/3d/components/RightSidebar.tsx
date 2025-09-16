"use client"

import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { Hexagon } from "lucide-react"
import { use3DStore } from "../store/use3DStore"
import { useState, useEffect } from "react"

export function RightSidebar() {
  const {
    selectedVertices,
    selectedShapes,
    vertices,
    shapes,
    updateVertex,
    updateShape,
    clearShapeVertices,
  } = use3DStore()

  const selectedVertex = selectedVertices.length === 1 ? Array.from(vertices.values()).find((v) => v.id === selectedVertices[0]) : null
  const selectedShape = selectedShapes.length === 1 ? shapes.find((s) => s.id === selectedShapes[0]) : null

  const allSelectedVertices = Array.from(vertices.values()).filter((v) => selectedVertices.includes(v.id))
  const allSelectedShapes = shapes.filter((s) => selectedShapes.includes(s.id))



  // Çoklu seçim için ortak pozisyon state'i
  const [multiPosition, setMultiPosition] = useState<{ x: string; y: string; z: string }>({ x: "", y: "", z: "" })

  // Shape pozisyon inputları için local state
  const [shapePositionInput, setShapePositionInput] = useState<{ x: string; y: string; z: string }>({ x: "", y: "", z: "" })

  // Shape veya shape paneli açıldığında inputu senkronize et
  useEffect(() => {
    if (selectedShape) {
      setShapePositionInput({
        x: selectedShape.position.x.toString(),
        y: selectedShape.position.y.toString(),
        z: selectedShape.position.z.toString(),
      });
    }
  }, [selectedShape]);

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

      // Only update if values actually changed
      if (newPosition.x !== multiPosition.x ||
        newPosition.y !== multiPosition.y ||
        newPosition.z !== multiPosition.z) {
        setMultiPosition(newPosition)
      }
    }
  }, [selectedVertices]) // Only depend on selectedVertices, not allSelectedVertices

  // Shape panelini göstermek için sağlam kontrol
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



  if (!selectedVertex && !selectedShape && selectedVertices.length === 0) {
    return (
      <div className="w-80 bg-[#000000] border-l border-zinc-800 h-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-zinc-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10182a] flex items-center justify-center">
              <Hexagon className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="text-base font-semibold">No Selection</p>
            <p className="text-xs mt-1">Select an object to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-80 w-80 bg-[#000000] border-l border-zinc-800 h-full max-h-screen overflow-y-auto flex flex-col items-center py-8 px-2">
      {/* Single Element Panel - Highest Priority */}
      {selectedVertex && selectedVertices.length === 1 && !selectedShape && (
        <div className="w-full max-w-xs bg-black rounded-lg shadow-lg p-4 mb-4 border border-zinc-700 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white font-medium">Single Element</span>
          </div>
          
          {/* Position */}
          <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white text-sm">Position</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["x", "y", "z"] as const).map((axis) => (
                <div key={axis} className="space-y-1">
                  <label className="text-xs text-zinc-400 uppercase">{axis}</label>
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
                    className="w-full bg-black border border-zinc-600/50 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-blue-400/50"
                    placeholder="0.0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-white text-sm">Color</span>
            </div>
            <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* Shape Properties Panel */}
      {(selectedShape || showShapePanel) && !(selectedVertex && selectedVertices.length === 1) && (
        <div className="w-full max-w-xs m-3 bg-black border border-zinc-700/50 rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-4 border-b border-zinc-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{(selectedShape || shapeForPanel)?.type?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Shape Properties</h3>
                  <p className="text-zinc-400 text-xs capitalize">{(selectedShape || shapeForPanel)?.type}</p>
                </div>
              </div>
              <Badge className="bg-black border-blue-500/30 text-blue-300 px-2 py-0.5 text-xs">
                {(selectedShape || shapeForPanel)?.type}
              </Badge>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300 text-xs">Active</span>
                </div>
                <div className="text-lg font-bold text-blue-400">{(selectedShape || shapeForPanel)?.vertices.length || 0}</div>
                <div className="text-xs text-blue-300/60">vertices</div>
              </div>
              <div className="bg-black border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 text-xs">Target</span>
                </div>
                <div className="text-lg font-bold text-green-400">{(selectedShape || shapeForPanel)?.elementCount || 8}</div>
                <div className="text-xs text-green-300/60">target</div>
              </div>
            </div>
            
            {/* Sync Status */}
            {selectedShape && selectedShape.vertices.length !== (selectedShape.elementCount || 8) && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-300 text-xs">
                    Vertices will sync to target density on next update
                  </span>
                </div>
              </div>
            )}
            {selectedShape && (
              <>
                {/* Element Count Control */}
                <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-white text-sm">Element Count</span>
                    </div>
                    <div className="bg-black border border-purple-400/30 px-2 py-1 rounded">
                      <span className="text-purple-300 text-xs font-bold">{selectedShape.elementCount || 8}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-zinc-400 flex justify-between">
                      <span>Vertices: {selectedShape.vertices.length}</span>
                      <span>3-1000</span>
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
                      className="w-full bg-black border border-zinc-600/50 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-400/50"
                    />
                  </div>
                </div>
                {/* Position */}
                <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
                  <div className="flex items-center space-x-1 mb-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white text-sm">Position</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["x", "y", "z"] as const).map((axis) => (
                      <div key={axis} className="space-y-2">
                        <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{axis}</label>
                        <input
                          type="number"
                          step="0.1"
                          value={shapePositionInput[axis]}
                          onChange={e => setShapePositionInput(prev => ({ ...prev, [axis]: e.target.value }))}
                          onBlur={() => {
                            const newValue = Number.parseFloat(shapePositionInput[axis]) || 0;
                            const currentShape = use3DStore.getState().shapes.find(s => s.id === selectedShape.id);
                            const verticesMap = use3DStore.getState().vertices;
                            if (!currentShape) return;
                            const vertexPositions = currentShape.vertices.map(vertexId => {
                              const vertex = verticesMap.get(vertexId);
                              return vertex ? vertex.position[axis] : 0;
                            });
                            const avgVertexPos = vertexPositions.length > 0 ? vertexPositions.reduce((a, b) => a + b, 0) / vertexPositions.length : 0;
                            const delta = newValue - avgVertexPos;
                            updateShape(currentShape.id, { position: { ...currentShape.position, [axis]: newValue } });
                            currentShape.vertices.forEach(vertexId => {
                              const vertex = verticesMap.get(vertexId);
                              if (vertex) {
                                updateVertex(vertexId, { position: { ...vertex.position, [axis]: vertex.position[axis] + delta } });
                              }
                            });
                          }}
                          className="w-full bg-black border border-zinc-600/50 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-blue-400/50"
                          placeholder="0.0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Scale */}
                <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
                  <div className="flex items-center space-x-1 mb-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-white text-sm">Scale</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["x", "y", "z"] as const).map((axis) => (
                      <div key={axis} className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase">{axis}</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={selectedShape.scale[axis]}
                          onChange={e => updateShape(selectedShape.id, { scale: { ...selectedShape.scale, [axis]: Number.parseFloat(e.target.value) || 0.1 } })}
                          className="w-full bg-black border border-zinc-600/50 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-orange-400/50"
                          placeholder="1.0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rotation */}
                <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm">Rotation</span>
                    </div>
                    <span className="text-xs text-zinc-400 bg-black border border-zinc-600 px-2 py-0.5 rounded">deg</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["x", "y", "z"] as const).map((axis) => (
                      <div key={axis} className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase">{axis}</label>
                        <input
                          type="number"
                          step="1"
                          value={Math.round((selectedShape.rotation[axis] * 180) / Math.PI)}
                          onChange={e => updateShape(selectedShape.id, { rotation: { ...selectedShape.rotation, [axis]: ((Number.parseFloat(e.target.value) || 0) * Math.PI) / 180 } })}
                          className="w-full bg-black border border-zinc-600/50 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-green-400/50"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Clear Elements Button */}
                <div className="pt-1">
                  <button
                    onClick={() => clearShapeVertices(selectedShape.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Elements</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}




      {/* Multi-Element Panel */}
      {selectedVertices.length > 1 && (
        <div className="w-full max-w-xs bg-black rounded-lg shadow-lg p-4 mb-4 border border-zinc-700 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-white font-medium">{selectedVertices.length} Vertices Selected</span>
          </div>
          {/* Position */}
          <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white text-sm">Position (Batch)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["x", "y", "z"] as const).map((axis) => (
                <div key={axis} className="space-y-1">
                  <label className="text-xs text-zinc-400 uppercase">{axis}</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={multiPosition[axis]}
                    onChange={e => {
                      const value = e.target.value
                      setMultiPosition(prev => ({ ...prev, [axis]: value }))
                      if (value !== "") {
                        allSelectedVertices.forEach((v: any) => updateVertex(v.id, { position: { ...v.position, [axis]: Number.parseFloat(value) } }))
                      }
                    }}
                    className="w-full bg-black border border-zinc-600/50 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-blue-400/50"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Color */}
          <div className="bg-black border border-zinc-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-white text-sm">Color (Batch)</span>
            </div>
            <div className="flex items-center gap-2">
              <ColorPicker
                value="#ffffff"
                onChange={(color) => allSelectedVertices.forEach((v: any) => updateVertex(v.id, { color }))}
                className="w-full"
                showAlpha={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
