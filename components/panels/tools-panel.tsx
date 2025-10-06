"use client"

import { MousePointer, Pencil, Circle, Square, Triangle, Minus, Eraser, Palette, Settings } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"

interface ToolsPanelProps {
  settings?: any
  onSettingsChange?: (settings: any) => void
  currentTool?: any
  onToolChange?: (tool: any) => void
  updateSelectedElementsColor?: (color: string) => void
  selectedElementIds?: string[]
}

const tools = [
  { id: "select", name: "Select", icon: MousePointer },
  { id: "free", name: "Brush", icon: Pencil },
  { id: "circle", name: "Circle", icon: Circle },
  { id: "square", name: "Square", icon: Square },
  { id: "triangle", name: "Triangle", icon: Triangle },
  { id: "line", name: "Line", icon: Minus },
  { id: "eraser", name: "Eraser", icon: Eraser }
]

export function ToolsPanel({ 
  settings, 
  onSettingsChange, 
  currentTool, 
  onToolChange,
  updateSelectedElementsColor,
  selectedElementIds = []
}: ToolsPanelProps) {
  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <MousePointer className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Drawing Tools</h3>
            <p className="text-sm text-gray-500">Create and edit elements</p>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="flex-shrink-0 mb-8">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Tools</h4>
        <div className="grid grid-cols-3 gap-3">
          {/* First 6 tools in normal grid */}
          {tools.slice(0, 6).map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange?.(tool.id)}
              className={`group relative p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                currentTool === tool.id
                  ? "border-blue-200 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <tool.icon className={`w-4 h-4 ${
                currentTool === tool.id ? "text-blue-600" : "text-gray-600"
              }`} />
              <span className={`text-xs font-medium ${
                currentTool === tool.id ? "text-blue-900" : "text-gray-900"
              }`}>
                {tool.name}
              </span>
              {currentTool === tool.id && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" />
              )}
            </button>
          ))}
          
          {/* Eraser - Full width (3 columns) */}
          <button
            onClick={() => onToolChange?.("eraser")}
            className={`group relative p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 col-span-3 ${
              currentTool === "eraser"
                ? "border-red-200 bg-red-50 shadow-sm"
                : "border-red-200 bg-white hover:border-red-300 hover:bg-red-50"
            }`}
          >
            <Eraser className={`w-4 h-4 ${
              currentTool === "eraser" ? "text-red-600" : "text-red-500"
            }`} />
            <span className={`text-xs font-medium ${
              currentTool === "eraser" ? "text-red-900" : "text-red-700"
            }`}>
              Eraser
            </span>
            {currentTool === "eraser" && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
            )}
          </button>
        </div>
      </div>

      {/* Color Section */}
      <div className="flex-shrink-0 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-gray-700" />
            <h4 className="text-sm font-medium text-gray-900">Color</h4>
          </div>
          <ColorPicker
            value={settings?.color || "#000000"}
            onChange={(color) => {
              // Önce settings'i güncelle
              onSettingsChange?.({ ...settings, color })
              
              // Eğer seçili elementler varsa onları da güncelle
              if (selectedElementIds.length > 0 && updateSelectedElementsColor) {
                updateSelectedElementsColor(color)
              }
            }}
            className="w-full"
          />
          
          {/* Seçili elementler için bilgi */}
          {selectedElementIds.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Palette className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">
                  {selectedElementIds.length} element selected
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Color changes will apply to selected elements
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex-1">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-gray-700" />
            <h4 className="text-sm font-medium text-gray-900">Tool Settings</h4>
          </div>

          <div className="space-y-6">
            {/* Snap to Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Snap to Grid</div>
                  <div className="text-xs text-gray-500 mt-1">Align elements to grid</div>
                </div>
                <button
                  onClick={() => onSettingsChange?.({ ...settings, snapToGridMode: !settings?.snapToGridMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.snapToGridMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      settings?.snapToGridMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Grid Size */}
              {settings?.snapToGridMode && (
                <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Grid Size</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                      {settings?.gridSize || 20}px
                    </span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={settings?.gridSize || 20}
                      onChange={(e) => onSettingsChange?.({ ...settings, gridSize: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>5px</span>
                      <span>100px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mirror Mode */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Mirror Mode</div>
                <div className="text-xs text-gray-500 mt-1">Symmetric drawing</div>
              </div>
              <button
                onClick={() => onSettingsChange?.({ ...settings, mirrorMode: !settings?.mirrorMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.mirrorMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    settings?.mirrorMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}