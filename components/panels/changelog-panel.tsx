"use client"

import React, { useState } from "react"
import { Calendar, Sparkles, ChevronDown, ChevronUp, History } from "lucide-react"

interface ChangelogEntry {
  version: string
  date: string
  title: string
  changes: string[]
}

interface ChangelogPanelProps {}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "3.0.1",
    date: "December 18, 2025",
    title: "3D Editor Redesign & Easter Egg Surprise",
    changes: [
      "3D Editor completely redesigned with modern interface",
      "Fixed multiple UI component z-index conflicts",
      "Added super secret easter egg game (try to find it!)",
      "Easter egg game now properly hides UI components when active",
      "Fixed Header component not appearing on main page",
      "Improved component rendering performance",
      "Better component layering and visibility management"
    ]
  },
  {
    version: "3.0.0",
    date: "December 15, 2025",
    title: "Complete UI Redesign - Built from Scratch",
    changes: [
      "Complete UI redesign with modern monochrome theme",
      "All panels redesigned with consistent styling",
      "New compact header with floating design",
      "Left toolbar with quick generate code button",
      "Right sidebar with organized tabs",
      "New footer with social links",
      "All modals redesigned",
      "Smooth layout transitions throughout"
    ]
  },
  {
    version: "2.1.8",
    date: "September 26, 2025",
    title: "Action Recording Particle Optimization Fix",
    changes: [
      "Fixed 'Optimize circle frames' switch in Action Recording panel",
      "When disabled, circles now generate individual particle lines",
      "Action Recording settings are now properly passed to code generation",
      "Changelog modal completely redesigned"
    ]
  },
  {
    version: "2.1.7",
    date: "September 22, 2025",
    title: "Idle Optimization and Circle Compression",
    changes: [
      "Added optional idle repeat optimization",
      "Added optional circle→particlering compression",
      "Particle count in Quick Settings now sets global default",
      "Added debug comments in generated code",
      "Added new setting switches to Action Recording panel"
    ]
  },
  {
    version: "2.1.6",
    date: "September 16, 2025",
    title: "Open Source and Header Cleanup",
    changes: [
      "AuraFX is now open source",
      "Moved Grid and Performance settings to Quick Settings",
      "Added GitHub button",
      "Fixed Grid toggle issue"
    ]
  },
  {
    version: "2.1.5",
    date: "January 27, 2025",
    title: "Enhanced Select Tool and Discord Integration",
    changes: [
      "Combined scale and rotate with Shift + rotate",
      "Fixed Discord links",
      "Added effect sharing to Discord",
      "Improved canvas panning"
    ]
  },
  {
    version: "2.1.4",
    date: "December 15, 2024",
    title: "Middle-Click Pan and Text Selection",
    changes: [
      "Added middle mouse button canvas panning",
      "Disabled site-wide text selection",
      "Preserved selection in inputs and editors"
    ]
  },
  {
    version: "2.1.3",
    date: "October 15, 2024",
    title: "Triangle Tool and Layer Dragging",
    changes: [
      "Added new Triangle shape",
      "Shape sizes preserved when changing count",
      "Added handle for layer dragging",
      "Added drop indicator line"
    ]
  },
  {
    version: "2.1.2",
    date: "November 20, 2024",
    title: "Quick Settings UX Improvements",
    changes: [
      "Quick Settings slider no longer clears selection",
      "Slider values update live",
      "Selection preserved after count changes",
      "Set minimum shape counts",
      "Added color and particle count to Action Recording"
    ]
  },
  {
    version: "2.1.1",
    date: "September 10, 2024",
    title: "Action Recording Fixes",
    changes: [
      "Fixed auto-recording issue",
      "Resolved canvas elements vs recorded actions conflict",
      "Idle actions now record at 1ms intervals",
      "Added automatic changelog system"
    ]
  },
  {
    version: "2.1.0",
    date: "August 25, 2024",
    title: "Action Recording Revolution",
    changes: [
      "Completely redesigned Action Recording system",
      "Idle actions 10x faster",
      "Improved canvas integration",
      "Fixed recording state synchronization"
    ]
  }
]

export function ChangelogPanel({}: ChangelogPanelProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set([0]))

  const toggleVersion = (index: number) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedVersions(newExpanded)
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2 lg:px-0 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
            <History className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-foreground">What's New</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Latest updates</p>
          </div>
        </div>
      </div>

      {/* Changelog List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {CHANGELOG_DATA.map((entry, index) => {
          const isExpanded = expandedVersions.has(index)
          return (
            <div key={entry.version} className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleVersion(index)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">{entry.version}</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">{entry.date}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground text-left leading-tight">{entry.title}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
              </button>

              {isExpanded && (
                <div className="overflow-hidden bg-muted/10 border-t border-border/50">
                  <div className="p-3 space-y-2">
                    {entry.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-foreground rounded-full flex-shrink-0 mt-1.5" />
                        <span className="text-[10px] text-foreground font-medium leading-relaxed">{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
      `}</style>
    </div>
  )
}