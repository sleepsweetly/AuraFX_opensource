"use client"

import { Button } from "@/components/ui/button"
import { Code, Save, Upload, Hexagon, Layers, Brush, Download, Settings, Palette, Eye, Zap, ZapOff, EyeOff, Pencil, Grid3X3, Sparkles, Github, Star } from "lucide-react"
import { useLayerStore } from "@/store/useLayerStore"
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface HeaderProps {
  onGenerateCode: () => void
  onSave: () => void
  onLoad: () => void
  minimizedPanels: string[]
  onRestorePanel: (panelId: string) => void
  showGridCoordinates?: boolean
  onToggleGridCoordinates?: () => void
  onShowChangelog?: () => void
}

function ProfileModal({ open, onClose, user, onProfileUpdated }: { open: boolean, onClose: () => void, user: any, onProfileUpdated: () => void }) {
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user?.user_metadata?.full_name || "");
    setAvatarUrl(user?.user_metadata?.avatar_url || "");
    setError("");
    setFile(null);
    setPreview("");
  }, [user, open]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.97, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#111] rounded-2xl p-8 w-full max-w-xs sm:max-w-sm relative flex flex-col items-center shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-white text-2xl font-bold hover:opacity-70 transition-opacity">×</button>
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-full overflow-hidden bg-[#222] flex items-center justify-center border-4 border-[#222] shadow-lg cursor-pointer group"
                onClick={handleAvatarClick}
                title="Change avatar"
              >
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow group-hover:scale-110 transition-transform">
                  <Pencil className="w-4 h-4 text-black" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </div>
            {/* Name input */}
            <div className="w-full flex flex-col gap-2 mb-2">
              <label className="text-xs text-zinc-300 font-semibold ml-1">Name</label>
              <div className="relative flex items-center">
                <input
                  className="w-full rounded-lg px-4 py-2 bg-[#191919] text-white border-none focus:outline-none focus:ring-2 focus:ring-white transition-all text-base font-medium pr-10"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{ fontWeight: 500 }}
                  disabled={loading}
                />
                <Pencil className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Error */}
            {error && <div className="text-red-400 text-sm mt-2 text-center w-full">{error}</div>}
            {/* Save button */}
            <button
              onClick={() => onProfileUpdated()}
              disabled={loading}
              className="mt-6 w-full py-3 rounded-lg bg-white text-black font-bold text-base hover:bg-zinc-200 disabled:opacity-60 transition-all shadow"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header({ onGenerateCode, onSave, onLoad, minimizedPanels, onRestorePanel, showGridCoordinates = false, onToggleGridCoordinates }: HeaderProps) {
  const { performanceMode, setPerformanceMode } = useLayerStore()

  // GitHub stars (live)
  const [githubStars, setGithubStars] = useState<number | null>(null)
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch('https://api.github.com/repos/sleepsweetly/AuraFX', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && typeof data.stargazers_count === 'number') {
          setGithubStars(data.stargazers_count)
        }
      } catch {}
    })()
    return () => { isMounted = false }
  }, [])

  const panelIcons: Record<string, React.ReactNode> = {
    layers: <Layers className="w-4 h-4 mr-2" />,
    tools: <Brush className="w-4 h-4 mr-2" />,
    import: <Download className="w-4 h-4 mr-2" />,
    modes: <Settings className="w-4 h-4 mr-2" />,
    settings: <Palette className="w-4 h-4 mr-2" />,
    code: <Code className="w-4 h-4 mr-2" />,

  };

  const panelNames: Record<string, string> = {
    layers: "Layers",
    tools: "Tools", 
    import: "Import",
    modes: "Modes",
    settings: "Type Settings",
    code: "Code",
    preview: "Preview",
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="header-actions relative h-16 w-full flex items-center justify-between px-6 lg:px-8 select-none backdrop-blur-sm"
      style={{ 
        zIndex: 1000,
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'relative'
      }}
    >

      {/* Left Section - Logo & Branding */}
      <motion.div 
        className="flex items-center gap-3 min-w-fit"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="w-8 h-8 text-white"
          whileHover={{ rotate: 180, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Hexagon className="w-full h-full" />
        </motion.div>
        
        <motion.span 
          className="text-xl font-bold text-white tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          AuraFX
        </motion.span>
      </motion.div>

      {/* Center Section - Minimized Panels */}
      <motion.div 
        className="flex items-center gap-2 mx-auto flex-wrap justify-center"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <AnimatePresence>
          {minimizedPanels.map((panel, index) => (
            <motion.button
              key={panel}
              onClick={() => onRestorePanel(panel)}
              className="flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-2 text-sm font-medium border border-white/10 hover:border-white/20 transition-all duration-200"
              title={panelNames[panel] || panel}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {panelIcons[panel]}
              <span className="font-medium">
                {panelNames[panel] || panel}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Right Section - Action Buttons */}
      <motion.div 
        className="flex items-center gap-2 ml-auto"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {/* GitHub Link with Stars */}
        <a
          href="https://github.com/sleepsweetly/AuraFX"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-sm font-medium transition-all duration-200 shadow-lg backdrop-blur-sm"
          title="GitHub Repository"
        >
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline caveat-text">GitHub</span>
          {githubStars !== null && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-xs fuzzy-bubbles-bold">
              <Star className="h-3 w-3 fill-current" />
              {githubStars}
            </span>
          )}
        </a>
        {/* Grid Coordinates & Performance toggles moved into Canvas Quick Settings */}



        {/* Load Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onLoad}
            className="rounded-lg border-white/30 bg-white/15 hover:bg-white/25 text-white hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-white/40 shadow-lg backdrop-blur-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Load</span>
          </Button>
        </motion.div>

        {/* Save Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="rounded-lg border-white/30 bg-white/15 hover:bg-white/25 text-white hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-white/40 shadow-lg backdrop-blur-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Save</span>
          </Button>
        </motion.div>


        {/* Generate Code Button - Primary Action */}
        <motion.button
          onClick={onGenerateCode}
          className="relative rounded-lg bg-white text-black px-6 py-2 text-sm font-semibold transition-all duration-200 hover:bg-white/90 overflow-hidden group"
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.15 }
          }}
          whileTap={{ 
            scale: 0.98,
            transition: { duration: 0.1 }
          }}
        >
          {/* Button content */}
          <div className="relative flex items-center justify-center">
            <Code className="h-4 w-4 mr-2" />
            <span className="hidden md:inline font-semibold">Generate Code</span>
            <span className="md:hidden font-semibold">Code</span>
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"></div>
        </motion.button>
      </motion.div>
    </motion.header>
  )
}