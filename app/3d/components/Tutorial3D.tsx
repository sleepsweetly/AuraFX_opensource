"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, ArrowLeft, Box, MousePointer, RotateCcw, ZoomIn, Move, Settings, Eye, EyeOff } from "lucide-react"

interface TutorialStep3D {
  id: string
  title: string
  content: string
  position: "top" | "bottom" | "left" | "right" | "center"
  icon: React.ReactNode
  spotlightArea?: {
    x: number
    y: number
    width: number
    height: number
  }
}

const tutorialSteps3D: TutorialStep3D[] = [
  {
    id: "welcome",
    title: " Started",
    content: "Let's explore the 3D editor together! You'll learn about the viewport, tools, and how to create amazing 3D effects.",
    position: "center",
    icon: <Box className="w-6 h-6" />,
  },
  {
    id: "viewport",
    title: "3D Viewport",
    content: "This is your 3D workspace. You can rotate, zoom, and pan to view your scene from any angle. Use mouse controls to navigate.",
    position: "center",
    icon: <Eye className="w-6 h-6" />,
    spotlightArea: {
      x: 240,
      y: 80,
      width: 0, // Will be calculated dynamically
      height: 0, // Will be calculated dynamically
    },
  },
  {
    id: "camera-controls",
    title: "Camera Controls",
    content: `Camera Controls:\n- Orbit: Drag with Middle Mouse\n- Pan: Shift + Middle Mouse drag\n- Zoom: Ctrl + Middle Mouse drag or Mouse Wheel (scroll)`,
    position: "bottom",
    icon: <MousePointer className="w-6 h-6" />,
    spotlightArea: {
      x: 240,
      y: 80,
      width: 0,
      height: 0,
    },
  },
  {
    id: "left-sidebar",
    title: "Tools & Objects",
    content: "Add 3D objects, import models, and access various tools. This panel contains everything you need to build your 3D scene.",
    position: "right",
    icon: <Settings className="w-6 h-6" />,
    spotlightArea: {
      x: 0,
      y: 80,
      width: 240,
      height: 0,
    },
  },
  {
    id: "right-sidebar",
    title: "Properties & Settings",
    content: "Adjust object properties, materials, and scene settings. Select any object to see its properties here.",
    position: "left",
    icon: <Settings className="w-6 h-6" />,
    spotlightArea: {
      x: 0, // Will be calculated dynamically
      y: 80,
      width: 240,
      height: 0,
    },
  },
  {
    id: "top-toolbar",
    title: "Quick Actions",
    content: "Access common actions like undo, redo, save, and view options. The toolbar provides quick access to essential functions.",
    position: "bottom",
    icon: <Settings className="w-6 h-6" />,
    spotlightArea: {
      x: 0,
      y: 0,
      width: 0,
      height: 80,
    },
  },
  {
    id: "object-selection",
    title: "Object Selection",
    content: "Click on 3D objects to select them. Selected objects can be transformed, edited, or deleted. Multiple objects can be selected by holding Ctrl.",
    position: "center",
    icon: <MousePointer className="w-6 h-6" />,
    spotlightArea: {
      x: 240,
      y: 80,
      width: 0,
      height: 0,
    },
  },
  {
    id: "add-objects",
    title: "Add Objects",
    content: "Press Shift+A to quickly add objects to your scene. This opens the add menu where you can choose from various 3D shapes and objects.",
    position: "center",
    icon: <Box className="w-6 h-6" />,
    spotlightArea: {
      x: 240,
      y: 80,
      width: 0,
      height: 0,
    },
  },
  {
    id: "complete",
    title: "You're Ready!",
    content: "You now know the basics of the 3D editor. Start creating amazing 3D effects! Remember, you can always access help from the menu.",
    position: "center",
    icon: <Box className="w-6 h-6" />,
  },
]

// Fast Typewriter Effect Component
const TypewriterText: React.FC<{ text: string; delay?: number; speed?: number }> = ({
  text,
  delay = 0,
  speed = 150,
}) => {
  const words = text.split(" ")
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => (prev ? prev + " " : "") + words[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, currentIndex === 0 ? delay : speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, words, delay, speed])

  return <span>{displayText}</span>
}

interface Tutorial3DProps {
  onClose?: () => void;
}

