import type { Layer, Element } from "../types"

export interface OptimizationSettings {
  maxLines: number
  mergeSimilarEffects: boolean
  increaseInterval: boolean
  compressionLevel: "low" | "medium" | "high"
  autoOptimize: boolean
  samplingMethod: "grid" | "step" | "random" | "center"
  stepValue?: number
}

export interface OptimizedEffect {
  originalLines: number
  optimizedLines: number
  reduction: number
  performance: "excellent" | "good" | "warning" | "danger"
}

// Efekt satırlarını analiz et
export function analyzeEffectLines(layers: Layer[]): OptimizedEffect {
  const totalLines = layers.reduce((sum, layer) => {
    return sum + layer.elements.length * (layer.repeat || 1)
  }, 0)

  const performance = getPerformanceLevel(totalLines)
  
  return {
    originalLines: totalLines,
    optimizedLines: totalLines,
    reduction: 0,
    performance
  }
}

// Performans seviyesini belirle
export function getPerformanceLevel(lines: number): "excellent" | "good" | "warning" | "danger" {
  if (lines <= 10) return "excellent"
  if (lines <= 25) return "good"
  if (lines <= 50) return "warning"
  return "danger"
}

// Benzer efektleri birleştir
export function mergeSimilarEffects(layers: Layer[]): Layer[] {
  const mergedLayers: Layer[] = []
  
  // Aynı türdeki efektleri grupla
  const effectGroups = new Map<string, Layer[]>()
  
  layers.forEach(layer => {
    const key = `${layer.effectType}-${layer.particle}-${layer.color}`
    if (!effectGroups.has(key)) {
      effectGroups.set(key, [])
    }
    effectGroups.get(key)!.push(layer)
  })
  
  // Her grup için birleştirilmiş layer oluştur
  effectGroups.forEach((groupLayers, key) => {
    if (groupLayers.length === 1) {
      mergedLayers.push(groupLayers[0])
      return
    }
    
    // İlk layer'ı temel al
    const baseLayer = groupLayers[0]
    const mergedElements: Element[] = []
    
    // Tüm elementleri birleştir
    groupLayers.forEach(layer => {
      mergedElements.push(...layer.elements)
    })
    
    // Birleştirilmiş layer oluştur
    const mergedLayer: Layer = {
      ...baseLayer,
      id: `merged-${Date.now()}`,
      name: `${baseLayer.name} (Birleştirilmiş)`,
      elements: mergedElements,
      repeat: Math.max(...groupLayers.map(l => l.repeat || 1)),
      repeatInterval: Math.max(...groupLayers.map(l => l.repeatInterval || 10))
    }
    
    mergedLayers.push(mergedLayer)
  })
  
  return mergedLayers
}

// Aralıkları artır
export function increaseIntervals(layers: Layer[], factor: number = 1.5): Layer[] {
  return layers.map(layer => ({
    ...layer,
    repeatInterval: Math.floor((layer.repeatInterval || 10) * factor),
    tickDelay: Math.floor((layer.tickDelay || 0) * factor)
  }))
}

// Efektleri sıkıştır - Akıllı örnekleme ile
export function compressEffects(layers: Layer[], level: "low" | "medium" | "high", samplingMethod: "grid" | "step" | "random" | "center" = "grid", stepValue?: number): Layer[] {
  const compressionFactors = {
    low: { elementReduction: 0.8, intervalIncrease: 1.2, sampleRate: 2 },
    medium: { elementReduction: 0.6, intervalIncrease: 1.5, sampleRate: 3 },
    high: { elementReduction: 0.4, intervalIncrease: 2.0, sampleRate: 5 }
  }
  
  const factor = compressionFactors[level]
  
  return layers.map(layer => {
    // Seçilen yönteme göre akıllı örnekleme ile element sayısını azalt
    const reducedElements = smartSampleElements(layer.elements, factor.elementReduction, factor.sampleRate, samplingMethod, stepValue)
    
    return {
      ...layer,
      elements: reducedElements,
      repeatInterval: Math.floor((layer.repeatInterval || 10) * factor.intervalIncrease),
      repeat: Math.max(1, Math.floor((layer.repeat || 1) * 0.8))
    }
  })
}

