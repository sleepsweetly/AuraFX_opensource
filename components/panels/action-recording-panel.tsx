"use client"

import { useState, useMemo, useCallback, memo, Suspense } from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Play,
  Square,
  Trash2,
  RotateCw,
  MoveDiagonal,
  Move,
  Palette,
  Hash,
  Clock,
  Eye,
  Plus,
  Search,
  Settings,
  Activity,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useActionRecordingStore } from "@/store/useActionRecordingStore"
import type { ActionRecord } from "@/types"
import dynamic from "next/dynamic"

// Dynamic import with SSR disabled
const ActionRecording3DPreview = dynamic(() => import("@/components/action-recording-3d-preview"), {
  ssr: false,
})

const ACTION_ICONS = {
  rotate: RotateCw,
  scale: MoveDiagonal,
  move: Move,
  color: Palette,
  particle_count: Hash,
  select: Eye,
  move_continuous: MoveDiagonal,
  transform_update: Move,
  transform_end: Square,
  select_single: Eye,
  select_box: Eye,
  element_add: Plus,
  idle: Clock,
}

const ACTION_LABELS = {
  rotate: "Rotate",
  scale: "Scale", 
  move: "Move",
  color: "Color",
  particle_count: "Particle Count",
  select: "Select",
  move_continuous: "Move (Continuous)",
  transform_update: "Transform Update",
  transform_end: "Transform End",
  select_single: "Select Single",
  select_box: "Select Box",
  element_add: "Add Element",
  idle: "Idle",
}

export function ActionRecordingPanel() {
  const {
    records,
    clearRecords,
    startRecording,
    stopRecording,
    addElementDelay,
    toggleAddElementDelay,
    isRecording,
    optimizeIdleRepeat,
    toggleOptimizeIdleRepeat,
    debugFrameComments,
    toggleDebugFrameComments,
  } = useActionRecordingStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [settingsExpanded, setSettingsExpanded] = useState(false)
  const [show3DPreview, setShow3DPreview] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(50)

  const handleToggleRecording = useCallback(() => {
    if (isRecording) stopRecording()
    else startRecording()
  }, [isRecording, startRecording, stopRecording])

  const filteredRecords = useMemo(() => {
    let filtered = records
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(record =>
        record.type.toLowerCase().includes(lowerSearch) ||
        ACTION_LABELS[record.type as keyof typeof ACTION_LABELS]?.toLowerCase().includes(lowerSearch)
      )
    }
    if (filterType !== "all") {
      filtered = filtered.filter(record => record.type === filterType)
    }
    return filtered
  }, [records, searchTerm, filterType])

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-foreground overflow-hidden">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isRecording ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight">Action Recorder</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isRecording ? "Capturing..." : `${records.length} sequences`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Actions */}
      <div className="space-y-3 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleToggleRecording}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
            isRecording 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isRecording ? "STOP RECORDING" : "START RECORDING"}
        </motion.button>

        {records.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: "hsl(var(--accent))" }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShow3DPreview(true)}
            className="w-full py-3 px-6 rounded-2xl font-bold border border-border bg-card text-foreground flex items-center justify-center gap-3 transition-all"
          >
            <Eye className="w-4 h-4 text-primary" />
            WATCH 3D PREVIEW
          </motion.button>
        )}

        {records.length > 0 && (
          <button 
            onClick={clearRecords}
            className="w-full py-2 text-[10px] font-bold text-muted-foreground hover:text-red-500 flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
          >
            <Trash2 className="w-3 h-3" />
            Wipe Timeline
          </button>
        )}
      </div>

      {/* 3. Settings */}
      <div className="mt-6 border-t border-border pt-4 flex-shrink-0">
        <button 
          onClick={() => setSettingsExpanded(!settingsExpanded)}
          className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Recording Params</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsExpanded ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {settingsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-2 mt-2 px-1"
            >
              <SettingToggle 
                id="add-delay" 
                label="Step Delay" 
                desc="+1t for additions" 
                checked={addElementDelay} 
                onChange={toggleAddElementDelay} 
              />
              <SettingToggle 
                id="opt-idle" 
                label="Smart Idle" 
                desc="Optimized repeat" 
                checked={optimizeIdleRepeat} 
                onChange={toggleOptimizeIdleRepeat} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Timeline List */}
      <div className="mt-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent History</span>
          <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">{records.length} SEQ</span>
        </div>

        {records.length > 0 ? (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 bg-muted/40 border-none rounded-xl text-[11px] focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredRecords.slice(0, displayLimit).map((record, idx) => (
                <ActionItem key={record.id} record={record} index={records.length - idx} />
              ))}
              
              {filteredRecords.length > displayLimit && (
                <button
                  onClick={() => setDisplayLimit(prev => prev + 100)}
                  className="w-full py-4 text-[10px] font-bold text-muted-foreground hover:text-primary transition-all uppercase tracking-widest bg-muted/20 hover:bg-muted/40 rounded-2xl mt-4 border border-border/50"
                >
                  Load More (+100 Actions)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-6 text-center opacity-40 bg-muted/5">
            <Activity className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Empty Sequence</p>
          </div>
        )}
      </div>

      {/* Portal for 3D Modal */}
      {show3DPreview && typeof document !== 'undefined' && createPortal(
        <Suspense fallback={null}>
          <ActionRecording3DPreview onClose={() => setShow3DPreview(false)} />
        </Suspense>,
        document.body
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
      `}</style>
    </div>
  )
}

const SettingToggle = ({ id, label, desc, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/50 rounded-xl">
    <div className="min-w-0">
      <Label htmlFor={id} className="text-[10px] font-bold uppercase block truncate">{label}</Label>
      <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{desc}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onChange} className="scale-75 origin-right" />
  </div>
)

const ActionItem = memo(({ record, index }: { record: ActionRecord; index: number }) => {
  const Icon = ACTION_ICONS[record.type as keyof typeof ACTION_ICONS] || Clock
  const timestamp = new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-2.5 bg-card border border-border/50 rounded-xl flex items-center gap-3 hover:border-primary/40 transition-all group"
    >
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold truncate">
            {ACTION_LABELS[record.type as keyof typeof ACTION_LABELS] || record.type}
          </span>
          <span className="text-[8px] font-mono text-muted-foreground">#{index}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] text-muted-foreground">{record.elementIds.length} objs</span>
          <span className="w-0.5 h-0.5 rounded-full bg-border" />
          <span className="text-[9px] font-mono text-muted-foreground">{record.delayTicks}t</span>
        </div>
      </div>
      <div className="text-[8px] font-mono text-muted-foreground opacity-50">
        {timestamp}
      </div>
    </motion.div>
  )
})