"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Minus } from "lucide-react"
import type { Layer } from "@/types"

interface ElementSettingsModalProps {
  layers: Layer[]
  currentLayer: Layer | null
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void
  onClose: () => void
  onGenerateCode: () => void
  modes: any
}

export function ElementSettingsModal({
  layers,
  currentLayer,
  onUpdateLayer,
  onClose,
  onGenerateCode,
  modes,
}: ElementSettingsModalProps) {
  const [selectedLayerId, setSelectedLayerId] = useState(currentLayer?.id || "")
  const [targeterList, setTargeterList] = useState(["@Origin"])
  const [newTargeter, setNewTargeter] = useState("")
  const [showAddTargeterDialog, setShowAddTargeterDialog] = useState(false)

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || currentLayer

  const getActiveModes = () => {
    const activeModes = Object.entries(modes)
      .filter(([_, active]) => active)
      .map(([mode, _]) => mode.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()))

    return activeModes.length > 0 ? activeModes.join(", ") : "No mode information"
  }

  const handleShowCode = () => {
    onGenerateCode()
    onClose()
  }

  const handleAddTargeter = () => {
    if (newTargeter.trim()) {
      setTargeterList([...targeterList, newTargeter.trim()])
      setNewTargeter("")
      setShowAddTargeterDialog(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-zinc-800 rounded w-[600px] h-[500px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-zinc-700 rounded-sm"></div>
            <span className="text-white text-sm font-semibold">Element Settings</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-zinc-90 p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <h2 className="text-white text-lg font-bold">ELEMENT SETTINGS</h2>

          {/* Layer Selection */}
          <div className="space-y-1">
            <Label className="text-zinc-400 text-sm font-medium">SELECT LAYER</Label>
            <Select value={selectedLayerId} onValueChange={setSelectedLayerId}>
              <SelectTrigger className="bg-zinc-9000 border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-9000 border-zinc-800">
                {layers.map((layer) => (
                  <SelectItem key={layer.id} value={layer.id} className="text-white hover:bg-zinc-90">
                    {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Modes */}
          <div className="bg-zinc-9000 border border-zinc-800 rounded p-2">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-medium">ACTIVE MODES:</span>
              <span className="text-zinc-400 text-sm">{getActiveModes()}</span>
            </div>
          </div>

          {/* Settings Grid */}
          {selectedLayer && (
            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">ALPHA</Label>
                <Input
                  value={selectedLayer.alpha}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { alpha: Number.parseFloat(e.target.value) || 0 })}
                  className="bg-zinc-9000 border-zinc-800 text-white h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">REPEAT</Label>
                <Input
                  value={selectedLayer.repeat}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { repeat: Number.parseInt(e.target.value) || 0 })}
                  className="bg-zinc-9000 border-zinc-800 text-white h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">COLOR</Label>
                <Input
                  value={selectedLayer.color}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })}
                  className="bg-zinc-9000 border-zinc-800 text-white h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Y OFFSET</Label>
                <Input
                  value={selectedLayer.yOffset}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { yOffset: Number.parseFloat(e.target.value) || 0 })}
                  className="bg-zinc-9000 border-zinc-800 text-white h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">REPEAT INTERVAL</Label>
                <Input
                  value={selectedLayer.repeatInterval}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { repeatInterval: Number.parseInt(e.target.value) || 0 })
                  }
                  className="bg-zinc-9000 border-zinc-800 text-white h-7 text-xs"
                />
              </div>
            </div>
          )}

          {/* Targeter Configuration */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-sm font-medium">TARGETER CONFIGURATION</Label>

            <Select
              value={selectedLayer?.targeter}
              onValueChange={(value) => selectedLayer && onUpdateLayer(selectedLayer.id, { targeter: value })}
            >
              <SelectTrigger className="bg-zinc-9000 border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-9000 border-zinc-800">
                {targeterList.map((targeter) => (
                  <SelectItem key={targeter} value={targeter} className="text-white hover:bg-zinc-90">
                    {targeter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Targeter List */}
            <div className="bg-zinc-9000 border border-zinc-800 rounded h-24 p-2 overflow-y-auto">
              {targeterList.map((targeter, index) => (
                <div key={index} className="text-white text-sm py-1 px-2 hover:bg-zinc-90 rounded">
                  {targeter}
                </div>
              ))}
            </div>

            {/* Add/Remove Targeter */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => setShowAddTargeterDialog(true)}
                className="bg-zinc-90 hover:bg-zinc-700 text-white w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (targeterList.length > 1) {
                    setTargeterList(targeterList.slice(0, -1))
                  }
                }}
                className="bg-zinc-90 hover:bg-zinc-700 text-white w-8 h-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-zinc-500 text-sm ml-2">Add or remove targeters</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-3 border-t border-zinc-800">
          <Button onClick={onClose} className="bg-zinc-90 hover:bg-zinc-700 text-white px-6">
            CLOSE
          </Button>
          <Button onClick={handleShowCode} className="bg-zinc-700 hover:bg-zinc-600 text-white px-6">
            SHOW CODE
          </Button>
        </div>
      </div>

      {/* Add Targeter Dialog */}
      {showAddTargeterDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-black border border-zinc-800 rounded w-[250px] p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-zinc-700 rounded-sm"></div>
                <span className="text-white text-sm font-semibold">Add Targeter</span>
              </div>
            </div>
            <Label className="text-white text-sm mb-2 block">Enter new targeter:</Label>
            <Input
              value={newTargeter}
              onChange={(e) => setNewTargeter(e.target.value)}
              className="bg-zinc-9000 border-zinc-800 text-white mb-3 h-7 text-xs"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleAddTargeter}
                disabled={!newTargeter.trim()}
                className="flex-1 bg-zinc-90 hover:bg-zinc-700 text-white text-xs h-7 disabled:opacity-50"
              >
                OK
              </Button>
              <Button
                onClick={() => setShowAddTargeterDialog(false)}
                className="flex-1 bg-zinc-9000 hover:bg-zinc-90 text-white text-xs h-7"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
