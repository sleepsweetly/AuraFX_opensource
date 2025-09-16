"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consentStatus = localStorage.getItem('cookie_consent')
    if (!consentStatus) {
      setIsVisible(true)
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
    // Tercihi kaydet, böylece tekrar sormayız.
    // Consent state'i 'denied' olarak kalır.
    localStorage.setItem('cookie_consent', 'declined')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed bottom-5 right-5 z-[2000000000] w-full max-w-sm rounded-xl border border-neutral-800 bg-black/70 p-6 shadow-2xl backdrop-blur-lg"
        >
          <h3 className="text-lg font-semibold text-neutral-100">Cookie Consent</h3>
          <p className="mt-2 text-sm text-neutral-300">
            We use cookies to enhance your experience and analyze site traffic. By clicking "Accept", you agree to our use of cookies.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white rounded-md"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-sm font-medium text-black transition-colors bg-white rounded-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CookieConsentBanner 