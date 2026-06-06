// /components/panels/modes-panel.tsx

"use client"
import { RotateCw, Link2, Sparkles, Palette, Globe, Move3d, Video, Zap, ChevronDown, ChevronUp } from "lucide-react"
import { DirectionWidget, getDirectionLabel } from "@/components/ui/direction-widget"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState } from "react"
import { Switch } from "@/components/ui/switch"

interface ModesPanelProps {
  modes: any
  onModesChange: (modes: any) => void
  modeSettings: any
  onModeSettingsChange: (settings: any) => void
  onImageColorModeChange?: (val: boolean) => void
  expandedModes?: Record<string, boolean>
  onExpandedModesChange?: (modes: Record<string, boolean>) => void
}

const MODES = [
  {
    id: "rotateMode",
    name: "Global Rotation",
    icon: Globe,
    settings: [
      { key: "speed", label: "Speed", min: 1, max: 10, step: 1, default: 1 },
      { key: "frames", label: "Frames", min: 12, max: 120, step: 6, default: 60 },
    ],
  },
  {
    id: "localRotateMode",
    name: "Self Rotation",
    icon: RotateCw,
    settings: [
      { key: "speed", label: "Speed", min: 0.1, max: 5, step: 0.1, default: 1 },
      { key: "radius", label: "Radius", min: 0.1, max: 2, step: 0.1, default: 0.5 },
    ],
  },
  {
    id: "moveMode",
    name: "Movement",
    icon: Move3d,
    settings: [
      { key: "speed", label: "Speed", min: 0.1, max: 10, step: 0.1, default: 0.5 },
      { key: "maxDistance", label: "Distance", min: 1, max: 20, step: 1, default: 10 },
      { key: "direction", label: "Direction", min: -1, max: 7, step: 1, default: -1 },
    ],
  },
  {
    id: "rainbowMode",
    name: "Dynamic Rainbow",
    icon: Palette,
    settings: [
      { key: "period", label: "Period", min: 1, max: 20, step: 0.1, default: 3 },
    ],
  },
  {
    id: "staticRainbowMode",
    name: "Static Rainbow",
    icon: Sparkles,
  },
  {
    id: "chainMode",
    name: "Chain Sequence",
    icon: Link2,
  },
  {
    id: "actionRecordingMode",
    name: "Action Recording",
    icon: Video,
  },
]

export function ModesPanel({
  modes,
  onModesChange,
  modeSettings,
  onModeSettingsChange,
  onImageColorModeChange,
}: ModesPanelProps) {

  const [expandedModes, setExpandedModes] = useState<string[]>([]);

  const CONFLICTS: Record<string, string[]> = {
    rainbowMode: ["staticRainbowMode"],
    staticRainbowMode: ["rainbowMode"],
  }

  const handleToggle = (id: string, checked: boolean) => {
    const nextModes = { ...modes, [id]: checked }
    if (checked && CONFLICTS[id]) {
      for (const conflictId of CONFLICTS[id]) {
        if (nextModes[conflictId]) nextModes[conflictId] = false
      }
    }
    onModesChange(nextModes)

    // Mode aktif edildiğinde otomatik olarak expand et
    const mode = MODES.find(m => m.id === id);
    if (checked && mode?.settings) {
      setExpandedModes(prev => prev.includes(id) ? prev : [...prev, id]);
    }
    // Mode deaktif edildiğinde collapse et
    if (!checked) {
      setExpandedModes(prev => prev.filter(modeId => modeId !== id));
    }

    if (id === "imageColorMode" && onImageColorModeChange) {
      onImageColorModeChange(checked)
    }
  }

  const handleSettingChange = (modeId: string, key: string, value: number) => {
    onModeSettingsChange({
      ...modeSettings,
      [modeId]: {
        ...modeSettings[modeId],
        [key]: value,
      },
    })
  }

  const toggleExpanded = (modeId: string) => {
    setExpandedModes(prev =>
      prev.includes(modeId)
        ? prev.filter(id => id !== modeId)
        : [...prev, modeId]
    );
  }

  const activeCount = Object.values(modes || {}).filter(Boolean).length

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2 lg:px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-foreground">Animation Modes</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {activeCount} active effect{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* --- MODES LİSTESİ --- */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {MODES.map((mode) => {
          const isActive = modes?.[mode.id];
          const isExpanded = expandedModes.includes(mode.id);
          const hasSettings = mode.settings && mode.settings.length > 0;

          return (
            <div key={mode.id} className="mb-2">
              <motion.div
                layout
                className={`w-full p-2.5 rounded-xl flex flex-col gap-3 transition-all group border ${
                   isActive 
                     ? 'bg-foreground/5 border-foreground/30 hover:border-foreground/50 shadow-sm' 
                     : 'bg-card border-border/50 hover:border-foreground/30 shadow-sm'
                }`}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer" 
                  onClick={() => hasSettings ? toggleExpanded(mode.id) : handleToggle(mode.id, !isActive)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                    <mode.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold truncate text-foreground">{mode.name}</span>
                      {hasSettings && (
                        <div className="text-muted-foreground mr-1">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>
                    {hasSettings && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">Configure settings</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Switch */}
                  <div className="ml-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={!!isActive}
                      onCheckedChange={(checked: boolean) => handleToggle(mode.id, checked)}
                      className="scale-75 origin-right"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {hasSettings && isExpanded && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 px-1 pb-1">
                        <div className="p-3 bg-muted/30 border border-border/50 rounded-xl space-y-4">
                          {mode.settings.map((setting) => (
                            <div key={setting.key}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] uppercase font-bold text-foreground">{setting.label}</span>
                                <span className="text-[9px] font-mono text-muted-foreground">
                                  {setting.key === "direction"
                                    ? getDirectionLabel(modeSettings?.[mode.id]?.[setting.key] ?? setting.default)
                                    : modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                                </span>
                              </div>

                              {setting.key === "direction" && mode.id === "moveMode" ? (
                                <div className="bg-card rounded-lg p-2 border border-border/50 shadow-sm mt-2">
                                  <DirectionWidget
                                    value={modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                                    onChange={val => handleSettingChange(mode.id, setting.key, val)}
                                    elevation={modeSettings?.[mode.id]?.elevation ?? 0}
                                    onElevationChange={val => handleSettingChange(mode.id, "elevation", val)}
                                  />
                                </div>
                              ) : (
                                <input
                                  type="range"
                                  min={setting.min}
                                  max={setting.max}
                                  step={setting.step}
                                  value={modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                                  onChange={(e) => handleSettingChange(mode.id, setting.key, Number(e.target.value))}
                                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )
        })}
      </div>

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