export default function Tutorial3D({ onClose }: Tutorial3DProps) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update bubble position when step changes
  useEffect(() => {
    if (showTutorial && mounted) {
      const newPosition = getBubblePosition()
      setBubblePosition(newPosition)
    }
  }, [currentStep, showTutorial, mounted])

  const startTutorial = () => {
    setShowWelcome(false)
    setShowTutorial(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < tutorialSteps3D.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete tutorial
      localStorage.setItem("tutorial3DDone", "true");
      setShowTutorial(false);
      if (onClose) onClose();
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const closeTutorial = () => {
    setShowTutorial(false)
    if (onClose) onClose();
  }

  const skipTutorial = () => {
    setShowWelcome(false)
    setShowTutorial(false)
    if (onClose) onClose();
  }

  // Get current spotlight area with window dimensions
  const getCurrentSpotlightArea = () => {
    if (!mounted) return null
    const step = tutorialSteps3D[currentStep]

    if (!step.spotlightArea) return null

    const { x, y, width, height } = step.spotlightArea

    // Calculate actual dimensions based on 3D editor layout
    let actualWidth = width
    let actualHeight = height
    let actualX = x
    let actualY = y

    if (width === 0) {
      if (step.id === "left-sidebar") {
        actualWidth = 240
      } else if (step.id === "right-sidebar") {
        actualWidth = 240
        actualX = window.innerWidth - 240 // Right side of screen
      } else if (step.id === "top-toolbar") {
        actualWidth = window.innerWidth
      } else {
        // Main 3D viewport area - ortadaki Canvas alanı
        actualWidth = window.innerWidth - 480 // 240px left + 240px right
        actualX = 240 // Sol sidebar'dan sonra başlıyor
        
                 // Spotlight'ı 3D sahne boyutunda yap - popup'ın etrafında
         if (step.id === "viewport" || step.id === "camera-controls" || step.id === "object-selection" || step.id === "add-objects") {
           // 3D sahne alanını hesapla - popup boyutuna göre ayarla
           const popupWidth = 320 // Tutorial popup genişliği
           const popupHeight = 280 // Tutorial popup yüksekliği
           const padding = 1200 // Popup etrafında daha az boşluk
           
           const centerX = actualX + actualWidth / 2
           const centerY = actualY + actualHeight / 2
           
           actualX = centerX - (popupWidth + padding) / 2
           actualY = centerY - (popupHeight + padding) / 2
           actualWidth = popupWidth + padding
           actualHeight = popupHeight + padding
         }
      }
    }

    if (height === 0) {
      if (step.id === "top-toolbar") {
        actualHeight = 80
      } else {
        // Main 3D viewport area - ortadaki Canvas alanı
        actualHeight = window.innerHeight - 80 // 80px top toolbar
        actualY = 80 // Top toolbar'dan sonra başlıyor
      }
    }

    return {
      x: actualX,
      y: actualY,
      width: actualWidth,
      height: actualHeight,
    }
  }

  const getBubblePosition = () => {
    if (!mounted) return { top: 0, left: 0 }
    
    const step = tutorialSteps3D[currentStep]
    const bubbleWidth = 320
    const bubbleHeight = 280
    const minMargin = 20
    const extraSpace = 32

    if (step.position === "center") {
      return {
        top: window.innerHeight / 2 - bubbleHeight / 2,
        left: window.innerWidth / 2 - bubbleWidth / 2,
      }
    }

    const spotlightArea = getCurrentSpotlightArea()
    if (!spotlightArea) {
      return {
        top: window.innerHeight / 2 - bubbleHeight / 2,
        left: window.innerWidth / 2 - bubbleWidth / 2,
      }
    }

    let left, top

    if (step.position === "right") {
      const rightSpace = window.innerWidth - (spotlightArea.x + spotlightArea.width)
      if (rightSpace >= bubbleWidth + minMargin + extraSpace) {
        left = spotlightArea.x + spotlightArea.width + extraSpace
      } else {
        left = window.innerWidth / 2 - bubbleWidth / 2
      }
    } else if (step.position === "left") {
      const leftSpace = spotlightArea.x
      if (leftSpace >= bubbleWidth + minMargin + extraSpace) {
        left = spotlightArea.x - bubbleWidth - extraSpace
      } else {
        left = window.innerWidth / 2 - bubbleWidth / 2
      }
    } else {
      left = window.innerWidth / 2 - bubbleWidth / 2
    }

    if (step.position === "top") {
      top = spotlightArea.y - bubbleHeight - extraSpace
    } else if (step.position === "bottom") {
      top = spotlightArea.y + spotlightArea.height + extraSpace
    } else {
      top = spotlightArea.y + spotlightArea.height / 2 - bubbleHeight / 2
    }

    // Ensure bubble stays within viewport
    if (top < minMargin) top = minMargin
    if (top + bubbleHeight > window.innerHeight - minMargin) {
      top = window.innerHeight - bubbleHeight - minMargin
    }
    if (left < minMargin) left = minMargin
    if (left + bubbleWidth > window.innerWidth - minMargin) {
      left = window.innerWidth - bubbleWidth - minMargin
    }

    return { top, left }
  }

  const currentStepData = tutorialSteps3D[currentStep]
  const currentSpotlightArea = getCurrentSpotlightArea()

  if (!mounted) return null

  return (
    <>
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ backdropFilter: 'blur(24px)', opacity: 1 }}
            animate={{ backdropFilter: 'blur(24px)', opacity: 1 }}
            exit={{ backdropFilter: 'blur(0px)', opacity: 0 }}
            transition={{ backdropFilter: { duration: 0.7, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
            className="fixed inset-0 flex items-center justify-center z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18, duration: 0.7 }}
              className="w-full max-w-xl rounded-3xl bg-[#000000] p-10 flex flex-col items-center shadow-none border-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-6 flex flex-col items-center"
              >
                <motion.div
                  initial={{ rotate: -20, scale: 0.7, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
                  className="mb-4"
                >
                  {currentStepData.icon}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-black text-white mb-2 text-center"
                >
                  Welcome to 3D Editor
                </motion.h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="w-20 h-0.5 bg-purple-500 mx-auto mb-6 rounded-full origin-left"
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-300 mb-10 text-lg leading-relaxed text-center max-w-md"
              >
                🎉 Welcome to the 3D editor! Let's explore the tools and learn how to create amazing 3D effects.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4 justify-center w-full"
              >
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-none border-none"
                  onClick={startTutorial}
                >
                  Begin Tutorial
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.06, backgroundColor: '#222' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl transition-all duration-200 border-none shadow-none"
                  onClick={skipTutorial}
                >
                  Skip for now
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay with Perfect Spotlight */}
      <AnimatePresence>
        {showTutorial && currentSpotlightArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            style={{ pointerEvents: 'none' }}
          >
            {/* SVG Spotlight Mask */}
            <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
              <defs>
                <mask id="spotlight-mask-3d">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={currentSpotlightArea.x}
                    y={currentSpotlightArea.y}
                    width={currentSpotlightArea.width}
                    height={currentSpotlightArea.height}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="#000000" fillOpacity="0.8" mask="url(#spotlight-mask-3d)" />
            </svg>
            {/* Border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute border-2 border-purple-500/60 rounded-lg pointer-events-none"
              style={{
                top: currentSpotlightArea.y - 4,
                left: currentSpotlightArea.x - 4,
                width: currentSpotlightArea.width + 8,
                height: currentSpotlightArea.height + 8,
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1)",
              }}
            />
            {/* Overlay blocker regions */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: currentSpotlightArea.y, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
            <div style={{ position: 'absolute', left: 0, top: currentSpotlightArea.y + currentSpotlightArea.height, width: '100%', height: `calc(100vh - ${currentSpotlightArea.y + currentSpotlightArea.height}px)`, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
            <div style={{ position: 'absolute', left: 0, top: currentSpotlightArea.y, width: currentSpotlightArea.x, height: currentSpotlightArea.height, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
            <div style={{ position: 'absolute', left: currentSpotlightArea.x + currentSpotlightArea.width, top: currentSpotlightArea.y, width: `calc(100vw - ${currentSpotlightArea.x + currentSpotlightArea.width}px)`, height: currentSpotlightArea.height, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smoothly Animated Tutorial Bubble */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed z-[9999] w-96 pointer-events-auto"
            initial={{
              opacity: 0,
              scale: 0.8,
              top: bubblePosition.top,
              left: bubblePosition.left,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              top: bubblePosition.top,
              left: bubblePosition.left,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
              duration: 0.8,
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative bg-[#000000] rounded-2xl border border-purple-500/40 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="p-2.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-gray-600/30"
                    >
                      {currentStepData.icon}
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg font-semibold text-white mb-0.5"
                      >
                        <TypewriterText text={currentStepData.title} delay={0} speed={150} />
                      </motion.h3>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs text-gray-400"
                      >
                        Step {currentStep + 1} of {tutorialSteps3D.length}
                      </motion.div>
                    </div>
                  </div>
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeTutorial}
                    className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-gray-300 mb-6 leading-relaxed"
                >
                  <TypewriterText text={currentStepData.content} delay={100} speed={120} />
                </motion.div>

                {/* Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex gap-1.5 mb-6"
                >
                  {tutorialSteps3D.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === currentStep ? "bg-white w-6" : "bg-gray-600 w-1.5"
                      }`}
                      animate={{
                        scale: index === currentStep ? 1.1 : 1,
                      }}
                    />
                  ))}
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex justify-between"
                >
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/60 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/60 transition-all duration-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 }}
                    onClick={nextStep}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 15px rgba(139, 92, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg transition-all duration-200"
                  >
                    {currentStep === tutorialSteps3D.length - 1 ? "Complete" : "Next"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 