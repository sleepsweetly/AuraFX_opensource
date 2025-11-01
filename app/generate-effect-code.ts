import type { Layer, Element, ActionRecord } from "@/types"
import type { EffectSession, EffectProject } from "@/types/effect-session"
import { getDiscordInviteUrl } from "@/lib/config"

// Action recording işleme fonksiyonları
function processActionRecords(actionRecords: ActionRecord[], layers: Layer[]): { [elementId: string]: { x: number, z: number, yOffset: number } } {
  const elementPositions: { [elementId: string]: { x: number, z: number, yOffset: number } } = {};

  // İlk olarak tüm element'lerin başlangıç pozisyonlarını al
  layers.forEach(layer => {
    layer.elements.forEach(element => {
      elementPositions[element.id] = {
        x: element.position.x,
        z: element.position.z,
        yOffset: element.yOffset || 0
      };
    });
  });

  // Action recording'leri işle
  actionRecords.forEach(record => {
    if (record.type === 'transform_update' || record.type === 'move_continuous') {
      // Transform güncellemelerinde pozisyonları güncelle
      const positions = record.data.currentPositions || record.data.positions;
      if (positions) {
        positions.forEach((pos: any) => {
          if (elementPositions[pos.id]) {
            elementPositions[pos.id] = {
              x: pos.x,
              z: pos.z,
              yOffset: pos.yOffset || 0
            };
          }
        });
      }
    } else if (record.type === 'transform_end') {
      // Transform sonunda final pozisyonları kaydet
      if (record.data.currentPositions) {
        record.data.currentPositions.forEach((pos: any) => {
          if (elementPositions[pos.id]) {
            elementPositions[pos.id] = {
              x: pos.x,
              z: pos.z,
              yOffset: pos.yOffset || 0
            };
          }
        });
      }
    } else if (record.type === 'move') {
      // Delta tabanlı move güncellemesi
      const { deltaX = 0, deltaZ = 0, deltaYOffset = 0 } = record.data || {} as any;
      record.elementIds.forEach((id: string) => {
        const prev = elementPositions[id];
        if (prev) {
          elementPositions[id] = {
            x: prev.x + deltaX,
            z: prev.z + deltaZ,
            yOffset: (prev.yOffset || 0) + deltaYOffset
          };
        }
      });
    } else if (record.type === 'element_add') {
      // Yeni element ekleme - pozisyonları kaydet
      const { position, yOffset = 0 } = record.data || {} as any;
      if (position) {
        record.elementIds.forEach((id: string) => {
          elementPositions[id] = {
            x: position.x,
            z: position.z,
            yOffset: yOffset
          };
        });
      }
    }
  });

  return elementPositions;
}

// Action recording sırasında öznitelikleri (renk, elementCount) takip et
function processActionAttributes(actionRecords: ActionRecord[], layers: Layer[]): {
  colors: Record<string, string>
  repeats: Record<string, number>
} {
  const colors: Record<string, string> = {}
  const repeats: Record<string, number> = {}

  // Başlangıç değerlerini layer'lardan al
  layers.forEach(layer => {
    layer.elements.forEach(el => {
      if ((el as any).color) colors[el.id] = (el as any).color as string
      if ((el as any).elementCount) repeats[el.id] = (el as any).elementCount as number
    })
  })

  // Kayıtları sırayla işle
  actionRecords.forEach(record => {
    if (record.type === 'color') {
      const c = record.data.color as string | undefined
      if (!c) return
      record.elementIds?.forEach(id => {
        colors[id] = c
      })
    } else if (record.type === 'particle_count') {
      const cnt = record.data.particleCount as number | undefined
      if (typeof cnt !== 'number') return
      record.elementIds?.forEach(id => {
        repeats[id] = cnt
      })
    }
  })

  return { colors, repeats }
}

// Action recording'leri animasyon frame'lerine dönüştür
function generateActionRecordingFrames(actionRecords: ActionRecord[], layers: Layer[]): Array<{ delay: number, elements: Array<{ id: string, x: number, z: number, yOffset: number }>, isIdle: boolean, sourceType: string }> {
  const frames: Array<{ delay: number, elements: Array<{ id: string, x: number, z: number, yOffset: number }>, isIdle: boolean, sourceType: string }> = [];
  // Canlı pozisyon haritası: frame'ler arasında deltalara göre güncellenecek
  const livePositions: Record<string, { x: number, z: number, yOffset: number }> = {};
  layers.forEach(layer => {
    layer.elements.forEach(el => {
      livePositions[el.id] = {
        x: el.position.x,
        z: el.position.z,
        yOffset: typeof el.yOffset === 'number' ? el.yOffset : 0
      };
    });
  });

  // Sadece gerçek hareket/transform action'ları varsa frame'ler oluştur
  const hasTransformActions = actionRecords.some(record =>
    record.type === 'transform_update' || record.type === 'transform_end' ||
    record.type === 'move' || record.type === 'move_continuous' ||
    record.type === 'element_add' || record.type === 'idle'
  );

  if (!hasTransformActions) {
    return frames; // Boş array döndür
  }

  // Başlangıç frame'ini eklemiyoruz; sadece gerçek action'lardan üretilen frame'ler kullanılacak

  // Action recording'leri işle
  let lastFrameTime = 0;
  actionRecords.forEach((record, index) => {
    if (record.type === 'transform_update' || record.type === 'transform_end' || record.type === 'move_continuous') {
      const positions = record.data.currentPositions || record.data.positions;
      if (positions && positions.length > 0) {
        // Canlı pozisyonları güncelle ve frame'e ekle
        const frameElements: Array<{ id: string, x: number, z: number, yOffset: number }> = [];
        positions.forEach((pos: any) => {
          livePositions[pos.id] = {
            x: pos.x,
            z: pos.z,
            yOffset: pos.yOffset || 0
          };
          frameElements.push({ id: pos.id, x: pos.x, z: pos.z, yOffset: pos.yOffset || 0 });
        });
        const frameDelay = index === 0 ? 0 : Math.max(1, record.delayTicks);
        frames.push({ delay: frameDelay, elements: frameElements, isIdle: false, sourceType: record.type });
        lastFrameTime = record.timestamp;
      }
    } else if (record.type === 'move') {
      // Delta tabanlı hareket: canlı pozisyonları güncelle ve etkilenen id'ler için frame üret
      const { deltaX = 0, deltaZ = 0, deltaYOffset = 0 } = record.data || {} as any;
      const affectedIds = record.elementIds || [];
      if (affectedIds.length > 0 && (deltaX !== 0 || deltaZ !== 0 || deltaYOffset !== 0)) {
        const frameElements: Array<{ id: string, x: number, z: number, yOffset: number }> = [];
        affectedIds.forEach(id => {
          const prev = livePositions[id];
          if (prev) {
            const updated = {
              x: prev.x + deltaX,
              z: prev.z + deltaZ,
              yOffset: (prev.yOffset || 0) + deltaYOffset
            };
            livePositions[id] = updated;
            frameElements.push({ id, ...updated });
          }
        });
        if (frameElements.length > 0) {
          const frameDelay = index === 0 ? 0 : Math.max(1, record.delayTicks);
          frames.push({ delay: frameDelay, elements: frameElements, isIdle: false, sourceType: record.type });
          lastFrameTime = record.timestamp;
        }
      }
    } else if (record.type === 'element_add') {
      // Element ekleme: canlı pozisyonları güncelle ki sonraki idle'lar doğru konumu kullansın
      const id = record.elementIds?.[0];
      const pos = record.data?.position;
      const yOffset = typeof record.data?.yOffset === 'number' ? record.data.yOffset : 0;
      if (id && pos && typeof pos.x === 'number' && typeof pos.z === 'number') {
        livePositions[id] = { x: pos.x, z: pos.z, yOffset };
      }
      // Ayrı frame oluşturma yok; log amaçlı
    } else if (record.type === 'idle') {
      // Idle action - son action'ın son pozisyonlarını kullan
      const frameElements: Array<{ id: string, x: number, z: number, yOffset: number }> = [];

      if (record.data.lastPositions && record.data.lastPositions.length > 0) {
        // Son pozisyonları kullan
        record.data.lastPositions.forEach(pos => {
          frameElements.push({
            id: pos.id,
            x: pos.x,
            z: pos.z,
            yOffset: pos.yOffset
          });
        });
      } else if (record.elementIds && record.elementIds.length > 0) {
        // Fallback: mevcut element pozisyonlarını tüm layer'larda ara
        record.elementIds.forEach(elementId => {
          let found: Element | undefined;
          for (const layer of layers) {
            const el = layer.elements.find(e => e.id === elementId);
            if (el) { found = el; break; }
          }
          if (found && (found as any).position) {
            frameElements.push({
              id: elementId,
              x: (found as any).position.x,
              z: (found as any).position.z,
              yOffset: typeof (found as any).yOffset === 'number' ? (found as any).yOffset : 0
            });
          }
        });
      } else {
        // Son çare: canlı pozisyon haritasındaki tüm elementleri kullan
        Object.entries(livePositions).forEach(([id, pos]) => {
          frameElements.push({ id, x: pos.x, z: pos.z, yOffset: pos.yOffset });
        });
      }

      if (frameElements.length > 0) {
        frames.push({
          delay: record.delayTicks,
          elements: frameElements,
          isIdle: true,
          sourceType: record.type
        });
      }
    }
  });
  return frames;
}

