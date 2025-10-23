"use client"

import React, { useState } from "react"
import { ElasticSlider } from "@/components/ui/elastic-slider"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gauge,
  AlertTriangle,
  Settings,
  BarChart3,
  TrendingUp,
  Shield,
  Cpu,
  Lightbulb,
  ChevronDown,
  CheckCircle,
  ThumbsUp,
  AlertCircle,
  Siren,
  Zap,
  Target
} from "lucide-react"

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
  onOptimize = () => { },
  onApplyTemplate = () => { }
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
      level: "excellent",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      text: "Excellent",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      description: "Perfect performance"
    }
    if (lines <= 25) return {
      level: "good",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      text: "Good",
      icon: <ThumbsUp className="h-5 w-5 text-blue-600" />,
      description: "Good performance"
    }
    if (lines <= 50) return {
      level: "warning",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      text: "Warning",
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      description: "Performance warning"
    }
    return {
      level: "danger",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      text: "Danger",
      icon: <Siren className="h-5 w-5 text-red-600" />,
      description: "Critical performance"
    }
  }

  const performance = getPerformanceLevel(currentLineCount)

  const handleOptimize = () => {
    onOptimize(settings)
  }

  const compressionLevels = [
    { id: "low", name: "Low", description: "Minimal optimization" },
    { id: "medium", name: "Medium", description: "Balanced optimization" },
    { id: "high", name: "High", description: "Maximum optimization" }
  ]

  const samplingMethods = [
    { id: "grid", name: "Grid", description: "Grid-based sampling" },
    { id: "step", name: "Step", description: "Step-based sampling" },
    { id: "random", name: "Random", description: "Random sampling" },
    { id: "center", name: "Center", description: "Center-focused sampling" }
  ]

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto scrollbar-hidden panel-container">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Performance</h3>
            <p className="text-sm text-gray-500">Optimize your effects for better performance</p>
          </div>
        </div>
      </div>

      {/* Performance Status Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setStatusExpanded(!statusExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">Performance Status</h4>
              <p className="text-xs text-gray-500">Current effect performance</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: statusExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {statusExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Performance Indicator */}
                <div className={`p-4 rounded-lg border ${performance.borderColor} ${performance.bgColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {performance.icon}
                      <div>
                        <div className="text-sm font-medium text-gray-900">Current Lines</div>
                        <div className="text-2xl font-bold text-gray-900">{currentLineCount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${performance.bgColor} ${performance.color}`}>
                      {performance.text}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{performance.description}</p>
                </div>

                {/* Performance Warning */}
                {currentLineCount > 25 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        This effect may impact server performance. Consider optimization.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Optimization Settings Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setOptimizationExpanded(!optimizationExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">Optimization Settings</h4>
              <p className="text-xs text-gray-500">Fine-tune performance options</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: optimizationExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {optimizationExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Max Lines */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Max Lines</span>
                    <span className="text-xs text-gray-500">{settings.maxLines.toLocaleString()}</span>
                  </div>
                  <ElasticSlider
                    defaultValue={settings.maxLines}
                    startingValue={50}
                    maxValue={10000}
                    stepSize={50}
                    isStepped={true}
                    size="lg"
                    onChange={(value) => setSettings(prev => ({ ...prev, maxLines: value }))}
                    leftIcon={<span className="text-xs">50</span>}
                    rightIcon={<span className="text-xs">10K</span>}
                  />
                </div>

                {/* Compression Level */}
                <div className="space-y-3">
                  <span className="text-sm font-medium text-gray-700">Compression Level</span>
                  <div className="grid grid-cols-3 gap-2">
                    {compressionLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSettings(prev => ({ ...prev, compressionLevel: level.id as any }))}
                        className={`p-2 rounded-lg border transition-all text-xs font-medium ${settings.compressionLevel === level.id
                          ? "border-gray-300 bg-gray-100 text-gray-900"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sampling Method */}
                <div className="space-y-3">
                  <span className="text-sm font-medium text-gray-700">Sampling Method</span>
                  <div className="grid grid-cols-2 gap-2">
                    {samplingMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSettings(prev => ({ ...prev, samplingMethod: method.id as any }))}
                        className={`p-2 rounded-lg border transition-all text-xs font-medium ${settings.samplingMethod === method.id
                          ? "border-gray-300 bg-gray-100 text-gray-900"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Merge Similar Effects</span>
                    <div
                      onClick={() => setSettings(prev => ({ ...prev, mergeSimilarEffects: !prev.mergeSimilarEffects }))}
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${settings.mergeSimilarEffects ? 'bg-gray-900' : 'bg-gray-200'
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${settings.mergeSimilarEffects ? 'left-5' : 'left-0.5'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Increase Interval</span>
                    <div
                      onClick={() => setSettings(prev => ({ ...prev, increaseInterval: !prev.increaseInterval }))}
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${settings.increaseInterval ? 'bg-gray-900' : 'bg-gray-200'
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${settings.increaseInterval ? 'left-5' : 'left-0.5'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Auto Optimize</span>
                    <div
                      onClick={() => setSettings(prev => ({ ...prev, autoOptimize: !prev.autoOptimize }))}
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${settings.autoOptimize ? 'bg-gray-900' : 'bg-gray-200'
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${settings.autoOptimize ? 'left-5' : 'left-0.5'
                          }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Optimize Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOptimize}
                  className="w-full py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Zap className="w-4 h-4" />
                  Apply Optimization
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Performance Templates Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setTemplatesExpanded(!templatesExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Target className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">Performance Templates</h4>
              <p className="text-xs text-gray-500">Quick optimization presets</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: templatesExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {templatesExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onApplyTemplate("high-performance")}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">High Performance</div>
                      <div className="text-xs text-gray-500">Maximum optimization for servers</div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onApplyTemplate("balanced")}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Balanced</div>
                      <div className="text-xs text-gray-500">Good balance of quality and performance</div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onApplyTemplate("quality-focused")}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Quality Focused</div>
                      <div className="text-xs text-gray-500">Prioritize visual quality over performance</div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .scrollbar-hidden {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  )
}