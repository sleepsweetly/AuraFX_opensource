"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Activity, Cpu, MemoryStick, Zap } from "lucide-react"

interface PerformanceStats {
  fps: number
  frameTime: number
  memoryUsage: number
  elementCount: number
  renderCalls: number
  updateTime: number
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    elementCount: 0,
    renderCalls: 0,
    updateTime: 0
  })
  
  const frameCount = useRef(0)
  const lastTime = useRef(window.performance.now())
  const fpsHistory = useRef<number[]>([])
  
  useEffect(() => {
    let animationId: number
    
    const updateStats = () => {
      const now = window.performance.now()
      const deltaTime = now - lastTime.current
      
      frameCount.current++
      
      // Calculate FPS every second
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / deltaTime)
        
        // Keep FPS history for smoothing
        fpsHistory.current.push(fps)
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift()
        }
        
        const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
        
        setStats(prev => ({
          ...prev,
          fps: Math.round(avgFps),
          frameTime: 1000 / avgFps,
          memoryUsage: (window.performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0
        }))
        
        frameCount.current = 0
        lastTime.current = now
      }
      
      animationId = requestAnimationFrame(updateStats)
    }
    
    updateStats()
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])
  
  const getPerformanceLevel = (fps: number) => {
    if (fps >= 55) return { level: "excellent", color: "bg-green-500", text: "Excellent" }
    if (fps >= 45) return { level: "good", color: "bg-yellow-500", text: "Good" }
    if (fps >= 30) return { level: "warning", color: "bg-orange-500", text: "Warning" }
    return { level: "critical", color: "bg-red-500", text: "Critical" }
  }
  
  const performanceLevel = getPerformanceLevel(stats.fps)
  
  return (
    <Card className="w-80 bg-black/90 border-white/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm">FPS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono">{stats.fps}</span>
            <Badge className={`${performanceLevel.color} text-white text-xs`}>
              {performanceLevel.text}
            </Badge>
          </div>
        </div>
        
        {/* Frame Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-green-400" />
            <span className="text-sm">Frame Time</span>
          </div>
          <span className="text-sm font-mono">{stats.frameTime.toFixed(2)}ms</span>
        </div>
        
        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Memory</span>
            </div>
            <span className="text-sm font-mono">{stats.memoryUsage.toFixed(1)}MB</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((stats.memoryUsage / 100) * 100, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Element Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Elements</span>
          <span className="text-sm font-mono">{stats.elementCount.toLocaleString()}</span>
        </div>
        
        {/* Performance Tips */}
        {stats.fps < 45 && (
          <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
            <p className="text-xs text-orange-200">
              💡 Performance tip: Enable performance mode or reduce element count for better FPS
            </p>
          </div>
        )}
        
        {stats.fps < 30 && (
          <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-200">
              ⚠️ Critical: Consider using LOD (Level of Detail) or culling for better performance
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}