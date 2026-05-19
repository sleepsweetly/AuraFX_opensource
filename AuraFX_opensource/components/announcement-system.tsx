"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Wrench, Bell, Shield, Sparkles, Clock, ExternalLink } from "lucide-react"

const ANNOUNCEMENT_TYPES = {
  info: { icon: Info, color: "#3B82F6", label: "Information" },
  success: { icon: CheckCircle, color: "#10B981", label: "Success" },
  warning: { icon: AlertTriangle, color: "#F59E0B", label: "Warning" },
  error: { icon: AlertCircle, color: "#EF4444", label: "Error" },
  maintenance: { icon: Wrench, color: "#8B5CF6", label: "Maintenance" },
  update: { icon: Bell, color: "#06B6D4", label: "Update" },
  security: { icon: Shield, color: "#DC2626", label: "Security" },
  feature: { icon: Sparkles, color: "#F97316", label: "New Feature" },
  loading: { icon: Clock, color: "#6B7280", label: "Loading" },
}

interface AnnouncementToast {
  id: string
  title: string
  message: string
  type: keyof typeof ANNOUNCEMENT_TYPES
  timestamp: number
  image?: string
  link?: string
}

export function AnnouncementSystem() {
  const [announcementToasts, setAnnouncementToasts] = useState<AnnouncementToast[]>([])
  const [progress, setProgress] = useState<{ [key: string]: number }>({})

  // GitHub'dan duyuruları çek
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/sleepsweetly/AuraFX-Launcher-Apps/refs/heads/main/announcements.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements && Array.isArray(data.announcements)) {
          const newToasts = data.announcements.map((announcement: any) => ({
            id: `announcement-${Date.now()}-${Math.random()}`,
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            timestamp: Date.now(),
            image: announcement.image,
            link: announcement.link,
          }))

          setAnnouncementToasts(newToasts)

          // 8 saniye sonra otomatik kaldır
          setTimeout(() => {
            setAnnouncementToasts([])
          }, 8000)
        }
      })
      .catch(() => { })
  }, [])

  // İlerleme çubuğu animasyonu
  useEffect(() => {
    const intervals: { [key: string]: NodeJS.Timeout } = {}

    announcementToasts.forEach((toast) => {
      const duration = 8000
      const intervalTime = 50
      const decrement = (100 / duration) * intervalTime

      intervals[toast.id] = setInterval(() => {
        setProgress((prev) => {
          const newProgress = { ...prev }
          if (newProgress[toast.id] === undefined) {
            newProgress[toast.id] = 100
          }

          newProgress[toast.id] -= decrement

          if (newProgress[toast.id] <= 0) {
            clearInterval(intervals[toast.id])
            delete intervals[toast.id]
            setAnnouncementToasts((prev) => prev.filter(t => t.id !== toast.id))
          }

          return newProgress
        })
      }, intervalTime)
    })

    return () => {
      Object.values(intervals).forEach(clearInterval)
    }
  }, [announcementToasts])

  // Animasyon varyantları
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }

  const toastVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -100,
      scale: 0.8,
      rotateX: -15,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateX: 15,
      filter: "blur(10px)",
      y: -100,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  }

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {announcementToasts.map((announcementToast, index) => {
          const announcementType = ANNOUNCEMENT_TYPES[announcementToast.type]

          return (
            <motion.div
              key={announcementToast.id}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              className="relative bg-white/95 backdrop-blur-md border rounded-2xl p-6 min-w-[480px] max-w-[580px] shadow-2xl pointer-events-auto overflow-hidden"
              style={{
                borderColor: `${announcementType.color}30`,
                boxShadow: `0 10px 25px -5px ${announcementType.color}20, 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
              }}
            >
              {/* Arka plan desen */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-3xl" style={{ backgroundColor: announcementType.color }} />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full filter blur-2xl" style={{ backgroundColor: announcementType.color }} />
              </div>

              <div className="relative flex items-start space-x-4">
                {/* Modern Icon Container */}
                <motion.div
                  className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: `${announcementType.color}20` }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: index * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                >
                  {announcementToast.image ? (
                    <img
                      src={announcementToast.image}
                      alt="Announcement"
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center ${announcementToast.image ? 'hidden' : ''}`}
                  >
                    <announcementType.icon className="w-8 h-8" style={{ color: announcementType.color }} />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.h4
                      className="text-base font-bold text-gray-900"
                      variants={itemVariants}
                    >
                      {announcementToast.title}
                    </motion.h4>
                    <motion.span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${announcementType.color}20`,
                        color: announcementType.color
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {announcementType.label}
                    </motion.span>
                  </div>
                  <motion.p
                    className="text-sm text-gray-600 leading-relaxed"
                    variants={itemVariants}
                  >
                    {announcementToast.message}
                  </motion.p>
                  {announcementToast.link && (
                    <motion.a
                      href={announcementToast.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm mt-2 font-medium"
                      style={{ color: announcementType.color }}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      Learn more
                      <ExternalLink className="w-3 h-3" />
                    </motion.a>
                  )}
                </div>

                {/* Modern Close Button */}
                <motion.button
                  onClick={() => {
                    setAnnouncementToasts(prev => prev.filter(t => t.id !== announcementToast.id))
                  }}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
                  whileHover={{
                    scale: 1.1,
                    rotate: 90
                  }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: announcementType.color }}
                  initial={{ width: "100%" }}
                  animate={{ width: `${progress[announcementToast.id] || 100}%` }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
              </div>

              {/* Hover efekti için parlaklık */}
              <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}