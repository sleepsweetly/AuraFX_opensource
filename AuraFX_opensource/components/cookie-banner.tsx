"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Cookie, X, Shield, Info } from 'lucide-react'

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    const consentStatus = localStorage.getItem('cookie_consent')
    if (!consentStatus) {
      // Gecikmeli gösterim için
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
    localStorage.setItem('cookie_consent', 'granted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined')
    setIsVisible(false)
  }

  const handleCustomize = () => {
    setIsDetailsOpen(!isDetailsOpen)
  }

  const bannerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      transition: {
        duration: 0.3,
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
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-5 right-5 z-[2000000000] w-full max-w-md"
        >
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden"
            whileHover={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              transition: { duration: 0.2 }
            }}
          >
            {/* Header with cookie icon */}
            <motion.div
              className="flex items-center justify-between p-5 pb-3"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Cookie className="h-6 w-6 text-amber-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900">Cookie Consent</h3>
              </div>
              <motion.button
                onClick={() => setIsVisible(false)}
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
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience and analyze site traffic. By clicking "Accept", you agree to our use of cookies.
              </p>

              <motion.button
                onClick={handleCustomize}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <Info className="h-3 w-3" />
                Learn more about cookies
              </motion.button>
            </motion.div>

            {/* Expandable details section */}
            <AnimatePresence>
              {isDetailsOpen && (
                <motion.div
                  className="px-5 pb-3 overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">How we use cookies</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          We use essential cookies to make our site work. We'd also like to set optional analytics cookies to help us improve it.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <motion.div
              className="flex justify-between gap-3 p-5 pt-3"
              variants={itemVariants}
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-100 relative overflow-hidden group"
              >
                <span className="relative z-10">Decline</span>
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
                onClick={handleAccept}
                className="px-5 py-2 text-sm font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 relative overflow-hidden group"
              >
                <span className="relative z-10">Accept All</span>
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
      )}
    </AnimatePresence>
  )
}

export default CookieConsentBanner