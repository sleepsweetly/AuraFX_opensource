// /components/panels/element-settings-panel.tsx

"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EffectType } from "@/app/page"
import type { Layer } from "@/types"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { TargeterSelectModal } from "@/components/targeter-select-modal"
import { ColorPicker } from "@/components/ui/color-picker"
import { ElasticSlider } from "@/components/ui/elastic-slider"
import { Sparkles, Target, Palette, Settings2, Zap, Wind, CircleDot, Tornado, Layers3, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  particlering: <Layers3 className="w-4 h-4" />,
  particleline: <Zap className="w-4 h-4" />,
  particlelinering: <Layers3 className="w-4 h-4" />,
  particlesphere: <Layers3 className="w-4 h-4" />,
  particletornado: <Tornado className="w-4 h-4" />,
};

const effectTypeParamsMap: Record<string, { key: string; label: string; type: string }[]> = {
  particles: [],
  particlelinehelix: [{ key: "distanceBetween", label: "Distance Between", type: "number" }, { key: "startYOffset", label: "Start Y Offset", type: "number" }, { key: "targetYOffset", label: "Target Y Offset", type: "number" }, { key: "fromOrigin", label: "From Origin", type: "boolean" }, { key: "helixLength", label: "Helix Length", type: "number" }, { key: "helixRadius", label: "Helix Radius", type: "number" }, { key: "helixRotation", label: "Helix Rotation", type: "number" }, { key: "maxDistance", label: "Max Distance", type: "number" }],
  particleorbital: [{ key: "radius", label: "Radius", type: "number" }, { key: "points", label: "Points", type: "number" }, { key: "ticks", label: "Ticks", type: "number" }, { key: "interval", label: "Interval", type: "number" }, { key: "rotationX", label: "Rotation X", type: "number" }, { key: "rotationY", label: "Rotation Y", type: "number" }, { key: "rotationZ", label: "Rotation Z", type: "number" }, { key: "angularVelocityX", label: "Angular Velocity X", type: "number" }, { key: "angularVelocityY", label: "Angular Velocity Y", type: "number" }, { key: "angularVelocityZ", label: "Angular Velocity Z", type: "number" }, { key: "rotate", label: "Rotate", type: "boolean" }, { key: "reversed", label: "Reversed", type: "boolean" }],
  particlering: [{ key: "ringPoints", label: "Ring Points", type: "number" }, { key: "ringRadius", label: "Ring Radius", type: "number" }],
  particleline: [{ key: "distanceBetween", label: "Distance Between", type: "number" }, { key: "startYOffset", label: "Start Y Offset", type: "number" }, { key: "targetYOffset", label: "Target Y Offset", type: "number" }, { key: "fromOrigin", label: "From Origin", type: "boolean" }, { key: "zigzag", label: "Zigzag", type: "boolean" }, { key: "zigzags", label: "Zigzags", type: "number" }, { key: "zigzagOffset", label: "Zigzag Offset", type: "number" }, { key: "maxDistance", label: "Max Distance", type: "number" }],
  particlelinering: [{ key: "distanceBetween", label: "Distance Between", type: "number" }, { key: "startYOffset", label: "Start Y Offset", type: "number" }, { key: "targetYOffset", label: "Target Y Offset", type: "number" }, { key: "fromOrigin", label: "From Origin", type: "boolean" }, { key: "ringpoints", label: "Ring Points", type: "number" }, { key: "ringradius", label: "Ring Radius", type: "number" }, { key: "maxDistance", label: "Max Distance", type: "number" }],
  particlesphere: [{ key: "sphereRadius", label: "Sphere Radius", type: "number" }],
  particletornado: [{ key: "maxRadius", label: "Max Radius", type: "number" }, { key: "tornadoHeight", label: "Tornado Height", type: "number" }, { key: "tornadoInterval", label: "Tornado Interval", type: "number" }, { key: "tornadoDuration", label: "Tornado Duration", type: "number" }, { key: "rotationSpeed", label: "Rotation Speed", type: "number" }, { key: "sliceHeight", label: "Slice Height", type: "number" }, { key: "stopOnCasterDeath", label: "Stop On Caster Death", type: "boolean" }, { key: "stopOnEntityDeath", label: "Stop On Entity Death", type: "boolean" }, { key: "cloudParticle", label: "Cloud Particle", type: "string" }, { key: "cloudSize", label: "Cloud Size", type: "number" }, { key: "cloudAmount", label: "Cloud Amount", type: "number" }, { key: "cloudHSpread", label: "Cloud H Spread", type: "number" }, { key: "cloudVSpread", label: "Cloud V Spread", type: "number" }, { key: "cloudPSpeed", label: "Cloud P Speed", type: "number" }, { key: "cloudYOffset", label: "Cloud Y Offset", type: "number" }],
}

