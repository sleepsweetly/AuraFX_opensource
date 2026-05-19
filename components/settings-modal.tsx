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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm"></div>
            <span className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Settings</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 p-1.5 h-auto rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Settings</h2>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-zinc-800 mb-4">
            {[
              { id: "general", label: "General" },
              { id: "performance", label: "Performance" },
              { id: "interface", label: "Interface" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 font-medium"
                    : "text-gray-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
                  <Label className="text-zinc-700 dark:text-zinc-300">Auto Save Interval</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.autoSaveInterval]}
                      onValueChange={([value]) => onSettingsChange({ ...settings, autoSaveInterval: value })}
                      max={300}
                      min={10}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300 text-sm w-16">{settings.autoSaveInterval} sec</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">Theme</Label>
                  <Select value={currentTheme} onValueChange={onThemeChange}>
                    <SelectTrigger className="bg-transparent dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800">
                      <SelectItem value="dark" className="text-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900">
                        Dark
                      </SelectItem>
                      <SelectItem value="light" className="text-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900">
                        Light
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === "performance" && (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">Performance Settings - coming soon</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">Render Quality</Label>
                  <Select
                    value={settings.renderQuality}
                    onValueChange={(value) => onSettingsChange({ ...settings, renderQuality: value })}
                  >
                    <SelectTrigger className="bg-transparent dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800">
                      <SelectItem value="Low" className="text-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900">
                        Low
                      </SelectItem>
                      <SelectItem value="Normal" className="text-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900">
                        Normal
                      </SelectItem>
                      <SelectItem value="High" className="text-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900">
                        High
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">Cache Size</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.cacheSize]}
                      onValueChange={([value]) => onSettingsChange({ ...settings, cacheSize: value })}
                      max={2048}
                      min={128}
                      step={128}
                      className="flex-1"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300 text-sm w-16">{settings.cacheSize} MB</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "interface" && (
              <>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-600 dark:text-blue-400 text-sm">Interface Settings - coming soon</p>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-zinc-700 dark:text-zinc-300">UI Animations</Label>
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
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
          <Button variant="outline" onClick={onClose} className="border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
            Cancel
          </Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4">
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