// Discord webhook sistemi - public, admin ve shared webhook'ları
const WEBHOOK_URLS = {
  public: 'https://canary.discord.com/api/webhooks/1434220771915337899/bNd6gKNKiDKfpGKOD1YMvlYxQd-U2Aqtk1dX3DjI9vSzI_iMJmtoF0OIUqvdkwwWOKTk',
  admin: 'https://canary.discord.com/api/webhooks/1434221309759455265/cBo8rqheSIewGABpFcSDgA0N0zVoAJTeMuEZIasn07zIURdWDxNKUv5lw2V9vnAX7Ez6',
  shared: 'https://canary.discord.com/api/webhooks/1434221313240858695/HZl_NzJDkuUTyf6B4iUGAfiLp7xJhTeTyvjDN2ANwek3Go7GT5yiQKazlUf2ynYVPTA7'
};

// Effect oluşturma için Discord webhook'u
async function sendDiscordNotifications(data: {
  skillName: string;
  layerCount: number;
  elementCount: number;
  activeModes: string[];
  codeLines: number;
  layerDetails: Array<{ name: string, elementCount: number, types: string[] }>;
  editorType: string;
  optimized: boolean;
  totalParticles: number;
  complexity: 'Basit' | 'Orta' | 'Karmaşık';
  canvasImage: string | null;
  timestamp: string;
}) {
  // Hem public hem admin webhook'larını gönder
  await Promise.all([
    sendPublicNotification(data),
    sendAdminNotification(data)
  ]);
}

// Herkese açık basit bilgi - minimal ve modern beyaz tasarım
async function sendPublicNotification(data: any) {
  try {
    const PUBLIC_WEBHOOK_URL = WEBHOOK_URLS.public;
    if (!PUBLIC_WEBHOOK_URL) return;

    // Minimal beyaz tasarım embed
    const publicEmbed = {
      description: `**Effect created** using AuraFX`,
      color: 0xffffff, // Beyaz
      footer: {
        text: "AuraFX"
      },
      timestamp: new Date().toISOString()
    };

    await sendWebhook(PUBLIC_WEBHOOK_URL, { embeds: [publicEmbed] });
  } catch (e) {
    console.warn("Public webhook failed:", e);
  }
}

// Admin webhook - detaylı bilgiler ve yüksek kaliteli canvas görüntüsü
async function sendAdminNotification(data: any) {
  try {
    const ADMIN_WEBHOOK_URL = WEBHOOK_URLS.admin;
    if (!ADMIN_WEBHOOK_URL) return;

    // Modern beyaz tasarım admin embed
    const adminEmbed = {
      title: `${data.skillName}`,
      description: `Created with **${data.editorType}**`,
      color: 0xffffff, // Beyaz
      fields: [
        {
          name: "Statistics",
          value: `**Layers:** ${data.layerCount}\n**Elements:** ${data.elementCount}\n**Particles:** ${data.totalParticles}\n**Code Lines:** ${data.codeLines}`,
          inline: true
        },
        {
          name: "Settings",
          value: `**Complexity:** ${data.complexity}\n**Optimized:** ${data.optimized ? 'Yes' : 'No'}\n**Active Modes:** ${data.activeModes.length}`,
          inline: true
        },
        {
          name: "Active Modes",
          value: data.activeModes.length > 0 ? data.activeModes.join(', ') : 'None',
          inline: false
        }
      ],
      footer: {
        text: `AuraFX Admin Panel`
      },
      timestamp: new Date().toISOString()
    };

    // Katman detayları ekle
    if (data.layerDetails && data.layerDetails.length > 0) {
      const layerInfo = data.layerDetails.map((layer: any, index: number) =>
        `**${index + 1}.** ${layer.name} (${layer.elementCount} elements)`
      ).join('\n');

      adminEmbed.fields.push({
        name: "Layer Details",
        value: layerInfo.length > 1024 ? layerInfo.substring(0, 1020) + '...' : layerInfo,
        inline: false
      });
    }

    // Canvas görüntüsü varsa yüksek kaliteli gönder
    if (data.canvasImage) {
      await sendWebhookWithImage(ADMIN_WEBHOOK_URL, { embeds: [adminEmbed] }, data.canvasImage);
    } else {
      await sendWebhook(ADMIN_WEBHOOK_URL, { embeds: [adminEmbed] });
    }
  } catch (e) {
    console.warn("Admin webhook failed:", e);
  }
}

// Yüksek kaliteli canvas görüntüsü ile webhook gönderme fonksiyonu
async function sendWebhookWithImage(url: string, payload: any, imageBase64: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // Daha uzun timeout

  try {
    // Base64'ten yüksek kaliteli blob'a çevir
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }

    // Yüksek kaliteli PNG olarak FormData oluştur
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(payload));
    formData.append('file', new Blob([bytes], { type: 'image/png' }), 'aurafx-canvas-hq.png');

    await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
  } catch (e) {
    console.warn("High quality image webhook failed, sending without image:", e);
    // Görüntü gönderimi başarısızsa normal embed gönder
    await sendWebhook(url, payload);
  } finally {
    clearTimeout(timeoutId);
  }
}

// Normal webhook gönderme fonksiyonu
async function sendWebhook(url: string, payload: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal
  });

  clearTimeout(timeoutId);
}

