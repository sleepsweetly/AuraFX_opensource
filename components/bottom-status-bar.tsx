"use client"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Minus } from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"

interface BottomStatusBarProps {
  onLayersClick?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  zoomLevel?: number
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

// Zoom level variants for when the value changes
const zoomVariants = {
  idle: { scale: 1 },
  change: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3, ease: "easeInOut" as const }
  }
}

export function BottomStatusBar({ onLayersClick, onZoomIn, onZoomOut, zoomLevel = 100 }: BottomStatusBarProps) {
  return (
    <div className="absolute bottom-6 left-6 z-50">
      <motion.div
        className="flex items-center gap-3 bg-white rounded-full shadow-lg px-3 py-2 border border-gray-200"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        transition={{ duration: 0.3 }}
      >
        {/* Layers Button */}
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button
            id="layers-toggle-button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-gray-100 hover:text-gray-900 text-gray-700 rounded-full"
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

        {/* Zoom Controls */}
        <motion.div
          className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1"
          whileHover={{ backgroundColor: "#f5f5f5" }}
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
              className="h-7 w-7 hover:bg-gray-200 hover:text-gray-900 text-gray-700 rounded-full"
              onClick={onZoomOut}
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

          <AnimatePresence mode="wait">
            <motion.span
              key={zoomLevel}
              className="text-sm font-medium w-12 text-center text-gray-700"
              variants={zoomVariants}
              initial="idle"
              animate="change"
              exit="idle"
            >
              {zoomLevel}%
            </motion.span>
          </AnimatePresence>

          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:bg-gray-200 hover:text-gray-900 text-gray-700 rounded-full"
              onClick={onZoomIn}
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