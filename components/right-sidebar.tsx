"use client"

import { Wrench, Zap, FolderOpen, Settings, Code, Link, Video, Gauge, Minimize2, Maximize2, Sparkles, Bell } from "lucide-react"
import { useSelectionStore } from "@/store/useSelectionStore"
import { ToolsPanel } from "@/components/panels/tools-panel"
import { ModesPanel } from "@/components/panels/modes-panel"
import { ImportPanel } from "@/components/panels/import-panel"
import { ElementSettingsPanel } from "@/components/panels/element-settings-panel"
import { CodePanel } from "@/components/panels/code-panel"
import { ChainPanel } from "@/components/panels/chain-panel"
import { PerformancePanel } from "@/components/panels/performance-panel"
import { ActionRecordingPanel } from "@/components/panels/action-recording-panel"
import { ChangelogPanel } from "@/components/panels/changelog-panel"
import { AnnouncementPanel } from "@/components/panels/announcement-panel"
import React, { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"

interface RightSidebarProps {
  // ... (interface props aynı kalacak)
  settings?: any
  onSettingsChange?: (settings: any) => void
  currentTool?: any
  onToolChange?: (tool: any) => void
  modes?: any
  onModesChange?: (modes: any) => void
  modeSettings?: any
  onModeSettingsChange?: (settings: any) => void
  currentLayer?: any
  onUpdateLayer?: (layerId: string, updates: any) => void
  layers?: any[]
  onShowCode?: () => void
  updateSelectedElementsParticle?: (particle: string) => void
  updateSelectedElementsColor?: (color: string) => void
  generatedCode?: string
  onGenerateCode?: (optimize?: boolean) => Promise<void>
  isGeneratingCode?: boolean
  onFrameSettingsChange?: (mode: "auto" | "manual", frameCount?: number) => void
  optimize?: boolean
  setOptimize?: (v: boolean) => void
  chainSequence?: string[]
  onChainSequenceChange?: (sequence: string[]) => void
  selectedElementIds?: string[] // Optional - will use store if not provided
  chainItems?: any[]
  onChainItemsChange?: (items: any[]) => void
  currentLineCount?: number
  onOptimize?: (settings: any) => void
  onApplyTemplate?: (template: string) => void
  isRecording?: boolean
  onToggleRecording?: () => void
  activeTabOverride?: number
  onTabChange?: (tabIndex: number) => void
  forceExpand?: boolean
}

// --- ANIMATION VARIANTS ---

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

const containerVariants: Variants = {
  expanded: {
    width: 550,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  collapsed: {
    width: 60,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

const panelVariants: Variants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2, ease: "easeIn" } },
}

const contentVariants: Variants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      delay: 0.1,
    },
  },
  hidden: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export function RightSidebar({
  settings, onSettingsChange, currentTool, onToolChange, modes, onModesChange, modeSettings, onModeSettingsChange,
  currentLayer, onUpdateLayer, layers, onShowCode, updateSelectedElementsParticle, updateSelectedElementsColor, generatedCode, onGenerateCode,
  isGeneratingCode, onFrameSettingsChange, optimize, setOptimize, chainSequence, onChainSequenceChange,
  selectedElementIds: propSelectedElementIds, chainItems, onChainItemsChange, currentLineCount, onOptimize, onApplyTemplate,
  isRecording, onToggleRecording, activeTabOverride, onTabChange, forceExpand
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState(4)
  const [isMinimized, setIsMinimized] = useState(true)
  
  // Use store if prop is not provided
  const selectedElementIdsFromStore = useSelectionStore((state) => state.selectedElementIds)
  const selectedElementIds = propSelectedElementIds ?? selectedElementIdsFromStore

  // Force expand sidebar when forceExpand prop is true
  React.useEffect(() => {
    if (forceExpand) {
      setIsMinimized(false)
    }
  }, [forceExpand])

  const FIXED_WIDTH = 550
  const TAB_BAR_WIDTH = 60

  const currentActiveTab = activeTabOverride !== undefined ? activeTabOverride : activeTab

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex)
    onTabChange?.(tabIndex)
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const baseTabs = [
    { id: "tools", name: "Tools", icon: Wrench },
    { id: "modes", name: "Modes", icon: Zap },
    { id: "import", name: "Import", icon: FolderOpen },
    { id: "element-config", name: "Element Config", icon: Settings },
    { id: "code", name: "Code", icon: Code },
    { id: "performance", name: "Performance", icon: Gauge },
    { id: "announcements", name: "Announcements", icon: Bell },
    { id: "changelog", name: "What's New", icon: Sparkles },
  ]

  const conditionalTabs = []
  if (modes?.chainMode) conditionalTabs.push({ id: "chain", name: "Chain", icon: Link })
  if (modes?.actionRecordingMode) conditionalTabs.push({ id: "recording", name: "Recording", icon: Video })

  const tabs = [...baseTabs, ...conditionalTabs]
  const safeActiveTab = Math.min(currentActiveTab, tabs.length - 1)

  const renderActivePanel = () => {
    const activeTabId = tabs[safeActiveTab]?.id
    switch (activeTabId) {
      case "tools": return <ToolsPanel
        settings={settings}
        onSettingsChange={onSettingsChange}
        currentTool={currentTool}
        onToolChange={onToolChange}
        updateSelectedElementsColor={updateSelectedElementsColor}
        selectedElementIds={selectedElementIds}
      />
      case "modes": return <ModesPanel modes={modes || {}} onModesChange={onModesChange || (() => { })} modeSettings={modeSettings || {}} onModeSettingsChange={onModeSettingsChange || (() => { })} />
      case "import": return <ImportPanel settings={settings || {}} onSettingsChange={onSettingsChange || (() => { })} />
      case "element-config": return <ElementSettingsPanel layers={layers || []} currentLayer={currentLayer} onUpdateLayer={onUpdateLayer || (() => { })} modes={modes || {}} onShowCode={onShowCode || (() => { })} updateSelectedElementsParticle={updateSelectedElementsParticle} updateSelectedElementsColor={updateSelectedElementsColor} />
      case "code": return <CodePanel code={generatedCode || ""} onGenerateCode={onGenerateCode || (() => Promise.resolve())} isGenerating={isGeneratingCode} settings={settings || {}} onSettingsChange={onSettingsChange || (() => { })} layers={layers || []} onUpdateLayer={onUpdateLayer || (() => { })} currentLayer={currentLayer} modes={modes || {}} onFrameSettingsChange={onFrameSettingsChange} optimize={optimize || false} setOptimize={setOptimize || (() => { })} />
      case "chain": return <ChainPanel layers={layers || []} currentLayerId={currentLayer?.id || null} chainSequence={chainSequence || []} onChainSequenceChange={onChainSequenceChange || (() => { })} selectedElementIds={selectedElementIds || []} chainItems={chainItems || []} onChainItemsChange={onChainItemsChange || (() => { })} />
      case "recording": return <ActionRecordingPanel />
      case "performance": return <PerformancePanel currentLineCount={currentLineCount || 0} onOptimize={onOptimize || (() => { })} onApplyTemplate={onApplyTemplate || (() => { })} />
      case "announcements": return <AnnouncementPanel />
      case "changelog": return <ChangelogPanel />
      default: return <div className="text-center text-gray-500 py-8">Select a panel</div>
    }
  }

  return (
    <motion.div
      className="fixed top-4 right-4 bottom-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 flex z-30 overflow-hidden"
      variants={containerVariants}
      initial="expanded"
      animate={isMinimized ? "collapsed" : "expanded"}
    >
      {/* SOL: Panel İçeriği */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isMinimized && (
            <motion.div
              className="absolute top-0 left-0 h-full w-[490px] flex flex-col bg-white dark:bg-zinc-950"
              variants={contentVariants}
              initial="visible"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100">{tabs[safeActiveTab]?.name}</h2>
              </motion.div>
              <motion.div
                className="flex-1 overflow-y-auto p-6 scrollbar-hidden panel-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={safeActiveTab}
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {renderActivePanel()}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SAĞ: Dikey Sekmeler */}
      <div className="flex flex-col items-center py-4 space-y-2 bg-gray-50 dark:bg-zinc-900/60 border-l border-gray-200 dark:border-zinc-800" style={{ width: `${TAB_BAR_WIDTH}px` }}>
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              onClick={() => handleTabChange(index)}
              className={`h-10 w-10 rounded-xl transition-all duration-200 ${index === safeActiveTab
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-md border dark:border-zinc-700"
                : "text-gray-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 hover:shadow-sm"
                }`}
            >
              <Icon size={20} />
            </Button>
          )
        })}

        {/* Ayırıcı Çizgi */}
        <div className="w-8 h-px bg-gray-300 dark:bg-zinc-800 my-2" />

        {/* Küçült/Büyüt Butonu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(!isMinimized)}
          className="h-10 w-10 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 hover:shadow-sm transition-all duration-200"
        >
          {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
        </Button>
      </div>
    </motion.div>
  )
}