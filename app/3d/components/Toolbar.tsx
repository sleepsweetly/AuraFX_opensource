"use client"

import { use3DStore } from "../store/use3DStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MousePointer, Move3D, RotateCw, Scale, Grid3X3, Axis3D, Download } from "lucide-react"

export function Toolbar() {
  const { currentTool, setCurrentTool, transformMode, setTransformMode, scene, updateScene, exportToMythicMobs, mode } =
    use3DStore()

  const handleExport = () => {
    const code = exportToMythicMobs()
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mythicmobs_skill.yml"
    a.click()
    URL.revokeObjectURL(url)
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
          disabled={mode !== "edit"}
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
        >
          <Move3D className="h-4 w-4" />
        </Button>
        <Button
          variant={transformMode === "rotate" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTransformMode("rotate")}
          className="h-8 w-8 p-0"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant={transformMode === "scale" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTransformMode("scale")}
          className="h-8 w-8 p-0"
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
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={scene.showAxes ? "default" : "ghost"}
          size="sm"
          onClick={() => updateScene({ showAxes: !scene.showAxes })}
          className="h-8 w-8 p-0"
        >
          <Axis3D className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* File Operations */}
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={handleExport} className="h-8 px-3">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-zinc-200">AuraFX 3D Editor</h1>
      </div>
    </div>
  )
}