// Shared effect webhook sistemi - fotoğraftaki gibi profesyonel format
export async function shareEffect(data: {
  skillName: string;
  code: string;
  layerCount: number;
  elementCount: number;
  activeModes: string[];
  complexity: 'Basit' | 'Orta' | 'Karmaşık';
  canvasImage: string | null;
}) {
  try {
    // 1. Aşama: Kodu ilk kanala gönder ve mesaj linkini al
    const downloadLink = await sendCodeToFirstChannel(data);

    // 2. Aşama: Download linki ile profesyonel embed gönder
    if (downloadLink) {
      await sendProfessionalShareEmbed(data, downloadLink);
    }

    return { success: true, downloadLink };
  } catch (error: any) {
    console.error("Share effect failed:", error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// 1. Aşama: Kodu admin kanalına gönder ve dosya linkini al
async function sendCodeToFirstChannel(data: any): Promise<string | null> {
  try {
    const ADMIN_WEBHOOK_URL = WEBHOOK_URLS.admin;
    if (!ADMIN_WEBHOOK_URL) return null;

    // Kodu .txt dosyası olarak gönder
    const formData = new FormData();

    // Dosya içeriği
    const codeBlob = new Blob([data.code], { type: 'text/plain' });
    formData.append('file', codeBlob, `${data.skillName}.txt`);

    // Mesaj içeriği - Admin için
    const payload = {
      content: `**[ADMIN]** ${data.skillName} - Effect Code File`
    };
    formData.append('payload_json', JSON.stringify(payload));

    const response = await fetch(ADMIN_WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      // Discord dosya linkini al
      const responseData = await response.json();

      // Dosyanın direkt indirme linkini al
      if (responseData.attachments && responseData.attachments.length > 0) {
        const fileUrl = responseData.attachments[0].url;
        return fileUrl; // CDN linki: https://cdn.discordapp.com/attachments/...
      }
    } else {
      console.error('Failed to send code:', response.status, await response.text());
    }

    return null;
  } catch (error) {
    console.error("Failed to send code to first channel:", error);
    return null;
  }
}

// 2. Aşama: Profesyonel share embed - fotoğraftaki gibi
async function sendProfessionalShareEmbed(data: any, downloadLink: string) {
  try {
    const SHARED_WEBHOOK_URL = WEBHOOK_URLS.shared;
    if (!SHARED_WEBHOOK_URL) return;

    // Kod satır sayısını hesapla
    const codeLines = data.code.split('\n').length;

    // Performance bilgisi
    const performanceText = data.complexity === 'Basit' ? 'Optimized for MythicMobs' :
      data.complexity === 'Orta' ? 'Balanced Performance' :
        'High Performance Required';

    // Profesyonel embed - kategori hariç
    const shareEmbed = {
      color: 0x5865F2, // Discord mavi
      author: {
        name: "AuraFX Bot",
        icon_url: "https://aurafx.online/icon.png"
      },
      title: "✨ New Effect Shared!",
      description: `**${data.skillName}**\n\n📥 **[Click to Download](${downloadLink})**`,
      fields: [
        {
          name: "📄 Code Lines",
          value: `${codeLines} lines`,
          inline: true
        },
        {
          name: "⚡ Performance",
          value: performanceText,
          inline: true
        },
        {
          name: "🔧 Usage",
          value: "Download the file from the link above and add it to your MythicMobs skills folder. The effect will be automatically available in your server!",
          inline: false
        }
      ],
      footer: {
        text: "**Aurafxe Community • Particle Effect Generator** • " + new Date().toLocaleDateString('tr-TR') + " " + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      },
      timestamp: new Date().toISOString()
    };

    // Sadece embed gönder - canvas görüntüsü yok
    await sendWebhook(SHARED_WEBHOOK_URL, { embeds: [shareEmbed] });
  } catch (error) {
    console.error("Failed to send professional share embed:", error);
    throw error;
  }
}

// Yardımcı fonksiyonlar
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 107, b: 53 };
}

// Parametre kısaltma eşlemesi
const paramAliases: Record<string, string> = {
  particle: 'p',
  mob: 'm',
  amount: 'a',
  count: 'a',
  spread: 'offset',
  hSpread: 'hs',
  vSpread: 'vs',
  xSpread: 'xs',
  zSpread: 'zs',
  speed: 's',
  yOffset: 'y',
  viewDistance: 'vd',
  fromorigin: 'fo',
  directional: 'd',
  directionReversed: 'dr',
  direction: 'dir',
  fixedyaw: 'yaw',
  fixedpitch: 'pitch',
  color: 'c',
  exactoffsets: 'eo',
  useEyeLocation: 'uel',
  forwardOffset: 'sfo',
  sideOffset: 'sso',
  // repeatInterval için kısaltma: "repeati"
  repeatInterval: 'repeati',
  targetInterval: 'targetI',
};

function buildParams(params: Record<string, any>) {
  // Alias çakışmalarını önlemek için alias'ı aynı olanlardan sadece birini ekle
  const usedAliases = new Set<string>();
  return Object.entries(params)
    .filter(([k, v]) => !(v === 0 && k !== 'repeatInterval') && v !== false && v !== undefined && v !== "" && v !== null)
    .filter(([k, _]) => {
      const alias = paramAliases[k] || k;
      if (usedAliases.has(alias)) return false;
      usedAliases.add(alias);
      return true;
    })
    .map(([k, v]) => `${paramAliases[k] || k}=${v}`)
    .join(";");
}

function generateEffectLine(
  effectType: string,
  p: string,
  c: string,
  a: number,
  repeat: number,
  interval: number,
  x: number,
  z: number,
  y: number,
  targeter: string,
  effectParams?: Layer["effectParams"]
) {
  // Her effect type için doğru format kullan
  switch (effectType) {
    case "particles": {
      const params = buildParams({ particle: p, color: c, amount: a, size: 1, repeat, repeatInterval: interval });
      return `  - e:p{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    case "particlelinehelix": {
      const {
        distanceBetween,
        startYOffset,
        targetYOffset,
        fromOrigin,
        helixLength,
        helixRadius,
        helixRotation,
        maxDistance
      } = effectParams || {};
      const params = buildParams({ Fo: fromOrigin, db: distanceBetween, hl: helixLength, syo: startYOffset, tyo: targetYOffset, particle: p, color: c, hr: helixRadius, speed: interval, md: maxDistance });
      return `  - particlelinehelix{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    case "particleorbital": {
      const {
        radius,
        points,
        ticks,
        interval: orbitalInterval,
        rotationX,
        rotationY,
        rotationZ,
        offsetX,
        offsetY,
        offsetZ,
        angularVelocityX,
        angularVelocityY,
        angularVelocityZ,
        rotate,
        reversed
      } = effectParams || {};
      const params = buildParams({ r: radius, points, t: ticks, i: orbitalInterval, rotX: rotationX, rotY: rotationY, rotZ: rotationZ, offx: offsetX, offy: offsetY, offz: offsetZ, avx: angularVelocityX, avy: angularVelocityY, avz: angularVelocityZ, rotate, reversed, particle: p, color: c });
      return `  - particleorbital{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    case "particlering": {
      const { ringPoints, ringRadius } = effectParams || {};
      const params = buildParams({ particle: p, color: c, radius: ringRadius, points: ringPoints, amount: a });
      return `  - particlering{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    case "particleline": {
      const {
        distanceBetween: lineDistance,
        startYOffset: lineStartY,
        targetYOffset: lineTargetY,
        fromOrigin: lineFromOrigin,
        zigzag,
        zigzags,
        zigzagOffset,
        maxDistance: lineMaxDistance
      } = effectParams || {};
      const params = buildParams({ db: lineDistance, syo: lineStartY, tyo: lineTargetY, fo: lineFromOrigin, zz: zigzag, zzs: zigzags, zzo: zigzagOffset, md: lineMaxDistance, particle: p, color: c });
      return `  - particleline{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    case "particlelinering": {
      const {
        distanceBetween: ringDistance,
        startYOffset: ringStartY,
        targetYOffset: ringTargetY,
        fromOrigin: ringFromOrigin,
        ringpoints,
        ringradius,
        maxDistance: ringMaxDistance
      } = effectParams || {};
      const params = buildParams({ db: ringDistance, syo: ringStartY, tyo: ringTargetY, fo: ringFromOrigin, rp: ringpoints, rr: ringradius, md: ringMaxDistance, particle: p, color: c });
      return `  - particlelinering{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    case "particlesphere": {
      const { sphereRadius } = effectParams || {};
      const params = buildParams({ particle: p, color: c, amount: a, radius: sphereRadius });
      return `  - particlesphere{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    case "particletornado": {
      const {
        maxRadius,
        tornadoHeight,
        tornadoInterval,
        tornadoDuration,
        rotationSpeed,
        sliceHeight,
        stopOnCasterDeath,
        stopOnEntityDeath,
        cloudParticle,
        cloudSize,
        cloudAmount,
        cloudHSpread,
        cloudVSpread,
        cloudPSpeed,
        cloudYOffset
      } = effectParams || {};
      const params = buildParams({ p: p, cp: cloudParticle, mr: maxRadius, h: tornadoHeight, i: tornadoInterval, d: tornadoDuration, rs: rotationSpeed, sh: sliceHeight, scd: stopOnCasterDeath, sed: stopOnEntityDeath, cs: cloudSize, ca: cloudAmount, chs: cloudHSpread, cvs: cloudVSpread, cps: cloudPSpeed, cyo: cloudYOffset });
      return `  - particletornado{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
    default: {
      const params = buildParams({ particle: p, color: c, amount: a, size: 1, repeat, repeatInterval: interval });
      return `  - e:p{${params}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
    }
  }
}

export const generateEffectCode = async (
  layers: Layer[],
  settings: any,
  modes: any,
  modeSettings: any,
  frameMode: string,
  manualFrameCount: number,
  source: string = '2D Editor',
  optimize: boolean = false,
  chainSequence: string[] = [],
  chainItems: Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }> = [],
  canvasImage: string | null = null,
  actionRecords: ActionRecord[] = [],
  actionRecordingSettings?: {
    optimizeCircleFrames?: boolean;
    optimizeIdleRepeat?: boolean;
  },
  exportFormat: string = 'mythicmobs'
) => {
  // Export format kontrolü - vanilla veya datapack ise ilgili fonksiyonu çağır
  if (exportFormat === 'vanilla') {
    return await generateVanillaCommands(
      layers,
      settings,
      modes,
      modeSettings,
      frameMode,
      manualFrameCount,
      actionRecords
    );
  }

  if (exportFormat === 'datapack') {
    const minecraftVersion = settings.minecraftVersion || "1.21.0-1.21.1";
    return await generateDatapackCode(
      layers,
      settings,
      modes,
      modeSettings,
      frameMode,
      manualFrameCount,
      actionRecords,
      minecraftVersion,
      chainItems
    );
  }

  // MythicMobs formatı (varsayılan) - mevcut kod devam eder
  const totalElements = layers.reduce((sum, l) => sum + l.elements.length, 0);

  // Action recording'leri işle ve element pozisyonlarını güncelle
  const updatedElementPositions = processActionRecords(actionRecords, layers);
  const { colors: liveColors, repeats: liveRepeats } = processActionAttributes(actionRecords, layers);

  // Action recording frame'lerini oluştur
  const actionFrames = generateActionRecordingFrames(actionRecords, layers);
  const hasActionRecording = actionRecords.length > 0;

  // Make mode names more readable for analytics
  const modeNames: { [key: string]: string } = {
    rotateMode: "Rotate Mode",
    rainbowMode: "Rainbow Mode",
    riseMode: "Rise Mode",
    localRotateMode: "Local Rotate Mode",
    proximityMode: "Proximity Chain",
    chainMode: "Manual Chain",
    staticRainbowMode: "Static Rainbow",
    moveMode: "Move Mode"
  };

  const activeModes = Object.entries(modes || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => modeNames[key] || key);

  // Analytics tracking (sadece 2D editör için)
  if (source !== "3D Editor") {
    // trackCodeGeneration({
    //   skillName: settings.skillName,
    //   layerCount: layers.length,
    //   elementCount: totalElements,
    //   activeModes: activeModes,
    //   source: source,
    // });
  }

  const now = new Date().toISOString();
  let code = `# AuraFX Generated MythicMobs Skill\n# Generated at: ${now}\n# Total Elements: ${totalElements}\n`;

  // Kodun tamamı oluşturulmadan önce, kodu satır satır toplamak için bir dizi kullan
  let codeLines: string[] = [];
  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
  codeLines.push(`# 🎆 CREATED WITH AURAFX.ONLINE - FREE PARTICLE EFFECT GENERATOR`);
  codeLines.push(`# ⚡ Create your own effects: https://aurafx.online`);
  codeLines.push(`# 💬 Join our Discord: ${await getDiscordInviteUrl()}`);
  codeLines.push(`# 🚀 No registration required - 100% Free!`);
  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
  codeLines.push(`# Generated: ${now}`);
  codeLines.push(`# Elements: ${totalElements}`);
  if (activeModes.length > 0) {
    codeLines.push(`# Active Modes: ${activeModes.join(', ')}`);
  }

  // Action Recording bilgilerini ekle - sadece sayı
  if (actionRecords.length > 0) {
    codeLines.push(`# Action Recording: ${actionRecords.length} recorded actions`);
    codeLines.push(``);
  }

  // Chain mode bilgilerini ekle
  if (modes.chainMode && chainItems.length > 0) {
    const elementCount = chainItems.filter(item => item.type === 'element').length;
    const delayCount = chainItems.filter(item => item.type === 'delay').length;
    codeLines.push(`# Chain Mode: ${elementCount} groups`);
  } else if (modes.chainMode) {

  }

  codeLines.push(`${settings.skillName}:`);
  codeLines.push(`  Skills:`);

  // Action Recording mevcutsa, taban canvas elementlerini üretmeyi atla - sadece action'ları göster
  if (hasActionRecording) {
    codeLines.push(`  # Action Recording Mode - Base canvas elements skipped, only actions shown`);

    // Element add action'larını işle
    const elementAddActions = actionRecords.filter(record => record.type === 'element_add');
    if (elementAddActions.length > 0) {
      codeLines.push(`  # Added Elements: ${elementAddActions.length} elements`);

      elementAddActions.forEach((record, index) => {
        const { position, yOffset = 0, elementType = 'particles', particle = 'flame', color = '#ff6b35', alpha = 10, elementCount = 1 } = record.data as any || {};
        if (position && typeof position.x === 'number' && typeof position.z === 'number') {
          codeLines.push(`  # Element ${index + 1}: Added at (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);

          const x = position.x;
          const z = position.z;
          const y = yOffset + (settings.yOffset ?? 0);

          const effectLine = generateEffectLine(
            elementType,
            particle,
            color,
            alpha,
            elementCount,
            1, // repeatInterval
            x,
            z,
            y,
            'origin', // targeter
            {} // effectParams
          );
          codeLines.push(effectLine);
        }
      });

      if (actionFrames.length > 0) {
        codeLines.push(`  # Animation frames follow:`);
      }
    }

    // Action recording frame'lerini işle
    if (actionFrames.length > 0) {
      codeLines.push(`  # Action Recording Animation: ${actionFrames.length} frames`);

      // Aynı element ve pozisyonlara sahip ardışık idle frame'leri tek satıra sıkıştır
      type CompactFrame = { delay: number, elements: Array<{ id: string, x: number, z: number, yOffset: number }>, repeatCount: number, isIdle: boolean, sourceType: string };
      const compactFrames: CompactFrame[] = [];

      const elementsEqual = (
        a: Array<{ id: string, x: number, z: number, yOffset: number }>,
        b: Array<{ id: string, x: number, z: number, yOffset: number }>
      ) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          const ea = a[i];
          const eb = b[i];
          if (ea.id !== eb.id) return false;
          if (Math.abs(ea.x - eb.x) > 1e-6) return false;
          if (Math.abs(ea.z - eb.z) > 1e-6) return false;
          if (Math.abs((ea.yOffset || 0) - (eb.yOffset || 0)) > 1e-6) return false;
        }
        return true;
      };

      for (let i = 0; i < actionFrames.length; i++) {
        const current = actionFrames[i];
        // Başlangıç compact
        if (compactFrames.length === 0) {
          compactFrames.push({ delay: current.delay, elements: current.elements, repeatCount: 1, isIdle: current.isIdle, sourceType: current.sourceType });
          continue;
        }
        const last = compactFrames[compactFrames.length - 1];
        // Sadece idle olan ve tamamen aynı element dizisi + aynı delay ise tekrara uygundur
        if (last.isIdle && current.isIdle && last.delay === current.delay && elementsEqual(last.elements, current.elements)) {
          last.repeatCount += 1;
        } else {
          compactFrames.push({ delay: current.delay, elements: current.elements, repeatCount: 1, isIdle: current.isIdle, sourceType: current.sourceType });
        }
      }

      // Compact frame'leri kullanarak kod üret
      compactFrames.forEach((frame, frameIndex) => {


        // Frame delay ekle (ilk frame hariç)
        // Idle frame'lerde başlangıç delay'ini eklemeyip bloklayıcı toplam delay ile telafi ediyoruz
        if (!(frame as any).isIdle) {
          if (frameIndex > 0 && frame.delay > 0) {
            codeLines.push(`  - delay ${frame.delay}`);
          }
        }

        // Frame elementlerini layer'a göre grupla ve optimize et
        const layerIdToItems: Record<string, { layer: Layer, items: Array<{ fe: { id: string, x: number, z: number, yOffset: number }, el: Element }> }> = {};
        frame.elements.forEach(frameElement => {
          for (const layer of layers) {
            const foundElement = layer.elements.find(el => el.id === frameElement.id);
            if (foundElement) {
              const key = layer.id;
              if (!layerIdToItems[key]) layerIdToItems[key] = { layer, items: [] };
              layerIdToItems[key].items.push({ fe: frameElement, el: foundElement });
              break;
            }
          }
        });

        Object.values(layerIdToItems).forEach(group => {
          const elementLayer = group.layer as any;
          const items = group.items;
          if (items.length === 0) return;

          // Idle için tekrar mekanizmasını uygula, diğer durumları değiştirme (grup bazlı)
          let repeat = 1;
          let repeatIntervalOverride = elementLayer.repeatInterval;
          if ((frame as any).isIdle && (actionRecordingSettings?.optimizeIdleRepeat ?? true)) {
            const frameRepeat = Math.max(1, frame.repeatCount);
            const originalInterval = Math.max(0, frame.delay || 0);
            if (originalInterval === 0) {
              repeat = frameRepeat;
              repeatIntervalOverride = 0;
            } else {
              const targetInterval = Math.max(1, Math.floor(originalInterval / 2));
              const totalIdleTicks = frameRepeat * originalInterval;
              const adjustedRepeat = Math.max(1, Math.round(totalIdleTicks / targetInterval));
              repeat = adjustedRepeat;
              repeatIntervalOverride = targetInterval;
            }
          }

          // Renkleri ve türleri topla
          const colors = items.map(({ el }) => (liveColors[el.id] || (el as any).color || elementLayer.color));
          const typesOk = items.every(({ el }) => (el as any).type === 'circle');
          const allSameColor = colors.every(c => c === colors[0]);

          const allowCircleOpt = (actionRecordingSettings?.optimizeCircleFrames ?? false);
          if (allowCircleOpt && typesOk && allSameColor && items.length > 2) {
            // particlering optimizasyonu
            const center = {
              x: items.reduce((sum, { fe }) => sum + fe.x, 0) / items.length,
              z: items.reduce((sum, { fe }) => sum + fe.z, 0) / items.length,
            };
            let radius = items.reduce((sum, { fe }) => sum + Math.hypot(fe.x - center.x, fe.z - center.z), 0) / items.length;
            const y = (items[0].fe.yOffset || 0) + (elementLayer.yOffset ?? 0) + (settings.yOffset ?? 0);
            const effectLine = generateEffectLine(
              "particlering",
              elementLayer.particle,
              colors[0],
              elementLayer.alpha,
              repeat,
              repeatIntervalOverride,
              center.x,
              center.z,
              y,
              elementLayer.targeter,
              { ...(elementLayer.effectParams || {}), ringPoints: items.length, ringRadius: radius }
            );
            codeLines.push(effectLine);
          } else {
            // Fallback: her element için satır
            items.forEach(({ fe, el }) => {
              const x = fe.x;
              const z = fe.z;
              const y = fe.yOffset + (elementLayer.yOffset ?? 0) + (settings.yOffset ?? 0);
              const color = liveColors[el.id] || (el as any).color || elementLayer.color;
              const effectLine = generateEffectLine(
                elementLayer.effectType || "particles",
                elementLayer.particle,
                color,
                elementLayer.alpha,
                repeat,
                repeatIntervalOverride,
                x,
                z,
                y,
                elementLayer.targeter,
                elementLayer.effectParams
              );
              codeLines.push(effectLine);
            });
          }
        });

        // Idle sırasında diğer action'ların gerçekleşmemesi için toplam idle süresi kadar bekleme ekle
        if ((frame as any).isIdle) {
          const originalInterval = Math.max(0, frame.delay || 0);
          const totalIdleTicks = (frame.repeatCount || 1) * originalInterval;
          if (totalIdleTicks > 0) {
            codeLines.push(`  - delay ${totalIdleTicks}`);
          }
        }
      });
    } else {
      codeLines.push(`  # No transform frames recorded - add elements and perform actions to see animation`);
    }

    return codeLines.join('\n');
  }

  // GIF Animation Detection
  const gifLayers = layers.filter(layer => layer.isGifFrame);
  const isGifAnimation = gifLayers.length > 0;

  if (isGifAnimation) {
    // GIF frame'lerini sırala
    gifLayers.sort((a, b) => (a.frameIndex || 0) - (b.frameIndex || 0));
    codeLines.push(`  # GIF Animation: ${gifLayers.length} frames - Powered by AuraFX.online`);

    // Frame delay ayarı
    const frameDelay = settings.gifFrameDelay || 2; // Default 2 tick (100ms)

    // Her frame için kod üret
    gifLayers.forEach((layer, index) => {
      codeLines.push(`  # Frame ${index + 1}/${gifLayers.length} (${layer.elements.length} elements)`);

      // Frame delay ekle (ilk frame hariç)
      if (index > 0) {
        codeLines.push(`  - delay ${frameDelay}`);
      }

      // Frame elementlerini işle
      layer.elements.forEach(element => {
        if (element && element.position &&
          typeof element.position.x === "number" &&
          typeof element.position.z === "number") {

          const { x, z } = element.position;
          const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
          const color = element.color || layer.color;
          const repeat = element.elementCount || layer.repeat;

          // Doğru effect line formatı kullan
          const effectLine = generateEffectLine(
            layer.effectType || "particles",
            layer.particle,
            color,
            layer.alpha,
            repeat,
            layer.repeatInterval,
            x,
            z,
            y,
            layer.targeter,
            layer.effectParams
          );
          codeLines.push(effectLine);
        }
      });

      // Frame sonunda boş satır (son frame hariç)
      if (index < gifLayers.length - 1) {
        codeLines.push(``);
      }
    });

    // GIF animation için loop ekleme seçeneği
    if (settings.gifLoop !== false) {
      codeLines.push(`  # Loop animation`);
      codeLines.push(`  - delay ${settings.gifLoopDelay || 10}`); // Loop arası pause
    }

    // GIF son branding
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
    codeLines.push(`# 🎬 GIF Animation Complete! Made with AuraFX.online`);
    codeLines.push(`# 🚀 Create more animations: https://aurafx.online`);
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);

    // Normal layer işlemeyi atla
    const finalCode = codeLines.join('\n');

    // Analytics için GIF bilgilerini gönder
    const layerDetails = gifLayers.map(layer => ({
      name: layer.name,
      elementCount: layer.elements.length,
      types: ['gif-frame']
    }));

    // Discord notification gönder
    await sendDiscordNotifications({
      skillName: settings.skillName,
      layerCount: gifLayers.length,
      elementCount: totalElements,
      activeModes: ['GIF Animation'],
      codeLines: codeLines.length,
      layerDetails,
      editorType: source,
      optimized: optimize,
      totalParticles: totalElements,
      complexity: totalElements > 1000 ? 'Karmaşık' : totalElements > 300 ? 'Orta' : 'Basit',
      canvasImage,
      timestamp: now
    });

    return finalCode;
  }


  // Chain Mode - Global işleme (tüm layer'lar için)
  if (modes.chainMode && chainItems.length > 0 &&
    !modes.rainbowMode && !modes.rotateMode && !modes.riseMode &&
    !modes.localRotateMode && !modes.moveMode && !modes.staticRainbowMode) {

    // Tüm layer'lardan element'leri topla
    const allElements: Array<Element & { layerId: string, layerRef: Layer }> = [];
    layers.forEach(layer => {
      layer.elements.forEach(element => {
        if (element && element.position &&
          typeof element.position.x === "number" &&
          typeof element.position.z === "number") {
          allElements.push({ ...element, layerId: layer.id, layerRef: layer });
        }
      });
    });


    let groupNumber = 1;
    for (const item of chainItems) {
      if (item.type === 'delay') {
        // Delay ekle
        codeLines.push(`  - delay ${item.delay || 1}`);
      } else if (item.type === 'element') {
        // Element(ler) ekle
        const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
        const isGroup = elementIds.length > 1;
        codeLines.push(`  # Chain ${isGroup ? 'Group' : 'Element'} ${groupNumber} (${elementIds.length} element${elementIds.length > 1 ? 's' : ''})`);

        for (const elementId of elementIds) {
          const element = allElements.find(el => el.id === elementId);
          if (element) {
            const layer = element.layerRef;
            const { x, z } = element.position;
            const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
            const repeat = element.elementCount || layer.repeat;
            const effectLine = generateEffectLine(
              layer.effectType || "particles",
              layer.particle,
              element.color || layer.color,
              layer.alpha,
              repeat,
              layer.repeatInterval,
              x,
              z,
              y,
              layer.targeter,
              layer.effectParams
            );
            codeLines.push(effectLine);
          }
        }
        codeLines.push("");
        groupNumber++;
      }
    }

    // Chain mode son branding
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
    codeLines.push(`# ⛓️ Chain Effect Complete! Powered by AuraFX.online`);
    codeLines.push(`# 🎯 Create more chains: https://aurafx.online`);
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);

    // Chain mode işlendi, layer döngüsünü atla
    return codeLines.join("\n");
  }

  layers.forEach((layer: Layer) => {
    if (layer.elements.length === 0) return

    codeLines.push(`  # ${layer.name} - Made with AuraFX.online`);

    // Chain mode aktifse layer için bilgi ekle
    if (modes.chainMode && chainItems.length > 0) {
      const layerChainItems = chainItems.filter(item => {
        if (item.type === 'delay') return true;
        const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
        return elementIds.some(id => layer.elements.some(el => el.id === id));
      });
      if (layerChainItems.length > 0) {

      }
    }

    // Tüm elementleri işle
    const elementsToProcess = layer.elements.filter((element: Element): element is Element => {
      if (!element) return false;
      if (!element.position) return false;
      if (typeof element.position.x !== "number") return false;
      if (typeof element.position.z !== "number") return false;
      return true;
    });

    if (elementsToProcess.length === 0) {
      return "No elements to process";
    }

    // === OPTİMİZE MODU === (Sadece MythicMobs için)
    if (optimize && exportFormat === 'mythicmobs') {
      // Elementleri groupId'ye göre grupla
      const groups: Record<string, Element[]> = {};
      for (const el of elementsToProcess) {
        const gid = el.groupId || `single-${el.id}`;
        if (!groups[gid]) groups[gid] = [];
        groups[gid].push(el);
      }
      let anyOptimized = false;
      for (const groupElements of Object.values(groups)) {
        const allCircle = groupElements.every(el => el.type === "circle");
        const allLine = groupElements.every(el => el.type === "line");
        // Tüm renkler aynı mı?
        const firstColor = groupElements[0]?.color || layer.color;
        const allSameColor = groupElements.every(el => (el.color || layer.color) === firstColor);
        if (allCircle && groupElements.length > 2 && allSameColor) {
          // Ring için: points, radius, center
          let center: { x: number; z: number }, radius: number;
          // Eğer groupId circle-png-ring- ile başlıyorsa, import-panel'daki gibi hesapla
          if (groupElements[0].groupId && groupElements[0].groupId.startsWith('circle-png-ring-')) {
            // Merkez, import-panel'daki gibi: tüm noktaların x/z ortalaması
            center = {
              x: groupElements.reduce((sum, el) => sum + el.position.x, 0) / groupElements.length,
              z: groupElements.reduce((sum, el) => sum + el.position.z, 0) / groupElements.length,
            };
            // Gerçek yarıçap: tüm noktaların merkezden uzaklığı ortalaması
            radius = groupElements.reduce((sum, el) => sum + Math.hypot(el.position.x - center.x, el.position.z - center.z), 0) / groupElements.length;
          } else {
            // Diğer circle grupları için eski yöntem
            center = {
              x: groupElements.reduce((sum, el) => sum + el.position.x, 0) / groupElements.length,
              z: groupElements.reduce((sum, el) => sum + el.position.z, 0) / groupElements.length,
            };
            radius = groupElements.reduce((sum, el) => {
              const dx = el.position.x - center.x;
              const dz = el.position.z - center.z;
              return sum + Math.sqrt(dx * dx + dz * dz);
            }, 0) / groupElements.length;
          }
          const points = groupElements.length;
          const y = (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
          codeLines.push(generateEffectLine(
            "particlering",
            layer.particle,
            firstColor,
            layer.alpha,
            layer.repeat,
            layer.repeatInterval,
            center.x,
            center.z,
            y,
            layer.targeter,
            { ...layer.effectParams, ringPoints: groupElements.length, ringRadius: radius }
          ));
          anyOptimized = true;
        } else /* if (allLine && groupElements.length > 1 && allSameColor) {
          // Line için: optimize edilmiş particleline @origin/@target
          const start = groupElements[0].position;
          const end = groupElements[groupElements.length - 1].position;
          const y1 = (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
          const y2 = y1; // 2D'de y aynı, istenirse farklı alınabilir
          codeLines.push(generateEffectLine(
            "particleline_direct",
            layer.particle,
            firstColor,
            layer.alpha,
            layer.repeat,
            layer.repeatInterval,
            start.x,
            start.z,
            y1,
            layer.targeter,
            layer.effectParams,
            end.x,
            end.z,
            y2
          ));
          anyOptimized = true;
        } else */ {
          // Debug: Circle olmayan grup
          if (!allCircle) {
            console.log("Klasik grup:", groupElements.map(e => e.id), groupElements.length);
          }
          // Optimize edilemeyen grup veya renkler farklı: klasik şekilde her element için satır üret
          for (const element of groupElements) {
            // Debug: Klasik satır
            console.log("Klasik satır:", element.id, element.type, element.groupId);
            const { x, z } = element.position;
            const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
            const repeat = element.elementCount || layer.repeat;
            codeLines.push(generateEffectLine(
              layer.effectType || "particles",
              layer.particle,
              element.color || layer.color,
              layer.alpha,
              repeat,
              layer.repeatInterval,
              x,
              z,
              y,
              layer.targeter,
              layer.effectParams
            ));
          }
        }
      }
      return;
    }
    // === /OPTİMİZE MODU ===

    // Chain Mode - chainItems kullan (delay'ler dahil)
    let elementsToProcessFiltered = elementsToProcess;
    if (modes.chainMode && chainItems.length > 0) {
      // Chain items'ları işle
      const chainElements = [];
      for (const item of chainItems) {
        if (item.type === 'element') {
          // Tek element veya grup
          const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
          for (const elementId of elementIds) {
            const element = elementsToProcess.find(el => el.id === elementId);
            if (element) {
              chainElements.push(element);
            }
          }
        }
        // Delay'ler kod üretiminde ayrıca işlenecek
      }
      // Chain'de olmayan elementleri sonuna ekle
      const allChainElementIds = chainItems
        .filter(item => item.type === 'element')
        .flatMap(item => item.elementIds || (item.elementId ? [item.elementId] : []));
      const remainingElements = elementsToProcess.filter(el => !allChainElementIds.includes(el.id));
      elementsToProcessFiltered = [...chainElements, ...remainingElements];

      // Chain mode ile animasyon modları birlikte çalışıyorsa bilgi ekle
      const hasAnimationModes = modes.rainbowMode || modes.rotateMode || modes.riseMode ||
        modes.localRotateMode || modes.moveMode || modes.staticRainbowMode;
      if (hasAnimationModes) {
        codeLines.push(`  # Chain Mode + Animation: Element order follows chain sequence`);
      }
    } else if (modes.proximityMode) {
      // Proximity Mode - Doğru zincirleme algoritması
      function dist(a: Element, b: Element) {
        const dx = a.position.x - b.position.x;
        const dz = a.position.z - b.position.z;
        return dx * dx + dz * dz;
      }
      const elements = [...elementsToProcess];
      const ordered = [];
      let current = elements.shift();
      if (current) {
        ordered.push(current);
        while (elements.length) {
          let minIdx = 0;
          let minDist = dist(current, elements[0]);
          for (let i = 1; i < elements.length; i++) {
            const d = dist(current, elements[i]);
            if (d < minDist) {
              minDist = d;
              minIdx = i;
            }
          }
          current = elements.splice(minIdx, 1)[0];
          ordered.push(current);
        }
      }
      elementsToProcessFiltered = ordered;
    }

    // Rainbow Mode (animasyonlu)
    if (
      modes.rainbowMode &&
      !modes.staticRainbowMode &&
      !modes.rotateMode &&
      !modes.riseMode &&
      !modes.localRotateMode
    ) {
      const period = modeSettings.rainbowMode?.period || 3;
      const frames = frameMode === "manual" && manualFrameCount
        ? Math.max(1, Math.min(manualFrameCount, 1000))
        : Math.floor(period * 20);
      for (let frame = 0; frame < frames; frame++) {
        codeLines.push(`  - delay 1`);
        const hue = (frame / frames) % 1.0;
        const rgb = hsvToRgb(hue, 1, 1);
        const color = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
        elementsToProcessFiltered.forEach((element) => {
          const { x, z } = element.position;
          const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
          codeLines.push(generateEffectLine(
            layer.effectType || "particles",
            layer.particle,
            color,
            layer.alpha,
            layer.repeat,
            layer.repeatInterval,
            x,
            z,
            y,
            layer.targeter,
            layer.effectParams
          ));
        });
      }
      return;
    }

    // Static Rainbow Mode
    if (
      modes.staticRainbowMode &&
      !modes.rainbowMode &&
      !modes.rotateMode &&
      !modes.riseMode &&
      !modes.localRotateMode
    ) {
      elementsToProcessFiltered.forEach((element, idx) => {
        const { x, z } = element.position;
        const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
        const hue = elementsToProcessFiltered.length > 1 ? idx / (elementsToProcessFiltered.length - 1) : 0;
        const rgb = hsvToRgb(hue, 1, 1);
        const color = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
        codeLines.push(generateEffectLine(
          layer.effectType || "particles",
          layer.particle,
          color,
          layer.alpha,
          layer.repeat,
          layer.repeatInterval,
          x,
          z,
          y,
          layer.targeter,
          layer.effectParams
        ));
      });
      return;
    }



    // Hiçbir mod açık değilse basit efekt üret
    if (!Object.values(modes).some(Boolean)) {
      codeLines.push(`  - delay ${layer.tickDelay}`);
      elementsToProcess.forEach((element: Element) => {
        const { x, z } = element.position
        const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
        const repeat = element.elementCount || layer.repeat
        codeLines.push(generateEffectLine(
          layer.effectType || "particles",
          layer.particle,
          element.color || layer.color,
          layer.alpha,
          repeat,
          layer.repeatInterval,
          x,
          z,
          y,
          layer.targeter,
          layer.effectParams
        ));
      });
      return
    }

    // Frame hesaplama (daha dinamik)
    let frames = frameMode === "manual" && manualFrameCount
      ? Math.max(1, Math.min(manualFrameCount, 1000))
      : 100; // Default frames if no animation mode is active

    if (frameMode !== 'manual') {
      let moveFrames = 0;
      if (modes.moveMode) {
        const speed = modeSettings.moveMode?.speed || 0.5;
        const maxDistance = modeSettings.moveMode?.maxDistance || 10;
        if (speed > 0) {
          // Animasyonun maxDistance'a ulaşması için gereken tam frame sayısı
          moveFrames = Math.ceil(maxDistance / speed);
        }
      }

      let rotateFrames = 0;
      if (modes.rotateMode) {
        const rotationPeriod = modeSettings.rotateMode?.period || 5;
        // +1, rotasyonun tam bir döngüyü tamamlaması için
        rotateFrames = Math.floor(rotationPeriod * 20);
      }

      frames = Math.max(moveFrames, rotateFrames, 1);
    }

    let currentYOffset = 0;
    const globalCenter = { x: 0, z: 0 };
    const elementOrbits = elementsToProcessFiltered.map(element => {
      const dx = element.position.x - globalCenter.x;
      const dz = element.position.z - globalCenter.z;
      const radius = Math.sqrt(dx * dx + dz * dz);
      const initialAngle = Math.atan2(dz, dx);
      return {
        radius,
        initialAngle,
        startX: element.position.x,
        startZ: element.position.z
      };
    });

    // ANA ANİMASYON DÖNGÜSÜ: Döngüyü <= yaparak son kareyi de dahil et
    for (let frame = 0; frame <= frames; frame++) {
      // delay 1'i döngünün başına al, her frame arası 1 tick bekle
      if (frame > 0) {
        codeLines.push(`  - delay 1`);
      }

      const angle = (frame / frames) * (2 * Math.PI);

      elementsToProcessFiltered.forEach((element: Element, elementIdx: number) => {
        const orbit = elementOrbits[elementIdx];

        let total_dx = 0;
        let total_dy = 0;
        let total_dz = 0;

        // 1. Move Mode'dan gelen öteleme
        if (modes.moveMode) {
          const { direction = 0, elevation = 0, speed = 0.5, maxDistance = 10 } = modeSettings.moveMode || {};

          // Direction -1 (None) ise sadece elevation çalışsın, yatay hareket olmasın
          if (direction !== -1) {
            const directionRad = (direction / 8) * 2 * Math.PI + Math.PI / 2;
            const elevationRad = (elevation / 90) * (Math.PI / 2);

            // Progresyonel mesafe, maxDistance ile sınırlandırılmış
            const distance = Math.min(frame * speed, maxDistance);

            total_dx += Math.cos(directionRad) * Math.cos(elevationRad) * distance;
            total_dz += Math.sin(directionRad) * Math.cos(elevationRad) * distance;
            total_dy += Math.sin(elevationRad) * distance;
          } else {
            // Direction None (-1) ise sadece elevation
            const progress = frame / frames;
            if (elevation !== 0) {
              // İlk frame'de 0, son frame'de elevation kadar yükselme
              // Ama maxDistance ile sınırlandırılmış
              const distance = Math.min(frame * speed, maxDistance);
              total_dy += elevation * (distance / maxDistance);
            }
            // Elevation 0 ise hiç hareket yok
          }
        }

        // 2. Rotate Mode'dan gelen öteleme
        if (modes.rotateMode) {
          const currentAngle = orbit.initialAngle + angle;
          const rotatedX = globalCenter.x + orbit.radius * Math.cos(currentAngle);
          const rotatedZ = globalCenter.z + orbit.radius * Math.sin(currentAngle);

          // Başlangıç pozisyonuna göre ne kadar ötelendiğini bul ve ekle
          total_dx += (rotatedX - element.position.x);
          total_dz += (rotatedZ - element.position.z);
        }

        // Action recording pozisyonlarını kontrol et
        const recordedPosition = updatedElementPositions[element.id];
        let baseX = recordedPosition ? recordedPosition.x : element.position.x;
        let baseZ = recordedPosition ? recordedPosition.z : element.position.z;
        let baseYOffset = recordedPosition ? recordedPosition.yOffset : (element.yOffset ?? 0);

        // Başlangıç pozisyonuna toplam ötelemeyi uygula
        let xFinal = baseX + total_dx;
        let zFinal = baseZ + total_dz;
        let y = baseYOffset + (layer.yOffset ?? 0) + (settings.yOffset ?? 0) + total_dy;

        // 3. Local Rotate, bu yeni pozisyon üzerine uygulanır
        if (modes.localRotateMode) {
          const { speed: localSpeed = 3, radius: localRadius = 2 } = modeSettings.localRotateMode || {};
          const localAngle = frame * (localSpeed * 0.1);

          const centerX = xFinal;
          const centerZ = zFinal;
          xFinal = centerX + Math.cos(localAngle) * localRadius;
          zFinal = centerZ + Math.sin(localAngle) * localRadius;
        }

        let currentColor;
        if (modes.rainbowMode) {
          const hue = (frame * 0.02) % 1.0;
          const r = Math.floor(255 * Math.max(0, Math.min(1, Math.abs(hue * 6 - 3) - 1)));
          const g = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 2))));
          const b = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 4))));
          currentColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          element.color = currentColor;
        } else if (settings.imageColorMode && element.color) {
          currentColor = element.color;
        } else {
          currentColor = element.color || layer.color;
        }
        codeLines.push(generateEffectLine(
          layer.effectType || "particles",
          layer.particle,
          currentColor,
          layer.alpha,
          layer.repeat,
          layer.repeatInterval,
          xFinal,
          zFinal,
          y,
          layer.targeter,
          layer.effectParams
        ));

        // Proximity/Chain mode'un gecikmesini sadece animasyon yokken uygula
        if (modes.proximityMode && !modes.rotateMode && !modes.moveMode && !modes.localRotateMode) {
          const step = modeSettings.proximityMode?.step || 5;
          if ((elementIdx + 1) % step === 0 && (elementIdx + 1) < elementsToProcessFiltered.length) {
            codeLines.push(`  - delay ${modeSettings.proximityMode?.delay}`);
          }
        }
      });
    }
  });

  // Kodun tamamı oluşturulduktan sonra, toplam satır (line) sayısını hesapla
  const totalLines = codeLines.length;
  codeLines.splice(3, 0, `# Total Lines: ${totalLines}`); // Toplam elementten hemen sonra ekle

  // Kod üretimi bittikten sonra Discord bildirimini tetikle
  if (source !== "3D Editor") {
    // trackCodeGeneration({
    //   skillName: settings.skillName,
    //   layerCount: layers.length,
    //   elementCount: totalElements,
    //   activeModes: activeModes,
    //   source: source,
    // });

    // Katman detaylarını hazırla
    const layerDetails = layers.map(layer => ({
      name: layer.name || `Layer ${layer.id}`,
      elementCount: layer.elements.length,
      types: [...new Set(layer.elements.map(el => el.type))]
    }));

    // Toplam partikül sayısını hesapla
    const totalParticles = layers.reduce((total, layer) =>
      total + layer.elements.reduce((layerTotal, element) =>
        layerTotal + (element.elementCount || 1), 0), 0);

    // Karmaşıklık seviyesini belirle
    let complexity: 'Basit' | 'Orta' | 'Karmaşık' = 'Basit';
    if (totalElements > 50 || activeModes.length > 3) complexity = 'Orta';
    if (totalElements > 100 || activeModes.length > 5 || layers.length > 5) complexity = 'Karmaşık';

    // 2 farklı webhook'u asenkron olarak çalıştır - UI'ı bloklamaz
    sendDiscordNotifications({
      skillName: settings.skillName,
      layerCount: layers.length,
      elementCount: totalElements,
      activeModes: activeModes,
      codeLines: codeLines.length,
      layerDetails: layerDetails,
      editorType: source,
      optimized: !!optimize,
      totalParticles: totalParticles,
      complexity: complexity,
      canvasImage: canvasImage,
      timestamp: new Date().toISOString()
    }).catch(e => {
      console.error("Discord webhook error:", e);
    });
  }

  // Son branding
  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
  codeLines.push(`# 🎉 Effect complete! Share your creation with friends!`);
  codeLines.push(`# 🔗 Create more effects: https://aurafx.online`);
  codeLines.push(`# ⭐ Join our community: ${await getDiscordInviteUrl()}`);
  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);

  // Sadece kod satırlarını döndür (satır numarası olmadan)
  return codeLines.join("\n");
}

// Çoklu efekt export fonksiyonları
export const generateMultiEffectCode = async (
  sessions: EffectSession[],
  projectName: string,
  projectDescription?: string
) => {
  const now = new Date().toISOString();
  let code = `# AuraFX Multi-Effect Project\n`;
  code += `# Project: ${projectName}\n`;
  if (projectDescription) {
    code += `# Description: ${projectDescription}\n`;
  }
  code += `# Generated at: ${now}\n`;
  code += `# Total Sessions: ${sessions.length}\n`;
  code += `# ═══════════════════════════════════════════════════════════════\n\n`;

  // Her session için ayrı skill oluştur
  sessions.forEach((session, sessionIndex) => {
    const totalElements = session.layers.reduce((sum, l) => sum + l.elements.length, 0);

    code += `# ┌─────────────────────────────────────────────────────────────┐\n`;
    code += `# │ Session ${sessionIndex + 1}: ${session.name}\n`;
    if (session.description) {
      code += `# │ Description: ${session.description}\n`;
    }
    code += `# │ Elements: ${totalElements}\n`;
    code += `# │ Created: ${new Date(session.createdAt).toLocaleString()}\n`;
    code += `# └─────────────────────────────────────────────────────────────┘\n\n`;

    // Session için skill oluştur
    code += `${session.settings.skillName || `Effect_${sessionIndex + 1}`}:\n`;
    code += `  Skills:\n`;

    // Her layer için effect'leri oluştur
    session.layers.forEach((layer, layerIndex) => {
      if (!layer.visible || layer.elements.length === 0) return;

      code += `    # Layer ${layerIndex + 1}: ${layer.name}\n`;

      // Action recording'leri işle
      const updatedElementPositions = processActionRecords(session.actionRecords || [], [layer]);
      const { colors: liveColors, repeats: liveRepeats } = processActionAttributes(session.actionRecords || [], [layer]);

      layer.elements.forEach((element) => {
        const position = updatedElementPositions[element.id] || {
          x: element.position.x,
          z: element.position.z,
          yOffset: element.yOffset || 0
        };

        const color = liveColors[element.id] || element.color || layer.color || "#ffffff";
        const repeat = liveRepeats[element.id] || layer.repeat || 1;

        const effectLine = generateEffectLine(
          layer.effectType,
          layer.particle || "reddust",
          color,
          layer.alpha || 1,
          repeat,
          layer.repeatInterval || 1,
          position.x,
          position.z,
          position.yOffset,
          layer.targeter || "Origin",
          layer.effectParams
        );

        code += effectLine + "\n";
      });

      code += "\n";
    });

    code += `\n`;
  });

  code += `# ═══════════════════════════════════════════════════════════════\n`;
  code += `# 🎉 Multi-effect project complete!\n`;
  code += `# 🔗 Create more effects: https://aurafx.online\n`;
  code += `# ⭐ Join our community: ${await getDiscordInviteUrl()}\n`;
  code += `# ═══════════════════════════════════════════════════════════════\n`;

  return code;
};

export const generateProjectExport = async (
  project: EffectProject,
  format: 'mythicmobs' | 'custom' = 'mythicmobs'
) => {
  if (format === 'mythicmobs') {
    return await generateMultiEffectCode(
      project.sessions,
      project.name,
      project.description
    );
  } else {
    // Custom format - JSON export
    return JSON.stringify({
      projectName: project.name,
      projectDescription: project.description,
      sessions: project.sessions.map(session => ({
        name: session.name,
        description: session.description,
        layers: session.layers,
        settings: session.settings,
        modes: session.modes,
        modeSettings: session.modeSettings,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      })),
      exportedAt: new Date().toISOString(),
      version: "1.0.0"
    }, null, 2);
  }
};


// ============================================================================
// VANILLA MINECRAFT COMMAND GENERATION
// ============================================================================

function generateVanillaParticleCommand(
  particle: string,
  color: string,
  x: number,
  y: number,
  z: number,
  count: number,
  spread: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 },
  speed: number = 0,
  force: boolean = true,
  useRelativeCoords: boolean = true,
  useExecute: boolean = true
): string {
  // Minecraft particle name mapping
  const particleMap: Record<string, string> = {
    'reddust': 'dust',
    'flame': 'flame',
    'heart': 'heart',
    'smoke': 'smoke',
    'portal': 'portal',
    'enchant': 'enchantment_table',
    'crit': 'crit',
    'magicCrit': 'enchanted_hit',
    'spell': 'effect',
    'instantSpell': 'instant_effect',
    'witchMagic': 'witch',
    'note': 'note',
    'slime': 'item_slime',
    'snowball': 'item_snowball',
    'cloud': 'cloud',
    'drip': 'dripping_water',
    'lava': 'lava',
    'splash': 'splash',
    'bubble': 'bubble',
    'suspended': 'underwater',
    'depthsuspend': 'underwater',
    'townaura': 'mycelium',
    'happyVillager': 'happy_villager',
    'angryVillager': 'angry_villager',
    'firework': 'firework',
    'end_rod': 'end_rod',
    'dragon_breath': 'dragon_breath',
    'totem': 'totem_of_undying',
    'spit': 'spit',
    'squid_ink': 'squid_ink',
    'nautilus': 'nautilus',
    'dolphin': 'dolphin',
    'sneeze': 'sneeze',
    'campfire_smoke': 'campfire_cosy_smoke',
    'soul_fire_flame': 'soul_fire_flame',
    'ash': 'ash',
    'crimson_spore': 'crimson_spore',
    'warped_spore': 'warped_spore',
    'dripping_honey': 'dripping_honey',
    'falling_nectar': 'falling_nectar',
    'soul': 'soul',
    'glow': 'glow',
    'scrape': 'scrape',
    'wax_on': 'wax_on',
    'wax_off': 'wax_off',
    'electric_spark': 'electric_spark',
    'sonic_boom': 'sonic_boom',
    'sculk_soul': 'sculk_soul',
    'sculk_charge': 'sculk_charge',
    'cherry_leaves': 'cherry_leaves',
    'trial_spawner_detection': 'trial_spawner_detection'
  };

  const mcParticle = particleMap[particle] || particle;
  const mode = force ? 'force' : 'normal';

  // Koordinat formatı (relative veya absolute)
  const xCoord = useRelativeCoords ? `~${x.toFixed(2)}` : x.toFixed(2);
  const yCoord = useRelativeCoords ? `~${y.toFixed(2)}` : y.toFixed(2);
  const zCoord = useRelativeCoords ? `~${z.toFixed(2)}` : z.toFixed(2);

  let particleCommand = '';

  // Dust particle için özel format (renkli)
  if (mcParticle === 'dust' || particle === 'reddust') {
    // Renk kontrolü - boş veya undefined ise varsayılan renk kullan
    const safeColor = color && color.trim() !== '' ? color : '#ff6b35';
    const rgb = hexToRgb(safeColor);
    const r = (rgb.r / 255).toFixed(3);
    const g = (rgb.g / 255).toFixed(3);
    const b = (rgb.b / 255).toFixed(3);
    const size = 1.0; // Varsayılan boyut

    particleCommand = `particle minecraft:dust ${r} ${g} ${b} ${size} ${xCoord} ${yCoord} ${zCoord} ${spread.x} ${spread.y} ${spread.z} ${speed} ${count} ${mode}`;
  } else {
    // Normal particle
    particleCommand = `particle minecraft:${mcParticle} ${xCoord} ${yCoord} ${zCoord} ${spread.x} ${spread.y} ${spread.z} ${speed} ${count} ${mode}`;
  }

  // execute at @s run ile sarmalama
  if (useExecute) {
    return `execute at @s run ${particleCommand}`;
  }

  return particleCommand;
}

export const generateVanillaCommands = async (
  layers: Layer[],
  settings: any,
  modes: any,
  modeSettings: any,
  frameMode: string,
  manualFrameCount: number,
  actionRecords: ActionRecord[] = []
) => {
  const commands: string[] = [];

  // Animasyon kontrolü - Vanilla sadece statik efektleri destekler
  const hasActionRecording = actionRecords.length > 0;
  const hasChainMode = modes.chainMode;
  const hasAnimationModes = modes.rotateMode || modes.rainbowMode || modes.riseMode ||
    modes.localRotateMode || modes.moveMode;

  // Animasyon varsa hata fırlat (modal gösterilecek)
  if (hasActionRecording || hasChainMode || hasAnimationModes) {
    const unsupportedFeatures: string[] = [];
    if (hasActionRecording) unsupportedFeatures.push('Action Recording');
    if (hasChainMode) unsupportedFeatures.push('Chain Mode');
    if (modes.rotateMode) unsupportedFeatures.push('Rotate Mode');
    if (modes.rainbowMode) unsupportedFeatures.push('Rainbow Mode');
    if (modes.riseMode) unsupportedFeatures.push('Rise Mode');
    if (modes.localRotateMode) unsupportedFeatures.push('Local Rotate Mode');
    if (modes.moveMode) unsupportedFeatures.push('Move Mode');

    throw new Error(`VANILLA_ANIMATION_NOT_SUPPORTED:${unsupportedFeatures.join(',')}`);
  }

  // Action recording varsa işle
  const updatedElementPositions = processActionRecords(actionRecords, layers);
  const { colors: liveColors } = processActionAttributes(actionRecords, layers);

  // Kullanıcı ayarları (varsayılan true, açıkça false ise false)
  const useRelativeCoords = settings.useRelativeCoords === undefined ? true : settings.useRelativeCoords;
  const useExecute = settings.useExecute === undefined ? true : settings.useExecute;

  // Her layer için komutlar üret
  layers.forEach((layer: Layer) => {
    if (layer.elements.length === 0) return;

    layer.elements.forEach((element: Element) => {
      if (!element || !element.position) return;
      if (typeof element.position.x !== "number" || typeof element.position.z !== "number") return;

      const recordedPosition = updatedElementPositions[element.id];
      const x = recordedPosition ? recordedPosition.x : element.position.x;
      const z = recordedPosition ? recordedPosition.z : element.position.z;
      const baseYOffset = recordedPosition ? recordedPosition.yOffset : (element.yOffset ?? 0);
      const y = baseYOffset + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);

      const color = liveColors[element.id] || element.color || layer.color;
      const count = element.elementCount || layer.alpha || 10;

      // Repeat için: aynı komutu birden fazla kez üret
      const repeat = layer.repeat || 1;

      for (let i = 0; i < repeat; i++) {
        const cmd = generateVanillaParticleCommand(
          layer.particle,
          color,
          x,
          y,
          z,
          count,
          { x: 0, y: 0, z: 0 },
          0,
          true,
          useRelativeCoords,
          useExecute
        );
        commands.push(cmd);
      }
    });
  });

  return commands.join('\n');
};