// Akıllı element örnekleme fonksiyonu
function smartSampleElements(elements: Element[], reductionFactor: number, sampleRate: number, samplingMethod: "grid" | "step" | "random" | "center" = "grid", stepValue?: number): Element[] {
  if (elements.length === 0) return elements
  
  const targetCount = Math.floor(elements.length * reductionFactor)
  
  if (targetCount < 10) {
    return elements.slice(0, targetCount)
  }
  
  switch (samplingMethod) {
    case "step":
      return stepSampling(elements, targetCount, stepValue)
    case "random":
      return randomSampling(elements, targetCount)
    case "center":
      return centerSampling(elements, targetCount)
    case "grid":
    default:
      return gridSampling(elements, targetCount)
  }
}

// Adım tabanlı örnekleme - Her N elementten birini al
function stepSampling(elements: Element[], targetCount: number, stepValue?: number): Element[] {
  const step = stepValue && stepValue > 0 ? stepValue : Math.max(1, Math.floor(elements.length / targetCount))
  const sampledElements: Element[] = []
  
  for (let i = 0; i < elements.length && sampledElements.length < targetCount; i += step) {
    sampledElements.push(elements[i])
  }
  
  return sampledElements
}

// Rastgele örnekleme
function randomSampling(elements: Element[], targetCount: number): Element[] {
  const shuffled = [...elements].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, targetCount)
}

// Merkez tabanlı örnekleme - Merkeze yakın elementleri tercih et
function centerSampling(elements: Element[], targetCount: number): Element[] {
  // Merkezi hesapla
  const xCoords = elements.map(e => e.position.x)
  const zCoords = elements.map(e => e.position.z)
  const centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2
  const centerZ = (Math.min(...zCoords) + Math.max(...zCoords)) / 2
  
  // Merkeze olan uzaklığa göre sırala
  const sortedElements = [...elements].sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.position.x - centerX, 2) + Math.pow(a.position.z - centerZ, 2))
    const distB = Math.sqrt(Math.pow(b.position.x - centerX, 2) + Math.pow(b.position.z - centerZ, 2))
    return distA - distB
  })
  
  return sortedElements.slice(0, targetCount)
}

// Grid tabanlı örnekleme - Resmin şeklini koru
function gridSampling(elements: Element[], targetCount: number): Element[] {
  // Grid tabanlı örnekleme için koordinat aralıklarını bul
  const xCoords = elements.map(e => e.position.x)
  const zCoords = elements.map(e => e.position.z)
  
  const minX = Math.min(...xCoords)
  const maxX = Math.max(...xCoords)
  const minZ = Math.min(...zCoords)
  const maxZ = Math.max(...zCoords)
  
  // Grid boyutlarını hesapla
  const xRange = maxX - minX
  const zRange = maxZ - minZ
  
  // Grid hücre boyutunu hesapla
  const gridSize = Math.sqrt((xRange * zRange) / targetCount)
  
  // Grid tabanlı örnekleme
  const sampledElements: Element[] = []
  const grid: Map<string, Element[]> = new Map()
  
  // Elementleri grid hücrelerine dağıt
  elements.forEach(element => {
    const gridX = Math.floor((element.position.x - minX) / gridSize)
    const gridZ = Math.floor((element.position.z - minZ) / gridSize)
    const gridKey = `${gridX},${gridZ}`
    
    if (!grid.has(gridKey)) {
      grid.set(gridKey, [])
    }
    grid.get(gridKey)!.push(element)
  })
  
  // Her grid hücresinden en iyi elementi seç
  grid.forEach((cellElements) => {
    if (cellElements.length === 1) {
      sampledElements.push(cellElements[0])
    } else if (cellElements.length > 1) {
      // Hücrenin merkezine en yakın elementi seç
      const centerX = cellElements.reduce((sum, e) => sum + e.position.x, 0) / cellElements.length
      const centerZ = cellElements.reduce((sum, e) => sum + e.position.z, 0) / cellElements.length
      
      let bestElement = cellElements[0]
      let bestDistance = Infinity
      
      cellElements.forEach(element => {
        const distance = Math.sqrt(
          Math.pow(element.position.x - centerX, 2) + 
          Math.pow(element.position.z - centerZ, 2)
        )
        if (distance < bestDistance) {
          bestDistance = distance
          bestElement = element
        }
      })
      
      sampledElements.push(bestElement)
    }
  })
  
  // Eğer hala çok fazla element varsa, rastgele örnekle
  if (sampledElements.length > targetCount) {
    const shuffled = [...sampledElements].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, targetCount)
  }
  
  return sampledElements
}

