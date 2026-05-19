import type { Element, Layer } from "@/types"

export interface TransferData {
  elements: Element[]
  layers: Layer[]
  clearExisting: boolean
  timestamp: number
  layerNames: string[]
}

export class TransferManager {
  private static readonly STORAGE_KEY = 'aurafx-3d-transfer'
  private static readonly MAX_AGE = 5 * 60 * 1000 // 5 minutes

  static setTransferData(data: TransferData): void {
    try {
      // Use sessionStorage instead of localStorage
      // sessionStorage is cleared when tab is closed
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      console.log('Transfer data stored in sessionStorage')
    } catch (error) {
      console.error('Failed to store transfer data:', error)
    }
  }

  static getTransferData(): TransferData | null {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEY)
      if (!data) return null

      const parsed: TransferData = JSON.parse(data)
      
      // Check if data is still valid
      const now = Date.now()
      if (now - parsed.timestamp > this.MAX_AGE) {
        this.clearTransferData()
        return null
      }

      return parsed
    } catch (error) {
      console.error('Failed to parse transfer data:', error)
      this.clearTransferData()
      return null
    }
  }

  static clearTransferData(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY)
      console.log('Transfer data cleared from sessionStorage')
    } catch (error) {
      console.error('Failed to clear transfer data:', error)
    }
  }

  static hasValidTransferData(): boolean {
    return this.getTransferData() !== null
  }
}