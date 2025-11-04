"use client"

import { useState, useEffect } from "react"

import { shapeLibrary } from "@/lib/shape-library"
import { 
  Square, Circle, Triangle, Minus, Eraser, Settings, X, Check,
  Star, Heart, ArrowRight, Zap, Diamond, Hexagon, 
  Plus, Moon, Flower, Sparkles, Shapes, Gem
} from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"



interface ToolbarCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedTools: string[]) => void
  currentTools: string[]
}

// Özel ikon komponenti - sadece Lucide ikonları
export const ShapeIcon = ({ shapeId, className = "h-5 w-5" }: { shapeId: string, className?: string }) => {
  const iconMap: Record<string, React.ReactElement> = {
    // Varsayılan araçlar
    square: <Square className={className} />,
    circle: <Circle className={className} />,
    triangle: <Triangle className={className} />,
    line: <Minus className={className} />,
    eraser: <Eraser className={className} />,
    
    // Şekil kütüphanesi - Daha iyi Lucide ikonları
    star: <Star className={className} />,
    heart: <Heart className={className} />,
    arrow: <ArrowRight className={className} />,
    lightning: <Zap className={className} />,
    diamond: <Diamond className={className} />,
    hexagon: <Hexagon className={className} />,
    pentagon: <Gem className={className} />,
    octagon: <Shapes className={className} />,
    cross: <Plus className={`${className} rotate-45`} />,
    moon: <Moon className={className} />,
    flower: <Flower className={className} />,
    butterfly: <Sparkles className={className} />,
  }
  
  return iconMap[shapeId] || <Star className={className} />
}

// Varsayılan araçlar
const defaultTools = [
  { id: 'eraser', name: 'Eraser', isDefault: true },
  { id: 'square', name: 'Square', isDefault: true },
  { id: 'circle', name: 'Circle', isDefault: true },
  { id: 'triangle', name: 'Triangle', isDefault: true },
  { id: 'line', name: 'Line', isDefault: true },
]

// Şekil kütüphanesinden araçlar (varsayılan araçlarla çakışmayanlar)
const shapeTools = shapeLibrary
  .filter(shape => !defaultTools.some(tool => tool.id === shape.id))
  .map(shape => ({
    id: shape.id,
    name: shape.name,
    isDefault: false
  }))

// Tüm mevcut araçlar (varsayılan + benzersiz şekiller)
const allTools = [...defaultTools, ...shapeTools]

export function ToolbarCustomizationModal({ isOpen, onClose, onSave, currentTools }: ToolbarCustomizationModalProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const MAX_TOOLS = 5
  const TOOLS_PER_PAGE = 8 // Her sayfada 8 araç (4x2 grid)

  // Modal açıldığında mevcut araçları yükle
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0) // Sayfa sıfırla
      if (currentTools.length > 0) {
        setSelectedTools(currentTools.slice(0, MAX_TOOLS))
      } else {
        // Varsayılan 4 araç
        setSelectedTools(['eraser', 'square', 'circle', 'triangle'])
      }
    }
  }, [isOpen, currentTools])

  const handleToolToggle = (toolId: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        // Aracı kaldır
        return prev.filter(id => id !== toolId)
      } else {
        // Araç ekle (maksimum 5 tane)
        if (prev.length < MAX_TOOLS) {
          return [...prev, toolId]
        }
        return prev
      }
    })
  }

  const handleSave = () => {
    onSave(selectedTools)
    onClose()
  }

  const handleReset = () => {
    setSelectedTools(['eraser', 'square', 'circle', 'triangle'])
  }

  // Pagination hesaplamaları
  const totalPages = Math.ceil(allTools.length / TOOLS_PER_PAGE)
  const startIndex = currentPage * TOOLS_PER_PAGE
  const endIndex = startIndex + TOOLS_PER_PAGE
  const currentPageTools = allTools.slice(startIndex, endIndex)

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const bannerVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeIn" as const
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  }

  const buttonVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  return (
    <>
      {/* Backdrop - Animasyonlu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[2000000000] bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Modal Content - AnimatePresence içinde */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[2000000001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={bannerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md pointer-events-auto"
            >
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden"
            whileHover={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              transition: { duration: 0.2 }
            }}
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-5 pb-3"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Settings className="h-6 w-6 text-blue-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900">Customize Toolbar</h3>
              </div>
              <motion.button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-4 w-4 text-gray-500" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <motion.div
              className="px-5 pb-3"
              variants={itemVariants}
            >
              <p className="text-sm text-gray-600 mb-4">
                Select up to {MAX_TOOLS} tools for your toolbar. Click to add or remove tools.
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-blue-600">
                  {selectedTools.length}/{MAX_TOOLS} tools selected
                </div>
                <div className="text-xs text-gray-500">
                  Page {currentPage + 1} of {totalPages}
                </div>
              </div>

              {/* Tool Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4 min-h-[200px]">
                {currentPageTools.map((tool) => {
                  const isSelected = selectedTools.includes(tool.id)
                  const canSelect = selectedTools.length < MAX_TOOLS || isSelected

                  return (
                    <motion.button
                      key={tool.id}
                      onClick={() => canSelect && handleToolToggle(tool.id)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : canSelect 
                            ? 'border-gray-200 bg-white hover:border-gray-300 text-gray-700' 
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }
                      `}
                      disabled={!canSelect}
                      whileHover={canSelect ? { scale: 1.02 } : {}}
                      whileTap={canSelect ? { scale: 0.98 } : {}}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center">
                          <ShapeIcon shapeId={tool.id} />
                        </div>
                        <span className="text-xs font-medium">{tool.name}</span>
                      </div>
                      
                      {/* Selected indicator */}
                      {isSelected && (
                        <motion.div
                          className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <motion.button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  whileHover={currentPage > 0 ? { scale: 1.05 } : {}}
                  whileTap={currentPage > 0 ? { scale: 0.95 } : {}}
                >
                  ←
                </motion.button>
                
                {/* Page indicators */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-6 h-6 rounded-full text-xs transition-colors ${
                        i === currentPage 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {i + 1}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === totalPages - 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  whileHover={currentPage < totalPages - 1 ? { scale: 1.05 } : {}}
                  whileTap={currentPage < totalPages - 1 ? { scale: 0.95 } : {}}
                >
                  →
                </motion.button>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex justify-between gap-3 p-5 pt-3"
              variants={itemVariants}
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-100 relative overflow-hidden group"
              >
                <span className="relative z-10">Reset</span>
                <motion.div
                  className="absolute inset-0 bg-gray-200 z-0"
                  initial={{ width: "0%" }}
                  animate={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>

              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleSave}
                className="px-5 py-2 text-sm font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 relative overflow-hidden group"
              >
                <span className="relative z-10">Save Changes</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 z-0"
                  initial={{ width: "0%" }}
                  animate={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}