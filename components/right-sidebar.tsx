"use client"

import { Wrench, Zap, FolderOpen, Settings, Code, Link, Video, Gauge, MousePointer, Pencil, Circle, Square, Triangle, Minus, Eraser, Palette } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import { ModesPanel } from "@/components/panels/modes-panel"
import { ImportPanel } from "@/components/panels/import-panel"
import { ElementSettingsPanel } from "@/components/panels/element-settings-panel"
import { CodePanel } from "@/components/panels/code-panel"
import { ChainPanel } from "@/components/panels/chain-panel"
import { PerformancePanel } from "@/components/panels/performance-panel"
import { ActionRecordingPanel } from "@/components/panels/action-recording-panel"
import { useState, useRef, useEffect } from "react"


interface RightSidebarProps {
  // Panel props will be passed from parent
  settings?: any
  onSettingsChange?: (settings: any) => void
  currentTool?: any
  onToolChange?: (tool: any) => void
  // Modes panel props
  modes?: any
  onModesChange?: (modes: any) => void
  modeSettings?: any
  onModeSettingsChange?: (settings: any) => void
  // Settings panel props
  currentLayer?: any
  onUpdateLayer?: (layerId: string, updates: any) => void
  // Element settings panel props
  layers?: any[]
  onShowCode?: () => void
  updateSelectedElementsParticle?: (particle: string) => void
  // Code panel props
  generatedCode?: string
  onGenerateCode?: (optimize?: boolean) => Promise<void>
  isGeneratingCode?: boolean
  onFrameSettingsChange?: (mode: "auto" | "manual", frameCount?: number) => void
  optimize?: boolean
  setOptimize?: (v: boolean) => void
  // Chain panel props
  chainSequence?: string[]
  onChainSequenceChange?: (sequence: string[]) => void
  selectedElementIds?: string[]
  chainItems?: any[]
  onChainItemsChange?: (items: any[]) => void
  // Performance panel props
  currentLineCount?: number
  onOptimize?: (settings: any) => void
  onApplyTemplate?: (template: string) => void
  // Action recording panel props
  isRecording?: boolean
  onToggleRecording?: () => void
  // Tab control
  activeTabOverride?: number
  onTabChange?: (tabIndex: number) => void
}

