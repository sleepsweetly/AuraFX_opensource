"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { 
  Zap, 
  AlertTriangle, 
  Settings,
  Target,
  BarChart3,
  Sparkles,
  TrendingUp,
  Shield,
  Palette,
  Cpu,
  Gauge,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  ThumbsUp,
  AlertCircle,
  Siren,
  Flame,
  Snowflake,
  Zap as Lightning,
  Bomb,
  ShieldCheck,
  Tornado,
  Rainbow,
  Grid3X3,
  Ruler,
  Dice6,
  Crosshair
} from "lucide-react"

interface PerformanceOptimizerProps {
  currentLineCount: number
  onOptimize: (settings: OptimizationSettings) => void
  onApplyTemplate: (template: string) => void
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

export function PerformanceOptimizer({ 
  currentLineCount, 
  onOptimize, 
  onApplyTemplate 
}: PerformanceOptimizerProps) {
  const [settings, setSettings] = useState<OptimizationSettings>({
    maxLines: 20,
    mergeSimilarEffects: true,
    increaseInterval: true,
    compressionLevel: "medium",
    autoOptimize: false,
    samplingMethod: "grid",
    stepValue: 2
  })

  const getPerformanceLevel = (lines: number) => {
    if (lines <= 10) return { 
      level: "excellent", 
      color: "bg-white/20 border-white/30", 
      text: "Excellent",
      icon: <CheckCircle className="h-6 w-6 text-white/80" />,
      description: "Perfect performance"
    }
    if (lines <= 25) return { 
      level: "good", 
      color: "bg-white/15 border-white/25", 
      text: "Good",
      icon: <ThumbsUp className="h-6 w-6 text-white/80" />,
      description: "Good performance"
    }
    if (lines <= 50) return { 
      level: "warning", 
      color: "bg-white/10 border-white/20", 
      text: "Warning",
      icon: <AlertCircle className="h-6 w-6 text-white/80" />,
      description: "Performance warning"
    }
    return { 
      level: "danger", 
      color: "bg-white/5 border-white/15", 
      text: "Danger",
      icon: <Siren className="h-6 w-6 text-white/80" />,
      description: "Critical performance"
    }
  }

  const performance = getPerformanceLevel(currentLineCount)

  const handleOptimize = () => {
    onOptimize(settings)
  }

  return (
    <div className="h-full bg-[#000000] overflow-y-auto">
      {/* Compact Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Performance Optimizer</h2>
          <p className="text-white/50 text-xs font-medium">Optimize your effects</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Performance Status */}
        <div className="bg-white/3 border border-white/8 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-white/60" />
            <h3 className="text-white/80 text-sm font-semibold">Performance Status</h3>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                {performance.icon}
              </div>
              <div>
                <div className="text-sm text-white/60">Current Lines</div>
                <div className="text-2xl font-bold text-white">{currentLineCount.toLocaleString()}</div>
              </div>
            </div>
            <Badge className={`${performance.color} text-white px-3 py-1 text-sm font-semibold`}>
              {performance.text}
            </Badge>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Gauge className="w-4 h-4" />
              {performance.description}
            </div>
          </div>

          {currentLineCount > 25 && (
            <Alert className="border-white/20 bg-white/5">
              <AlertTriangle className="w-4 h-4 text-white/60" />
              <AlertDescription className="text-white/70">
                This effect may impact server performance. Consider optimization for better performance.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Optimization Settings */}
        <div className="bg-white/3 border border-white/8 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-white/60" />
            <h3 className="text-white/80 text-sm font-semibold">Optimization Settings</h3>
          </div>
          <p className="text-white/60 text-xs mb-4">Fine-tune your effect for optimal performance</p>
          
          <div className="space-y-4">
            {/* Max Line Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                  Max Line Count
                </label>
                <span className="text-sm text-white/60 bg-white/5 px-2 py-1 rounded border border-white/10">
                  {settings.maxLines.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[settings.maxLines]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, maxLines: value }))}
                max={10000}
                min={50}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>50</span>
                <span>10,000</span>
              </div>
            </div>

            {/* Switches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white/60" />
                    Merge Similar Effects
                  </label>
                  <p className="text-xs text-white/50">
                    Combines effects of the same type into single lines
                  </p>
                </div>
                <Switch
                  checked={settings.mergeSimilarEffects}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, mergeSimilarEffects: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-white/60" />
                    Increase Interval
                  </label>
                  <p className="text-xs text-white/50">
                    Automatically increases effect repeat intervals
                  </p>
                </div>
                <Switch
                  checked={settings.increaseInterval}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, increaseInterval: checked }))
                  }
                />
              </div>
            </div>

            {/* Compression Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1">
                <Shield className="w-3 h-3 text-white/60" />
                Compression Level
              </label>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { level: "low", label: "Low", desc: "Minimal", color: "bg-white/20 border-white/30" },
                  { level: "medium", label: "Medium", desc: "Balanced", color: "bg-white/15 border-white/25" },
                  { level: "high", label: "High", desc: "Aggressive", color: "bg-white/10 border-white/20" }
                ] as const).map((option) => (
                  <Button
                    key={option.level}
                    variant="outline"
                    size="sm"
                    className={`flex flex-col h-auto py-1 px-2 min-h-0 ${
                      settings.compressionLevel === option.level 
                        ? `${option.color} text-white` 
                        : 'bg-white/5 text-white/80 hover:bg-white/10 border-white/10 hover:border-white/20'
                    }`}
                    style={{fontSize: '0.85rem', lineHeight: 1.1}}
                    onClick={() => setSettings(prev => ({ ...prev, compressionLevel: option.level }))}
                  >
                    <span className="font-medium text-xs">{option.label}</span>
                    <span className="text-[10px] opacity-70">{option.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Sampling Method */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1">
                <Palette className="w-3 h-3 text-white/60" />
                Sampling Method
              </label>
              <p className="text-[10px] text-white/50 mb-1">
                Choose how to reduce element count while preserving image quality
              </p>
              <div className="grid grid-cols-2 gap-1">
                {([
                  { value: "grid", label: "Grid", desc: "Preserves shape", icon: <Grid3X3 className="w-4 h-4" /> },
                  { value: "step", label: "Step", desc: "Every N elements", icon: <Ruler className="w-4 h-4" /> },
                  { value: "random", label: "Random", desc: "Random selection", icon: <Dice6 className="w-4 h-4" /> },
                  { value: "center", label: "Center", desc: "Center priority", icon: <Crosshair className="w-4 h-4" /> }
                ] as const).map((method) => (
                  <Button
                    key={method.value}
                    variant="outline"
                    size="sm"
                    className={`flex flex-col h-auto py-1 px-2 min-h-0 items-center ${
                      settings.samplingMethod === method.value 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'bg-white/5 text-white/80 hover:bg-white/10 border-white/10 hover:border-white/20'
                    }`}
                    style={{fontSize: '0.85rem', lineHeight: 1.1}}
                    onClick={() => setSettings(prev => ({ ...prev, samplingMethod: method.value }))}
                  >
                    <div className="mb-0.5 text-white/60">{method.icon}</div>
                    <span className="font-medium text-xs">{method.label}</span>
                    <span className="text-[10px] opacity-70">{method.desc}</span>
                  </Button>
                ))}
              </div>
              {settings.samplingMethod === "step" && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-white/80 font-medium">Step Value</label>
                    <span className="text-xs text-white/60">{settings.stepValue}</span>
                  </div>
                  <Slider
                    value={[settings.stepValue || 2]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, stepValue: value }))}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleOptimize} 
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 py-2 text-sm font-semibold transition-all duration-200"
              style={{minHeight: 0, height: '2.2rem'}}
            >
              <Zap className="w-4 h-4 mr-1" />
              Optimize Effect
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}