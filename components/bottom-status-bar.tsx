"use client"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Minus } from "lucide-react"

interface BottomStatusBarProps {
  onLayersClick?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  zoomLevel?: number
}

export function BottomStatusBar({ onLayersClick, onZoomIn, onZoomOut, zoomLevel = 100 }: BottomStatusBarProps) {
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="flex items-center gap-3 bg-white rounded-full shadow-sm px-3 py-2 border border-gray-200">
        <Button 
          id="layers-toggle-button"
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 hover:bg-gray-100 text-gray-700" 
          onClick={onLayersClick}
        >
          <Layers className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-gray-100 text-gray-700" onClick={onZoomOut}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[3ch] text-center text-gray-700">{zoomLevel}%</span>
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-gray-100 text-gray-700" onClick={onZoomIn}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}