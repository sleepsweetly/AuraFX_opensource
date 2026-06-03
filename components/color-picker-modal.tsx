"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Palette, Pipette } from "lucide-react"

interface ColorPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentColor: string
  onColorChange: (color: string) => void
}

// Önceden tanımlanmış renkler
const presetColors = [
  "#FF0000", "#FF4500", "#FFA500", "#FFD700", "#FFFF00",
  "#ADFF2F", "#00FF00", "#00FA9A", "#00FFFF", "#0080FF",
  "#0000FF", "#4169E1", "#8A2BE2", "#9400D3", "#FF00FF",
  "#FF1493", "#FF69B4", "#FFC0CB", "#FFFFFF", "#F5F5F5",
  "#DCDCDC", "#C0C0C0", "#A9A9A9", "#808080", "#696969",
  "#000000", "#2F4F4F", "#8B4513", "#A0522D", "#CD853F"
]

// RGB to HSV conversion
const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6
    else if (max === g) h = (b - r) / diff + 2
    else h = (r - g) / diff + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const s = max === 0 ? 0 : diff / max
  const v = max

  return { h, s: s * 100, v: v * 100 }
}

// HSV to RGB conversion
const hsvToRgb = (h: number, s: number, v: number) => {
  s /= 100
  v /= 100

  const c = v * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = v - c

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

// RGB to Hex conversion
const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Hex to RGB conversion
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

export function ColorPickerModal({ isOpen, onClose, currentColor, onColorChange }: ColorPickerModalProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [value, setValue] = useState(100)
  const [hexInput, setHexInput] = useState(currentColor)

  // Initialize HSV values from current color
  useEffect(() => {
    if (currentColor) {
      const rgb = hexToRgb(currentColor)
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
      setHue(hsv.h)
      setSaturation(hsv.s)
      setValue(hsv.v)
      setSelectedColor(currentColor)
      setHexInput(currentColor)
    }
  }, [currentColor, isOpen])

  // Update color when HSV changes
  useEffect(() => {
    const rgb = hsvToRgb(hue, saturation, value)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setSelectedColor(hex)
    setHexInput(hex)
  }, [hue, saturation, value])

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setHexInput(color)
    const rgb = hexToRgb(color)
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    setHue(hsv.h)
    setSaturation(hsv.s)
    setValue(hsv.v)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHexInput(value)
    
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      handleColorSelect(value)
    }
  }

  const handleApply = () => {
    onColorChange(selectedColor)
    onClose()
  }

  const handleSaturationValueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newSaturation = (x / rect.width) * 100
    const newValue = ((rect.height - y) / rect.height) * 100
    
    setSaturation(Math.max(0, Math.min(100, newSaturation)))
    setValue(Math.max(0, Math.min(100, newValue)))
  }

  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newHue = (x / rect.width) * 360
    setHue(Math.max(0, Math.min(360, newHue)))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xl text-zinc-900 dark:text-zinc-100">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-500" />
            Renk Seçici
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ana Renk Seçici */}
          <div className="space-y-3">
            {/* Saturation/Value Picker */}
            <div
              className="w-full h-48 rounded-lg border border-gray-200 dark:border-zinc-800 cursor-crosshair relative"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
              }}
              onClick={handleSaturationValueClick}
            >
              {/* Current position indicator */}
              <div
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - value}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            {/* Hue Slider */}
            <div
              className="w-full h-4 rounded-lg cursor-pointer border border-gray-200 dark:border-zinc-800 relative"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
              onClick={handleHueClick}
            >
              {/* Indicator: yuvarlak, beyaz border + gölge — patlama yok */}
              <div
                className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `hsl(${hue}, 100%, 50%)`
                }}
              />
            </div>
          </div>

          {/* Renk Önizleme ve Hex Input */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-zinc-800 shadow-sm"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Seçilen Renk</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedColor}</p>
              </div>
            </div>
            <div className="flex-1">
              <Input
                value={hexInput}
                onChange={handleHexInputChange}
                placeholder="#000000"
                className="font-mono text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Hazır Renkler */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-750 dark:text-zinc-300">Hazır Renkler</h4>
            <div className="grid grid-cols-10 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor === color 
                      ? 'border-black dark:border-white ring-2 ring-black dark:ring-white ring-offset-1 dark:ring-offset-zinc-950' 
                      : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 border-gray-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900"
            >
              İptal
            </Button>
            <Button
              onClick={handleApply}
              className="px-6 bg-black dark:bg-zinc-100 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200"
            >
              Uygula
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}