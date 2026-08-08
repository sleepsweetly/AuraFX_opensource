import type { Layer, Element, ActionRecord } from "@/types"
import type { EffectSession, EffectProject } from "@/types/effect-session"
import { getDiscordInviteUrl } from "@/lib/config"
import { useElementStore } from "@/store/useElementStore"

// Action recording işleme fonksiyonları
function processActionRecords(actionRecords: ActionRecord[], layers: Layer[]): { [elementId: string]: { x: number, z: number, yOffset: number } } {
  const elementPositions: { [elementId: string]: { x: number, z: number, yOffset: number } } = {};
  
  // İlk olarak tüm element'lerin başlangıç pozisyonlarını al
  const currentElementMap = useElementStore.getState().elements;
  layers.forEach(layer => {
    layer.elements.forEach(element => {
      const fresh = currentElementMap[element.id] || element;
      elementPositions[element.id] = {
        x: fresh.position.x,
        z: fresh.position.z,
        yOffset: fresh.yOffset || 0
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

// Discord webhook sistemi - sadece herkese açık basit webhook (env ile opsiyonel)
const WEBHOOK_URLS = {
  public: process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || ''
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
  // Sadece herkese açık basit bildirimi gönder
  await sendPublicNotification(data);
}

// Herkese açık basit bilgi - çok minimal ve modern
async function sendPublicNotification(data: any) {
  try {
    const PUBLIC_WEBHOOK_URL = WEBHOOK_URLS.public;
    if (!PUBLIC_WEBHOOK_URL) return;

    // Çok basit ve modern embed
    const publicEmbed = {
      description: `✨ **Effect created** using AuraFX`,
      color: 0x00d4ff, // AuraFX mavi
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

// (Admin webhook kaldırıldığı için image'lı gönderim yardımcı fonksiyonuna gerek yok)

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

// Relative offset (fo/so/uo) vs global offset (xoffset/zoffset/yoffset) builder
// fo = forward (maps to editor Z axis), so = side (maps to editor X axis), uo = up (maps to editor Y axis)
function buildTargeterOffset(targeter: string, x: number, z: number, y: number, useRelativeOffsets: boolean = false): string {
  if (useRelativeOffsets) {
    return `@${targeter}{fo=${z.toFixed(4)};so=${x.toFixed(4)};uo=${y.toFixed(4)}}`;
  }
  return `@${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
}

// Module-level flag set by generateEffectCode, consumed by generateEffectLine
let _useRelativeOffsets = false;

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
  const offsetStr = buildTargeterOffset(targeter, x, z, y, _useRelativeOffsets);
  // Her effect type için doğru format kullan
  switch (effectType) {
    case "particles": {
      const params = buildParams({ particle: p, color: c, amount: a, size: 1, repeat, repeatInterval: interval });
      return `  - e:p{${params}} ${offsetStr}`;
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
      return `  - particlelinehelix{${params}} ${offsetStr}`;
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
      return `  - particleorbital{${params}} ${offsetStr}`;
    }
    case "particlering": {
      const { ringPoints, ringRadius } = effectParams || {};
      const params = buildParams({ particle: p, color: c, radius: ringRadius, points: ringPoints, amount: a });
      return `  - particlering{${params}} ${offsetStr}`;
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
      return `  - particleline{${params}} ${offsetStr}`;
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
      return `  - particlelinering{${params}} ${offsetStr}`;
    }
    case "particlesphere": {
      const { sphereRadius } = effectParams || {};
      const params = buildParams({ particle: p, color: c, amount: a, radius: sphereRadius });
      return `  - particlesphere{${params}} ${offsetStr}`;
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
      return `  - particletornado{${params}} ${offsetStr}`;
    }
    default: {
      const params = buildParams({ particle: p, color: c, amount: a, size: 1, repeat, repeatInterval: interval });
      return `  - e:p{${params}} ${offsetStr}`;
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
    debugFrameComments?: boolean;
  }
) => {
  // Set relative offsets flag from settings
  _useRelativeOffsets = settings.useRelativeOffsets !== false; // Default to true

  // ElementStore'daki O(1) hash map güncellemelerini asıl koda entegre et:
  const elementStoreMap = useElementStore.getState().elements;
  layers = layers.map(layer => ({
    ...layer,
    elements: layer.elements.map(el => ({ ...el, ...(elementStoreMap[el.id] || {}) }))
  }));

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
        // Debug: frame bilgisi (opsiyonel)
        if ((actionRecordingSettings?.debugFrameComments ?? false)) {
          codeLines.push(`  # frame=${frameIndex + 1} type=${frame.sourceType} idle=${frame.isIdle ? 'yes' : 'no'} delay=${frame.delay} repeatx=${frame.repeatCount}`);
        }

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

    // === OPTİMİZE MODU ===
    if (optimize) {
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
  codeLines.push(`#    _                _____  __`);
  codeLines.push(`#   /_\\ _  _ _ _ __ _| __\\ \\/ /`);
  codeLines.push(`#  / _ \\ || | '_/ _\` | _| >  < `);
  codeLines.push(`# /_/ \\_\\_,_|_| \\__,_|_| /_/\\_\\`);
  codeLines.push(`#`);
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