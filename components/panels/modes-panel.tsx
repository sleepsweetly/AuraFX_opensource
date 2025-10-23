// /components/panels/modes-panel.tsx

"use client"
import { RotateCw, Link2, Sparkles, Palette, Globe, Move3d, Video, Zap, ChevronDown, ChevronUp } from "lucide-react"
import { ElasticSlider } from "@/components/ui/elastic-slider"
import { DirectionWidget, getDirectionLabel } from "@/components/ui/direction-widget"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState } from "react"

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

  const activeCount = Object.values(modes || {}).filter(Boolean).length;

  return (
    <div className="h-full w-full bg-white flex flex-col text-sm">

      {/* --- HEADER (ToolsPanel ile tutarlı) --- */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Animation Effects</h3>
            <p className="text-sm text-gray-500">
              {activeCount} active effect{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* --- MODS LİSTESİ (ToolsPanel ile tutarlı) --- */}
      <div className="flex-1 overflow-y-auto p-1 scrollbar-hidden">
        {MODES.map((mode) => {
          const isActive = modes?.[mode.id];
          const isExpanded = expandedModes.includes(mode.id);
          const hasSettings = mode.settings && mode.settings.length > 0;

          return (
            <div key={mode.id} className="mb-1">
              <motion.div
                layout
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 relative ${isActive
                  ? "bg-yellow-50 text-yellow-700"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
                whileHover={{ x: 2 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeModeBar"
                    className="absolute left-0 w-1 h-7 bg-yellow-500 rounded-r"
                  />
                )}
                <mode.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium flex-1">{mode.name}</span>

                {hasSettings && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(mode.id);
                    }}
                    className="p-1 rounded hover:bg-black/10 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={() => handleToggle(mode.id, !isActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                >
                  <motion.span
                    layout
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </motion.div>

              <AnimatePresence>
                {hasSettings && isExpanded && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pl-7">
                      <div className="bg-gray-50 rounded-md p-3 space-y-3 border border-gray-100">
                        {mode.settings.map((setting) => (
                          <div key={setting.key} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{setting.label}</span>
                              <span className="text-xs bg-white text-gray-700 px-2 py-1 rounded font-mono border border-gray-200">
                                {setting.key === "direction"
                                  ? getDirectionLabel(modeSettings?.[mode.id]?.[setting.key] ?? setting.default)
                                  : modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                              </span>
                            </div>

                            {setting.key === "direction" && mode.id === "moveMode" ? (
                              <div className="bg-white rounded-lg p-2 border border-gray-200">
                                <DirectionWidget
                                  value={modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                                  onChange={val => handleSettingChange(mode.id, setting.key, val)}
                                  elevation={modeSettings?.[mode.id]?.elevation ?? 0}
                                  onElevationChange={val => handleSettingChange(mode.id, "elevation", val)}
                                />
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <ElasticSlider
                                  defaultValue={modeSettings?.[mode.id]?.[setting.key] ?? setting.default}
                                  onChange={(value) => handleSettingChange(mode.id, setting.key, value)}
                                  startingValue={setting.min}
                                  maxValue={setting.max}
                                  stepSize={setting.step}
                                  isStepped={true}
                                  size="lg"
                                  leftIcon={<span className="text-xs">{setting.min}</span>}
                                  rightIcon={<span className="text-xs">{setting.max}</span>}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}