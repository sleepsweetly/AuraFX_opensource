"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RotateCw, ArrowUp, Link2, Sparkles, Palette, Settings2, ChevronDown, ChevronUp, Info, Zap, Target, Globe, Move3d, Video } from "lucide-react"
import { ReactNode } from "react"
import { Select } from "@/components/ui/select"
import { DirectionWidget, getDirectionLabel } from "@/components/ui/direction-widget"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ModeSetting {
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
}

interface Mode {
  id: string
  name: string
  desc: string
  icon: ReactNode
  settings?: ModeSetting[]
}

interface ModesPanelProps {
  modes: Record<string, boolean>
  onModesChange: (modes: Record<string, boolean>) => void
  modeSettings: Record<string, Record<string, number>>
  onModeSettingsChange: (settings: Record<string, Record<string, number>>) => void
  onImageColorModeChange?: (val: boolean) => void
  expandedModes?: string[]
  onExpandedModesChange?: (modeIds: string[]) => void
}

const MODES: Mode[] = [
  {
    id: "rotateMode",
    name: "Global Rotation",
    desc: "Rotate effects around world center",
    icon: <Globe className="w-4 h-4" />,
    settings: [
      { key: "speed", label: "Rotation Speed", min: 1, max: 10, step: 1, default: 1 },
      { key: "frames", label: "Animation Frames", min: 12, max: 120, step: 6, default: 60 },
    ],
  },
  {
    id: "localRotateMode",
    name: "Self Rotation",
    desc: "Elements spin around themselves",
    icon: <RotateCw className="w-4 h-4" />,
    settings: [
      { key: "speed", label: "Spin Speed", min: 0.1, max: 5, step: 0.1, default: 1 },
      { key: "radius", label: "Rotation Radius", min: 0.1, max: 2, step: 0.1, default: 0.5 },
    ],
  },
  {
    id: "moveMode",
    name: "Movement",
    desc: "Move effects in chosen direction",
    icon: <Move3d className="w-4 h-4" />,
    settings: [
      { key: "speed", label: "Movement Speed", min: 0.1, max: 10, step: 0.1, default: 0.5 },
      { key: "maxDistance", label: "Max Distance", min: 1, max: 20, step: 1, default: 10 },
      { key: "direction", label: "Direction", min: -1, max: 7, step: 1, default: -1 },
    ],
  },
  {
    id: "rainbowMode",
    name: "Dynamic Rainbow",
    desc: "Smooth color cycling animation",
    icon: <Palette className="w-4 h-4" />,
    settings: [
      { key: "period", label: "Color Cycle Time", min: 1, max: 20, step: 0.1, default: 3 },
    ],
  },
  {
    id: "staticRainbowMode",
    name: "Static Rainbow",
    desc: "Fixed rainbow colors by index",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "chainMode",
    name: "Chain Sequence",
    desc: "Manual element sequencing",
    icon: <Link2 className="w-4 h-4" />,
  },
  {
    id: "actionRecordingMode",
    name: "Action Recording",
    desc: "Record select tool actions with timing",
    icon: <Video className="w-4 h-4" />,
  },
]

