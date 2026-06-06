"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EffectType } from "@/app/page"
import type { Layer } from "@/types"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { TargeterSelectModal } from "@/components/targeter-select-modal"
import { ColorPicker } from "@/components/ui/color-picker"
import { Sparkles, Target, Palette, Settings2, Zap, Wind, CircleDot, Tornado, Layers3, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"

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
  
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [colorsExpanded, setColorsExpanded] = useState(true);
  const [effectExpanded, setEffectExpanded] = useState(true);
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);
  const [paramsExpanded, setParamsExpanded] = useState(true);

  const selectedLayer = currentLayer;
  const effectTypes: EffectType[] = ["particles", "particlelinehelix", "particleorbital", "particlering", "particleline", "particlelinering", "particlesphere", "particletornado"];

  if (!selectedLayer) {
    return (
      <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
        <div className="flex-shrink-0 px-2 lg:px-0 mt-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
              <Settings2 className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-foreground">Element Settings</h3>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Configure particles</p>
            </div>
          </div>
        </div>
        <div className="flex-1 border border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center p-6 text-center bg-muted/5">
          <Layers3 className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">No Layer Selected</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Select a layer to edit</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2 lg:px-0 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
            <Settings2 className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-foreground">Element Settings</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate max-w-[150px]">
              {selectedLayer.name || "Unnamed Layer"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        
        {/* SECTION: QUICK ACTIONS */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden mb-2">
          <button
            onClick={() => setActionsExpanded(!actionsExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Quick Actions</span>
            </div>
            {actionsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          
          <AnimatePresence>
            {actionsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden bg-muted/10 border-t border-border/50"
              >
                <div className="p-3 space-y-2.5">
                  <button onClick={() => setShowParticleSelect(true)} className="w-full p-2.5 bg-card hover:bg-muted border border-border/50 rounded-xl transition-all text-left flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase text-foreground">Particle</span>
                    </div>
                    <span className="text-[10px] text-foreground font-mono bg-muted px-2 py-1 rounded">
                      {selectedLayer?.particle || "reddust"}
                    </span>
                  </button>
                  <button onClick={() => setShowTargeterSelect(true)} className="w-full p-2.5 bg-card hover:bg-muted border border-border/50 rounded-xl transition-all text-left flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase text-foreground">Targeter</span>
                    </div>
                    <span className="text-[10px] text-foreground font-mono bg-muted px-2 py-1 rounded">
                      {selectedLayer?.targeter || "Origin"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION: COLORS */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden mb-2">
          <button
            onClick={() => setColorsExpanded(!colorsExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Colors</span>
            </div>
            {colorsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          
          <AnimatePresence>
            {colorsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden bg-muted/10 border-t border-border/50"
              >
                <div className="p-3 space-y-4">
                  <div>
                    <Label className="text-[10px] font-bold uppercase block text-foreground mb-1.5">Layer Color</Label>
                    <ColorPicker value={selectedLayer.color} onChange={(color) => onUpdateLayer(selectedLayer.id, { color })} className="w-full h-10 rounded-xl border border-border/50 bg-transparent" />
                  </div>
                  {selectedElementIds.length > 0 && (
                    <div>
                      <Label className="text-[10px] font-bold uppercase block text-foreground mb-1.5">Selected Elements ({selectedElementIds.length})</Label>
                      <ColorPicker value={selectedLayer?.elements?.find((el: any) => selectedElementIds.includes(el.id))?.color || "#ff0000"} onChange={updateSelectedElementsColor} className="w-full h-10 rounded-xl border border-border/50 bg-transparent" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION: EFFECT TYPE */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden mb-2">
          <button
            onClick={() => setEffectExpanded(!effectExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Effect Type</span>
            </div>
            {effectExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          
          <AnimatePresence>
            {effectExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden bg-muted/10 border-t border-border/50"
              >
                <div className="p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {effectTypes.map((type) => (
                      <button 
                        key={type} 
                        onClick={() => onUpdateLayer(selectedLayer.id, { effectType: type, effectParams: {} })} 
                        className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 h-16 ${
                          selectedLayer?.effectType === type 
                            ? "border-foreground bg-foreground text-background shadow-sm" 
                            : "border-border/50 bg-card hover:border-foreground/30 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {React.cloneElement(EFFECT_TYPE_ICONS[type] || <Zap className="w-3.5 h-3.5" />, { 
                          className: `w-4 h-4 flex-shrink-0 ${selectedLayer?.effectType === type ? "text-background" : "text-muted-foreground"}` 
                        })}
                        <span className={`text-[8px] font-bold uppercase tracking-widest text-center leading-tight ${selectedLayer?.effectType === type ? "text-background" : "text-muted-foreground"}`}>
                          {type === "particles" ? "Basic" : type.replace("particle", "").replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION: LAYER PROPERTIES */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden mb-2">
          <button
            onClick={() => setPropertiesExpanded(!propertiesExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Layer Properties</span>
            </div>
            {propertiesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          
          <AnimatePresence>
            {propertiesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden bg-muted/10 border-t border-border/50"
              >
                <div className="p-3 space-y-4">
                  {/* Repeat */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground">Repeat</span>
                      <Input
                        type="number"
                        value={selectedLayer.repeat}
                        onChange={(e) => onUpdateLayer(selectedLayer.id, { repeat: Number(e.target.value) || 0 })}
                        className="w-14 h-6 text-[10px] px-1 text-center bg-card border-border/50 font-mono text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                      />
                    </div>
                    <input type="range" min={1} max={10} step={1} value={selectedLayer.repeat} onChange={(e) => onUpdateLayer(selectedLayer.id, { repeat: Number(e.target.value) })} className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider" />
                  </div>

                  {/* Amount */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground">Amount</span>
                      <Input
                        type="number"
                        value={selectedLayer.alpha}
                        onChange={(e) => onUpdateLayer(selectedLayer.id, { alpha: Number(e.target.value) || 0 })}
                        className="w-14 h-6 text-[10px] px-1 text-center bg-card border-border/50 font-mono text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                      />
                    </div>
                    <input type="range" min={0} max={1} step={0.1} value={selectedLayer.alpha} onChange={(e) => onUpdateLayer(selectedLayer.id, { alpha: Number(e.target.value) })} className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider" />
                  </div>

                  {/* Y Offset */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground">Y Offset</span>
                      <Input
                        type="number"
                        value={selectedLayer.yOffset}
                        onChange={(e) => onUpdateLayer(selectedLayer.id, { yOffset: Number(e.target.value) || 0 })}
                        className="w-14 h-6 text-[10px] px-1 text-center bg-card border-border/50 font-mono text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                      />
                    </div>
                    <input type="range" min={-10} max={10} step={0.1} value={selectedLayer.yOffset} onChange={(e) => onUpdateLayer(selectedLayer.id, { yOffset: Number(e.target.value) })} className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider" />
                  </div>

                  {/* Repeat Interval */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground">Repeat Interval</span>
                      <Input
                        type="number"
                        value={selectedLayer.repeatInterval || 1}
                        onChange={(e) => onUpdateLayer(selectedLayer.id, { repeatInterval: Number(e.target.value) || 1 })}
                        className="w-14 h-6 text-[10px] px-1 text-center bg-card border-border/50 font-mono text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                      />
                    </div>
                    <input type="range" min={1} max={20} step={1} value={selectedLayer.repeatInterval || 1} onChange={(e) => onUpdateLayer(selectedLayer.id, { repeatInterval: Number(e.target.value) })} className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION: EFFECT PARAMETERS */}
        {effectTypeParamsMap[selectedLayer.effectType] && effectTypeParamsMap[selectedLayer.effectType].length > 0 && (
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden mb-2">
            <button
              onClick={() => setParamsExpanded(!paramsExpanded)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Effect Parameters</span>
              </div>
              {paramsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            
            <AnimatePresence>
              {paramsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden bg-muted/10 border-t border-border/50"
                >
                  <div className="p-3 space-y-2">
                    {effectTypeParamsMap[selectedLayer.effectType]?.map((param) => {
                      const value = selectedLayer.effectParams && param.key in selectedLayer.effectParams ? (selectedLayer.effectParams as any)[param.key] : "";
                      return (
                        <div key={param.key} className="flex items-center justify-between gap-3 p-2.5 bg-card border border-border/50 rounded-xl h-10">
                          <Label className="text-foreground text-[10px] font-bold uppercase tracking-wider flex-shrink-0">{param.label}</Label>
                          {param.type === "boolean" ? (
                            <Switch
                              checked={!!value}
                              onCheckedChange={(checked: boolean) => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: checked } })}
                              className="scale-[0.8] origin-right"
                            />
                          ) : (
                            <Input 
                              type={param.type === "number" ? "number" : "text"} 
                              value={value} 
                              onChange={(e) => onUpdateLayer(selectedLayer.id, { effectParams: { ...selectedLayer.effectParams, [param.key]: param.type === "number" ? Number.parseFloat(e.target.value) : e.target.value } })} 
                              className="bg-muted border-none text-foreground h-full text-[10px] px-2 font-mono w-16 focus-visible:ring-1 focus-visible:ring-foreground" 
                            />
                          )}
                        </div>
                      );
                    })}
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
        
        input[type="range"].slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--foreground));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
        input[type="range"].slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--foreground));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
      `}</style>
    </div>
  )
}