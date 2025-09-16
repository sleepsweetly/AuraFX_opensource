"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Bug, Zap, Shield, Star, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


interface ChangelogEntry {
  id: string
  version: string
  date: string
  type: 'major' | 'minor' | 'patch' | 'hotfix'
  title: string
  description: string
  changes: {
    type: 'feature' | 'improvement' | 'bugfix' | 'breaking' | 'security'
    title: string
    description?: string
  }[]
  highlights?: string[]
}

interface ChangelogModalProps {
  isOpen: boolean
  onClose: () => void
  changelogData?: ChangelogEntry[]
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    id: "v2.1.6",
    version: "2.1.6",
    date: "2025-09-16",
    type: "minor",
    title: "Open Source, Header Cleanup, Quick Settings Move, and Webhook Removal",
    description: "AuraFX is now open source and in maintenance mode (no new features planned by the author). Admin-only analytics webhook was removed; only an optional minimal public notification remains. Grid Coordinates and Performance Mode were moved from the header into Canvas Quick Settings. Added a GitHub link with live star count, refreshed fonts, and fixed the Grid Coordinates toggle behavior.",
    changes: [
      {
        type: "feature",
        title: "Open Source Release",
        description: "The repository is now open source. Community PRs for fixes and small improvements are welcome."
      },
      {
        type: "improvement",
        title: "Grid & Performance moved to Quick Settings",
        description: "Grid Coordinates and Performance Mode toggles were moved from the header into the Canvas Quick Settings dropdown for faster access."
      },
      {
        type: "bugfix",
        title: "Grid Coordinates Toggle Fix",
        description: "Resolved an issue where the Grid Coordinates toggle wouldn’t close properly when used from Quick Settings."
      },
      {
        type: "improvement",
        title: "Header GitHub Button with Live Stars",
        description: "Added a GitHub button showing the repository’s live star count."
      },
      {
        type: "improvement",
        title: "Typography Refresh",
        description: "Introduced Google Fonts: Caveat for the GitHub label and Fuzzy Bubbles (bold) for the star badge."
      },
      {
        type: "improvement",
        title: "README Overhaul (English)",
        description: "README rewritten in English with clear links, features, and maintenance notice."
      }
    ],
    highlights: [
      "Open source release + maintenance mode",
      "Admin webhook removed",
      "Grid & Performance in Quick Settings",
      "GitHub button with live stars",
      "Caveat + Fuzzy Bubbles fonts",
      "Grid toggle fix",
      "README updated in English"
    ]
  },
  {
    id: "v2.1.5",
    version: "2.1.5",
    date: "2025-01-27",
    type: "minor",
    title: "Enhanced Select Tool, Discord Integration & Wiki Updates",
    description: "Improved select tool with combined scale and rotate functionality, fixed Discord links, added effect sharing to Discord, enhanced canvas panning capabilities, and updated wiki content.",
    changes: [
      {
        type: "feature",
        title: "Combined Scale & Rotate in Select Tool",
        description: "Hold Shift while using the rotate button to perform both scaling and rotation simultaneously on selected objects. Thanks to Discord user mochiteyvat for the suggestion!"
      },
      {
        type: "bugfix",
        title: "Fixed Discord Links",
        description: "All Discord links throughout the application now work properly without issues."
      },
      {
        type: "feature",
        title: "Discord Effect Sharing",
        description: "Share your created effects directly to the site's Discord server with a single click."
      },
      {
        type: "improvement",
        title: "Enhanced Canvas Panning",
        description: "Improved panning functionality on the drawing canvas for better navigation and user experience."
      },
      {
        type: "improvement",
        title: "Wiki Content Updates",
        description: "Updated wiki documentation with latest information and improvements."
      }
    ],
    highlights: [
      "Shift + rotate for combined transformations",
      "Working Discord integration",
      "Direct effect sharing to Discord",
      "Smoother canvas navigation",
      "Updated wiki documentation"
    ]
  },
  {
    id: "v2.1.4",
    version: "2.1.4",
    date: "2024-12-15",
    type: "minor",
    title: "Canvas Middle-Click Pan & Text Selection Safeguard",
    description: "Added middle mouse button panning on the canvas. Disabled sitewide text selection to prevent accidental drags, while preserving selection in inputs, textareas, contenteditable areas, and code editors.",
    changes: [
      {
        type: "feature",
        title: "Middle-click canvas panning",
        description: "Drag with the middle mouse button to pan the view; cursor switches to 'move' and resets on release."
      },
      {
        type: "improvement",
        title: "Disable sitewide text selection (allowlist)",
        description: "Global user-select: none; selection remains enabled for inputs, textareas, contenteditable, and Monaco/CodeMirror editors."
      }
    ],
    highlights: [
      "Fast navigation with MMB panning",
      "Selection preserved in form fields and editors"
    ]
  },
  {
    id: "v2.1.2",
    version: "2.1.2",
    date: "2024-11-20",
    type: "minor",
    title: "Quick Settings UX, Shape Limits & Action Recording Enhancements",
    description: "Improved Quick Settings interactions, preserved selections, enforced per-shape limits, and extended Action Recording to color and element count with code generation support.",
    changes: [
      {
        type: "bugfix",
        title: "Quick Settings slider no longer clears selection",
        description: "UI hover guard and focused event handling prevent canvas from deselecting when interacting with the slider."
      },
      {
        type: "improvement",
        title: "Smooth slider updates with commit",
        description: "Live UI updates via local state; global changes are applied on commit for performance."
      },
      {
        type: "improvement",
        title: "Particle Count label updates live",
        description: "Count display now reflects the current dragging value instantly."
      },
      {
        type: "improvement",
        title: "Keep Quick Settings open on shape select",
        description: "Selecting a shape in the list no longer closes the dropdown."
      },
      {
        type: "improvement",
        title: "Preserve selection after element count changes",
        description: "Regenerated group elements remain selected for seamless editing."
      },
      {
        type: "improvement",
        title: "Per-shape minimum counts",
        description: "circle ≥ 3, line ≥ 2, square ≥ 8 and multiples of 4; prevents disappearing shapes and NaN errors."
      },
      {
        type: "feature",
        title: "Change selected shape color from Quick Settings",
        description: "Color Picker now updates selected elements directly, not just default settings."
      },
      {
        type: "feature",
        title: "Action Recording: color & particle count",
        description: "Recorded when changed in Quick Settings; generate-effect-code applies recorded color and count per element."
      }
    ],
    highlights: [
      "No more deselection when using slider",
      "Live slider value + commit apply",
      "Selection persists after count edits",
      "Square min 8 (×4), Circle min 3, Line min 2",
      "Color and count included in Action Recording & code output"
    ]
  },
  {
    id: "v2.1.3",
    version: "2.1.3",
    date: "2024-10-15",
    type: "minor",
    title: "Triangle + size-preserving count + layer reorder UX",
    description: "Added Triangle tool, ensured count changes keep shape size, and improved layer reordering with a grab handle and clear drop indicator.",
    changes: [
      {
        type: "feature",
        title: "Triangle tool",
        description: "New Triangle shape with proper drag overlay and even perimeter distribution."
      },
      {
        type: "improvement",
        title: "Size-preserving count regen (Circle/Square/Line)",
        description: "Count changes keep the original radius/half-size/length using farthest-point and max-extent heuristics."
      },
      {
        type: "improvement",
        title: "Drag handle for layers",
        description: "Only grabbing the handle starts drag; prevents accidental drags."
      },
      {
        type: "improvement",
        title: "Drop indicator line",
        description: "Thick white line with dot shows exact insert position (above/below)."
      }
    ],
    highlights: [
      "Triangle tool",
      "Circle radius preserved",
      "Square half-size preserved",
      "Line length preserved",
      "Layer drag handle",
      "Clear drop indicator"
    ]
  },
  {
    id: "v2.1.1",
    version: "2.1.1",
    date: "2024-09-10",
    type: "patch",
    title: "Action Recording Fixes & Changelog System",
    description: "Critical fixes for Action Recording system and introduction of automatic changelog notifications.",
    changes: [
      {
        type: "bugfix",
        title: "Fixed Auto-Recording Issue",
        description: "Action recording no longer starts automatically when opening the panel. Users must manually start recording."
      },
      {
        type: "bugfix",
        title: "Canvas Elements Conflict Resolved",
        description: "Fixed issue where canvas elements were conflicting with recorded actions in code generation. Now only recorded actions are included when recording is active."
      },
      {
        type: "improvement",
        title: "Ultra-Fast Idle Actions",
        description: "Idle actions now record at 1ms intervals for much smoother and more frequent animation generation."
      },
      {
        type: "feature",
        title: "Automatic Changelog System",
        description: "New changelog modal automatically appears once per deployment to inform users about updates and improvements."
      },
      {
        type: "improvement",
        title: "State Management Cleanup",
        description: "Removed conflicting local state in canvas component, now uses centralized store for recording state."
      }
    ],
    highlights: [
      "Manual recording control",
      "1ms idle action recording",
      "Clean code generation",
      "Auto-changelog notifications",
      "Better state management"
    ]
  },
  {
    id: "v2.1.0",
    version: "2.1.0",
    date: "2024-08-25",
    type: "minor",
    title: "Action Recording Revolution",
    description: "Major improvements to the Action Recording system with enhanced performance and user experience.",
    changes: [
      {
        type: "feature",
        title: "Enhanced Action Recording",
        description: "Completely redesigned action recording system with real-time feedback and improved accuracy."
      },
      {
        type: "improvement",
        title: "Faster Idle Actions",
        description: "Idle actions now record 10x faster for smoother animation generation."
      },
      {
        type: "improvement",
        title: "Smart Canvas Integration",
        description: "Action recording mode now properly separates canvas elements from recorded actions."
      },
      {
        type: "bugfix",
        title: "Recording State Sync",
        description: "Fixed recording state synchronization issues between UI and store."
      }
    ],
    highlights: [
      "10x faster idle action recording",
      "Improved action accuracy",
      "Better state management",
      "Cleaner code generation"
    ]
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature': return <Sparkles className="w-4 h-4" />
    case 'improvement': return <Zap className="w-4 h-4" />
    case 'bugfix': return <Bug className="w-4 h-4" />
    case 'breaking': return <Shield className="w-4 h-4" />
    case 'security': return <Shield className="w-4 h-4" />
    default: return <Star className="w-4 h-4" />
  }
}

