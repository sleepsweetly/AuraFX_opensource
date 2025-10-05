"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Slider } from "../ui/slider"
import { Switch } from "../ui/switch"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
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

interface PerformancePanelProps {
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

export function PerformancePanel({ 
  currentLineCount, 
  onOptimize, 
  onApplyTemplate 
}: PerformancePanelProps) {
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
      color: "bg-green-50 border-green-200 text-green-800", 
      text: "Excellent",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      description: "Perfect performance"
    }
    if (lines <= 25) return { 
      level: "good", 
      color: "bg-blue-50 border-blue-200 text-blue-800", 
      text: "Good",
      icon: <ThumbsUp className="h-6 w-6 text-blue-600" />,
      description: "Good performance"
    }
    if (lines <= 50) return { 
      level: "warning", 
      color: "bg-yellow-50 border-yellow-200 text-yellow-800", 
      text: "Warning",
      icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
      description: "Performance warning"
    }
    return { 
      level: "danger", 
      color: "bg-red-50 border-red-200 text-red-800", 
      text: "Danger",
      icon: <Siren className="h-6 w-6 text-red-600" />,
      description: "Critical performance"
    }
  }

  const performance = getPerformanceLevel(currentLineCount)

  const handleOptimize = () => {
    onOptimize(settings)
  }

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-md">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Performance Optimizer</h3>
            <p className="text-xs text-gray-500">Optimize your effects for better performance</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        {/* Performance Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-900">Performance Status</h4>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 border border-gray-200">
                {performance.icon}
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Lines</div>
                <div className="text-2xl font-bold text-gray-900">{currentLineCount.toLocaleString()}</div>
              </div>
            </div>
            <Badge className={`${performance.color} px-3 py-1 text-sm font-semibold`}>
              {performance.text}
            </Badge>
          </div>
          
          <div className="p-3 rounded-lg bg-white border border-gray-200 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Gauge className="w-4 h-4" />
              {performance.description}
            </div>
          </div>

          {currentLineCount > 25 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This effect may impact server performance. Consider optimization for better performance.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Optimization Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-900">Optimization Settings</h4>
          </div>
          <p className="text-gray-600 text-xs mb-4">Fine-tune your effect for optimal performance</p>
          
          <div className="space-y-4">
            {/* Max Line Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  Max Line Count
                </label>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
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
              <div className="flex justify-between text-xs text-gray-400">
                <span>50</span>
                <span>10,000</span>
              </div>
            </div>

            {/* Switches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-600" />
                    Merge Similar Effects
                  </label>
                  <p className="text-xs text-gray-500">
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

              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-600" />
                    Increase Interval
                  </label>
                  <p className="text-xs text-gray-500">
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
              <label className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                <Shield className="w-3 h-3 text-gray-600" />
                Compression Level
              </label>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { level: "low", label: "Low", desc: "Minimal", color: "bg-green-100 border-green-300 text-green-800" },
                  { level: "medium", label: "Medium", desc: "Balanced", color: "bg-blue-100 border-blue-300 text-blue-800" },
                  { level: "high", label: "High", desc: "Aggressive", color: "bg-red-100 border-red-300 text-red-800" }
                ] as const).map((option) => (
                  <Button
                    key={option.level}
                    variant="outline"
                    size="sm"
                    className={`flex flex-col h-auto py-1 px-2 min-h-0 ${
                      settings.compressionLevel === option.level 
                        ? `${option.color}` 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
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
              <label className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                <Palette className="w-3 h-3 text-gray-600" />
                Sampling Method
              </label>
              <p className="text-[10px] text-gray-500 mb-1">
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
                        ? 'bg-gray-100 text-gray-900 border-gray-300' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                    style={{fontSize: '0.85rem', lineHeight: 1.1}}
                    onClick={() => setSettings(prev => ({ ...prev, samplingMethod: method.value }))}
                  >
                    <div className="mb-0.5 text-gray-600">{method.icon}</div>
                    <span className="font-medium text-xs">{method.label}</span>
                    <span className="text-[10px] opacity-70">{method.desc}</span>
                  </Button>
                ))}
              </div>
              {settings.samplingMethod === "step" && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-900 font-medium">Step Value</label>
                    <span className="text-xs text-gray-600">{settings.stepValue}</span>
                  </div>
                  <Slider
                    value={[settings.stepValue || 2]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, stepValue: value }))}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleOptimize} 
              className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white py-2 text-sm font-semibold transition-all duration-200 shadow-lg"
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