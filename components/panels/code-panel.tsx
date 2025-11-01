"use client"

import React, { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Copy,
  Loader2,
  Check,
  Zap,
  Eye,
  EyeOff,
  FileCode2,
  Settings,
  ChevronDown,
  ChevronUp,
  Code,
  Package,
  Command,
  Braces,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Share2
} from "lucide-react"
import type { Layer } from "@/types"
import { useToast } from "@/components/toast-system"
import { DatapackWarningModal } from "@/components/datapack-warning-modal"
import { shareEffect } from "@/app/generate-effect-code"
import { ElasticSlider } from "@/components/ui/elastic-slider"

interface CodePanelProps {
  code?: string
  onGenerateCode?: (optimize?: boolean, exportFormat?: string) => Promise<void>
  onShowElementSettings?: () => void
  isGenerating?: boolean
  settings?: {
    particleCount: number
    shapeSize: number
    color: string
    particle: string
    alpha: number
    repeat: number
    yOffset: number
    skillName: string
    pngSize: number
    objScale: number
    performanceMode: boolean
    imageColorMode: boolean
    frameMode?: string
    frameCount?: number
    exportFormat?: string
    minecraftVersion?: string
    useRelativeCoords?: boolean
    useExecute?: boolean
  }
  onSettingsChange?: (settings: any) => void
  layers?: Layer[]
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
  currentLayer?: Layer | null
  modes?: {
    rotateMode: boolean
    rainbowMode: boolean
    riseMode: boolean
    performanceMode: boolean
    localRotateMode: boolean
    moveMode: boolean
    proximityMode: boolean
    staticRainbowMode?: boolean
  }
  onFrameSettingsChange?: (mode: "auto" | "manual", frameCount?: number) => void
  optimize?: boolean
  setOptimize?: (v: boolean) => void
}

