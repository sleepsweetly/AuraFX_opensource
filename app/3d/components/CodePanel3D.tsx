"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Download, FileCode, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { use3DStore } from "../store/use3DStore"

interface CodePanel3DProps {
  isOpen: boolean
  onClose: () => void
}

function cleanCode(code: string) {
  return code
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim()
      return !(
        trimmed.startsWith("#") &&
        (trimmed.includes("AuraFX") || trimmed.includes("Generated at"))
      )
    })
    .join("\n")
}

export function CodePanel3D({ isOpen, onClose }: CodePanel3DProps) {
  const { vertices, shapes, layers, exportToMythicMobs } = use3DStore()
  const [copied, setCopied] = useState(false)

  const code = useMemo(() => exportToMythicMobs(), [vertices, shapes, layers, exportToMythicMobs])
  const previewCode = useMemo(() => cleanCode(code), [code])
  const lines = useMemo(() => previewCode.split("\n"), [previewCode])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const handleDownload = () => {
    const blob = new Blob([previewCode], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "aurafx-3d-skill.yml"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed right-24 top-20 bottom-24 z-40 flex w-[420px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-black/95 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <FileCode className="h-4 w-4 text-white/75" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">Code Preview</h2>
                <p className="truncate text-xs text-white/45">
                  {vertices.size} elements - {lines.length} lines
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close code panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2 border-b border-white/10 p-3">
            <button
              onClick={handleCopy}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto bg-[#050505]">
            {vertices.size === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div>
                  <FileCode className="mx-auto mb-3 h-8 w-8 text-white/25" />
                  <div className="text-sm font-medium text-white/65">No code yet</div>
                  <div className="mt-1 text-xs text-white/35">Add 3D elements to see live YAML here.</div>
                </div>
              </div>
            ) : (
              <pre className="min-w-max py-3 font-mono text-[11px] leading-5">
                {lines.map((line, index) => (
                  <div key={index} className="flex min-h-5 hover:bg-white/[0.04]">
                    <span className="w-10 shrink-0 select-none border-r border-white/10 pr-2 text-right text-white/25">
                      {index + 1}
                    </span>
                    <code className="px-3 text-white/75">{line || " "}</code>
                  </div>
                ))}
              </pre>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
