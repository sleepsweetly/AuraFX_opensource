"use client"

import React, { useState } from "react"
import { 
  BarChart3,
  Settings,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ThumbsUp,
  AlertCircle,
  Siren,
  Zap,
  Cpu,
  Shield,
  Lightbulb,
  Gauge
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface PerformancePanelProps {
  currentLineCount?: number
  onOptimize?: (settings: OptimizationSettings) => void
  onApplyTemplate?: (template: string) => void
}

interface OptimizationSettings {
  maxLines: number
  mergeSimilarEffects: boolean
  increaseInterval: boolean
  compressionLevel: "low" | "medium" | "high"
  autoOptimize: boolean
  samplingMethod: "grid" | "step" | "random" | "center"
  stepValue?: number
}

export function PerformancePanel({ 
  currentLineCount = 0, 
  onOptimize = () => {}, 
  onApplyTemplate = () => {} 
}: PerformancePanelProps) {
  const [settings, setSettings] = useState<OptimizationSettings>({
    maxLines: 1000,
    mergeSimilarEffects: true,
    increaseInterval: true,
    compressionLevel: "medium",
    autoOptimize: false,
    samplingMethod: "grid",
    stepValue: 2
  })

  const [statusExpanded, setStatusExpanded] = useState(true)
  const [optimizationExpanded, setOptimizationExpanded] = useState(false)
  const [templatesExpanded, setTemplatesExpanded] = useState(false)

  const getPerformanceLevel = (lines: number) => {
    if (lines <= 10) return { 
      text: "Excellent",
      icon: <CheckCircle className="w-5 h-5 text-foreground" />,
      description: "Perfect performance"
    }
    if (lines <= 25) return { 
      text: "Good",
      icon: <ThumbsUp className="w-5 h-5 text-foreground" />,
      description: "Good performance"
    }
    if (lines <= 50) return { 
      text: "Warning",
      icon: <AlertCircle className="w-5 h-5 text-foreground" />,
      description: "Performance warning"
    }
    return { 
      text: "Danger",
      icon: <Siren className="w-5 h-5 text-foreground" />,
      description: "Critical performance"
    }
  }

  const performance = getPerformanceLevel(currentLineCount)

  const handleOptimize = () => {
    onOptimize(settings)
  }

  const compressionLevels = [
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" }
  ]

  const samplingMethods = [
    { id: "grid", name: "Grid" },
    { id: "step", name: "Step" },
    { id: "random", name: "Random" },
    { id: "center", name: "Center" }
  ]

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2 lg:px-0 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-muted text-foreground border-border/50">
            <Gauge className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-foreground">Performance</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fine-tune memory</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">

        {/* SECTION: PERFORMANCE STATUS */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setStatusExpanded(!statusExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Status</span>
            </div>
            {statusExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>

          {statusExpanded && (
            <div className="overflow-hidden bg-muted/10 border-t border-border/50">
              <div className="p-3 space-y-3">
                <div className="p-3 rounded-xl border border-border/50 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {performance.icon}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Lines</div>
                        <div className="text-xl font-bold text-foreground font-mono">{currentLineCount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-foreground text-background">
                      {performance.text}
                    </div>
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{performance.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION: OPTIMIZATION SETTINGS */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setOptimizationExpanded(!optimizationExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Optimization</span>
            </div>
            {optimizationExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>

          {optimizationExpanded && (
            <div className="overflow-hidden bg-muted/10 border-t border-border/50">
              <div className="p-3 space-y-4">
                
                {/* Max Lines */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase block text-foreground">Max Lines</label>
                    <span className="text-[10px] bg-muted text-foreground px-2 py-1 rounded font-mono">
                      {settings.maxLines.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50} max={10000} step={50}
                    value={settings.maxLines}
                    onChange={(e) => setSettings(p => ({ ...p, maxLines: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground uppercase tracking-widest">
                    <span>50</span>
                    <span>10k</span>
                  </div>
                </div>

                {/* Compression Level */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase block text-foreground">Compression</label>
                  <div className="flex gap-1 bg-muted/30 rounded-xl p-1 border border-border/50">
                    {compressionLevels.map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={() => setSettings(p => ({ ...p, compressionLevel: lvl.id as any }))}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                          settings.compressionLevel === lvl.id
                            ? "bg-foreground text-background shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lvl.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sampling Method */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase block text-foreground">Sampling</label>
                  <div className="grid grid-cols-2 gap-1 bg-muted/30 rounded-xl p-1 border border-border/50">
                    {samplingMethods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSettings(p => ({ ...p, samplingMethod: m.id as any }))}
                        className={`py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                          settings.samplingMethod === m.id
                            ? "bg-foreground text-background shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switches */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-2.5 bg-card border border-border/50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-foreground">Merge Similar</span>
                    <Switch
                      checked={settings.mergeSimilarEffects}
                      onCheckedChange={(v: boolean) => setSettings(p => ({ ...p, mergeSimilarEffects: v }))}
                      className="scale-[0.8] origin-right"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-card border border-border/50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-foreground">Inc. Interval</span>
                    <Switch
                      checked={settings.increaseInterval}
                      onCheckedChange={(v: boolean) => setSettings(p => ({ ...p, increaseInterval: v }))}
                      className="scale-[0.8] origin-right"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-card border border-border/50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-foreground">Auto Optimize</span>
                    <Switch
                      checked={settings.autoOptimize}
                      onCheckedChange={(v: boolean) => setSettings(p => ({ ...p, autoOptimize: v }))}
                      className="scale-[0.8] origin-right"
                    />
                  </div>
                </div>

                <button
                  onClick={handleOptimize}
                  className="w-full mt-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 border bg-foreground text-background border-foreground hover:opacity-90"
                >
                  <Zap className="w-3 h-3" />
                  Apply Optimization
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION: TEMPLATES */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setTemplatesExpanded(!templatesExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left text-foreground">Templates</span>
            </div>
            {templatesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>

          {templatesExpanded && (
            <div className="overflow-hidden bg-muted/10 border-t border-border/50">
              <div className="p-3 space-y-2">
                <button
                  onClick={() => onApplyTemplate("high-performance")}
                  className="w-full p-2.5 bg-card border border-border/50 rounded-xl hover:border-foreground/30 transition-colors text-left flex items-start gap-3"
                >
                  <Cpu className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-foreground">High Performance</div>
                    <div className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">Max optimization</div>
                  </div>
                </button>

                <button
                  onClick={() => onApplyTemplate("balanced")}
                  className="w-full p-2.5 bg-card border border-border/50 rounded-xl hover:border-foreground/30 transition-colors text-left flex items-start gap-3"
                >
                  <Shield className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-foreground">Balanced</div>
                    <div className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">Good balance</div>
                  </div>
                </button>

                <button
                  onClick={() => onApplyTemplate("quality-focused")}
                  className="w-full p-2.5 bg-card border border-border/50 rounded-xl hover:border-foreground/30 transition-colors text-left flex items-start gap-3"
                >
                  <Lightbulb className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-foreground">Quality Focused</div>
                    <div className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">Prioritize visuals</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
        
        input[type="range"].slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--foreground));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
        input[type="range"].slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--foreground));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
      `}</style>
    </div>
  )
}