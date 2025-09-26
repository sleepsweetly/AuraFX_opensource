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
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl bg-black border border-white/20 rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">What's New</h2>
              <p className="text-white/60 text-sm">
                {currentIndex + 1} / {CHANGELOG_DATA.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                  <span className="text-2xl font-bold text-white">{currentEntry.version}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{currentEntry.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{currentEntry.title}</h3>
              </div>

              <div className="space-y-2">
                {currentEntry.changes.map((change, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80 text-sm leading-relaxed">{change}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <button
              onClick={goPrev}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-1">
              {CHANGELOG_DATA.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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