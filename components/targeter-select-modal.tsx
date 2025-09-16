import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Crosshair } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface TargeterSelectModalProps {
  currentTargeter: string
  onSelectTargeter: (targeter: string) => void
  onClose: () => void
}

const TARGETER_URLS = [
  "https://raw.githubusercontent.com/Lxlp38/MythicScribe/refs/heads/master/data/targeters/ModelEngine.json",
  "https://raw.githubusercontent.com/Lxlp38/MythicScribe/refs/heads/master/data/targeters/MythicCrucible.json",
  "https://raw.githubusercontent.com/Lxlp38/MythicScribe/refs/heads/master/data/targeters/MythicMobs.json"
]

export function TargeterSelectModal({ currentTargeter, onSelectTargeter, onClose }: TargeterSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTargeter, setNewTargeter] = useState("")
  const [fetchedTargeters, setFetchedTargeters] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTargeters() {
      setLoading(true)
      setError(null)
      try {
        let all: string[] = []
        for (const url of TARGETER_URLS) {
          const res = await fetch(url)
          const data = await res.json()
          // Her obje için name alanını al, array ise tümünü ekle, string ise ekle
          data.forEach((t: any) => {
            if (Array.isArray(t.name)) {
              t.name.forEach((n: any) => { if (typeof n === 'string') all.push(n) })
            } else if (typeof t.name === 'string') {
              all.push(t.name)
            }
          })
        }
        // Tekilleştir
        setFetchedTargeters(Array.from(new Set(all)))
      } catch (e) {
        setError("Failed to load targeters.")
      } finally {
        setLoading(false)
      }
    }
    fetchTargeters()
  }, [])

  const [customTargeters, setCustomTargeters] = useState<string[]>([])
  const allTargeters = [...fetchedTargeters, ...customTargeters]
  const filteredTargeters = allTargeters.filter((targeter) =>
    targeter.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (targeter: string) => {
    onSelectTargeter(targeter)
    onClose()
  }

  const handleAddTargeter = () => {
    if (newTargeter.trim() && !allTargeters.includes(newTargeter.trim())) {
      setCustomTargeters([...customTargeters, newTargeter.trim()])
      setNewTargeter("")
      setShowAddDialog(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#000000] border-zinc-800 z-[99999990]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5" />
            Targeter Selection
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search targeters..."
            className="pl-9 bg-[#000000] border-zinc-700 text-white h-9"
          />
        </div>
        {loading ? (
          <div className="text-zinc-400 text-center py-4">Loading targeters...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-4">{error}</div>
        ) : (
          <ScrollArea 
            className="h-[200px] rounded-md border border-zinc-800 scroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 gap-2 p-2">
              {filteredTargeters.map((targeter) => (
                <div
                  key={targeter}
                  onClick={() => handleSelect(targeter)}
                  className={`p-4 rounded-md cursor-pointer transition-colors min-h-[48px] flex items-center ${
                    targeter === currentTargeter
                      ? "bg-blue-600 text-white"
                      : "bg-[#000000] hover:bg-zinc-700 text-zinc-200"
                  }`}
                  style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold truncate">{targeter}</span>
                    {targeter === currentTargeter && (
                      <Badge variant="secondary" className="bg-blue-500">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowAddDialog(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Targeter
          </Button>
          <span className="text-zinc-400 text-sm">
            {filteredTargeters.length} targeters found
          </span>
        </div>
        {showAddDialog && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent 
              className="sm:max-w-[425px] bg-[#000000] border-zinc-800"
              style={{ zIndex: 99999999 }}
            >
              <DialogHeader>
                <DialogTitle className="text-white">Add Custom Targeter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Targeter Name</label>
                  <Input
                    value={newTargeter}
                    onChange={(e) => setNewTargeter(e.target.value)}
                    placeholder="Enter targeter name..."
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
                    onClick={handleAddTargeter}
                    disabled={!newTargeter.trim() || allTargeters.includes(newTargeter.trim())}
                  >
                    Add Targeter
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