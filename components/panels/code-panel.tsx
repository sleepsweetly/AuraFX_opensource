"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { Download, Eye, Copy, Loader2, Sparkles, Check, Info, Code2, Play, Zap, Target, MessageCircle, Share2 } from "lucide-react"
import type { Layer } from "@/types"

import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { siteConfig, getDiscordInviteUrl } from "@/lib/config"
import { useEffect, useRef, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Virtual Code Display Component for better performance
function VirtualCodeDisplay({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleLines, setVisibleLines] = useState<{ start: number; end: number }>({ start: 0, end: 50 })


  const lines = code.split('\n')
  const lineHeight = 24 // pixels per line (increased for better readability)
  const containerHeight = 400 // max height of container
  const visibleCount = Math.ceil(containerHeight / lineHeight)
  const totalHeight = lines.length * lineHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop

    const startIndex = Math.floor(scrollTop / lineHeight)
    const endIndex = Math.min(startIndex + visibleCount + 10, lines.length) // +10 for buffer

    setVisibleLines({ start: Math.max(0, startIndex - 5), end: endIndex }) // -5 for buffer
  }, [lineHeight, visibleCount, lines.length])

  useEffect(() => {
    // Initialize visible lines
    setVisibleLines({ start: 0, end: Math.min(50, lines.length) })
  }, [code, lines.length])

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-white/60" />
          <span className="text-white/60 text-sm font-medium">Generated Code</span>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded border border-white/10">
            {lines.length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">MythicMobs Skill</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-white/5 border border-white/10 rounded-lg overflow-auto font-mono text-sm"
        style={{ height: `${Math.min(containerHeight, totalHeight)}px` }}
        onScroll={handleScroll}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: `${visibleLines.start * lineHeight}px`,
              width: '100%'
            }}
          >
            {lines.slice(visibleLines.start, visibleLines.end).map((line, index) => (
              <div
                key={visibleLines.start + index}
                className="text-white px-4 hover:bg-white/5 transition-colors flex items-center"
                style={{
                  height: `${lineHeight}px`,
                  minHeight: `${lineHeight}px`,
                  maxHeight: `${lineHeight}px`
                }}
              >
                <span className="text-white/40 text-xs mr-4 select-none inline-block w-8 text-right flex-shrink-0">
                  {visibleLines.start + index + 1}
                </span>
                <span className="text-white/90 flex-1 truncate">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  const [showCode, setShowCode] = useState(false)
  const [copyWarned, setCopyWarned] = useState(false)
  const [showCopyWarning, setShowCopyWarning] = useState(false)
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl)
  
  // Share modal states
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareEffectName, setShareEffectName] = useState("")
  const [shareDescription, setShareDescription] = useState("")
  const [shareCategory, setShareCategory] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  // Auto-fill effect name from settings
  useEffect(() => {
    if (settings.skillName && !shareEffectName) {
      setShareEffectName(settings.skillName)
    }
  }, [settings.skillName, shareEffectName])

  // Update Discord URL from GitHub
  useEffect(() => {
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, [])

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
      title: "Code saved!",
      description: "The generated code has been downloaded as a .yaml file.",
      duration: 2000,
      variant: "default",
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
      const textArea = document.createElement("textarea")
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "The generated code has been copied to your clipboard.",
        duration: 2000,
        variant: "default",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy code to clipboard.",
        duration: 2000,
        variant: "destructive",
      })
    }
  }

  const shareToDiscord = async () => {
    if (!shareEffectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an effect name.",
        duration: 2000,
        variant: "destructive",
      })
      return
    }

    setIsSharing(true)

    try {
      // İki ayrı webhook URL'i (env üzerinden opsiyonel)
      const embedWebhookUrl = process.env.NEXT_PUBLIC_DISCORD_EMBED_WEBHOOK_URL
      const fileWebhookUrl = process.env.NEXT_PUBLIC_DISCORD_FILE_WEBHOOK_URL

      if (!embedWebhookUrl || !fileWebhookUrl) {
        toast({
          title: "Share disabled",
          description: "Discord webhooks are not configured.",
          duration: 2500,
          variant: "destructive",
        })
        setIsSharing(false)
        return
      }

      const effectFileName = `${shareEffectName.replace(/[^a-zA-Z0-9]/g, "_")}_effect.yaml`
      const effectFile = new Blob([code], { type: "text/yaml" })

      // 1. Önce dosyayı file webhook'a gönder
      const fileFormData = new FormData()
      fileFormData.append("file", effectFile, effectFileName)
      fileFormData.append("payload_json", JSON.stringify({
        username: "Aurafxe Bot",
        content: `**${shareEffectName}** - Effect File`
      }))

      const fileResponse = await fetch(fileWebhookUrl, {
        method: "POST",
        body: fileFormData,
      })

      if (!fileResponse.ok) {
        const errorText = await fileResponse.text()
        throw new Error(`File webhook error: ${fileResponse.status} - ${errorText}`)
      }

      const fileResult = await fileResponse.json()
      const downloadUrl = fileResult.attachments?.[0]?.url

      if (!downloadUrl) {
        throw new Error("Could not get file download URL")
      }

      // 2. Sonra embed'i embed webhook'a gönder
      const embedPayload = {
        username: "Aurafxe Bot",
        embeds: [
          {
            author: {
              name: "**AuraFX**",
              icon_url: "https://www.aurafx.online/icon.png",
            },
            title: "**✨ New Effect Shared!**",
            description: `**${shareEffectName}**\n\n**${
              shareDescription ||
              "A new particle effect has been shared with the community."
            }**\n\n**[📥 Click to Download](${downloadUrl})**`,
            fields: [
              {
                name: "**📂 Category**",
                value: `**${shareCategory || "General"}**`,
                inline: true,
              },
              {
                name: "**📊 Code Lines**",
                value: `**${code.split("\n").length} lines**`,
                inline: true,
              },
              {
                name: "**⚡ Performance**",
                value: `**Optimized for MythicMobs**`,
                inline: true,
              },
              {
                name: "**🔧 Usage**",
                value: `**Download the file from the link above and add it to your MythicMobs skills folder. The effect will be automatically available in your server!**`,
                inline: false,
              },
            ],
            color: 0x2F3136,
            footer: { text: "**Aurafxe Community • Particle Effect Generator**" },
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
        const errorText = await embedResponse.text()
        throw new Error(`Embed webhook error: ${embedResponse.status} - ${errorText}`)
      }

      toast({
        title: "Shared successfully!",
        description:
          "Your effect has been shared to Discord with a direct download link.",
        duration: 3000,
        variant: "default",
      })

      setShowShareModal(false)
      setShareEffectName("")
      setShareDescription("")
      setShareCategory("")
    } catch (error) {
      toast({
        title: "Share failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not share to Discord. Please try again.",
        duration: 3000,
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  // Aktif modları okunaklı şekilde listele
  const activeModes = modes
    ? Object.entries(modes)
      .filter(([_, active]) => active)
      .map(([mode]) => mode.charAt(0).toUpperCase() + mode.slice(1).replace(/Mode$/, ""))
    : []

  return (
    <section className="flex-1 h-full flex flex-col bg-[#000000] overflow-y-auto">
      {/* Floating Header with Stats */}
      <div className="sticky top-0 z-10 bg-[#000000]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Code Generator</h2>
              <p className="text-white/50 text-sm">Generate MythicMobs skills</p>
            </div>
          </div>

          {/* Active Modes & Stats */}
          <div className="flex items-center gap-3">
            {activeModes.length > 0 && (
              <div className="flex gap-2">
                {activeModes.slice(0, 3).map((mode) => (
                  <span
                    key={mode}
                    className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white/80 px-3 py-1.5 rounded-full text-xs font-medium"
                  >
                    {mode}
                  </span>
                ))}
                {activeModes.length > 3 && (
                  <span className="bg-white/5 border border-white/10 text-white/40 px-3 py-1.5 rounded-full text-xs">
                    +{activeModes.length - 3}
                  </span>
                )}
              </div>
            )}

            {code && (
              <div className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 font-semibold">
                {code.split("\n").length} lines
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Settings */}
          <div className="lg:col-span-1 space-y-4">
            {/* Skill Configuration Card */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-white/60" />
                <h3 className="text-white/80 text-sm font-semibold">Skill Configuration</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-white/60 text-xs font-medium block mb-2">Skill Name</Label>
                  <Input
                    type="text"
                    value={settings.skillName}
                    onChange={(e) => onSettingsChange({ ...settings, skillName: e.target.value })}
                    className="bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm transition-all"
                    placeholder="Enter skill name..."
                  />
                </div>

                <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-sm font-medium">MythicMobs Optimizer</span>
                    <span className="bg-white/10 border border-white/20 text-white/60 px-1.5 py-0.5 rounded text-xs">
                      BETA
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">Thanks Mikekevie </span>
                    <Switch
                      id="optimize-toggle"
                      checked={optimize}
                      onCheckedChange={setOptimize}
                      className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20 border-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Animation Settings Card */}
            {(modes.rotateMode || modes.rainbowMode || modes.riseMode || modes.localRotateMode || modes.moveMode) && (
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5 text-white/60" />
                  <h3 className="text-white/80 text-sm font-semibold">Animation Settings</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setFrameMode("auto")
                        if (onFrameSettingsChange) {
                          onFrameSettingsChange("auto")
                        }
                      }}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${frameMode === "auto"
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-white/60 hover:text-white/80 hover:bg-white/10"
                        }`}
                    >
                      Auto Frames
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFrameMode("manual")
                        if (onFrameSettingsChange) {
                          onFrameSettingsChange("manual", manualFrameCount)
                        }
                      }}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${frameMode === "manual"
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-white/60 hover:text-white/80 hover:bg-white/10"
                        }`}
                    >
                      Manual
                    </button>
                  </div>

                  <AnimatePresence>
                    {frameMode === "manual" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <Label className="text-xs text-white/60 font-medium">Frame Count:</Label>
                            <span className="text-sm text-white/80 font-semibold">{manualFrameCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = Math.max(1, manualFrameCount - 10)
                                setManualFrameCount(newVal)
                                if (onFrameSettingsChange) {
                                  onFrameSettingsChange("manual", newVal)
                                }
                              }}
                              className="w-8 h-8 bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-lg transition-all text-sm font-bold flex items-center justify-center"
                            >
                              −
                            </button>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              value={manualFrameCount}
                              onChange={handleManualFrameChange}
                              className="flex-1 h-8 bg-white/5 border border-white/20 text-white text-xs rounded-lg px-2 text-center focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = Math.min(1000, manualFrameCount + 10)
                                setManualFrameCount(newVal)
                                if (onFrameSettingsChange) {
                                  onFrameSettingsChange("manual", newVal)
                                }
                              }}
                              className="w-8 h-8 bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-lg transition-all text-sm font-bold flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-white/60" />
                <h3 className="text-white/80 text-sm font-semibold">Quick Info</h3>
              </div>
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                  <span>Optimize for better performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                  <span>Download as .yaml file</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                  <span>Copy to clipboard instantly</span>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column - Actions & Code */}
          <div className="lg:col-span-2 space-y-4">
            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={copyCode}
                disabled={!code}
                size="lg"
                className={`w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-200 h-12 ${copied ? "bg-white/20 text-white border-white/30" : ""
                  }`}
              >
                <motion.div
                  initial={false}
                  animate={copied ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                </motion.div>
                <span className="whitespace-nowrap">{copied ? "Copied!" : "Copy Code"}</span>
              </Button>

              <Button
                onClick={downloadCode}
                disabled={!code}
                size="lg"
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-200 h-12"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Download</span>
              </Button>

              <Button
                onClick={() => setShowCode(!showCode)}
                disabled={!code}
                size="lg"
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-white/20 transition-all h-12"
              >
                <Eye className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">{showCode ? "Hide Code" : "Show Code"}</span>
              </Button>
            </div>

            {/* Code Display Area */}
            {showCode && code && <VirtualCodeDisplay code={code} />}

            {/* Generate Button - Full Width */}
            <Button
              onClick={() => onGenerateCode(optimize)}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 font-semibold py-3 text-base transition-all duration-200 h-12"
              disabled={!!isGenerating}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5 mr-2" />
                  </motion.div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  <span>Generate Code</span>
                </>
              )}
            </Button>

            {/* Discord Community Section - Compact & Balanced */}
            <div className="bg-gradient-to-br from-[#5865F2]/12 to-[#4752C4]/8 border border-[#5865F2]/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                </div>
                <div>
                  <h3 className="text-white/90 text-base font-semibold">Join Discord Community</h3>
                  <p className="text-white/50 text-xs">Connect & share with creators</p>
                </div>
              </div>
              <p className="text-white/60 text-xs mb-4 leading-relaxed max-w-sm mx-auto">
                Get help, share effects, and stay updated with latest features.
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href={discordUrl}
                  suppressHydrationWarning={true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Join Discord
                </a>
                
                <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!code}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-medium rounded-lg"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Effect
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/95 border border-white/20 text-white max-w-md z-[9999]">
                    <DialogHeader>
                      <DialogTitle className="text-white/90 text-lg font-semibold">Share Effect to Discord</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white/70 text-sm font-medium">Effect Name *</Label>
                        <Input
                          value={shareEffectName}
                          onChange={(e) => setShareEffectName(e.target.value)}
                          placeholder="Enter effect name..."
                          className="bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 rounded-lg px-3 py-2.5 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm font-medium">Description</Label>
                        <Textarea
                          value={shareDescription}
                          onChange={(e) => setShareDescription(e.target.value)}
                          placeholder="Optional description..."
                          className="bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 rounded-lg px-3 py-2.5 text-sm mt-1 resize-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm font-medium">Category</Label>
                        <Select value={shareCategory} onValueChange={setShareCategory}>
                          <SelectTrigger className="bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 rounded-lg px-3 py-2.5 text-sm mt-1">
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 border border-white/20 text-white z-[10000]">
                            <SelectItem value="Aura" className="text-white hover:bg-white/10">Aura</SelectItem>
                            <SelectItem value="Explosion" className="text-white hover:bg-white/10">Explosion</SelectItem>
                            <SelectItem value="Magic" className="text-white hover:bg-white/10">Magic</SelectItem>
                            <SelectItem value="Combat" className="text-white hover:bg-white/10">Combat</SelectItem>
                            <SelectItem value="Utility" className="text-white hover:bg-white/10">Utility</SelectItem>
                            <SelectItem value="Decorative" className="text-white hover:bg-white/10">Decorative</SelectItem>
                            <SelectItem value="Other" className="text-white hover:bg-white/10">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={shareToDiscord}
                          disabled={isSharing || !shareEffectName.trim()}
                          className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-all duration-200"
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
                            <>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share to Discord
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowShareModal(false)}
                          variant="outline"
                          className="bg-white/5 hover:bg-white/10 text-white/80 border border-white/20 hover:border-white/30"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Warning */}
      {showCopyWarning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 mb-4 bg-white/5 border border-white/20 text-white/80 text-sm rounded-lg px-4 py-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-white/60" />
            <span className="font-semibold">Large Code Warning</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Copying very large code may be slow or fail in your browser.
            <br />
            For best results, use the <strong>Download</strong> button to save as a .yaml file.
            <br />
            <em>(Click Copy again to try anyway.)</em>
          </p>
        </motion.div>
      )}

      {/* Modern Switch Styling & Code Syntax */}
      <style jsx global>{`
        /* Improved switch styling for better visual consistency */
        .switch[data-state="checked"] {
          background: linear-gradient(135deg, #ffffff, #f3f4f6) !important;
          border: 1px solid #ffffff !important;
        }
        .switch[data-state="unchecked"] {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .switch {
          transition: all 0.2s ease !important;
          width: 44px !important;
          height: 24px !important;
        }
        .switch:hover {
          transform: scale(1.02) !important;
        }
        .switch[data-state="checked"] .switch-thumb {
          background: #000000 !important;
        }
        .switch[data-state="unchecked"] .switch-thumb {
          background: #ffffff !important;
        }
        
        /* Code Syntax Highlighting */
        .code-output {
          background: #000000 !important;
          color: #ffffff !important;
          font-family: 'Consolas', 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          font-size: 13px !important;
          line-height: 1.6 !important;
          letter-spacing: 0.5px !important;
          font-weight: 500 !important;
        }
        
        .code-output::selection {
          background: rgba(255, 255, 255, 0.2) !important;
        }
        
        .code-output::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .code-output::-webkit-scrollbar-track {
          background: #111111;
          border-radius: 4px;
        }
        
        .code-output::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        
        .code-output::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </section>
  )
}