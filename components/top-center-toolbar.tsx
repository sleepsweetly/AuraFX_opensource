"use client"

import { Eye, Square, MoveDiagonal, Axis3D, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TopCenterToolbarProps {
  viewMode?: "top" | "side" | "diagonal" | "isometric" | "front"
  setViewMode?: (mode: "top" | "side" | "diagonal" | "isometric" | "front") => void
  modes?: any
  isRecording?: boolean
  onToggleRecording?: () => void
}

const VIEW_MODES = {
  top: { icon: Eye, label: "Top" },
  side: { icon: Square, label: "Side" },
  diagonal: { icon: MoveDiagonal, label: "Diagonal" },
  isometric: { icon: Axis3D, label: "Isometric" },
  front: { icon: EyeOff, label: "Front" },
}

export function TopCenterToolbar({ viewMode = "top", setViewMode, modes, isRecording, onToggleRecording }: TopCenterToolbarProps) {
  const { toast } = useToast()

  const handleViewModeChange = (mode: "top" | "side" | "diagonal" | "isometric" | "front") => {
    // Sadece top ve side çalışıyor, diğerleri disabled
    if (mode === "diagonal" || mode === "isometric" || mode === "front") {
      toast({
        title: "Feature Temporarily Disabled 🔧",
        description: `The ${VIEW_MODES[mode].label} view mode has been temporarily disabled due to technical issues. It will be restored in the next update.`,
        duration: 4000,
      })
      return
    }

    setViewMode?.(mode)
  }

  const CurrentViewIcon = VIEW_MODES[viewMode].icon

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-200">
        {/* View Mode Selector */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 hover:bg-gray-100 text-gray-700">
              <CurrentViewIcon className="h-4 w-4" />
              <span className="text-xs">{VIEW_MODES[viewMode].label}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="bg-white border border-gray-200 z-50"
            sideOffset={8}
            avoidCollisions={true}
          >
            {Object.entries(VIEW_MODES).map(([mode, config]) => {
              const Icon = config.icon
              const isActive = viewMode === mode
              const isDisabled = mode === "diagonal" || mode === "isometric" || mode === "front"

              return (
                <DropdownMenuItem
                  key={mode}
                  className={`text-black flex items-center gap-2 ${isActive ? 'bg-gray-100' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                  onClick={() => handleViewModeChange(mode as any)}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                  {isActive && <span className="ml-auto text-xs text-gray-500">✓</span>}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* REC Button - Animated appearance when chainMode or actionRecordingMode is active */}
        <AnimatePresence>
          {(modes?.chainMode || modes?.actionRecordingMode) && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-px h-4 bg-gray-300 mx-1"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleRecording}
                  className={`h-8 gap-1 transition-colors ${isRecording
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {isRecording ? (
                    <motion.div
                      className="w-3 h-3 bg-red-500 rounded-sm"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  )}
                  <span className="text-xs">
                    {isRecording ? 'STOP' : 'REC'}
                  </span>
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}