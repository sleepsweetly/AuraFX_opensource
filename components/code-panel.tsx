"use client"

import { Code, MessageCircle } from "lucide-react"
import { siteConfig, getDiscordInviteUrl } from "@/lib/config"
import { useState, useEffect } from "react"

export function CodePanel() {
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);

  useEffect(() => {
    // Client-side'da Discord URL'ini güncelle
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
  }, []);
  return (
    <div className="h-full bg-black flex flex-col">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Code Panel</h3>
          <div className="w-12 h-px bg-white/20" />
        </div>

        <div className="flex-1">
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Code className="w-6 h-6 text-white/40" />
            </div>
            <p className="text-white/60">Code generation disabled</p>
            <p className="text-white/40 text-sm mt-1">Animation features removed</p>
            
            {/* Discord Join Button */}
            <div className="mt-8">
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                suppressHydrationWarning={true}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                Join Discord
              </a>
              <p className="text-white/40 text-xs mt-2">Connect with our community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
