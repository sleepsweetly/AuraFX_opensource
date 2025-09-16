import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EffectType } from "@/app/page"
import { Layer } from "@/types"

interface EffectTypeModalProps {
  isOpen: boolean
  onClose: () => void
  layer: Layer
  onUpdate: (layer: Layer) => void
}

export function EffectTypeModal({ isOpen, onClose, layer, onUpdate }: EffectTypeModalProps) {
  if (!layer) return null;

  const handleEffectTypeChange = (effectType: EffectType) => {
    onUpdate({
      ...layer,
      effectType,
      effectParams: {} // Reset effect params when changing type
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Effect Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={layer.effectType === "particles" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particles")}
            >
              Particles
            </Button>
            <Button
              variant={layer.effectType === "particlelinehelix" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particlelinehelix")}
            >
              Line Helix
            </Button>
            <Button
              variant={layer.effectType === "particleorbital" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particleorbital")}
            >
              Orbital
            </Button>
            <Button
              variant={layer.effectType === "particlering" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particlering")}
            >
              Ring
            </Button>
            <Button
              variant={layer.effectType === "particleline" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particleline")}
            >
              Line
            </Button>
            <Button
              variant={layer.effectType === "particlelinering" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particlelinering")}
            >
              Line Ring
            </Button>
            <Button
              variant={layer.effectType === "particlesphere" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particlesphere")}
            >
              Sphere
            </Button>
            <Button
              variant={layer.effectType === "particletornado" ? "default" : "outline"}
              onClick={() => handleEffectTypeChange("particletornado")}
            >
              Tornado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 