function CodeDisplay({ code, isVisible, fileName }: { code: string; isVisible: boolean; fileName: string }) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const cleanedCode = code.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed !== '' && !trimmed.startsWith('#')
  }).join('\n')

  const allLines = cleanedCode.split("\n")

  const LINE_HEIGHT = 20
  const CONTAINER_HEIGHT = 280
  const VISIBLE_LINES = Math.ceil(CONTAINER_HEIGHT / LINE_HEIGHT)
  const BUFFER_SIZE = 5

  const startIndex = Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - BUFFER_SIZE)
  const endIndex = Math.min(allLines.length, startIndex + VISIBLE_LINES + (BUFFER_SIZE * 2))
  const visibleLines = allLines.slice(startIndex, endIndex)

  const totalHeight = allLines.length * LINE_HEIGHT

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  if (!isVisible) {
    return (
      <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center space-y-2">
          <EyeOff className="w-5 h-5 text-gray-400 mx-auto" />
          <p className="text-xs text-gray-500">Preview hidden</p>
        </div>
      </div>
    )
  }

  if (!code || code.trim() === "") {
    return (
      <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center space-y-2">
          <Terminal className="w-5 h-5 text-gray-400 mx-auto" />
          <p className="text-xs text-gray-500">No code generated</p>
          <p className="text-xs text-gray-400">Configure and generate</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[280px] flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div className="flex-shrink-0 px-3 py-2 bg-gray-50 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
          <span className="text-xs font-mono text-gray-600 ml-2">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{allLines.length} lines</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f9fafb' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: startIndex * LINE_HEIGHT,
              width: '100%'
            }}
            className="font-mono text-xs"
          >
            {visibleLines.map((line, index) => {
              const actualIndex = startIndex + index

              return (
                <div
                  key={actualIndex}
                  className="flex hover:bg-gray-50 transition-colors"
                  style={{ height: LINE_HEIGHT }}
                >
                  <span className="flex-shrink-0 text-gray-400 text-right px-3 select-none w-12 bg-gray-50/80">
                    {actualIndex + 1}
                  </span>
                  <span className="px-3 whitespace-pre text-gray-800 font-mono">
                    {line || " "}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        div::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select..."
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; icon?: React.ReactNode }[]
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CodePanel({
  code = "",
  onGenerateCode = async () => { },
  isGenerating = false,
  settings = {
    particleCount: 100,
    shapeSize: 1,
    color: "#ff6b35",
    particle: "reddust",
    alpha: 10,
    repeat: 1,
    yOffset: 0,
    skillName: "MyEffect",
    pngSize: 100,
    objScale: 1,
    performanceMode: false,
    imageColorMode: false,
    frameMode: "auto",
    frameCount: 60,
    exportFormat: "mythicmobs",
    minecraftVersion: "1.20.5-1.21.1",
    useRelativeCoords: true,
    useExecute: true
  },
  onSettingsChange = () => { },
  modes = {
    rotateMode: false,
    rainbowMode: false,
    riseMode: false,
    performanceMode: false,
    localRotateMode: false,
    moveMode: false,
    proximityMode: false,
    staticRainbowMode: false
  },
  onFrameSettingsChange = () => { },
  optimize = false,
  setOptimize = () => { },
  layers = []
}: CodePanelProps) {
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const [frameMode, setFrameMode] = useState<"auto" | "manual">("auto")
  const [manualFrameCount, setManualFrameCount] = useState(120)
  const [exportFormat, setExportFormat] = useState(settings?.exportFormat || "mythicmobs")
  const [minecraftVersion, setMinecraftVersion] = useState(settings?.minecraftVersion || "1.20.5-1.21.1")
  const [showDatapackWarning, setShowDatapackWarning] = useState(false)
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<string[]>([])
  const [showPackMcmeta, setShowPackMcmeta] = useState(false)
  const [useRelativeCoords, setUseRelativeCoords] = useState(settings?.useRelativeCoords !== false)
  const [useExecute, setUseExecute] = useState(settings?.useExecute !== false)
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const hasAnimationModes = Object.values(modes).some(Boolean)
  const isMythicMobs = exportFormat === "mythicmobs"
  const isVanillaOrDatapack = exportFormat === "vanilla" || exportFormat === "datapack"

  const packFormats: Record<string, { format: number, description: string }> = {
    "1.20.5-1.21.1": { format: 48, description: "1.20.5 - 1.21.1" },
    "1.20.3-1.20.4": { format: 26, description: "1.20.3 - 1.20.4" },
    "1.20-1.20.2": { format: 15, description: "1.20 - 1.20.2" },
    "1.19.4": { format: 12, description: "1.19.4" },
    "1.19-1.19.3": { format: 10, description: "1.19 - 1.19.3" },
    "1.18.2": { format: 9, description: "1.18.2" },
    "1.18-1.18.1": { format: 8, description: "1.18 - 1.18.1" },
    "1.17-1.17.1": { format: 7, description: "1.17 - 1.17.1" },
    "1.16.2-1.16.5": { format: 6, description: "1.16.2 - 1.16.5" },
  }

  const currentPackFormat = packFormats[minecraftVersion]
  const packMcmetaContent = JSON.stringify({
    pack: {
      pack_format: currentPackFormat?.format || 48,
      description: `${settings.skillName || "Effect"} - Generated by AuraFX`
    }
  }, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast({
        title: "Copied",
        description: "Code copied to clipboard",
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleDownload = () => {
    let fileExtension = ".yaml"
    let mimeType = "text/yaml"

    if (exportFormat === "vanilla") {
      fileExtension = ".txt"
      mimeType = "text/plain"
    } else if (exportFormat === "datapack") {
      fileExtension = ".mcfunction"
      mimeType = "text/plain"
    }

    const blob = new Blob([code], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${settings.skillName || "effect"}${fileExtension}`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded",
      description: `Saved as ${settings.skillName || "effect"}${fileExtension}`,
      duration: 2000,
    })
  }

  const handleGenerate = async () => {
    try {
      await onGenerateCode(optimize, exportFormat)
    } catch (error: any) {
      // Datapack veya Vanilla animasyon hatası kontrolü
      if (error.message && (
        error.message.startsWith('DATAPACK_ANIMATION_NOT_SUPPORTED:') ||
        error.message.startsWith('VANILLA_ANIMATION_NOT_SUPPORTED:')
      )) {
        const features = error.message.split(':')[1].split(',')
        setUnsupportedFeatures(features)
        setShowDatapackWarning(true)
      } else {
        // Diğer hatalar için toast göster
        toast({
          title: "Error",
          description: error.message || "Failed to generate code",
          duration: 3000,
        })
      }
    }
  }

  const handleFrameModeChange = (mode: "auto" | "manual") => {
    setFrameMode(mode)
    onFrameSettingsChange(mode, mode === "manual" ? manualFrameCount : undefined)
  }

  const handleManualFrameChange = (value: number) => {
    setManualFrameCount(value)
    if (frameMode === "manual") {
      onFrameSettingsChange("manual", value)
    }
  }

  const handleExportFormatChange = (format: string) => {
    setExportFormat(format)
    onSettingsChange({ ...settings, exportFormat: format })

    if (format !== "mythicmobs" && optimize) {
      setOptimize(false)
    }

    if (format === "datapack") {
      setShowPackMcmeta(true)
    } else {
      setShowPackMcmeta(false)
    }
  }

  const handleMinecraftVersionChange = (version: string) => {
    setMinecraftVersion(version)
    onSettingsChange({ ...settings, minecraftVersion: version })
  }

  const handleCoordTypeChange = (relative: boolean) => {
    setUseRelativeCoords(relative)
    onSettingsChange({ ...settings, useRelativeCoords: relative })
  }

  const handleExecuteChange = (execute: boolean) => {
    setUseExecute(execute)
    onSettingsChange({ ...settings, useExecute: execute })
  }

  const handleShare = async () => {
    if (!code || code.trim() === "") {
      toast({
        title: "Error",
        description: "No code to share. Generate code first.",
        variant: "destructive",
        duration: 2000,
      })
      return
    }

    setIsSharing(true)
    
    try {
      // Karmaşıklık hesapla
      const totalElements = layers?.reduce((sum: number, layer: Layer) => sum + layer.elements.length, 0) || 0
      const activeModesList = Object.entries(modes).filter(([_, value]) => value === true).map(([key]) => key)
      let complexity: 'Basit' | 'Orta' | 'Karmaşık' = 'Basit'
      if (totalElements > 50 || activeModesList.length > 3) complexity = 'Orta'
      if (totalElements > 100 || activeModesList.length > 5) complexity = 'Karmaşık'

      const result = await shareEffect({
        skillName: settings.skillName || "Unnamed Effect",
        code: code,
        layerCount: layers?.length || 0,
        elementCount: totalElements,
        activeModes: activeModesList,
        complexity: complexity,
        canvasImage: null
      })

      if (result.success) {
        toast({
          title: "Shared Successfully",
          description: "Effect has been shared to Discord",
          duration: 3000,
        })
      } else {
        toast({
          title: "Share Failed",
          description: result.error || "Failed to share effect",
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (error: any) {
      toast({
        title: "Share Failed",
        description: error.message || "Failed to share effect",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyPackMcmeta = async () => {
    try {
      await navigator.clipboard.writeText(packMcmetaContent)
      toast({
        title: "Copied",
        description: "pack.mcmeta copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const getFileName = () => {
    if (exportFormat === "mythicmobs") return "effect.yaml"
    if (exportFormat === "vanilla") return "commands.txt"
    if (exportFormat === "datapack") return "function.mcfunction"
    return "code.txt"
  }

  const exportFormatOptions = [
    { value: "mythicmobs", label: "MythicMobs", icon: <Package className="w-3 h-3" /> },
    { value: "vanilla", label: "Vanilla Commands", icon: <Command className="w-3 h-3" /> },
    { value: "datapack", label: "Datapack", icon: <Braces className="w-3 h-3" /> }
  ]

  const versionOptions = [
    { value: "1.21.8", label: "1.21.8 (format 64)" },
    { value: "1.21.7", label: "1.21.7 (format 64)" },
    { value: "1.21.6", label: "1.21.6 (format 63)" },
    { value: "1.21.5", label: "1.21.5 (format 55)" },
    { value: "1.21.4", label: "1.21.4 (format 46)" },
    { value: "1.21.2-1.21.3", label: "1.21.2 - 1.21.3 (format 42)" },
    { value: "1.21.0-1.21.1", label: "1.21.0 - 1.21.1 (format 34)" },
    { value: "1.20.5-1.20.6", label: "1.20.5 - 1.20.6 (format 32)" },
    { value: "1.20.3-1.20.4", label: "1.20.3 - 1.20.4 (format 22)" },
    { value: "1.20.2", label: "1.20.2 (format 18)" },
    { value: "1.20.0-1.20.1", label: "1.20.0 - 1.20.1 (format 15)" },
    { value: "1.19.4", label: "1.19.4 (format 13)" },
    { value: "1.19.3", label: "1.19.3 (format 12)" },
    { value: "1.19.0-1.19.2", label: "1.19.0 - 1.19.2 (format 9)" },
    { value: "1.18.0-1.18.2", label: "1.18.0 - 1.18.2 (format 8)" },
    { value: "1.17.0-1.17.1", label: "1.17.0 - 1.17.1 (format 7)" },
    { value: "1.16.2-1.16.5", label: "1.16.2 - 1.16.5 (format 6)" },
    { value: "1.15.0-1.16.1", label: "1.15.0 - 1.16.1 (format 5)" },
    { value: "1.13.0-1.14.4", label: "1.13.0 - 1.14.4 (format 4)" },
    { value: "1.11.0-1.12.2", label: "1.11.0 - 1.12.2 (format 3)" },
    { value: "1.9.0-1.10.2", label: "1.9.0 - 1.10.2 (format 2)" },
    { value: "1.6.1-1.8.9", label: "1.6.1 - 1.8.9 (format 1)" }
  ]

  return (
    <div className="flex flex-col h-full p-3 space-y-3">
      {/* Effect Name */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Effect Name</label>
        <Input
          type="text"
          value={settings.skillName}
          onChange={(e) => onSettingsChange({ ...settings, skillName: e.target.value })}
          placeholder="MyEffect"
          className="h-8 text-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Export Format Dropdown */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Export Format</label>
        <CustomDropdown
          value={exportFormat}
          onChange={handleExportFormatChange}
          options={exportFormatOptions}
        />
      </div>

      {/* Format-specific Settings */}
      <div className="bg-gray-50 rounded-lg p-2 space-y-2">
        {isMythicMobs && (
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-gray-700">Optimize</span>
            <button
              onClick={() => setOptimize(!optimize)}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${optimize ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${optimize ? 'translate-x-3' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        )}

        {isVanillaOrDatapack && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-medium text-gray-700">Relative (~)</span>
              <button
                onClick={() => handleCoordTypeChange(!useRelativeCoords)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${useRelativeCoords ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useRelativeCoords ? 'translate-x-3' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-medium text-gray-700">Execute @s</span>
              <button
                onClick={() => handleExecuteChange(!useExecute)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${useExecute ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useExecute ? 'translate-x-3' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
          </div>
        )}

        {exportFormat === "datapack" && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Minecraft Version</label>
            <CustomDropdown
              value={minecraftVersion}
              onChange={handleMinecraftVersionChange}
              options={versionOptions}
            />
          </div>
        )}
      </div>

      {/* Animation Settings */}
      {hasAnimationModes && (
        <div className="bg-gray-50 rounded-lg p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Animation</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleFrameModeChange("auto")}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${frameMode === "auto"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
                  }`}
              >
                Auto
              </button>
              <button
                onClick={() => handleFrameModeChange("manual")}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${frameMode === "manual"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
                  }`}
              >
                Manual
              </button>
            </div>
          </div>

          {frameMode === "manual" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Frames</span>
                <span className="text-xs font-mono bg-gray-800 text-white px-1.5 py-0.5 rounded">
                  {manualFrameCount}
                </span>
              </div>
              <ElasticSlider
                defaultValue={manualFrameCount}
                onChange={(v) => handleManualFrameChange(v)}
                startingValue={12}
                maxValue={240}
                stepSize={6}
                isStepped={true}
                size="md"
                leftIcon={<span className="text-xs">12</span>}
                rightIcon={<span className="text-xs">240</span>}
              />
            </div>
          )}
        </div>
      )}

      {/* Code Display */}
      <div className="flex-1 min-h-0">
        <CodeDisplay code={code} isVisible={showCode} fileName={getFileName()} />
      </div>

      {/* pack.mcmeta for Datapack */}
      {exportFormat === "datapack" && showPackMcmeta && (
        <div className="bg-gray-50 rounded-lg p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">pack.mcmeta</span>
            <button
              onClick={handleCopyPackMcmeta}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded p-2 overflow-x-auto border border-gray-200">
            <pre className="text-xs text-gray-800 font-mono">
              {packMcmetaContent}
            </pre>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCode(!showCode)}
          className={`p-2 rounded-lg transition-colors ${showCode
            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
            : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        <button
          onClick={handleCopy}
          disabled={!code || isGenerating}
          className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>

        <button
          onClick={handleDownload}
          disabled={!code || isGenerating}
          className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          <Download className="w-3.5 h-3.5" />
          Save
        </button>

        <button
          onClick={handleShare}
          disabled={!code || isGenerating || isSharing}
          className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          {isSharing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
          {isSharing ? "Sharing..." : "Share"}
        </button>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Generate</span>
          </>
        )}
      </button>

      {/* Datapack/Vanilla Warning Modal */}
      <DatapackWarningModal
        isOpen={showDatapackWarning}
        onClose={() => setShowDatapackWarning(false)}
        unsupportedFeatures={unsupportedFeatures}
        exportFormat={exportFormat}
      />
    </div>
  )
}