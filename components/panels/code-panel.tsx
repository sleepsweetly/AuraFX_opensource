"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Copy,
  Loader2,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
  Code2,
  Share2,
  AlertCircle,
  FileCode,
  Sparkles
} from "lucide-react"
import type { Layer } from "@/types"
import { useToast } from "@/components/toast-system"
import { DatapackWarningModal } from "@/components/datapack-warning-modal"
import { shareEffect } from "@/app/generate-effect-code"
import { ElasticSlider } from "@/components/ui/elastic-slider"

// --- TYPES ---
interface CodePanelProps {
  code?: string
  onGenerateCode?: (optimize?: boolean, exportFormat?: string) => Promise<void>
  onShowElementSettings?: () => void
  isGenerating?: boolean
  settings?: any
  onSettingsChange?: (settings: any) => void
  layers?: Layer[]
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
  currentLayer?: Layer | null
  modes?: any
  onFrameSettingsChange?: (mode: "auto" | "manual", frameCount?: number) => void
  optimize?: boolean
  setOptimize?: (v: boolean) => void
}

// --- COMPONENTS ---
function CodeViewer({ code }: { code: string }) {
  const cleanedCode = code.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#')).join('\n')
  const codeLines = cleanedCode.split("\n")

  if (!code || code.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
          <Code2 size={32} strokeWidth={1.5} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">No code generated</p>
        <p className="text-xs text-gray-500 mt-1">Click Generate to create code</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto scrollbar-hidden bg-white">
      <div className="p-3 space-y-0.5">
        {codeLines.map((line, index) => (
          <div key={index} className="flex group hover:bg-purple-50/50 transition-colors rounded-sm">
            <span className="flex-shrink-0 w-12 text-[10px] text-gray-400 text-right pr-3 select-none font-mono group-hover:text-purple-600 transition-colors">
              {index + 1}
            </span>
            <span className="text-[11px] font-mono text-gray-900 whitespace-pre flex-1 leading-relaxed">
              {line || " "}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Collapsible section component (like other panels)
function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Toggle switch component (like other panels)
function ToggleSwitch({ 
  active, 
  onClick, 
  label 
}: { 
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onClick}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          active ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            active ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export function CodePanel({
  code = "",
  onGenerateCode = async () => { },
  isGenerating = false,
  settings = {},
  onSettingsChange = () => { },
  modes = {},
  onFrameSettingsChange = () => { },
  optimize = false,
  setOptimize = () => { },
  layers = []
}: CodePanelProps) {
  const [copied, setCopied] = useState(false)
  const [frameMode, setFrameMode] = useState<"auto" | "manual">("auto")
  const [manualFrameCount, setManualFrameCount] = useState(120)
  const [exportFormat, setExportFormat] = useState(settings?.exportFormat || "mythicmobs")
  const [minecraftVersion, setMinecraftVersion] = useState(settings?.minecraftVersion || "1.20.5-1.21.1")
  const [useRelativeCoords, setUseRelativeCoords] = useState(settings?.useRelativeCoords !== false)
  const [useExecute, setUseExecute] = useState(settings?.useExecute !== false)
  const [useDirectionalOffsets, setUseDirectionalOffsets] = useState(settings?.useDirectionalOffsets || false)
  const [isSharing, setIsSharing] = useState(false)
  const [showDatapackWarning, setShowDatapackWarning] = useState(false)
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<string[]>([])
  const [showPackMcmeta, setShowPackMcmeta] = useState(false)

  const { toast } = useToast()

  const hasAnimationModes = Object.values(modes || {}).some(Boolean)
  const isMythicMobs = exportFormat === "mythicmobs"
  const isVanillaOrDatapack = exportFormat === "vanilla" || exportFormat === "datapack"

  const cleanedCode = code.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#')).join('\n')
  const codeLines = cleanedCode.split("\n")

  const packFormats: Record<string, { format: number, description: string }> = {
    "1.21.8": { format: 64, description: "1.21.8" },
    "1.21.7": { format: 64, description: "1.21.7" },
    "1.21.6": { format: 63, description: "1.21.6" },
    "1.21.5": { format: 55, description: "1.21.5" },
    "1.21.4": { format: 46, description: "1.21.4" },
    "1.21.2-1.21.3": { format: 42, description: "1.21.2 - 1.21.3" },
    "1.21.0-1.21.1": { format: 34, description: "1.21.0 - 1.21.1" },
    "1.20.5-1.20.6": { format: 32, description: "1.20.5 - 1.20.6" },
    "1.20.3-1.20.4": { format: 22, description: "1.20.3 - 1.20.4" },
    "1.20.2": { format: 18, description: "1.20.2" },
    "1.20.0-1.20.1": { format: 15, description: "1.20.0 - 1.20.1" },
  }

  const currentPackFormat = packFormats[minecraftVersion]
  const packMcmetaContent = JSON.stringify({
    pack: {
      pack_format: currentPackFormat?.format || 48,
      description: `${settings.skillName || "Effect"} - Generated by AuraFX`
    }
  }, null, 2)

  // --- HANDLERS ---
  const handleCopy = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copied to clipboard", duration: 1500 })
  }

  const handleGenerate = async () => {
    try {
      await onGenerateCode(optimize, exportFormat)
    } catch (error: any) {
      if (error.message && (error.message.startsWith('DATAPACK_ANIMATION_NOT_SUPPORTED:') || error.message.startsWith('VANILLA_ANIMATION_NOT_SUPPORTED:'))) {
        setUnsupportedFeatures(error.message.split(':')[1].split(','))
        setShowDatapackWarning(true)
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    }
  }

  const handleDownload = () => {
    const ext = exportFormat === "vanilla" ? ".txt" : exportFormat === "datapack" ? ".mcfunction" : ".yaml"
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${settings.skillName || "effect"}${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Downloaded", duration: 1500 })
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

  const exportOptions = [
    { value: "mythicmobs", label: "MythicMobs", icon: Sparkles },
    { value: "vanilla", label: "Vanilla Command", icon: FileCode },
    { value: "datapack", label: "Datapack Function", icon: FileCode }
  ]

  return (
    <div className="h-full w-full bg-white flex flex-col text-sm">
      {/* HEADER */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Code2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Code Generator</h3>
            <p className="text-sm text-gray-500">{codeLines.length} lines generated</p>
          </div>
        </div>
      </div>

      {/* SETTINGS SECTION */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {/* Effect Name */}
        <div className="border-b border-gray-200 p-4">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Effect Name</label>
          <Input
            value={settings.skillName}
            onChange={(e) => onSettingsChange({ ...settings, skillName: e.target.value })}
            placeholder="my_awesome_effect"
            className="h-10 text-sm bg-white text-gray-900 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
          />
        </div>

        {/* Export Format */}
        <CollapsibleSection title="Export Format">
          <div className="space-y-2">
            {exportOptions.map((opt) => {
              const Icon = opt.icon
              const isActive = exportFormat === opt.value
              return (
                <motion.button
                  key={opt.value}
                  onClick={() => {
                    setExportFormat(opt.value)
                    onSettingsChange({ ...settings, exportFormat: opt.value })
                    if (opt.value !== "mythicmobs") setOptimize?.(false)
                    if (opt.value === "datapack") {
                      setShowPackMcmeta(true)
                    } else {
                      setShowPackMcmeta(false)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 relative ${
                    isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  whileHover={{ x: 2 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeExportBar"
                      className="absolute left-0 w-1 h-7 bg-purple-500 rounded-r"
                    />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{opt.label}</span>
                </motion.button>
              )
            })}
          </div>
        </CollapsibleSection>

        {/* MythicMobs Options */}
        {isMythicMobs && (
          <CollapsibleSection title="MythicMobs Options">
            <div className="space-y-3">
              <ToggleSwitch
                active={optimize}
                onClick={() => setOptimize?.(!optimize)}
                label="Optimize Code"
              />
              <ToggleSwitch
                active={useDirectionalOffsets}
                onClick={() => {
                  setUseDirectionalOffsets(!useDirectionalOffsets)
                  onSettingsChange({ ...settings, useDirectionalOffsets: !useDirectionalOffsets })
                }}
                label="Directional Offsets"
              />
            </div>
            <AnimatePresence>
              {useDirectionalOffsets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">Experimental Feature</p>
                        <p className="text-xs text-amber-700 mt-0.5">Y-axis transformations may not work as expected</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleSection>
        )}

        {/* Vanilla/Datapack Options */}
        {isVanillaOrDatapack && (
          <CollapsibleSection title={`${exportFormat === "vanilla" ? "Vanilla" : "Datapack"} Options`}>
            <div className="space-y-3">
              <ToggleSwitch
                active={useRelativeCoords}
                onClick={() => {
                  setUseRelativeCoords(!useRelativeCoords)
                  onSettingsChange({ ...settings, useRelativeCoords: !useRelativeCoords })
                }}
                label="Relative Coordinates (~)"
              />
              <ToggleSwitch
                active={useExecute}
                onClick={() => {
                  setUseExecute(!useExecute)
                  onSettingsChange({ ...settings, useExecute: !useExecute })
                }}
                label="Execute @s"
              />
              {exportFormat === "datapack" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Minecraft Version</label>
                  <select
                    value={minecraftVersion}
                    onChange={(e) => {
                      setMinecraftVersion(e.target.value)
                      onSettingsChange({ ...settings, minecraftVersion: e.target.value })
                    }}
                    className="w-full h-9 px-3 text-xs bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {Object.entries(packFormats).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.description} (format {val.format})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Animation Frames */}
        {hasAnimationModes && (
          <CollapsibleSection title="Animation Frames">
            <div className="space-y-3">
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                <button
                  onClick={() => {
                    setFrameMode("auto")
                    onFrameSettingsChange("auto")
                  }}
                  className={`flex-1 h-9 text-xs font-medium transition-all ${
                    frameMode === "auto"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Auto
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                  onClick={() => {
                    setFrameMode("manual")
                    onFrameSettingsChange("manual", manualFrameCount)
                  }}
                  className={`flex-1 h-9 text-xs font-medium transition-all ${
                    frameMode === "manual"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Manual
                </button>
              </div>
              <AnimatePresence>
                {frameMode === "manual" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Frame Count</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{manualFrameCount}</span>
                      </div>
                      <ElasticSlider
                        defaultValue={manualFrameCount}
                        onChange={(v) => {
                          setManualFrameCount(v)
                          onFrameSettingsChange("manual", v)
                        }}
                        startingValue={12}
                        maxValue={240}
                        stepSize={6}
                        isStepped={true}
                        size="lg"
                        leftIcon={<span className="text-xs">12</span>}
                        rightIcon={<span className="text-xs">240</span>}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* CODE VIEWER */}
      <div className="flex-shrink-0 border-t-2 border-gray-200">
        <div className="h-11 px-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span className="text-xs font-semibold text-gray-700">{codeLines.length} lines</span>
          </div>
          <button
            onClick={handleCopy}
            disabled={!code}
            className="h-7 px-3 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-purple-600 disabled:opacity-40 transition-colors rounded-md hover:bg-purple-50"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="h-72 relative bg-white border-t border-gray-100">
          <CodeViewer code={code} />
          {isGenerating && (
            <div className="absolute inset-0 bg-white/98 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Generating code...</span>
              <span className="text-xs text-gray-500 mt-1.5">Please wait</span>
            </div>
          )}
        </div>
      </div>

      {/* pack.mcmeta for Datapack */}
      {exportFormat === "datapack" && showPackMcmeta && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">pack.mcmeta</span>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(packMcmetaContent)
                toast({ title: "Copied pack.mcmeta", duration: 1500 })
              }}
              className="h-6 px-2 text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-2.5 overflow-x-auto">
            <pre className="text-[10px] text-gray-800 font-mono leading-[1.6]">
              {packMcmetaContent}
            </pre>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex-shrink-0 p-4 space-y-2 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!code}
            className="flex-1 h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all text-sm font-medium"
          >
            <Download size={14} />
            Download
          </button>
          <button
            onClick={handleShare}
            disabled={!code || isSharing}
            className="flex-1 h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all text-sm font-medium"
          >
            {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            Share
          </button>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-11 flex items-center justify-center gap-2 bg-purple-600 text-white rounded-md text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap size={16} />
              Generate Code
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <DatapackWarningModal
        isOpen={showDatapackWarning}
        onClose={() => setShowDatapackWarning(false)}
        unsupportedFeatures={unsupportedFeatures}
        exportFormat={exportFormat}
      />
    </div>
  )
}
