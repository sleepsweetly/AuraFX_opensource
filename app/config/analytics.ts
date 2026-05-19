// Analytics Konfigürasyonu
export const ANALYTICS_CONFIG = {
  // Discord Webhook URL - Buraya kendi webhook URL'inizi ekleyin
  DISCORD_WEBHOOK_URL: process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || '',
  
  // Veri saklama ayarları
  STORAGE: {
    // Günlük verileri kaç gün sakla
    DAILY_RETENTION_DAYS: 30,
    // Toplam kullanım sayısını sıfırla (güvenlik için)
    MAX_TOTAL_USES: 999999,
  }
}

// Discord webhook URL'sini güncelle
export const updateDiscordWebhook = (webhookUrl: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aurafx_discord_webhook', webhookUrl)
  }
}

// Discord webhook URL'sini al
export const getDiscordWebhook = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('aurafx_discord_webhook')
    if (stored) return stored
  }
  return ANALYTICS_CONFIG.DISCORD_WEBHOOK_URL
} 