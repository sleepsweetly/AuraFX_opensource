"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HexColorPicker } from "react-colorful"

interface ColorPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentColor: string
  onColorChange: (color: string) => void
}

export function ColorPickerModal({ isOpen, onClose, currentColor, onColorChange }: ColorPickerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-9000 border-zinc-800 z-[99999990] ">
        <DialogHeader>
          <DialogTitle className="text-white">Element Color</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <HexColorPicker
            color={currentColor}
            onChange={onColorChange}
            style={{ width: 200, height: 200 }}
          />
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-white" 
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-zinc-400 text-sm">{currentColor}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