// Ana optimizasyon fonksiyonu
export function optimizeEffects(
  layers: Layer[], 
  settings: OptimizationSettings
): { optimizedLayers: Layer[], analysis: OptimizedEffect } {
  let optimizedLayers = [...layers]
  const originalLines = analyzeEffectLines(layers).originalLines
  
  // Benzer efektleri birleştir
  if (settings.mergeSimilarEffects) {
    optimizedLayers = mergeSimilarEffects(optimizedLayers)
  }
  
  // Aralıkları artır
  if (settings.increaseInterval) {
    optimizedLayers = increaseIntervals(optimizedLayers)
  }
  
  // Sıkıştırma uygula
  optimizedLayers = compressEffects(optimizedLayers, settings.compressionLevel, settings.samplingMethod, settings.stepValue)
  
  // Maksimum satır sayısını kontrol et
  const currentLines = analyzeEffectLines(optimizedLayers).originalLines
  if (currentLines > settings.maxLines) {
    // Daha agresif sıkıştırma uygula
    optimizedLayers = compressEffects(optimizedLayers, "high", settings.samplingMethod, settings.stepValue)
  }
  
  const finalAnalysis = analyzeEffectLines(optimizedLayers)
  finalAnalysis.originalLines = originalLines
  finalAnalysis.reduction = originalLines - finalAnalysis.optimizedLines
  
  return {
    optimizedLayers,
    analysis: finalAnalysis
  }
}