export function ModesPanel({
  modes,
  onModesChange,
  modeSettings,
  onModeSettingsChange,
  onImageColorModeChange,
  expandedModes,
  onExpandedModesChange
}: ModesPanelProps) {
  const [localExpandedModes, setLocalExpandedModes] = useState<string[]>([]);
  const currentExpandedModes = expandedModes !== undefined ? expandedModes : localExpandedModes;
  const setCurrentExpandedModes = onExpandedModesChange || setLocalExpandedModes;

  const CONFLICTS: Record<string, string[]> = {
    rainbowMode: ["staticRainbowMode"],
    staticRainbowMode: ["rainbowMode"],
  }

  const handleSwitch = (id: string, checked: boolean) => {
    const nextModes = { ...modes, [id]: checked }

    if (checked && CONFLICTS[id]) {
      for (const conflictId of CONFLICTS[id]) {
        if (nextModes[conflictId]) nextModes[conflictId] = false
      }
    }

    onModesChange(nextModes)

    if (checked && MODES.find(mode => mode.id === id)?.settings) {
      if (!currentExpandedModes.includes(id)) {
        setCurrentExpandedModes([...currentExpandedModes, id]);
      }
    }

    if (id === "imageColorMode" && onImageColorModeChange) {
      onImageColorModeChange(checked)
    }
  }

  const handleSlider = (modeId: string, key: string, value: number) => {
    onModeSettingsChange({
      ...modeSettings,
      [modeId]: {
        ...modeSettings[modeId],
        [key]: value,
      },
    })
  }

  const handleModeClick = (modeId: string) => {
    const isExpanded = currentExpandedModes.includes(modeId);
    if (isExpanded) {
      setCurrentExpandedModes(currentExpandedModes.filter(id => id !== modeId));
    } else {
      setCurrentExpandedModes([...currentExpandedModes, modeId]);
    }
  }

  const activeCount = Object.values(modes).filter(Boolean).length;

  return (
    <motion.section 
      className="flex-1 h-full flex flex-col bg-[#000000] p-0 text-white overflow-y-auto"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Compact Header */}
      <motion.div 
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Zap className="w-4 h-4 text-white" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight text-white">Effects</h2>
          <p className="text-white/50 text-xs font-medium">
            {activeCount} active effect{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentExpandedModes.length > 0 && (
            <motion.button
              onClick={() => setCurrentExpandedModes([])}
              className="text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Collapse
            </motion.button>
          )}
          {currentExpandedModes.length < MODES.filter(m => m.settings).length && (
            <motion.button
              onClick={() => setCurrentExpandedModes(MODES.filter(m => m.settings).map(m => m.id))}
              className="text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Expand
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div 
        className="mx-4 mt-4 p-3 bg-white/5 border border-white/10 rounded-lg"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-white/60 leading-relaxed">
            <p className="font-medium mb-1 text-white/80">Speed Control Tips:</p>
            <p>• Increase <strong>Frames</strong> for smoother, slower animations</p>
            <p>• Combine modes for complex effects (e.g., Global + Self rotation)</p>
            <p>• Use <strong>Chain Mode</strong> for precise timing control</p>
          </div>
        </div>
      </motion.div>

      {/* Modes List */}
      <div className="px-4 pt-4 pb-6 space-y-3">
        {MODES.map((mode, index) => {
          const isExpanded = currentExpandedModes.includes(mode.id);
          const isActive = modes[mode.id];
          
          return (
            <motion.div
              key={mode.id}
              className={`group relative rounded-lg border transition-all duration-200 overflow-hidden
                ${isActive 
                  ? "border-white/40 bg-white/8 shadow-[0_0_12px_0_rgba(255,255,255,0.08)]" 
                  : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6"
                }`}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-white rounded-r-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out rounded-lg" />

              {/* Mode Header */}
              <div 
                className="relative z-10 flex items-center gap-3 p-3 cursor-pointer" 
                onClick={() => handleModeClick(mode.id)}
              >
                <div className={`p-2 rounded-md transition-colors ${isActive ? "bg-white/10" : "bg-white/5 group-hover:bg-white/8"}`}>
                  <div className={`${isActive ? "text-white" : "text-white/60"} group-hover:text-white transition-colors duration-200`}>
                    {mode.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium text-sm transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {mode.name}
                    </h3>
                    {isActive && (
                      <motion.span 
                        className="bg-white text-black text-xs rounded-full px-1.5 py-0.5 font-bold text-[10px]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                      >
                        ACTIVE
                      </motion.span>
                    )}
                  </div>
                  <p className={`text-xs transition-colors duration-200 ${
                    isActive ? 'text-white/70' : 'text-white/50 group-hover:text-white/70'
                  }`}>
                    {mode.desc}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!isActive}
                    onCheckedChange={checked => handleSwitch(mode.id, checked)}
                    className="data-[state=checked]:bg-white"
                  />
                  {mode.settings && (
                    <motion.div 
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                        isActive ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/8'
                      }`}
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3 h-3 text-white/60" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {isExpanded && mode.settings && isActive && (
                  <motion.div 
                    className="border-t border-white/10 bg-white/3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="p-3 space-y-3">
                      {mode.settings.map((setting, settingIndex) => (
                        <motion.div 
                          key={setting.key} 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: settingIndex * 0.05, duration: 0.2 }}
                        >
                          <div className="flex justify-between items-center">
                            <Label className="text-white/70 text-xs">{setting.label}</Label>
                            <span className="text-white text-xs font-mono bg-white/10 px-2 py-0.5 rounded">
                              {setting.key === "direction"
                                ? getDirectionLabel(modeSettings[mode.id]?.[setting.key] ?? setting.default)
                                : modeSettings[mode.id]?.[setting.key] ?? setting.default}
                            </span>
                          </div>
                          
                          {setting.key === "direction" && mode.id === "moveMode" ? (
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <DirectionWidget
                                value={modeSettings[mode.id]?.[setting.key] ?? setting.default}
                                onChange={val => handleSlider(mode.id, setting.key, val)}
                                elevation={modeSettings[mode.id]?.elevation ?? 0}
                                onElevationChange={val => handleSlider(mode.id, "elevation", val)}
                              />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Slider
                                value={[modeSettings[mode.id]?.[setting.key] ?? setting.default]}
                                onValueChange={([value]) => handleSlider(mode.id, setting.key, value)}
                                min={setting.min}
                                max={setting.max}
                                step={setting.step}
                                className="h-2"
                              />
                              <div className="flex justify-between text-xs text-white/40">
                                <span>{setting.min}</span>
                                <span>{setting.max}</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  )
}
