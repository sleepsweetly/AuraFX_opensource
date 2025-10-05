"use client"

import { Button } from "@/components/ui/button"
import {
  MousePointer,
  Move3D,
  Grid3X3,
  Axis3D,
  Download,
  Upload,
  Zap,
  ZapOff,
  Send,
  Hexagon,
  Rotate3D,
  Maximize2,
  Play,
  Monitor,
  HelpCircle,
} from "lucide-react"
import { use3DStore } from "../store/use3DStore"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useLayerStore } from "@/store/useLayerStore"
import { motion, AnimatePresence } from "framer-motion"

export function TopToolbar({
  vrMode,
  setVRMode,
  onShowTutorial,
  useOptimizedRenderer,
  setUseOptimizedRenderer
}: {
  vrMode: boolean,
  setVRMode: (v: boolean) => void,
  onShowTutorial?: () => void,
  useOptimizedRenderer?: boolean,
  setUseOptimizedRenderer?: (v: boolean) => void
}) {
  const router = useRouter()
  const {
    currentTool,
    setCurrentTool,
    scene,
    updateScene,
    exportToMythicMobs,
  } = use3DStore()



  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])
  const [showSendModal, setShowSendModal] = useState(false)
  const [simpleTransfer, setSimpleTransfer] = useState(false) // Sade geçiş seçeneği

  const mainLayers = useLayerStore((state) => state.layers) // 2D editördeki katmanlar

  // 3D editördeki katmanları al
  const threeDLayers = use3DStore((state) => state.layers)
  const threeDShapes = use3DStore((state) => state.shapes)



  const handleExportMythicMobs = () => {
    const data = exportToMythicMobs()
    const blob = new Blob([data], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mythicmobs_skill.yml"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".obj"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (content) {
            use3DStore.getState().importOBJ(content)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleSendToMain = () => {
    setShowSendModal(true);
  }



  const handleSendElements = () => {
    console.log('=== 3D->2D TRANSFER ===');

    try {
      // 3D store'dan elementleri export et
      const { exportToMainSystem } = use3DStore.getState();
      const elements = exportToMainSystem();

      console.log('Exported elements:', elements);
      console.log('Elements count:', elements.length);

      if (elements.length > 0) {
        // TransferUtils kullanarak veri sakla
        const transferData = {
          elements,
          layers: [], // 3D'den layer yapısı gönderilmiyor
          clearExisting: simpleTransfer,
          timestamp: Date.now(),
          layerNames: selectedLayerIds
        };

        // SessionStorage'a kaydet
        sessionStorage.setItem('aurafx-3d-transfer', JSON.stringify(transferData));
        console.log('Transfer data saved to sessionStorage');

        // Ana sayfaya yönlendir
        window.location.href = "/";
      } else {
        console.log('No elements to transfer to 2D editor');
        alert('No elements found to transfer to 2D editor');
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed: ' + error);
    }

    setShowSendModal(false);
    setSelectedLayerIds([]);
    setSimpleTransfer(false);
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="header-actions h-16 w-full flex items-center justify-between px-6 lg:px-8 select-none backdrop-blur-sm fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Left Section - Logo & Branding */}
      <motion.div
        className="flex items-center gap-3 min-w-fit"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="w-8 h-8 text-white cursor-pointer"
          whileHover={{ rotate: 180, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => router.push("/")}
        >
          <Hexagon className="w-full h-full" />
        </motion.div>

        <motion.span
          className="text-xl font-bold text-white tracking-tight cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          onClick={() => router.push("/")}
        >
          AuraFX
        </motion.span>

        <motion.span
          className="text-sm text-white/60 font-medium ml-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          3D Editor
        </motion.span>
      </motion.div>

      {/* Center Section - 3D Tools */}
      <motion.div
        className="flex items-center gap-2 mx-auto"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {/* 3D Specific Tools */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          {/* Tool Selection */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => setCurrentTool("select")}
              className={`h-8 w-8 p-0 rounded-md transition-all ${currentTool === "select" ? "bg-white text-black" : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"}`}
              title="Select Tool (Q)"
            >
              <MousePointer className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => setCurrentTool("move")}
              className={`h-8 w-8 p-0 rounded-md transition-all ${currentTool === "move" ? "bg-white text-black" : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"}`}
              title="Move Tool (W)"
            >
              <Move3D className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => setCurrentTool("rotate")}
              className={`h-8 w-8 p-0 rounded-md transition-all ${currentTool === "rotate" ? "bg-white text-black" : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"}`}
              title="Rotate Tool (E)"
            >
              <Rotate3D className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => setCurrentTool("scale")}
              className={`h-8 w-8 p-0 rounded-md transition-all ${currentTool === "scale" ? "bg-white text-black" : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"}`}
              title="Scale Tool (R)"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => updateScene({ showGrid: !scene.showGrid })}
              className={`h-8 w-8 p-0 rounded-md transition-all ${scene.showGrid ? "bg-white text-black" : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"}`}
              title="Toggle Grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => updateScene({ showAxes: !scene.showAxes })}
              className={`h-8 w-8 p-0 rounded-md transition-all ${scene.showAxes ? "bg-white text-black" : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"}`}
              title="Toggle Axes"
            >
              <Axis3D className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section - Action Buttons */}
      <motion.div
        className="flex items-center gap-2 ml-auto"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {/* Performance Mode Toggle */}
        {setUseOptimizedRenderer && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUseOptimizedRenderer(!useOptimizedRenderer)}
              className={`rounded-lg w-10 h-10 border transition-all duration-200 ${useOptimizedRenderer
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              title={`Optimized Renderer: ${useOptimizedRenderer ? "ON" : "OFF"}`}
            >
              {useOptimizedRenderer ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
            </Button>
          </motion.div>
        )}

        {/* File Operations */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-white/20"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Import</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMythicMobs}
            className="rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-white/20"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </motion.div>

        {/* Play Mode Toggle */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVRMode(!vrMode)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${vrMode
                ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white hover:border-white/20"
              }`}
            title={vrMode ? "Exit Play Mode" : "Enter Play Mode"}
          >
            {vrMode ? (
              <Monitor className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            <span className="hidden md:inline">{vrMode ? "Exit Play" : "Play Mode"}</span>
          </Button>
        </motion.div>

        {/* Send to Main - Primary Action */}
        <motion.button
          onClick={handleSendToMain}
          className="relative rounded-lg bg-white text-black px-6 py-2 text-sm font-semibold transition-all duration-200 hover:bg-white/90 overflow-hidden group"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.15 }
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.1 }
          }}
        >
          {/* Button content */}
          <div className="relative flex items-center justify-center">
            <Send className="h-4 w-4 mr-2" />
            <span className="hidden md:inline font-semibold">Send to 2D</span>
            <span className="md:hidden font-semibold">Send</span>
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"></div>
        </motion.button>

        {/* Help Button */}
        {onShowTutorial && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowTutorial}
              className="rounded-lg w-10 h-10 border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 hover:border-white/20"
              title="Show Tutorial"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
      {/* Send Modal - Multi Layer Selection */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              minWidth: '100vw'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#111] rounded-2xl p-8 w-full max-w-md relative shadow-2xl border border-white/10 mx-4 my-auto"
              style={{
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: 'auto'
              }}
            >
              <button
                onClick={() => {
                  setShowSendModal(false)
                  setSelectedLayerIds([])
                  setSimpleTransfer(false)
                }}
                className="absolute top-3 right-3 text-white text-2xl font-bold hover:opacity-70 transition-opacity"
              >
                ×
              </button>

              <h2 className="text-xl font-bold text-white mb-2">Send to 2D Editor</h2>
              <p className="text-white/60 text-sm mb-4">Your 3D layers will be exported to 2D editor</p>

              {/* Sade Geçiş Seçeneği */}
              <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simpleTransfer}
                    onChange={(e) => setSimpleTransfer(e.target.checked)}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">Simple Transfer</div>
                    <div className="text-white/50 text-xs">
                      {simpleTransfer
                        ? "Clear existing elements and add only 3D elements"
                        : "Add 3D elements to existing elements"}
                    </div>
                  </div>
                </label>
              </div>

              {/* 3D Layers to Export */}
              <div className="mb-4">
                <h3 className="text-white font-medium mb-2">3D Layers to Export:</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {threeDShapes.filter(shape => shape.type === 'imported').map(shape => (
                    <div key={shape.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{shape.name || `Shape ${shape.id}`}</div>
                        <div className="text-white/50 text-xs">{shape.vertices.length} elements</div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: shape.color || '#ffffff' }}
                      />
                    </div>
                  ))}
                  {threeDLayers.filter(layer => layer.id !== 'default').map(layer => (
                    <div key={layer.id} className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{layer.name}</div>
                        <div className="text-white/50 text-xs">{layer.elements?.length || 0} elements</div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: layer.color }}
                      />
                    </div>
                  ))}
                  {threeDShapes.filter(shape => shape.type === 'imported').length === 0 && threeDLayers.filter(layer => layer.id !== 'default').length === 0 && (
                    <div className="text-white/50 text-sm p-2 text-center">
                      No 3D layers to export
                    </div>
                  )}
                </div>
              </div>

              {/* Target Selection for 2D */}
              <div className="mb-4">
                <h3 className="text-white font-medium mb-2">Target 2D Layers (Optional):</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {mainLayers.map(layer => (
                    <label key={layer.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedLayerIds.includes(layer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLayerIds(prev => [...prev, layer.id])
                          } else {
                            setSelectedLayerIds(prev => prev.filter(id => id !== layer.id))
                          }
                        }}
                        className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{layer.name}</div>
                        <div className="text-white/50 text-xs">{layer.elements?.length || 0} elements</div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: layer.color }}
                      />
                    </label>
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-2">
                  If no target layers selected, new layers will be created automatically
                </p>
              </div>

              {selectedLayerIds.length > 0 && (
                <div className="text-sm text-white/70 mb-4">
                  {selectedLayerIds.length} target layer{selectedLayerIds.length > 1 ? 's' : ''} selected
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSendModal(false)
                    setSelectedLayerIds([])
                    setSimpleTransfer(false)
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-medium border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendElements}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors font-medium"
                >
                  Export to 2D
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
