"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react'
import { getAnalyticsStats, getDailyAnalytics } from '../utils/analytics'

interface AnalyticsStats {
  totalUses: number
  todayUses: number
  weeklyUses: number
}

interface DailyStats {
  date: string
  count: number
}

export function AnalyticsPanel() {
  const [stats, setStats] = useState<AnalyticsStats>({ totalUses: 0, todayUses: 0, weeklyUses: 0 })
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const loadStats = () => {
      setStats(getAnalyticsStats())
      setDailyStats(getDailyAnalytics())
    }

    loadStats()
    // Her 5 saniyede bir güncelle
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BarChart3 size={20} />
            Kullanım İstatistikleri
          </h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {isVisible ? '−' : '+'}
          </button>
        </div>

        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Ana İstatistikler */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.totalUses}</div>
                <div className="text-xs text-white/70">Toplam</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.todayUses}</div>
                <div className="text-xs text-white/70">Bugün</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.weeklyUses}</div>
                <div className="text-xs text-white/70">Bu Hafta</div>
              </div>
            </div>

            {/* Günlük Grafik */}
            {dailyStats.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Son 7 Gün
                </h4>
                <div className="flex items-end justify-between h-20 gap-1">
                  {dailyStats.slice(0, 7).map((day, index) => {
                    const maxCount = Math.max(...dailyStats.slice(0, 7).map(d => d.count))
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t w-full transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs text-white/60 mt-1">
                          {formatDate(day.date)}
                        </div>
                        <div className="text-xs text-white/80 font-medium">
                          {day.count}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Son Kullanım */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Zap size={16} />
                Son kullanım: {stats.todayUses > 0 ? 'Bugün' : 'Daha önce'}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 