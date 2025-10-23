import { Vector3 } from "three"
import { use3DStore } from "../store/use3DStore"

interface CameraAnimationConfig {
  duration: number
  easing: 'linear' | 'ease-in-out' | 'ease-out'
  target: Vector3
  distance: number
}

interface AnimationState {
  isAnimating: boolean
  startTime: number
  startPosition: Vector3
  endPosition: Vector3
  target: Vector3
  duration: number
  easing: string
  animationId?: number
}

class CameraAnimator {
  private animationState: AnimationState | null = null

  // Easing fonksiyonları
  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  private linear(t: number): number {
    return t
  }

  private getEasingFunction(easing: string) {
    switch (easing) {
      case 'ease-in-out':
        return this.easeInOut
      case 'ease-out':
        return this.easeOut
      case 'linear':
      default:
        return this.linear
    }
  }

  // Ana animasyon fonksiyonu
  async animateToAxis(axis: 'x' | 'y' | 'z', direction: 'positive' | 'negative' = 'positive'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Mevcut animasyonu iptal et
        this.cancelCurrentAnimation()

        const { updateCamera } = use3DStore.getState()
        const distance = 10
        const target = new Vector3(0, 0, 0)
        
        // Hedef pozisyonu hesapla
        let endPosition: Vector3
        switch (axis) {
          case 'x':
            endPosition = new Vector3(direction === 'positive' ? distance : -distance, 0, 0)
            break
          case 'y':
            endPosition = new Vector3(0, direction === 'positive' ? distance : -distance, 0)
            break
          case 'z':
            endPosition = new Vector3(0, 0, direction === 'positive' ? distance : -distance)
            break
        }

        // Mevcut kamera pozisyonunu al
        const currentCamera = use3DStore.getState().camera
        const startPosition = new Vector3(
          currentCamera.position.x,
          currentCamera.position.y,
          currentCamera.position.z
        )

        // Animasyon durumunu ayarla
        this.animationState = {
          isAnimating: true,
          startTime: performance.now(),
          startPosition,
          endPosition,
          target,
          duration: 500, // 500ms
          easing: 'ease-out'
        }

        // Animasyon döngüsü
        const animate = () => {
          if (!this.animationState) {
            resolve()
            return
          }

          const currentTime = performance.now()
          const elapsed = currentTime - this.animationState.startTime
          const progress = Math.min(elapsed / this.animationState.duration, 1)

          // Easing uygula
          const easingFunction = this.getEasingFunction(this.animationState.easing)
          const easedProgress = easingFunction(progress)

          // Pozisyonu interpolate et
          const currentPosition = new Vector3().lerpVectors(
            this.animationState.startPosition,
            this.animationState.endPosition,
            easedProgress
          )

          // Kamerayı güncelle
          updateCamera({
            position: {
              x: currentPosition.x,
              y: currentPosition.y,
              z: currentPosition.z
            },
            target: {
              x: this.animationState.target.x,
              y: this.animationState.target.y,
              z: this.animationState.target.z
            }
          })

          // Animasyon devam ediyor mu?
          if (progress < 1) {
            this.animationState.animationId = requestAnimationFrame(animate)
          } else {
            // Animasyon tamamlandı
            this.animationState = null
            resolve()
          }
        }

        // Animasyonu başlat
        animate()

      } catch (error) {
        reject(error)
      }
    })
  }

  // Mevcut animasyonu iptal et
  cancelCurrentAnimation(): void {
    if (this.animationState?.animationId) {
      cancelAnimationFrame(this.animationState.animationId)
    }
    this.animationState = null
  }

  // Animasyon durumunu kontrol et
  isAnimating(): boolean {
    return this.animationState?.isAnimating ?? false
  }

  // Belirli pozisyona animasyon
  async animateToPosition(position: Vector3, target: Vector3, duration: number = 500): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.cancelCurrentAnimation()

        const { updateCamera } = use3DStore.getState()
        const currentCamera = use3DStore.getState().camera
        const startPosition = new Vector3(
          currentCamera.position.x,
          currentCamera.position.y,
          currentCamera.position.z
        )

        this.animationState = {
          isAnimating: true,
          startTime: performance.now(),
          startPosition,
          endPosition: position,
          target,
          duration,
          easing: 'ease-out'
        }

        const animate = () => {
          if (!this.animationState) {
            resolve()
            return
          }

          const currentTime = performance.now()
          const elapsed = currentTime - this.animationState.startTime
          const progress = Math.min(elapsed / this.animationState.duration, 1)

          const easingFunction = this.getEasingFunction(this.animationState.easing)
          const easedProgress = easingFunction(progress)

          const currentPosition = new Vector3().lerpVectors(
            this.animationState.startPosition,
            this.animationState.endPosition,
            easedProgress
          )

          updateCamera({
            position: {
              x: currentPosition.x,
              y: currentPosition.y,
              z: currentPosition.z
            },
            target: {
              x: this.animationState.target.x,
              y: this.animationState.target.y,
              z: this.animationState.target.z
            }
          })

          if (progress < 1) {
            this.animationState.animationId = requestAnimationFrame(animate)
          } else {
            this.animationState = null
            resolve()
          }
        }

        animate()

      } catch (error) {
        reject(error)
      }
    })
  }
}

// Singleton instance
export const cameraAnimator = new CameraAnimator()

// Axis pozisyonları
export const AXIS_POSITIONS = {
  x: {
    positive: { x: 10, y: 0, z: 0 },
    negative: { x: -10, y: 0, z: 0 }
  },
  y: {
    positive: { x: 0, y: 10, z: 0 },
    negative: { x: 0, y: -10, z: 0 }
  },
  z: {
    positive: { x: 0, y: 0, z: 10 },
    negative: { x: 0, y: 0, z: -10 }
  }
}

export const TARGET_POSITION = { x: 0, y: 0, z: 0 }