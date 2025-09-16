"use client"

import { use3DStore } from "../store/use3DStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Trash2, Plus } from "lucide-react"

export function ObjectPanel() {
  const {
    layers,
    currentLayer,
    addLayer,
    deleteLayer
  } = use3DStore()

  return (
    <div className="h-full flex flex-col">
      {/* Layer Yönetimi */}
      <Card className="m-4 bg-zinc-800 border-zinc-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-zinc-200">Layers</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addLayer({
                name: "New Layer",
                visible: true,
                color: "#ffffff",
                effectType: "particles",
                elements: [],
                tickStart: 0,
                tickEnd: 0,
                tickDelay: 0,
                particle: "",
                alpha: 1,
                shapeSize: 1,
                repeat: 1,
                yOffset: 0,
                repeatInterval: 1,
                targeter: "@self",
              })}
              className="h-8 w-8 p-0 border-zinc-600 hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                currentLayer?.id === layer.id
                  ? "bg-blue-600/20 border border-blue-500/50"
                  : "bg-zinc-700/50 hover:bg-zinc-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full border border-zinc-500" style={{ backgroundColor: layer.color }} />
                <span className="text-sm text-zinc-200">{layer.name}</span>
                <span className="text-xs text-zinc-400">{/* element sayısı gösterilemiyor */}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-zinc-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Toggle visibility
                  }}
                >
                  {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteLayer(layer.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {layers.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <p className="text-sm">No layers yet</p>
              <p className="text-xs">Click + to add a layer</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Element Listesi */}
      {currentLayer && (
        <Card className="m-4 mt-0 bg-zinc-800 border-zinc-700 flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-zinc-200">Elements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 overflow-y-auto">
            <div className="text-center py-8 text-zinc-400">
              <p className="text-sm">Element listesi gösterilemiyor</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
