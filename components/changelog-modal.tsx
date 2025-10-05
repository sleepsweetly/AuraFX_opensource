"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface ChangelogEntry {
  version: string
  date: string
  title: string
  changes: string[]
}

interface ChangelogModalProps {
  isOpen: boolean
  onClose: () => void
}

const CHANGELOG_DATA: ChangelogEntry[] = [
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

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CHANGELOG_DATA.length)
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CHANGELOG_DATA.length) % CHANGELOG_DATA.length)
  }

  if (!isOpen) return null

  const currentEntry = CHANGELOG_DATA[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">What's New</h2>
              <p className="text-gray-500 text-sm">
                {currentIndex + 1} / {CHANGELOG_DATA.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{currentEntry.version}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{currentEntry.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{currentEntry.title}</h3>
              </div>

              <div className="space-y-2">
                {currentEntry.changes.map((change, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm leading-relaxed">{change}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={goPrev}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-1">
              {CHANGELOG_DATA.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}