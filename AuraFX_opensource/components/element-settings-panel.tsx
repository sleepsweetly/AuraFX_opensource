import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EffectType } from "@/app/page"
import type { Layer } from "@/types"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { TargeterSelectModal } from "@/components/targeter-select-modal"
import { ColorPicker } from "@/components/ui/color-picker"
import { Sparkles, Target, Layers, Palette, Settings2, ChevronDown, ChevronRight, Circle, Zap, Wind, CircleDot, Tornado } from "lucide-react"

interface ElementSettingsPanelProps {
  layers: Layer[]
  currentLayer: Layer | null
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void
  modes: any
  onShowCode: () => void
  updateSelectedElementsParticle?: (particle: string) => void
}

const EFFECT_TYPE_ICONS: Record<string, any> = {
  particles: <Sparkles className="w-4 h-4" />,
  particlelinehelix: <Wind className="w-4 h-4" />,
  particleorbital: <CircleDot className="w-4 h-4" />,
  particlering: <Circle className="w-4 h-4" />,
  particleline: <ChevronRight className="w-4 h-4" />,
  particlelinering: <Circle className="w-4 h-4" />,
  particlesphere: <Circle className="w-4 h-4" />,
  particletornado: <Tornado className="w-4 h-4" />,
}

export function ElementSettingsPanel({
  layers,
  currentLayer,
  onUpdateLayer,
  modes,
  onShowCode,
}: ElementSettingsPanelProps) {
  const [showParticleSelect, setShowParticleSelect] = useState(false)
  const [showTargeterSelect, setShowTargeterSelect] = useState(false)

  const selectedLayer = currentLayer

  console.log('ElementSettingsPanel:', {
    currentLayerId: currentLayer?.id,
    selectedLayerName: selectedLayer?.name,
    selectedLayerRepeat: selectedLayer?.repeat
  })

  const effectTypes: EffectType[] = [
    "particles",
    "particlelinehelix",
    "particleorbital",
    "particlering",
    "particleline",
    "particlelinering",
    "particlesphere",
    "particletornado",
  ]

  // Aktif modları göster
  const getActiveModes = () => {
    const activeModes = Object.entries(modes)
      .filter(([_, active]) => active)
      .map(([mode, _]) => mode.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()))
    return activeModes.length > 0 ? activeModes : []
  }

  // Effect type parametreleri
  const effectTypeParamsMap: Record<string, { key: string, label: string, type: string }[]> = {
    particles: [],
    particlelinehelix: [
      { key: 'distanceBetween', label: 'Distance Between', type: 'number' },
      { key: 'startYOffset', label: 'Start Y Offset', type: 'number' },
      { key: 'targetYOffset', label: 'Target Y Offset', type: 'number' },
      { key: 'fromOrigin', label: 'From Origin', type: 'boolean' },
      { key: 'helixLength', label: 'Helix Length', type: 'number' },
      { key: 'helixRadius', label: 'Helix Radius', type: 'number' },
      { key: 'helixRotation', label: 'Helix Rotation', type: 'number' },
      { key: 'maxDistance', label: 'Max Distance', type: 'number' },
    ],
    particleorbital: [
      { key: 'radius', label: 'Radius', type: 'number' },
      { key: 'points', label: 'Points', type: 'number' },
      { key: 'ticks', label: 'Ticks', type: 'number' },
      { key: 'interval', label: 'Interval', type: 'number' },
      { key: 'rotationX', label: 'Rotation X', type: 'number' },
      { key: 'rotationY', label: 'Rotation Y', type: 'number' },
      { key: 'rotationZ', label: 'Rotation Z', type: 'number' },
      { key: 'angularVelocityX', label: 'Angular Velocity X', type: 'number' },
      { key: 'angularVelocityY', label: 'Angular Velocity Y', type: 'number' },
      { key: 'angularVelocityZ', label: 'Angular Velocity Z', type: 'number' },
      { key: 'rotate', label: 'Rotate', type: 'boolean' },
      { key: 'reversed', label: 'Reversed', type: 'boolean' },
    ],
    particlering: [
      { key: 'ringPoints', label: 'Ring Points', type: 'number' },
      { key: 'ringRadius', label: 'Ring Radius', type: 'number' },
    ],
    particleline: [
      { key: 'distanceBetween', label: 'Distance Between', type: 'number' },
      { key: 'startYOffset', label: 'Start Y Offset', type: 'number' },
      { key: 'targetYOffset', label: 'Target Y Offset', type: 'number' },
      { key: 'fromOrigin', label: 'From Origin', type: 'boolean' },
      { key: 'zigzag', label: 'Zigzag', type: 'boolean' },
      { key: 'zigzags', label: 'Zigzags', type: 'number' },
      { key: 'zigzagOffset', label: 'Zigzag Offset', type: 'number' },
      { key: 'maxDistance', label: 'Max Distance', type: 'number' },
    ],
    particlelinering: [
      { key: 'distanceBetween', label: 'Distance Between', type: 'number' },
      { key: 'startYOffset', label: 'Start Y Offset', type: 'number' },
      { key: 'targetYOffset', label: 'Target Y Offset', type: 'number' },
      { key: 'fromOrigin', label: 'From Origin', type: 'boolean' },
      { key: 'ringpoints', label: 'Ring Points', type: 'number' },
      { key: 'ringradius', label: 'Ring Radius', type: 'number' },
      { key: 'maxDistance', label: 'Max Distance', type: 'number' },
    ],
    particlesphere: [
      { key: 'sphereRadius', label: 'Sphere Radius', type: 'number' },
    ],
    particletornado: [
      { key: 'maxRadius', label: 'Max Radius', type: 'number' },
      { key: 'tornadoHeight', label: 'Tornado Height', type: 'number' },
      { key: 'tornadoInterval', label: 'Tornado Interval', type: 'number' },
      { key: 'tornadoDuration', label: 'Tornado Duration', type: 'number' },
      { key: 'rotationSpeed', label: 'Rotation Speed', type: 'number' },
      { key: 'sliceHeight', label: 'Slice Height', type: 'number' },
      { key: 'stopOnCasterDeath', label: 'Stop On Caster Death', type: 'boolean' },
      { key: 'stopOnEntityDeath', label: 'Stop On Entity Death', type: 'boolean' },
      { key: 'cloudParticle', label: 'Cloud Particle', type: 'string' },
      { key: 'cloudSize', label: 'Cloud Size', type: 'number' },
      { key: 'cloudAmount', label: 'Cloud Amount', type: 'number' },
      { key: 'cloudHSpread', label: 'Cloud H Spread', type: 'number' },
      { key: 'cloudVSpread', label: 'Cloud V Spread', type: 'number' },
      { key: 'cloudPSpeed', label: 'Cloud P Speed', type: 'number' },
      { key: 'cloudYOffset', label: 'Cloud Y Offset', type: 'number' },
    ],
  }

  const renderEffectTypeParams = () => {
    if (!selectedLayer) return null
    const params = effectTypeParamsMap[selectedLayer.effectType] || []
    console.log('Effect type:', selectedLayer.effectType, 'Params:', params)
    if (params.length === 0) return null

    return (
      <div className="space-y-3 mt-4">
        {params.map(param => {
          const value = selectedLayer.effectParams && param.key in selectedLayer.effectParams
            ? (selectedLayer.effectParams as any)[param.key]
            : '';
          return (
            <div key={param.key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-gray-700 text-sm font-medium block mb-2">{param.label}</Label>
              {param.type === 'boolean' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: true } })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${value ? 'bg-black text-white border border-gray-300' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    True
                  </button>
                  <button
                    onClick={() => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: false } })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!value ? 'bg-black text-white border border-gray-300' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    False
                  </button>
                </div>
              ) : (
                <Input
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={e => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: param.type === 'number' ? parseFloat(e.target.value) : e.target.value } })}
                  className="bg-white border-gray-200 text-gray-900 h-9 text-sm"
                  placeholder={`Enter ${param.label.toLowerCase()}`}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="pb-3 border-b border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Element Config</h2>
              <p className="text-sm text-gray-500">Customize your effects</p>
            </div>
          </div>

          {/* Active Modes Pills */}
          <div className="flex gap-2">
            {getActiveModes().map((mode) => (
              <span key={mode} className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                {mode}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">


        {/* Particle & Targeter Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <Label className="text-gray-700 text-sm font-medium">Particle Type</Label>
            </div>
            <Button
              onClick={() => setShowParticleSelect(true)}
              variant="outline"
              className="w-full justify-between border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 bg-white h-10"
            >
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                {selectedLayer?.particle || "reddust"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-gray-600" />
              <Label className="text-gray-700 text-sm font-medium">Targeter</Label>
            </div>
            <Button
              onClick={() => setShowTargeterSelect(true)}
              variant="outline"
              className="w-full justify-between border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 bg-white h-10"
            >
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                {selectedLayer?.targeter || "Origin"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Color Selection */}
        {selectedLayer && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-gray-600" />
              <Label className="text-gray-700 text-sm font-medium">Layer Color</Label>
            </div>
            <div className="flex items-center gap-3">
              <ColorPicker
                value={selectedLayer.color}
                onChange={(color) => {
                  console.log('Updating layer color:', selectedLayer.id, color)
                  onUpdateLayer(selectedLayer.id, { color })
                }}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Effect Type Selection */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-gray-600" />
            <Label className="text-gray-700 text-sm font-medium">Effect Type</Label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {effectTypes.map(type => (
              <button
                key={type}
                onClick={() => {
                  if (selectedLayer) {
                    console.log('Setting effect type to:', type)
                    onUpdateLayer(selectedLayer.id, { effectType: type, effectParams: {} })
                  }
                }}
                className={`group relative rounded-lg border p-3 transition-all duration-200 text-xs font-medium
                  ${selectedLayer?.effectType === type
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg transition-all duration-200 ${selectedLayer?.effectType === type ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                    {EFFECT_TYPE_ICONS[type] || <Zap className="w-4 h-4" />}
                  </div>
                  <span className="text-center leading-tight">
                    {type === "particles"
                      ? "Basic"
                      : type.replace("particle", "").replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Layer Properties */}
        {selectedLayer && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-gray-600" />
              <Label className="text-gray-700 text-sm font-medium">Layer Properties</Label>
            </div>
            <div className="space-y-4">
              {/* Repeat */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700 text-sm font-medium">Repeat</Label>
                  <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    {selectedLayer.repeat}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={selectedLayer.repeat}
                  onChange={e => {
                    console.log('Updating layer repeat:', selectedLayer.id, Number(e.target.value))
                    onUpdateLayer(selectedLayer.id, { repeat: Number(e.target.value) })
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Alpha */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700 text-sm font-medium">Amount</Label>
                  <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    {selectedLayer.alpha}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={selectedLayer.alpha}
                  onChange={e => onUpdateLayer(selectedLayer.id, { alpha: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>

              {/* Y Offset */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700 text-sm font-medium">Y Offset</Label>
                  <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    {selectedLayer.yOffset}
                  </span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.1}
                  value={selectedLayer.yOffset}
                  onChange={e => onUpdateLayer(selectedLayer.id, { yOffset: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>-10</span>
                  <span>10</span>
                </div>
              </div>

              {/* Repeat Interval */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700 text-sm font-medium">Repeat Interval</Label>
                  <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    {selectedLayer.repeatInterval || 1}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={selectedLayer.repeatInterval || 1}
                  onChange={e => onUpdateLayer(selectedLayer.id, { repeatInterval: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effect Parameters */}
        {selectedLayer && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-gray-600" />
              <Label className="text-gray-700 text-sm font-medium">Effect Parameters</Label>
            </div>
            {renderEffectTypeParams() || (
              <div className="text-center py-4 text-gray-500 text-sm">
                {selectedLayer.effectType === 'particles'
                  ? 'Basic particles effect has no additional parameters.'
                  : 'Select an effect type to see parameters.'}
              </div>
            )}
          </div>
        )}

        {/* Generate Code Button */}
        <div className="pt-4">
          <Button
            onClick={onShowCode}
            className="w-full rounded-lg bg-black hover:bg-gray-800 text-white font-medium py-3 transition-all duration-200"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Code
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showParticleSelect && (
        <ParticleSelectModal
          currentParticle={selectedLayer?.particle || "reddust"}
          onSelectParticle={(particle) => {
            if (selectedLayer) {
              onUpdateLayer(selectedLayer.id, { particle })
            }
          }}
          onClose={() => setShowParticleSelect(false)}
        />
      )}
      {showTargeterSelect && (
        <TargeterSelectModal
          currentTargeter={selectedLayer?.targeter || "Origin"}
          onSelectTargeter={(targeter) => {
            if (selectedLayer) {
              onUpdateLayer(selectedLayer.id, { targeter })
            }
          }}
          onClose={() => setShowTargeterSelect(false)}
        />
      )}
    </div>
  )
} 