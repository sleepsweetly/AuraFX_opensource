"use client"

import { Eye, Square, MoveDiagonal, Axis3D, EyeOff, ChevronDown, SplitSquareHorizontal } from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/toast-system"

interface TopCenterToolbarProps {
  viewMode?: "top" | "side" | "diagonal" | "isometric" | "front"
  setViewMode?: (mode: "top" | "side" | "diagonal" | "isometric" | "front") => void
  modes?: any
  isRecording?: boolean
  onToggleRecording?: () => void
  splitViewEnabled?: boolean
  onToggleSplitView?: () => void
}

const VIEW_MODES = {
  top: { icon: Eye, label: "Top" },
  side: { icon: Square, label: "Side" },
  diagonal: { icon: MoveDiagonal, label: "Diagonal" },
  isometric: { icon: Axis3D, label: "Isometric" },
  front: { icon: EyeOff, label: "Front" },
}

// Ana container için varyantlar
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// REC butonu ve ayırıcıyı içeren grup için varyantlar
const recGroupVariants: Variants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: "auto",
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1, // Önce buton, sonra ayırıcı kaybolsun
    },
  },
}

// Ayırıcı çizgi için varyantlar
const separatorVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scaleX: 0, transition: { duration: 0.2, delay: 0.1 } },
}

// REC butonu için özel varyantlar
const recButtonVariants: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  exit: {
    opacity: 0,
    x: 20, // Sağa doğru kayarak yok ol
    scale: 0.7, // Küçülerek yok ol
    transition: { duration: 0.3, ease: "easeInOut" },
  },
}

// Diğer animasyonlar için varyantlar
const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
}

const dropdownItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

export function TopCenterToolbar({ viewMode = "top", setViewMode, modes, isRecording, onToggleRecording, splitViewEnabled = false, onToggleSplitView }: TopCenterToolbarProps) {
  const { toast } = useToast()

  const handleViewModeChange = (mode: "top" | "side" | "diagonal" | "isometric" | "front") => {
    if (mode === "diagonal" || mode === "isometric" || mode === "front") {
      toast({
        title: "Feature Temporarily Disabled 🔧",
        description: `The ${VIEW_MODES[mode].label} view mode is temporarily disabled.`,
        duration: 4000,
      })
      return
    }
    setViewMode?.(mode)
  }

  const CurrentViewIcon = VIEW_MODES[viewMode].icon
  const isRecButtonVisible = modes?.chainMode || modes?.actionRecordingMode

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
      <motion.div
        className="flex items-center gap-1 bg-white rounded-full px-3 py-2 shadow-lg border border-gray-200"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout
        layoutId="top-toolbar" // Layout animasyonu için benzersiz ID
        transition={{
          layout: { type: "spring", stiffness: 500, damping: 30 },
        }}
      >
        {/* View Mode Selector */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button variant="ghost" size="sm" className="h-8 gap-1 hover:bg-gray-100 hover:text-gray-900 text-gray-700">
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CurrentViewIcon className="h-4 w-4" />
                </motion.div>
                <span className="text-xs">{VIEW_MODES[viewMode].label}</span>
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.div>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="bg-white border border-gray-200 z-50 shadow-lg" sideOffset={8} asChild>
            <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
              {Object.entries(VIEW_MODES).map(([mode, config]) => {
                const Icon = config.icon
                const isActive = viewMode === mode
                const isDisabled = mode === "diagonal" || mode === "isometric" || mode === "front"

                return (
                  <motion.div key={mode} variants={dropdownItemVariants} whileHover={{ scale: 1.02, x: 5 }}>
                    <DropdownMenuItem
                      className={`text-black flex items-center gap-2 ${isActive ? 'bg-gray-100' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                      onClick={() => handleViewModeChange(mode as any)}
                    >
                      <motion.div animate={{ rotate: isActive ? 360 : 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      {config.label}
                      {isActive && (
                        <motion.span className="ml-auto text-xs text-gray-500" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          ✓
                        </motion.span>
                      )}
                    </DropdownMenuItem>
                  </motion.div>
                )
              })}
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Split View Button */}
        <motion.div
          variants={separatorVariants}
          className="h-4 w-px bg-gray-300 mx-1"
          style={{ transformOrigin: 'center' }}
        />
        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSplitView}
            className={`h-8 gap-1 transition-colors ${splitViewEnabled ? 'text-purple-600 hover:bg-purple-50 hover:text-purple-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
            title="Toggle Split View (Side + Top)"
          >
            <motion.div
              animate={{ rotate: splitViewEnabled ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <SplitSquareHorizontal className="h-4 w-4" />
            </motion.div>
            <span className="text-xs">Split</span>
          </Button>
        </motion.div>

        {/* REC Butonu ve Ayırıcı - Gelişmiş Animasyon */}
        <AnimatePresence mode="wait">
          {isRecButtonVisible && (
            <motion.div
              className="flex items-center"
              variants={recGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                variants={separatorVariants}
                className="h-4 w-px bg-gray-300 mx-1"
                style={{ transformOrigin: 'center' }}
              />
              <motion.div variants={recButtonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleRecording}
                  className={`h-8 gap-1 transition-colors ${isRecording ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  {isRecording ? (
                    <motion.div
                      className="w-3 h-3 bg-red-500 rounded-sm"
                      animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : (
                    <motion.div className="w-3 h-3 bg-red-500 rounded-full" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} />
                  )}
                  <motion.span
                    className="text-xs"
                    animate={{ opacity: isRecording ? [1, 0.7, 1] : 1 }}
                    transition={{ duration: 0.8, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
                  >
                    {isRecording ? 'STOP' : 'REC'}
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}