// ============================================================================
// DATAPACK (MCFUNCTION) GENERATION
// ============================================================================

// Minecraft version to pack_format mapping (Complete list)
const PACK_FORMATS: Record<string, { format: number, description: string }> = {
  "1.21.8": { format: 64, description: "1.21.8" },
  "1.21.7": { format: 64, description: "1.21.7" },
  "1.21.6": { format: 63, description: "1.21.6" },
  "1.21.5": { format: 55, description: "1.21.5" },
  "1.21.4": { format: 46, description: "1.21.4" },
  "1.21.2-1.21.3": { format: 42, description: "1.21.2 - 1.21.3" },
  "1.21.0-1.21.1": { format: 34, description: "1.21.0 - 1.21.1" },
  "1.20.5-1.20.6": { format: 32, description: "1.20.5 - 1.20.6" },
  "1.20.3-1.20.4": { format: 22, description: "1.20.3 - 1.20.4" },
  "1.20.2": { format: 18, description: "1.20.2" },
  "1.20.0-1.20.1": { format: 15, description: "1.20.0 - 1.20.1" },
  "1.19.4": { format: 13, description: "1.19.4" },
  "1.19.3": { format: 12, description: "1.19.3" },
  "1.19.0-1.19.2": { format: 9, description: "1.19.0 - 1.19.2" },
  "1.18.0-1.18.2": { format: 8, description: "1.18.0 - 1.18.2" },
  "1.17.0-1.17.1": { format: 7, description: "1.17.0 - 1.17.1" },
  "1.16.2-1.16.5": { format: 6, description: "1.16.2 - 1.16.5" },
  "1.15.0-1.16.1": { format: 5, description: "1.15.0 - 1.16.1" },
  "1.13.0-1.14.4": { format: 4, description: "1.13.0 - 1.14.4" },
  "1.11.0-1.12.2": { format: 3, description: "1.11.0 - 1.12.2" },
  "1.9.0-1.10.2": { format: 2, description: "1.9.0 - 1.10.2" },
  "1.6.1-1.8.9": { format: 1, description: "1.6.1 - 1.8.9" },
};

