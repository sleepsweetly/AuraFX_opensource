"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, ExternalLink, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Announcement {
  id: string
  type: string
  title: string
  message: string
  version: string
  date?: string
  link?: string
}

interface AnnouncementsPanelProps {
  announcements: Announcement[]
  onClose: () => void
}

const ANNOUNCEMENT_TYPES = {
  info: {
    icon: Info,
    color: "#60A5FA",
    bgGradient: "from-blue-500/10 to-blue-600/5",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/20",
  },
  success: {
    icon: CheckCircle,
    color: "#34D399",
    bgGradient: "from-green-500/10 to-green-600/5",
    borderColor: "border-green-500/30",
    glowColor: "shadow-green-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "#FBBF24",
    bgGradient: "from-yellow-500/10 to-orange-600/5",
    borderColor: "border-yellow-500/30",
    glowColor: "shadow-yellow-500/20",
  },
  error: {
    icon: AlertCircle,
    color: "#F87171",
    bgGradient: "from-red-500/10 to-red-600/5",
    borderColor: "border-red-500/30",
    glowColor: "shadow-red-500/20",
  },
  maintenance: {
    icon: Bell,
    color: "#A78BFA",
    bgGradient: "from-purple-500/10 to-purple-600/5",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/20",
  },
  update: {
    icon: Bell,
    color: "#22D3EE",
    bgGradient: "from-cyan-500/10 to-cyan-600/5",
    borderColor: "border-cyan-500/30",
    glowColor: "shadow-cyan-500/20",
  },
  security: {
    icon: AlertCircle,
    color: "#EF4444",
    bgGradient: "from-red-500/10 to-red-600/5",
    borderColor: "border-red-500/30",
    glowColor: "shadow-red-500/20",
  },
  feature: {
    icon: Bell,
    color: "#FB923C",
    bgGradient: "from-orange-500/10 to-orange-600/5",
    borderColor: "border-orange-500/30",
    glowColor: "shadow-orange-500/20",
  },
}

