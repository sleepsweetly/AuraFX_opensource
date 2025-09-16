"use client"

import type React from "react"

import { useRef, useCallback, useEffect, useState } from "react"

interface ResizablePanelProps {
  children: React.ReactNode
  direction: "left" | "right" | "top" | "bottom"
  initialSize: number
  minSize: number
  maxSize: number
  onResize: (size: number) => void
  className?: string
}

export function ResizablePanel({
  children,
  direction,
  initialSize,
  minSize,
  maxSize,
  onResize,
  className = "",
}: ResizablePanelProps) {
  const [size, setSize] = useState(initialSize)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return

      const rect = panelRef.current.getBoundingClientRect()
      let newSize: number

      switch (direction) {
        case "left":
          newSize = rect.right - e.clientX
          break
        case "right":
          newSize = e.clientX - rect.left
          break
        case "top":
          newSize = rect.bottom - e.clientY
          break
        case "bottom":
          newSize = e.clientY - rect.top
          break
        default:
          return
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize))
      setSize(newSize)
      onResize(newSize)
    },
    [isResizing, direction, minSize, maxSize, onResize],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = direction === "left" || direction === "right" ? "ew-resize" : "ns-resize"
      document.body.style.userSelect = "none"

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp, direction])

  const getResizeHandleStyle = () => {
    const baseStyle = "absolute bg-transparent hover:bg-white/10 transition-colors duration-200 z-10"

    switch (direction) {
      case "left":
        return `${baseStyle} left-0 top-0 bottom-0 w-1 cursor-ew-resize`
      case "right":
        return `${baseStyle} right-0 top-0 bottom-0 w-1 cursor-ew-resize`
      case "top":
        return `${baseStyle} top-0 left-0 right-0 h-1 cursor-ns-resize`
      case "bottom":
        return `${baseStyle} bottom-0 left-0 right-0 h-1 cursor-ns-resize`
      default:
        return baseStyle
    }
  }

  const getPanelStyle = () => {
    switch (direction) {
      case "left":
      case "right":
        return { width: size }
      case "top":
      case "bottom":
        return { height: size }
      default:
        return {}
    }
  }

  return (
    <div ref={panelRef} className={`relative ${className}`} style={getPanelStyle()}>
      <div className={getResizeHandleStyle()} onMouseDown={handleMouseDown} />
      {children}
    </div>
  )
}
