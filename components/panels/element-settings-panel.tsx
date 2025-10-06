"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EffectType } from "@/app/page"
import type { Layer } from "@/types"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { TargeterSelectModal } from "@/components/targeter-select-modal"
import { ColorPicker } from "@/components/ui/color-picker"
import { Sparkles, Target, Palette, Settings2, Circle, Zap, Wind, CircleDot, Tornado, Layers3 } from "lucide-react"

interface ElementSettingsPanelProps {
  layers?: Layer[]
  currentLayer?: Layer | null
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
  modes?: any
  onShowCode?: () => void
  updateSelectedElementsParticle?: (particle: string) => void
  updateSelectedElementsColor?: (color: string) => void
  selectedElementIds?: string[]
}

const EFFECT_TYPE_ICONS: Record<string, any> = {
  particles: <Sparkles className="w-4 h-4" />,
  particlelinehelix: <Wind className="w-4 h-4" />,
  particleorbital: <CircleDot className="w-4 h-4" />,
  particlering: <Circle className="w-4 h-4" />,
  particleline: <Zap className="w-4 h-4" />,
  particlelinering: <Circle className="w-4 h-4" />,
  particlesphere: <Circle className="w-4 h-4" />,
  particletornado: <Tornado className="w-4 h-4" />,
}

