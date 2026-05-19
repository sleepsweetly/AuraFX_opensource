"use client"

import { motion } from "framer-motion"
import { X, Hash, Palette, Grid3X3, Zap, Sparkles } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"

interface QuickSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    particleCount: number
    color?: string
    showGrid?: boolean
    performanceMode?: boolean
    particle?: string
  }
  setSettings: (settings: any) => void
  canvasBackgroundColor: string
  setCanvasBackgroundColor: (color: string) => void
  showGridCoordinates: boolean
  setShowGridCoordinates: (show: boolean) => void
  onSelectParticleClick: () => void
}

export function QuickSettingsModal({
  isOpen,
  onClose,
  settings,
  setSettings,
  canvasBackgroundColor,
  setCanvasBackgroundColor,
  showGridCoordinates,
  setShowGridCoordinates,
  onSelectParticleClick,
}: QuickSettingsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-gray-200/50 dark:border-zinc-800/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80">
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Quick Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-7 max-h-[75vh] overflow-y-auto scrollbar-hidden">
          
          {/* Particle Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Particle Count</span>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full">
                {settings.particleCount}
              </span>
            </div>
            <Slider
              value={[settings.particleCount]}
              onValueChange={([value]) => {
                setSettings({ ...settings, particleCount: value })
              }}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Color</span>
            </div>
            <ColorPicker
              value={settings.color || "#000000"}
              onChange={(color) => {
                setSettings({ ...settings, color })
              }}
              className="w-full"
            />
          </div>

          {/* Canvas Background Color */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Canvas Background</span>
            </div>
            <ColorPicker
              value={canvasBackgroundColor}
              onChange={(color) => {
                setCanvasBackgroundColor(color)
              }}
              className="w-full"
            />
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800/80" />

          {/* Grid Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Grid Settings</span>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-zinc-400">Show Grid</span>
                <button
                  onClick={() => {
                    setSettings({ ...settings, showGrid: !settings.showGrid })
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                    settings.showGrid !== false ? 'bg-slate-800 dark:bg-zinc-200' : 'bg-gray-200 dark:bg-zinc-800'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-zinc-900 transition-transform duration-200 ${
                      settings.showGrid !== false ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-zinc-400">Grid Coordinates</span>
                <button
                  onClick={() => setShowGridCoordinates(!showGridCoordinates)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                    showGridCoordinates ? 'bg-slate-800 dark:bg-zinc-200' : 'bg-gray-200 dark:bg-zinc-800'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-zinc-900 transition-transform duration-200 ${
                      showGridCoordinates ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800/80" />

          {/* Performance Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Performance Mode</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, performanceMode: !settings.performanceMode })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                settings.performanceMode ? 'bg-slate-800 dark:bg-zinc-200' : 'bg-gray-200 dark:bg-zinc-800'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-zinc-900 transition-transform duration-200 ${
                  settings.performanceMode ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Particle Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Particle Type</span>
            </div>
            <button
              onClick={onSelectParticleClick}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-full transition-colors"
            >
              {settings.particle || "reddust"}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
