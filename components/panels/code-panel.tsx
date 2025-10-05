"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Download,
  Eye,
  Copy,
  Loader2,
  Sparkles,
  Check,
  Info,
  Code2,
  Zap,
  MessageCircle,
  Share2,
  FileCode,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { Layer } from "@/types"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useDiscordUrl } from "@/hooks/use-discord-url"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function CompactCodeDisplay({ code, isVisible }: { code: string; isVisible: boolean }) {
  const lines = code.split("\n")

  if (!isVisible) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center space-y-2">
          <EyeOff className="w-6 h-6 text-gray-400 mx-auto" />
          <p className="text-xs text-gray-500">Preview hidden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-48 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex-shrink-0 px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
          <span className="text-xs font-mono text-gray-600">effect.yaml</span>
        </div>
        <span className="text-[10px] text-gray-500">{lines.length} lines</span>
      </div>

      <div className="flex-1 overflow-auto compact-scrollbar">
        <div className="font-mono text-[10px] leading-relaxed">
          {lines.slice(0, 50).map((line, index) => (
            <div key={index} className="flex hover:bg-gray-50 transition-colors">
              <span className="flex-shrink-0 text-gray-400 text-right px-2 py-0.5 select-none w-10 bg-gray-50/50">
                {index + 1}
              </span>
              <span className="px-3 py-0.5 flex-1 text-gray-700">{line || " "}</span>
            </div>
          ))}
          {lines.length > 50 && (
            <div className="px-3 py-2 text-center text-[10px] text-gray-400 bg-gray-50">
              ... {lines.length - 50} more lines
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .compact-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .compact-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .compact-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .compact-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}

interface CodePanelProps {
  code: string
  onGenerateCode: (optimize?: boolean) => Promise<void>
  onShowElementSettings?: () => void
  isGenerating?: boolean
  settings: {
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
  }
  onSettingsChange: (settings: any) => void
  layers: Layer[]
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void
  currentLayer: Layer | null
  modes: {
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
  optimize: boolean
  setOptimize: (v: boolean) => void
}

export function CodePanel({
  code,
  onGenerateCode,
  onFrameSettingsChange,
  modes,
  settings,
  onSettingsChange,
  isGenerating,
  optimize,
  setOptimize,
}: CodePanelProps) {
  const [frameMode, setFrameMode] = useState<"auto" | "manual">("auto")
  const [manualFrameCount, setManualFrameCount] = useState(120)
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const [copyWarned, setCopyWarned] = useState(false)
  const [showCopyWarning, setShowCopyWarning] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareEffectName, setShareEffectName] = useState("")
  const [shareDescription, setShareDescription] = useState("")
  const [shareCategory, setShareCategory] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    settings: true,
    frames: false,
    preview: true,
  })

  useEffect(() => {
    if (settings.skillName && !shareEffectName) {
      setShareEffectName(settings.skillName)
    }
  }, [settings.skillName, shareEffectName])

  const { discordUrl, isLoaded } = useDiscordUrl()

  const handleManualFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Number.parseInt(e.target.value) || 1)
    setManualFrameCount(val)
    if (onFrameSettingsChange) {
      onFrameSettingsChange("manual", val)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "effect.yaml"
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded",
      description: "Effect saved as effect.yaml",
      duration: 2000,
    })
  }

  const copyCode = () => {
    if (code.length > 25000 && !copyWarned) {
      setShowCopyWarning(true)
      setCopyWarned(true)
      return
    }
    setShowCopyWarning(false)
    try {
      navigator.clipboard.writeText(code)
      setCopied(true)
      toast({
        title: "Copied",
        description: "Code copied to clipboard",
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        duration: 2000,
        variant: "destructive",
      })
    }
  }

  const shareToDiscord = async () => {
    if (!shareEffectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an effect name",
        duration: 2000,
        variant: "destructive",
      })
      return
    }

    setIsSharing(true)

    try {
      const embedWebhookUrl = process.env.NEXT_PUBLIC_DISCORD_EMBED_WEBHOOK_URL
      const fileWebhookUrl = process.env.NEXT_PUBLIC_DISCORD_FILE_WEBHOOK_URL

      if (!embedWebhookUrl || !fileWebhookUrl) {
        toast({
          title: "Share disabled",
          description: "Discord webhooks not configured",
          duration: 2500,
          variant: "destructive",
        })
        setIsSharing(false)
        return
      }

      const effectFileName = `${shareEffectName.replace(/[^a-zA-Z0-9]/g, "_")}_effect.yaml`
      const effectFile = new Blob([code], { type: "text/yaml" })

      const fileFormData = new FormData()
      fileFormData.append("file", effectFile, effectFileName)
      fileFormData.append(
        "payload_json",
        JSON.stringify({
          username: "AuraFX Bot",
          content: `**${shareEffectName}** - Effect File`,
        }),
      )

      const fileResponse = await fetch(fileWebhookUrl, {
        method: "POST",
        body: fileFormData,
      })

      if (!fileResponse.ok) {
        throw new Error(`File upload failed: ${fileResponse.status}`)
      }

      const fileResult = await fileResponse.json()
      const downloadUrl = fileResult.attachments?.[0]?.url

      if (!downloadUrl) {
        throw new Error("Could not get download URL")
      }

      const embedPayload = {
        username: "AuraFX Bot",
        embeds: [
          {
            author: {
              name: "AuraFX Effect Generator",
              icon_url: "https://www.aurafx.online/icon.png",
            },
            title: "New Effect Shared",
            description: `**${shareEffectName}**\n\n${shareDescription || "A new particle effect has been shared with the community."}\n\n[Download Effect](${downloadUrl})`,
            fields: [
              {
                name: "Category",
                value: shareCategory || "General",
                inline: true,
              },
              {
                name: "Lines",
                value: `${code.split("\n").length} lines`,
                inline: true,
              },
              {
                name: "Optimized",
                value: optimize ? "Yes" : "No",
                inline: true,
              },
            ],
            color: 0x6b7280,
            footer: { text: "AuraFX Community" },
            timestamp: new Date().toISOString(),
          },
        ],
      }

      const embedResponse = await fetch(embedWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embedPayload),
      })

      if (!embedResponse.ok) {
        throw new Error(`Embed failed: ${embedResponse.status}`)
      }

      toast({
        title: "Shared successfully",
        description: "Effect shared to Discord community",
        duration: 3000,
      })

      setShowShareModal(false)
      setShareEffectName("")
      setShareDescription("")
      setShareCategory("")
    } catch (error) {
      toast({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Could not share to Discord",
        duration: 3000,
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const hasAnimationModes =
    modes.rotateMode || modes.rainbowMode || modes.riseMode || modes.localRotateMode || modes.moveMode

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto compact-scrollbar">
      {/* Compact Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-md">
            <FileCode className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Code Generator</h3>
            <p className="text-xs text-gray-500">Configure & export effect</p>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex-shrink-0 mb-3">
        <button
          onClick={() => toggleSection("settings")}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors mb-2"
        >
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Settings</span>
          {expandedSections.settings ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.settings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mb-3"
            >
              {/* Skill Name */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                <Label className="text-xs font-medium text-gray-700">Skill Name</Label>
                <Input
                  type="text"
                  value={settings.skillName}
                  onChange={(e) => onSettingsChange({ ...settings, skillName: e.target.value })}
                  placeholder="Enter name..."
                  className="h-9 text-sm bg-gray-50 border-gray-300 text-gray-900"
                />
              </div>

              {/* Optimizer */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-900">Optimizer</span>
                        <span className="text-[9px] bg-gray-200 text-gray-700 px-1 py-0.5 rounded font-bold">BETA</span>
                      </div>
                      <p className="text-[10px] text-gray-500">For Circle</p>
                    </div>
                  </div>
                  <Switch checked={optimize} onCheckedChange={setOptimize} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frame Settings Section */}
      {hasAnimationModes && (
        <div className="flex-shrink-0 mb-3">
          <button
            onClick={() => toggleSection("frames")}
            className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors mb-2"
          >
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Animation Frames</span>
            {expandedSections.frames ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.frames && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mb-3"
              >
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => {
                      setFrameMode("auto")
                      if (onFrameSettingsChange) {
                        onFrameSettingsChange("auto")
                      }
                    }}
                    className={`w-full px-3 py-2.5 text-xs font-medium text-left transition-all border-b border-gray-200 ${frameMode === "auto" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Auto Mode</span>
                      {frameMode === "auto" && <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFrameMode("manual")
                      if (onFrameSettingsChange) {
                        onFrameSettingsChange("manual", manualFrameCount)
                      }
                    }}
                    className={`w-full px-3 py-2.5 text-xs font-medium text-left transition-all ${frameMode === "manual" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Manual Mode</span>
                      {frameMode === "manual" && <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />}
                    </div>
                  </button>
                </div>

                {frameMode === "manual" && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Frame Count</span>
                      <span className="text-sm font-bold text-gray-900">{manualFrameCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVal = Math.max(1, manualFrameCount - 10)
                          setManualFrameCount(newVal)
                          if (onFrameSettingsChange) {
                            onFrameSettingsChange("manual", newVal)
                          }
                        }}
                        className="h-8 w-8 p-0 text-xs text-gray-900"
                      >
                        −
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={manualFrameCount}
                        onChange={handleManualFrameChange}
                        className="flex-1 text-center h-8 text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVal = Math.min(1000, manualFrameCount + 10)
                          setManualFrameCount(newVal)
                          if (onFrameSettingsChange) {
                            onFrameSettingsChange("manual", newVal)
                          }
                        }}
                        className="h-8 w-8 p-0 text-xs text-gray-900"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Code Preview Section */}
      <div className="flex-shrink-0 mb-3">
        <button
          onClick={() => toggleSection("preview")}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors mb-2"
        >
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Code Preview</span>
          {expandedSections.preview ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.preview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              {code ? (
                <CompactCodeDisplay code={code} isVisible={showCode} />
              ) : (
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center space-y-2">
                    <Code2 className="w-8 h-8 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">No code yet</p>
                      <p className="text-[10px] text-gray-500">Generate to preview</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning */}
      {showCopyWarning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-shrink-0 bg-gray-100 border border-gray-300 rounded-lg p-3 mb-3"
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-900 mb-0.5">Large Code</p>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Consider downloading. Click Copy again to proceed.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex-shrink-0 space-y-2">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={copyCode}
            disabled={!code}
            variant="outline"
            size="sm"
            className="h-9 bg-white hover:bg-gray-50 border-gray-300 text-gray-900"
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>

          <Button
            onClick={downloadCode}
            disabled={!code}
            variant="outline"
            size="sm"
            className="h-9 bg-white hover:bg-gray-50 border-gray-300 text-gray-900"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => setShowCode(!showCode)}
            disabled={!code}
            variant="outline"
            size="sm"
            className="h-9 bg-white hover:bg-gray-50 border-gray-300 text-gray-900"
            title="Toggle View"
          >
            {showCode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>

          {isLoaded && (
            <a href={discordUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 bg-white hover:bg-gray-50 border-gray-300 text-gray-900"
                title="Discord"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>

        {/* Share Button */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogTrigger asChild>
            <Button
              disabled={!code}
              variant="outline"
              size="sm"
              className="w-full h-9 bg-white hover:bg-gray-50 border-gray-300 text-gray-900"
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              <span className="text-xs">Share to Community</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share to Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Effect Name *</Label>
                <Input
                  value={shareEffectName}
                  onChange={(e) => setShareEffectName(e.target.value)}
                  placeholder="Enter name..."
                  className="bg-gray-50 border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Description</Label>
                <Textarea
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="Optional..."
                  className="resize-none bg-gray-50 border-gray-300"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Category</Label>
                <Select value={shareCategory} onValueChange={setShareCategory}>
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aura">Aura</SelectItem>
                    <SelectItem value="Explosion">Explosion</SelectItem>
                    <SelectItem value="Magic">Magic</SelectItem>
                    <SelectItem value="Combat">Combat</SelectItem>
                    <SelectItem value="Utility">Utility</SelectItem>
                    <SelectItem value="Decorative">Decorative</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={shareToDiscord}
                  disabled={isSharing || !shareEffectName.trim()}
                  className="flex-1 bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-700 hover:to-gray-500"
                >
                  {isSharing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Loader2 className="w-4 h-4 mr-2" />
                      </motion.div>
                      Sharing...
                    </>
                  ) : (
                    "Share"
                  )}
                </Button>
                <Button onClick={() => setShowShareModal(false)} variant="outline" className="border-gray-300 text-gray-900">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate Button */}
        <Button
          onClick={() => onGenerateCode(optimize)}
          disabled={!!isGenerating}
          className="w-full h-11 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white shadow-lg font-semibold text-sm"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Loader2 className="w-4 h-4 mr-2" />
              </motion.div>
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Code
            </>
          )}
        </Button>
      </div>

      <style jsx>{`
        .compact-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .compact-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .compact-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .compact-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}
