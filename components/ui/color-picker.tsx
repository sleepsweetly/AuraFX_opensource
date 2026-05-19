"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  className?: string
  disabled?: boolean
}

// Convert HSV to RGB
const hsvToRgb = (h: number, s: number, v: number) => {
  s /= 100
  v /= 100
  const c = v * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = v - c

  let r = 0, g = 0, b = 0
  if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Convert Hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// Convert RGB to HSV
const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6
    else if (max === g) h = (b - r) / diff + 2
    else h = (r - g) / diff + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const s = max === 0 ? 0 : (diff / max) * 100
  const v = max * 100

  return { h, s, v }
}

export function ColorPicker({
  value = "#000000",
  onChange,
  className,
  disabled = false
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [brightness, setBrightness] = useState(100)
  const [isDragging, setIsDragging] = useState<'sv' | 'hue' | null>(null)

  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  // Initialize HSV from current color only when opening
  useEffect(() => {
    if (isOpen && value) {
      const rgb = hexToRgb(value)
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
      setHue(hsv.h)
      setSaturation(hsv.s)
      setBrightness(hsv.v)
    }
  }, [isOpen])



  const handleSVMouseDown = (e: React.MouseEvent) => {
    setIsDragging('sv')
    handleSVMove(e)
  }

  const handleSVMove = (e: React.MouseEvent) => {
    if (!svRef.current) return
    const rect = svRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))

    const newSaturation = (x / rect.width) * 100
    const newBrightness = ((rect.height - y) / rect.height) * 100

    setSaturation(newSaturation)
    setBrightness(newBrightness)

    // Update color immediately
    const rgb = hsvToRgb(hue, newSaturation, newBrightness)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    onChange?.(hex)
  }

  const handleHueMouseDown = (e: React.MouseEvent) => {
    setIsDragging('hue')
    handleHueMove(e)
  }

  const handleHueMove = (e: React.MouseEvent) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const newHue = (x / rect.width) * 360

    setHue(newHue)

    // Update color immediately
    const rgb = hsvToRgb(newHue, saturation, brightness)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    onChange?.(hex)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging === 'sv') handleSVMove(e)
    else if (isDragging === 'hue') handleHueMove(e)
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-white dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800/85 hover:bg-gray-100 dark:hover:bg-zinc-800/65 text-gray-900 dark:text-zinc-100 h-10 shadow-sm rounded-2xl",
            className
          )}
          disabled={disabled}
        >
          <div
            className="w-6 h-6 rounded border border-gray-200 dark:border-zinc-800 mr-3 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-medium">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-250/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl z-[150]"
        align="start"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="space-y-4">
          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-zinc-800 shadow-sm"
              style={{
                backgroundColor: (() => {
                  const rgb = hsvToRgb(hue, saturation, brightness)
                  return rgbToHex(rgb.r, rgb.g, rgb.b)
                })()
              }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Selected Color</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-mono">{(() => {
                const rgb = hsvToRgb(hue, saturation, brightness)
                return rgbToHex(rgb.r, rgb.g, rgb.b)
              })()}</p>
            </div>
          </div>

          {/* Saturation/Brightness Picker */}
          <div className="space-y-3">
            <div
              ref={svRef}
              className="w-full h-40 rounded-lg border border-gray-200 dark:border-zinc-800 cursor-crosshair relative"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
              }}
              onMouseDown={handleSVMouseDown}
            >
              <div
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            {/* Hue Slider */}
            <div
              ref={hueRef}
              className="w-full h-6 rounded-lg cursor-pointer border border-gray-200 dark:border-zinc-800 relative"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
              onMouseDown={handleHueMouseDown}
            >
              <div
                className="absolute w-1 h-full bg-white border border-gray-400 rounded-sm shadow-sm pointer-events-none"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
