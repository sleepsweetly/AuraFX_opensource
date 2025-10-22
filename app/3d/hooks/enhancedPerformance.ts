// Enhanced Performance Hooks for 3D Store
// Ultra-optimized hooks for 10k+ element performance

import React from "react"
import { use3DStore } from "../store/use3DStore"

// Ultra-hızlı selection helper'lar
export const useOptimizedSelection = () => {
    const { selectedVertices, selectedShapes } = use3DStore()

    // Memoized Set'ler - her render'da yeniden oluşturma!
    const selectedVerticesSet = React.useMemo(() => new Set(selectedVertices), [selectedVertices])
    const selectedShapesSet = React.useMemo(() => new Set(selectedShapes), [selectedShapes])

    const isVertexSelected = React.useCallback((id: string) => selectedVerticesSet.has(id), [selectedVerticesSet])
    const isShapeSelected = React.useCallback((id: string) => selectedShapesSet.has(id), [selectedShapesSet])

    return {
        selectedVerticesSet,
        selectedShapesSet,
        isVertexSelected,
        isShapeSelected
    }
}

// Batch transform optimizasyonu
export const useOptimizedTransforms = () => {
    const { vertices, shapes, selectedVertices, selectedShapes } = use3DStore()

    return React.useMemo(() => {
        const selectedVerticesSet = new Set(selectedVertices)
        const selectedShapesSet = new Set(selectedShapes)

        // Seçili tüm vertex'leri bul (shape'lerin içindekiler dahil)
        const allSelectedVertexIds = new Set<string>()

        // Doğrudan seçili vertex'ler
        selectedVertices.forEach(id => allSelectedVertexIds.add(id))

        // Shape'lerin içindeki vertex'ler
        selectedShapes.forEach(shapeId => {
            const shape = shapes.find(s => s.id === shapeId)
            if (shape) {
                shape.vertices.forEach(vertexId => allSelectedVertexIds.add(vertexId))
            }
        })

        return {
            allSelectedVertexIds,
            selectedVerticesSet,
            selectedShapesSet,
            totalSelectedCount: allSelectedVertexIds.size + selectedShapes.length
        }
    }, [vertices, shapes, selectedVertices, selectedShapes])
}

// Performance monitor hook
export const usePerformanceMonitor = (componentName: string) => {
    const renderCount = React.useRef(0)
    const lastRenderTime = React.useRef(performance.now())

    React.useEffect(() => {
        renderCount.current++
        const now = performance.now()
        const duration = now - lastRenderTime.current
        lastRenderTime.current = now

        if (duration > 16) { // 60fps'den düşük
            console.warn(`🐢 Slow render in ${componentName}: ${duration.toFixed(2)}ms (render #${renderCount.current})`)
        }

        if (renderCount.current > 10 && duration > 8) {
            console.warn(`🚨 Performance issue detected in ${componentName}`)
        }
    })
}

// Optimized vertex filtering hook
export const useOptimizedVertexFiltering = () => {
    const { vertices, performanceMode } = use3DStore()

    return React.useMemo(() => {
        const allVisible = Array.from(vertices.values()).filter(
            (vertex) => vertex.visible
        )

        const visibleVertices = performanceMode
            ? allVisible.filter((_, index) => index % 2 === 0)
            : allVisible

        return {
            visibleVertices,
            totalCount: vertices.size,
            visibleCount: visibleVertices.length,
            shouldUseInstanced: visibleVertices.length >= 100
        }
    }, [vertices, performanceMode])
}

// Batch update queue for massive operations
export const useBatchUpdateQueue = <T>(
    batchSize: number = 100,
    delay: number = 16
) => {
    const queueRef = React.useRef<T[]>([])
    const isProcessingRef = React.useRef(false)
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const processBatch = React.useCallback((processor: (batch: T[]) => void) => {
        if (queueRef.current.length === 0) {
            isProcessingRef.current = false
            return
        }

        const currentBatch = queueRef.current.splice(0, batchSize)
        processor(currentBatch)

        if (queueRef.current.length > 0) {
            timeoutRef.current = setTimeout(() => processBatch(processor), delay)
        } else {
            isProcessingRef.current = false
        }
    }, [batchSize, delay])

    const addToQueue = React.useCallback((items: T[]) => {
        queueRef.current.push(...items)
    }, [])

    const flush = React.useCallback((processor: (batch: T[]) => void) => {
        if (!isProcessingRef.current && queueRef.current.length > 0) {
            isProcessingRef.current = true
            processBatch(processor)
        }
    }, [processBatch])

    const clear = React.useCallback(() => {
        queueRef.current = []
        isProcessingRef.current = false
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    return { addToQueue, flush, clear }
}