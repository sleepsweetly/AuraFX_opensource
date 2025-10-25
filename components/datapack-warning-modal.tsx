"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"

interface DatapackWarningModalProps {
  isOpen: boolean
  onClose: () => void
  unsupportedFeatures: string[]
  exportFormat?: string
}

export function DatapackWarningModal({ isOpen, onClose, unsupportedFeatures, exportFormat = 'datapack' }: DatapackWarningModalProps) {
  if (!isOpen) return null

  const formatName = exportFormat === 'vanilla' ? 'Vanilla' : 'Datapack'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">Animation Not Supported</h3>
              <p className="text-xs text-gray-600">{formatName} format limitation</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              {formatName} export only supports <span className="font-semibold text-gray-900">static effects</span>. 
              Use <span className="font-semibold text-gray-900">MythicMobs</span> for animations.
            </p>

            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-gray-700">Unsupported:</p>
              <div className="flex flex-wrap gap-1.5">
                {unsupportedFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
