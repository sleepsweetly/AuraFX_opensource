"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Transfer3DModal } from "@/components/3d-transfer-modal"
import { LeftToolbar } from "@/components/left-toolbar"
import { RightSidebar } from "@/components/right-sidebar"
import { TopCenterToolbar } from "@/components/top-center-toolbar"
import { LayersPanel } from "@/components/panels/layers-panel"
import { BottomStatusBar } from "@/components/bottom-status-bar"
import { Canvas } from "@/components/canvas"
import { CodePanel } from "@/components/panels/code-panel"
import { ModesPanel } from "@/components/panels/modes-panel"
import { ChainPanel } from "@/components/panels/chain-panel"
import { ImportPanel } from "@/components/panels/import-panel"
import { ActionRecordingPanel } from "@/components/panels/action-recording-panel"

import { PerformancePanel } from "@/components/panels/performance-panel"
import { EffectListPanel } from "@/components/EffectListPanel"
import { AnnouncementSystem } from "@/components/announcement-system"
import type { Layer, Element, Tool, ActionRecord } from "@/types"
import { Toaster } from "@/components/toast-system"
import { v4 as uuidv4 } from "uuid"
import { useActionRecordingStore } from "@/store/useActionRecordingStore"
import { generateEffectCode } from "./generate-effect-code"
import { ElementSettingsPanel } from "@/components/panels/element-settings-panel"
import { AnimatePresence, motion } from 'framer-motion'
import { Rnd } from "react-rnd"
import { useHistoryStore } from "@/lib/history-store"
import { ParticleSelectModal } from "@/components/particle-select-modal"
import { ColorPicker } from "@/components/ui/color-picker"
import { Slider } from "@/components/ui/slider"
import { Settings, Grid3X3, Zap, Hash, Palette, X, Sparkles } from "lucide-react"
import { use3DStore } from "@/app/3d/store/use3DStore"
import { useClipboardStore } from "@/store/useClipboardStore"
import { useLayerStore } from "@/store/useLayerStore"
import { useToast } from "@/components/toast-system"
import { analyzeEffectLines, optimizeEffects, applyTemplate } from "@/lib/effect-optimizer"
import type { OptimizationSettings } from "@/lib/effect-optimizer"
import * as yaml from 'js-yaml'
import dynamic from "next/dynamic"
import { useEffectSessionStore } from "@/store/useEffectSessionStore"
import { useTransferStore } from "@/store/useTransferStore"
const GettingStarted = dynamic(() => import("@/components/getting-started"), { ssr: false })

declare global {
  interface Window {
    addPngElements?: (elements: any[]) => void
    addObjElements?: (elements: any[]) => void
    addGifElements?: (elements: any[], frameCount: number) => void
    addGifLayers?: (layers: any[]) => void
    gtag: (command: string, action: string, params?: any) => void
  }
}



interface Viewport {
  width: number;
  height: number;
}

interface ModeSettings {
  staticRainbowMode?: {
    // Add specific settings if needed
  }
  rotateMode: {
    speed: number
    frames: number
  }
  localRotateMode: {
    speed: number
    radius: number
  }
  moveMode: {
    speed: number
    maxDistance: number
    direction: number
    elevation: number
  }
  riseMode: {
    speed: number
    maxHeight: number
  }
  proximityMode: {
    step: number
    delay: number
  }
  rainbowMode: {
    period: number
  }
}

interface Settings {
  particleCount: number;
  shapeSize: number;
  color: string;
  particle: string;
  alpha: number;
  repeat: number;
  yOffset: number;
  skillName: string;
  pngSize: number;
  objScale: number;
  performanceMode: boolean;
  imageColorMode: boolean;
  snapToGridMode: boolean;
  gridSize: number;
  alphaThreshold: number;
  colorTolerance: number;
  maxElements: number;
  includeAllColors: boolean;
}

interface Modes {
  rotateMode: boolean;
  rainbowMode: boolean;
  riseMode: boolean;
  performanceMode: boolean;
  localRotateMode: boolean;
  moveMode: boolean;
  proximityMode: boolean;
  chainMode: boolean;
  imageColorMode: boolean;
  mirrorMode: boolean;
  doubleMirrorMode: boolean;
  staticRainbowMode?: boolean;
  actionRecordingMode: boolean;
}

export type EffectType =
  | "particles"
  | "particlelinehelix"
  | "particleorbital"
  | "particlering"
  | "particleline"
  | "particlelinering"
  | "particlesphere"
  | "particletornado";

