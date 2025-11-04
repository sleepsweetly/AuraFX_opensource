"use client"

import React, { useRef, forwardRef, useState, useCallback } from "react"
import { Canvas, CanvasApiHandle } from "./canvas"
import type { Element, Layer, Tool } from "@/types"
import { GripVertical } from "lucide-react"
import { SplitViewNotification } from "./split-view-notification"

interface SplitCanvasProps {
  currentTool: Tool
  setCurrentTool: (tool: Tool) => void
  layers: Layer[]
  currentLayerId: string | null
  settings: any
  onSettingsChange?: (settings: any) => void
  modes: any
  onAddElement: (element: Element | Element[]) => void
  onClearCanvas: () => void
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
  selectedElementIds?: string[]
  setSelectedElementIds?: (ids: string[]) => void
  performanceMode?: boolean
  onShapeCreated?: (type: string) => void
  onStartBatchMode?: () => void
  onEndBatchMode?: () => void
  chainSequence?: string[]
  onChainSequenceChange?: (sequence: string[]) => void
  chainItems?: Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }>
  optimize?: boolean
  showGridCoordinates?: boolean
  onToggleGridCoordinates?: () => void
  updateSelectedElementsParticle?: (particle: string) => void
  onElementCountChange?: (count: number, groupId: string) => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  scale?: number
  viewMode?: "top" | "side" | "diagonal" | "isometric" | "front"
  setViewMode?: (mode: "top" | "side" | "diagonal" | "isometric" | "front") => void
  isRecording?: boolean
  backgroundColor?: string
  splitViewEnabled: boolean
  onToggleSplitView: () => void
  showSplitNotification?: boolean
  onHideSplitNotification?: () => void
}

export const SplitCanvas = forwardRef<CanvasApiHandle, SplitCanvasProps>(function SplitCanvas(
  props,
  ref
) {
  const sideCanvasRef = useRef<CanvasApiHandle>(null)
  const topCanvasRef = useRef<CanvasApiHandle>(null)
  const [splitPosition, setSplitPosition] = useState(50) // As percentage
  const [isDragging, setIsDragging] = useState(false)
  
  // Separate scale states for each canvas
  const [sideScale, setSideScale] = useState(1)
  const [topScale, setTopScale] = useState(1)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const container = document.querySelector('.split-container') as HTMLElement
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100
    
    // Clamp between 20% and 80%
    const clampedPosition = Math.max(20, Math.min(80, newPosition))
    setSplitPosition(clampedPosition)
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Show normal canvas if split view is disabled
  if (!props.splitViewEnabled) {
    return <Canvas {...props} ref={ref} />
  }

  return (
    <div className="relative w-full h-full">
      {/* Split Container */}
      <div className="split-container flex h-full relative">
        {/* Side View - Left side */}
        <div 
          className="relative overflow-hidden"
          style={{ width: `${splitPosition}%` }}
        >
          <Canvas
            {...props}
            ref={sideCanvasRef}
            viewMode="side"
            setViewMode={() => {}} // Side view is fixed
            splitViewEnabled={false} // Each canvas manages its own zoom
            scale={sideScale}
            onZoomIn={() => setSideScale(prev => Math.min(5, prev * 1.1))}
            onZoomOut={() => setSideScale(prev => Math.max(0.1, prev * 0.9))}
          />
        </div>

        {/* Resizable Divider */}
        <div 
          className={`relative bg-gray-300 hover:bg-gray-400 transition-colors cursor-col-resize group ${isDragging ? 'bg-blue-400' : ''}`}
          style={{ width: '4px' }}
          onMouseDown={handleMouseDown}
        >
          {/* Grip Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white rounded-full p-1 shadow-md">
              <GripVertical className="h-3 w-3 text-gray-600" />
            </div>
          </div>
          
          {/* Hover area for better UX */}
          <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
        </div>

        {/* Top View - Right side */}
        <div 
          className="relative overflow-hidden"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <Canvas
            {...props}
            ref={topCanvasRef}
            viewMode="top"
            setViewMode={() => {}} // Top view is fixed
            splitViewEnabled={false} // Each canvas manages its own zoom
            scale={topScale}
            onZoomIn={() => setTopScale(prev => Math.min(5, prev * 1.1))}
            onZoomOut={() => setTopScale(prev => Math.max(0.1, prev * 0.9))}
          />
        </div>

        {/* Full Split View Notification - Covers entire split container including divider */}
        {props.showSplitNotification && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex z-[9999]">
            {/* Left notification */}
            <div 
              className="flex items-center justify-center"
              style={{ width: `${splitPosition}%` }}
            >
              <SplitViewNotification
                isVisible={props.showSplitNotification}
                onHide={props.onHideSplitNotification || (() => {})}
                viewType="side"
              />
            </div>
            
            {/* Divider space */}
            <div style={{ width: '4px' }} />
            
            {/* Right notification */}
            <div 
              className="flex items-center justify-center"
              style={{ width: `${100 - splitPosition}%` }}
            >
              <SplitViewNotification
                isVisible={props.showSplitNotification}
                onHide={props.onHideSplitNotification || (() => {})}
                viewType="top"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
})