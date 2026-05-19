"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ParticleSelectModalProps {
  currentParticle: string
  onSelectParticle: (particle: string) => void
  onClose: () => void
}

const PARTICLES_URL = "https://raw.githubusercontent.com/Lxlp38/MythicScribe/refs/heads/master/data/mythic/particles.json"

export function ParticleSelectModal({ currentParticle, onSelectParticle, onClose }: ParticleSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newParticle, setNewParticle] = useState("")
  const [fetchedParticles, setFetchedParticles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customParticles, setCustomParticles] = useState<string[]>([])

  // Fetch particles from GitHub on mount
  useEffect(() => {
    async function fetchParticles() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(PARTICLES_URL)
        const data = await res.json()
        // Flatten all unique particle names from the JSON
        const names = new Set<string>()
        Object.values(data).forEach((entry: any) => {
          if (Array.isArray(entry?.name)) {
            entry.name.forEach((n: string) => names.add(n))
          }
        })
        setFetchedParticles(Array.from(names))
      } catch (e) {
        setError("Failed to load particles.")
      } finally {
        setLoading(false)
      }
    }
    fetchParticles()
  }, [])

  // Merge fetched and custom particles
  const allParticles = [...fetchedParticles, ...customParticles]

  // Filter by search
  const filteredParticles = allParticles.filter((particle) =>
    particle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (particle: string) => {
    onSelectParticle(particle)
    onClose()
  }

  const handleAddParticle = () => {
    if (newParticle.trim() && !allParticles.includes(newParticle.trim())) {
      setCustomParticles([...customParticles, newParticle.trim()])
      setNewParticle("")
      setShowAddDialog(false)
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          className="relative w-full max-w-[600px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Particle Selection</h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Choose or create a visual particle effect</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-550 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search particle effects..."
              className="pl-10 bg-slate-50/65 dark:bg-zinc-900/45 border-gray-200/60 dark:border-zinc-800/60 text-slate-800 dark:text-zinc-200 h-10 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/85 transition-all text-xs"
            />
          </div>

          {/* Loading/Error State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-6 h-6 border-2 border-red-550 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Loading particle registry...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10 text-xs font-semibold">{error}</div>
          ) : (
            <div 
              className="h-[260px] rounded-2xl border border-gray-200/40 dark:border-zinc-800/40 overflow-y-auto p-2 space-y-1 scrollbar-hidden"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-2">
                {filteredParticles.map((particle) => {
                  const isSelected = particle === currentParticle
                  return (
                    <motion.div
                      key={particle}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelect(particle)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center min-h-[50px] border select-none ${
                        isSelected
                          ? "bg-slate-900 dark:bg-zinc-100 border-transparent text-white dark:text-zinc-900 shadow-md"
                          : "bg-slate-50/50 dark:bg-zinc-900/25 border-gray-200/30 dark:border-zinc-800/30 hover:border-gray-200 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="font-bold text-xs truncate pr-2">{particle}</span>
                        {isSelected && (
                          <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 bg-red-500 text-white rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                {filteredParticles.length === 0 && (
                  <div className="col-span-2 text-center py-10 text-xs text-slate-450 dark:text-zinc-500 font-semibold select-none">
                    No matching particles found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-150 dark:border-zinc-800/80">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-250 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs rounded-full font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Particle
            </motion.button>
            <span className="text-slate-450 dark:text-zinc-500 text-[10px] font-bold select-none uppercase tracking-wider">
              {filteredParticles.length} registered particles
            </span>
          </div>

          {/* Add Particle Dialog */}
          <AnimatePresence>
            {showAddDialog && (
              <div 
                className="fixed inset-0 z-[1000] bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowAddDialog(false)}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-[360px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-800/50 p-5 rounded-3xl shadow-xl space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-gray-150 dark:border-zinc-850">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">Add Custom Particle</h3>
                    <button 
                      onClick={() => setShowAddDialog(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-450 uppercase tracking-wide">Particle Key</label>
                      <Input
                        value={newParticle}
                        onChange={(e) => setNewParticle(e.target.value)}
                        placeholder="e.g. dragonfire..."
                        className="bg-slate-50/65 dark:bg-zinc-900/45 border-gray-200/60 dark:border-zinc-800/60 text-slate-800 dark:text-zinc-200 h-9 rounded-xl text-xs focus:ring-1 focus:ring-blue-500/20"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddDialog(false)}
                        className="h-8 rounded-full text-slate-600 dark:text-zinc-400 text-xs font-semibold px-3.5"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddParticle}
                        disabled={!newParticle.trim() || allParticles.includes(newParticle.trim())}
                        className="h-8 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 text-xs font-bold px-4"
                      >
                        Add Particle
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
