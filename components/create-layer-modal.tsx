"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Sparkles } from "lucide-react"

interface CreateLayerModalProps {
  onCreateLayer: (data: { name: string; tickDelay: number }) => void
  onClose: () => void
}

export function CreateLayerModal({ onCreateLayer, onClose }: CreateLayerModalProps) {
  const [layerName, setLayerName] = useState("")
  const [tickDelay, setTickDelay] = useState(20)

  const handleCreate = () => {
    if (layerName.trim()) {
      onCreateLayer({ name: layerName.trim(), tickDelay })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-zinc-800 rounded w-[350px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-zinc-700 rounded-sm"></div>
            <span className="text-white text-sm font-semibold">Create New Layer</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-zinc-90 p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-bold text-white">CREATE NEW LAYER</h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white text-sm font-medium">Layer Name</Label>
              <Input
                value={layerName}
                onChange={(e) => setLayerName(e.target.value)}
                placeholder="Enter layer name..."
                className="bg-zinc-9000 border-zinc-800 text-white h-8 text-sm"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <Label className="text-white text-sm font-medium">Tick Delay</Label>
              <Input
                type="number"
                value={tickDelay}
                onChange={(e) => setTickDelay(Number.parseInt(e.target.value) || 20)}
                className="bg-zinc-9000 border-zinc-800 text-white h-8 text-sm"
              />
              <p className="text-xs text-zinc-500">Delay between particle spawns (in ticks)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800">
          <Button
            onClick={handleCreate}
            disabled={!layerName.trim()}
            className="w-full bg-zinc-90 hover:bg-zinc-700 text-white h-10 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            CREATE LAYER
          </Button>
        </div>
      </div>
    </div>
  )
}
