"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, ArrowLeft, Hexagon, Wand2, Settings, Box, ImageIcon, Circle, Eye } from "lucide-react"
import { siteConfig, getDiscordInviteUrl } from "@/lib/config"

interface TutorialStep {
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
  actionType?: string; // Yeni eklenen alan
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to AuraFX",
    content: "Let's explore the magic of AuraFX together! With intuitive tools and a creative playground, you're ready to bring your ideas to life.",
    position: "center",
    icon: <Hexagon className="w-6 h-6" />,
  },
  {
    id: "sidebar",
    title: "Control Center",
    content:
      "This is your creative hub! Manage layers, drawing tools, PNG uploads, particle settings, transform modes, optimization, preview, code panel, 3D push, and announcements—all in one place.",
    position: "right",
    icon: <Wand2 className="w-6 h-6" />,
    spotlightArea: {
      x: 0,
      y: 0,
      width: 240,
      height: 0, // Will be set to window height
    },
  },
  {
    id: "header",
    title: "Project & Performance",
    content:
      "Save your work, pick up right where you left off, generate code with a click, or switch to performance mode for a smoother experience.",
    position: "bottom",
    icon: <ImageIcon className="w-6 h-6" />,
    spotlightArea: {
      x: 0,
      y: 0,
      width: 0, // Will be set to window width
      height: 80,
    },
  },
  {
    id: "toolbar",
    title: "Quick Actions",
    content:
      "Undo, redo, copy, paste, and delete are just a click away in the select tool. Edit faster and keep your flow going!",
    position: "bottom",
    icon: <Settings className="w-6 h-6" />,
    spotlightArea: {
      x: 240,
      y: 90,
      width: 0, // Will be set to window width - 240
      height: 48,
    },
  },
  {
    id: "canvas",
    title: "Design Playground",
    content:
      "Draw, zoom, and switch views freely. See your active tool, use sideview, and even try out the legacy version with Python integration.",
    position: "top",
    icon: <Box className="w-6 h-6" />,
    spotlightArea: {
      x: 240,
      y: 128,
      width: 0, // Will be set to window width - 240
      height: 0, // Will be set to window height - 128
    },
  },
  {
    id: "discord",
    title: "Join Our Discord!",
    content: "Need help or want to share your creations? Join our Discord community for support, updates, and more!",
    position: "center",
    icon: <Wand2 className="w-6 h-6" />,
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

// Floating Particles Component
const FloatingParticle: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      y: [-20, -100],
      x: [0, Math.random() * 40 - 20],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: Math.random() * 3,
    }}
    className="absolute w-1 h-1 bg-white/40 rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      bottom: 0,
    }}
  />
)

interface ModernTutorialProps {
  openPanels?: string[];
  togglePanel?: (panel: string) => void;
  lastShapeCreated?: string | null;
  codePanelOpened?: boolean;
  previewPanelOpened?: boolean;
  layerAdded?: boolean;
  onShapeCreated?: (type: string) => void;
  onCodePanelOpened?: () => void;
  onPreviewPanelOpened?: () => void;
  onLayerAdded?: () => void;
}

