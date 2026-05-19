"use client"
import { Button } from "@/components/ui/button"
import { MousePointer, Move3D, Rotate3D, Maximize2, Grid3X3, Axis3D, Plus, Trash2, Settings } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { use3DStore } from "../store/use3DStore"

export function RightToolbar3D() {
    const {
        currentTool,
        setCurrentTool,
        scene,
        updateScene,
        clearScene
    } = use3DStore()

    const [showMoreTools, setShowMoreTools] = useState(false)
    const [isHovered, setIsHovered] = useState<string | null>(null)

    const handleToolClick = (tool: string) => {
        console.log("[RightToolbar3D] Tool clicked:", tool)

        if (tool === "more") {
            setShowMoreTools(!showMoreTools)
        } else if (tool === "clear") {
            clearScene()
        } else if (tool === "add") {
            // Trigger add shape modal (Shift+A equivalent)
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', shiftKey: true }))
        } else if (tool === "grid") {
            updateScene({ showGrid: !scene.showGrid })
        } else if (tool === "axes") {
            updateScene({ showAxes: !scene.showAxes })
        } else {
            setShowMoreTools(false)
            setCurrentTool(tool as any)
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
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex gap-3">
            {/* Genişletilmiş Toolbar - Solda */}
            <AnimatePresence>
                {showMoreTools && (
                    <motion.div
                        className="flex flex-col gap-1.5 bg-black/90 backdrop-blur-md rounded-full shadow-lg p-2.5 border border-white/20 w-fit"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Grid Toggle */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("grid")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("grid")}
                                    className={`h-9 w-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white ${scene.showGrid ? "bg-green-500/20 text-green-400" : ""}`}
                                    title={`Grid ${scene.showGrid ? "ON" : "OFF"}`}
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={scene.showGrid ? "active" : isHovered === "grid" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Axes Toggle */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onHoverStart={() => setIsHovered("axes")}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToolClick("axes")}
                                    className={`h-9 w-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white ${scene.showAxes ? "bg-green-500/20 text-green-400" : ""}`}
                                    title={`Axes ${scene.showAxes ? "ON" : "OFF"}`}
                                >
                                    <motion.div
                                        variants={iconVariants}
                                        animate={scene.showAxes ? "active" : isHovered === "axes" ? "hover" : "idle"}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Axis3D className="h-4 w-4" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ana Toolbar */}
            <motion.div
                className="flex flex-col gap-1 bg-black/90 backdrop-blur-md rounded-full shadow-lg p-2 border border-white/20"
                style={{ width: 'fit-content', height: 'fit-content' }}
                initial={{ opacity: 0, x: 50 }}
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
                        className={`h-9 w-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white ${currentTool === "select" ? "bg-white/20 text-white" : ""}`}
                        title="Select Tool (Q)"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={currentTool === "select" ? "active" : isHovered === "select" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <MousePointer className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Move Tool */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("move")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("move")}
                        className={`h-9 w-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white ${currentTool === "move" ? "bg-white/20 text-white" : ""}`}
                        title="Move Tool (W)"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={currentTool === "move" ? "active" : isHovered === "move" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <Move3D className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Rotate Tool */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("rotate")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("rotate")}
                        className={`h-9 w-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white ${currentTool === "rotate" ? "bg-white/20 text-white" : ""}`}
                        title="Rotate Tool (E)"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={currentTool === "rotate" ? "active" : isHovered === "rotate" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <Rotate3D className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Scale Tool */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("scale")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("scale")}
                        className={`h-9 w-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white ${currentTool === "scale" ? "bg-white/20 text-white" : ""}`}
                        title="Scale Tool (R)"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={currentTool === "scale" ? "active" : isHovered === "scale" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Add Shape Button */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("add")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("add")}
                        className="h-9 w-9 rounded-full hover:bg-green-500/20 text-white/80 hover:text-green-400"
                        title="Add Shape (Shift+A)"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={isHovered === "add" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <Plus className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>

                {/* Clear Scene Button */}
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
                        className="h-9 w-9 rounded-full hover:bg-red-500/20 text-white/80 hover:text-red-400"
                        title="Clear Scene"
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

                {/* More Tools Toggle */}
                <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onHoverStart={() => setIsHovered("more")}
                    onHoverEnd={() => setIsHovered(null)}
                >
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToolClick("more")}
                        className={`h-9 w-9 rounded-full hover:bg-white/10 text-white/80 hover:text-white ${showMoreTools ? "bg-white/20 text-white" : ""}`}
                        title="More Tools"
                    >
                        <motion.div
                            variants={iconVariants}
                            animate={showMoreTools ? "active" : isHovered === "more" ? "hover" : "idle"}
                            transition={{ duration: 0.3 }}
                        >
                            <Settings className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    )
}