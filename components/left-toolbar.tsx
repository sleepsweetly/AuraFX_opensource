"use client"
import { Button } from "@/components/ui/button"
import { Square, LayoutGrid, Circle, Minus, Triangle, MousePointerClick, Eraser, Settings, Trash2, Code } from "lucide-react"
import { useState } from "react"
import type { Tool } from "@/types"

interface LeftToolbarProps {
    currentTool: Tool
    setCurrentTool: (tool: Tool) => void
    onClearCanvas?: () => void
    onShowQuickSettings?: () => void
    onGenerateCode?: () => void
}

export function LeftToolbar({ currentTool, setCurrentTool, onClearCanvas, onShowQuickSettings, onGenerateCode }: LeftToolbarProps) {
    const [showMoreTools, setShowMoreTools] = useState(false)

    const handleToolClick = (tool: string) => {
        console.log("[LeftToolbar] Tool clicked:", tool)

        if (tool === "layout") {
            setShowMoreTools(!showMoreTools)
        } else if (tool === "settings") {
            console.log("[LeftToolbar] Settings clicked")
            onShowQuickSettings?.()
        } else if (tool === "clear") {
            console.log("[LeftToolbar] Clear clicked")
            onClearCanvas?.()
        } else if (tool === "generate") {
            console.log("[LeftToolbar] Generate code clicked")
            onGenerateCode?.()
        } else {
            setShowMoreTools(false)
            // Canvas tool'larını ayarla
            setCurrentTool(tool as Tool)
        }
    }

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 -translate-y-12 z-50 flex gap-3">
            {/* Ana Toolbar - Sadece 4 buton için optimize edilmiş boyut */}
            <div className="flex flex-col gap-1 bg-white rounded-full shadow-lg p-2 border border-gray-200" style={{ width: 'fit-content', height: 'fit-content' }}>
                {/* Select Tool */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("select")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "select" ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <MousePointerClick className="h-4 w-4" />
                </Button>

                {/* Free Draw Tool */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("free")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "free" ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </Button>

                {/* Generate Code Button */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("generate")}
                    className="h-9 w-9 rounded-full hover:bg-green-100 text-gray-700 hover:text-green-600"
                >
                    <Code className="h-4 w-4" />
                </Button>

                {/* Clear Layer Button */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("clear")}
                    className="h-9 w-9 rounded-full hover:bg-red-100 text-gray-700 hover:text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>

                {/* 4 Kare İkonu - More Tools */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("layout")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${showMoreTools ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>

            {/* Genişletilmiş Toolbar - Bağımsız genişlik, 6 buton için optimize */}
            <div
                className={`flex flex-col gap-1.5 bg-white rounded-full shadow-lg p-2.5 border border-gray-200 w-fit transition-all duration-300 ease-out origin-left ${showMoreTools ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
            >
                {/* Eraser Tool */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("eraser")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "eraser" ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <Eraser className="h-4 w-4" />
                </Button>

                {/* Square Tool */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("square")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "square" ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <Square className="h-4 w-4" />
                </Button>

                {/* Circle Tool */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("circle")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "circle" ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <Circle className="h-4 w-4" />
                </Button>

                {/* Triangle Tool */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("triangle")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "triangle" ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <Triangle className="h-4 w-4" />
                </Button>

                {/* Line Tool */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("line")}
                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "line" ? "bg-black text-white hover:bg-black/90" : ""}`}
                >
                    <Minus className="h-4 w-4" />
                </Button>

                {/* Settings Button */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick("settings")}
                    className="h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}