"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Slider } from "./slider"
import { cn } from "@/lib/utils"
import { Check, Palette, Droplets } from "lucide-react"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  className?: string
  disabled?: boolean
  showAlpha?: boolean
  presetColors?: string[]
}

interface HSV {
  h: number
  s: number
  v: number
  a?: number
}

interface RGB {
  r: number
  g: number
  b: number
  a?: number
}

const presetColors = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e",
  "#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db",
  "#ffffff", "#f3f4f6", "#e5e7eb", "#f9fafb", "#fefefe"
]

export function ColorPicker({
  value = "#ffffff",
  onChange,
  className,
  disabled = false,
  showAlpha = true,
  presetColors: customPresetColors
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentColor, setCurrentColor] = useState(value)
  const [hsv, setHsv] = useState<HSV>({ h: 0, s: 0, v: 100 })
  const [isDragging, setIsDragging] = useState(false)
  
  const colors = customPresetColors || presetColors

  // Convert hex to HSV
  const hexToHsv = (hex: string): HSV => {
    const rgb = hexToRgb(hex)
    return rgbToHsv(rgb)
  }

  // Convert hex to RGB
  const hexToRgb = (hex: string): RGB => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { r: 255, g: 255, b: 255 }
    
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  // Convert RGB to HSV
  const rgbToHsv = (rgb: RGB): HSV => {
    const { r, g, b } = rgb
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    const sum = max + min

    let h = 0
    if (diff === 0) h = 0
    else if (max === r) h = ((g - b) / diff) % 6
    else if (max === g) h = (b - r) / diff + 2
    else if (max === b) h = (r - g) / diff + 4

    h = Math.round(h * 60)
    if (h < 0) h += 360

    const s = max === 0 ? 0 : Math.round((diff / max) * 100)
    const v = Math.round((max / 255) * 100)

    return { h, s, v }
  }

  // Convert HSV to RGB
  const hsvToRgb = (hsv: HSV): RGB => {
    const { h, s, v } = hsv
    const c = (v / 100) * (s / 100)
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = (v / 100) - c

    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    }
  }

  // Convert RGB to hex
  const rgbToHex = (rgb: RGB): string => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
  }

  // Update color when value prop changes
  useEffect(() => {
    if (value !== currentColor) {
      setCurrentColor(value)
      setHsv(hexToHsv(value))
    }
  }, [value])

  // Handle color change
  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor)
    setHsv(hexToHsv(newColor))
    onChange?.(newColor)
  }

  // Handle HSV change
  const handleHsvChange = (newHsv: Partial<HSV>) => {
    const updatedHsv = { ...hsv, ...newHsv }
    setHsv(updatedHsv)
    
    const rgb = hsvToRgb(updatedHsv)
    const hex = rgbToHex(rgb)
    setCurrentColor(hex)
    onChange?.(hex)
  }

  // Handle saturation/value change from color picker area
  const handleSaturationValueChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const s = Math.round((x / rect.width) * 100)
    const v = Math.round(((rect.height - y) / rect.height) * 100)
    
    handleHsvChange({ s: Math.max(0, Math.min(100, s)), v: Math.max(0, Math.min(100, v)) })
  }

  // Handle hue change from hue slider
  const handleHueChange = (value: number[]) => {
    handleHsvChange({ h: value[0] })
  }

  // Handle saturation change from saturation slider
  const handleSaturationChange = (value: number[]) => {
    handleHsvChange({ s: value[0] })
  }

  // Handle value change from value slider
  const handleValueChange = (value: number[]) => {
    handleHsvChange({ v: value[0] })
  }

  // Handle alpha change
  const handleAlphaChange = (value: number[]) => {
    const alpha = value[0] / 100
    // For now, we'll just update the alpha value in state
    // In a full implementation, you'd want to convert to RGBA or HSVA
    setHsv(prev => ({ ...prev, a: alpha }))
  }

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      handleColorChange(hex)
    }
  }

  // Handle preset color click
  const handlePresetClick = (color: string) => {
    handleColorChange(color)
  }

  // Eye dropper functionality
  const handleDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        handleColorChange(result.sRGBHex)
      } catch (error) {
        console.log('Eye dropper cancelled')
      }
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[220px] justify-start text-left font-normal",
            !currentColor && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: currentColor }} />
          {currentColor}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 z-[99999999]" align="start">
        <div className="space-y-4">
          {/* Color Preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-border shadow-sm" 
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <p className="text-sm font-medium">Current Color</p>
                <p className="text-xs text-muted-foreground">{currentColor}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDropper}
              className="h-8 w-8 p-0"
            >
              <Droplets className="h-4 w-4" />
            </Button>
          </div>

          {/* Color Picker Area */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Color Picker</Label>
            <div className="relative">
              {/* Saturation/Value Picker */}
              <div
                className="w-full h-32 rounded-lg border cursor-crosshair relative overflow-hidden"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`
                }}
                onMouseDown={() => setIsDragging(true)}
                onMouseMove={handleSaturationValueChange}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                {/* Current S/V indicator */}
                <div
                  className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg pointer-events-none"
                  style={{
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
            </div>

            {/* Hue Slider */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Hue</Label>
              <Slider
                value={[hsv.h]}
                onValueChange={handleHueChange}
                max={360}
                step={1}
                className="w-full"
              />
            </div>

            {/* Saturation Slider */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Saturation</Label>
              <Slider
                value={[hsv.s]}
                onValueChange={handleSaturationChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Value Slider */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Value</Label>
              <Slider
                value={[hsv.v]}
                onValueChange={handleValueChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Alpha Slider */}
            {showAlpha && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Alpha</Label>
                <Slider
                  value={[(hsv.a || 1) * 100]}
                  onValueChange={handleAlphaChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Hex Input */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Hex Color</Label>
            <Input
              value={currentColor}
              onChange={handleHexChange}
              placeholder="#ffffff"
              className="font-mono text-sm"
            />
          </div>

          {/* Preset Colors */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Preset Colors</Label>
            <div className="grid grid-cols-10 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-all hover:scale-110",
                    currentColor === color ? "border-white ring-2 ring-primary" : "border-border"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                >
                  {currentColor === color && (
                    <Check className="w-3 h-3 text-white m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