// Tools Panel Component - Clean & Simple Design
function ToolsPanel({ settings, onSettingsChange, currentTool, onToolChange }: {
  settings: any,
  onSettingsChange: any,
  currentTool?: any,
  onToolChange?: (tool: any) => void
}) {
  const tools = [
    { id: "select", name: "Select", icon: MousePointer },
    { id: "free", name: "Brush", icon: Pencil },
    { id: "circle", name: "Circle", icon: Circle },
    { id: "square", name: "Square", icon: Square },
    { id: "triangle", name: "Triangle", icon: Triangle },
    { id: "line", name: "Line", icon: Minus },
    { id: "eraser", name: "Eraser", icon: Eraser }
  ]

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-md">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Drawing Tools</h3>
            <p className="text-xs text-gray-500">Create and edit elements</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="flex-shrink-0 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange?.(tool.id)}
              className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${currentTool === tool.id
                ? "border-gray-800 bg-gray-800 text-white shadow-lg"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
            >
              <tool.icon className={`w-4 h-4 ${currentTool === tool.id ? "text-white" : "text-gray-600"
                }`} />
              <span className={`text-[10px] font-medium ${currentTool === tool.id ? "text-white" : "text-gray-600"
                }`}>
                {tool.name}
              </span>

              {currentTool === tool.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Section */}
      <div className="flex-shrink-0 mb-6">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-900">Color</h4>
          </div>
          <ColorPicker
            value={settings?.color || "#000000"}
            onChange={(color) => onSettingsChange?.({ ...settings, color })}
            className="w-full"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-900">Settings</h4>
          </div>

          <div className="space-y-4">
            {/* Snap to Grid */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Snap to Grid</div>
                <div className="text-xs text-gray-500">Align elements to grid</div>
              </div>
              <button
                onClick={() => onSettingsChange?.({ ...settings, snapToGridMode: !settings?.snapToGridMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings?.snapToGridMode
                  ? 'bg-gray-800'
                  : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${settings?.snapToGridMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Grid Size */}
            {settings?.snapToGridMode && (
              <div className="pl-4 space-y-3 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Grid Size</span>
                  <span className="text-xs bg-white text-gray-700 px-2 py-1 rounded-lg font-mono border border-gray-200">
                    {settings?.gridSize || 20}px
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={settings?.gridSize || 20}
                  onChange={(e) => onSettingsChange?.({ ...settings, gridSize: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #374151 0%, #374151 ${((settings?.gridSize || 20) - 5) / 95 * 100}%, #e5e7eb ${((settings?.gridSize || 20) - 5) / 95 * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            )}

            {/* Mirror Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Mirror Mode</div>
                <div className="text-xs text-gray-500">Symmetric drawing</div>
              </div>
              <button
                onClick={() => onSettingsChange?.({ ...settings, mirrorMode: !settings?.mirrorMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings?.mirrorMode
                  ? 'bg-gray-800'
                  : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${settings?.mirrorMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RightSidebar({
  settings,
  onSettingsChange,
  currentTool,
  onToolChange,
  modes,
  onModesChange,
  modeSettings,
  onModeSettingsChange,
  currentLayer,
  onUpdateLayer,
  layers,
  onShowCode,
  updateSelectedElementsParticle,
  generatedCode,
  onGenerateCode,
  isGeneratingCode,
  onFrameSettingsChange,
  optimize,
  setOptimize,
  chainSequence,
  onChainSequenceChange,
  selectedElementIds,
  chainItems,
  onChainItemsChange,
  currentLineCount,
  onOptimize,
  onApplyTemplate,
  isRecording,
  onToggleRecording,
  activeTabOverride,
  onTabChange
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState(4) // Code panel'ini default olarak aç

  // External tab control
  const currentActiveTab = activeTabOverride !== undefined ? activeTabOverride : activeTab

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex)
    onTabChange?.(tabIndex)
  }

  const [width, setWidth] = useState(500)
  const [isResizing, setIsResizing] = useState(false)
  const [hoveredTab, setHoveredTab] = useState<number | null>(null)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  // Base tabs that are always visible
  const baseTabs = [
    { id: "tools", name: "Tools", icon: Wrench },
    { id: "modes", name: "Modes", icon: Zap },
    { id: "import", name: "Import", icon: FolderOpen },
    { id: "element-config", name: "Element Config", icon: Settings },
    { id: "code", name: "Code", icon: Code },
    { id: "performance", name: "Performance", icon: Gauge }
  ]

  // Conditional tabs based on active modes
  const conditionalTabs = []

  // Add Chain tab only if chainMode is active
  if (modes?.chainMode) {
    conditionalTabs.push({ id: "chain", name: "Chain", icon: Link })
  }

  // Add Recording tab only if actionRecordingMode is active
  if (modes?.actionRecordingMode) {
    conditionalTabs.push({ id: "recording", name: "Recording", icon: Video })
  }

  const tabs = [...baseTabs, ...conditionalTabs]

  // Ensure activeTab is within bounds
  const safeActiveTab = Math.min(currentActiveTab, tabs.length - 1)

  // Update hover style when hoveredTab changes
  useEffect(() => {
    if (hoveredTab !== null) {
      const hoveredElement = tabRefs.current[hoveredTab]
      if (hoveredElement && scrollContainerRef.current) {
        setHoverStyle({
          left: `${hoveredElement.offsetLeft}px`,
          width: `${hoveredElement.offsetWidth}px`,
        })
      }
    }
  }, [hoveredTab])

  // Update active style when activeTab changes
  useEffect(() => {
    const activeElement = tabRefs.current[safeActiveTab]
    if (activeElement && scrollContainerRef.current) {
      setActiveStyle({
        left: `${activeElement.offsetLeft}px`,
        width: `${activeElement.offsetWidth}px`,
      })
    }
  }, [safeActiveTab])

  // Initialize active style on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      const activeElement = tabRefs.current[safeActiveTab]
      if (activeElement && scrollContainerRef.current) {
        setActiveStyle({
          left: `${activeElement.offsetLeft}px`,
          width: `${activeElement.offsetWidth}px`,
        })
      }
    })
  }, [tabs.length, safeActiveTab])

  // Keyboard shortcuts for tab switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      const key = e.key
      if (key >= '1' && key <= '9') {
        const tabIndex = parseInt(key) - 1
        if (tabIndex < tabs.length) {
          e.preventDefault()
          handleTabChange(tabIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tabs.length, handleTabChange])

  const renderActivePanel = () => {
    const activeTabId = tabs[safeActiveTab]?.id

    switch (activeTabId) {
      case "tools":
        return <ToolsPanel
          settings={settings}
          onSettingsChange={onSettingsChange}
          currentTool={currentTool}
          onToolChange={onToolChange}
        />
      case "modes":
        return <ModesPanel
          modes={modes || {}}
          onModesChange={onModesChange || (() => { })}
          modeSettings={modeSettings || {}}
          onModeSettingsChange={onModeSettingsChange || (() => { })}
        />
      case "import":
        return <ImportPanel
          settings={settings || {}}
          onSettingsChange={onSettingsChange || (() => { })}
        />
      case "element-config":
        return <ElementSettingsPanel
          layers={layers || []}
          currentLayer={currentLayer}
          onUpdateLayer={onUpdateLayer || (() => { })}
          modes={modes || {}}
          onShowCode={onShowCode || (() => { })}
          updateSelectedElementsParticle={updateSelectedElementsParticle}
        />
      case "code":
        return (
          <div className="h-full">
            <CodePanel
              code={generatedCode || ""}
              onGenerateCode={onGenerateCode || (() => Promise.resolve())}
              onShowElementSettings={onShowCode}
              isGenerating={isGeneratingCode}
              settings={settings || {
                particleCount: 100,
                shapeSize: 1,
                color: "#ffffff",
                particle: "FLAME",
                alpha: 1,
                repeat: 1,
                yOffset: 0,
                skillName: "MyEffect",
                pngSize: 512,
                objScale: 1,
                performanceMode: false,
                imageColorMode: false,
                frameMode: "auto",
                frameCount: 120
              }}
              onSettingsChange={onSettingsChange || (() => { })}
              layers={layers || []}
              onUpdateLayer={onUpdateLayer || (() => { })}
              currentLayer={currentLayer}
              modes={modes || {
                rotateMode: false,
                rainbowMode: false,
                riseMode: false,
                performanceMode: false,
                localRotateMode: false,
                moveMode: false,
                proximityMode: false,
                staticRainbowMode: false
              }}
              onFrameSettingsChange={onFrameSettingsChange}
              optimize={optimize || false}
              setOptimize={setOptimize || (() => { })}
            />
          </div>
        )
      case "chain":
        console.log('RightSidebar rendering ChainPanel with props:', {
          layersCount: (layers || []).length,
          currentLayerId: currentLayer?.id || null,
          chainSequenceLength: (chainSequence || []).length,
          selectedElementIdsLength: (selectedElementIds || []).length,
          chainItemsLength: (chainItems || []).length,
          chainItemsActual: chainItems,
          hasOnChainItemsChange: !!(onChainItemsChange)
        })
        return (
          <div className="h-full">
            <ChainPanel
              layers={layers || []}
              currentLayerId={currentLayer?.id || null}
              chainSequence={chainSequence || []}
              onChainSequenceChange={onChainSequenceChange || (() => { })}
              selectedElementIds={selectedElementIds || []}
              chainItems={chainItems || []}
              onChainItemsChange={onChainItemsChange || (() => { })}
            />
          </div>
        )
      case "recording":
        return (
          <div className="h-full">
            <ActionRecordingPanel
              isRecording={isRecording || false}
              onToggleRecording={onToggleRecording || (() => { })}
            />
          </div>
        )
      case "performance":
        return (
          <div className="h-full">
            <PerformancePanel
              currentLineCount={currentLineCount || 0}
              onOptimize={onOptimize || (() => { })}
              onApplyTemplate={onApplyTemplate || (() => { })}
            />
          </div>
        )
      default:
        return <div className="text-center text-gray-500 py-8">Select a panel</div>
    }
  }



  const handleMouseDown = () => {
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX
        if (newWidth >= 300 && newWidth <= 800) {
          setWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing])

  return (
    <div
      className="fixed top-4 right-4 h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col z-30 overflow-hidden"
      style={{ width: `${width}px` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors z-50"
        onMouseDown={handleMouseDown}
      />

      <div className="flex items-stretch bg-white px-2 pt-4 pb-3 relative min-h-[60px] z-40">
        <button
          onClick={scrollLeft}
          className="h-8 w-8 bg-gray-50 hover:bg-gray-100 rounded-lg shrink-0 self-center shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center"
          title="Scroll tabs left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth mx-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="relative min-w-max">
            {/* Hover Highlight */}
            <div
              className="absolute top-2 h-[30px] transition-all duration-200 ease-out bg-gray-100/80 rounded-lg flex items-center pointer-events-none"
              style={{
                ...hoverStyle,
                opacity: hoveredTab !== null && hoveredTab !== safeActiveTab ? 1 : 0,
                zIndex: 10,
              }}
            />

            {/* Active Indicator */}
            <div
              className="absolute bottom-0 h-[2px] bg-gray-900 transition-all duration-300 ease-out"
              style={{
                ...activeStyle,
                zIndex: 20,
              }}
            />

            {/* Tabs */}
            <div className="relative flex space-x-[6px] items-center py-2">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  ref={(el) => { tabRefs.current[index] = el }}
                  className={`relative px-3 py-2 cursor-pointer transition-colors duration-200 h-[30px] rounded-lg ${index === safeActiveTab
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                  style={{ zIndex: 30 }}
                  onMouseEnter={() => setHoveredTab(index)}
                  onMouseLeave={() => setHoveredTab(null)}
                  onClick={() => handleTabChange(index)}
                  title={`${tab.name} (Press ${index + 1})`}
                >
                  <div className="text-sm leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    <span className="text-xs opacity-60">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={scrollRight}
          className="h-8 w-8 bg-gray-50 hover:bg-gray-100 rounded-lg shrink-0 self-center shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center"
          title="Scroll tabs right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-4 -mt-px">
        {renderActivePanel()}
      </div>
    </div>
  )
}