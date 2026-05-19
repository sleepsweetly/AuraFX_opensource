"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Plus } from "lucide-react"

export function FileUploader() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragTimeout, setDragTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      setIsUploading(true)
      // File upload functionality disabled
      console.log("File upload disabled - animation features removed")
      setIsUploading(false)
    },
    [],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (dragTimeout) {
        clearTimeout(dragTimeout)
        setDragTimeout(null)
      }

      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files)
      }
    },
    [handleFileUpload, dragTimeout],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      if (dragTimeout) {
        clearTimeout(dragTimeout)
      }

      setIsDragOver(true)

      // Set timeout to hide drag overlay if drag leaves
      const timeout = setTimeout(() => {
        setIsDragOver(false)
      }, 100)
      setDragTimeout(timeout)
    },
    [dragTimeout],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    // Don't immediately hide - let the timeout handle it
    // This prevents flickering when dragging over child elements
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileUpload(e.target.files)
      }
    },
    [handleFileUpload],
  )

  return (
    <>
      {/* Upload Button */}
      <div className="absolute top-6 left-6 z-10">
        <label htmlFor="file-upload">
          <Button
            variant="ghost"
            className="h-10 px-4 bg-black/80 backdrop-blur text-white hover:bg-white/20 transition-all duration-200 rounded-full"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Assets (Disabled)
              </>
            )}
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.obj"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Drag Overlay - Only show when actually dragging */}
      {isDragOver && (
        <div className="absolute inset-4 bg-black/95 backdrop-blur flex items-center justify-center z-20 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">File upload disabled</h3>
            <p className="text-white/60">Animation features have been removed</p>
          </div>
        </div>
      )}

      {/* Drag Area */}
      <div className="absolute inset-0" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} />
    </>
  )
}
