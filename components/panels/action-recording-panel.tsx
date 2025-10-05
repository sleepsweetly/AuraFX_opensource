"use client"

import { useState, useMemo, useCallback, memo } from "react"
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
  Zap,
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

const ActionItem = memo(({ record, index }: { record: ActionRecord; index: number }) => {
  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }, [])

  const formatDelay = useCallback((delayTicks: number) => {
    const seconds = delayTicks / 20
    return `${delayTicks}t (${seconds.toFixed(1)}s)`
  }, [])

  return (
    <motion.div
      className="flex items-center justify-between text-sm bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 w-7 font-mono text-xs font-semibold bg-gray-50 px-2 py-1 rounded border border-gray-200">
          #{index + 1}
        </span>
        <span className="text-gray-900 font-medium text-xs">
          {record.elementIds.length} element{record.elementIds.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 font-medium">
          {formatDelay(record.delayTicks)}
        </span>
        <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200">
          {formatTime(record.timestamp)}
        </span>
      </div>
    </motion.div>
  )
})

ActionItem.displayName = "ActionItem"

const ActionGroup = memo(
  ({
    groupKey,
    groupRecords,
    isExpanded,
    onToggle,
    getActionDescription,
  }: {
    groupKey: string
    groupRecords: ActionRecord[]
    isExpanded: boolean
    onToggle: (key: string) => void
    getActionDescription: (record: ActionRecord) => string
  }) => {
    const firstRecord = groupRecords[0]
    const Icon = ACTION_ICONS[firstRecord.type as keyof typeof ACTION_ICONS] || Clock
    const colorClass =
      ACTION_COLORS[firstRecord.type as keyof typeof ACTION_COLORS] || "bg-gray-50 text-gray-600 border-gray-200"
    const shouldShowGroup = groupRecords.length > 3 || isExpanded

    const formatTime = useCallback((timestamp: number) => {
      return new Date(timestamp).toLocaleTimeString()
    }, [])

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-150"
      >
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onToggle(groupKey)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${colorClass}`}>
                  {ACTION_LABELS[firstRecord.type as keyof typeof ACTION_LABELS] || firstRecord.type}
                </span>
                <span className="text-xs text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded border border-gray-200">
                  {groupRecords.length}
                </span>
              </div>
              <p className="text-sm text-gray-900 font-medium truncate">{getActionDescription(firstRecord)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
              {formatTime(firstRecord.timestamp)}
            </span>
            {groupRecords.length > 3 && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-7 h-7 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center"
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </motion.div>
            )}
          </div>
        </div>

        {shouldShowGroup && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50"
          >
            <div className="p-4 space-y-2">
              {groupRecords.slice(0, isExpanded ? groupRecords.length : 3).map((record, index) => (
                <ActionItem key={record.id} record={record} index={index} />
              ))}
              {!isExpanded && groupRecords.length > 3 && (
                <div className="text-sm text-gray-500 text-center pt-2 font-medium bg-white rounded-lg py-2.5 border border-gray-200">
                  +{groupRecords.length - 3} more
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  },
)

ActionGroup.displayName = "ActionGroup"

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
    debugFrameComments,
    toggleDebugFrameComments,
  } = useActionRecordingStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showSettings, setShowSettings] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const getActionDescription = useCallback((record: ActionRecord) => {
    switch (record.type) {
      case "rotate":
        return `Rotate ${record.elementIds.length} element(s) by ${record.data.angle?.toFixed(1)}°`
      case "scale":
        return `Scale ${record.elementIds.length} element(s) by ${record.data.scaleFactor?.toFixed(2)}x`
      case "move":
        return `Move ${record.elementIds.length} element(s) by (${record.data.deltaX?.toFixed(1)}, ${record.data.deltaZ?.toFixed(1)})`
      case "color":
        return `Change color of ${record.elementIds.length} element(s) to ${record.data.color}`
      case "particle_count":
        return `Set particle count of ${record.elementIds.length} element(s) to ${record.data.particleCount}`
      case "select":
        return `Select ${record.elementIds.length} element(s) via ${record.data.selectionType}`
      case "move_continuous":
        return `Move ${record.elementIds.length} element(s) continuously`
      case "transform_update":
        return `Update ${record.data.transformType} transform on ${record.elementIds.length} element(s)`
      case "transform_end":
        return `End ${record.data.transformType} transform on ${record.elementIds.length} element(s)`
      case "select_single":
        return `Select single element: ${record.elementIds[0]}`
      case "select_box":
        return `Select ${record.elementIds.length} element(s) via box selection`
      case "element_add":
        return `Add ${record.data.elementType} element at (${record.data.position?.x?.toFixed(1)}, ${record.data.position?.z?.toFixed(1)})`
      case "idle":
        return `Idle for ${(record.data.idleDuration || 0).toFixed(0)}ms (${record.elementIds.length} elements)`
      default:
        return `Unknown action on ${record.elementIds.length} element(s)`
    }
  }, [])

  const filteredAndGroupedRecords = useMemo(() => {
    let filtered = records

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.type.toLowerCase().includes(lowerSearch) ||
          getActionDescription(record).toLowerCase().includes(lowerSearch),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((record) => record.type === filterType)
    }

    const groups: { [key: string]: ActionRecord[] } = {}

    filtered.forEach((record) => {
      const timeKey = Math.floor(record.timestamp / 5000) * 5000
      const groupKey = `${record.type}-${timeKey}`

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(record)
    })

    return groups
  }, [records, searchTerm, filterType, getActionDescription])

  const totalRecords = records.length
  const filteredCount = useMemo(
    () => Object.values(filteredAndGroupedRecords).flat().length,
    [filteredAndGroupedRecords],
  )

  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(groupKey)) {
        newExpanded.delete(groupKey)
      } else {
        newExpanded.add(groupKey)
      }
      return newExpanded
    })
  }, [])

  const actionTypes = useMemo(() => Array.from(new Set(records.map((r) => r.type))), [records])

  return (
    <motion.section
      className="flex-1 h-full flex flex-col bg-white border-r border-gray-200 overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center gap-4 px-8 py-6 border-b border-gray-100 bg-white"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Activity className="w-6 h-6 text-white" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Action Recorder</h2>
          <p className="text-gray-500 text-sm font-medium mt-0.5">
            {isRecording ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                Recording in progress...
              </span>
            ) : (
              `${totalRecords} actions recorded`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleToggleRecording}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/30"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/30"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>

          {records.length > 0 && (
            <motion.button
              onClick={clearRecords}
              className="w-12 h-12 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 flex items-center justify-center transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear All Records"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          )}

          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              showSettings
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-8 mt-6 p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-sm"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex-1">
                  <Label htmlFor="add-element-delay" className="text-sm font-semibold text-gray-900">
                    Add element delay
                  </Label>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Adds a 1-tick delay when recording element additions
                  </p>
                </div>
                <Switch
                  id="add-element-delay"
                  checked={addElementDelay}
                  onCheckedChange={toggleAddElementDelay}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex-1">
                  <Label htmlFor="opt-idle-repeat" className="text-sm font-semibold text-gray-900">
                    Optimize idle repeat
                  </Label>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Smoother idle playback and block other actions during idle
                  </p>
                </div>
                <Switch
                  id="opt-idle-repeat"
                  checked={optimizeIdleRepeat}
                  onCheckedChange={toggleOptimizeIdleRepeat}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex-1">
                  <Label htmlFor="opt-circle-frames" className="text-sm font-semibold text-gray-900">
                    Optimize circle frames
                  </Label>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Compress circle elements per frame into a single particlering
                  </p>
                </div>
                <Switch
                  id="opt-circle-frames"
                  checked={optimizeCircleFrames}
                  onCheckedChange={toggleOptimizeCircleFrames}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex-1">
                  <Label htmlFor="opt-debug-frame" className="text-sm font-semibold text-gray-900">
                    Debug comments in code
                  </Label>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Adds frame index, source type, idle flag, delay and repeat info
                  </p>
                </div>
                <Switch
                  id="opt-debug-frame"
                  checked={debugFrameComments}
                  onCheckedChange={toggleDebugFrameComments}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-8 mt-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 pl-11 text-sm bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl shadow-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-11 px-4 text-sm bg-white border border-gray-200 text-gray-900 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-w-[140px] shadow-sm font-medium"
        >
          <option value="all">All Types</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>
              {ACTION_LABELS[type as keyof typeof ACTION_LABELS] || type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-8 pt-6 pb-6">
        {records.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-16">
            <motion.div
              className="max-w-md mx-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Activity className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-sans">
                {isRecording ? "Recording in progress..." : "No actions recorded yet"}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {isRecording
                  ? "Perform actions on the canvas to see them recorded here"
                  : "Start recording to capture your actions and build automation sequences"}
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6 text-sm">
              <span className="text-gray-600 font-medium">
                {filteredCount} of {totalRecords} actions
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Zap className="w-4 h-4" />
                <span className="font-semibold text-xs">Live Updates</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {Object.entries(filteredAndGroupedRecords).map(([groupKey, groupRecords]) => {
                    const firstRecord = groupRecords[0]
                    const Icon = ACTION_ICONS[firstRecord.type as keyof typeof ACTION_ICONS] || Clock
                    const colorClass =
                      ACTION_COLORS[firstRecord.type as keyof typeof ACTION_COLORS] ||
                      "bg-slate-50 text-slate-600 border-slate-200"
                    const isExpanded = expandedGroups.has(groupKey)
                    const shouldShowGroup = groupRecords.length > 3 || isExpanded

                    return (
                      <motion.div
                        key={groupKey}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 shadow-sm"
                        whileHover={{ y: -2 }}
                      >
                        {/* Group Header */}
                        <div
                          className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleGroup(groupKey)}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <motion.div
                              className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center shadow-sm"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Icon className="w-5 h-5 text-gray-700" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs px-3 py-1.5 rounded-lg border font-semibold ${colorClass}`}>
                                  {ACTION_LABELS[firstRecord.type as keyof typeof ACTION_LABELS] || firstRecord.type}
                                </span>
                                <span className="text-xs text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                                  {groupRecords.length} action{groupRecords.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 font-medium truncate leading-relaxed">
                                {getActionDescription(firstRecord)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                              {new Date(firstRecord.timestamp).toLocaleTimeString()}
                            </span>
                            {groupRecords.length > 3 && (
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center"
                              >
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {shouldShowGroup && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white"
                          >
                            <div className="p-5 space-y-2.5">
                              {groupRecords.slice(0, isExpanded ? groupRecords.length : 3).map((record, index) => (
                                <motion.div
                                  key={record.id}
                                  className="flex items-center justify-between text-sm bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-8 font-mono text-xs font-bold bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                      #{index + 1}
                                    </span>
                                    <span className="text-gray-900 font-semibold">
                                      {record.elementIds.length} element{record.elementIds.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-gray-600">
                                    <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 font-semibold">
                                      {`${record.delayTicks}t (${(record.delayTicks / 20).toFixed(1)}s)`}
                                    </span>
                                    <span className="font-mono text-xs bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                                      {new Date(record.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                              {!isExpanded && groupRecords.length > 3 && (
                                <div className="text-sm text-gray-500 text-center pt-3 font-semibold bg-white rounded-xl py-3 border border-gray-200">
                                  +{groupRecords.length - 3} more actions
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }
      `}</style>
    </motion.section>
  )
}
