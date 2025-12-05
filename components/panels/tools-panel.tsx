// /components/panels/tools-panel.tsx

"use client"

import { MousePointer, Pencil, Circle, Square, Triangle, Minus, Eraser, Palette, ChevronDown, ChevronUp } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import { ElasticSlider } from "@/components/ui/elastic-slider"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface ToolsPanelProps {
  settings?: any
  onSettingsChange?: (settings: any) => void
  currentTool?: any
  onToolChange?: (tool: any) => void
  updateSelectedElementsColor?: (color: string) => void
  selectedElementIds?: string[]
  splitViewEnabled?: boolean
  onToggleSplitView?: () => void
}

const tools = [
  { id: "select", name: "Select Tool", icon: MousePointer },
  { id: "free", name: "Brush Tool", icon: Pencil },
  { id: "circle", name: "Circle Tool", icon: Circle },
  { id: "square", name: "Rectangle Tool", icon: Square },
  { id: "triangle", name: "Triangle Tool", icon: Triangle },
  { id: "line", name: "Line Tool", icon: Minus },
  { id: "eraser", name: "Eraser Tool", icon: Eraser }
]

export function ToolsPanel({
  settings,
  onSettingsChange,
  currentTool,
  onToolChange,
  updateSelectedElementsColor,
  selectedElementIds = [],
  splitViewEnabled = false,
  onToggleSplitView
}: ToolsPanelProps) {

  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(true); // Varsayılan olarak açık

  return (
    <div className="h-full w-full bg-white flex flex-col text-sm">

      {/* --- ARAÇLAR LİSTESİ --- */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</div>
        <div className="p-1">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              onClick={() => onToolChange?.(tool.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 relative ${currentTool === tool.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
              whileHover={{ x: 2 }}
            >
              {/* Aktif Araç İçin Sol Çubuk */}
              {currentTool === tool.id && (
                <motion.div
                  layoutId="activeToolBar"
                  className="absolute left-0 w-1 h-7 bg-blue-500 rounded-r"
                />
              )}
              <tool.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{tool.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* --- ÖZELLİKLER BÖLÜMÜ --- */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <button
          onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
        >
          <span>Properties</span>
          {isPropertiesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {isPropertiesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Renk Seçici */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Color</label>
                  <div className="mt-2">
                    <ColorPicker
                      value={settings?.color || "#000000"}
                      onChange={(color) => {
                        onSettingsChange?.({ ...settings, color })
                        if (selectedElementIds.length > 0 && updateSelectedElementsColor) {
                          updateSelectedElementsColor(color)
                        }
                      }}
                      className="w-full h-10 rounded-md border border-gray-300"
                    />
                  </div>
                  {selectedElementIds.length > 0 && (
                    <p className="mt-1 text-xs text-blue-600">Applying to {selectedElementIds.length} element(s).</p>
                  )}
                </div>

                {/* Araça Özel Kontroller */}

                {currentTool === 'eraser' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Eraser Size</label>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Size</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                        {settings?.eraserSize || 20}px
                      </span>
                    </div>
                    <ElasticSlider
                      defaultValue={settings?.eraserSize || 20}
                      startingValue={1}
                      maxValue={100}
                      stepSize={1}
                      isStepped={true}
                      size="lg"
                      onChange={(value) => onSettingsChange?.({ ...settings, eraserSize: value })}
                      leftIcon={<span className="text-xs">1</span>}
                      rightIcon={<span className="text-xs">100</span>}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- GENEL AYARLAR BÖLÜMÜ --- */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        <button
          onClick={() => setIsGlobalSettingsOpen(!isGlobalSettingsOpen)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
        >
          <span>Global Settings</span>
          {isGlobalSettingsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {isGlobalSettingsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Snap to Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Snap to Grid</span>
                    <button
                      onClick={() => onSettingsChange?.({ ...settings, snapToGridMode: !settings?.snapToGridMode })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings?.snapToGridMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.snapToGridMode ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                      />
                    </button>
                  </div>

                  {/* --- Grid Size Ayarı (Eklendi) --- */}
                  <AnimatePresence>
                    {settings?.snapToGridMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 border-l-2 border-blue-200 space-y-2"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Grid Size</label>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                            {settings?.gridSize || 20}px
                          </span>
                        </div>
                        <ElasticSlider
                          defaultValue={settings?.gridSize || 20}
                          startingValue={5}
                          maxValue={100}
                          stepSize={1}
                          isStepped={true}
                          size="lg"
                          onChange={(value) => onSettingsChange?.({ ...settings, gridSize: value })}
                          leftIcon={<span className="text-xs">5</span>}
                          rightIcon={<span className="text-xs">100</span>}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Split View */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Split View</span>
                    <button
                      onClick={onToggleSplitView}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${splitViewEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${splitViewEnabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Show side and top views simultaneously</p>
                </div>

                {/* Mirror Mode */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Mirror Mode</span>
                  <button
                    onClick={() => onSettingsChange?.({ ...settings, mirrorMode: !settings?.mirrorMode })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings?.mirrorMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.mirrorMode ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}