"use client"
import { Button } from "@/components/ui/button"
import { LayoutGrid, MousePointerClick, Settings, Trash2, Code, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import type { Tool } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { shapeLibrary } from "@/lib/shape-library"
import { ShapeIcon } from "./toolbar-customization-modal"




interface LeftToolbarProps {
    currentTool: Tool
    setCurrentTool: (tool: Tool) => void
    onClearCanvas?: () => void
    onShowQuickSettings?: () => void
    onGenerateCode?: () => void
    onShowCustomization?: () => void
    selectedToolIds?: string[] // Ana component'ten gelen seçili araçlar
}

export function LeftToolbar({ currentTool, setCurrentTool, onClearCanvas, onShowQuickSettings, onGenerateCode, onShowCustomization, selectedToolIds: externalSelectedToolIds }: LeftToolbarProps) {
    const [showMoreTools, setShowMoreTools] = useState(false)
    const [isHovered, setIsHovered] = useState<string | null>(null)
    const [selectedToolIds, setSelectedToolIds] = useState<string[]>([])

    // Varsayılan araçlar
    const defaultTools = [
        { id: 'eraser', name: 'Eraser', isDefault: true },
        { id: 'square', name: 'Square', isDefault: true },
        { id: 'circle', name: 'Circle', isDefault: true },
        { id: 'triangle', name: 'Triangle', isDefault: true },
        { id: 'line', name: 'Line', isDefault: true },
    ]

    // Şekil kütüphanesinden araçlar (varsayılan araçlarla çakışmayanlar)
    const shapeTools = shapeLibrary
        .filter(shape => !defaultTools.some(tool => tool.id === shape.id))
        .map(shape => ({
            id: shape.id,
            name: shape.name,
            isDefault: false
        }))

    // Tüm mevcut araçlar (varsayılan + benzersiz şekiller)
    const allTools = [...defaultTools, ...shapeTools]

    // Ana component'ten gelen araçları kullan, yoksa localStorage'dan yükle
    useEffect(() => {
        if (externalSelectedToolIds && externalSelectedToolIds.length > 0) {
            setSelectedToolIds(externalSelectedToolIds)
        } else {
            const savedTools = localStorage.getItem('toolbar-selected-tools')
            if (savedTools) {
                try {
                    setSelectedToolIds(JSON.parse(savedTools))
                } catch (error) {
                    console.error('Error loading toolbar customization:', error)
                    setSelectedToolIds(['eraser', 'square', 'circle', 'triangle'])
                }
            } else {
                setSelectedToolIds(['eraser', 'square', 'circle', 'triangle'])
            }
        }
    }, [externalSelectedToolIds])

    // Seçili araçları filtrele ve sırala
    const visibleTools = selectedToolIds.map(id => allTools.find(tool => tool.id === id)).filter(Boolean) as typeof allTools

    const handleToolClick = (tool: string) => {
        console.log("[LeftToolbar] Tool clicked:", tool)

        if (tool === "layout") {
            setShowMoreTools(!showMoreTools)
        } else if (tool === "customize") {
            onShowCustomization?.()
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

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8, x: -20 },
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            transition: {
                duration: 0.3,
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            x: -20,
            transition: {
                duration: 0.2,
                staggerChildren: 0.03,
                staggerDirection: -1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        },
        exit: {
            y: -20,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    }

    const buttonVariants = {
        idle: { scale: 1, rotate: 0 },
        hover: { scale: 1.1, rotate: [0, -5, 5, 0] },
        tap: { scale: 0.95 }
    }

    const iconVariants = {
        idle: { rotate: 0 },
        active: { rotate: 360 },
        hover: { scale: 1.2 }
    }

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 -translate-y-12 z-50 flex gap-3">
            {/* Ana Toolbar */}
            <motion.div
                className="flex flex-col gap-1 bg-white rounded-full shadow-lg p-2 border border-gray-200"
                style={{ width: 'fit-content', height: 'fit-content' }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, type: "spring" as const }}
            >
                {/* Select Tool */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("select")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("select")}
                        className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "select" ? "bg-black text-white hover:bg-black/90" : ""}`}
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={currentTool === "select" ? "active" : isHovered === "select" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <MousePointerClick className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Free Draw Tool */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("free")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("free")}
                        className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "free" ? "bg-black text-white hover:bg-black/90" : ""}`}
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={currentTool === "free" ? "active" : isHovered === "free" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Generate Code Button */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("generate")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("generate")}
                        className="h-9 w-9 rounded-full hover:bg-green-100 text-gray-700 hover:text-green-600"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={isHovered === "generate" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <Code className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Clear Layer Button */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("clear")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("clear")}
                        className="h-9 w-9 rounded-full hover:bg-red-100 text-gray-700 hover:text-red-600"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={isHovered === "clear" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* 4 Kare İkonu - More Tools */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("layout")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("layout")}
                        className={`h-9 w-9 rounded-full hover:bg-gray-100 hover:text-gray-900 text-gray-700 ${showMoreTools ? "bg-black text-white hover:bg-black/90 hover:text-white" : ""}`}
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={showMoreTools ? "active" : isHovered === "layout" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Genişletilmiş Toolbar */}
            <AnimatePresence>
                {showMoreTools && (
                    <motion.div
                        className="flex flex-col gap-1.5 bg-white rounded-full shadow-lg p-2.5 border border-gray-200 w-fit"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Dynamic Customizable Tools */}
                        {visibleTools.map((tool) => {
                            return (
                                <motion.div key={tool.id} variants={itemVariants}>
                                    <motion.div
                                        whileHover="hover"
                                        whileTap="tap"
                                        variants={buttonVariants}
                                        onHoverStart={() => setIsHovered(tool.id)}
                                        onHoverEnd={() => setIsHovered(null)}
                                    >
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleToolClick(tool.id)}
                                            className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === tool.id ? "bg-black text-white hover:bg-black/90" : ""}`}
                                            title={tool.name}
                                        >
                                            <motion.div
                                                variants={iconVariants}
                                                animate={currentTool === tool.id ? "active" : isHovered === tool.id ? "hover" : "idle"}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ShapeIcon shapeId={tool.id} className="h-4 w-4" />
                                            </motion.div>
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            );
                        })}

                        {/* Customize Button (+ icon) */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("customize")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("customize")}
                                    className="h-9 w-9 rounded-full hover:bg-blue-100 text-gray-700 hover:text-blue-600"
                                    title="Customize Toolbar"
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={isHovered === "customize" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Settings Button */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("settings")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("settings")}
                                    className="h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={isHovered === "settings" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Settings className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    )
}