"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { X, RotateCw, ArrowUp, Link2, Sparkles, Zap, Settings2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react"

interface ModeSetting {
  label: string
  min?: number
  max?: number
  step?: number
  default: number
  type?: "select"
  options?: string[]
}

interface Mode {
  id: string
  name: string
  description: string
  icon: ReactNode
  hasSettings: boolean
  settings?: Record<string, ModeSetting>
}

interface ModeCategory {
  name: string
  icon: ReactNode
  modes: Mode[]
}

interface ModeCategories {
  [key: string]: ModeCategory
}

interface ModeSettings {
  rotateMode: {
    speed: number
    direction: string
    frames: number
  }
  localRotateMode: {
    speed: number
    radius: number
  }
  riseMode: {
    speed: number
    maxHeight: number
  }
  proximityMode: {
    radius: number
    intensity: number
  }
}

interface ModesConfigModalProps {
  modes: Record<string, boolean>
  onModesChange: (modes: Record<string, boolean>) => void
  onClose: () => void
}

export function ModesConfigModal({ modes, onModesChange, onClose }: ModesConfigModalProps) {
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const [modeSettings, setModeSettings] = useState<ModeSettings>({
    rotateMode: {
      speed: 5,
      direction: "clockwise",
      frames: 36,
    },
    localRotateMode: {
      speed: 3,
      radius: 10,
    },
    riseMode: {
      speed: 0.5,
      maxHeight: 10,
    },
    proximityMode: {
      radius: 5,
      intensity: 1,
    },
  })

  const modeCategories: ModeCategories = {
    movement: {
      name: "Movement",
      icon: <ArrowUp className="w-4 h-4" />,
      modes: [
        {
          id: "rotateMode",
          name: "Rotate",
          description: "Rotate particles around a central point",
          icon: <RotateCw className="w-4 h-4" />,
          hasSettings: true,
          settings: {
            speed: {
              label: "Rotation Speed",
              min: 1,
              max: 20,
              step: 1,
              default: 5,
            },
            direction: {
              label: "Direction",
              type: "select",
              options: ["clockwise", "counter-clockwise"],
              default: 0,
            },
            frames: {
              label: "Frames",
              min: 1,
              max: 72,
              step: 1,
              default: 36,
            },
          },
        },
        {
          id: "localRotateMode",
          name: "Local Rotate Mode",
          description: "Rotate effects around their individual positions.",
          icon: <RotateCw className="w-4 h-4" />,
          hasSettings: true,
          settings: {
            speed: { label: "Rotation Speed", min: 1, max: 10, step: 1, default: 3 },
            radius: { label: "Rotation Radius", min: 1, max: 20, step: 1, default: 10 }
          }
        },
        {
          id: "riseMode",
          name: "Rise Mode",
          description: "Make effects slowly rise upwards over time.",
          icon: <ArrowUp className="w-4 h-4" />,
          hasSettings: true,
          settings: {
            speed: { label: "Rise Speed", min: 0.1, max: 2, step: 0.1, default: 0.5 },
            maxHeight: { label: "Max Height", min: 1, max: 20, step: 1, default: 10 }
          }
        }
      ]
    },
    effects: {
      name: "Effects",
      icon: <Sparkles className="w-4 h-4" />,
      modes: [
        {
          id: "proximityMode",
          name: "Chain Mode",
          description: "Sort effects based on their distance to create chain-like patterns.",
          icon: <Link2 className="w-4 h-4" />,
          hasSettings: true,
          settings: {
            radius: { label: "Chain Radius", min: 1, max: 20, step: 1, default: 5 },
            intensity: { label: "Chain Intensity", min: 0.1, max: 5, step: 0.1, default: 1 }
          }
        },
        {
          id: "rainbowMode",
          name: "Rainbow Mode",
          description: "Dynamically cycle through rainbow colors for each particle.",
          icon: <Sparkles className="w-4 h-4" />,
          hasSettings: false
        },
        {
          id: "performanceMode",
          name: "Performance Mode",
          description: "Optimize effect rendering for better performance.",
          icon: <Zap className="w-4 h-4" />,
          hasSettings: false
        }
      ]
    }
  }

  const handleModeSettingsChange = (modeId: keyof ModeSettings, key: string, value: any) => {
    setModeSettings({
      ...modeSettings,
      [modeId]: {
        ...modeSettings[modeId],
        [key]: value,
      },
    })
  }

  const handleModeToggle = (modeId: string) => {
    const newModes = { ...modes }
    newModes[modeId] = !newModes[modeId]
    onModesChange(newModes)
  }

  const renderModeSettings = (mode: Mode) => {
    if (!mode.hasSettings || !mode.settings) return null

    return (
      <div className="space-y-4 p-4 bg-zinc-9000/50 rounded-lg border border-zinc-800 mt-3">
        {Object.entries(mode.settings).map(([key, setting]) => (
          <div key={key} className="space-y-2">
            <Label className="text-zinc-300 text-sm">{setting.label}</Label>
            {setting.type === "select" ? (
              <div className="flex space-x-2">
                {setting.options?.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleModeSettingsChange(mode.id as keyof ModeSettings, key, option)}
                    className={`flex-1 ${
                      modeSettings[mode.id as keyof ModeSettings]?.[key as keyof ModeSettings[keyof ModeSettings]] === option
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-zinc-90 hover:bg-zinc-700"
                    } text-white text-sm h-8`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Slider
                  value={[modeSettings[mode.id as keyof ModeSettings]?.[key as keyof ModeSettings[keyof ModeSettings]] ?? setting.default]}
                  onValueChange={([value]) => handleModeSettingsChange(mode.id as keyof ModeSettings, key, value)}
                  max={setting.max ?? 100}
                  min={setting.min ?? 0}
                  step={setting.step ?? 1}
                  className="flex-1"
                />
                <span className="text-white text-sm w-12 text-right">
                  {modeSettings[mode.id as keyof ModeSettings]?.[key as keyof ModeSettings[keyof ModeSettings]] ?? setting.default}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-9000 rounded-lg shadow-xl w-[800px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <Settings2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Effect Modes</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-90">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="movement" className="h-full">
            <div className="flex h-full">
              <div className="w-64 border-r border-zinc-800 p-4">
                <TabsList className="flex flex-col h-auto bg-transparent space-y-2">
                  {Object.entries(modeCategories).map(([id, category]) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className="w-full justify-start px-3 py-2 data-[state=active]:bg-zinc-90"
                    >
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {category.modes.filter(mode => modes[mode.id]).length}
                        </Badge>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <ScrollArea 
                className="flex-1 p-4 scroll-contain"
                onWheel={(e) => e.stopPropagation()}
              >
                {Object.entries(modeCategories).map(([id, category]) => (
                  <TabsContent key={id} value={id} className="mt-0">
                    <div className="space-y-4">
                      {category.modes.map((mode) => (
                        <div
                          key={mode.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            modes[mode.id]
                              ? "bg-blue-500/10 border-blue-500/20"
                              : "bg-zinc-90/50 border-zinc-700/50 hover:bg-zinc-90/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                modes[mode.id] ? "bg-blue-500/20" : "bg-zinc-700/50"
                              }`}>
                                {mode.icon}
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{mode.name}</h3>
                                <p className="text-sm text-zinc-400">{mode.description}</p>
                              </div>
                            </div>
                            <Checkbox
                              checked={modes[mode.id]}
                              onCheckedChange={() => handleModeToggle(mode.id)}
                              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                          </div>
                          {modes[mode.id] && renderModeSettings(mode)}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
