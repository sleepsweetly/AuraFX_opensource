"use client"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { KeyboardShortcuts } from "./components/KeyboardShortcuts"
import { TopToolbar } from "./components/TopToolbar"
import { LeftSidebar } from "./components/LeftSidebar"

import { Scene3DEditorVR } from "./components/Scene3DEditorVR"
import Tutorial3D from "./components/Tutorial3D"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { use3DStore } from "./store/use3DStore"
import { useTransferStore } from "@/store/useTransferStore"

const Scene3DEditor = dynamic(() => import("./components/Scene3DEditor").then(mod => mod.Scene3DEditor), { ssr: false })
const OptimizedScene3D = dynamic(() => import("./components/OptimizedScene3D").then(mod => mod.OptimizedScene3D), { ssr: false })

export default function ThreeDEditor() {
  const [vrMode, setVRMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [useOptimizedRenderer, setUseOptimizedRenderer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if tutorial has been completed before
    const tutorialDone = localStorage.getItem("tutorial3DDone");
    if (!tutorialDone) {
      setShowTutorial(true);
    }

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

    window.addEventListener('showPerformanceNotification', handlePerformanceNotification as EventListener);
    
    return () => {
      window.removeEventListener('showPerformanceNotification', handlePerformanceNotification as EventListener);
    };
  }, [toast]);

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {!vrMode && <KeyboardShortcuts />}
      
      {/* Fixed Top Toolbar */}
      <TopToolbar
        vrMode={vrMode}
        setVRMode={setVRMode}
        onShowTutorial={() => setShowTutorial(true)}
        useOptimizedRenderer={useOptimizedRenderer}
        setUseOptimizedRenderer={setUseOptimizedRenderer}
      />
      
      {/* Main Content Area - Below Toolbar */}
      <div className="flex flex-1 mt-16">
        {/* Left Sidebar - Fixed Width */}
        <div className="w-64 flex-shrink-0">
          <LeftSidebar />
        </div>
        
        {/* Center Scene Area - Flexible */}
        <div className="flex-1 relative">
          {vrMode ? (
            <Scene3DEditorVR />
          ) : useOptimizedRenderer ? (
            <OptimizedScene3D />
          ) : (
            <Scene3DEditor />
          )}
        </div>
      </div>

      {/* 3D Tutorial */}
      {showTutorial && (
        <Tutorial3D onClose={() => setShowTutorial(false)} />
      )}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
} 