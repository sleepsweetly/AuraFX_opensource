"use client"

import { Button } from "@/components/ui/button"
import {
  Play,
  Pause,
  Square,
  MousePointer,
  Move,
  RotateCw,
  Maximize,
  Trash2,
  Upload,
  Camera,
  CameraOff,
} from "lucide-react"

export function Toolbar() {
  return (
    <div className="h-full flex items-center justify-between px-8">
      {/* Brand */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center">
          <span className="font-bold text-sm">A</span>
        </div>
        <span className="text-white font-medium text-lg">AuraFX</span>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-8 p-0 rounded-full text-white/30 cursor-not-allowed"
          title="Animation disabled"
        >
          <Play className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-8 p-0 rounded-full text-white/30 cursor-not-allowed"
          title="Animation disabled"
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>

      {/* Selection Tools */}
      <div className="flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2">
        {[
          { tool: "select", icon: MousePointer, label: "Select (1)", key: "1" },
          { tool: "move", icon: Move, label: "Move (2)", key: "2" },
          { tool: "rotate", icon: RotateCw, label: "Rotate (3)", key: "3" },
          { tool: "scale", icon: Maximize, label: "Scale (4)", key: "4" },
        ].map(({ tool, icon: Icon, label, key }) => (
          <Button
            key={tool}
            variant="ghost"
            size="sm"
            disabled
            className="h-8 w-8 p-0 rounded-full text-white/30 cursor-not-allowed"
            title={`${label} - Animation disabled`}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Camera Control */}
      <div className="flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-8 p-0 rounded-full text-white/30 cursor-not-allowed"
          title="Camera controls disabled"
        >
          <CameraOff className="w-4 h-4" />
        </Button>
        <span className="text-white/60 text-sm">
          Camera OFF (Animation disabled)
        </span>
      </div>

      {/* Quick Add Info */}
      <div className="flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2">
        <span className="text-white/60 text-sm">Animation features removed</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-8 p-0 rounded-full text-white/30 cursor-not-allowed"
          title="Delete disabled"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-10 px-6 rounded-full bg-white/20 text-white/60 cursor-not-allowed transition-all font-medium"
          title="Export disabled"
        >
          <Upload className="w-4 h-4 mr-2" />
          Export (Disabled)
        </Button>
      </div>
    </div>
  )
}
