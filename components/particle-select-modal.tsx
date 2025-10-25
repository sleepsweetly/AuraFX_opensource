"use client"

import { useState, useEffect, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Heart, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ParticleSelectModalProps {
  currentParticle: string
  onSelectParticle: (particle: string) => void
  onClose: () => void
}

type ParticleCategory = {
  name: string
  icon: ReactNode
  particles: string[]
}

type ParticleCategories = {
  [key: string]: ParticleCategory
}

const PARTICLES_URL = "https://raw.githubusercontent.com/Lxlp38/MythicScribe/refs/heads/master/data/mythic/particles.json"

export function ParticleSelectModal({ currentParticle, onSelectParticle, onClose }: ParticleSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newParticle, setNewParticle] = useState("")
  const [fetchedParticles, setFetchedParticles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const [customParticles, setCustomParticles] = useState<string[]>(() => {
    // localStorage'dan custom particle'ları yükle
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurafx_custom_particles')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return []
        }
      }
    }
    return []
  })

  // Custom particle'lar değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && customParticles.length > 0) {
      localStorage.setItem('aurafx_custom_particles', JSON.stringify(customParticles))
    }
  }, [customParticles])

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
    const trimmedParticle = newParticle.trim()
    if (trimmedParticle && !allParticles.includes(trimmedParticle)) {
      setCustomParticles([...customParticles, trimmedParticle])
      setNewParticle("")
      setShowAddDialog(false)
      // Eklenen particle'ı otomatik seç
      onSelectParticle(trimmedParticle)
      onClose()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 z-[99999990]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Particle Selection
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search particles..."
            className="pl-9 bg-white border-gray-300 text-gray-900 h-9"
          />
        </div>

        {/* Loading/Error State */}
        {loading ? (
          <div className="text-gray-500 text-center py-4">Loading particles...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : (
          <ScrollArea 
            className="h-[200px] rounded-md border border-gray-200 scroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 gap-2 p-2">
              {filteredParticles.map((particle) => {
                const isCustom = customParticles.includes(particle)
                return (
                  <div
                    key={particle}
                    className={`p-4 rounded-md cursor-pointer transition-colors min-h-[48px] flex items-center ${
                      particle === currentParticle
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                    }`}
                    style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span 
                        className="font-semibold truncate flex-1"
                        onClick={() => handleSelect(particle)}
                      >
                        {particle}
                      </span>
                      <div className="flex items-center gap-2">
                        {isCustom && (
                          <>
                            <Badge variant="outline" className={`text-xs ${
                              particle === currentParticle 
                                ? "border-white text-white" 
                                : "border-purple-500 text-purple-700"
                            }`}>
                              Custom
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setCustomParticles(customParticles.filter(p => p !== particle))
                                // localStorage'dan da sil
                                const updated = customParticles.filter(p => p !== particle)
                                if (typeof window !== 'undefined') {
                                  if (updated.length > 0) {
                                    localStorage.setItem('aurafx_custom_particles', JSON.stringify(updated))
                                  } else {
                                    localStorage.removeItem('aurafx_custom_particles')
                                  }
                                }
                              }}
                              className={`p-1 rounded hover:bg-red-100 transition-colors ${
                                particle === currentParticle ? "text-white hover:bg-red-500" : "text-red-600"
                              }`}
                              title="Remove custom particle"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {particle === currentParticle && (
                          <Badge variant="secondary" className="bg-blue-500 text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Add Custom Particle */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowAddDialog(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Particle
          </Button>
          <span className="text-gray-500 text-sm">
            {filteredParticles.length} particles found
          </span>
        </div>

        {/* Add Particle Dialog */}
        {showAddDialog && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent 
              className="sm:max-w-[425px] bg-white border-gray-200"
              style={{ zIndex: 99999999 }}
            >
              <DialogHeader>
                <DialogTitle className="text-gray-900">Add Custom Particle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Particle Name</label>
                  <Input
                    value={newParticle}
                    onChange={(e) => setNewParticle(e.target.value)}
                    placeholder="Enter particle name..."
                    className="bg-white border-gray-300 text-gray-900"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddParticle}
                    disabled={!newParticle.trim() || allParticles.includes(newParticle.trim())}
                  >
                    Add Particle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
