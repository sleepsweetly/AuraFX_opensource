"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

export function TutorialDebug() {
  const resetTutorial = () => {
    localStorage.removeItem("aurafx_homepage_tutorial_v1")
    window.location.reload()
  }

  // Sadece development modda göster
  if (process.env.NODE_ENV !== "development") return null

  return (
    <div className="fixed bottom-6 right-6 z-[10001]">
      <Button
        onClick={resetTutorial}
        size="sm"
        variant="outline"
        className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-orange-500/50 hover:bg-orange-50"
      >
        <RotateCcw size={14} className="mr-2" />
        Reset Tutorial
      </Button>
    </div>
  )
}
