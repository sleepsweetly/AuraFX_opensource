// Site konfigürasyonu - Discord linki ve diğer ayarlar

// GitHub raw linkinden Discord URL'ini almak için async fonksiyon
async function getDiscordUrlFromGitHub(): Promise<string> {
    try {
        // GitHub raw link - targeterlerdeki gibi tamamen aynı yöntem
        const githubRawUrl = 'https://raw.githubusercontent.com/sleepsweetly/AuraFX-Launcher-Apps/refs/heads/main/discord-url.txt';
        
        // Targeterlerdeki gibi hiç header olmadan fetch
        const response = await fetch(githubRawUrl);
        
        if (!response.ok) {
            throw new Error(`GitHub'dan URL alınamadı: ${response.status}`);
        }
        
        const url = await response.text();
        return url.trim();
    } catch (error) {
        console.warn('GitHub\'dan Discord URL alınamadı, fallback kullanılıyor:', error);
        // Fallback URL
        return 'https://discord.gg/YqXdY4GD';
    }
}

// Discord URL'ini cache'lemek için
let cachedDiscordUrl: string | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache

async function getCachedDiscordUrl(): Promise<string> {
    const now = Date.now();
    
    // Cache süresi dolmuşsa veya hiç cache yoksa yeniden al
    if (!cachedDiscordUrl || (now - lastFetchTime) > CACHE_DURATION) {
        cachedDiscordUrl = await getDiscordUrlFromGitHub();
        lastFetchTime = now;
    }
    
    return cachedDiscordUrl;
}

// Discord URL'ini almak için async fonksiyon
export async function getDiscordInviteUrl(): Promise<string> {
    return await getCachedDiscordUrl();
}

export const siteConfig = {
    // Discord davet linki - GitHub raw linkinden alınır (fallback ile)
    discordInviteUrl: 'https://discord.gg/YqXdY4GD', // Default fallback

    // Diğer site ayarları buraya eklenebilir
    siteName: 'AuraFX - Particle Effects Studio',
    siteDescription: 'Create stunning particle effects for Minecraft - Free & No Registration',
    siteUrl: 'https://aurafx.online',

    // Sosyal medya linkleri
    social: {
        discord: 'https://discord.gg/YqXdY4GD', // Default fallback
        // Gelecekte Twitter, GitHub vs. eklenebilir
    }
};

// Client-side'da Discord URL'ini initialize et
if (typeof window !== 'undefined') {
    getCachedDiscordUrl().then(url => {
        siteConfig.discordInviteUrl = url;
        siteConfig.social.discord = url;
    });
}