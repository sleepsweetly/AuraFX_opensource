"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {

  Download,
  Upload,
  Zap,
  ZapOff,
  Send,
  Hexagon,



  ChevronDown,
  FileText,
  FolderOpen,
  Plus,
  BookOpen
} from "lucide-react"
import { use3DStore } from "../store/use3DStore"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useLayerStore } from "@/store/useLayerStore"
import { motion, AnimatePresence, Variants } from "framer-motion"

interface TopToolbarProps {
  useOptimizedRenderer?: boolean
  setUseOptimizedRenderer?: (v: boolean) => void
  onNewProject?: () => void
  onSave?: () => void
  onLoad?: () => void
}

export function TopToolbar({
  useOptimizedRenderer,
  setUseOptimizedRenderer,
  onNewProject,
  onSave,
  onLoad
}: TopToolbarProps) {
  const router = useRouter()
  const {
    exportToMythicMobs,
  } = use3DStore()

  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])
  const [showSendModal, setShowSendModal] = useState(false)
  const [simpleTransfer, setSimpleTransfer] = useState(false)

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const mainLayers = useLayerStore((state) => state.layers)
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
      const { exportToMainSystem } = use3DStore.getState();
      const elements = exportToMainSystem();

      console.log('Exported elements:', elements);
      console.log('Elements count:', elements.length);

      if (elements.length > 0) {
        const transferData = {
          elements,
          layers: [],
          clearExisting: simpleTransfer,
          timestamp: Date.now(),
          layerNames: selectedLayerIds
        };

        sessionStorage.setItem('aurafx-3d-transfer', JSON.stringify(transferData));
        console.log('Transfer data saved to sessionStorage');

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

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: 0.1,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  }

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -5, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.1,
        ease: "easeOut",
        staggerChildren: 0.02,
        when: "beforeChildren"
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: { duration: 0.08, ease: "easeIn" }
    }
  }

  const dropdownItemVariants: Variants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.08,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      className="fixed top-4 left-4 z-40"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center gap-2 bg-black/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20"
        whileHover={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.2 }
        }}
      >
        {/* Logo & Brand */}
        <motion.div
          className="flex items-center gap-2"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white cursor-pointer"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => router.push("/")}
          >
            <Hexagon className="h-4 w-4 text-black fill-black" />
          </motion.div>
          <span className="text-sm font-semibold text-white">AuraFX</span>
          <span className="text-xs text-white/60">3D</span>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-px h-4 bg-white/30 mx-1"
          variants={itemVariants}
        />

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewProject}
            className="h-8 gap-1 hover:bg-white/10 text-white/80 hover:text-white relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("new")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div
              className="absolute inset-0 bg-white/10 z-0"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "new" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <Plus className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "new" ? 'text-white' : 'text-white/80'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "new" ? 'text-white' : 'text-white/80'}`}>New</span>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-8 gap-1 hover:bg-white/10 text-white/80 hover:text-white relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("save")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div
              className="absolute inset-0 bg-white/10 z-0"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "save" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <FileText className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "save" ? 'text-white' : 'text-white/80'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "save" ? 'text-white' : 'text-white/80'}`}>Save</span>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoad}
            className="h-8 gap-1 hover:bg-white/10 text-white/80 hover:text-white relative overflow-hidden group"
            onMouseEnter={() => setHoveredItem("open")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div
              className="absolute inset-0 bg-white/10 z-0"
              initial={{ width: "0%" }}
              animate={{ width: hoveredItem === "open" ? "100%" : "0%" }}
              transition={{ duration: 0.2 }}
            />
            <FolderOpen className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "open" ? 'text-white' : 'text-white/80'}`} />
            <span className={`text-xs relative z-10 transition-colors duration-200 ${hoveredItem === "open" ? 'text-white' : 'text-white/80'}`}>Open</span>
          </Button>
        </motion.div>



        {/* More Menu */}
        <motion.div variants={itemVariants}>
          <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 hover:bg-white/10 text-white/80 hover:text-white relative overflow-hidden group"
                onMouseEnter={() => setHoveredItem("more")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  className="absolute inset-0 bg-white/10 z-0"
                  initial={{ width: "0%" }}
                  animate={{ width: hoveredItem === "more" ? "100%" : "0%" }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  animate={{ rotate: isMoreMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={`h-3 w-3 relative z-10 transition-colors duration-200 ${hoveredItem === "more" ? 'text-white' : 'text-white/80'}`} />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {isMoreMenuOpen && (
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-black/95 backdrop-blur-md border border-white/20 shadow-xl text-white"
                  sideOffset={8}
                  asChild
                  forceMount
                >
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="px-2 py-1.5 text-xs font-semibold text-white/60 uppercase tracking-wide">
                      Actions
                    </div>
                    <DropdownMenuItem
                      className="text-white cursor-pointer flex items-center gap-2 p-2 hover:bg-white/10"
                      onClick={handleImport}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-medium">Import OBJ</div>
                          <div className="text-xs text-white/50">Import 3D models</div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white cursor-pointer flex items-center gap-2 p-2 hover:bg-white/10"
                      onClick={handleExportMythicMobs}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="font-medium">Export</div>
                          <div className="text-xs text-white/50">Export to MythicMobs</div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>


                    <div className="px-2 py-1.5 text-xs font-semibold text-white/60 uppercase tracking-wide border-t border-white/10 mt-1">
                      Help & Info
                    </div>

                    <DropdownMenuItem
                      className="text-white cursor-pointer flex items-center gap-2 p-2 hover:bg-white/10"
                      onClick={() => window.location.href = '/wiki'}
                      asChild
                    >
                      <motion.div
                        variants={dropdownItemVariants}
                        whileHover={{ x: 5 }}
                        className="w-full"
                      >
                        <BookOpen className="w-4 h-4 text-green-400" />
                        Wiki
                      </motion.div>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>
        </motion.div>

        {/* Performance & VR Toggle */}
        {setUseOptimizedRenderer && (
          <motion.div variants={itemVariants}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseOptimizedRenderer(!useOptimizedRenderer)}
              className={`h-8 gap-1 transition-all duration-200 ${useOptimizedRenderer
                ? "bg-white/10 text-white hover:bg-white/15"
                : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              title={`Optimized Renderer: ${useOptimizedRenderer ? "ON" : "OFF"}`}
            >
              {useOptimizedRenderer ? <Zap className="h-3 w-3" /> : <ZapOff className="h-3 w-3" />}
              <span className="text-xs">{useOptimizedRenderer ? "Fast" : "Quality"}</span>
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

              {/* Simple Transfer Option */}
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
    </motion.div>
  )
}