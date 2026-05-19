"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, PanInfo, Variants } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react"

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
  const [isDragging, setIsDragging] = useState(false)

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

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false)
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > 100 || velocity > 500) {
      goPrev()
    } else if (offset < -100 || velocity < -500) {
      goNext()
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  if (!isOpen) return null

  const currentEntry = CHANGELOG_DATA[currentIndex]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 50,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  }



  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x: isDragging ? 0 : undefined }}
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-6 border-b border-gray-200/50"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">What's New</h2>
                  <p className="text-gray-500 text-sm">
                    {currentIndex + 1} / {CHANGELOG_DATA.length}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                key={currentIndex}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                <motion.div variants={itemVariants} className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.span
                      className="text-3xl font-bold text-gray-900"
                      whileHover={{ scale: 1.05 }}
                    >
                      {currentEntry.version}
                    </motion.span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{currentEntry.date}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentEntry.title}</h3>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-3">
                  {currentEntry.changes.map((change, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 p-3 bg-gray-50/70 rounded-lg border border-gray-100/50 hover:bg-gray-100/70 transition-colors"
                    >
                      <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.1
                        }}
                      />
                      <span className="text-gray-700 text-sm leading-relaxed">{change}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Navigation */}
            <motion.div
              className="flex items-center justify-between p-6 border-t border-gray-200/50"
              variants={itemVariants}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goPrev}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </motion.button>

              <div className="flex gap-2">
                {CHANGELOG_DATA.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-gray-900' : 'bg-gray-300'
                      }`}
                    whileHover={{ scale: 1.5 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    {index === currentIndex && (
                      <motion.div
                        className="absolute inset-0 bg-gray-900 rounded-full"
                        layoutId="activeDot"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goNext}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}