export function ElementSettingsPanel({
  layers = [],
  currentLayer,
  onUpdateLayer = () => {},
  modes = {},
  onShowCode = () => {},
  updateSelectedElementsParticle = () => {},
  updateSelectedElementsColor = () => {},
  selectedElementIds = [],
}: ElementSettingsPanelProps) {
  const [showParticleSelect, setShowParticleSelect] = useState(false)
  const [showTargeterSelect, setShowTargeterSelect] = useState(false)

  const selectedLayer = currentLayer

  console.log("ElementSettingsPanel:", {
    currentLayerId: currentLayer?.id,
    selectedLayerName: selectedLayer?.name,
    selectedLayerRepeat: selectedLayer?.repeat,
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

  const getActiveModes = () => {
    const activeModes = Object.entries(modes)
      .filter(([_, active]) => active)
      .map(([mode, _]) => mode.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()))
    return activeModes.length > 0 ? activeModes : []
  }

  const effectTypeParamsMap: Record<string, { key: string; label: string; type: string }[]> = {
    particles: [],
    particlelinehelix: [
      { key: "distanceBetween", label: "Distance Between", type: "number" },
      { key: "startYOffset", label: "Start Y Offset", type: "number" },
      { key: "targetYOffset", label: "Target Y Offset", type: "number" },
      { key: "fromOrigin", label: "From Origin", type: "boolean" },
      { key: "helixLength", label: "Helix Length", type: "number" },
      { key: "helixRadius", label: "Helix Radius", type: "number" },
      { key: "helixRotation", label: "Helix Rotation", type: "number" },
      { key: "maxDistance", label: "Max Distance", type: "number" },
    ],
    particleorbital: [
      { key: "radius", label: "Radius", type: "number" },
      { key: "points", label: "Points", type: "number" },
      { key: "ticks", label: "Ticks", type: "number" },
      { key: "interval", label: "Interval", type: "number" },
      { key: "rotationX", label: "Rotation X", type: "number" },
      { key: "rotationY", label: "Rotation Y", type: "number" },
      { key: "rotationZ", label: "Rotation Z", type: "number" },
      { key: "angularVelocityX", label: "Angular Velocity X", type: "number" },
      { key: "angularVelocityY", label: "Angular Velocity Y", type: "number" },
      { key: "angularVelocityZ", label: "Angular Velocity Z", type: "number" },
      { key: "rotate", label: "Rotate", type: "boolean" },
      { key: "reversed", label: "Reversed", type: "boolean" },
    ],
    particlering: [
      { key: "ringPoints", label: "Ring Points", type: "number" },
      { key: "ringRadius", label: "Ring Radius", type: "number" },
    ],
    particleline: [
      { key: "distanceBetween", label: "Distance Between", type: "number" },
      { key: "startYOffset", label: "Start Y Offset", type: "number" },
      { key: "targetYOffset", label: "Target Y Offset", type: "number" },
      { key: "fromOrigin", label: "From Origin", type: "boolean" },
      { key: "zigzag", label: "Zigzag", type: "boolean" },
      { key: "zigzags", label: "Zigzags", type: "number" },
      { key: "zigzagOffset", label: "Zigzag Offset", type: "number" },
      { key: "maxDistance", label: "Max Distance", type: "number" },
    ],
    particlelinering: [
      { key: "distanceBetween", label: "Distance Between", type: "number" },
      { key: "startYOffset", label: "Start Y Offset", type: "number" },
      { key: "targetYOffset", label: "Target Y Offset", type: "number" },
      { key: "fromOrigin", label: "From Origin", type: "boolean" },
      { key: "ringpoints", label: "Ring Points", type: "number" },
      { key: "ringradius", label: "Ring Radius", type: "number" },
      { key: "maxDistance", label: "Max Distance", type: "number" },
    ],
    particlesphere: [{ key: "sphereRadius", label: "Sphere Radius", type: "number" }],
    particletornado: [
      { key: "maxRadius", label: "Max Radius", type: "number" },
      { key: "tornadoHeight", label: "Tornado Height", type: "number" },
      { key: "tornadoInterval", label: "Tornado Interval", type: "number" },
      { key: "tornadoDuration", label: "Tornado Duration", type: "number" },
      { key: "rotationSpeed", label: "Rotation Speed", type: "number" },
      { key: "sliceHeight", label: "Slice Height", type: "number" },
      { key: "stopOnCasterDeath", label: "Stop On Caster Death", type: "boolean" },
      { key: "stopOnEntityDeath", label: "Stop On Entity Death", type: "boolean" },
      { key: "cloudParticle", label: "Cloud Particle", type: "string" },
      { key: "cloudSize", label: "Cloud Size", type: "number" },
      { key: "cloudAmount", label: "Cloud Amount", type: "number" },
      { key: "cloudHSpread", label: "Cloud H Spread", type: "number" },
      { key: "cloudVSpread", label: "Cloud V Spread", type: "number" },
      { key: "cloudPSpeed", label: "Cloud P Speed", type: "number" },
      { key: "cloudYOffset", label: "Cloud Y Offset", type: "number" },
    ],
  }

  const renderEffectTypeParams = () => {
    if (!selectedLayer) return null
    const params = effectTypeParamsMap[selectedLayer.effectType] || []
    if (params.length === 0) return null

    return (
      <div className="space-y-2">
        {params.map((param) => {
          const value =
            selectedLayer.effectParams && param.key in selectedLayer.effectParams
              ? (selectedLayer.effectParams as any)[param.key]
              : ""
          return (
            <div
              key={param.key}
              className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-md border border-gray-200"
            >
              <Label className="text-gray-700 text-xs font-medium flex-shrink-0">{param.label}</Label>
              {param.type === "boolean" ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateLayer(selectedLayer.id, {
                        effectParams: { ...selectedLayer.effectParams, [param.key]: true },
                      })
                    }
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    True
                  </button>
                  <button
                    onClick={() =>
                      onUpdateLayer(selectedLayer.id, {
                        effectParams: { ...selectedLayer.effectParams, [param.key]: false },
                      })
                    }
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${!value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    False
                  </button>
                </div>
              ) : (
                <Input
                  type={param.type === "number" ? "number" : "text"}
                  value={value}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, {
                      effectParams: {
                        ...selectedLayer.effectParams,
                        [param.key]: param.type === "number" ? Number.parseFloat(e.target.value) : e.target.value,
                      },
                    })
                  }
                  className="bg-gray-50 border-gray-200 text-gray-900 h-7 text-xs w-24"
                  placeholder="Value"
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (!selectedLayer) {
    return (
      <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-gray-700" />
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Element Settings</h3>
              <p className="text-sm text-gray-500">Configure particle effects</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Layers3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No layer selected</p>
            <p className="text-xs text-gray-400 mt-1">Select a layer to configure its settings</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Element Settings</h3>
            <p className="text-sm text-gray-500">{selectedLayer.name || "Unnamed Layer"}</p>
          </div>
        </div>
        
        {/* Active Modes */}
        {getActiveModes().length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {getActiveModes().map((mode) => (
              <span key={mode} className="bg-gray-900 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                {mode}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowParticleSelect(true)}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Particle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-900 font-medium truncate">{selectedLayer?.particle || "reddust"}</span>
            </div>
          </button>

          <button
            onClick={() => setShowTargeterSelect(true)}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Target className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Targeter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-900 font-medium truncate">{selectedLayer?.targeter || "Origin"}</span>
            </div>
          </button>
        </div>

        {/* Color Picker */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2.5">
            <Palette className="w-3.5 h-3.5 text-gray-600" />
            <Label className="text-xs font-medium text-gray-700">Layer Color</Label>
          </div>
          <ColorPicker
            value={selectedLayer.color}
            onChange={(color) => {
              console.log("Updating layer color:", selectedLayer.id, color)
              onUpdateLayer(selectedLayer.id, { color })
            }}
            className="w-full"
          />
        </div>

        {/* Selected Elements Color */}
        {selectedElementIds.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <Label className="text-xs font-medium text-blue-700">
                Selected Elements Color ({selectedElementIds.length} selected)
              </Label>
            </div>
            <ColorPicker
              value={selectedLayer?.elements?.find(el => selectedElementIds.includes(el.id))?.color || "#ff0000"}
              onChange={(color) => {
                console.log("Updating selected elements color:", color)
                updateSelectedElementsColor(color)
              }}
              className="w-full"
            />
            <div className="mt-2 text-xs text-blue-600">
              This will update the color of all selected elements
            </div>
          </div>
        )}

        {/* Effect Types */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-gray-600" />
            <Label className="text-xs font-medium text-gray-700">Effect Type</Label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {effectTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  if (selectedLayer) {
                    console.log("Setting effect type to:", type)
                    onUpdateLayer(selectedLayer.id, { effectType: type, effectParams: {} })
                  }
                }}
                className={`p-2 rounded-lg border transition-all ${selectedLayer?.effectType === type
                  ? "border-blue-200 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  {React.cloneElement(EFFECT_TYPE_ICONS[type] || <Zap className="w-3.5 h-3.5" />, {
                    className: `w-3.5 h-3.5 ${selectedLayer?.effectType === type ? "text-blue-600" : "text-gray-600"}`
                  })}
                  <span className={`text-[10px] font-medium leading-tight text-center ${
                    selectedLayer?.effectType === type ? "text-blue-900" : "text-gray-900"
                  }`}>
                    {type === "particles"
                      ? "Basic"
                      : type
                        .replace("particle", "")
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Layer Properties */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Layers3 className="w-3.5 h-3.5 text-gray-600" />
            <Label className="text-xs font-medium text-gray-700">Properties</Label>
          </div>
            <div className="space-y-3">
              {/* Repeat */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-700 font-medium">Repeat</span>
                  <span className="text-xs text-gray-900 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {selectedLayer.repeat}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={selectedLayer.repeat}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { repeat: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-700 font-medium">Amount</span>
                  <span className="text-xs text-gray-900 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {selectedLayer.alpha}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={selectedLayer.alpha}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { alpha: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                />
              </div>

              {/* Y Offset */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-700 font-medium">Y Offset</span>
                  <span className="text-xs text-gray-900 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {selectedLayer.yOffset}
                  </span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.1}
                  value={selectedLayer.yOffset}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { yOffset: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                />
              </div>

              {/* Repeat Interval */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-700 font-medium">Repeat Interval</span>
                  <span className="text-xs text-gray-900 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {selectedLayer.repeatInterval || 1}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={selectedLayer.repeatInterval || 1}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { repeatInterval: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                />
              </div>
            </div>
        </div>

        {/* Effect Parameters */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Settings2 className="w-3.5 h-3.5 text-gray-600" />
            <Label className="text-xs font-medium text-gray-700">Effect Parameters</Label>
          </div>
          {renderEffectTypeParams() || (
            <div className="text-center py-3 text-gray-500 text-xs">
              {selectedLayer.effectType === "particles"
                ? "No additional parameters"
                : "Select effect type for parameters"}
            </div>
          )}
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
