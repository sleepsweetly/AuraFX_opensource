"use client"
import { Button } from "@/components/ui/button"
import { Square, LayoutGrid, Circle, Minus, Triangle, MousePointerClick, Eraser, Settings, Trash2, Code } from "lucide-react"
import { useState } from "react"
import type { Tool } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

interface LeftToolbarProps {
    currentTool: Tool
    setCurrentTool: (tool: Tool) => void
    onClearCanvas?: () => void
    onShowQuickSettings?: () => void
    onGenerateCode?: () => void
}

export function LeftToolbar({ currentTool, setCurrentTool, onClearCanvas, onShowQuickSettings, onGenerateCode }: LeftToolbarProps) {
    const [showMoreTools, setShowMoreTools] = useState(false)
    const [isHovered, setIsHovered] = useState<string | null>(null)

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
                        {/* Eraser Tool */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("eraser")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("eraser")}
                                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "eraser" ? "bg-black text-white hover:bg-black/90" : ""}`}
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={currentTool === "eraser" ? "active" : isHovered === "eraser" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Eraser className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Square Tool */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("square")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("square")}
                                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "square" ? "bg-black text-white hover:bg-black/90" : ""}`}
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={currentTool === "square" ? "active" : isHovered === "square" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Square className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Circle Tool */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("circle")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("circle")}
                                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "circle" ? "bg-black text-white hover:bg-black/90" : ""}`}
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={currentTool === "circle" ? "active" : isHovered === "circle" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Circle className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Triangle Tool */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("triangle")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("triangle")}
                                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "triangle" ? "bg-black text-white hover:bg-black/90" : ""}`}
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={currentTool === "triangle" ? "active" : isHovered === "triangle" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Triangle className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Line Tool */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("line")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("line")}
                                    className={`h-9 w-9 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentTool === "line" ? "bg-black text-white hover:bg-black/90" : ""}`}
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={currentTool === "line" ? "active" : isHovered === "line" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Minus className="h-4 w-4" />
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