"use client"

import { useState, useEffect, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Heart } from "lucide-react"
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

  const [customParticles, setCustomParticles] = useState<string[]>([])

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#000000] border-zinc-800 z-[99999990]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Particle Selection
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search particles..."
            className="pl-9 bg-[#000000] border-zinc-700 text-white h-9"
          />
        </div>

        {/* Loading/Error State */}
        {loading ? (
          <div className="text-zinc-400 text-center py-4">Loading particles...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-4">{error}</div>
        ) : (
          <ScrollArea 
            className="h-[200px] rounded-md border border-zinc-800 scroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 gap-2 p-2">
              {filteredParticles.map((particle) => (
                <div
                  key={particle}
                  onClick={() => handleSelect(particle)}
                  className={`p-4 rounded-md cursor-pointer transition-colors min-h-[48px] flex items-center ${
                    particle === currentParticle
                      ? "bg-blue-600 text-white"
                      : "bg-[#000000] hover:bg-zinc-700 text-zinc-200"
                  }`}
                  style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold truncate">{particle}</span>
                    {particle === currentParticle && (
                      <Badge variant="secondary" className="bg-blue-500">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
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
          <span className="text-zinc-400 text-sm">
            {filteredParticles.length} particles found
          </span>
        </div>

        {/* Add Particle Dialog */}
        {showAddDialog && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent 
              className="sm:max-w-[425px] bg-[#000000] border-zinc-800"
              style={{ zIndex: 99999999 }}
            >
              <DialogHeader>
                <DialogTitle className="text-white">Add Custom Particle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Particle Name</label>
                  <Input
                    value={newParticle}
                    onChange={(e) => setNewParticle(e.target.value)}
                    placeholder="Enter particle name..."
                    className="bg-[#000000] border-zinc-700 text-white"
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
