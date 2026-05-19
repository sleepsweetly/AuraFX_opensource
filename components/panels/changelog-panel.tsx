"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, Sparkles, ChevronDown, ChevronUp } from "lucide-react"

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
      "🎨 3D Editor completely redesigned with modern interface",
      "🔧 Fixed multiple UI component z-index conflicts",
      "🎮 Added super secret easter egg game (try to find it!)",
      "✨ Easter egg game now properly hides UI components when active",
      "🐛 Fixed Header component not appearing on main page",
      "⚡ Improved component rendering performance",
      "🎯 Better component layering and visibility management"
    ]
  },
  {
    version: "3.0.0",
    date: "December 15, 2025",
    title: "Complete UI Redesign - Built from Scratch",
    changes: [
      "🎨 Complete UI redesign with modern white theme",
      "🔧 All panels redesigned with consistent styling",
      "📱 New compact header with floating design",
      "⚡ Left toolbar with quick generate code button",
      "🎯 Right sidebar with organized tabs",
      "✨ New footer with social links",
      "🎪 All modals redesigned with white theme",
      "🚀 Smooth animations and transitions throughout"
    ]
  },
  {
    version: "2.1.8",
    date: "September 26, 2025",
    title: "Action Recording Particle Optimization Fix",
    changes: [
      "Fixed 'Optimize circle frames' switch in Action Recording panel",
      "When disabled, circles now generate individual particle lines instead of particlering",
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set([0])) // First version expanded by default

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
    <div className="h-full w-full bg-white dark:bg-zinc-950 flex flex-col text-sm text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-lg">What's New</h3>
            <p className="text-sm text-gray-505 dark:text-zinc-400">Latest updates and changes</p>
          </div>
        </div>
      </div>

      {/* Changelog List */}
      <div className="flex-1 overflow-y-auto p-1 scrollbar-hidden panel-container">
        {CHANGELOG_DATA.map((entry, index) => (
          <div key={entry.version} className="mb-1">
            <motion.button
              onClick={() => toggleVersion(index)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 relative hover:bg-gray-105 dark:hover:bg-zinc-900/60"
              whileHover={{ x: 2 }}
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 dark:text-zinc-100">{entry.version}</span>
                  <span className="text-gray-400 dark:text-zinc-600">•</span>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-zinc-400">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">{entry.date}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-zinc-300 font-medium">{entry.title}</p>
              </div>
              
              <div className="flex-shrink-0">
                {expandedVersions.has(index) ? (
                  <ChevronUp className="w-4 h-4 text-gray-505 dark:text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-550 dark:text-zinc-500" />
                )}
              </div>
            </motion.button>

            <AnimatePresence>
              {expandedVersions.has(index) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pl-7">
                    <div className="bg-gray-50 dark:bg-zinc-900/20 rounded-md p-3 space-y-2 border border-gray-100 dark:border-zinc-800/80">
                      {entry.changes.map((change, changeIndex) => (
                        <motion.div
                          key={changeIndex}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: changeIndex * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-xs text-gray-700 dark:text-zinc-350 leading-relaxed">{change}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hidden {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  )
}