"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  rotate: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  scale: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  move: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  color: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  particle_count: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  select: "bg-accent/20 text-accent-foreground border-accent/30",
  move_continuous: "bg-chart-3/30 text-chart-3 border-chart-3/40",
  transform_update: "bg-primary/20 text-primary-foreground border-primary/30",
  transform_end: "bg-destructive/20 text-destructive-foreground border-destructive/30",
  select_single: "bg-chart-2/30 text-chart-2 border-chart-2/40",
  select_box: "bg-chart-2/25 text-chart-2 border-chart-2/35",
  element_add: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  idle: "bg-muted/40 text-muted-foreground border-muted-foreground/30",
}

export function ActionRecordingPanel({
  isRecording: _isRecording,
  onToggleRecording: _onToggleRecording,
}: ActionRecordingPanelProps) {
  const { records, clearRecords, startRecording, stopRecording, addElementDelay, toggleAddElementDelay, isRecording } =
    useActionRecordingStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showSettings, setShowSettings] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDelay = (delayTicks: number) => {
    const seconds = delayTicks / 20
    return `${delayTicks}t (${seconds.toFixed(1)}s)`
  }

  const getActionDescription = (record: ActionRecord) => {
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
  }

  // Filtreleme ve gruplama
  const filteredAndGroupedRecords = useMemo(() => {
    let filtered = records

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getActionDescription(record).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Tip filtresi
    if (filterType !== "all") {
      filtered = filtered.filter((record) => record.type === filterType)
    }

    // Gruplama - aynı tip ve yakın zamanlı action'ları grupla
    const groups: { [key: string]: ActionRecord[] } = {}

    filtered.forEach((record) => {
      const timeKey = Math.floor(record.timestamp / 5000) * 5000 // 5 saniye grupları
      const groupKey = `${record.type}-${timeKey}`

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(record)
    })

    return groups
  }, [records, searchTerm, filterType])

  const totalRecords = records.length
  const filteredCount = Object.values(filteredAndGroupedRecords).flat().length

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const actionTypes = Array.from(new Set(records.map((r) => r.type)))

  return (
    <motion.section
      className="flex-1 h-full flex flex-col bg-background border-r border-border text-foreground overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Activity className="w-5 h-5 text-primary" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">Action Recorder</h2>
          <p className="text-muted-foreground text-sm font-medium">
            {isRecording ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                Recording in progress...
              </span>
            ) : (
              `${totalRecords} actions recorded`
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleToggleRecording}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
              isRecording
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
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
              className="w-10 h-10 rounded-xl bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border hover:border-destructive/30 flex items-center justify-center transition-all duration-200 shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear All Records"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}

          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border flex items-center justify-center transition-all duration-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-6 mt-4 p-4 bg-card border border-border rounded-xl shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="add-element-delay" className="text-sm font-medium text-foreground">
                  Add element delay
                </Label>
                <Switch
                  id="add-element-delay"
                  checked={addElementDelay}
                  onCheckedChange={toggleAddElementDelay}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When enabled, adds a 1-tick delay when recording element additions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 mt-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-10 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-4 text-sm bg-background border border-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 min-w-[120px]"
        >
          <option value="all">All Types</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>
              {ACTION_LABELS[type as keyof typeof ACTION_LABELS] || type}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 px-6 pt-6 pb-6">
        {records.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-16">
            <motion.div
              className="max-w-md mx-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <Activity className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 font-sans">
                {isRecording ? "Recording in progress..." : "No actions recorded yet"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isRecording
                  ? "Perform actions on the canvas to see them recorded here"
                  : "Start recording to capture your actions and build automation sequences"}
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6 text-sm">
              <span className="text-muted-foreground font-medium">
                {filteredCount} of {totalRecords} actions
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Live Updates</span>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4">
                <AnimatePresence>
                  {Object.entries(filteredAndGroupedRecords).map(([groupKey, groupRecords]) => {
                    const firstRecord = groupRecords[0]
                    const Icon = ACTION_ICONS[firstRecord.type as keyof typeof ACTION_ICONS] || Clock
                    const colorClass =
                      ACTION_COLORS[firstRecord.type as keyof typeof ACTION_COLORS] ||
                      "bg-muted/40 text-muted-foreground border-muted-foreground/30"
                    const isExpanded = expandedGroups.has(groupKey)
                    const shouldShowGroup = groupRecords.length > 3 || isExpanded

                    return (
                      <motion.div
                        key={groupKey}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 shadow-sm"
                        whileHover={{ y: -2 }}
                      >
                        {/* Group Header */}
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => toggleGroup(groupKey)}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <motion.div
                              className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center shadow-sm"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Icon className="w-5 h-5 text-foreground" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${colorClass}`}>
                                  {ACTION_LABELS[firstRecord.type as keyof typeof ACTION_LABELS] || firstRecord.type}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                  {groupRecords.length} action{groupRecords.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <p className="text-sm text-foreground font-medium truncate leading-relaxed">
                                {getActionDescription(firstRecord)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-sm text-muted-foreground font-mono">
                              {formatTime(firstRecord.timestamp)}
                            </span>
                            {groupRecords.length > 3 && (
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Group Details */}
                        {shouldShowGroup && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border bg-muted/20"
                          >
                            <div className="p-4 space-y-3">
                              {groupRecords.slice(0, isExpanded ? groupRecords.length : 3).map((record, index) => (
                                <motion.div
                                  key={record.id}
                                  className="flex items-center justify-between text-sm bg-background/50 rounded-lg p-3 border border-border/50 shadow-sm"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground w-8 font-mono text-xs font-medium">
                                      #{index + 1}
                                    </span>
                                    <span className="text-foreground font-medium">
                                      {record.elementIds.length} element{record.elementIds.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-6 text-muted-foreground">
                                    <span className="font-mono text-xs">{formatDelay(record.delayTicks)}</span>
                                    <span className="font-mono text-xs">{formatTime(record.timestamp)}</span>
                                  </div>
                                </motion.div>
                              ))}
                              {!isExpanded && groupRecords.length > 3 && (
                                <div className="text-sm text-muted-foreground text-center pt-3 font-medium">
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
            </ScrollArea>
          </div>
        )}
      </div>
    </motion.section>
  )
}
