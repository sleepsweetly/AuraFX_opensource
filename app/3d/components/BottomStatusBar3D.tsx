"use client"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Minus, Box, Eye, EyeOff, Undo2, Redo2, Code2 } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { use3DStore } from "../store/use3DStore"

interface BottomStatusBar3DProps {
  onLayersClick?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onCodeClick?: () => void
  isCodeOpen?: boolean
  zoomLevel?: number
  objectCount?: number
}

// Container variants for the entire status bar
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
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// Button variants for hover and tap effects
const buttonVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: [0, -5, 5, 0] },
  tap: { scale: 0.95 }
}

// Icon variants for rotation effects
const iconVariants = {
  idle: { rotate: 0, scale: 1 },
  hover: { rotate: 15, scale: 1.1 },
  tap: { scale: 0.9 }
}

export function BottomStatusBar3D({ 
  onLayersClick, 
  onZoomIn, 
  onZoomOut, 
  onCodeClick,
  isCodeOpen = false,
  zoomLevel = 100,
  objectCount = 0 
}: BottomStatusBar3DProps) {
  const { xrayMode, setXrayMode, undo, redo, historyIndex, history } = use3DStore()
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <motion.div
        className="flex items-center gap-3 bg-black/90 backdrop-blur-md rounded-full shadow-lg px-3 py-2 border border-white/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" }}
        transition={{ duration: 0.3 }}
      >
        {/* 3D Layers Button */}
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button
            id="3d-layers-toggle-button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/10 text-white/80 hover:text-white rounded-full"
            onClick={onLayersClick}
          >
            <motion.div
              variants={iconVariants}
              animate="idle"
              whileHover="hover"
              whileTap="tap"
            >
              <Layers className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded-full px-1 py-1">
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Button
              size="icon"
              variant="ghost"
              className={`h-7 w-7 rounded-full transition-all duration-200 ${
                canUndo
                  ? "hover:bg-white/10 text-white/80 hover:text-white"
                  : "text-white/20 cursor-not-allowed"
              }`}
              onClick={() => canUndo && undo()}
              title="Undo (Ctrl+Z)"
              disabled={!canUndo}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
          </motion.div>

          {/* Step counter */}
          <span className="text-xs text-white/40 px-1 tabular-nums">
            {historyIndex}/{Math.max(0, history.length - 1)}
          </span>

          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Button
              size="icon"
              variant="ghost"
              className={`h-7 w-7 rounded-full transition-all duration-200 ${
                canRedo
                  ? "hover:bg-white/10 text-white/80 hover:text-white"
                  : "text-white/20 cursor-not-allowed"
              }`}
              onClick={() => canRedo && redo()}
              title="Redo (Ctrl+Y)"
              disabled={!canRedo}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>

        {/* X-Ray Mode Toggle */}
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 rounded-full transition-all duration-200 ${
              xrayMode 
                ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" 
                : "hover:bg-white/10 text-white/60 hover:text-white"
            }`}
            onClick={() => setXrayMode(!xrayMode)}
            title={`X-Ray Mode: ${xrayMode ? "ON" : "OFF"} (Alt+Z)`}
          >
            <motion.div
              variants={iconVariants}
              animate="idle"
              whileHover="hover"
              whileTap="tap"
            >
              {xrayMode ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </motion.div>
          </Button>
        </motion.div>

        {/* Code Panel Button */}
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 rounded-full transition-all duration-200 ${
              isCodeOpen
                ? "bg-white/20 text-white"
                : "hover:bg-white/10 text-white/60 hover:text-white"
            }`}
            onClick={onCodeClick}
            title="Code Preview"
          >
            <motion.div
              variants={iconVariants}
              animate="idle"
              whileHover="hover"
              whileTap="tap"
            >
              <Code2 className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Object Count */}
        <motion.div
          className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1"
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <Box className="h-3 w-3 text-white/60" />
          <span className="text-sm font-medium text-white/80">
            {objectCount} objects
          </span>
        </motion.div>

        {/* Zoom Controls */}
        <motion.div
          className="flex items-center gap-1 bg-white/5 rounded-full px-1 py-1"
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:bg-white/10 text-white/60 hover:text-white rounded-full"
              onClick={onZoomOut}
              title="Zoom Out"
            >
              <motion.div
                variants={iconVariants}
                animate="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <Minus className="h-3.5 w-3.5" />
              </motion.div>
            </Button>
          </motion.div>



          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:bg-white/10 text-white/60 hover:text-white rounded-full"
              onClick={onZoomIn}
              title="Zoom In"
            >
              <motion.div
                variants={iconVariants}
                animate="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <Plus className="h-3.5 w-3.5" />
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
