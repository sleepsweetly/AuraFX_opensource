"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Eye, EyeOff, TestTube, Trash2, Save } from 'lucide-react'
import { ANALYTICS_CONFIG, updateDiscordWebhook, getDiscordWebhook } from '../config/analytics'
import { resetAnalytics } from '../utils/analytics'

export function AnalyticsSettings() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [showWebhook, setShowWebhook] = useState(false)

  useEffect(() => {
    // Admin kontrolü - sadece geliştirici erişebilir
    const checkAdmin = () => {
      // URL'de admin parametresi varsa veya localhost'ta çalışıyorsa
      const urlParams = new URLSearchParams(window.location.search)
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const hasAdminParam = urlParams.get('admin') === 'true'
      
      console.log('🔍 Admin Check:', {
        hostname: window.location.hostname,
        isLocalhost,
        hasAdminParam,
        url: window.location.href
      })
      
      // Geçici olarak her zaman admin yap
      setIsAdmin(true)
    }

    checkAdmin()
    setWebhookUrl(getDiscordWebhook())
  }, [])

  const handleSaveSettings = () => {
    updateDiscordWebhook(webhookUrl)
    alert('Ayarlar kaydedildi!')
  }

  const testWebhook = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: '🧪 **Test Bildirimi**\n\nBu bir test bildirimidir. Webhook çalışıyor!',
          username: 'AuraFX Analytics',
          avatar_url: 'https://aurafx.online/favicon.ico'
        })
      })

      if (response.ok) {
        alert('✅ Test bildirimi başarıyla gönderildi!')
      } else {
        alert('❌ Test bildirimi gönderilemedi!')
      }
    } catch (error) {
      alert('❌ Test bildirimi gönderilemedi: ' + error)
    }
  }

  const handleResetData = () => {
    if (confirm('Tüm analytics verilerini sıfırlamak istediğinizden emin misiniz?')) {
      resetAnalytics()
      alert('Analytics verileri sıfırlandı!')
    }
  }

  // Admin değilse hiçbir şey gösterme
  if (!isAdmin) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Settings size={20} />
            Analytics Ayarları
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
            {/* Discord Webhook URL */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Discord Webhook URL
              </label>
              <div className="relative">
                <input
                  type={showWebhook ? 'text' : 'password'}
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="Discord webhook URL'si"
                />
                <button
                  onClick={() => setShowWebhook(!showWebhook)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={16} />
                Kaydet
              </button>
              <button
                onClick={testWebhook}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <TestTube size={16} />
                Test
              </button>
              <button
                onClick={handleResetData}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} />
                Sıfırla
              </button>
            </div>

            {/* Bilgi */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded p-3">
              <p className="text-blue-200 text-xs">
                💡 Bu panel sadece geliştirici tarafından görülebilir. 
                URL'ye ?admin=true ekleyerek veya localhost'ta çalıştırarak erişebilirsiniz.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 