"use client"

import { Settings } from "lucide-react"

export function PropertiesPanel() {
  return (
    <div className="h-full bg-[#000000] overflow-y-auto">
      {/* Compact Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <Settings className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white">Properties</h3>
          <p className="text-white/50 text-xs font-medium">Element settings & animation</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Settings className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/60 font-medium">Properties panel disabled</p>
          <p className="text-white/40 text-sm mt-1">Animation features removed</p>
        </div>
      </div>
    </div>
  )
}
