"use client"

import { use3DStore } from "../store/use3DStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ColorPicker } from "@/components/ui/color-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function PropertiesPanel() {
  const { currentLayer, updateLayer, layers } = use3DStore()

  if (!currentLayer) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400">
        <p>No layer selected</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Layer Properties */}
      <Card className="m-4 bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-200">Layer Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-zinc-400">Name</Label>
            <Input
              value={currentLayer.name}
              onChange={(e) => updateLayer(currentLayer.id, { name: e.target.value })}
              className="bg-zinc-700 border-zinc-600 text-zinc-200"
            />
          </div>

          <div>
            <Label className="text-xs text-zinc-400">Color</Label>
            <div className="flex space-x-2">
              <ColorPicker
                value={currentLayer.color}
                onChange={(color) => updateLayer(currentLayer.id, { color })}
                className="w-full"
                showAlpha={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-selection info */}
      {/* {selectedElements.length > 1 && (
        <Card className="m-4 bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-200">
              Multiple Selection ({selectedElements.length} elements)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-400">Multiple elements selected. Individual properties are not editable.</p>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}
