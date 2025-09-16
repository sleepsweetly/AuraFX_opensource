import { useCallback, useRef } from 'react'

interface BatchUpdate<T> {
  id: string
  data: T
}

interface UseBatchUpdatesOptions {
  batchSize?: number
  delay?: number
}

export function useBatchUpdates<T>(
  onBatchUpdate: (updates: BatchUpdate<T>[]) => void,
  options: UseBatchUpdatesOptions = {}
) {
  const { batchSize = 50, delay = 16 } = options // Default to ~60fps
  
  const batchRef = useRef<BatchUpdate<T>[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTime = useRef(0)

  const processBatch = useCallback(() => {
    if (batchRef.current.length === 0) return
    
    const batch = [...batchRef.current]
    batchRef.current = []
    
    // Remove timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Process the batch
    onBatchUpdate(batch)
    lastUpdateTime.current = Date.now()
  }, [onBatchUpdate])

  const addToBatch = useCallback((id: string, data: T) => {
    // Add to batch
    batchRef.current.push({ id, data })
    
    // Process immediately if batch is full
    if (batchRef.current.length >= batchSize) {
      processBatch()
      return
    }
    
    // Schedule processing if not already scheduled
    if (!timeoutRef.current) {
      const now = Date.now()
      const timeSinceLastUpdate = now - lastUpdateTime.current
      const remainingDelay = Math.max(0, delay - timeSinceLastUpdate)
      
      timeoutRef.current = setTimeout(processBatch, remainingDelay)
    }
  }, [batchSize, delay, processBatch])

  const flush = useCallback(() => {
    processBatch()
  }, [processBatch])

  const clear = useCallback(() => {
    batchRef.current = []
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return {
    addToBatch,
    flush,
    clear,
    batchSize: batchRef.current.length
  }
}