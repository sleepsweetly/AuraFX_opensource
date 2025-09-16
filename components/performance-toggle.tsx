"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Zap, Settings, Gauge, AlertTriangle } from "lucide-react"

interface PerformanceToggleProps {
  elementCount: number
  onPerformanceModeChange: (enabled: boolean) => void
  onLODChange: (enabled: boolean) => void
  onBatchSizeChange: (size: number) => void
}

export function PerformanceToggle({ 
  elementCount, 
  onPerformanceModeChange, 
  onLODChange,
  onBatchSizeChange 
}: PerformanceToggleProps) {
  const [performanceMode, setPerformanceMode] = useState(elementCount > 1000)
  const [lodEnabled, setLODEnabled] = useState(elementCount > 5000)
  const [batchSize, setBatchSize] = useState(100)
  
  const handlePerformanceModeToggle = (enabled: boolean) => {
    setPerformanceMode(enabled)
    onPerformanceModeChange(enabled)
    
    // Auto-enable LOD for very large scenes
    if (enabled && elementCount > 5000) {
      setLODEnabled(true)
      onLODChange(true)
    }
  }
  
  const getPerformanceRecommendation = () => {
    if (elementCount < 1000) return { level: "good", message: "Performance is optimal" }
    if (elementCount < 5000) return { level: "warning", message: "Consider enabling performance mode" }
    return { level: "critical", message: "Enable all optimizations for better performance" }
  }
  
  const recommendation = getPerformanceRecommendation()
  
  return (
    <Card className="w-80 bg-black/90 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4" />
          Performance Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Element Count Display */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-sm">Elements</span>
          <span className="font-mono text-lg">{elementCount.toLocaleString()}</span>
        </div>
        
        {/* Recommendation */}
        <div className={`p-3 rounded-lg border ${
          recommendation.level === 'good' ? 'bg-green-500/20 border-green-500/30' :
          recommendation.level === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30' :
          'bg-red-500/20 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {recommendation.level === 'critical' && <AlertTriangle className="h-4 w-4" />}
            <span className="text-xs">{recommendation.message}</span>
          </div>
        </div>
        
        {/* Performance Mode */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Performance Mode</span>
            </div>
            <p className="text-xs text-white/60">Reduces visual quality for better FPS</p>
          </div>
          <Switch
            checked={performanceMode}
            onCheckedChange={handlePerformanceModeToggle}
          />
        </div>
        
        {/* LOD System */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Level of Detail</span>
            </div>
            <p className="text-xs text-white/60">Reduces detail for distant objects</p>
          </div>
          <Switch
            checked={lodEnabled}
            onCheckedChange={(enabled) => {
              setLODEnabled(enabled)
              onLODChange(enabled)
            }}
          />
        </div>
        
        {/* Batch Size */}
        {performanceMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Batch Size: {batchSize}</label>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={batchSize}
              onChange={(e) => {
                const size = parseInt(e.target.value)
                setBatchSize(size)
                onBatchSizeChange(size)
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>50</span>
              <span>500</span>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => {
              setPerformanceMode(true)
              setLODEnabled(true)
              onPerformanceModeChange(true)
              onLODChange(true)
            }}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            Enable All Optimizations
          </Button>
          
          {elementCount > 10000 && (
            <Button
              onClick={() => {
                // Trigger aggressive optimization
                setBatchSize(500)
                onBatchSizeChange(500)
              }}
              className="w-full bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Emergency Mode (10k+ elements)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}