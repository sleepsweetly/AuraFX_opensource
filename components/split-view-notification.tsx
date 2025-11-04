"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SplitSquareHorizontal, Eye, Square } from "lucide-react"

interface SplitViewNotificationProps {
  isVisible: boolean
  onHide: () => void
  viewType?: "side" | "top"
}

export function SplitViewNotification({ isVisible, onHide, viewType }: SplitViewNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide()
      }, 3000) // 3 saniye sonra otomatik kapat

      return () => clearTimeout(timer)
    }
  }, [isVisible, onHide])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20
          }}
        >
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-8 py-6 max-w-md mx-auto">
            <div className="text-center">
              {/* Animated Icon */}
              <motion.div
                className="mx-auto mb-4 p-4 bg-gray-100 rounded-2xl w-fit"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 1 
                }}
              >
                {viewType === "side" ? (
                  <Square className="h-8 w-8 text-gray-800" />
                ) : viewType === "top" ? (
                  <Eye className="h-8 w-8 text-gray-800" />
                ) : (
                  <SplitSquareHorizontal className="h-8 w-8 text-gray-800" />
                )}
              </motion.div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="font-bold text-black text-xl mb-2">
                  {viewType === "side" ? "Side View" : viewType === "top" ? "Top View" : "Split View Enabled"}
                </h3>
                <p className="text-gray-700 text-sm">
                  {viewType === "side" 
                    ? "Viewing from the side perspective" 
                    : viewType === "top" 
                    ? "Viewing from the top perspective" 
                    : "Split view is now active"}
                </p>
              </div>

              {/* Progress Bar */}
              <motion.div
                className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="h-full bg-black rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}