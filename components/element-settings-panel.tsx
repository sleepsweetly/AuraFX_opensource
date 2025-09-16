import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EffectType } from "@/app/page"
import type { Layer } from "@/types"
import { ColorPicker } from "@/components/ui/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { TargeterSelectModal } from "@/components/targeter-select-modal"
import { Sparkles, Target, Layers, Palette, Settings2, ChevronDown, ChevronRight, ChevronLeft, Circle, Square, Zap, Wind, Cloud, CircleDot, Tornado } from "lucide-react"

interface ElementSettingsPanelProps {
  layers: Layer[]
  currentLayer: Layer | null
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void
  modes: any
  onShowCode: () => void
  updateSelectedElementsParticle?: (particle: string) => void
}

const EFFECT_TYPE_ICONS: Record<string, any> = {
  particles: <Sparkles className="w-5 h-5" />, // default
  particlelinehelix: <Wind className="w-5 h-5" />, // helix
  particleorbital: <CircleDot className="w-5 h-5" />, // orbital
  particlering: <Circle className="w-5 h-5" />, // ring
  particleline: <ChevronRight className="w-5 h-5" />, // line
  particlelinering: <Circle className="w-5 h-5" />, // line ring
  particlesphere: <Circle className="w-5 h-5" />, // sphere
  particletornado: <Tornado className="w-5 h-5" />, // tornado
}

export function ElementSettingsPanel({
  layers,
  currentLayer,
  onUpdateLayer,
  modes,
  onShowCode,
  updateSelectedElementsParticle,
}: ElementSettingsPanelProps) {
  const [selectedLayerId, setSelectedLayerId] = useState(currentLayer?.id || "")
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showParticleSelect, setShowParticleSelect] = useState(false)
  const [showTargeterSelect, setShowTargeterSelect] = useState(false)

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || currentLayer

  // Effect type seçimi
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

  // EffectType'a göre effectParams alanlarını dinamik olarak gösteren fonksiyonu güncelliyorum.
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
    if (params.length === 0) return null
    return (
      <div className="space-y-3 mt-4">
        {params.map(param => {
          const value = selectedLayer.effectParams && param.key in selectedLayer.effectParams
            ? (selectedLayer.effectParams as any)[param.key]
            : '';
          return (
            <div key={param.key} className="bg-white/3 border border-white/8 rounded-lg p-3 hover:border-white/15 transition-colors">
              <Label className="text-white/70 text-sm font-medium block mb-2">{param.label}</Label>
              {param.type === 'boolean' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: true } })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      value ? 'bg-white/20 text-white border border-white/30' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    True
                  </button>
                  <button
                    onClick={() => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: false } })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      !value ? 'bg-white/20 text-white border border-white/30' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
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
                  className="bg-white/5 border border-white/10 text-white h-9 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
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
    <section className="flex-1 h-full flex flex-col bg-[#000000] overflow-y-auto">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 bg-[#000000]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Element Config</h2>
              <p className="text-white/50 text-sm">Customize your effects</p>
            </div>
          </div>
          
          {/* Active Modes Pills */}
          <div className="flex gap-2">
            {getActiveModes().map((mode) => (
              <span key={mode} className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white/80 px-3 py-1.5 rounded-full text-xs font-medium">
                {mode}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Layer Selection Card */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Layers className="w-5 h-5 text-white/60" />
            <Label className="text-white/80 text-sm font-semibold">Active Layer</Label>
          </div>
          <div className="flex gap-3 items-center">
            <select
              value={selectedLayerId}
              onChange={e => setSelectedLayerId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
            >
              {layers.map((layer) => (
                <option key={layer.id} value={layer.id}>{layer.name}</option>
              ))}
            </select>
            <div className="bg-gradient-to-r from-white/15 to-white/10 text-white text-sm rounded-lg px-3 py-2.5 font-semibold border border-white/20">
              {selectedLayer?.name}
            </div>
          </div>
        </div>

        {/* Particle & Targeter Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white/60" />
              <Label className="text-white/80 text-sm font-semibold">Particle Type</Label>
            </div>
            <Button
              onClick={() => setShowParticleSelect(true)}
              variant="outline"
              className="w-full justify-between border-white/15 text-white/80 hover:bg-white/10 hover:border-white/25 bg-white/5 h-11"
            >
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                {selectedLayer?.particle || "reddust"}
              </span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </Button>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-white/60" />
              <Label className="text-white/80 text-sm font-semibold">Targeter</Label>
            </div>
            <Button
              onClick={() => setShowTargeterSelect(true)}
              variant="outline"
              className="w-full justify-between border-white/15 text-white/80 hover:bg-white/10 hover:border-white/25 bg-white/5 h-11"
            >
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                {selectedLayer?.targeter || "Origin"}
              </span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </Button>
          </div>
        </div>

        {/* Effect Type Selection */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-white/60" />
            <Label className="text-white/80 text-sm font-semibold">Effect Type</Label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {effectTypes.map(type => (
              <button
                key={type}
                onClick={() => selectedLayer && onUpdateLayer(selectedLayer.id, { effectType: type, effectParams: {} })}
                className={`group relative rounded-xl border-2 p-3 transition-all duration-300 text-xs font-semibold overflow-hidden
                  ${selectedLayer?.effectType === type 
                    ? "border-white/50 bg-gradient-to-br from-white/15 to-white/8 text-white shadow-[0_0_20px_0_rgba(255,255,255,0.15)]" 
                    : "border-white/10 bg-white/3 text-white/60 hover:border-white/25 hover:bg-white/8 hover:scale-105"}`}
              >
                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  selectedLayer?.effectType === type ? 'opacity-100' : ''
                }`} />
                
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    selectedLayer?.effectType === type ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/15'
                  }`}>
                    {EFFECT_TYPE_ICONS[type] || <Zap className="w-5 h-5" />}
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

        {/* Effect Parameters */}
        {renderEffectTypeParams() && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-white/60" />
              <Label className="text-white/80 text-sm font-semibold">Effect Parameters</Label>
            </div>
            {renderEffectTypeParams()}
          </div>
        )}

        {/* Generate Code Button */}
        <div className="sticky bottom-4">
          <Button 
            onClick={onShowCode} 
            className="w-full rounded-xl bg-gradient-to-r from-white/20 to-white/15 hover:from-white/25 hover:to-white/20 text-white font-bold py-4 border border-white/30 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_8px_32px_0_rgba(255,255,255,0.15)]"
            style={{ 
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            <Zap className="w-5 h-5 mr-2" />
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
    </section>
  )
} 