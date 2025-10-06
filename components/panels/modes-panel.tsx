"use client"
import { Slider } from "@/components/ui/slider"
import { RotateCw, Link2, Sparkles, Palette, Globe, Move3d, Video, Zap, Settings } from "lucide-react"
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
  const [activeMode, setActiveMode] = useState<string | null>(null)

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
      setActiveMode(id)
    } else if (!checked && activeMode === id) {
      setActiveMode(null)
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

  const activeCount = Object.values(modes || {}).filter(Boolean).length;
  const activeModes = MODES.filter(mode => modes?.[mode.id])

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Animation Effects</h3>
            <p className="text-sm text-gray-500">
              {activeCount} active effect{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Toggles - Grid Layout */}
      <div className="flex-shrink-0 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Effects</h4>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((mode) => {
            const isActive = modes?.[mode.id]
            return (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggle(mode.id, !isActive)}
                className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                  isActive
                    ? "border-blue-200 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <mode.icon className={`w-4 h-4 ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`} />
                <span className={`text-xs font-medium text-center leading-tight ${
                  isActive ? "text-blue-900" : "text-gray-900"
                }`}>
                  {mode.name}
                </span>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Active Mode Settings - Only show if there are modes with settings */}
      {activeModes.some(mode => mode.settings) && (
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-gray-700" />
              <h4 className="text-sm font-medium text-gray-900">Settings</h4>
            </div>

            {/* Mode Selector - Only show modes with settings */}
            {activeModes.filter(mode => mode.settings).length > 1 && (
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  {activeModes.filter(mode => mode.settings).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                        activeMode === mode.id
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Settings for Active Mode */}
            {(() => {
              const modesWithSettings = activeModes.filter(mode => mode.settings)
              const currentMode = modesWithSettings.find(m => m.id === activeMode) || modesWithSettings[0]
              if (!currentMode?.settings) return null

              return (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {currentMode.settings.map((setting, index) => (
                    <motion.div 
                      key={setting.key} 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 + (index * 0.05) }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{setting.label}</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                          {setting.key === "direction"
                            ? getDirectionLabel(modeSettings?.[currentMode.id]?.[setting.key] ?? setting.default)
                            : modeSettings?.[currentMode.id]?.[setting.key] ?? setting.default}
                        </span>
                      </div>

                      {setting.key === "direction" && currentMode.id === "moveMode" ? (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <DirectionWidget
                            value={modeSettings?.[currentMode.id]?.[setting.key] ?? setting.default}
                            onChange={val => handleSettingChange(currentMode.id, setting.key, val)}
                            elevation={modeSettings?.[currentMode.id]?.elevation ?? 0}
                            onElevationChange={val => handleSettingChange(currentMode.id, "elevation", val)}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Slider
                            value={[modeSettings?.[currentMode.id]?.[setting.key] ?? setting.default]}
                            onValueChange={([value]) => handleSettingChange(currentMode.id, setting.key, value)}
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
                    </motion.div>
                  ))}
                </motion.div>
              )
            })()}
          </div>
        </motion.div>
      )}
    </div>
  )
}