export default function ModernTutorial({ openPanels = [], togglePanel, lastShapeCreated, codePanelOpened, previewPanelOpened, layerAdded }: ModernTutorialProps) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  const [activePanelRect, setActivePanelRect] = useState<DOMRect | null>(null);
  const [show3DModal, setShow3DModal] = useState(false);
  const [lastShapeCreatedState, setLastShapeCreatedState] = useState<string | null>(null);
  const [codePanelOpenedState, setCodePanelOpenedState] = useState(false);
  const [previewPanelOpenedState, setPreviewPanelOpenedState] = useState(false);
  const [layerAddedState, setLayerAddedState] = useState(false);
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);

  const isLayersPanelOpen = openPanels.includes('layers');

  const panelTutorials = {
    layers: {
      title: "Layers Panel",
      content: "Add, rename, reorder, or delete layers. Organize your creative work with ease!"
    },
    tools: {
      title: "Tools Panel",
      content: "Choose your drawing and editing tools here. Switch between brush, shape, and more!"
    },
    import: {
      title: "Import Panel",
      content: "Import assets and images to use in your project. Drag and drop or browse your files!"
    },
    settings: {
      title: "Properties Panel",
      content: "Edit properties of selected elements. Adjust size, color, and more!"
    },
    modes: {
      title: "Effects Panel",
      content: "Apply visual effects to your layers and elements for stunning results!"
    },
    performance: {
      title: "Performance Panel",
      content: "Optimize your project for the best performance. Adjust settings as needed."
    },
    preview: {
      title: "Preview Panel",
      content: "Preview your work before exporting or sharing. See how it looks in action!"
    },
    code: {
      title: "Code Panel",
      content: "View and export the code generated from your design. Integrate with your workflow!"
    },
    editor3d: {
      title: "3D Editor Panel",
      content: "Switch to 3D editing mode and bring your designs to another dimension!"
    },
    announcements: {
      title: "Announcements Panel",
      content: "See the latest updates, features, and news about AuraFX!"
    },
    editor3dModal: {
      title: "3D Editor Modal",
      content: "Welcome to the 3D editor! Here you can work in 3D space. Use the tools above to get started."
    },
  }

  const lastOpenPanel = openPanels.length > 0 ? openPanels[openPanels.length - 1] : null;
  const isSidebarStep = tutorialSteps[currentStep].id === "sidebar";
  const showPanelContent = lastOpenPanel && Object.prototype.hasOwnProperty.call(panelTutorials, lastOpenPanel);
  const bubbleTitle = showPanelContent
    ? panelTutorials[lastOpenPanel as keyof typeof panelTutorials].title
    : tutorialSteps[currentStep].title;
  const bubbleContent = showPanelContent
    ? panelTutorials[lastOpenPanel as keyof typeof panelTutorials].content
    : tutorialSteps[currentStep].content;

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update Discord URL from GitHub
  useEffect(() => {
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, [])

  // Update bubble position when step changes
  useEffect(() => {
    if (showTutorial && mounted) {
      const newPosition = getBubblePosition()
      setBubblePosition(newPosition)
    }
  }, [currentStep, showTutorial, mounted, activePanelRect])

  // Panel açıkken DOM konumunu güncelle
  useEffect(() => {
    if (openPanels.includes('layers')) {
      let el = document.querySelector('[data-panel-id="layers"]');
      if (!el) {
        const headers = document.querySelectorAll('.draggable-panel-header');
        for (const header of headers) {
          if (header.textContent?.trim().includes("Layers")) {
            el = header.parentElement;
            break;
          }
        }
      }
      if (el) {
        setPanelRect(el.getBoundingClientRect());
      }
    } else {
      setPanelRect(null);
    }
  }, [openPanels, showTutorial, currentStep]);

  // Panel hareketini canlı takip et (draggable panel)
  useEffect(() => {
    if (!showTutorial || !lastOpenPanel) {
      setActivePanelRect(null); // panel kapanınca rect'i sıfırla
      return;
    }
    let prevRect: DOMRect | null = null;
    const interval = setInterval(() => {
      const el = document.querySelector(`[data-panel-id="${lastOpenPanel}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Sadece değiştiyse state güncelle
        if (!prevRect || rect.left !== prevRect.left || rect.top !== prevRect.top || rect.width !== prevRect.width || rect.height !== prevRect.height) {
          setActivePanelRect(rect);
          prevRect = rect;
        }
      }
    }, 60); // 60ms'de bir kontrol
    return () => clearInterval(interval);
  }, [showTutorial, lastOpenPanel]);

  const startTutorial = () => {
    setShowWelcome(false)
    setShowTutorial(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 2) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === tutorialSteps.length - 2) {
      // Sondan bir önceki adımda: tutorialDone yaz ve Discord adımına geç
      localStorage.setItem("tutorialDone", "true");
      setCurrentStep(currentStep + 1);
    } else {
      // Discord adımında sadece tutorialı kapat
      setShowTutorial(false);
    }
  }

  const prevStep = () => {
    if (lastOpenPanel) {
      if (togglePanel) togglePanel(lastOpenPanel);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const closeTutorial = () => {
    setShowTutorial(false)
  }

  const skipTutorial = () => {
    setShowWelcome(false)
    setShowTutorial(false)
  }

  // 1. Spotlight ve border için kullanılacak alanı belirle
  const spotlightRect = activePanelRect || (function() {
    const step = tutorialSteps[currentStep];
    if (step.spotlightArea) {
      return {
        x: step.spotlightArea.x,
        y: step.spotlightArea.y,
        width: step.spotlightArea.width === 0
          ? (step.id === "sidebar" ? 240 : step.id === "header" ? window.innerWidth : window.innerWidth - 240)
          : step.spotlightArea.width,
        height: step.spotlightArea.height === 0
          ? (step.id === "sidebar" ? window.innerHeight : step.id === "canvas" ? window.innerHeight - 128 : step.spotlightArea.height)
          : step.spotlightArea.height,
      };
    }
    return null;
  })();

  // 2. getBubblePosition fonksiyonunu güncelle
  const getBubblePosition = () => {
    if (!mounted) return { top: 0, left: 0 }
    if (spotlightRect) {
      const bubbleWidth = 320
      const bubbleHeight = 280
      const rightSpace = window.innerWidth - (spotlightRect.x + spotlightRect.width)
      const leftSpace = spotlightRect.x
      const minMargin = 20
      const extraSpace = 32
      let left, top
      if (rightSpace >= bubbleWidth + minMargin + extraSpace) {
        left = spotlightRect.x + spotlightRect.width + extraSpace
      } else if (leftSpace >= bubbleWidth + minMargin + extraSpace) {
        left = spotlightRect.x - bubbleWidth - extraSpace
      } else {
        left = window.innerWidth / 2 - bubbleWidth / 2
      }
      // Quick Actions (toolbar) adımı için baloncuğu daha aşağıdan göster
      if (tutorialSteps[currentStep].id === "toolbar") {
        top = spotlightRect.y + spotlightRect.height + 32 // 32px aşağıdan başlat
      } else {
        top = spotlightRect.y + spotlightRect.height / 2 - bubbleHeight / 2
      }
      if (top < minMargin) top = minMargin
      if (top + bubbleHeight > window.innerHeight - minMargin) {
        top = window.innerHeight - bubbleHeight - minMargin
      }
      return { top, left }
    }
    // fallback: ekran ortası
    return {
      top: window.innerHeight / 2 - 140,
      left: window.innerWidth / 2 - 160,
    }
  }

  // Get current spotlight area with window dimensions
  const getCurrentSpotlightArea = () => {
    if (!mounted) return null
    const step = tutorialSteps[currentStep]
    if (step.id === "sidebar" && panelRect) {
      return {
        x: panelRect.left,
        y: panelRect.top + 0,
        width: panelRect.width,
        height: panelRect.height,
      }
    }

    if (!step.spotlightArea) return null

    const { x, y, width, height } = step.spotlightArea

    if (step.id === "sidebar" && isLayersPanelOpen) {
      return {
        x: x + 240,
        y: y,
        width: width,
        height: height,
      }
    }

    return {
      x,
      y,
      width:
        width === 0
          ? step.id === "sidebar"
            ? 240
            : step.id === "header"
              ? window.innerWidth
              : window.innerWidth - 240
          : width,
      height:
        height === 0
          ? step.id === "sidebar"
            ? window.innerHeight
            : step.id === "canvas"
              ? window.innerHeight - 128
              : height
          : height,
    }
  }

  const currentStepData = tutorialSteps[currentStep]
  const currentSpotlightArea = getCurrentSpotlightArea()

  const open3DModal = () => {
    if (togglePanel) togglePanel("editor3dModal");
    setShow3DModal(true);
  };

  const close3DModal = () => {
    if (togglePanel) togglePanel("editor3dModal");
    setShow3DModal(false);
  };

  // Tutorial adımında actionType varsa, ilgili aksiyon gerçekleşince otomatik ilerle
  useEffect(() => {
    const step = tutorialSteps[currentStep];
    if (step.actionType === "drawCircle" && lastShapeCreated === "circle") {
      setTimeout(() => nextStep(), 500);
    }
    if (step.actionType === "openCodePanel" && codePanelOpened) {
      setTimeout(() => nextStep(), 500);
    }
    if (step.actionType === "openPreviewPanel" && previewPanelOpened) {
      setTimeout(() => nextStep(), 500);
    }
    if (step.actionType === "addLayer" && layerAdded) {
      setTimeout(() => nextStep(), 500);
    }
  }, [currentStep, lastShapeCreated, codePanelOpened, previewPanelOpened, layerAdded]);

  // Next butonunu disable et
  const isActionStep = !!tutorialSteps[currentStep].actionType;
  let actionCompleted = true;
  if (tutorialSteps[currentStep].actionType === "drawCircle") actionCompleted = lastShapeCreated === "circle";
  if (tutorialSteps[currentStep].actionType === "openCodePanel") actionCompleted = !!codePanelOpened;
  if (tutorialSteps[currentStep].actionType === "openPreviewPanel") actionCompleted = !!previewPanelOpened;
  if (tutorialSteps[currentStep].actionType === "addLayer") actionCompleted = !!layerAdded;

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
                  Welcome to AuraFX
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
                🎉 Welcome to AuraFX! We're here to help you turn your imagination into code.
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
        {showTutorial && spotlightRect && (
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
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={spotlightRect.x}
                    y={spotlightRect.y}
                    width={spotlightRect.width}
                    height={spotlightRect.height}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="#000000" fillOpacity="0.8" mask="url(#spotlight-mask)" />
            </svg>
            {/* Border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute border-2 border-purple-500/60 rounded-lg pointer-events-none"
              style={{
                top: spotlightRect.y - 4,
                left: spotlightRect.x - 4,
                width: spotlightRect.width + 8,
                height: spotlightRect.height + 8,
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1)",
              }}
            />
            {/* Overlay blocker regions (top, bottom, left, right) */}
            {/* Top */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: spotlightRect.y, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
            {/* Bottom */}
            <div style={{ position: 'absolute', left: 0, top: spotlightRect.y + spotlightRect.height, width: '100%', height: `calc(100vh - ${spotlightRect.y + spotlightRect.height}px)`, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
            {/* Left */}
            <div style={{ position: 'absolute', left: 0, top: spotlightRect.y, width: spotlightRect.x, height: spotlightRect.height, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
            {/* Right */}
            <div style={{ position: 'absolute', left: spotlightRect.x + spotlightRect.width, top: spotlightRect.y, width: `calc(100vw - ${spotlightRect.x + spotlightRect.width}px)`, height: spotlightRect.height, background: 'transparent', pointerEvents: 'auto', zIndex: 9999 }} />
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
              {/* Arrow (sade, siyah) */}
              {tutorialSteps[currentStep].position === "top" && (
                <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-20">
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="0,16 16,0 32,16" fill="#000000" />
                  </svg>
                </div>
              )}

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
                        <TypewriterText text={bubbleTitle} delay={0} speed={150} />
                      </motion.h3>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs text-gray-400"
                      >
                        Step {currentStep + 1} of {tutorialSteps.length}
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
                  <TypewriterText text={bubbleContent} delay={100} speed={120} />
                </motion.div>

                {/* Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex gap-1.5 mb-6"
                >
                  {tutorialSteps.map((_, index) => (
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

                  {currentStepData.id === "discord" ? (
                    <a
                      href={discordUrl}
                      suppressHydrationWarning={true}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                      style={{ textDecoration: 'none' }}
                    >
                      Join Discord
                    </a>
                  ) : (
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
                      disabled={isActionStep && !actionCompleted}
                    >
                      {currentStep === tutorialSteps.length - 1 ? "Complete" : "Next"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {show3DModal && (
        <div data-panel-id="editor3dModal" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-2xl p-8 z-[10000] shadow-xl border border-purple-500">
          <h2 className="text-white text-2xl mb-4">Send Elements to 3D Editor</h2>
          <p className="text-gray-300 mb-6">Select a layer to send its elements to the 3D editor.</p>
          <button onClick={close3DModal} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Close</button>
        </div>
      )}
    </>
  )
}