export function ChangelogModal({ isOpen, onClose, changelogData = CHANGELOG_DATA }: ChangelogModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  // En yeni kaydı en üstte göstermek için versiyon numarasına göre sırala
  const data = useMemo<ChangelogEntry[]>(() => {
    const cmpVer = (va: string, vb: string) => {
      const pa = va.split('.').map(n => parseInt(n, 10) || 0)
      const pb = vb.split('.').map(n => parseInt(n, 10) || 0)
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const a = pa[i] ?? 0
        const b = pb[i] ?? 0
        if (a !== b) return a - b
      }
      return 0
    }
    return [...changelogData].sort((a: ChangelogEntry, b: ChangelogEntry) => {
      // Sort by semantic version in descending order (highest version first)
      return -cmpVer(a.version, b.version)
    })
  }, [changelogData])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const selectedEntry = selectedVersion
    ? data.find(entry => entry.id === selectedVersion)
    : data[0]

  const currentIndex = useMemo(() => {
    if (!selectedEntry) return 0
    const idx = data.findIndex((d) => d.id === selectedEntry.id)
    return idx >= 0 ? idx : 0
  }, [data, selectedEntry])

  const goPrev = () => {
    const idx = Math.min(currentIndex + 1, data.length - 1)
    setSelectedVersion(data[idx]?.id || null)
  }

  const goNext = () => {
    const idx = Math.max(currentIndex - 1, 0)
    setSelectedVersion(data[idx]?.id || null)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-black border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-5 border-b border-white/10 bg-black/70 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-white">What's New</h2>
                <p className="text-white/50 text-xs">Latest updates & fixes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goPrev}
                className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                title="Older version"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goNext}
                className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                title="Newer version"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative overflow-y-auto max-h-[calc(85vh-100px)] p-6 space-y-6">
            {selectedEntry && (
              <motion.div
                key={selectedEntry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Version Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs bg-white/10 text-white border border-white/20">
                      {selectedEntry.type.toUpperCase()}
                    </Badge>
                    <span className="text-lg font-bold text-white">{selectedEntry.version}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60 text-sm">{selectedEntry.date}</span>
                  </div>
                  <h1 className="text-xl font-bold text-white mb-1">{selectedEntry.title}</h1>
                  <p className="text-white/70 text-sm leading-relaxed">{selectedEntry.description}</p>
                </div>

                {/* Highlights */}
                {selectedEntry.highlights && (
                  <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-white" />
                      <h3 className="text-sm font-semibold text-white">Key Highlights</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedEntry.highlights.map((highlight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-2 text-sm text-white/80"
                        >
                          <ArrowRight className="w-3 h-3 text-white/60" />
                          <span>{highlight}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Changes */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white mb-2">Changes in this version</h3>
                  {selectedEntry.changes.map((change, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-white/10 border border-white/20">
                          {getTypeIcon(change.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white">{change.title}</h4>
                            <Badge className="text-xs bg-white/10 text-white border border-white/20">
                              {change.type}
                            </Badge>
                          </div>
                          {change.description && (
                            <p className="text-xs text-white/70 leading-relaxed">{change.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="relative p-4 border-t border-white/10 bg-black/70 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">Made with ❤️ by sleepsweetly</p>
              <Button
                onClick={onClose}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-1.5 rounded-lg border border-white/20"
              >
                Got it!
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