const generateEffectLine = (
  effectType: EffectType,
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
) => {
  switch (effectType) {
    case "particles":
      return `  - effect:particles{p=${p};c=${c};a=${a};size=1;repeat=${repeat};repeatInterval=${interval}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    case "particlelinehelix":
      const {
        distanceBetween = 0.07,
        startYOffset = 0,
        targetYOffset = 4,
        fromOrigin = true,
        helixLength = 1.8,
        helixRadius = 2,
        helixRotation = 0,
        maxDistance = 256
      } = effectParams || {};
      return `  - particlelinehelix{Fo=${fromOrigin};db=${distanceBetween};hl=${helixLength};syo=${startYOffset};tyo=${targetYOffset};particle=${p};color=${c};hr=${helixRadius};speed=${interval}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    case "particleorbital":
      const {
        radius = 4,
        points = 20,
        ticks = 100,
        interval: orbitalInterval = 10,
        rotationX = 0,
        rotationY = 0,
        rotationZ = 0,
        offsetX = 0,
        offsetY = 0,
        offsetZ = 0,
        angularVelocityX = 0,
        angularVelocityY = 0,
        angularVelocityZ = 0,
        rotate = false,
        reversed = false
      } = effectParams || {};
      return `  - particleorbital{r=${radius};points=${points};t=${ticks};i=${orbitalInterval};rotX=${rotationX};rotY=${rotationY};rotZ=${rotationZ};offx=${offsetX};offy=${offsetY};offz=${offsetZ};avx=${angularVelocityX};avy=${angularVelocityY};avz=${angularVelocityZ};rotate=${rotate};reversed=${reversed};particle=${p};color=${c}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    case "particlering":
      const {
        ringPoints = 8,
        ringRadius = 10
      } = effectParams || {};
      return `  - particlering{particle=${p};color=${c};radius=${ringRadius};points=${ringPoints};amount=${a}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    case "particleline":
      const {
        distanceBetween: lineDistance = 0.25,
        startYOffset: lineStartY = 0,
        targetYOffset: lineTargetY = 0,
        fromOrigin: lineFromOrigin = false,
        zigzag = false,
        zigzags = 10,
        zigzagOffset = 0.2,
        maxDistance: lineMaxDistance = 256
      } = effectParams || {};
      return `  - particleline{db=${lineDistance};syo=${lineStartY};tyo=${lineTargetY};fo=${lineFromOrigin};zz=${zigzag};zzs=${zigzags};zzo=${zigzagOffset};md=${lineMaxDistance};particle=${p};color=${c}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    case "particlelinering":
      const {
        distanceBetween: ringDistance = 1,
        startYOffset: ringStartY = 0,
        targetYOffset: ringTargetY = 0,
        fromOrigin: ringFromOrigin = false,
        ringpoints = 16,
        ringradius = 0.5,
        maxDistance: ringMaxDistance = 256
      } = effectParams || {};
      return `  - particlelinering{db=${ringDistance};syo=${ringStartY};tyo=${ringTargetY};fo=${ringFromOrigin};rp=${ringpoints};rr=${ringradius};md=${ringMaxDistance};particle=${p};color=${c}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    case "particlesphere":
      const {
        sphereRadius = 0
      } = effectParams || {};
      return `  - particlesphere{particle=${p};color=${c};amount=${a};radius=${sphereRadius}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    case "particletornado":
      const {
        maxRadius = 3,
        tornadoHeight = 4,
        tornadoInterval = 4,
        tornadoDuration = 200,
        rotationSpeed = 0.04,
        sliceHeight = 64,
        stopOnCasterDeath = true,
        stopOnEntityDeath = true,
        cloudParticle = "largeexplode",
        cloudSize = 5,
        cloudAmount = 1,
        cloudHSpread = 1,
        cloudVSpread = 1.8,
        cloudPSpeed = 2,
        cloudYOffset = 1.8
      } = effectParams || {};
      return `  - particletornado{p=${p};cp=${cloudParticle};mr=${maxRadius};h=${tornadoHeight};i=${tornadoInterval};d=${tornadoDuration};rs=${rotationSpeed};sh=${sliceHeight};scd=${stopOnCasterDeath};sed=${stopOnEntityDeath};cs=${cloudSize};ca=${cloudAmount};chs=${cloudHSpread};cvs=${cloudVSpread};cps=${cloudPSpeed};cyo=${cloudYOffset}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;

    default:
      return `  - effect:particles{p=${p};c=${c};a=${a};size=1;repeat=${repeat};repeatInterval=${interval}} @${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
  }
};

const generateCodeFromElements = async (
  elements: Element[],
  viewport: Viewport,
  settings: Settings,
  modes: Modes,
  modeSettings: ModeSettings,
  frameMode: string,
  manualFrameCount: number,
  layers: Layer[],
  chainSequence: string[] = [],
  chainItems: Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }> = [],
  actionRecords: Array<{ id: string, timestamp: number, type: 'rotate' | 'scale' | 'move' | 'color' | 'particle_count', elementIds: string[], data: any, delayTicks: number }> = []
) => {
  let code = `# Generated with AuraFX - aurafx.online\n${settings.skillName}:\n  Skills:\n`;

  // Action Recording varsa önce onu işle
  if (actionRecords.length > 0) {
    code += `  # Action Recording Sequence\n`;

    actionRecords.forEach((record, index) => {
      // Delay ekle
      if (record.delayTicks > 1) {
        code += `  - delay:${record.delayTicks}\n`;
      }

      // Action'a göre kod üret
      switch (record.type) {
        case 'rotate':
          code += `  # Rotate ${record.elementIds.length} element(s) by ${record.data.angle?.toFixed(1)}°\n`;
          break;
        case 'scale':
          code += `  # Scale ${record.elementIds.length} element(s) by ${record.data.scaleFactor?.toFixed(2)}x\n`;
          break;
        case 'move':
          code += `  # Move ${record.elementIds.length} element(s) by (${record.data.deltaX?.toFixed(1)}, ${record.data.deltaZ?.toFixed(1)})\n`;
          break;
        case 'color':
          code += `  # Change color of ${record.elementIds.length} element(s) to ${record.data.color}\n`;
          break;
        case 'particle_count':
          code += `  # Set particle count of ${record.elementIds.length} element(s) to ${record.data.particleCount}\n`;
          break;
      }
    });

    code += `\n`;
  }

  // Tüm layer'ları ve elementleri kopyala
  const layersCopy = layers.map(layer => ({
    ...layer,
    elements: [...layer.elements]
  }));

  layersCopy.forEach((layer: Layer) => {
    if (layer.elements.length === 0) return;

    code += `  # ${layer.name} - Created with AuraFX\n`;

    // Tüm elementleri işle
    const elementsToProcess = layer.elements.filter((element): element is Element => {
      if (!element) return false;
      if (!element.position) return false;
      if (typeof element.position.x !== "number") return false;
      if (typeof element.position.z !== "number") return false;
      return true;
    });

    // Element sayısı kontrolü
    if (elementsToProcess.length === 0) {
      return "No elements to process";
    }

    // Chain Mode - Manuel sequence kullan
    let elementsToProcessFiltered = elementsToProcess;
    let chainComments: string[] = [];

    if (modes.chainMode && chainItems.length > 0) {
      // Chain items'ları işle
      const processedElements: Element[] = [];
      let groupNumber = 1;

      for (const item of chainItems) {
        if (item.type === 'element') {
          const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
          const elements = elementIds.map(id => elementsToProcess.find(el => el.id === id)).filter(Boolean) as Element[];

          if (elements.length > 0) {
            chainComments.push(`# Chain Group ${groupNumber} (${elements.length} elements)`);
            processedElements.push(...elements);
            groupNumber++;
          }
        } else if (item.type === 'delay') {
          chainComments.push(`# Delay: ${item.delay || 1} ticks`);
        }
      }

      // Chain'de olmayan elementleri sonuna ekle - Optimized O(n) version
      const processedElementIds = new Set(processedElements.map(el => el.id));
      const remainingElements = elementsToProcess.filter(el => !processedElementIds.has(el.id));
      elementsToProcessFiltered = [...processedElements, ...remainingElements];
    } else if (modes.proximityMode) {
      // Proximity Mode - Doğru zincirleme algoritması
      function dist(a: Element, b: Element) {
        const dx = a.position.x - b.position.x;
        const dz = a.position.z - b.position.z;
        return dx * dx + dz * dz;
      }
      const elements = [...elementsToProcess];
      const ordered = [];
      let current = elements.shift(); // İlk elementi al
      if (current) {
        ordered.push(current);
        while (elements.length) {
          // En yakın elementi bul
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

    // Rainbow Mode artık ana döngüde işleniyor - ayrı blok kaldırıldı

    // Static Rainbow Mode artık ana döngüde işleniyor - ayrı blok kaldırıldı

    // Chain Mode - Yorum satırları ile (Grup ayırıcıları ve boş satırlar)
    if (modes.chainMode && chainItems.length > 0) {
      let groupNumber = 1;
      let processedElementCount = 0;

      for (const item of chainItems) {
        if (item.type === 'element') {
          const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
          const elements = elementIds.map(id => elementsToProcessFiltered.find(el => el.id === id)).filter(Boolean) as Element[];

          if (elements.length > 0) {
            code += `\n  # ===== Chain Group ${groupNumber} (${elements.length} elements) =====\n`;

            elements.forEach((element) => {
              const { x, z } = element.position;
              const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
              const color = element.color || layer.color;

              code += generateEffectLine(
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
              ) + "\n";
            });

            code += `\n`;
            groupNumber++;
            processedElementCount += elements.length;
          }
        } else if (item.type === 'delay') {
          code += `\n  # ----- Delay: ${item.delay || 1} ticks -----\n`;
          code += `  - delay ${item.delay || 1}\n\n`;
        }
      }

      // Chain'de olmayan elementleri sonuna ekle - Optimized O(n) version
      const chainElementIds = new Set<string>();
      chainItems.forEach(item => {
        if (item.type === 'element') {
          const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
          elementIds.forEach(id => chainElementIds.add(id));
        }
      });
      const remainingElements = elementsToProcessFiltered.filter(el => !chainElementIds.has(el.id));

      if (remainingElements.length > 0) {
        code += `  # Remaining elements (${remainingElements.length})\n`;
        remainingElements.forEach((element) => {
          const { x, z } = element.position;
          const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
          const color = element.color || layer.color;

          code += generateEffectLine(
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
          ) + "\n";
        });
      }

      return;
    }

    // Frame hesaplama - Mod kombinasyonlarını dikkate al
    let frames: number;
    if (frameMode === "manual" && manualFrameCount) {
      frames = Math.max(1, Math.min(manualFrameCount, 1000)); // Kullanıcı girişini 1-1000 arasında sınırla
    } else if (modes.staticRainbowMode && !modes.rainbowMode && !modes.rotateMode && !modes.localRotateMode && !modes.moveMode) {
      frames = 1; // Static rainbow mode tek frame'de çalışır (diğer animasyon modları yoksa)
    } else if (modes.rainbowMode) {
      const rainbowPeriod = modeSettings.rainbowMode?.period || 3;
      frames = Math.floor(rainbowPeriod * 20); // Rainbow mode için 20 FPS
    } else {
      const rotationFrames = modeSettings.rotateMode?.frames || 36;
      frames = rotationFrames; // Kullanıcının belirlediği frame sayısı
    }

    let currentYOffset = 0;

    // Global merkez noktası (tüm elementlerin gerçek merkezi)
    const globalCenter = (() => {
      if (elementsToProcessFiltered.length === 0) return { x: 0, z: 0 };

      const totalX = elementsToProcessFiltered.reduce((sum, el) => sum + el.position.x, 0);
      const totalZ = elementsToProcessFiltered.reduce((sum, el) => sum + el.position.z, 0);

      return {
        x: totalX / elementsToProcessFiltered.length,
        z: totalZ / elementsToProcessFiltered.length
      };
    })();

    // Her elementin başlangıç pozisyonunu ve yörünge bilgilerini sakla
    const elementOrbits = elementsToProcessFiltered.map(element => {
      const dx = element.position.x - globalCenter.x;
      const dz = element.position.z - globalCenter.z;
      const radius = Math.sqrt(dx * dx + dz * dz); // Merkeze olan uzaklık
      const initialAngle = Math.atan2(dz, dx); // Başlangıç açısı

      return {
        radius,
        initialAngle,
        startX: element.position.x,
        startZ: element.position.z
      };
    });

    // Frame döngüsü
    for (let frame = 0; frame < frames; frame++) {
      // Rise mode için maksimum yüksekliğe ulaşıldı mı kontrol et
      if (modes.riseMode) {
        const maxHeight = modeSettings.riseMode?.maxHeight || 20;
        const speed = modeSettings.riseMode?.speed || 0.5;
        const riseDuration = Math.ceil(maxHeight / speed);

        // Eğer maksimum yüksekliğe ulaşıldıysa, bu frame'i atla
        if (frame >= riseDuration) {
          continue;
        }
      }

      // Frame'ler arası delay - animasyon modları aktifse ekle
      if (modes.rainbowMode || modes.rotateMode || modes.localRotateMode || modes.moveMode || modes.riseMode) {
        code += `  - delay 1\n`;
      }

      // Add branding comment every 15 frames for rainbow mode, 10 for others
      const commentInterval = modes.rainbowMode ? 15 : 10;
      if (frame % commentInterval === 0 && frame > 0) {
        const modeInfo = modes.rainbowMode ? "Rainbow" : modes.rotateMode ? "Rotate" : "Animation";
        code += `  # ${modeInfo} Frame ${frame} - Powered by AuraFX\n`;
      }

      // Açıyı frame sayısına ve speed'e göre hesapla
      const rotateSpeed = modeSettings.rotateMode?.speed || 1;
      const angle = (frame / frames) * (2 * Math.PI) * (rotateSpeed / 10); // Speed'i 10'a bölerek yavaşlat

      elementsToProcessFiltered.forEach((element: Element, elementIdx: number) => {
        // Elementin yörünge bilgileri
        const orbit = elementOrbits[elementIdx];

        // Yeni pozisyon hesaplama
        let xFinal = element.position.x;
        let zFinal = element.position.z;
        let y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0) + currentYOffset;

        // Rotate Mode - Sadece rotate mode açıksa dönüş yap
        if (modes.rotateMode) {
          const currentAngle = orbit.initialAngle + angle;
          xFinal = globalCenter.x + orbit.radius * Math.cos(currentAngle);
          zFinal = globalCenter.z + orbit.radius * Math.sin(currentAngle);
        }

        // Rise Mode - Düzeltilmiş hesaplama
        if (modes.riseMode) {
          const maxHeight = modeSettings.riseMode?.maxHeight || 20;
          const speed = modeSettings.riseMode?.speed || 0.5;

          // Y pozisyonunu güncelle
          y += speed * frame;
        }

        // Local Rotate Mode - Güneş sistemi efekti için özel işlem
        // Bu kısım kod üretiminde ayrı olarak işlenecek

        // Move Mode - Belirli yönde hareket ettir
        if (modes.moveMode) {
          const moveSpeed = modeSettings.moveMode?.speed || 0.5;
          const maxDistance = modeSettings.moveMode?.maxDistance || 10;
          const direction = modeSettings.moveMode?.direction || 0;
          const elevation = modeSettings.moveMode?.elevation || 0;

          // Hareket mesafesini hesapla
          const progress = (frame / frames) % 1.0;
          const distance = progress * maxDistance;

          // Direction -1 (None) ise sadece yükselme/alçalma yap, yatay hareket yapma
          if (direction !== -1) {
            // Yön haritası
            const directionMap = [
              { x: 0, z: 1 },   // North (0)
              { x: 1, z: 0 },   // East (1)
              { x: 0, z: -1 },  // South (2)
              { x: -1, z: 0 }   // West (3)
            ];

            const dir = directionMap[direction] || directionMap[0];
            xFinal += dir.x * distance * moveSpeed;
            zFinal += dir.z * distance * moveSpeed;
          }

          // Elevation'ı y pozisyonuna ekle (direction None olsa bile)
          if (elevation !== 0) {
            // İlk frame'de 0, son frame'de elevation kadar yükselme
            // Ama maxDistance ile sınırlandırılmış
            const distance = Math.min(frame * moveSpeed, maxDistance);
            y += elevation * (distance / maxDistance);
          }
          // Elevation 0 ise hiç hareket yok
        }

        let currentColor;
        if (modes.rainbowMode) {
          // Rainbow mode: Tüm elementler aynı renkte, frame'e göre değişir
          const period = modeSettings.rainbowMode?.period || 3;
          const totalFrames = Math.floor(period * 20);
          const hue = (frame / totalFrames) % 1.0;
          const rgb = hsvToRgb(hue, 1, 1);
          currentColor = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
          // Update element color for preview
          element.color = currentColor;
        } else if (modes.staticRainbowMode) {
          // Static Rainbow mode: Her element farklı renkte, sabit
          const hue = elementsToProcessFiltered.length > 1 ? elementIdx / (elementsToProcessFiltered.length - 1) : 0;
          const rgb = hsvToRgb(hue, 1, 1);
          currentColor = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
          // Update element color for preview
          element.color = currentColor;
        } else if (settings.imageColorMode && element.color) {
          currentColor = element.color;
        } else {
          currentColor = element.color || layer.color;
        }

        // Local Rotate Mode - Güneş sistemi efekti
        if (modes.localRotateMode) {
          const localSpeed = modeSettings.localRotateMode?.speed || 1;
          const localRadius = modeSettings.localRotateMode?.radius || 0.5;

          // Global rotate ile senkronize angle hesaplama
          let localAngle;
          if (modes.rotateMode) {
            // Global rotate varsa, onun hızına göre senkronize ol
            localAngle = angle * localSpeed;
          } else {
            // Global rotate yoksa kendi hızında dön
            localAngle = (frame / frames) * (2 * Math.PI) * localSpeed;
          }

          // Element'in yörünge pozisyonu sabit kalır (xFinal, zFinal)
          // Ama kendi etrafında dönen parçacıklar oluştur
          const particleCount = 3; // Kendi etrafında dönen parçacık sayısı

          for (let i = 0; i < particleCount; i++) {
            const particleAngle = localAngle + (i * 2 * Math.PI / particleCount);
            const particleX = xFinal + Math.cos(particleAngle) * localRadius;
            const particleZ = zFinal + Math.sin(particleAngle) * localRadius;

            code += generateEffectLine(
              layer.effectType || "particles",
              layer.particle,
              currentColor,
              layer.alpha,
              layer.repeat,
              layer.repeatInterval,
              particleX,
              particleZ,
              y,
              layer.targeter,
              layer.effectParams
            ) + "\n";
          }
        } else {
          // Normal efekt satırı
          code += generateEffectLine(
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
          ) + "\n";
        }

        // Her 'step' kadar efekt satırından sonra delay ekle
        const step = modeSettings.proximityMode?.step || 5;
        if ((elementIdx + 1) % step === 0 && (elementIdx + 1) < elementsToProcessFiltered.length) {
          code += `  - delay ${modeSettings.proximityMode?.delay}\n`;
        }
      });
    }
  });

  // Performance Mode - main.py'deki gibi
  if (modes.performanceMode) {
    const lines = code.split("\n");
    const optimized = [];
    let currentLine = null;
    let repeatCount = 1;

    for (const line of lines) {
      if (line.startsWith("  - effect:particles") || line.startsWith("  - summonareaeffectcloud")) {
        if (currentLine === line) {
          repeatCount++;
        } else {
          if (currentLine) {
            optimized.push(currentLine.replace("repeat=1", `repeat=${repeatCount}`));
          }
          currentLine = line;
          repeatCount = 1;
        }
      } else {
        if (currentLine) {
          optimized.push(currentLine.replace("repeat=1", `repeat=${repeatCount}`));
          currentLine = null;
          repeatCount = 1;
        }
        optimized.push(line);
      }
    }

    if (currentLine) {
      optimized.push(currentLine.replace("repeat=1", `repeat=${repeatCount}`));
    }

    code = optimized.join("\n");
  }

  // Add branding comment
  code += `\n\n# Generated by aurafx.online - Advanced Particle Effect Editor`;

  return code;
};

// HSV to RGB helper
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

type DraggablePanelProps = {
  title: string;
  children: React.ReactNode;
  defaultPosition: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onClose: () => void;
  panelId: string;
  zIndex: number;
  bringToFront: (panelId: string) => void;
  onMinimize: () => void;
  isFront?: boolean;
};

function DraggablePanel({ title, children, defaultPosition, defaultSize, onClose, panelId, zIndex, bringToFront, onMinimize, isFront }: DraggablePanelProps) {
  return (
    <Rnd
      default={{
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: defaultSize?.width || 720,
        height: defaultSize?.height || 740
      }}
      minWidth={100}
      minHeight={100}
      bounds="window"
      style={{
        zIndex,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 24px #0008',
        background: '#000000',
        position: 'absolute',
        border: 'none',
        transition: 'border 0.15s',
      }}
      dragHandleClassName="draggable-panel-header"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      onPointerDown={() => bringToFront(panelId)}
      data-panel-id={panelId}
    >
      <AnimatePresence>
        <motion.div
          key={panelId}
          initial={{ opacity: 0, scale: 0.98, y: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 40 }}
          transition={{ duration: 0.28, type: "spring", bounce: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <div
            className="draggable-panel-header"
            style={{
              cursor: 'move',
              background: '#000000',
              color: '#fff',
              padding: '10px 16px',
              fontWeight: 'bold',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              {title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
              <motion.button
                onClick={onClose}
                onPointerDown={e => e.stopPropagation()}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#000000] border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-all duration-200 focus:outline-none"
                style={{ position: 'absolute', right: 0, zIndex: 9999 }}
                title="Close"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
          <div className="bg-zinc-90000 flex-1 min-h-0 overflow-hidden">
            <div
              className="h-full overflow-y-auto p-4 pb-6 scroll-contain custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#e5e7eb #ffffff',
                scrollbarGutter: 'stable'
              }}
              onWheel={(e) => {
                // Panel içinde scroll bittiğinde sayfa scroll'unu engelle
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;

                // Scroll yukarı gidiyorsa ve en üstteyse
                if (e.deltaY < 0 && scrollTop === 0) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                // Scroll aşağı gidiyorsa ve en alttaysa
                else if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {children}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Rnd>
  );
}

interface Announcement {
  id: string;
  type: string;
  title: string;
  message: string;
  version: string;
  date?: string;
  link?: string;
}

interface FetchedAnnouncements {
  version: string;
  announcements: Omit<Announcement, 'version'>[];
}

export default function EffectEditor() {
  const [openPanels, setOpenPanels] = useState<string[]>([]);
  const [minimizedPanels, setMinimizedPanels] = useState<string[]>([]);

  const { toast } = useToast();

  // Changelog otomatik gösterim kontrolü
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('aurafx-last-seen-version');
    const currentVersion = '2.1.7'; // Her deploy'da bu versiyonu güncelleyin

    if (lastSeenVersion !== currentVersion) {
      localStorage.setItem('aurafx-last-seen-version', currentVersion);
    }


  }, []);

  // Action Recording Store
  const {
    records: actionRecords,
    optimizeCircleFrames,
    optimizeIdleRepeat,
    debugFrameComments,
    startRecording,
    stopRecording,
    isRecording: storeIsRecording
  } = useActionRecordingStore();



  // Toast event listener'ı ekle
  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { type, title, message, duration } = event.detail;

      // Determine variant based on type
      let variant: "default" | "destructive" | "warning" = "default";
      if (type === 'warning') {
        variant = "destructive";
      } else if (type === 'error') {
        variant = "destructive";
      } else if (type === 'success') {
        variant = "default";
      }

      toast({
        title,
        description: message,
        variant,
        duration: duration || 4000,
        className: type === 'warning'
          ? "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-lg"
          : type === 'error'
            ? "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg"
            : "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg",
      });
    };

    window.addEventListener('showToast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('showToast', handleShowToast as EventListener);
    };
  }, [toast]);

  const togglePanel = (panel: string) => {
    setOpenPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );
  };

  const restorePanel = (panel: string) => {
    setMinimizedPanels((prev) => prev.filter((p) => p !== panel));
    setOpenPanels((prev) => prev.includes(panel) ? prev : [...prev, panel]);
  };

  const layers = useLayerStore((state) => state.layers);
  const setLayers = useLayerStore((state) => state.setLayers);
  const currentLayerId = useLayerStore((state) => state.currentLayerId);
  const [currentLayer, setCurrentLayer] = useState<Layer | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>("free");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState<'yaml' | 'mythicscript'>('mythicscript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [frameMode, setFrameMode] = useState<"auto" | "manual">("auto");
  const [manualFrameCount, setManualFrameCount] = useState<number | undefined>(undefined);
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [expandedModes, setExpandedModes] = useState<Record<string, boolean>>({});
  const [chainSequence, setChainSequence] = useState<string[]>([]);
  const [chainItems, setChainItems] = useState<Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }>>([]);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showParticleModal, setShowParticleModal] = useState(false);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState("#ffffff");

  // Synchronize selectedElementIds with selectedShapeIds
  useEffect(() => {
    setSelectedShapeIds(selectedElementIds);
  }, [selectedElementIds]);



  const [settings, setSettings] = useState({
    particleCount: 10,
    shapeSize: 20,
    color: "#000000",
    particle: "reddust",
    alpha: 1,
    repeat: 1,
    yOffset: 0,
    skillName: "MySkill",
    pngSize: 100,
    objScale: 1.0,
    performanceMode: false,
    imageColorMode: true, // GIF için default açık
    snapToGridMode: false,
    gridSize: 20,
    mirrorMode: false,
    showGrid: true, // Grid görünürlüğü
    // PNG optimizasyon ayarları
    alphaThreshold: 100,
    colorTolerance: 30,
    maxElements: 10000,
    includeAllColors: false,
  });

  const [modes, setModes] = useState<Modes>({
    rotateMode: false,
    localRotateMode: false,
    moveMode: false,
    riseMode: false,
    proximityMode: false,
    chainMode: false,
    rainbowMode: false,
    imageColorMode: false,
    mirrorMode: false,
    doubleMirrorMode: false,
    performanceMode: false,
    staticRainbowMode: false,
    actionRecordingMode: false,
  });

  const [modeSettings, setModeSettings] = useState({
    rotateMode: { speed: 1, frames: 60 },
    localRotateMode: { speed: 1, radius: 0.5 },
    moveMode: { speed: 0.5, maxDistance: 10, direction: 0, elevation: 0 },
    riseMode: { speed: 0.5, maxHeight: 10 },
    proximityMode: { step: 5, delay: 2 },
    rainbowMode: { period: 3 },
  });

  // Chain recording event listeners - modes tanımlandıktan sonra
  useEffect(() => {
    const handleAddToChainRecording = (event: CustomEvent) => {
      // Sadece action recording aktifken çalış
      if (!storeIsRecording) return

      const { elements, delayTicks } = event.detail

      setChainItems(prevItems => {
        const newItems = [...prevItems]

        // Mevcut chain'deki element ID'lerini topla (duplicate kontrolü)
        const existingElementIds = new Set<string>()
        newItems.forEach((item) => {
          if (item.elementId) existingElementIds.add(item.elementId)
          if (item.elementIds) item.elementIds.forEach((id) => existingElementIds.add(id))
        })

        // Sadece henüz chain'de olmayan elementleri ekle
        const elementsToAdd = elements.filter((element: any) => !existingElementIds.has(element.id))

        if (elementsToAdd.length === 0) return prevItems // Hiç yeni element yoksa değişiklik yapma

        // Add delay before elements (except for the very first element)
        if (newItems.length > 0) {
          newItems.push({
            type: 'delay',
            id: `delay-${Date.now()}`,
            delay: delayTicks
          })
        }

        // Add elements
        elementsToAdd.forEach((element: any) => {
          newItems.push({
            type: 'element',
            id: `rec-${Date.now()}-${Math.random()}`,
            elementId: element.id
          })
        })

        return newItems
      })
    }

    const handleResetChainItems = () => {
      setChainItems([])
    }

    window.addEventListener('addToChainRecording', handleAddToChainRecording as EventListener)
    window.addEventListener('resetChainItems', handleResetChainItems)

    return () => {
      window.removeEventListener('addToChainRecording', handleAddToChainRecording as EventListener)
      window.removeEventListener('resetChainItems', handleResetChainItems)
    }
  }, [storeIsRecording])

  // Duyuru state'leri artık gerekli değil - toast kullanıyoruz

  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistoryStore();

  const [pendingElements, setPendingElements] = useState<Element[] | null>(null);

  const [forceUpdate, setForceUpdate] = useState(0);

  const { copyElements, pasteElements } = useClipboardStore();

  const [optimize, setOptimize] = useState(false);
  const [showGridCoordinates, setShowGridCoordinates] = useState(true);

  // Performans optimizasyon state'leri
  const [performanceAnalysis, setPerformanceAnalysis] = useState(() => analyzeEffectLines(layers));

  // History snapshot'ı oluştur ve kaydet
  const saveToHistory = useCallback((action?: string) => {
    pushSnapshot({
      layers: [...layers],
      settings: { ...settings },
      modes: { ...modes },
      currentTool,
      selectedShapeIds: [...selectedShapeIds],
      action
    })
  }, [layers, settings, modes, currentTool, selectedShapeIds, pushSnapshot])

  // Batch mode için state'ler
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [pendingHistorySnapshot, setPendingHistorySnapshot] = useState<any>(null)

  // Batch mode'da history'yi geciktir
  const saveToHistoryBatch = useCallback((force = false, action?: string) => {
    if (force || !isBatchMode) {
      saveToHistory(action)
      setPendingHistorySnapshot(null)
    } else {
      // Batch mode'da snapshot'ı sakla, mouse up'ta ekle
      setPendingHistorySnapshot({
        layers: [...layers],
        settings: { ...settings },
        modes: { ...modes },
        currentTool,
        selectedShapeIds: [...selectedShapeIds],
        action
      })
    }
  }, [isBatchMode, layers, settings, modes, currentTool, selectedShapeIds, saveToHistory])

  // Batch mode'u başlat (mouse down)
  const startBatchMode = useCallback(() => {
    setIsBatchMode(true)
  }, [])

  // Batch mode'u bitir ve history'yi ekle (mouse up)
  const endBatchMode = useCallback(() => {
    setIsBatchMode(false)
    if (pendingHistorySnapshot) {
      pushSnapshot(pendingHistorySnapshot)
      setPendingHistorySnapshot(null)
    }
  }, [pendingHistorySnapshot, pushSnapshot])

  // History'den state'i geri yükle
  const restoreFromHistory = useCallback((snapshot: any) => {
    if (snapshot.layers) {
      setLayers(snapshot.layers)
      if (snapshot.layers.length > 0) {
        setCurrentLayer(snapshot.layers[0])
      }
    }
    if (snapshot.settings) {
      setSettings(snapshot.settings)
    }
    if (snapshot.modes) {
      setModes(snapshot.modes)
    }
    if (snapshot.currentTool) {
      setCurrentTool(snapshot.currentTool)
    }
    if (snapshot.selectedShapeIds) {
      setSelectedShapeIds(snapshot.selectedShapeIds)
    }
  }, [setLayers])

  // Undo işlemi
  const handleUndo = useCallback(() => {
    const snapshot = undo()
    if (snapshot) {
      restoreFromHistory(snapshot)
    }
  }, [undo, restoreFromHistory])

  // Redo işlemi
  const handleRedo = useCallback(() => {
    const snapshot = redo()
    if (snapshot) {
      restoreFromHistory(snapshot)
    }
  }, [redo, restoreFromHistory])

  // İlk layer'ı oluştur - sadece bir kez çalışır
  useEffect(() => {
    if (layers.length === 0) {
      const initialLayer: Layer = {
        id: uuidv4(),
        name: "Layer 1",
        visible: true,
        elements: [],
        tickStart: 0,
        tickEnd: 40,
        tickDelay: 20,
        particle: "reddust",
        color: "#000000",
        alpha: 1,
        shapeSize: 20,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "Origin",
        effectType: "particles" as EffectType
      };
      setLayers([initialLayer]);
      setCurrentLayer(initialLayer);
    }
  }, [layers.length, setLayers]);

  // Auto-save to current session when data changes
  useEffect(() => {
    const { currentProjectId, currentSessionId, updateSessionData } = useEffectSessionStore.getState();
    if (currentProjectId && currentSessionId) {
      updateSessionData(currentProjectId, currentSessionId, {
        layers,
        settings,
        modes: modes as unknown as Record<string, boolean>,
        modeSettings,
        actionRecords: actionRecords
      });
    }
  }, [layers, settings, modes, modeSettings, actionRecords]);

  // Önceki layer ID'sini takip etmek için ref
  const previousLayerIdRef = useRef<string | null>(null);

  // Store'daki currentLayerId değiştiğinde currentLayer'ı güncelle
  useEffect(() => {
    if (currentLayerId && layers.length > 0) {
      const found = layers.find(l => l.id === currentLayerId) || null;
      setCurrentLayer(found);

      // Sadece farklı bir layer'a geçildiğinde selected element'leri temizle
      if (previousLayerIdRef.current && previousLayerIdRef.current !== currentLayerId) {
        setSelectedShapeIds([]);
        setSelectedElementId(null);
      }

      // Önceki layer ID'sini güncelle
      previousLayerIdRef.current = currentLayerId;
    }
  }, [currentLayerId, layers, setSelectedShapeIds, setSelectedElementId]);

  // Global functions for file loading - useCallback ile optimize edildi
  const addPngElementsCallback = useCallback(
    (elements: Element[]) => {
      if (currentLayer) {
        // History'ye kaydet
        saveToHistoryBatch(true, `Imported ${elements.length} PNG element${elements.length !== 1 ? 's' : ''} to ${currentLayer.name}`);

        const newElements = [...currentLayer.elements, ...elements];
        const updatedLayers = layers.map((layer) => (layer.id === currentLayer.id ? { ...layer, elements: newElements } : layer));
        setLayers(updatedLayers);
        setCurrentLayer((prev) => (prev ? { ...prev, elements: newElements } : null));
      }
    },
    [currentLayer, layers, setLayers, saveToHistoryBatch],
  );

  const addObjElementsCallback = useCallback(
    (elements: Element[]) => {
      if (currentLayer) {
        // History'ye kaydet
        saveToHistoryBatch(true, `Imported ${elements.length} OBJ element${elements.length !== 1 ? 's' : ''} to ${currentLayer.name}`);

        const newElements = [...currentLayer.elements, ...elements];
        const updatedLayers = layers.map((layer) => (layer.id === currentLayer.id ? { ...layer, elements: newElements } : layer));
        setLayers(updatedLayers);
        setCurrentLayer((prev) => (prev ? { ...prev, elements: newElements } : null));
      }
    },
    [currentLayer, layers, setLayers, saveToHistoryBatch],
  );

  // GIF animasyon state'i
  const [gifAnimationState, setGifAnimationState] = useState<{
    isPlaying: boolean;
    currentFrame: number;
    frameCount: number;
    layerId: string | null;
  }>({
    isPlaying: false,
    currentFrame: 0,
    frameCount: 0,
    layerId: null
  });

  // GIF animasyon fonksiyonu
  const startGifAnimation = useCallback((layer: Layer, frameGroups: { [key: number]: Element[] }) => {
    const frameCount = Object.keys(frameGroups).length;

    setGifAnimationState({
      isPlaying: true,
      currentFrame: 0,
      frameCount: frameCount,
      layerId: layer.id
    });

    let currentFrame = 0;
    const animationInterval = setInterval(() => {
      // Mevcut frame'in elementlerini göster
      const frameElements = frameGroups[currentFrame] || [];

      // Layer'ı güncelle - sadece mevcut frame'in elementlerini göster
      const updatedLayers = layers.map((l: Layer) =>
        l.id === layer.id
          ? { ...l, elements: frameElements }
          : l
      );
      setLayers(updatedLayers);

      // Current layer'ı da güncelle
      setCurrentLayer(prevLayer =>
        prevLayer && prevLayer.id === layer.id
          ? { ...prevLayer, elements: frameElements }
          : prevLayer
      );

      currentFrame = (currentFrame + 1) % frameCount;

      setGifAnimationState(prev => ({
        ...prev,
        currentFrame: currentFrame
      }));

    }, 200); // 200ms per frame

    // Cleanup için interval'ı sakla
    (layer as any).animationInterval = animationInterval;

  }, [setLayers, setCurrentLayer]);

  const addGifLayersCallback = useCallback(
    (gifLayers: any[]) => {
      // Mevcut GIF layer'larını temizle
      const nonGifLayers = layers.filter((layer: Layer) => !layer.isGifFrame);

      // Yeni GIF layer'larını ekle - type casting yapıyoruz
      const newLayers: Layer[] = [...nonGifLayers, ...(gifLayers as Layer[])];

      console.log(`${gifLayers.length} GIF layers added, total layers: ${newLayers.length}`);
      setLayers(newLayers);

      // İlk GIF layer'ını current layer yap
      if (gifLayers.length > 0) {
        setCurrentLayer(gifLayers[0]);
      }
    },
    [layers, setLayers]
  );

  const addGifElementsCallback = useCallback(
    (elements: Element[], frameCount: number) => {
      if (currentLayer) {
        // History'ye kaydet
        saveToHistoryBatch(true, `Imported GIF with ${frameCount} frames (${elements.length} elements)`);

        console.log(`🎬 GIF callback: ${elements.length} element, ${frameCount} frame alındı`);

        // GIF elementlerini frame'lere göre grupla
        const frameGroups: { [key: number]: Element[] } = {};

        elements.forEach(element => {
          const frameIndex = (element as any).frameIndex || 0;
          if (!frameGroups[frameIndex]) {
            frameGroups[frameIndex] = [];
          }
          frameGroups[frameIndex].push(element);
        });

        console.log(`📊 Frame grupları: ${Object.keys(frameGroups).length} frame`);

        // Her frame için ayrı layer oluştur
        const newLayers: Layer[] = [];

        Object.keys(frameGroups).forEach((frameIndexStr, index) => {
          const frameIndex = parseInt(frameIndexStr);
          const frameElements = frameGroups[frameIndex];

          const frameLayer: Layer = {
            id: `gif-frame-${frameIndex}-${Date.now()}`,
            name: `GIF Frame ${frameIndex + 1}/${frameCount}`,
            elements: frameElements,
            visible: index === 0, // Sadece ilk frame görünür başlasın
            tickStart: currentLayer.tickStart || 0,
            tickEnd: currentLayer.tickEnd || 100,
            tickDelay: (currentLayer.tickDelay || 0) + (frameIndex * 2), // Frame delay
            color: currentLayer.color,
            particle: currentLayer.particle,
            alpha: currentLayer.alpha,
            shapeSize: currentLayer.shapeSize || 1,
            repeat: currentLayer.repeat,
            repeatInterval: currentLayer.repeatInterval,
            targeter: currentLayer.targeter,
            effectType: currentLayer.effectType,
            effectParams: currentLayer.effectParams,
            yOffset: currentLayer.yOffset,
            isGifFrame: true,
            gifFrameCount: frameCount
          };

          newLayers.push(frameLayer);
        });

        // Tüm frame layer'larını ekle
        const updatedLayers = [...layers, ...newLayers];
        setLayers(updatedLayers);
        setCurrentLayer(newLayers[0]); // İlk frame'i seç

        console.log(`✅ ${newLayers.length} GIF frame layers added`);

        // Toast mesajı
        toast({
          title: "GIF Import Successful!",
          description: `${frameCount} frames, ${elements.length} elements added`,
        });
      }
    },
    [currentLayer, layers, setLayers, toast, saveToHistoryBatch],
  );

  useEffect(() => {
    window.addPngElements = addPngElementsCallback;
    window.addObjElements = addObjElementsCallback;
    window.addGifElements = addGifElementsCallback;
    window.addGifLayers = addGifLayersCallback;

    return () => {
      delete window.addPngElements;
      delete window.addObjElements;
      delete window.addGifElements;
      delete window.addGifLayers;
    };
  }, [addPngElementsCallback, addObjElementsCallback, addGifLayersCallback]);

  // Katman ekleme
  const addLayer = useCallback(() => {
    saveToHistoryBatch(true, "Added new layer");
    const newLayer: Layer = {
      id: uuidv4(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      elements: [],
      tickStart: 0,
      tickEnd: 40,
      tickDelay: 20,
      particle: settings.particle,
      color: settings.color,
      alpha: settings.alpha,
      shapeSize: settings.shapeSize,
      repeat: settings.repeat,
      yOffset: 0,
      repeatInterval: 1,
      targeter: "Origin",
      effectType: "particles" as EffectType
    }
    setLayers([...layers, newLayer]);
    setCurrentLayer(newLayer);
  }, [layers, settings, setLayers, saveToHistoryBatch]);

  const deleteLayer = useCallback(() => {
    if (!currentLayer || layers.length <= 1) return
    saveToHistoryBatch(true, `Deleted layer "${currentLayer.name}"`);
    const newLayers = layers.filter((l) => l.id !== currentLayer.id)
    setLayers(newLayers)
    setCurrentLayer(newLayers[0] || null)
    // Layer silindiğinde selected element'leri temizle
    setSelectedShapeIds([])
    setSelectedElementId(null)
  }, [currentLayer, layers, saveToHistoryBatch, setSelectedShapeIds, setSelectedElementId]);

  const clearAllLayers = useCallback(() => {
    if (layers.length === 0) return
    const totalElements = layers.reduce((total, layer) => total + layer.elements.length, 0)
    saveToHistoryBatch(true, `Cleared all ${totalElements} elements from ${layers.length} layers`);
    // Tüm layer'lardaki elementleri temizle, layer'ları koru
    const clearedLayers = layers.map(layer => ({ ...layer, elements: [] }))
    setLayers(clearedLayers)
    // Current layer'ı güncelle
    if (currentLayer) {
      const updatedCurrentLayer = clearedLayers.find(l => l.id === currentLayer.id)
      setCurrentLayer(updatedCurrentLayer || clearedLayers[0])
    }
    // Seçili elementleri temizle
    setSelectedShapeIds([])
    setSelectedElementId(null)
    setSelectedElementIds([])
  }, [layers, currentLayer, saveToHistoryBatch, setSelectedShapeIds, setSelectedElementId]);

  const selectLayer = useCallback((layer: Layer) => {
    setCurrentLayer(layer)
  }, [])

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    // Layer güncelleme işlemi - history kaydı yapma, çünkü genellikle başka işlemlerin parçası
    const newLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    );
    setLayers(newLayers);
    // Eğer güncellenen layer aktif layer ise, currentLayer'ı da güncelle
    const updated = newLayers.find(l => l.id === layerId);
    if (updated && currentLayer?.id === layerId) {
      setCurrentLayer(updated);
    }
  }, [currentLayer, layers, saveToHistoryBatch]);

  const handleAddElement = useCallback((element: Element | Element[]) => {
    if (!currentLayer) return
    const elements = Array.isArray(element) ? element : [element]

    // Batch mode'da history'yi geciktir, normal mode'da hemen kaydet
    saveToHistoryBatch(false, `Added ${elements.length} element${elements.length !== 1 ? 's' : ''} to ${currentLayer.name}`);

    const updatedElements = [...currentLayer.elements, ...elements]
    updateLayer(currentLayer.id, { elements: updatedElements })

    // Otomatik chain'e ekleme kaldırıldı - sadece REC butonu ile kontrol edilecek

    // Otomatik seçim yapma - kullanıcı manuel olarak seçsin
    // const newElementIds = elements.map(el => el.id)
    // setSelectedElementIds(newElementIds)
  }, [currentLayer, updateLayer, saveToHistoryBatch, modes.chainMode, chainItems, setChainItems, setSelectedElementIds])

  const handleClearCanvas = useCallback(() => {
    if (!currentLayer) return
    const elementCount = currentLayer.elements.length
    saveToHistoryBatch(true, `Cleared ${elementCount} element${elementCount !== 1 ? 's' : ''} from ${currentLayer.name}`);
    updateLayer(currentLayer.id, { elements: [] })
    // Selected element'leri de temizle
    setSelectedShapeIds([])
    setSelectedElementId(null)
    // Chain items'ları da temizle (delay'lar dahil)
    setChainItems([])
    setChainSequence([])
  }, [currentLayer, updateLayer, saveToHistoryBatch, setSelectedShapeIds, setSelectedElementId, setChainItems, setChainSequence])

  const handleFrameSettingsChange = (mode: "auto" | "manual", frameCount?: number) => {
    setFrameMode(mode)
    setManualFrameCount(mode === "manual" ? frameCount : undefined)
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas'ı küçük base64'e çevirme fonksiyonu
  const captureCanvasAsBase64 = useCallback((): string | null => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Küçük bir temporary canvas oluştur (Discord için)
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;

      // Küçük boyut (max 400x300)
      const maxWidth = 400;
      const maxHeight = 300;
      const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);

      tempCanvas.width = canvas.width * ratio;
      tempCanvas.height = canvas.height * ratio;

      // Canvas'ı küçük boyutta çiz
      tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

      // Orta kalitede JPEG'e çevir (Discord için)
      return tempCanvas.toDataURL('image/jpeg', 0.6);
    } catch (e) {
      console.warn('Canvas capture failed:', e);
      return null;
    }
  }, []);

  const generateCode = useCallback(async (optimize?: boolean) => {
    setIsGenerating(true);
    try {
      // Canvas'ın fotoğrafını al
      const canvasImage = captureCanvasAsBase64();

      const code = await generateEffectCode(
        layers,
        settings,
        modes,
        modeSettings,
        frameMode,
        manualFrameCount || 100,
        '2D Editor',
        !!optimize,
        chainSequence,
        chainItems,
        canvasImage, // Canvas fotoğrafını gönder
        actionRecords, // Action Recording'ı gönder
        {
          optimizeCircleFrames,
          optimizeIdleRepeat,
          debugFrameComments
        }
      );
      setGeneratedCode(code);
    } catch (e) {
      setGeneratedCode("# Error generating code\n" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsGenerating(false);
    }
  }, [layers, settings, modes, modeSettings, frameMode, manualFrameCount, captureCanvasAsBase64]);

  const newProject = () => {
    // Tüm state'leri sıfırla
    const initialLayer: Layer = {
      id: uuidv4(),
      name: "Layer 1",
      visible: true,
      elements: [],
      tickStart: 0,
      tickEnd: 40,
      tickDelay: 20,
      particle: "reddust",
      color: "#000000",
      alpha: 1,
      repeat: 1,
      repeatInterval: 1,
      targeter: "self",
      effectType: "particles",
      shapeSize: 20,
      yOffset: 0
    }

    setLayers([initialLayer])
    setCurrentLayer(initialLayer)
    setSelectedElementIds([])
    setSelectedShapeIds([])
    setChainItems([])
    setChainSequence([])
    setGeneratedCode("")

    // Settings'i default'a döndür
    setSettings({
      particleCount: 10,
      shapeSize: 20,
      color: "#000000",
      particle: "reddust",
      alpha: 1,
      repeat: 1,
      yOffset: 0,
      skillName: "MySkill",
      pngSize: 100,
      objScale: 1.0,
      performanceMode: false,
      imageColorMode: true,
      snapToGridMode: false,
      gridSize: 20,
      mirrorMode: false,
      showGrid: true,
      alphaThreshold: 100,
      colorTolerance: 30,
      maxElements: 10000,
      includeAllColors: false,
    })

    // Modes'u default'a döndür
    setModes({
      rotateMode: false,
      localRotateMode: false,
      moveMode: false,
      riseMode: false,
      proximityMode: false,
      chainMode: false,
      rainbowMode: false,
      imageColorMode: false,
      mirrorMode: false,
      doubleMirrorMode: false,
      performanceMode: false,
      staticRainbowMode: false,
      actionRecordingMode: false,
    })

    // History'yi temizle
    // pushSnapshot ile yeni başlangıç noktası oluştur
    saveToHistory("New Project Created")

    toast({
      title: "New Project Created",
      description: "All layers and settings have been reset",
      duration: 2000,
    })
  }

  const saveProject = () => {
    const projectData = {
      layers,
      settings,
      modes,
      modeSettings,
    }
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "effect.fxp"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleYamlImport = (yamlContent: string) => {
    try {
      const parsed = yaml.load(yamlContent) as any
      console.log("YAML parsed:", parsed)

      // History'ye kaydet (başlangıçta genel bir kayıt)
      saveToHistoryBatch(true, "Imported YAML file");

      const elements: Element[] = []
      const newLayers: Layer[] = []
      let elementId = 0

      // MythicMobs YAML formatını parse et
      if (parsed && typeof parsed === 'object') {
        const skillNames = Object.keys(parsed);
        const multipleSkills = skillNames.length > 1;

        // Her skill'i bul
        skillNames.forEach(skillName => {
          const skillData = parsed[skillName]
          if (skillData && skillData.Skills) {
            const skills = skillData.Skills
            const skillElements: Element[] = []
            let elementId = 0

            skills.forEach((skillLine: string, skillIndex: number) => {
              // Tüm satırları sakla (E:P dışındakiler de dahil)
              const isEffectLine = skillLine.includes('e:p') || skillLine.includes('effect:particles') || skillLine.includes('effect:') ||
                skillLine.includes('particlering') || skillLine.includes('particlehelix') || skillLine.includes('particleorbital');

              // E:P dışındaki satırları meta olarak sakla
              if (!isEffectLine) {
                skillElements.push({
                  id: `yaml-${skillName}-${skillIndex}-${elementId++}`,
                  type: 'yaml-comment' as any,
                  position: { x: 0, z: 0 },
                  color: '#666666',
                  yOffset: 0,
                  meta: {
                    skillName,
                    skillIndex,
                    originalLine: skillLine,
                    isComment: true,
                    lineType: skillLine.includes('delay') ? 'delay' : 'other'
                  }
                } as Element)
                return
              }

              // Effect satırlarını parse et - Gelişmiş MythicMobs effect'leri destekle
              const effectRegex = /(e:p|effect:particles|effect:|particlering|particlehelix|particleorbital|particlesphere|particletornado|particleline|particlelinering)\{([^}]+)\}/
              const originRegex = /@(Origin|Target|Trigger|Caster)\{([^}]+)\}/

              const effectMatch = skillLine.match(effectRegex)
              const originMatch = skillLine.match(originRegex)

              if (effectMatch && originMatch) {
                const effectType = effectMatch[1]
                const effectProps = effectMatch[2]
                const targeter = originMatch[1]
                const originProps = originMatch[2]

                // Effect özelliklerini parse et
                const colorMatch = effectProps.match(/c=([^;]+)/)
                const sizeMatch = effectProps.match(/size=([^;]+)/)
                const alphaMatch = effectProps.match(/a=([^;]+)/)
                const particleMatch = effectProps.match(/p=([^;]+)/)
                const radiusMatch = effectProps.match(/r=([^;]+)/)
                const pointsMatch = effectProps.match(/points=([^;]+)/)
                const helixLengthMatch = effectProps.match(/hl=([^;]+)/)
                const helixRadiusMatch = effectProps.match(/hr=([^;]+)/)
                const distanceBetweenMatch = effectProps.match(/db=([^;]+)/)

                // Origin koordinatlarını parse et
                const xoffsetMatch = originProps.match(/xoffset=([^;]+)/)
                const zoffsetMatch = originProps.match(/zoffset=([^;]+)/)
                const yoffsetMatch = originProps.match(/yoffset=([^;]+)/)

                const x = parseFloat(xoffsetMatch?.[1] || '0')
                const z = parseFloat(zoffsetMatch?.[1] || '0')
                const yOffset = parseFloat(yoffsetMatch?.[1] || '0')

                // Renk bilgisini çıkar
                let color = settings.color
                if (colorMatch) {
                  const colorValue = colorMatch[1]
                  if (colorValue.startsWith('#')) {
                    color = colorValue
                  } else if (colorValue.includes(',')) {
                    // RGB formatı varsa
                    const rgb = colorValue.split(',').map(c => parseInt(c.trim()))
                    if (rgb.length >= 3) {
                      color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
                    }
                  }
                }

                // Effect parametrelerini çıkar
                const size = parseFloat(sizeMatch?.[1] || '1')
                const alpha = parseFloat(alphaMatch?.[1] || '1')
                const particleType = particleMatch?.[1] || 'reddust'
                const radius = parseFloat(radiusMatch?.[1] || '1')
                const points = parseInt(pointsMatch?.[1] || '8')
                const helixLength = parseFloat(helixLengthMatch?.[1] || '1')
                const helixRadius = parseFloat(helixRadiusMatch?.[1] || '1')
                const distanceBetween = parseFloat(distanceBetweenMatch?.[1] || '0.1')

                // Effect türüne göre elementler oluştur
                const baseElement = {
                  id: `yaml-${skillName}-${skillIndex}-${elementId++}`,
                  type: 'yaml' as any,
                  color: color,
                  yOffset: yOffset,
                  size: size,
                  alpha: alpha,
                  particleType: particleType,
                  effectType: effectType,
                  targeter: targeter,
                  meta: {
                    skillName,
                    skillIndex,
                    originalLine: skillLine,
                    effectProps,
                    originProps,
                    radius,
                    points,
                    helixLength,
                    helixRadius,
                    distanceBetween
                  }
                }

                // Effect türüne göre element(ler) oluştur
                if (effectType === 'particlering') {
                  // Ring: Daire şeklinde elementler oluştur
                  for (let i = 0; i < points; i++) {
                    const angle = (i / points) * 2 * Math.PI
                    const ringX = x + Math.cos(angle) * radius
                    const ringZ = z + Math.sin(angle) * radius
                    elements.push({
                      ...baseElement,
                      id: `${baseElement.id}-ring-${i}`,
                      position: { x: ringX, z: ringZ },
                      type: 'circle' as any
                    } as Element)
                  }
                } else if (effectType === 'particlehelix') {
                  // Helix: Spiral şeklinde elementler oluştur
                  const helixPoints = Math.max(points, 16)
                  for (let i = 0; i < helixPoints; i++) {
                    const t = i / helixPoints
                    const angle = t * helixLength * 2 * Math.PI
                    const helixY = yOffset + t * helixLength
                    const helixX = x + Math.cos(angle) * helixRadius
                    const helixZ = z + Math.sin(angle) * helixRadius
                    elements.push({
                      ...baseElement,
                      id: `${baseElement.id}-helix-${i}`,
                      position: { x: helixX, z: helixZ },
                      yOffset: helixY,
                      type: 'line' as any
                    } as Element)
                  }
                } else if (effectType === 'particleorbital') {
                  // Orbital: Yörünge şeklinde elementler oluştur
                  for (let i = 0; i < points; i++) {
                    const angle = (i / points) * 2 * Math.PI
                    const orbitalX = x + Math.cos(angle) * radius
                    const orbitalZ = z + Math.sin(angle) * radius
                    elements.push({
                      ...baseElement,
                      id: `${baseElement.id}-orbital-${i}`,
                      position: { x: orbitalX, z: orbitalZ },
                      type: 'circle' as any
                    } as Element)
                  }
                } else if (effectType === 'particlesphere') {
                  // Sphere: Küre şeklinde elementler oluştur
                  const spherePoints = Math.max(points, 20)
                  for (let i = 0; i < spherePoints; i++) {
                    const phi = Math.acos(1 - 2 * (i / spherePoints))
                    const theta = Math.PI * (1 + Math.sqrt(5)) * i
                    const sphereX = x + radius * Math.sin(phi) * Math.cos(theta)
                    const sphereY = yOffset + radius * Math.cos(phi)
                    const sphereZ = z + radius * Math.sin(phi) * Math.sin(theta)
                    elements.push({
                      ...baseElement,
                      id: `${baseElement.id}-sphere-${i}`,
                      position: { x: sphereX, z: sphereZ },
                      yOffset: sphereY,
                      type: 'free' as any
                    } as Element)
                  }
                } else if (effectType === 'particleline') {
                  // Line: Çizgi şeklinde elementler oluştur
                  const linePoints = Math.max(Math.floor(radius / distanceBetween), 2)
                  for (let i = 0; i < linePoints; i++) {
                    const t = i / (linePoints - 1)
                    const lineX = x + t * radius
                    const lineZ = z
                    elements.push({
                      ...baseElement,
                      id: `${baseElement.id}-line-${i}`,
                      position: { x: lineX, z: lineZ },
                      type: 'line' as any
                    } as Element)
                  }
                } else {
                  // Basit particle: Tek element oluştur
                  skillElements.push({
                    ...baseElement,
                    position: { x, z },
                    type: 'free' as any
                  } as Element)
                }
              }
            })

            // Her skill için ayrı katman oluştur (eğer birden fazla skill varsa)
            if (multipleSkills && skillElements.length > 0) {
              const newLayer: Layer = {
                id: uuidv4(),
                name: `${skillName} (YAML)`,
                color: settings.color,
                visible: true,
                elements: skillElements,
                tickStart: 0,
                tickEnd: 40,
                tickDelay: 20,
                particle: settings.particle,
                alpha: settings.alpha,
                shapeSize: settings.shapeSize,
                repeat: settings.repeat,
                yOffset: 0,
                repeatInterval: 1,
                targeter: "Origin",
                effectType: "particles" as EffectType
              }
              newLayers.push(newLayer)
            } else {
              // Tek skill varsa elements array'ine ekle
              elements.push(...skillElements)
            }
          }
        })
      }

      // Birden fazla skill varsa her biri için ayrı katman oluşturuldu
      if (newLayers.length > 0) {
        setLayers([...layers, ...newLayers])
        setCurrentLayer(newLayers[0]) // İlk skill'i aktif yap

        const totalElements = newLayers.reduce((sum: number, layer: Layer) => sum + layer.elements.length, 0)
        toast({
          title: "YAML Import Successful",
          description: `${newLayers.length} skills imported as separate layers (${totalElements} total elements)`,
          duration: 4000,
        })
      } else if (elements.length > 0) {
        // Tek skill varsa mevcut sistemi kullan
        console.log(`YAML import: ${elements.length} elements added`)

        if (currentLayer) {
          const updatedLayer = {
            ...currentLayer,
            elements: [...currentLayer.elements, ...elements]
          }

          const updatedLayers = layers.map(layer =>
            layer.id === currentLayer.id ? updatedLayer : layer
          )

          setLayers(updatedLayers)
          setCurrentLayer(updatedLayer)

          toast({
            title: "YAML Import Successful",
            description: `${elements.length} elements imported from YAML file`,
            duration: 3000,
          })
        } else {
          // Eğer aktif katman yoksa yeni katman oluştur
          const newLayer: Layer = {
            id: uuidv4(),
            name: "YAML Import",
            color: settings.color,
            visible: true,
            elements: elements,
            tickStart: 0,
            tickEnd: 40,
            tickDelay: 20,
            particle: settings.particle,
            alpha: settings.alpha,
            shapeSize: settings.shapeSize,
            repeat: settings.repeat,
            yOffset: 0,
            repeatInterval: 1,
            targeter: "Origin",
            effectType: "particles" as EffectType
          }

          setLayers([...layers, newLayer])
          setCurrentLayer(newLayer)

          toast({
            title: "YAML Import Successful",
            description: `${elements.length} elements imported to new layer`,
            duration: 3000,
          })
        }
      }
    } catch (error) {
      console.error("Error parsing YAML:", error)
      toast({
        title: "YAML Import Error",
        description: "Failed to parse YAML file. Please check the format.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const loadProject = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".fxp,.yaml,.yml"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string
          const fileName = file.name.toLowerCase()

          if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
            // YAML dosyası - import-panel.tsx'teki loadYamlFile fonksiyonunu kullan
            handleYamlImport(fileContent)
          } else {
            // FXP dosyası - mevcut JSON parsing
            const projectData = JSON.parse(fileContent)
            setLayers(projectData.layers)
            setSettings(projectData.settings)
            setModes(projectData.modes)
            setModeSettings(projectData.modeSettings)
            if (projectData.layers.length > 0) {
              setCurrentLayer(projectData.layers[0])
            }
          }
        } catch (error) {
          console.error("Error loading project:", error)
          alert("Error loading project file")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleShapeSelect = (elementIds: string[]) => {
    setSelectedShapeIds(elementIds);
    setSelectedElementIds(elementIds); // Canvas için de set et
  };

  const handleUpdateElement = useCallback((elementId: string, updates: Partial<Element>) => {
    if (!currentLayer) return;

    const updatedElements = currentLayer.elements.map(element => {
      if (element.id === elementId) {
        return { ...element, ...updates };
      }
      return element;
    });

    // History'ye ekle
    saveToHistoryBatch(true, `Updated element in ${currentLayer.name}`);

    updateLayer(currentLayer.id, { elements: updatedElements });
  }, [currentLayer, updateLayer, saveToHistoryBatch]);

  // Handle per-shape element count change
  const handleElementCountChange = (count: number, groupId: string) => {
    if (!currentLayer) return;

    const groupElements = currentLayer.elements.filter(el => el.groupId === groupId);
    if (groupElements.length === 0) return;

    const firstElement = groupElements[0];
    const color = firstElement.color;
    const type = firstElement.type;
    const yOffset = firstElement.yOffset;

    // Remove old elements
    const newElements = currentLayer.elements.filter(el => el.groupId !== groupId);

    // Clamp minimums per shape
    if (type === "circle") {
      count = Math.max(3, count)
      // Merkez ve yarıçapı mevcut elementlerden hesapla (max uzaklık esaslı)
      const center = {
        x: groupElements.reduce((sum, el) => sum + el.position.x, 0) / groupElements.length,
        z: groupElements.reduce((sum, el) => sum + el.position.z, 0) / groupElements.length,
      };
      let avgRadius = 1;
      if (groupElements.length > 1) {
        // en uzak noktanın uzaklığını yarıçap olarak al (küçülmeyi önler)
        avgRadius = groupElements.reduce((max, el) => {
          const dx = el.position.x - center.x;
          const dz = el.position.z - center.z;
          const r = Math.sqrt(dx * dx + dz * dz);
          return Math.max(max, r);
        }, 1);
      }
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const x = center.x + Math.cos(angle) * avgRadius;
        const z = center.z + Math.sin(angle) * avgRadius;
        newElements.push({
          ...firstElement,
          id: `circle-${Date.now()}-${i}`,
          position: { x, z },
          groupId,
        });
      }
    } else if (type === "square") {
      // Square için: en az 8 ve 4'ün katı
      count = Math.max(8, Math.floor(count / 4) * 4)
      // Square için köşe noktalarını hesapla
      const center = {
        x: groupElements.reduce((sum, el) => sum + el.position.x, 0) / groupElements.length,
        z: groupElements.reduce((sum, el) => sum + el.position.z, 0) / groupElements.length,
      };
      // mevcut genişliği korumak için mevcut noktalardan merkeze en uzak olanı esas al
      let half = 1;
      if (groupElements.length > 0) {
        half = groupElements.reduce((max, el) => {
          const dx = Math.abs(el.position.x - center.x);
          const dz = Math.abs(el.position.z - center.z);
          return Math.max(max, dx, dz);
        }, 1);
      }
      const minX = center.x - half;
      const maxX = center.x + half;
      const minZ = center.z - half;
      const maxZ = center.z + half;

      const width = maxX - minX;
      const height = maxZ - minZ;
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;

      // Square için element sayısını 4'ün katı yap
      const adjustedCount = count;
      const elementsPerSide = Math.max(2, adjustedCount / 4);

      for (let i = 0; i < adjustedCount; i++) {
        const side = Math.floor(i / elementsPerSide);
        const position = i % elementsPerSide;
        const t = position / (elementsPerSide - 1);

        let x, z;
        if (side === 0) { // Top side
          x = minX + t * width;
          z = minZ;
        } else if (side === 1) { // Right side
          x = maxX;
          z = minZ + t * height;
        } else if (side === 2) { // Bottom side
          x = maxX - t * width;
          z = maxZ;
        } else { // Left side
          x = minX;
          z = maxZ - t * height;
        }

        newElements.push({
          ...firstElement,
          id: `square-${Date.now()}-${i}`,
          position: { x, z },
          groupId,
        });
      }
    } else if (type === "line") {
      count = Math.max(2, count)
      // Line için başlangıç ve bitiş noktalarını sağlam şekilde belirle:
      // mevcut gruptaki iki nokta arasında maksimum uzaklık veren çifti bul
      let start = groupElements[0];
      let end = groupElements[groupElements.length - 1];
      if (groupElements.length >= 2) {
        let maxD = -1;
        for (let i = 0; i < groupElements.length; i++) {
          for (let j = i + 1; j < groupElements.length; j++) {
            const a = groupElements[i];
            const b = groupElements[j];
            const dx = a.position.x - b.position.x;
            const dz = a.position.z - b.position.z;
            const d = dx * dx + dz * dz;
            if (d > maxD) {
              maxD = d;
              start = a;
              end = b;
            }
          }
        }
      }

      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const x = start.position.x + (end.position.x - start.position.x) * t;
        const z = start.position.z + (end.position.z - start.position.z) * t;

        newElements.push({
          ...firstElement,
          id: `line-${Date.now()}-${i}`,
          position: { x, z },
          groupId,
        });
      }
    } else if (type === "triangle") {
      // Triangle: en az 3
      count = Math.max(3, count)
      const center = {
        x: groupElements.reduce((sum, el) => sum + el.position.x, 0) / groupElements.length,
        z: groupElements.reduce((sum, el) => sum + el.position.z, 0) / groupElements.length,
      };
      const avgRadius = groupElements.reduce((sum, el) => {
        const dx = el.position.x - center.x;
        const dz = el.position.z - center.z;
        return sum + Math.sqrt(dx * dx + dz * dz);
      }, 0) / groupElements.length || 1;
      const angles = [-Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI / 3), (-Math.PI / 2) + (4 * Math.PI / 3)];
      const vertices = angles.map(a => ({ x: center.x + Math.cos(a) * avgRadius, z: center.z + Math.sin(a) * avgRadius }))
      const points: Array<{ x: number; z: number }> = [
        { x: vertices[0].x, z: vertices[0].z },
        { x: vertices[1].x, z: vertices[1].z },
        { x: vertices[2].x, z: vertices[2].z },
      ]
      let remaining = count - 3
      if (remaining > 0) {
        const base = Math.floor(remaining / 3)
        const rem = remaining % 3
        const perEdge = [base, base, base]
        for (let r = 0; r < rem; r++) perEdge[r]++
        for (let e = 0; e < 3; e++) {
          const v0 = vertices[e]
          const v1 = vertices[(e + 1) % 3]
          const m = perEdge[e]
          for (let j = 0; j < m; j++) {
            const t = (j + 1) / (m + 1)
            points.push({ x: v0.x + (v1.x - v0.x) * t, z: v0.z + (v1.z - v0.z) * t })
          }
        }
      }
      points.slice(0, count).forEach((p, i) => {
        newElements.push({
          ...firstElement,
          id: `triangle-${Date.now()}-${i}`,
          position: { x: p.x, z: p.z },
          groupId,
        })
      })
    }

    // History'ye ekle
    saveToHistoryBatch();

    updateLayer(currentLayer.id, { elements: newElements });

    // Seçimi koru: aynı grup için yeni oluşturulan elementleri seçili yap
    const regeneratedGroupElementIds = newElements
      .filter(el => el.groupId === groupId)
      .map(el => el.id);
    if (regeneratedGroupElementIds.length > 0) {
      setSelectedElementIds(regeneratedGroupElementIds);
      setSelectedShapeIds(regeneratedGroupElementIds);
    }
  };

  // Performans optimizasyon fonksiyonları
  const handleOptimize = useCallback((settings: OptimizationSettings) => {
    const { optimizedLayers, analysis } = optimizeEffects(layers, settings);
    setLayers(optimizedLayers);
    setPerformanceAnalysis(analysis);

    toast({
      title: "Optimization Completed",
      description: `${analysis.reduction} lines reduced (${analysis.originalLines} → ${analysis.optimizedLines})`,
      duration: 3000,
    });
  }, [layers, setLayers, toast]);

  const handleApplyTemplate = useCallback((templateId: string) => {
    const templateLayers = applyTemplate(templateId);
    setLayers(templateLayers);
    setCurrentLayer(templateLayers[0]);
    setPerformanceAnalysis(analyzeEffectLines(templateLayers));

    toast({
      title: "Template Applied",
      description: "Template applied successfully",
      duration: 2000,
    });
  }, [setLayers, toast]);

  // Layers değiştiğinde performans analizini güncelle
  useEffect(() => {
    setPerformanceAnalysis(analyzeEffectLines(layers));
  }, [layers]);

  // Seçili elementlerin rengini güncelle
  const updateSelectedElementsColor = useCallback((color: string) => {
    if (!currentLayer || selectedShapeIds.length === 0) return;

    const updatedElements = currentLayer.elements.map(element => {
      if (selectedShapeIds.includes(element.id)) {
        return { ...element, color };
      }
      return element;
    });

    // History'ye ekle
    saveToHistoryBatch(true, `Changed color of ${selectedShapeIds.length} element${selectedShapeIds.length !== 1 ? 's' : ''} in ${currentLayer.name}`);

    // Sadece layer'ı güncelle
    updateLayer(currentLayer.id, { elements: updatedElements });
  }, [currentLayer, selectedShapeIds, updateLayer, saveToHistoryBatch]);

  // Seçili elementlerin particle type'ını güncelle
  const updateSelectedElementsParticle = useCallback((particle: string) => {
    if (!currentLayer || selectedShapeIds.length === 0) return;

    const updatedElements = currentLayer.elements.map(element => {
      if (selectedShapeIds.includes(element.id)) {
        return { ...element, particle };
      }
      return element;
    });

    // History'ye ekle
    saveToHistoryBatch(true, `Changed particle of ${selectedShapeIds.length} element${selectedShapeIds.length !== 1 ? 's' : ''} in ${currentLayer.name}`);

    // Sadece layer'ı güncelle
    updateLayer(currentLayer.id, { elements: updatedElements });
  }, [currentLayer, selectedShapeIds, updateLayer, saveToHistoryBatch]);

  // Synchronize currentLayer with layers array to prevent stale references
  useEffect(() => {
    if (currentLayer) {
      const updated = layers.find(l => l.id === currentLayer.id)
      if (updated && updated !== currentLayer) {
        setCurrentLayer(updated)
      }
    }
  }, [layers])

  const bringPanelToFront = (panelId: string) => {
    setOpenPanels((prev) => {
      const filtered = prev.filter((p) => p !== panelId);
      return [...filtered, panelId];
    });
  };

  const renderActivePanel = () => {
    const highestIdx = openPanels.length - 1;
    return openPanels.map((panel, idx) => {
      const zIndex = 1000 + idx;
      const isFront = idx === highestIdx;
      switch (panel) {

        case "tools":
          return null; // Tools artık right sidebar'da
        case "modes":
          return (
            <DraggablePanel
              key="modes"
              panelId="modes"
              zIndex={zIndex}
              isFront={isFront}
              bringToFront={bringPanelToFront}
              title="Modes"
              defaultPosition={{ x: 380, y: 160 }}
              onClose={() => setOpenPanels((prev) => prev.filter((p) => p !== "modes"))}
              onMinimize={() => togglePanel("modes")}
            >
              <ModesPanel
                modes={modes as unknown as Record<string, boolean>}
                onModesChange={(newModes) => setModes(newModes as unknown as Modes)}
                modeSettings={modeSettings}
                onModeSettingsChange={(newSettings) => setModeSettings(newSettings as typeof modeSettings)}
                expandedModes={expandedModes}
                onExpandedModesChange={(modes: Record<string, boolean>) => setExpandedModes(modes)}
              />
            </DraggablePanel>
          );
        case "import":
          return (
            <DraggablePanel
              key="import"
              panelId="import"
              zIndex={zIndex}
              isFront={isFront}
              bringToFront={bringPanelToFront}
              title="Import"
              defaultPosition={{ x: 440, y: 200 }}
              onClose={() => setOpenPanels((prev) => prev.filter((p) => p !== "import"))}
              onMinimize={() => togglePanel("import")}
            >
              <ImportPanel settings={settings} onSettingsChange={setSettings} />
            </DraggablePanel>
          );
        case "settings":
          return (
            <DraggablePanel
              key="settings"
              panelId="settings"
              zIndex={zIndex}
              isFront={isFront}
              bringToFront={bringPanelToFront}
              title="Type Settings"
              defaultPosition={{ x: 500, y: 240 }}
              onClose={() => setOpenPanels((prev) => prev.filter((p) => p !== "settings"))}
              onMinimize={() => togglePanel("settings")}
            >
              <ElementSettingsPanel
                layers={layers}
                currentLayer={currentLayer}
                onUpdateLayer={updateLayer}
                modes={modes}
                onShowCode={async () => {
                  setOpenPanels((prev) => [...prev.filter((p) => p !== "settings"), "code"]);
                  await generateCode();
                }}
                updateSelectedElementsColor={updateSelectedElementsColor}
                selectedElementIds={selectedShapeIds}
              />
            </DraggablePanel>
          );
        case "code":
          return (
            <DraggablePanel
              key="code"
              panelId="code"
              zIndex={zIndex}
              isFront={isFront}
              bringToFront={bringPanelToFront}
              title="Code"
              defaultPosition={{ x: 560, y: 280 }}
              onClose={() => setOpenPanels((prev) => prev.filter((p) => p !== "code"))}
              onMinimize={() => togglePanel("code")}
            >
              <CodePanel
                code={generatedCode}
                onGenerateCode={async (opt) => {
                  await generateCode(opt !== undefined ? opt : optimize);
                }}
                isGenerating={isGenerating}
                settings={settings}
                onSettingsChange={setSettings}
                layers={layers}
                onUpdateLayer={updateLayer}
                currentLayer={currentLayer}
                modes={modes}
                onFrameSettingsChange={handleFrameSettingsChange}
                optimize={optimize}
                setOptimize={setOptimize}
              />
            </DraggablePanel>
          );
        case "code-edit":
          return null; // Code edit panel kaldırıldı
        case "chain":
          return (
            <DraggablePanel
              key="chain"
              panelId="chain"
              zIndex={zIndex}
              isFront={isFront}
              bringToFront={bringPanelToFront}
              title="Chain Sequence"
              defaultPosition={{ x: 400, y: 180 }}
              onClose={() => setOpenPanels((prev) => prev.filter((p) => p !== "chain"))}
              onMinimize={() => togglePanel("chain")}
            >
              <ChainPanel
                layers={layers}
                currentLayerId={currentLayerId}
                chainSequence={chainSequence}
                onChainSequenceChange={setChainSequence}
                onUpdateLayer={updateLayer}
                selectedElementIds={selectedShapeIds}
                chainItems={chainItems}
                onChainItemsChange={setChainItems}
              />
            </DraggablePanel>
          );
        case "action-recording":
          return (
            <DraggablePanel
              key="action-recording"
              panelId="action-recording"
              zIndex={zIndex}
              isFront={isFront}
              bringToFront={bringPanelToFront}
              title="Action Recording"
              defaultPosition={{ x: 600, y: 180 }}
              onClose={() => setOpenPanels((prev) => prev.filter((p) => p !== "action-recording"))}
              onMinimize={() => togglePanel("action-recording")}
            >
              <ActionRecordingPanel
                isRecording={false}
                onToggleRecording={() => { }}
              />
            </DraggablePanel>
          );

        case "performance":
          return (
            <DraggablePanel
              key="performance"
              panelId="performance"
              zIndex={zIndex}
              isFront={isFront}
              bringToFront={bringPanelToFront}
              title="Performance Optimizer"
              defaultPosition={{ x: 740, y: 400 }}
              onClose={() => setOpenPanels((prev) => prev.filter((p) => p !== "performance"))}
              onMinimize={() => togglePanel("performance")}
            >
              <PerformancePanel
                currentLineCount={performanceAnalysis.originalLines}
                onOptimize={handleOptimize}
                onApplyTemplate={handleApplyTemplate}
              />
            </DraggablePanel>
          );
        default:
          return null;
      }
    });
  };





  // Duyuru panel fonksiyonları artık gerekli değil - toast kullanıyoruz

  // Klavye kısayolları için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault()
          if (e.shiftKey) {
            // Ctrl+Shift+Z veya Cmd+Shift+Z (Redo)
            handleRedo()
          } else {
            // Ctrl+Z veya Cmd+Z (Undo)
            handleUndo()
          }
        } else if (e.key === 'y') {
          e.preventDefault()
          // Ctrl+Y veya Cmd+Y (Redo)
          handleRedo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])





  // Elementleri layer'a ekleyen fonksiyon (örnek)
  const addElementsToCurrentLayer = useCallback((elements: Element[]) => {
    if (!currentLayer) return;
    const updatedElements = [...currentLayer.elements, ...elements];
    updateLayer(currentLayer.id, { elements: updatedElements });
    // History'ye ekle
    saveToHistoryBatch();
  }, [currentLayer, updateLayer, saveToHistoryBatch]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "AURAFX_REQUEST_LAYERS") {
        const layersToSend = Array.isArray(layers) ? layers : []
        // @ts-ignore
        event.source?.postMessage(
          {
            type: "AURAFX_LAYERS",
            layers: layersToSend.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name }))
          },
          // @ts-ignore
          '*'
        )
      }
      if (event.data?.type === "AURAFX_SEND_ELEMENTS" && Array.isArray(event.data.elements)) {
        const { elements, targetLayerId } = event.data;
        const newLayers = layers.map(layer =>
          layer.id === targetLayerId
            ? {
              ...layer,
              elements: [
                ...layer.elements,
                ...elements.map((el: any) => ({
                  ...el,
                  id: el.id && typeof el.id === "string" && el.id.length > 0 ? el.id : uuidv4()
                }))
              ]
            }
            : layer
        );
        setLayers(newLayers);
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [layers])

  useEffect(() => {
    if (pendingElements && currentLayer && updateLayer) {
      const updatedElements = [...currentLayer.elements, ...pendingElements]
      updateLayer(currentLayer.id, { elements: updatedElements })
      setPendingElements(null)
    }
  }, [pendingElements, currentLayer, updateLayer])

  // Add keyboard event handler for copy-paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault()
          // Copy selected elements
          if (selectedShapeIds.length > 0 && currentLayer) {
            const elementsToCopy = currentLayer.elements.filter(
              element => selectedShapeIds.includes(element.id)
            )
            copyElements(elementsToCopy)
          }
        } else if (e.key === 'v') {
          e.preventDefault()
          // Paste elements
          if (currentLayer) {
            const pasted = pasteElements()
            if (pasted.length > 0) {
              // Assign current layer's color if the pasted element doesn't have one
              const newElements = pasted.map(el => ({
                ...el,
                color: el.color || currentLayer.color,
              }));

              // Add new elements to current layer
              const updatedElements = [...currentLayer.elements, ...newElements]
              updateLayer(currentLayer.id, { elements: updatedElements })

              // Update selection to newly pasted elements
              setSelectedShapeIds(newElements.map(el => el.id))

              // Add to history
              saveToHistoryBatch(true, `Pasted ${pasted.length} element${pasted.length !== 1 ? 's' : ''} to ${currentLayer.name}`)
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentLayer, selectedShapeIds, copyElements, pasteElements, updateLayer, saveToHistoryBatch, toast]);

  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [viewMode, setViewMode] = useState<'top' | 'side' | 'diagonal' | 'isometric' | 'front'>('top');

  const handleToggleRecording = () => {
    if (storeIsRecording) {
      // Stop recording
      stopRecording()
    } else {
      // Start recording
      startRecording()
      // REC butonu sadece action recording başlatır, chain'i temizlemez
      // Chain'i temizlemek istiyorsan chain panel'den yapmalısın
    }
  }

  const handleZoomIn = () => {
    setCanvasScale(prev => Math.min(5, prev * 1.15));
  };

  const handleZoomOut = () => {
    setCanvasScale(prev => Math.max(0.2, prev / 1.15));
  };



  // Tutorial artık otomatik açılmıyor, sadece buton ile açılacak

  const handleTutorialFinish = () => {
    setShowGettingStarted(false);
    setIsTutorialActive(false);
  };

  const handleTutorialOpen = () => {
    setShowGettingStarted(true);
    setIsTutorialActive(true);
  };

  const [rightSidebarActiveTab, setRightSidebarActiveTab] = useState<number | undefined>(undefined)
  const [show3DModal, setShow3DModal] = useState(false)

  const setShowCodePanel = (show: boolean) => {
    if (show) {
      // Code tab'ının index'i 4
      setRightSidebarActiveTab(4)
    }
  }

  // 3D Modal event listener
  useEffect(() => {
    const handleOpen3DModal = () => {
      setShow3DModal(true)
    }

    const handleImport3DElements = (event: CustomEvent) => {
      const { elements, selectedLayerIds, simpleTransfer } = event.detail;
      console.log('=== 2D PAGE: RECEIVED 3D IMPORT EVENT ===');
      console.log('Elements:', elements);
      console.log('Selected layer IDs:', selectedLayerIds);
      console.log('Simple transfer:', simpleTransfer);

      if (elements && elements.length > 0) {
        if (selectedLayerIds && selectedLayerIds.length > 0) {
          // Target layer'lar seçilmişse, elementleri o layer'lara ekle
          selectedLayerIds.forEach((layerId: string) => {
            const targetLayer = layers.find(l => l.id === layerId);
            if (targetLayer) {
              const updatedElements = simpleTransfer
                ? [...elements] // Sade geçiş: sadece 3D elementleri
                : [...targetLayer.elements, ...elements]; // Normal geçiş: mevcut + 3D elementleri

              updateLayer(layerId, { elements: updatedElements });
              console.log(`Added ${elements.length} elements to layer: ${targetLayer.name}`);
            }
          });
        } else {
          // Target layer seçilmemişse, yeni layer oluştur
          const newLayer: Layer = {
            id: `exported_${Date.now()}`,
            name: "Exported from 3D",
            visible: true,
            color: "#ffffff",
            effectType: "particles",
            elements: elements,
            tickStart: 0,
            tickEnd: 0,
            tickDelay: 0,
            particle: "particles",
            alpha: 1,
            shapeSize: 1,
            repeat: 1,
            yOffset: 0,
            repeatInterval: 1,
            targeter: "@self"
          };

          setLayers([...layers, newLayer]);
          console.log(`Created new layer with ${elements.length} elements`);
        }

        // History'ye ekle
        saveToHistoryBatch(true, `Imported ${elements.length} elements from 3D editor`);

        // Toast göster
        toast({
          title: "3D Data Imported",
          description: `Successfully imported ${elements.length} elements from 3D editor`,
          duration: 3000,
        });
      }
    }

    window.addEventListener('open3DModal', handleOpen3DModal)
    window.addEventListener('import3DElements', handleImport3DElements as EventListener)

    return () => {
      window.removeEventListener('open3DModal', handleOpen3DModal)
      window.removeEventListener('import3DElements', handleImport3DElements as EventListener)
    }
  }, [layers, updateLayer, saveToHistoryBatch, toast])

  // 3D'den gelen transfer verilerini kontrol et
  useEffect(() => {
    const checkTransferData = () => {
      try {
        const transferData = sessionStorage.getItem('aurafx-3d-transfer');
        if (transferData) {
          const parsed = JSON.parse(transferData);
          const { elements, clearExisting, timestamp } = parsed;

          // Veri yaşını kontrol et (5 dakika)
          const now = Date.now();
          if (now - timestamp > 5 * 60 * 1000) {
            sessionStorage.removeItem('aurafx-3d-transfer');
            return;
          }

          console.log('=== 3D->2D TRANSFER DATA FOUND ===');
          console.log('Elements:', elements);
          console.log('Clear existing:', clearExisting);

          if (elements && elements.length > 0) {
            if (clearExisting) {
              // Tüm layer'ları temizle ve yeni layer oluştur
              const newLayer: Layer = {
                id: `imported_3d_${Date.now()}`,
                name: "Imported from 3D",
                visible: true,
                color: "#ffffff",
                effectType: "particles",
                elements: elements,
                tickStart: 0,
                tickEnd: 0,
                tickDelay: 0,
                particle: "particles",
                alpha: 1,
                shapeSize: 1,
                repeat: 1,
                yOffset: 0,
                repeatInterval: 1,
                targeter: "@self"
              };

              setLayers([newLayer]);
              setCurrentLayer(newLayer);
              console.log(`Created new layer with ${elements.length} elements (cleared existing)`);
            } else {
              // Mevcut layer'a ekle veya yeni layer oluştur
              if (currentLayer) {
                const updatedElements = [...currentLayer.elements, ...elements];
                updateLayer(currentLayer.id, { elements: updatedElements });
                console.log(`Added ${elements.length} elements to current layer`);
              } else {
                // Yeni layer oluştur
                const newLayer: Layer = {
                  id: `imported_3d_${Date.now()}`,
                  name: "Imported from 3D",
                  visible: true,
                  color: "#ffffff",
                  effectType: "particles",
                  elements: elements,
                  tickStart: 0,
                  tickEnd: 0,
                  tickDelay: 0,
                  particle: "particles",
                  alpha: 1,
                  shapeSize: 1,
                  repeat: 1,
                  yOffset: 0,
                  repeatInterval: 1,
                  targeter: "@self"
                };

                setLayers([...layers, newLayer]);
                setCurrentLayer(newLayer);
                console.log(`Created new layer with ${elements.length} elements`);
              }
            }

            // History'ye ekle
            saveToHistoryBatch(true, `Imported ${elements.length} elements from 3D editor`);

            // Toast göster
            toast({
              title: "3D Data Imported",
              description: `Successfully imported ${elements.length} elements from 3D editor`,
              duration: 3000,
            });

            // Transfer verisini temizle
            sessionStorage.removeItem('aurafx-3d-transfer');
          }
        }
      } catch (error) {
        console.error('Failed to process transfer data:', error);
        sessionStorage.removeItem('aurafx-3d-transfer');
      }
    };

    // Sayfa yüklendiğinde kontrol et
    checkTransferData();
  }, [layers, currentLayer, updateLayer, setLayers, setCurrentLayer, saveToHistoryBatch, toast])

  return (
    <>
      <div className="h-screen bg-black text-white overflow-hidden">
        {isGenerating && (
          <div className="fixed inset-0 z-[2001000000] flex items-center justify-center bg-black bg-opacity-70">
            <div className="p-8 bg-zinc-9000 rounded-lg shadow-lg flex flex-col items-center">
              <span className="text-lg font-semibold mb-2">Generating code...</span>
              <span className="text-[#ffffff] text-sm">Please wait, this may take a few seconds.</span>
            </div>
          </div>
        )}
        <Toaster />

        {/* Announcement System */}
        <AnnouncementSystem />

        {/* Header */}
        <Header
          onGenerateCode={() => {
            setOpenPanels((prev) => [...prev.filter((p) => p !== "code"), "code"]);
            generateCode(optimize);
          }}
          onNewProject={newProject}
          onSave={saveProject}
          onLoad={loadProject}
          minimizedPanels={minimizedPanels}
          onRestorePanel={restorePanel}
          showGridCoordinates={showGridCoordinates}
          onToggleGridCoordinates={() => setShowGridCoordinates(!showGridCoordinates)}
        />

        {/* Footer */}
        <Footer />

        {/* 3D Transfer Modal */}
        <Transfer3DModal
          isOpen={show3DModal}
          onClose={() => setShow3DModal(false)}
          layers={layers}
          currentLayer={currentLayer}
          onExportElements={(elements: Element[], simpleTransfer?: boolean) => {
            console.log('=== 2D->3D EXPORT CALLBACK (YEDEK STYLE) ===');
            console.log('Elements to export:', elements);
            console.log('Simple transfer:', simpleTransfer);

            // Yedekteki gibi direkt 3D store'a import et
            const { importFromMainSystem } = use3DStore.getState();

            if (elements.length > 0) {
              importFromMainSystem(elements, simpleTransfer || false);
              console.log(`Successfully sent ${elements.length} elements to 3D editor (clearExisting: ${simpleTransfer})`);
            } else {
              console.log('No elements to send to 3D editor');
            }

            // Modal'ı kapat
            setShow3DModal(false);
          }}
        />

        {/* Left Toolbar */}
        <LeftToolbar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          onClearCanvas={handleClearCanvas}
          onShowQuickSettings={() => setShowQuickSettings(!showQuickSettings)}
          onGenerateCode={() => generateCode(optimize)}
        />

        {/* Right Sidebar */}
        <RightSidebar
          settings={settings}
          onSettingsChange={setSettings}
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          modes={modes}
          onModesChange={setModes}
          modeSettings={modeSettings}
          onModeSettingsChange={setModeSettings}
          layers={layers}
          currentLayer={currentLayer}
          onUpdateLayer={updateLayer}
          onShowCode={() => setShowCodePanel(true)}
          updateSelectedElementsParticle={(particle: string) => {
            if (selectedElementIds.length > 0) {
              selectedElementIds.forEach((elementId: string) => {
                // Find which layer contains this element
                const parentLayer = layers.find(layer =>
                  layer.elements.some(el => el.id === elementId)
                )

                if (parentLayer) {
                  updateLayer(parentLayer.id, {
                    elements: parentLayer.elements.map(el =>
                      el.id === elementId ? { ...el, particle } : el
                    )
                  })
                }
              })
            }
          }}
          updateSelectedElementsColor={updateSelectedElementsColor}
          generatedCode={generatedCode}
          onGenerateCode={generateCode}
          isGeneratingCode={isGenerating}
          onFrameSettingsChange={(mode: "auto" | "manual", frameCount?: number) => {
            setFrameMode(mode)
            if (frameCount !== undefined) {
              setManualFrameCount(frameCount)
            }
          }}
          optimize={optimize}
          setOptimize={setOptimize}
          chainSequence={chainSequence}
          onChainSequenceChange={setChainSequence}
          selectedElementIds={selectedElementIds}
          chainItems={chainItems}
          onChainItemsChange={setChainItems}
          currentLineCount={performanceAnalysis.originalLines}
          onOptimize={handleOptimize}
          onApplyTemplate={handleApplyTemplate}
          isRecording={storeIsRecording}
          onToggleRecording={handleToggleRecording}
          activeTabOverride={rightSidebarActiveTab}
          onTabChange={(tabIndex: number) => setRightSidebarActiveTab(undefined)}
        />

        {/* Top Center Toolbar */}
        <TopCenterToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          modes={modes}
          isRecording={storeIsRecording}
          onToggleRecording={handleToggleRecording}
        />

        {/* Layers Panel */}
        <LayersPanel
          isOpen={layersPanelOpen}
          onClose={() => setLayersPanelOpen(false)}
          layers={layers}
          currentLayer={currentLayer}
          onAddLayer={addLayer}
          onDeleteLayer={(layerId) => {
            const layerToDelete = layers.find(l => l.id === layerId);
            if (layerToDelete) {
              setCurrentLayer(layerToDelete);
              deleteLayer();
            }
          }}
          onSelectLayer={(layerId) => {
            const layer = layers.find(l => l.id === layerId);
            if (layer) selectLayer(layer);
          }}
          onUpdateLayer={updateLayer}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReorderLayers={(fromIndex, toIndex) => {
            console.log('MAIN onReorderLayers called:', { fromIndex, toIndex, layersCount: layers.length });
            console.log('MAIN Before reorder:', layers.map(l => ({ id: l.id, name: l.name })));

            const newLayers = [...layers];
            const [movedLayer] = newLayers.splice(fromIndex, 1);
            newLayers.splice(toIndex, 0, movedLayer);

            console.log('MAIN After reorder:', newLayers.map(l => ({ id: l.id, name: l.name })));
            setLayers(newLayers);
          }}
        />

        {/* Bottom Status Bar */}
        <BottomStatusBar
          onLayersClick={() => setLayersPanelOpen(!layersPanelOpen)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoomLevel={Math.round(canvasScale * 100)}
        />

        <div className="flex h-screen">
          <div className="flex-1 relative flex flex-col">
            <Canvas
              ref={canvasRef}
              key={currentLayer?.id}
              onStartBatchMode={startBatchMode}
              onEndBatchMode={endBatchMode}
              currentTool={currentTool}
              setCurrentTool={setCurrentTool}
              layers={layers}
              currentLayerId={currentLayer?.id || null}
              settings={settings}
              onSettingsChange={setSettings}
              modes={modes}
              onAddElement={handleAddElement}
              onClearCanvas={handleClearCanvas}
              onUpdateLayer={updateLayer}
              selectedElementIds={selectedElementIds}
              setSelectedElementIds={setSelectedElementIds}
              performanceMode={settings.performanceMode}
              chainSequence={chainSequence}
              onChainSequenceChange={setChainSequence}
              chainItems={chainItems}
              optimize={optimize}
              showGridCoordinates={showGridCoordinates}
              onToggleGridCoordinates={() => setShowGridCoordinates(!showGridCoordinates)}
              updateSelectedElementsParticle={updateSelectedElementsParticle}
              onElementCountChange={handleElementCountChange}
              onZoomIn={handleZoomIn}
              backgroundColor={canvasBackgroundColor}
              onZoomOut={handleZoomOut}
              scale={canvasScale}
              viewMode={viewMode}
              setViewMode={setViewMode}
              isRecording={storeIsRecording}
            />
            {renderActivePanel()}
            {/* 3D buttons hidden per user request */}
          </div>
        </div>
        {/* Duyurular artık toast olarak gösteriliyor */}

      </div>
      {showGettingStarted && (
        <GettingStarted
          openPanels={openPanels}
          togglePanel={togglePanel}
          onFinish={handleTutorialFinish}
        />
      )}





      {/* Quick Settings Modal */}
      <AnimatePresence>
        {showQuickSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Settings</h3>
                  </div>
                  <button
                    onClick={() => setShowQuickSettings(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Particle Count */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                        <Hash className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Particle Count</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                      {settings.particleCount}
                    </span>
                  </div>
                  <Slider
                    value={[settings.particleCount]}
                    onValueChange={([value]) => {
                      setSettings({ ...settings, particleCount: value })
                    }}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Color Picker */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                      <Palette className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Color</span>
                  </div>
                  <ColorPicker
                    value={settings.color || "#000000"}
                    onChange={(color) => {
                      setSettings({ ...settings, color })
                    }}
                    className="w-full"
                  />
                </div>

                {/* Canvas Background Color */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                      <Palette className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Canvas Background</span>
                  </div>
                  <ColorPicker
                    value={canvasBackgroundColor}
                    onChange={(color) => {
                      setCanvasBackgroundColor(color)
                    }}
                    className="w-full"
                  />
                </div>

                {/* Grid Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                      <Grid3X3 className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Grid Settings</span>
                  </div>

                  <div className="space-y-3 pl-8">
                    {/* Show Grid */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Show Grid</span>
                      <button
                        onClick={() => {
                          setSettings({ ...settings, showGrid: !settings.showGrid })
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showGrid !== false ? 'bg-black' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showGrid !== false ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Grid Coordinates */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Grid Coordinates</span>
                      <button
                        onClick={() => setShowGridCoordinates(!showGridCoordinates)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showGridCoordinates ? 'bg-black' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showGridCoordinates ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Mode */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                        <Zap className="w-3 h-3 text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Performance Mode</span>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, performanceMode: !settings.performanceMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.performanceMode ? 'bg-black' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.performanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Particle Type */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Particle Type</span>
                    </div>
                    <button
                      onClick={() => setShowParticleModal(true)}
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 transition-colors font-medium"
                    >
                      {settings.particle || "reddust"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Selection Modal */}
      {showParticleModal && (
        <ParticleSelectModal
          currentParticle={settings.particle || "reddust"}
          onSelectParticle={(particle) => {
            setSettings({ ...settings, particle })
            setShowParticleModal(false)
          }}
          onClose={() => setShowParticleModal(false)}
        />
      )}

    </>
  )
}
