import { useState, useEffect } from 'react'
import { siteConfig, getDiscordInviteUrl } from '@/lib/config'

export function useDiscordUrl() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Client-side'da dinamik URL'i al
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url)
      setIsLoaded(true)
    }).catch(() => {
      // Hata durumunda fallback URL'i kullan
      setDiscordUrl(siteConfig.discordInviteUrl)
      setIsLoaded(true)
    })
  }, [])

  return { discordUrl, isLoaded }
}