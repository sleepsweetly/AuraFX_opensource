"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  MousePointer,
  Move3D,
  RotateCw,
  Scale,
  Scissors,
  Grid3X3,
  Axis3D,
  Eye,
  Download,
  Upload,
  Undo,
  Redo,
  Trash2,
} from "lucide-react"
import { use3DStore } from "../../store/use3DStore"

export function TopToolbar() {
  const {
    currentTool,
    setCurrentTool,
    transformMode,
    setTransformMode,
    scene,
    updateScene,
    camera,
    updateCamera,
    selectedVertices,
    selectedShapes,
    undo,
    redo,
    history,
    historyIndex,
    exportScene,
    exportToMythicMobs,
    clearScene,
    vertices,
    shapes,
  } = use3DStore()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleExportJSON = () => {
    const data = exportScene()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "aurafx_scene.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportMythicMobs = () => {
    const data = exportToMythicMobs()
    const blob = new Blob([data], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mythicmobs_skill.yml"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          use3DStore.getState().importScene(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="h-16 bg-zinc-800 border-b border-zinc-700 flex items-center px-4 space-x-2">
      {/* Tool Selection */}
      <div className="flex items-center space-x-1">
        <Button
          variant={currentTool === "select" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentTool("select")}
          className="h-8 w-8 p-0"
          title="Select Tool"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Transform Modes */}
      <div className="flex items-center space-x-1">
        <Button
          variant={transformMode === "translate" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTransformMode("translate")}
          className="h-8 w-8 p-0"
          title="Move (G)"
        >
          <Move3D className="h-4 w-4" />
        </Button>

        <Button
          variant={transformMode === "rotate" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTransformMode("rotate")}
          className="h-8 w-8 p-0"
          title="Rotate (R)"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Button
          variant={transformMode === "scale" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTransformMode("scale")}
          className="h-8 w-8 p-0"
          title="Scale (S)"
        >
          <Scale className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View Options */}
      <div className="flex items-center space-x-1">
        <Button
          variant={scene.showGrid ? "default" : "ghost"}
          size="sm"
          onClick={() => updateScene({ showGrid: !scene.showGrid })}
          className="h-8 w-8 p-0"
          title="Toggle Grid"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>

        <Button
          variant={scene.showAxes ? "default" : "ghost"}
          size="sm"
          onClick={() => updateScene({ showAxes: !scene.showAxes })}
          className="h-8 w-8 p-0"
          title="Toggle Axes"
        >
          <Axis3D className="h-4 w-4" />
        </Button>

        <Button
          variant={camera.isPerspective ? "default" : "ghost"}
          size="sm"
          onClick={() => updateCamera({ isPerspective: !camera.isPerspective })}
          className="h-8 w-8 p-0"
          title="Toggle Perspective/Orthographic"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* History */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* File Operations */}
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={handleImport} className="h-8 px-3" title="Import Scene">
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>

        <Button variant="ghost" size="sm" onClick={handleExportJSON} className="h-8 px-3" title="Export as JSON">
          <Download className="h-4 w-4 mr-1" />
          JSON
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportMythicMobs}
          className="h-8 px-3"
          title="Export for MythicMobs"
        >
          <Download className="h-4 w-4 mr-1" />
          YAML
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Scene Actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearScene}
        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
        title="Clear Scene"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Scene Info */}
      <div className="flex-1 flex justify-center items-center space-x-2">
        <Badge variant="secondary" className="text-xs">
          {vertices.size} vertices
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {shapes.length} shapes
        </Badge>
        {(selectedVertices.length > 0 || selectedShapes.length > 0) && (
          <Badge variant="default" className="text-xs">
            {selectedVertices.length + selectedShapes.length} selected
          </Badge>
        )}
      </div>

      {/* Title */}
      <div className="text-lg font-semibold text-zinc-200">AuraFX 3D Editor</div>
    </div>
  )
}