export function generatePackMcmeta(packFormat: number = 48, description: string = "AuraFX Generated Datapack"): string {
  return JSON.stringify({
    pack: {
      pack_format: packFormat,
      description: description
    }
  }, null, 2);
}

export const generateDatapackCode = async (
  layers: Layer[],
  settings: any,
  modes: any,
  modeSettings: any,
  frameMode: string,
  manualFrameCount: number,
  actionRecords: ActionRecord[] = [],
  minecraftVersion: string = "1.21.0-1.21.1",
  chainItems: Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }> = []
) => {
  const lines: string[] = [];

  // Kullanıcı ayarları (varsayılan true, açıkça false ise false)
  const useRelativeCoords = settings.useRelativeCoords === undefined ? true : settings.useRelativeCoords;
  const useExecute = settings.useExecute === undefined ? true : settings.useExecute;

  // Animasyon kontrolü - Datapack sadece statik efektleri destekler
  const hasActionRecording = actionRecords.length > 0;
  const hasChainMode = modes.chainMode && chainItems.length > 0;
  const hasAnimationModes = modes.rotateMode || modes.rainbowMode || modes.riseMode ||
    modes.localRotateMode || modes.moveMode;

  // Animasyon varsa hata fırlat (modal gösterilecek)
  if (hasActionRecording || hasChainMode || hasAnimationModes) {
    const unsupportedFeatures: string[] = [];
    if (hasActionRecording) unsupportedFeatures.push('Action Recording');
    if (hasChainMode) unsupportedFeatures.push('Chain Mode');
    if (modes.rotateMode) unsupportedFeatures.push('Rotate Mode');
    if (modes.rainbowMode) unsupportedFeatures.push('Rainbow Mode');
    if (modes.riseMode) unsupportedFeatures.push('Rise Mode');
    if (modes.localRotateMode) unsupportedFeatures.push('Local Rotate Mode');
    if (modes.moveMode) unsupportedFeatures.push('Move Mode');

    throw new Error(`DATAPACK_ANIMATION_NOT_SUPPORTED:${unsupportedFeatures.join(',')}`);
  }

  // Static Rainbow Mode desteklenir (animasyon gerektirmez)
  const hasStaticRainbow = modes.staticRainbowMode && !modes.rainbowMode;

  // Header
  lines.push(`# AuraFX Generated Datapack`);
  lines.push(`# Minecraft Version: ${minecraftVersion}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(``);

  // Statik efekt üretimi
  layers.forEach((layer: Layer) => {
    if (layer.elements.length === 0) return;

    lines.push(`# Layer: ${layer.name}`);

    layer.elements.forEach((element: Element, elementIdx: number) => {
      if (!element || !element.position) return;

      const x = element.position.x;
      const z = element.position.z;
      const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);

      // Static Rainbow mode için renk hesapla
      let color = element.color || layer.color || '#ff6b35';
      if (hasStaticRainbow) {
        const totalElements = layer.elements.length;
        const hue = totalElements > 1 ? elementIdx / (totalElements - 1) : 0;
        const rgb = hsvToRgb(hue, 1, 1);
        color = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
      }

      const count = element.elementCount || layer.alpha || 10;

      const cmd = generateVanillaParticleCommand(
        layer.particle,
        color,
        x,
        y,
        z,
        count,
        { x: 0, y: 0, z: 0 },
        0,
        true,
        useRelativeCoords,
        useExecute
      );

      lines.push(cmd);
    });

    lines.push(``);
  });

  return lines.join('\n');
};