// Hazır şablonları uygula
export function applyTemplate(templateId: string): Layer[] {
  const templates: Record<string, Layer[]> = {
    "simple-fire": [
      {
        id: "simple-fire-1",
        name: "Simple Fire",
        visible: true,
        elements: [
          // Upward spiral (flame, y = t * 1.8)
          ...Array(18).fill(0).map((_, i) => {
            const t = i / 18;
            const angle = t * 4 * Math.PI;
            const radius = 0.7 + t * 1.1;
            return {
              id: `flame-spiral-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, y: 0.3 + t * 1.8 },
              particle: "flame",
              color: "#FF4500",
              alpha: 1,
              repeat: 2,
              interval: 8
            }
          }),
          // Outward burst (smoke, y = 1 + 0.3 * sin)
          ...Array(12).fill(0).map((_, i) => {
            const angle = (i / 12) * 2 * Math.PI;
            return {
              id: `smoke-burst-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 1.7, z: Math.sin(angle) * 1.7, y: 1 + 0.3 * Math.sin(angle * 2) },
              particle: "smoke",
              color: "#969696",
              alpha: 0.7,
              repeat: 1,
              interval: 14
            }
          }),
          // Center sparks (y = 0.7 + 0.2 * sin)
          ...Array(6).fill(0).map((_, i) => {
            const angle = (i / 6) * 2 * Math.PI;
            return {
              id: `spark-center-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 0.3, z: Math.sin(angle) * 0.3, y: 0.7 + 0.2 * Math.sin(angle) },
              particle: "spark",
              color: "#FFD700",
              alpha: 0.9,
              repeat: 1,
              interval: 18
            }
          })
        ],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "flame",
        color: "#FF4500",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "origin",
        effectType: "particles"
      }
    ],
    "simple-ice": [
      {
        id: "simple-ice-1",
        name: "Simple Ice",
        visible: true,
        elements: [
          // Snowflake/star: 6 arms, each with 3 points (y = 0.7 + j * 0.7)
          ...Array(6).fill(0).flatMap((_, arm) =>
            Array(3).fill(0).map((__, j) => {
              const r = 0.6 + j * 0.6;
              const angle = (arm / 6) * 2 * Math.PI;
              return {
                id: `flake-arm${arm}-pt${j}`,
                type: 'free' as const,
                position: { x: Math.cos(angle) * r, z: Math.sin(angle) * r, y: 0.7 + j * 0.7 },
                particle: j === 2 ? "spell" : "snowflake",
                color: j === 2 ? "#B0E0E6" : "#87CEEB",
                alpha: 1 - j * 0.2,
                repeat: 2,
                interval: 10 + j * 2
              }
            })
          ),
          // Center cloud (y = 1.2)
          ...Array(6).fill(0).map((_, i) => {
            const angle = (i / 6) * 2 * Math.PI + Math.PI / 6;
            return {
              id: `cloud-center-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 0.4, z: Math.sin(angle) * 0.4, y: 1.2 },
              particle: "cloud",
              color: "#F0F8FF",
              alpha: 0.7,
              repeat: 1,
              interval: 14
            }
          })
        ],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "snowflake",
        color: "#87CEEB",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "origin",
        effectType: "particles"
      }
    ],
    "simple-lightning": [
      {
        id: "simple-lightning-1",
        name: "Simple Lightning",
        visible: true,
        elements: [
          // Zigzag bolt: 7 points (y = 0.7 + i * 0.3)
          ...Array(7).fill(0).map((_, i) => {
            const x = i * 0.5;
            const z = (i % 2 === 0 ? 1 : -1) * (0.5 + Math.random() * 0.3);
            return {
              id: `bolt-zigzag-${i}`,
              type: 'free' as const,
              position: { x, z, y: 0.7 + i * 0.3 },
              particle: "spark",
              color: "#FFFF00",
              alpha: 1,
              repeat: 2,
              interval: 6 + i * 2
            }
          }),
          // Electric aura: arc around the bolt (y = 2)
          ...Array(10).fill(0).map((_, i) => {
            const angle = (i / 10) * Math.PI;
            return {
              id: `electric-arc-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 1.2, z: Math.sin(angle) * 1.2, y: 2 },
              particle: "electric",
              color: "#00FFFF",
              alpha: 0.8,
              repeat: 1,
              interval: 12
            }
          }),
          // Flash at the tip (y = 2.5)
          {
            id: `flash-tip`,
            type: 'free' as const,
            position: { x: 3.0, z: 0, y: 2.5 },
            particle: "flash",
            color: "#FFFFFF",
            alpha: 1,
            repeat: 1,
            interval: 18
          }
        ],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "spark",
        color: "#FFFF00",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "origin",
        effectType: "particles"
      }
    ],
    "epic-explosion": [
      {
        id: "epic-explosion-1",
        name: "Epic Explosion",
        visible: true,
        elements: [
          // Flame: hemisphere shell, mostly upward (y + Math.random() * 2)
          ...Array(20).fill(0).map((_, i) => {
            const phi = Math.acos(1 - Math.random()); // [0, pi/2]
            const theta = (i / 20) * 2 * Math.PI;
            const r = 2 + Math.random() * 2;
            return {
              id: `flame-${i}`,
              type: 'free' as const,
              position: {
                x: Math.sin(phi) * Math.cos(theta) * r,
                z: Math.sin(phi) * Math.sin(theta) * r,
                y: Math.abs(Math.cos(phi) * r) + 0.7 + Math.random() * 2
              },
              particle: "flame",
              color: "#FF4500",
              alpha: 1,
              repeat: 2,
              interval: 2
            }
          }),
          // Smoke: higher, wider hemisphere (y + Math.random() * 2)
          ...Array(20).fill(0).map((_, i) => {
            const phi = Math.acos(1 - Math.random());
            const theta = (i / 20) * 2 * Math.PI + Math.PI / 8;
            const r = 3 + Math.random() * 2;
            return {
              id: `smoke-${i}`,
              type: 'free' as const,
              position: {
                x: Math.sin(phi) * Math.cos(theta) * r,
                z: Math.sin(phi) * Math.sin(theta) * r,
                y: Math.abs(Math.cos(phi) * r) + 1.2 + Math.random() * 2
              },
              particle: "smoke",
              color: "#555555",
              alpha: 1,
              repeat: 2,
              interval: 3
            }
          }),
          // Spark: more horizontal, random shell (y + Math.random() * 1.2)
          ...Array(20).fill(0).map((_, i) => {
            const theta = (i / 20) * 2 * Math.PI + Math.PI / 4;
            const r = 1 + Math.random() * 3;
            return {
              id: `spark-${i}`,
              type: 'free' as const,
              position: {
                x: Math.cos(theta) * r,
                z: Math.sin(theta) * r,
                y: 0.5 + Math.random() * 1.2
              },
              particle: "spark",
              color: "#FFD700",
              alpha: 1,
              repeat: 1,
              interval: 4
            }
          }),
          // Explosion: random shell, all directions (y + Math.random() * 2)
          ...Array(20).fill(0).map((_, i) => {
            const phi = Math.acos(1 - Math.random());
            const theta = (i / 20) * 2 * Math.PI + Math.PI / 2;
            const r = 0.5 + Math.random() * 2.5;
            return {
              id: `explosion-${i}`,
              type: 'free' as const,
              position: {
                x: Math.sin(phi) * Math.cos(theta) * r,
                z: Math.sin(phi) * Math.sin(theta) * r,
                y: Math.abs(Math.cos(phi) * r) + 1 + Math.random() * 2
              },
              particle: "explosion",
              color: "#FFA500",
              alpha: 1,
              repeat: 1,
              interval: 5
            }
          })
        ],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "flame",
        color: "#FF4500",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "origin",
        effectType: "particles"
      }
    ],
    "magic-shield": [
      {
        id: "magic-shield-1",
        name: "Magic Shield",
        visible: true,
        elements: [
          // Enchantmenttable: outer ring, wave pattern around player height
          ...Array(24).fill(0).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI;
            return {
              id: `enchant-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 3, z: Math.sin(angle) * 3, y: 1.2 + Math.sin(angle * 2) * 1.0 },
              particle: "enchantmenttable",
              color: "#00BFFF",
              alpha: 1,
              repeat: 1,
              interval: 1
            }
          }),
          // Reddust: middle ring, wave pattern around player height
          ...Array(24).fill(0).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI;
            return {
              id: `reddust-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 2.5, z: Math.sin(angle) * 2.5, y: 1.0 + Math.cos(angle * 2) * 0.8 },
              particle: "reddust",
              color: "#00FFAA",
              alpha: 1,
              repeat: 1,
              interval: 1
            }
          }),
          // Spell: inner ring, wave pattern around player height
          ...Array(24).fill(0).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI;
            return {
              id: `spell-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 2, z: Math.sin(angle) * 2, y: 0.8 + Math.sin(angle * 3) * 0.6 },
              particle: "spell",
              color: "#FFFFFF",
              alpha: 1,
              repeat: 1,
              interval: 1
            }
          })
        ],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "enchantmenttable",
        color: "#00BFFF",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "origin",
        effectType: "particlering"
      }
    ],
    "spiral-vortex": [
      {
        id: "spiral-vortex-1",
        name: "Spiral Vortex",
        visible: true,
        elements: [
          // Portal: true 3D spiral (t * 2.2 for max y ≈ 2.2)
          ...Array(40).fill(0).map((_, i) => {
            const t = i / 40;
            const angle = t * 6 * Math.PI;
            const radius = 1.5 + t * 1.5;
            return {
              id: `portal-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, y: t * 2.2 },
              particle: "portal",
              color: "#800080",
              alpha: 1,
              repeat: 1,
              interval: 2
            }
          }),
          // Reddust: offset spiral (t * 2.2 + 0.3)
          ...Array(40).fill(0).map((_, i) => {
            const t = i / 40;
            const angle = t * 6 * Math.PI + Math.PI / 8;
            const radius = 1.5 + t * 1.5;
            return {
              id: `reddust-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, y: t * 2.2 + 0.3 },
              particle: "reddust",
              color: "#00FFFF",
              alpha: 1,
              repeat: 1,
              interval: 2
            }
          })
        ],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "portal",
        color: "#800080",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "origin",
        effectType: "particlelinehelix"
      }
    ],
    "rainbow-portal": [
      {
        id: "rainbow-portal-1",
        name: "Rainbow Portal",
        visible: true,
        elements: [
          // Portal: outer ring, flat
          ...Array(40).fill(0).map((_, i) => {
            const angle = (i / 40) * 2 * Math.PI;
            return {
              id: `portal-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 2.5, z: Math.sin(angle) * 2.5, y: 0 },
              particle: "portal",
              color: "#FF0000",
              alpha: 1,
              repeat: 1,
              interval: 1
            }
          }),
          // Reddust: inner ring, flat
          ...Array(40).fill(0).map((_, i) => {
            const angle = (i / 40) * 2 * Math.PI + Math.PI / 8;
            return {
              id: `reddust-${i}`,
              type: 'free' as const,
              position: { x: Math.cos(angle) * 2.5, z: Math.sin(angle) * 2.5, y: 0 },
              particle: "reddust",
              color: "#00FF00",
              alpha: 1,
              repeat: 1,
              interval: 1
            }
          })
        ],
        tickStart: 0,
        tickEnd: 0,
        tickDelay: 0,
        particle: "portal",
        color: "#FF0000",
        alpha: 1,
        shapeSize: 1,
        repeat: 1,
        yOffset: 0,
        repeatInterval: 1,
        targeter: "origin",
        effectType: "particlering"
      }
    ]
  }
  
  return templates[templateId] || []
} 