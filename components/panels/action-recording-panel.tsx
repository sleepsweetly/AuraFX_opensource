"use client"

import { useState, useMemo, useCallback, memo, useRef } from "react"
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

interface ActionRecordingPanelProps {
  isRecording: boolean
  onToggleRecording: () => void
}

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

const ACTION_COLORS = {
  rotate: "bg-gray-100 text-gray-700 border-gray-300",
  scale: "bg-gray-100 text-gray-700 border-gray-300",
  move: "bg-gray-100 text-gray-700 border-gray-300",
  color: "bg-gray-100 text-gray-700 border-gray-300",
  particle_count: "bg-gray-100 text-gray-700 border-gray-300",
  select: "bg-gray-100 text-gray-700 border-gray-300",
  move_continuous: "bg-gray-100 text-gray-700 border-gray-300",
  transform_update: "bg-gray-100 text-gray-700 border-gray-300",
  transform_end: "bg-gray-100 text-gray-700 border-gray-300",
  select_single: "bg-gray-100 text-gray-700 border-gray-300",
  select_box: "bg-gray-100 text-gray-700 border-gray-300",
  element_add: "bg-gray-100 text-gray-700 border-gray-300",
  idle: "bg-gray-50 text-gray-600 border-gray-200",
}



// Virtual Scrolling Action List Component
function VirtualActionList({ actions }: { actions: ActionRecord[] }) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Virtual scrolling parameters
  const ITEM_HEIGHT = 48 // Height of each action item in pixels (more compact)
  const CONTAINER_HEIGHT = 256 // max-h-64 = 16rem = 256px
  const VISIBLE_ITEMS = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT)
  const BUFFER_SIZE = 5 // Extra items to render for smooth scrolling

  // Calculate which items to render
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
  const endIndex = Math.min(actions.length, startIndex + VISIBLE_ITEMS + (BUFFER_SIZE * 2))
  const visibleActions = actions.slice(startIndex, endIndex)

  // Total height for scrollbar
  const totalHeight = actions.length * ITEM_HEIGHT

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No actions found</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto compact-scrollbar bg-white rounded-lg border border-gray-200"
      onScroll={handleScroll}
      style={{ height: CONTAINER_HEIGHT }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startIndex * ITEM_HEIGHT,
            width: '100%'
          }}
          className="space-y-1 p-2"
        >
          {visibleActions.map((record, index) => {
            const actualIndex = startIndex + index
            return (
              <div key={record.id} style={{ height: ITEM_HEIGHT }}>
                <ActionItem record={record} index={actualIndex} />
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .compact-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .compact-scrollbar::-webkit-scrollbar-track {
          background: #ffffff;
        }
        .compact-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .compact-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .compact-scrollbar::-webkit-scrollbar-corner {
          background: #ffffff;
        }
      `}</style>
    </div>
  )
}

const ActionItem = memo(({ record, index }: { record: ActionRecord; index: number }) => {
  const Icon = ACTION_ICONS[record.type as keyof typeof ACTION_ICONS] || Clock
  const colorClass = ACTION_COLORS[record.type as keyof typeof ACTION_COLORS] || "bg-gray-50 text-gray-600 border-gray-200"

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }, [])

  const formatDelay = useCallback((delayTicks: number) => {
    const seconds = delayTicks / 20
    return `${delayTicks}t (${seconds.toFixed(1)}s)`
  }, [])

  return (
    <motion.div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
    >
      {/* Icon */}
      <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
        <Icon className="w-3.5 h-3.5 text-gray-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colorClass}`}>
            {ACTION_LABELS[record.type as keyof typeof ACTION_LABELS] || record.type}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            #{index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{record.elementIds.length} element{record.elementIds.length !== 1 ? "s" : ""}</span>
          <span className="text-gray-400">•</span>
          <span className="font-mono">{formatDelay(record.delayTicks)}</span>
        </div>
      </div>

      {/* Time */}
      <div className="text-xs text-gray-500 font-mono flex-shrink-0">
        {formatTime(record.timestamp)}
      </div>
    </motion.div>
  )
})

ActionItem.displayName = "ActionItem"



export function ActionRecordingPanel({
  isRecording: _isRecording,
  onToggleRecording: _onToggleRecording,
}: ActionRecordingPanelProps) {
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
    optimizeCircleFrames,
    toggleOptimizeCircleFrames,
  } = useActionRecordingStore()



  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [recordingExpanded, setRecordingExpanded] = useState(true)
  const [settingsExpanded, setSettingsExpanded] = useState(false)
  const [actionsExpanded, setActionsExpanded] = useState(true)

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
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

  const actionTypes = useMemo(() =>
    Array.from(new Set(records.map(r => r.type))),
    [records]
  )

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto scrollbar-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Action Recorder</h3>
            <p className="text-sm text-gray-500">
              {isRecording ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                  Recording in progress...
                </span>
              ) : (
                `${records.length} actions recorded`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recording Controls Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setRecordingExpanded(!recordingExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Activity className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">Recording Controls</h4>
              <p className="text-xs text-gray-500">Start/stop recording actions</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: recordingExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {recordingExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleRecording}
                  className={`w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </motion.button>

                {records.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearRecords}
                    className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Records
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSettingsExpanded(!settingsExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">Recording Settings</h4>
              <p className="text-xs text-gray-500">Configure recording options</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: settingsExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {settingsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Add Element Delay */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <Label htmlFor="add-element-delay" className="text-sm font-medium text-gray-900">
                      Add Element Delay
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Adds a 1-tick delay when recording element additions
                    </p>
                  </div>
                  <Switch
                    id="add-element-delay"
                    checked={addElementDelay}
                    onCheckedChange={toggleAddElementDelay}
                  />
                </div>

                {/* Optimize Idle Repeat */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <Label htmlFor="opt-idle-repeat" className="text-sm font-medium text-gray-900">
                      Optimize Idle Repeat
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Smoother idle playback and block other actions during idle
                    </p>
                  </div>
                  <Switch
                    id="opt-idle-repeat"
                    checked={optimizeIdleRepeat}
                    onCheckedChange={toggleOptimizeIdleRepeat}
                  />
                </div>

                {/* Optimize Circle Frames */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <Label htmlFor="opt-circle-frames" className="text-sm font-medium text-gray-900">
                      Optimize Circle Frames
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Compress circle elements per frame into a single particlering
                    </p>
                  </div>
                  <Switch
                    id="opt-circle-frames"
                    checked={optimizeCircleFrames}
                    onCheckedChange={toggleOptimizeCircleFrames}
                  />
                </div>




              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions List Section */}
      {records.length > 0 && (
        <div className="flex-shrink-0 mb-6">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActionsExpanded(!actionsExpanded)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Activity className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-gray-900">Recorded Actions</h4>
                <p className="text-xs text-gray-500">{filteredRecords.length} of {records.length} actions</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: actionsExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {actionsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Search and Filter */}
                  <div className="space-y-3 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search actions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-9 bg-white border-gray-200 text-sm"
                      />
                    </div>

                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-300"
                    >
                      <option value="all">All Types</option>
                      {actionTypes.map((type) => (
                        <option key={type} value={type}>
                          {ACTION_LABELS[type as keyof typeof ACTION_LABELS] || type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions List */}
                  <div className="mt-2">
                    <VirtualActionList actions={filteredRecords} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {records.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-center py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isRecording ? "Recording Actions" : "No Actions Recorded"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {isRecording
                ? "Perform actions on the canvas to see them recorded here"
                : "Start recording to capture your actions and build automation sequences"}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}

<style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>