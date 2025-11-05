"use client"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { KeyboardShortcuts } from "./components/KeyboardShortcuts"
import { TopToolbar } from "./components/TopToolbar"
import { LeftSidebar } from "./components/LeftSidebar"
import { BottomStatusBar3D } from "./components/BottomStatusBar3D"
import { RightToolbar3D } from "./components/RightToolbar3D"
import { SendTo2DButton } from "./components/SendTo2DButton"


import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { use3DStore } from "./store/use3DStore"
import { useTransferStore } from "@/store/useTransferStore"
import Tutorial3D from "./components/Tutorial3D"
import { HelpCircle } from "lucide-react"

const Scene3DEditor = dynamic(() => import("./components/Scene3DEditor").then(mod => mod.Scene3DEditor), { ssr: false })
const OptimizedScene3D = dynamic(() => import("./components/OptimizedScene3D").then(mod => mod.OptimizedScene3D), { ssr: false })

// Global tip tanımı
declare global {
  interface Window {
    _zoomCamera?: {
      zoomIn: () => void
      zoomOut: () => void
    }
  }
}

export default function ThreeDEditor() {

  const [useOptimizedRenderer, setUseOptimizedRenderer] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showTutorial, setShowTutorial] = useState(false);
  const { toast } = useToast();

  // 3D store'dan object sayısını al
  const { shapes, vertices } = use3DStore();
  const objectCount = shapes.length + Array.from(vertices.values()).filter(v => !v.groupId).length;

  // Mouse zoom event'lerini dinle
  useEffect(() => {
    const handleZoomChange = (event: CustomEvent) => {
      const { zoomLevel: newZoomLevel } = event.detail;
      setZoomLevel(Math.round(newZoomLevel));
    };

    window.addEventListener('3d-zoom-change', handleZoomChange as EventListener);

    return () => {
      window.removeEventListener('3d-zoom-change', handleZoomChange as EventListener);
    };
  }, []);

  useEffect(() => {


    // Check for transfer data from global store
    const { transferData, hasTransferData, clearTransferData } = useTransferStore.getState()

    if (hasTransferData() && transferData) {
      console.log('3D Page: Found transfer data, importing...', transferData)
      const { importLayersFromMainSystem } = use3DStore.getState()

      // Import layers instead of just elements
      importLayersFromMainSystem(transferData.layers, transferData.clearExisting)

      toast({
        title: "Layers Imported",
        description: `Successfully imported ${transferData.layers.length} layers with ${transferData.elements.length} elements`,
        duration: 4000,
      });

      // Clear transfer data after successful import
      clearTransferData()
    }

    // Also check URL parameters as fallback
    const urlParams = new URLSearchParams(window.location.search)
    const transferParam = urlParams.get('transfer')

    if (transferParam) {
      try {
        const decodedData = JSON.parse(atob(transferParam))
        const { layers, elements, clearExisting } = decodedData

        console.log('3D Page: Found URL transfer data, importing...', layers || elements)
        const { importLayersFromMainSystem, importFromMainSystem } = use3DStore.getState()

        if (layers && layers.length > 0) {
          // Import layers if available
          importLayersFromMainSystem(layers, clearExisting)
          toast({
            title: "Layers Imported",
            description: `Successfully imported ${layers.length} layers from URL`,
            duration: 3000,
          });
        } else if (elements && elements.length > 0) {
          // Fallback to elements only
          importFromMainSystem(elements, clearExisting)
          toast({
            title: "Data Imported",
            description: `Successfully imported ${elements.length} elements from URL`,
            duration: 3000,
          });
        }

        // Clean URL
        window.history.replaceState({}, '', '/3d')

      } catch (error) {
        console.error('Failed to parse URL transfer data:', error)
      }
    }

    // Listen for performance notifications
    const handlePerformanceNotification = (event: CustomEvent) => {
      toast({
        title: "Performance Mode Enabled",
        description: event.detail.message,
        duration: 5000,
      });
    };

    // Listen for duplicate notifications
    const handleDuplicateNotification = (event: CustomEvent) => {
      toast({
        title: "Objects Duplicated",
        description: event.detail.message,
        duration: 3000,
      });
    };

    window.addEventListener('showPerformanceNotification', handlePerformanceNotification as EventListener);
    window.addEventListener('showDuplicateNotification', handleDuplicateNotification as EventListener);

    return () => {
      window.removeEventListener('showPerformanceNotification', handlePerformanceNotification as EventListener);
      window.removeEventListener('showDuplicateNotification', handleDuplicateNotification as EventListener);
    };
  }, [toast]);

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      <KeyboardShortcuts />

      {/* Fixed Top Toolbar */}
      <TopToolbar
        useOptimizedRenderer={useOptimizedRenderer}
        setUseOptimizedRenderer={setUseOptimizedRenderer}
        onNewProject={() => {
          // 3D için yeni proje fonksiyonu
          const { clearScene } = use3DStore.getState()
          clearScene()
        }}
        onSave={() => {
          // 3D için kaydetme fonksiyonu
          const { exportScene } = use3DStore.getState()
          const sceneData = exportScene()
          const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "aurafx-3d-scene.json"
          a.click()
          URL.revokeObjectURL(url)
        }}
        onLoad={() => {
          // 3D için yükleme fonksiyonu
          const input = document.createElement("input")
          input.type = "file"
          input.accept = ".json"
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                try {
                  const content = e.target?.result as string
                  const sceneData = JSON.parse(content)
                  const { importScene } = use3DStore.getState()
                  importScene(sceneData)
                } catch (error) {
                  console.error('Failed to load scene:', error)
                  alert('Failed to load scene file')
                }
              }
              reader.readAsText(file)
            }
          }
          input.click()
        }}
        onShowTutorial={() => {
          localStorage.removeItem("tutorial3D_completed")
          setShowTutorial(true)
        }}
      />

      {/* Main Content Area - Full Screen */}
      <div className="flex flex-1 relative">
        {/* Center Scene Area - Full Width */}
        <div className="flex-1 relative">
          {useOptimizedRenderer ? (
            <OptimizedScene3D />
          ) : (
            <Scene3DEditor />
          )}
        </div>

        {/* Left Sidebar - Overlay */}
        {showSidebar && (
          <LeftSidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        )}

        {/* Right Toolbar - 3D Tools */}
        <RightToolbar3D />

        {/* Send to 2D Button */}
        <SendTo2DButton />

        {/* Bottom Status Bar */}
        <BottomStatusBar3D
          onLayersClick={() => setShowSidebar(!showSidebar)}
          onZoomIn={() => {
            // 3D kamera zoom in
            if (window._zoomCamera) {
              window._zoomCamera.zoomIn()
            }
            // UI zoom level'ı da güncelle
            setZoomLevel(prev => Math.min(prev + 10, 200))
          }}
          onZoomOut={() => {
            // 3D kamera zoom out
            if (window._zoomCamera) {
              window._zoomCamera.zoomOut()
            }
            // UI zoom level'ı da güncelle
            setZoomLevel(prev => Math.max(prev - 10, 50))
          }}
          zoomLevel={zoomLevel}
          objectCount={objectCount}
        />
      </div>



      {/* Toast Notifications */}
      <Toaster />

      {/* Tutorial Widget for 3D Editor */}
      {showTutorial && (
        <Tutorial3D
          onComplete={() => {
            console.log("3D Tutorial completed!")
            setShowTutorial(false)
          }}
          onSkip={() => {
            console.log("3D Tutorial skipped")
            setShowTutorial(false)
          }}
          storageKey="tutorial3D_completed"
        />
      )}
    </div>
  )
} 