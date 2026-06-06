// /components/panels/tools-panel.tsx

"use client"

import { MousePointer, Pencil, Circle, Square, Triangle, Minus, Eraser, Settings, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ToolsPanelProps {
  settings?: any
  onSettingsChange?: (settings: any) => void
  currentTool?: any
  onToolChange?: (tool: any) => void
  updateSelectedElementsColor?: (color: string) => void
  selectedElementIds?: string[]
}

const tools = [
  { id: "select", name: "Select Tool", icon: MousePointer, desc: "Select & Move" },
  { id: "free", name: "Brush Tool", icon: Pencil, desc: "Freehand drawing" },
  { id: "circle", name: "Circle Tool", icon: Circle, desc: "Draw circles" },
  { id: "square", name: "Rectangle Tool", icon: Square, desc: "Draw rectangles" },
  { id: "triangle", name: "Triangle Tool", icon: Triangle, desc: "Draw triangles" },
  { id: "line", name: "Line Tool", icon: Minus, desc: "Draw lines" },
  { id: "eraser", name: "Eraser Tool", icon: Eraser, desc: "Erase elements" }
]

export function ToolsPanel({
  settings,
  onSettingsChange,
  currentTool,
  onToolChange,
  updateSelectedElementsColor,
  selectedElementIds = []
}: ToolsPanelProps) {

  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(true);

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2 lg:px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
            <MousePointer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-foreground">Tools</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Select & Draw
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        
        {/* --- TOOLS LIST --- */}
        <div className="space-y-2">
          {tools.map((tool) => {
            const isActive = currentTool === tool.id;
            return (
              <div
                key={tool.id}
                onClick={() => onToolChange?.(tool.id)}
                className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all group border cursor-pointer ${
                   isActive 
                     ? 'bg-foreground/5 border-foreground/30 shadow-sm' 
                     : 'bg-card border-border/50 hover:border-foreground/30 shadow-sm'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                  <tool.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[11px] font-bold truncate block text-foreground`}>{tool.name}</span>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate mt-0.5">{tool.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* --- PROPERTIES --- */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden mt-2">
          <button
            onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Properties</span>
            </div>
            {isPropertiesOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          
          <AnimatePresence>
            {isPropertiesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden bg-muted/10 border-t border-border/50"
              >
                <div className="p-3 space-y-4">
                  {/* Color Picker */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground mb-1.5 block">Color</label>
                    <ColorPicker
                      value={settings?.color || "#000000"}
                      onChange={(color) => {
                        onSettingsChange?.({ ...settings, color })
                        if (selectedElementIds.length > 0 && updateSelectedElementsColor) {
                          updateSelectedElementsColor(color)
                        }
                      }}
                      className="w-full h-10 rounded-xl border border-border/50 bg-transparent"
                    />
                    {selectedElementIds.length > 0 && (
                      <p className="mt-1.5 text-[9px] text-muted-foreground uppercase">Applying to {selectedElementIds.length} element(s).</p>
                    )}
                  </div>

                  {/* Tool-specific Controls */}
                  {currentTool === 'eraser' && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-foreground">Eraser Size</span>
                        <span className="text-[9px] font-mono text-muted-foreground">{settings?.eraserSize || 20}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={settings?.eraserSize || 20}
                        onChange={(e) => onSettingsChange?.({ ...settings, eraserSize: Number(e.target.value) })}
                        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- GLOBAL SETTINGS --- */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden mt-2">
          <button
            onClick={() => setIsGlobalSettingsOpen(!isGlobalSettingsOpen)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Global Settings</span>
            </div>
            {isGlobalSettingsOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          
          <AnimatePresence>
            {isGlobalSettingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden bg-muted/10 border-t border-border/50"
              >
                <div className="p-3 space-y-4">
                  {/* Snap to Grid */}
                  <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/50 rounded-xl">
                    <div className="min-w-0">
                      <Label className="text-[10px] font-bold uppercase block truncate text-foreground">Snap to Grid</Label>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate">Align elements to grid</p>
                    </div>
                    <Switch
                      checked={!!settings?.snapToGridMode}
                      onCheckedChange={(checked: boolean) => onSettingsChange?.({ ...settings, snapToGridMode: checked })}
                      className="scale-75 origin-right"
                    />
                  </div>

                  {/* Grid Size Slider */}
                  <AnimatePresence>
                    {settings?.snapToGridMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-center mb-1.5 mt-2">
                          <span className="text-[10px] uppercase font-bold text-foreground">Grid Size</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{settings?.gridSize || 20}px</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={1}
                          value={settings?.gridSize || 20}
                          onChange={(e) => onSettingsChange?.({ ...settings, gridSize: Number(e.target.value) })}
                          className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mirror Mode */}
                  <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/50 rounded-xl">
                    <div className="min-w-0">
                      <Label className="text-[10px] font-bold uppercase block truncate text-foreground">Mirror Mode</Label>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate">Duplicate symmetrically</p>
                    </div>
                    <Switch
                      checked={!!settings?.mirrorMode}
                      onCheckedChange={(checked: boolean) => onSettingsChange?.({ ...settings, mirrorMode: checked })}
                      className="scale-75 origin-right"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
        
        input[type="range"].slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--foreground));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
        input[type="range"].slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--foreground));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
      `}</style>
    </div>
  )
}