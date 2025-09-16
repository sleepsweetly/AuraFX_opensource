"use client"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Layer } from "@/types"

interface SettingsPanelProps {
  settings: any
  onSettingsChange: (settings: any) => void
  currentLayer: Layer | null
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
}

export function SettingsPanel({ settings, onSettingsChange, currentLayer, onUpdateLayer }: SettingsPanelProps) {
  return (
    <div className="p-4 flex-1 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>

      {/* Effect Modes */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-300">Effect Modes</h4>

        <div className="flex items-center justify-between">
          <Label htmlFor="mirror-mode">Mirror Mode</Label>
          <Switch
            id="mirror-mode"
            checked={settings.mirrorMode}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, mirrorMode: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="rotate-mode">Rotate Mode</Label>
          <Switch
            id="rotate-mode"
            checked={settings.rotateMode}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, rotateMode: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="rise-mode">Rise Mode</Label>
          <Switch
            id="rise-mode"
            checked={settings.riseMode}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, riseMode: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="rainbow-mode">Rainbow Mode</Label>
          <Switch
            id="rainbow-mode"
            checked={settings.rainbowMode}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, rainbowMode: checked })}
          />
        </div>
      </div>

      {/* Layer Settings */}
      {currentLayer && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-300">Layer Settings</h4>

          <div>
            <Label htmlFor="layer-repeat">Repeat: {currentLayer.repeat}</Label>
            <Slider
              id="layer-repeat"
              min={1}
              max={10}
              step={1}
              value={[currentLayer.repeat]}
              onValueChange={([value]) => onUpdateLayer?.(currentLayer.id, { repeat: value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="layer-alpha">Alpha: {currentLayer.alpha}</Label>
            <Slider
              id="layer-alpha"
              min={0}
              max={1}
              step={0.1}
              value={[currentLayer.alpha]}
              onValueChange={([value]) => onUpdateLayer?.(currentLayer.id, { alpha: value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="layer-yoffset">Y Offset: {currentLayer.yOffset}</Label>
            <Slider
              id="layer-yoffset"
              min={-10}
              max={10}
              step={0.1}
              value={[currentLayer.yOffset]}
              onValueChange={([value]) => onUpdateLayer?.(currentLayer.id, { yOffset: value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="layer-targeter">Targeter</Label>
            <Input
              id="layer-targeter"
              value={currentLayer.targeter}
              onChange={(e) => onUpdateLayer?.(currentLayer.id, { targeter: e.target.value })}
              placeholder="Origin"
            />
          </div>
        </div>
      )}
    </div>
  )
}
