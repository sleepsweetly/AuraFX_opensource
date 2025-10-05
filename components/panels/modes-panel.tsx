"use client"
import { Slider } from "@/components/ui/slider"
import { RotateCw, Link2, Sparkles, Palette, ChevronDown, Globe, Move3d, Video, Zap } from "lucide-react"
import { DirectionWidget, getDirectionLabel } from "@/components/ui/direction-widget"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState } from "react"

interface ModesPanelProps {
  modes: any
  onModesChange: (modes: any) => void
  modeSettings: any
  onModeSettingsChange: (settings: any) => void
  onImageColorModeChange?: (val: boolean) => void
  expandedModes?: string[]
  onExpandedModesChange?: (modeIds: string[]) => void
}

const MODES = [
  {
    id: "rotateMode",
    name: "Global Rotation",
    desc: "Rotate effects around world center",
    icon: Globe,
    settings: [
      { key: "speed", label: "Rotation Speed", min: 1, max: 10, step: 1, default: 1 },
      { key: "frames", label: "Animation Frames", min: 12, max: 120, step: 6, default: 60 },
    ],
  },
  {
    id: "localRotateMode",
    name: "Self Rotation",
    desc: "Elements spin around themselves",
    icon: RotateCw,
    settings: [
      { key: "speed", label: "Spin Speed", min: 0.1, max: 5, step: 0.1, default: 1 },
      { key: "radius", label: "Rotation Radius", min: 0.1, max: 2, step: 0.1, default: 0.5 },
    ],
  },
  {
    id: "moveMode",
    name: "Movement",
    desc: "Move effects in chosen direction",
    icon: Move3d,
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
    icon: Palette,
    settings: [
      { key: "period", label: "Color Cycle Time", min: 1, max: 20, step: 0.1, default: 3 },
    ],
  },
  {
    id: "staticRainbowMode",
    name: "Static Rainbow",
    desc: "Fixed rainbow colors by index",
    icon: Sparkles,
  },
  {
    id: "chainMode",
    name: "Chain Sequence",
    desc: "Manual element sequencing",
    icon: Link2,
  },
  {
    id: "actionRecordingMode",
    name: "Action Recording",
    desc: "Record select tool actions with timing",
    icon: Video,
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

  const handleToggle = (id: string, checked: boolean) => {
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
    const isExpanded = currentExpandedModes.includes(modeId);
    if (isExpanded) {
      setCurrentExpandedModes(currentExpandedModes.filter(id => id !== modeId));
    } else {
      setCurrentExpandedModes([...currentExpandedModes, modeId]);
    }
  }

  const activeCount = Object.values(modes || {}).filter(Boolean).length;

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Animation Effects</h3>
            <p className="text-xs text-gray-500">
              {activeCount} active effect{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentExpandedModes([])}
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors bg-white border border-gray-200"
          >
            Collapse All
          </button>
          <button
            onClick={() => setCurrentExpandedModes(MODES.filter(m => m.settings).map(m => m.id))}
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors bg-white border border-gray-200"
          >
            Expand All
          </button>
        </div>
      </div>

      {/* Modes List */}
      <div className="flex-1 space-y-3">
        {MODES.map((mode) => {
          const isExpanded = currentExpandedModes.includes(mode.id);
          const isActive = modes?.[mode.id];

          return (
            <div
              key={mode.id}
              className={`rounded-xl border transition-all duration-200 shadow-sm ${isActive
                ? "border-gray-300 bg-gray-50"
                : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
              {/* Mode Header */}
              <div className="flex items-center gap-3 p-3">
                <div className={`p-2 rounded-lg transition-colors duration-200 ${isActive ? "bg-gradient-to-br from-gray-800 to-gray-600 text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>
                  <mode.icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-900">{mode.name}</h4>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          className="bg-green-100 text-green-700 text-xs rounded-full px-2 py-0.5 font-medium"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          ON
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-gray-500">{mode.desc}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(mode.id, !isActive)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${isActive ? 'bg-gradient-to-r from-gray-800 to-gray-600' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${isActive ? 'translate-x-5' : 'translate-x-1'
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {mode.settings && isActive && (
                      <motion.button
                        onClick={() => toggleExpanded(mode.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                          }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Settings */}
              <AnimatePresence>
                {isExpanded && mode.settings && isActive && (
                  <motion.div
                    className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 space-y-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                  >
                    {mode.settings.map((setting) => (
                      <div key={setting.key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{setting.label}</span>
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {setting.key === "direction"
                              ? getDirectionLabel(modeSettings?.[mode.id]?.[setting.key] ?? setting.default)
                              : modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                          </span>
                        </div>

                        {setting.key === "direction" && mode.id === "moveMode" ? (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <DirectionWidget
                              value={modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                              onChange={val => handleSettingChange(mode.id, setting.key, val)}
                              elevation={modeSettings?.[mode.id]?.elevation ?? 0}
                              onElevationChange={val => handleSettingChange(mode.id, "elevation", val)}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Slider
                              value={[modeSettings?.[mode.id]?.[setting.key] ?? setting.default]}
                              onValueChange={([value]) => handleSettingChange(mode.id, setting.key, value)}
                              min={setting.min}
                              max={setting.max}
                              step={setting.step}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>{setting.min}</span>
                              <span>{setting.max}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}