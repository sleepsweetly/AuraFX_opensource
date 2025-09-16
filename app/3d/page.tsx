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