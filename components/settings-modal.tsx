"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface SettingsModalProps {
  settings: any
  onSettingsChange: (settings: any) => void
  onClose: () => void
  currentTheme: string
  onThemeChange: (theme: string) => void
}

export function SettingsModal({
  settings,
  onSettingsChange,
  onClose,
  currentTheme,
  onThemeChange,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-sm w-[500px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-[#3a3a3a]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            <span className="text-white text-sm">Settings</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-[#3a3a3a] p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h2 className="text-lg font-bold text-white mb-6">Settings</h2>

          {/* Tabs */}
          <div className="flex border-b border-[#3a3a3a] mb-4">
            {[
              { id: "general", label: "General" },
              { id: "performance", label: "Performance" },
              { id: "interface", label: "Interface" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm ${
                  activeTab === tab.id ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "general" && (
              <>
                <div className="space-y-2">
                  <Label className="text-white">Auto Save Interval</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.autoSaveInterval]}
                      onValueChange={([value]) => onSettingsChange({ ...settings, autoSaveInterval: value })}
                      max={300}
                      min={10}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-white text-sm w-16">{settings.autoSaveInterval} sec</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <Select value={currentTheme} onValueChange={onThemeChange}>
                    <SelectTrigger className="bg-[#2a2a2a] border-[#3a3a3a] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                      <SelectItem value="dark" className="text-white">
                        Dark
                      </SelectItem>
                      <SelectItem value="light" className="text-white">
                        Light
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === "performance" && (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4">
                  <p className="text-yellow-400 text-sm">Performance Settings - coming soon</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Render Quality</Label>
                  <Select
                    value={settings.renderQuality}
                    onValueChange={(value) => onSettingsChange({ ...settings, renderQuality: value })}
                  >
                    <SelectTrigger className="bg-[#2a2a2a] border-[#3a3a3a] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                      <SelectItem value="Low" className="text-white">
                        Low
                      </SelectItem>
                      <SelectItem value="Normal" className="text-white">
                        Normal
                      </SelectItem>
                      <SelectItem value="High" className="text-white">
                        High
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Cache Size</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.cacheSize]}
                      onValueChange={([value]) => onSettingsChange({ ...settings, cacheSize: value })}
                      max={2048}
                      min={128}
                      step={128}
                      className="flex-1"
                    />
                    <span className="text-white text-sm w-16">{settings.cacheSize} MB</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "interface" && (
              <>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
                  <p className="text-blue-400 text-sm">Interface Settings - coming soon</p>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-white">UI Animations</Label>
                  <Switch
                    checked={settings.uiAnimations}
                    onCheckedChange={(checked) => onSettingsChange({ ...settings, uiAnimations: checked })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-[#3a3a3a]">
          <Button onClick={onClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">
            Cancel
          </Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
