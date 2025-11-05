"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, X } from "lucide-react"

interface TutorialStep3D {
  id: string
  title: string
  description: string
  targetSelector: string
  highlightPadding?: number
}

const tutorialSteps3D: TutorialStep3D[] = [
  {
    id: "viewport",
    title: "3D Viewport",
    description: "This is your 3D workspace. You can rotate, zoom, and pan the scene using your mouse.",
    targetSelector: "canvas",
    highlightPadding: 20,
  },
  {
    id: "camera-controls",
    title: "Camera Controls",
    description: "Rotate: Middle Mouse • Pan: Shift + Middle Mouse • Zoom: Mouse Wheel or Ctrl + Middle Mouse",
    targetSelector: "canvas",
    highlightPadding: 20,
  },
  {
    id: "left-sidebar",
    title: "Tools & Objects",
    description: "Add 3D objects, import models, and access various tools. This panel contains everything you need to build your scene.",
    targetSelector: ".fixed.left-0.top-16",
    highlightPadding: 12,
  },
  {
    id: "right-sidebar",
    title: "Properties & Settings",
    description: "Adjust object properties, materials, and scene settings. Select any object to see its properties here.",
    targetSelector: ".fixed.right-0.top-16",
    highlightPadding: 12,
  },
  {
    id: "top-toolbar",
    title: "Quick Actions",
    description: "Access common actions like undo, redo, save, and view options. The toolbar provides quick access to essential functions.",
    targetSelector: ".fixed.top-0.left-0.right-0.h-16",
    highlightPadding: 12,
  },
  {
    id: "object-selection",
    title: "Object Selection",
    description: "Click on 3D objects to select them. Selected objects can be transformed, edited, or deleted. Hold Ctrl for multi-selection.",
    targetSelector: "canvas",
    highlightPadding: 20,
  },
  {
    id: "add-objects",
    title: "Add Objects",
    description: "Press Shift+A to quickly add objects to your scene. Choose from various 3D shapes and objects to build your effect.",
    targetSelector: "canvas",
    highlightPadding: 20,
  },
  {
    id: "duplicate-objects",
    title: "Duplicate Objects (Blender-style)",
    description: "Select objects and press Shift+D to duplicate them. After duplicating, you can immediately move the copies with your mouse - just like in Blender!",
    targetSelector: "canvas",
    highlightPadding: 20,
  },
]

interface Tutorial3DProps {
  onComplete?: () => void
  onSkip?: () => void
  storageKey?: string
}

export default function Tutorial3D({ 
  onComplete, 
  onSkip,
  storageKey = "tutorial3D_completed"
}: Tutorial3DProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [messageBoxPosition, setMessageBoxPosition] = useState({ top: 0, left: 0 })
  const messageBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const completed = localStorage.getItem(storageKey)
    if (!completed) {
      setIsVisible(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps3D.length) return

    const updatePosition = () => {
      const step = tutorialSteps3D[currentStep]
      const targetElement = document.querySelector(step.targetSelector)
      
      if (!targetElement) return
      
      const rect = targetElement.getBoundingClientRect()
      
      const messageBoxWidth = 340
      const messageBoxHeight = 180
      const padding = 20
      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      const targetCenterX = rect.left + rect.width / 2
      const targetCenterY = rect.top + rect.height / 2
      
      const spaceTop = rect.top
      const spaceBottom = viewportHeight - rect.bottom
      const spaceLeft = rect.left
      const spaceRight = viewportWidth - rect.right
      
      const spaces = [
        { direction: 'bottom', space: spaceBottom, priority: 1 },
        { direction: 'top', space: spaceTop, priority: 2 },
        { direction: 'right', space: spaceRight, priority: 3 },
        { direction: 'left', space: spaceLeft, priority: 4 }
      ]
      
      const bestPosition = spaces
        .filter(s => {
          if (s.direction === 'top' || s.direction === 'bottom') {
            return s.space >= messageBoxHeight + padding
          } else {
            return s.space >= messageBoxWidth + padding
          }
        })
        .sort((a, b) => {
          const spaceDiff = b.space - a.space
          if (Math.abs(spaceDiff) > 100) return spaceDiff
          return a.priority - b.priority
        })[0] || spaces[0]
      
      let messageX = 0
      let messageY = 0
      
      const highlightPadding = step.highlightPadding || 12
      
      if (step.targetSelector === 'canvas') {
        messageX = (viewportWidth - messageBoxWidth) / 2
        messageY = (viewportHeight - messageBoxHeight) / 2
      } else {
        switch (bestPosition.direction) {
          case 'bottom':
            messageX = Math.max(padding, Math.min(viewportWidth - messageBoxWidth - padding, targetCenterX - messageBoxWidth / 2))
            messageY = rect.bottom + highlightPadding + padding
            break
            
          case 'top':
            messageX = Math.max(padding, Math.min(viewportWidth - messageBoxWidth - padding, targetCenterX - messageBoxWidth / 2))
            messageY = rect.top - highlightPadding - padding - messageBoxHeight
            break
            
          case 'right':
            messageX = rect.right + highlightPadding + padding
            messageY = Math.max(padding, Math.min(viewportHeight - messageBoxHeight - padding, targetCenterY - messageBoxHeight / 2))
            break
            
          case 'left':
            messageX = rect.left - highlightPadding - padding - messageBoxWidth
            messageY = Math.max(padding, Math.min(viewportHeight - messageBoxHeight - padding, targetCenterY - messageBoxHeight / 2))
            break
        }
      }
      
      setMessageBoxPosition({ top: messageY, left: messageX })
    }

    updatePosition()
    
    let timeoutId: NodeJS.Timeout
    const debouncedUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updatePosition, 100)
    }
    
    window.addEventListener("resize", debouncedUpdate)
    window.addEventListener("scroll", debouncedUpdate, true)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", debouncedUpdate)
      window.removeEventListener("scroll", debouncedUpdate, true)
    }
  }, [currentStep, isVisible])

  const handleNext = () => {
    if (currentStep < tutorialSteps3D.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 200)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
      }, 200)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true")
    setIsVisible(false)
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem(storageKey, "true")
    setIsVisible(false)
    onSkip?.()
  }

  if (!isVisible || currentStep >= tutorialSteps3D.length) return null

  const step = tutorialSteps3D[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps3D.length) * 100

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={messageBoxRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0,
            top: messageBoxPosition.top,
            left: messageBoxPosition.left,
          }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.4, 0, 0.2, 1],
            top: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
            left: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          }}
          className="fixed z-[10001] bg-white rounded-xl shadow-2xl border border-gray-200 w-[340px]"
        >
          {/* Header with progress */}
          <div className="relative px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">
                {currentStep + 1} / {tutorialSteps3D.length}
              </span>
              <button
                onClick={handleSkip}
                className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all shadow-md"
            >
              <span>{currentStep === tutorialSteps3D.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
