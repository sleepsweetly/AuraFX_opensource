// Web Worker for spawn frame analysis
// This worker runs in a separate thread to avoid blocking the main UI

interface WorkerMessage {
  positions: Float32Array
  vertexCount: number
  clipDuration: number
  fps: number
  performanceMode: boolean
}

interface WorkerResponse {
  spawnFrames: number[]
  progress: number
}

// Worker context
const ctx: Worker = self as any

ctx.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { positions, vertexCount, clipDuration, fps, performanceMode } = event.data
  
  const totalFrames = Math.ceil(clipDuration * fps)
  const spawnFrames: number[] = new Array(vertexCount).fill(0)
  
  // Performans için sampling yap
  const sampleRate = performanceMode 
    ? Math.max(1, Math.floor(totalFrames / 50))  // Performance mode: 50 frame
    : Math.max(1, Math.floor(totalFrames / 100)) // Normal mode: 100 frame
  
  let analyzedFrames = 0
  const initialPositions = new Float32Array(positions.length)
  
  // İlk pozisyonları kaydet
  for (let i = 0; i < positions.length; i++) {
    initialPositions[i] = positions[i]
  }

  const analyzeFrame = (frameIndex: number) => {
    if (frameIndex >= totalFrames) {
      // Analiz tamamlandı
      ctx.postMessage({
        spawnFrames,
        progress: 100
      } as WorkerResponse)
      return
    }

    // Bu frame'de vertex pozisyonlarını karşılaştır
    for (let i = 0; i < vertexCount; i++) {
      const vertexIndex = i * 3
      const currentX = positions[vertexIndex]
      const currentY = positions[vertexIndex + 1]
      const currentZ = positions[vertexIndex + 2]
      
      const initialX = initialPositions[vertexIndex]
      const initialY = initialPositions[vertexIndex + 1]
      const initialZ = initialPositions[vertexIndex + 2]
      
      // Pozisyon değişikliği kontrolü (threshold ile)
      const threshold = 0.01
      const hasMoved = Math.abs(currentX - initialX) > threshold ||
                      Math.abs(currentY - initialY) > threshold ||
                      Math.abs(currentZ - initialZ) > threshold
      
      if (hasMoved && spawnFrames[i] === 0) {
        spawnFrames[i] = frameIndex
      }
    }
    
    analyzedFrames++
    const progress = Math.min(99, (analyzedFrames / totalFrames) * 100)
    
    // Progress güncellemesi gönder
    ctx.postMessage({
      spawnFrames: [],
      progress
    } as WorkerResponse)
    
    // Bir sonraki frame'i analiz et
    setTimeout(() => {
      analyzeFrame(frameIndex + sampleRate)
    }, 0)
  }
  
  // Analizi başlat
  analyzeFrame(0)
})

// Worker'ı export et (TypeScript için)
export {} 