export function AnnouncementsPanel({ announcements, onClose }: Omit<AnnouncementsPanelProps, 'onDismiss'>) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    // 500ms sonra gerçek close işlemini yap
    setTimeout(() => {
      onClose()
    }, 500)
  }

  const visibleAnnouncements = announcements;

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0, scale: 0.95 }}
      animate={{
        x: isClosing ? "-100%" : 0,
        opacity: isClosing ? 0 : 1,
        scale: isClosing ? 0.95 : 1,
        rotateY: isClosing ? -15 : 0,
      }}
      exit={{ x: "-100%", opacity: 0, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        opacity: { duration: isClosing ? 0.3 : 0.3 },
        scale: { duration: isClosing ? 0.4 : 0.3 },
        rotateY: { duration: isClosing ? 0.4 : 0.3 },
      }}
      className="fixed top-[64px] left-0 h-[calc(100vh-64px)] w-96 z-[10000000] bg-black border-r border-zinc-800/60 flex flex-col shadow-2xl backdrop-blur-md"
      style={{ background: "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)" }}
    >
      {/* Header with enhanced animations */}
      <motion.div
        className="relative flex items-center justify-between p-6 border-b border-gray-800/50 flex-shrink-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: isClosing ? -20 : 0,
          opacity: isClosing ? 0 : 1,
          scale: isClosing ? 0.9 : 1,
        }}
        transition={{ delay: isClosing ? 0 : 0.1 }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-t-lg"
          animate={{
            background: [
              "linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))",
              "linear-gradient(to right, rgba(168, 85, 247, 0.05), rgba(99, 102, 241, 0.05))",
            ],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <div className="relative flex items-center gap-3">
          <motion.div
            className="relative"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            <Bell className="w-6 h-6 text-indigo-400" />
            {visibleAnnouncements.length > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>

          <motion.h2
            className="text-xl font-bold text-white"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Announcements
          </motion.h2>

          {visibleAnnouncements.length > 0 && (
            <motion.span
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
            >
              {visibleAnnouncements.length}
            </motion.span>
          )}
        </div>

        <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="relative text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
          >
            <motion.div animate={{ rotate: isClosing ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <X className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Content with stagger animations */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <motion.div
          animate={{
            opacity: isClosing ? 0 : 1,
            y: isClosing ? 20 : 0,
            scale: isClosing ? 0.95 : 1,
          }}
          transition={{ duration: 0.3, delay: isClosing ? 0.1 : 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {visibleAnnouncements.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <motion.div
                  className="relative mb-6"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <Bell className="relative w-16 h-16 text-gray-600" />
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-gray-300 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  No New Announcements
                </motion.h3>
                <motion.p
                  className="text-sm text-gray-500 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  You're all caught up! Check back later for updates.
                </motion.p>
              </motion.div>
            ) : (
              <motion.div className="space-y-4" layout>
                <AnimatePresence mode="popLayout">
                  {visibleAnnouncements.map((announcement, index) => {
                    const typeConfig =
                      ANNOUNCEMENT_TYPES[announcement.type as keyof typeof ANNOUNCEMENT_TYPES] ||
                      ANNOUNCEMENT_TYPES.info
                    const IconComponent = typeConfig.icon
                    const isHovered = hoveredId === announcement.id

                    return (
                      <motion.div
                        key={announcement.id}
                        layout
                        layoutId={announcement.id}
                        initial={{ opacity: 0, x: -100, scale: 0.8 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: 1,
                          rotateY: 0,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          opacity: 0,
                          x: 150,
                          scale: 0.7,
                          rotateY: 25,
                          filter: "blur(4px)",
                          transition: { duration: 0.4, ease: "easeInOut" },
                        }}
                        transition={{
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          layout: { duration: 0.3 },
                        }}
                        whileHover={{
                          scale: 1.02,
                          y: -3,
                          transition: { duration: 0.2 },
                        }}
                        onHoverStart={() => setHoveredId(announcement.id)}
                        onHoverEnd={() => setHoveredId(null)}
                        className={`relative p-5 rounded-xl border bg-gradient-to-br ${typeConfig.bgGradient} ${typeConfig.borderColor} group hover:shadow-lg ${typeConfig.glowColor} transition-all duration-300 backdrop-blur-sm cursor-pointer overflow-hidden`}
                      >
                        {/* Animated background glow */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${typeConfig.bgGradient} rounded-xl`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isHovered ? 0.3 : 0 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Sliding highlight effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: isHovered ? "100%" : "-100%" }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />

                        {/* Header with icon animation */}
                        <div className="relative flex items-start gap-3 mb-3">
                          <motion.div
                            className="relative"
                            animate={{
                              rotate: isHovered ? [0, 360] : 0,
                              scale: isHovered ? 1.1 : 1,
                            }}
                            transition={{
                              rotate: { duration: 0.8, ease: "easeInOut" },
                              scale: { duration: 0.2 },
                            }}
                          >
                            <motion.div
                              className={`absolute inset-0 rounded-full blur-sm`}
                              style={{ backgroundColor: typeConfig.color }}
                              animate={{
                                scale: isHovered ? [1, 1.4, 1] : 1,
                                opacity: isHovered ? [0.5, 0.9, 0.5] : 0.5,
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                                ease: "easeInOut",
                              }}
                            />
                            <IconComponent
                              className="relative w-5 h-5 mt-0.5 flex-shrink-0"
                              style={{ color: typeConfig.color }}
                            />
                          </motion.div>

                          <div className="flex-1 min-w-0 pr-8">
                            <motion.h3
                              className="font-semibold text-white text-sm leading-tight"
                              animate={{ x: isHovered ? 2 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {announcement.title}
                            </motion.h3>
                            {announcement.date && (
                              <motion.p
                                className="text-xs text-gray-400 mt-1"
                                animate={{ opacity: isHovered ? 0.8 : 0.6 }}
                              >
                                {new Date(announcement.date).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* Message with typing effect */}
                        <motion.p
                          className="relative text-sm text-gray-300 leading-relaxed mb-4 pl-8"
                          animate={{ opacity: isHovered ? 1 : 0.9 }}
                        >
                          {announcement.message}
                        </motion.p>

                        {/* Footer with enhanced animations */}
                        <div className="relative flex items-center justify-between pl-8">
                          <motion.span
                            className="text-xs text-gray-500 bg-gray-800/30 px-2 py-1 rounded-full"
                            whileHover={{ scale: 1.05 }}
                          >
                            v{announcement.version}
                          </motion.span>

                          {announcement.link && (
                            <motion.a
                              href={announcement.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05, x: 3 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-all duration-200 bg-gray-800/30 hover:bg-gray-700/50 px-3 py-1.5 rounded-full"
                            >
                              Learn More
                              <motion.div animate={{ x: isHovered ? 2 : 0 }} transition={{ duration: 0.2 }}>
                                <ExternalLink className="w-3 h-3" />
                              </motion.div>
                            </motion.a>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer with wave animation */}
      <motion.div
        className="relative p-5 border-t border-gray-800/50 flex-shrink-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/30"
          animate={{
            background: [
              "linear-gradient(to right, rgba(17, 24, 39, 0.5), rgba(31, 41, 55, 0.3))",
              "linear-gradient(to right, rgba(31, 41, 55, 0.3), rgba(17, 24, 39, 0.5))",
            ],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />
        <p className="relative text-xs text-gray-500 text-center">Stay updated with the latest features and news.</p>
      </motion.div>

      {/* Enhanced scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(99, 102, 241, 0.7), rgba(168, 85, 247, 0.7));
        }
      `}</style>
    </motion.div>
  )
}
