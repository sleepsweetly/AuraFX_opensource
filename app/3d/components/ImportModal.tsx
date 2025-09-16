"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, File as FileIcon } from "lucide-react"

interface ImportModalProps {
  importType: "OBJ" | "FBX"
  onClose: () => void
  onImport: (file: File, scale: number) => void
}

export function ImportModal({
  importType,
  onClose,
  onImport,
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [scale, setScale] = useState(0.1)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (
        (importType === "OBJ" && !selectedFile.name.toLowerCase().endsWith(".obj")) ||
        (importType === "FBX" && !selectedFile.name.toLowerCase().endsWith(".fbx"))
      ) {
        setError(`Please select a .${importType.toLowerCase()} file.`)
        setFile(null)
      } else {
        setFile(selectedFile)
        setError(null)
      }
    }
  }

  const handleImportClick = () => {
    if (file) {
      onImport(file, scale)
      onClose()
    } else {
      setError("Please select a file to import.")
    }
  }

  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-lg shadow-xl p-6 border border-zinc-700 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Import {importType} Model
        </h2>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <Label className="text-sm text-zinc-400">Model File</Label>
            <div
              className="mt-1 flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 border-zinc-700 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                {file ? (
                  <>
                    <FileIcon className="mx-auto h-12 w-12 text-green-500" />
                    <p className="text-sm text-zinc-300">{file.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-zinc-500" />
                    <p className="text-sm text-zinc-400">
                      Click to browse or drag & drop
                    </p>
                    <p className="text-xs text-zinc-500">
                      .{importType.toLowerCase()} files only
                    </p>
                  </>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={`.${importType.toLowerCase()}`}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Scale Input */}
          <div>
            <Label htmlFor="import-scale" className="text-sm text-zinc-400">
              Import Scale
            </Label>
            <Input
              id="import-scale"
              type="number"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full h-10 bg-zinc-800 border-zinc-700 text-white"
              step="0.01"
              min="0"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImportClick}
            disabled={!file}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Import Model
          </Button>
        </div>
      </div>
    </div>
  )
} 