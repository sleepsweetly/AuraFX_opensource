// Site konfigürasyonu - Discord linki ve diğer ayarlar

// Discord URL - sadece env variable'dan okunur
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/4vAYUT9Mce';

export async function getDiscordInviteUrl(): Promise<string> {
    return DISCORD_URL;
}

export const siteConfig = {
    discordInviteUrl: DISCORD_URL,

    siteName: 'AuraFX - Particle Effects Studio',
    siteDescription: 'Create stunning particle effects for Minecraft - Free & No Registration',
    siteUrl: 'https://aurafx.online',

    social: {
        discord: DISCORD_URL,
    }
};