export function ElementSettingsPanel({
  layers = [],
  currentLayer,
  onUpdateLayer = () => { },
  modes = {},
  onShowCode = () => { },
  updateSelectedElementsParticle = () => { },
  updateSelectedElementsColor = () => { },
  selectedElementIds = [],
}: ElementSettingsPanelProps) {
  const [showParticleSelect, setShowParticleSelect] = useState(false)
  const [showTargeterSelect, setShowTargeterSelect] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['colors', 'properties']);

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections(prev => prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]);
  };

  const selectedLayer = currentLayer;
  const effectTypes: EffectType[] = ["particles", "particlelinehelix", "particleorbital", "particlering", "particleline", "particlelinering", "particlesphere", "particletornado"];

  if (!selectedLayer) {
    return (
      <div className="h-full w-full bg-white flex flex-col text-sm">
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-lg"><Settings2 className="w-5 h-5 text-violet-600" /></div>
            <div><h3 className="font-semibold text-gray-900 text-lg">Element Settings</h3><p className="text-sm text-gray-500">Configure particle effects</p></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-center">
          <div><Layers3 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">No layer selected</p><p className="text-xs text-gray-400 mt-1">Select a layer to configure its settings</p></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-white flex flex-col text-sm">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-lg"><Settings2 className="w-5 h-5 text-violet-600" /></div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Element Settings</h3>
            <p className="text-sm text-gray-500">{selectedLayer.name || "Unnamed Layer"}</p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto p-1 scrollbar-hidden panel-container">
        {/* Quick Actions */}
        <div className="mb-1">
          <motion.div layout className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 relative ${expandedSections.includes('actions') ? "bg-violet-50 text-violet-700" : "text-gray-700 hover:bg-gray-100"}`} whileHover={{ x: 2 }}>
            {expandedSections.includes('actions') && <motion.div layoutId="activeSettingsBar" className="absolute left-0 w-1 h-8 bg-violet-500 rounded-r" />}
            <Zap className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium flex-1">Quick Actions</span>
            <button onClick={() => toggleExpanded('actions')} className="p-1 rounded hover:bg-black/10 transition-colors">{expandedSections.includes('actions') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
          </motion.div>
          <AnimatePresence>
            {expandedSections.includes('actions') && (
              <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                <div className="px-3 pb-3 pl-7">
                  <div className="bg-gray-50 rounded-md p-4 space-y-3 border border-gray-100">
                    <button onClick={() => setShowParticleSelect(true)} className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-left">
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gray-600" /><span className="text-sm font-medium text-gray-700">Particle</span></div><span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">{selectedLayer?.particle || "reddust"}</span></div>
                    </button>
                    <button onClick={() => setShowTargeterSelect(true)} className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-left">
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Target className="w-4 h-4 text-gray-600" /><span className="text-sm font-medium text-gray-700">Targeter</span></div><span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">{selectedLayer?.targeter || "Origin"}</span></div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Colors */}
        <div className="mb-1">
          <motion.div layout className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 relative ${expandedSections.includes('colors') ? "bg-violet-50 text-violet-700" : "text-gray-700 hover:bg-gray-100"}`} whileHover={{ x: 2 }}>
            {expandedSections.includes('colors') && <motion.div layoutId="activeSettingsBar" className="absolute left-0 w-1 h-8 bg-violet-500 rounded-r" />}
            <Palette className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium flex-1">Colors</span>
            <button onClick={() => toggleExpanded('colors')} className="p-1 rounded hover:bg-black/10 transition-colors">{expandedSections.includes('colors') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
          </motion.div>
          <AnimatePresence>
            {expandedSections.includes('colors') && (
              <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                <div className="px-3 pb-3 pl-7">
                  <div className="bg-gray-50 rounded-md p-4 space-y-4 border border-gray-100">
                    <div><Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Layer Color</Label><ColorPicker value={selectedLayer.color} onChange={(color) => onUpdateLayer(selectedLayer.id, { color })} className="w-full mt-2" /></div>
                    {selectedElementIds.length > 0 && <div><Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Selected Elements ({selectedElementIds.length})</Label><ColorPicker value={selectedLayer?.elements?.find((el: any) => selectedElementIds.includes(el.id))?.color || "#ff0000"} onChange={updateSelectedElementsColor} className="w-full mt-2" /></div>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Effect Type */}
        <div className="mb-1">
          <motion.div layout className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 relative ${expandedSections.includes('effect') ? "bg-violet-50 text-violet-700" : "text-gray-700 hover:bg-gray-100"}`} whileHover={{ x: 2 }}>
            {expandedSections.includes('effect') && <motion.div layoutId="activeSettingsBar" className="absolute left-0 w-1 h-8 bg-violet-500 rounded-r" />}
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium flex-1">Effect Type</span>
            <button onClick={() => toggleExpanded('effect')} className="p-1 rounded hover:bg-black/10 transition-colors">{expandedSections.includes('effect') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
          </motion.div>
          <AnimatePresence>
            {expandedSections.includes('effect') && (
              <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                <div className="px-3 pb-3 pl-7">
                  <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                    <div className="grid grid-cols-4 gap-2">
                      {effectTypes.map((type) => (
                        <button key={type} onClick={() => onUpdateLayer(selectedLayer.id, { effectType: type, effectParams: {} })} className={`p-2 rounded-lg border transition-all ${selectedLayer?.effectType === type ? "border-violet-200 bg-violet-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"}`}>
                          <div className="flex flex-col items-center gap-1.5">
                            {React.cloneElement(EFFECT_TYPE_ICONS[type] || <Zap className="w-3.5 h-3.5" />, { className: `w-3.5 h-3.5 ${selectedLayer?.effectType === type ? "text-violet-600" : "text-gray-600"}` })}
                            <span className={`text-[10px] font-medium leading-tight text-center ${selectedLayer?.effectType === type ? "text-violet-900" : "text-gray-900"}`}>{type === "particles" ? "Basic" : type.replace("particle", "").replace(/([A-Z])/g, " $1").trim()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer Properties */}
        <div className="mb-1">
          <motion.div layout className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 relative ${expandedSections.includes('properties') ? "bg-violet-50 text-violet-700" : "text-gray-700 hover:bg-gray-100"}`} whileHover={{ x: 2 }}>
            {expandedSections.includes('properties') && <motion.div layoutId="activeSettingsBar" className="absolute left-0 w-1 h-8 bg-violet-500 rounded-r" />}
            <Layers3 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium flex-1">Layer Properties</span>
            <button onClick={() => toggleExpanded('properties')} className="p-1 rounded hover:bg-black/10 transition-colors">{expandedSections.includes('properties') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
          </motion.div>
          <AnimatePresence>
            {expandedSections.includes('properties') && (
              <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                <div className="px-3 pb-3 pl-7">
                  <div className="bg-gray-50 rounded-md p-4 space-y-4 border border-gray-100">
                    {/* Repeat */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Repeat</span>
                        <Input
                          type="number"
                          value={selectedLayer.repeat}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            onUpdateLayer(selectedLayer.id, { repeat: value });
                          }}
                          className="w-16 h-6 text-xs text-center bg-white border-gray-200 font-mono text-gray-900"
                        />
                      </div>
                      <ElasticSlider
                        defaultValue={selectedLayer.repeat}
                        onChange={(v) => onUpdateLayer(selectedLayer.id, { repeat: v })}
                        startingValue={1}
                        maxValue={10}
                        stepSize={1}
                        isStepped={true}
                        size="md"
                        leftIcon={<span className="text-xs">1</span>}
                        rightIcon={<span className="text-xs">10</span>}
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</span>
                        <Input
                          type="number"
                          value={selectedLayer.alpha}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            onUpdateLayer(selectedLayer.id, { alpha: value });
                          }}
                          className="w-16 h-6 text-xs text-center bg-white border-gray-200 font-mono text-gray-900"
                        />
                      </div>
                      <ElasticSlider
                        defaultValue={selectedLayer.alpha}
                        onChange={(v) => onUpdateLayer(selectedLayer.id, { alpha: v })}
                        startingValue={0}
                        maxValue={1}
                        stepSize={0.1}
                        isStepped={true}
                        size="md"
                        leftIcon={<span className="text-xs">0</span>}
                        rightIcon={<span className="text-xs">1</span>}
                      />
                    </div>

                    {/* Y Offset */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Y Offset</span>
                        <Input
                          type="number"
                          value={selectedLayer.yOffset}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            onUpdateLayer(selectedLayer.id, { yOffset: value });
                          }}
                          className="w-16 h-6 text-xs text-center bg-white border-gray-200 font-mono text-gray-900"
                        />
                      </div>
                      <ElasticSlider
                        defaultValue={selectedLayer.yOffset}
                        onChange={(v) => onUpdateLayer(selectedLayer.id, { yOffset: v })}
                        startingValue={-10}
                        maxValue={10}
                        stepSize={0.1}
                        isStepped={true}
                        size="md"
                        leftIcon={<span className="text-xs">-10</span>}
                        rightIcon={<span className="text-xs">10</span>}
                      />
                    </div>

                    {/* Repeat Interval */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Repeat Interval</span>
                        <Input
                          type="number"
                          value={selectedLayer.repeatInterval || 1}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 1;
                            onUpdateLayer(selectedLayer.id, { repeatInterval: value });
                          }}
                          className="w-16 h-6 text-xs text-center bg-white border-gray-200 font-mono text-gray-900"
                        />
                      </div>
                      <ElasticSlider
                        defaultValue={selectedLayer.repeatInterval || 1}
                        onChange={(v) => onUpdateLayer(selectedLayer.id, { repeatInterval: v })}
                        startingValue={1}
                        maxValue={20}
                        stepSize={1}
                        isStepped={true}
                        size="md"
                        leftIcon={<span className="text-xs">1</span>}
                        rightIcon={<span className="text-xs">20</span>}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Effect Parameters */}
        {effectTypeParamsMap[selectedLayer.effectType] && effectTypeParamsMap[selectedLayer.effectType].length > 0 && (
          <div className="mb-1">
            <motion.div layout className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 relative ${expandedSections.includes('params') ? "bg-violet-50 text-violet-700" : "text-gray-700 hover:bg-gray-100"}`} whileHover={{ x: 2 }}>
              {expandedSections.includes('params') && <motion.div layoutId="activeSettingsBar" className="absolute left-0 w-1 h-8 bg-violet-500 rounded-r" />}
              <Settings2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium flex-1">Effect Parameters</span>
              <button onClick={() => toggleExpanded('params')} className="p-1 rounded hover:bg-black/10 transition-colors">{expandedSections.includes('params') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
            </motion.div>
            <AnimatePresence>
              {expandedSections.includes('params') && (
                <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                  <div className="px-3 pb-3 pl-7">
                    <div className="bg-gray-50 rounded-md p-4 space-y-3 border border-gray-100">
                      {effectTypeParamsMap[selectedLayer.effectType]?.map((param) => {
                        const value = selectedLayer.effectParams && param.key in selectedLayer.effectParams ? (selectedLayer.effectParams as any)[param.key] : "";
                        return (
                          <div key={param.key} className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-md border border-gray-200">
                            <Label className="text-gray-700 text-xs font-medium flex-shrink-0">{param.label}</Label>
                            {param.type === "boolean" ? (
                              <div className="flex gap-1.5">
                                <button onClick={() => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: true } })} className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${value ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>True</button>
                                <button onClick={() => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: false } })} className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${!value ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>False</button>
                              </div>
                            ) : (
                              <Input type={param.type === "number" ? "number" : "text"} value={value} onChange={(e) => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: param.type === "number" ? Number.parseFloat(e.target.value) : e.target.value } })} className="bg-gray-50 border-gray-200 text-gray-900 h-7 text-xs w-24" placeholder="Value" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      {showParticleSelect && (
        <ParticleSelectModal
          currentParticle={selectedLayer?.particle || "reddust"}
          onSelectParticle={(particle) => { onUpdateLayer(selectedLayer.id, { particle }); setShowParticleSelect(false); }}
          onClose={() => setShowParticleSelect(false)}
        />
      )}
      {showTargeterSelect && (
        <TargeterSelectModal
          currentTargeter={selectedLayer?.targeter || "Origin"}
          onSelectTargeter={(targeter) => { onUpdateLayer(selectedLayer.id, { targeter }); setShowTargeterSelect(false); }}
          onClose={() => setShowTargeterSelect(false)}
        />
      )}

      <style jsx>{`
        .scrollbar-hidden {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  )
}