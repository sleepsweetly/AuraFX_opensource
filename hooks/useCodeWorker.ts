"use client"

import { useCallback, useRef, useEffect, useState } from "react"
import type { Layer, Element, ActionRecord } from "@/types"
import { useElementStore } from "@/store/useElementStore"
import { siteConfig } from "@/lib/config"

interface UseCodeWorkerOptions {
  layers: Layer[]
  settings: any
  modes: any
  modeSettings: any
  frameMode: string
  manualFrameCount: number
  optimize: boolean
  chainSequence: string[]
  chainItems: Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }>
  actionRecords: ActionRecord[]
  actionRecordingSettings?: { optimizeCircleFrames?: boolean; optimizeIdleRepeat?: boolean; debugFrameComments?: boolean }
}

export function useCodeWorker() {
  const workerRef = useRef<Worker | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")
  const resolveRef = useRef<((code: string) => void) | null>(null)
  const rejectRef = useRef<((err: Error) => void) | null>(null)

  useEffect(() => {
    // Create worker on mount
    workerRef.current = new Worker(
      new URL("../workers/code-generator.worker.ts", import.meta.url)
    )

    workerRef.current.onmessage = (event) => {
      const { type, code, error } = event.data
      if (type === "success") {
        setGeneratedCode(code)
        setIsGenerating(false)
        resolveRef.current?.(code)
      } else if (type === "error") {
        const errorCode = `# Error generating code\n${error}`
        setGeneratedCode(errorCode)
        setIsGenerating(false)
        rejectRef.current?.(new Error(error))
      }
      resolveRef.current = null
      rejectRef.current = null
    }

    workerRef.current.onerror = (err) => {
      console.error("Code worker error:", err)
      setIsGenerating(false)
      rejectRef.current?.(new Error(err.message))
      resolveRef.current = null
      rejectRef.current = null
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const generate = useCallback(
    (opts: UseCodeWorkerOptions): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Fallback: worker couldn't be created
          reject(new Error("Worker not available"))
          return
        }

        setIsGenerating(true)
        resolveRef.current = resolve
        rejectRef.current = reject

        // Snapshot the element store and send everything to worker
        const elementStoreMap = useElementStore.getState().elements

        workerRef.current.postMessage({
          layers: opts.layers,
          settings: opts.settings,
          modes: opts.modes,
          modeSettings: opts.modeSettings,
          frameMode: opts.frameMode,
          manualFrameCount: opts.manualFrameCount,
          optimize: opts.optimize,
          chainSequence: opts.chainSequence,
          chainItems: opts.chainItems,
          actionRecords: opts.actionRecords,
          actionRecordingSettings: opts.actionRecordingSettings,
          elementStoreMap,
          discordInviteUrl: siteConfig.discordInviteUrl,
        })
      })
    },
    []
  )

  return { generate, isGenerating, generatedCode, setGeneratedCode }
}
