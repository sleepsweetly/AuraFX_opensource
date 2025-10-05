"use client"
import { motion } from "framer-motion"
import { Heart, Github, Twitter, Globe } from "lucide-react"

export function Footer() {
  return (
    <motion.footer
      className="fixed bottom-4 right-4 z-40"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.4,
        ease: "easeOut",
        type: "spring",
        stiffness: 200,
        damping: 25
      }}
    >
      <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
        {/* Made with love */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span>by sleepsweety</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-300" />

        {/* Social Links */}
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/sleepsweetly"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="GitHub"
          >
            <Github className="w-3 h-3 text-gray-600" />
          </a>
          <a
            href="https://x.com/sleepsweety_"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="Twitter"
          >
            <Twitter className="w-3 h-3 text-gray-600" />
          </a>
          <a
            href="https://aurafx.online"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="Website"
          >
            <Globe className="w-3 h-3 text-gray-600" />
          </a>
        </div>
      </div>
    </motion.footer>
  )
}