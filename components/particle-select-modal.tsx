"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ParticleSelectModalProps {
  currentParticle: string
  onSelectParticle: (particle: string) => void
  onClose: () => void
}

const PARTICLES_URL = "https://raw.githubusercontent.com/Lxlp38/MythicScribe/refs/heads/master/data/mythic/particles.json"

export function ParticleSelectModal({ currentParticle, onSelectParticle, onClose }: ParticleSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newParticle, setNewParticle] = useState("")
  const [fetchedParticles, setFetchedParticles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [customParticles, setCustomParticles] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurafx_custom_particles')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setCustomParticles(parsed)
        } catch (e) {
          setCustomParticles([])
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (customParticles.length > 0) {
        localStorage.setItem('aurafx_custom_particles', JSON.stringify(customParticles))
      } else {
        localStorage.removeItem('aurafx_custom_particles')
      }
    }
  }, [customParticles])

  useEffect(() => {
    async function fetchParticles() {
      setLoading(true)
      try {
        const res = await fetch(PARTICLES_URL)
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        const names = new Set<string>()
        Object.values(data).forEach((entry: any) => {
          if (Array.isArray(entry?.name)) {
            entry.name.forEach((n: string) => names.add(n))
          }
        })
        setFetchedParticles(Array.from(names).sort())
      } catch (e) {
        console.error('Failed to load particles')
      } finally {
        setLoading(false)
      }
    }
    fetchParticles()
  }, [])

  const allParticles = [...new Set([...fetchedParticles, ...customParticles])].sort()
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
      setCustomParticles(prev => [...prev, trimmedParticle])
      setNewParticle("")
      setShowAddModal(false)
    }
  }

  const handleRemoveCustomParticle = (particle: string) => {
    setCustomParticles(prev => prev.filter(p => p !== particle))
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Particle Effects</DialogTitle>
          </DialogHeader>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Particle Effects</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {currentParticle ? `Selected: ${currentParticle}` : 'No effect selected'}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-600" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search particles..."
                className="pl-10 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>

          {/* Particles List */}
          <div className="px-5 pb-5">
            <div className="h-[360px] overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-1">
                  {filteredParticles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p className="text-sm">No particles found</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredParticles.map((particle) => {
                        const isCustom = customParticles.includes(particle)
                        const isSelected = particle === currentParticle
                        return (
                          <div
                            key={particle}
                            onClick={() => handleSelect(particle)}
                            className={`group flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-colors ${isSelected
                              ? "bg-gray-900 text-white"
                              : "hover:bg-gray-50 text-gray-900"
                              }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm font-medium truncate">{particle}</span>
                              {isCustom && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${isSelected
                                  ? "bg-gray-800 text-gray-300"
                                  : "bg-gray-100 text-gray-600"
                                  }`}>
                                  custom
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveCustomParticle(particle)
                                  }}
                                  className={`p-1 rounded transition-opacity opacity-0 group-hover:opacity-100 ${isSelected
                                    ? "hover:bg-gray-800 text-white/70"
                                    : "hover:bg-red-50 text-red-500"
                                    }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isSelected && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-9 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Custom
            </Button>
            <span className="text-xs text-gray-500">
              {filteredParticles.length} items
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="w-[420px] bg-white rounded-lg shadow-xl border border-gray-200 p-0" style={{ backgroundColor: '#ffffff' }}>
          <DialogHeader className="sr-only">
            <DialogTitle>Add Custom Particle</DialogTitle>
          </DialogHeader>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add Custom Particle</h3>
              <Button
                onClick={() => {
                  setShowAddModal(false)
                  setNewParticle("")
                }}
                variant="ghost"
                size="sm"
                className="w-7 h-7 p-0 hover:bg-gray-100 rounded"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                value={newParticle}
                onChange={(e) => setNewParticle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddParticle()
                  if (e.key === 'Escape') {
                    setShowAddModal(false)
                    setNewParticle("")
                  }
                }}
                placeholder="Particle name..."
                className="w-full h-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                style={{ backgroundColor: '#ffffff' }}
                autoFocus
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleAddParticle}
                  disabled={!newParticle.trim() || allParticles.includes(newParticle.trim())}
                  className="flex-1 h-9 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm"
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewParticle("")
                  }}
                  variant="outline"
                  className="flex-1 h-9 bg-white border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 rounded-md text-sm"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}