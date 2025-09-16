"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Link2, Plus, Clock, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Element, Layer } from "@/types"

type ChainItem = {
    type: 'element' | 'delay'
    id: string
    elementId?: string // for single element
    elementIds?: string[] // for multiple elements (group)
    delay?: number // for delays in ticks
}

interface ChainPanelProps {
    layers: Layer[]
    currentLayerId: string | null
    chainSequence: string[]
    onChainSequenceChange: (sequence: string[]) => void
    onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void
    selectedElementIds?: string[]
    chainItems?: ChainItem[]
    onChainItemsChange?: (items: ChainItem[]) => void
}

export function ChainPanel({
    layers,
    currentLayerId,
    selectedElementIds = [],
    chainItems = [],
    onChainItemsChange
}: ChainPanelProps) {
    const currentLayer = layers.find(layer => layer.id === currentLayerId)
    const [defaultDelay, setDefaultDelay] = useState(1)
    const [showDropZones, setShowDropZones] = useState(false)

    const getElementById = (elementId: string): Element | undefined => {
        return currentLayer?.elements.find(el => el.id === elementId)
    }

    const addSelectedToChain = () => {
        if (!onChainItemsChange || selectedElementIds.length === 0) return

        const newItems = [...chainItems]
        const groupId = `group-${Date.now()}`

        // Optimize: Create Set of existing element IDs
        const existingElementIds = new Set<string>();
        newItems.forEach(item => {
            if (item.elementId) existingElementIds.add(item.elementId);
            if (item.elementIds) item.elementIds.forEach(id => existingElementIds.add(id));
        });

        const elementsToAdd = selectedElementIds.filter(elementId => !existingElementIds.has(elementId))

        if (elementsToAdd.length > 0) {
            if (elementsToAdd.length === 1) {
                newItems.push({
                    type: 'element',
                    id: groupId,
                    elementId: elementsToAdd[0]
                })
            } else {
                newItems.push({
                    type: 'element',
                    id: groupId,
                    elementIds: elementsToAdd
                })
            }
        }
        onChainItemsChange(newItems)
    }

    const addShapeToChain = (shapeElementIds: string[]) => {
        if (!onChainItemsChange || shapeElementIds.length === 0) return

        const newItems = [...chainItems]
        const groupId = `shape-${Date.now()}`

        // Optimize: Create Set of existing element IDs
        const existingElementIds = new Set<string>();
        newItems.forEach(item => {
            if (item.elementId) existingElementIds.add(item.elementId);
            if (item.elementIds) item.elementIds.forEach(id => existingElementIds.add(id));
        });

        const elementsToAdd = shapeElementIds.filter(elementId => !existingElementIds.has(elementId))

        if (elementsToAdd.length > 0) {
            if (elementsToAdd.length === 1) {
                newItems.push({
                    type: 'element',
                    id: groupId,
                    elementId: elementsToAdd[0]
                })
            } else {
                newItems.push({
                    type: 'element',
                    id: groupId,
                    elementIds: elementsToAdd
                })
            }
        }
        onChainItemsChange(newItems)
    }

    const removeItem = (index: number) => {
        if (!onChainItemsChange) return
        const newItems = [...chainItems]
        newItems.splice(index, 1)
        onChainItemsChange(newItems)
    }

    const updateDelay = (index: number, delay: number) => {
        if (!onChainItemsChange) return
        const newItems = [...chainItems]
        if (newItems[index].type === 'delay') {
            newItems[index].delay = delay
            onChainItemsChange(newItems)
        }
    }

    const clearChain = () => {
        if (!onChainItemsChange) return
        onChainItemsChange([])
    }

    const toggleDelayMode = () => {
        setShowDropZones(!showDropZones)
    }

    const addDelayAt = (index: number) => {
        if (!onChainItemsChange) return

        const newItems = [...chainItems]
        newItems.splice(index, 0, {
            type: 'delay',
            id: `delay-${Date.now()}`,
            delay: defaultDelay
        })
        onChainItemsChange(newItems)
        setShowDropZones(false)
    }

    // Get shapes for current layer (exclude already added to chain)
    const getShapes = () => {
        const allowedTypes = ["circle", "square", "line"];
        const groups: Record<string, { id: string; name: string; elementIds: string[]; type: string }> = {};

        // Chain'e eklenmiş element ID'lerini topla - Optimized
        const chainElementIds = new Set<string>();
        for (const item of chainItems) {
            if (item.type === 'element') {
                const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
                for (const id of elementIds) {
                    chainElementIds.add(id);
                }
            }
        }

        if (currentLayer?.elements) {
            for (const el of currentLayer.elements) {
                if (!el.groupId || !allowedTypes.includes(el.type) || chainElementIds.has(el.id)) continue;

                if (!groups[el.groupId]) {
                    groups[el.groupId] = {
                        id: el.groupId,
                        name: el.type.charAt(0).toUpperCase() + el.type.slice(1),
                        elementIds: [],
                        type: el.type,
                    };
                }
                groups[el.groupId].elementIds.push(el.id);
            }
        }

        // Boş grupları filtrele
        return Object.values(groups).filter(group => group.elementIds.length > 0);
    }

    const shapes = getShapes()
    const activeCount = chainItems.length

    return (
        <motion.section
            className="flex-1 h-full flex flex-col bg-[#000000] p-0 text-white overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <motion.div
                className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <motion.div
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Link2 className="w-4 h-4 text-white" />
                </motion.div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold tracking-tight text-white">Chain Sequence</h2>
                    <p className="text-white/50 text-xs font-medium">
                        {activeCount} item{activeCount !== 1 ? 's' : ''} in sequence
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {chainItems.length > 0 && (
                        <motion.button
                            onClick={clearChain}
                            className="text-xs text-white/50 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Clear All
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Quick Actions & Controls */}
            <motion.div
                className="px-4 pt-4 pb-3 border-b border-white/10"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <AnimatePresence>
                        {selectedElementIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <Button
                                    onClick={addSelectedToChain}
                                    size="sm"
                                    className="bg-white text-black hover:bg-white/90 border-0 transition-all duration-200"
                                >
                                    <Link2 className="w-3 h-3 mr-1" />
                                    Add Selected ({selectedElementIds.length})
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Delay Controls */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Label className="text-white/70 text-xs font-medium">Delay:</Label>
                    <Input
                        type="number"
                        min={1}
                        max={100}
                        value={defaultDelay}
                        onChange={(e) => setDefaultDelay(Number(e.target.value))}
                        className="w-16 h-7 bg-black border-white/20 text-white focus:border-white/40 transition-colors text-xs"
                    />
                    <span className="text-white/50 text-xs">ticks</span>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={toggleDelayMode}
                            size="sm"
                            className={`w-7 h-7 p-0 transition-all duration-200 ${showDropZones
                                ? 'bg-white text-black hover:bg-white/90'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            <Plus className={`w-3 h-3 transition-transform duration-200 ${showDropZones ? 'rotate-45' : ''}`} />
                        </Button>
                    </motion.div>
                </div>

                {/* Shapes */}
                <AnimatePresence>
                    {shapes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4"
                        >
                            <Label className="text-white/70 text-xs font-medium mb-3 block">Available Shapes</Label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {shapes.map((shape, index) => (
                                    <motion.div
                                        key={shape.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                                    >
                                        <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white/80">{shape.name[0]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-white">{shape.name}</div>
                                            <div className="text-xs text-white/50">{shape.elementIds.length} elements</div>
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                onClick={() => addShapeToChain(shape.elementIds)}
                                                size="sm"
                                                className="bg-white/10 hover:bg-white/20 text-white border-0 opacity-0 group-hover:opacity-100 transition-all duration-200 h-6 w-6 p-0"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Chain Items */}
            <div className="px-4 pt-4 pb-6 space-y-3 flex-1">
                <AnimatePresence>
                    {chainItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center h-48 text-center"
                        >
                            <motion.div
                                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3"
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Link2 className="w-6 h-6 text-white/40" />
                            </motion.div>
                            <h3 className="text-sm font-medium text-white/60 mb-1">No Chain Sequence</h3>
                            <p className="text-xs text-white/40 max-w-xs">
                                Select elements or shapes to start building your chain sequence
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-2">
                            {chainItems.map((item, index) => (
                                <div key={item.id}>
                                    {/* Drop Zone */}
                                    <AnimatePresence>
                                        {showDropZones && index > 0 && chainItems[index - 1].type === 'element' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scaleY: 0 }}
                                                animate={{ opacity: 1, height: "auto", scaleY: 1 }}
                                                exit={{ opacity: 0, height: 0, scaleY: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="mb-2"
                                            >
                                                <motion.div
                                                    onClick={() => addDelayAt(index)}
                                                    className="h-8 border border-dashed border-white/20 rounded bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className="text-white/60 text-xs font-medium">
                                                        Add delay ({defaultDelay} ticks)
                                                    </span>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Item */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 25,
                                            delay: index * 0.05
                                        }}
                                        layout
                                    >
                                        {item.type === 'element' ? (
                                            // Element Item
                                            (() => {
                                                const isGroup = item.elementIds && item.elementIds.length > 1
                                                const elementIds = isGroup ? item.elementIds! : [item.elementId!]
                                                const elements = elementIds.map(id => getElementById(id)).filter(Boolean)

                                                if (elements.length === 0) return null

                                                const groupNumber = chainItems.filter((_, i) => i <= index && chainItems[i].type === 'element').length

                                                return (
                                                    <div className="group relative p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200">
                                                        {/* Group Number Badge */}
                                                        <motion.div
                                                            className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold"
                                                            whileHover={{ scale: 1.1 }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                        >
                                                            {groupNumber}
                                                        </motion.div>

                                                        {/* Header */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <h4 className="text-white text-sm font-medium">
                                                                    {isGroup ? `Group (${elements.length} elements)` : '1 element'}
                                                                </h4>
                                                            </div>

                                                            <motion.button
                                                                onClick={() => removeItem(index)}
                                                                className="w-6 h-6 rounded bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <X className="w-3 h-3 text-red-400" />
                                                            </motion.button>
                                                        </div>

                                                        {/* Elements Grid */}
                                                        {isGroup && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                transition={{ delay: 0.1 }}
                                                                className="grid grid-cols-6 gap-1"
                                                            >
                                                                {elements.map((element, elemIndex) => {
                                                                    if (!element) return null

                                                                    return (
                                                                        <motion.div
                                                                            key={element.id}
                                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            transition={{ delay: elemIndex * 0.02 }}
                                                                            className="p-1 rounded bg-black/30 border border-white/20 text-center"
                                                                        >
                                                                            <div
                                                                                className="w-2 h-2 rounded-full mx-auto mb-1 border border-white/40"
                                                                                style={{ backgroundColor: element.color || currentLayer?.color || '#fff' }}
                                                                            />
                                                                            <div className="text-xs font-medium text-white/80 truncate">
                                                                                {element.type}
                                                                            </div>
                                                                        </motion.div>
                                                                    )
                                                                })}
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                )
                                            })()
                                        ) : (
                                            // Delay Item
                                            <div className="group relative p-3 rounded-lg bg-white/5 border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                                                        animate={{
                                                            rotate: [0, 360],
                                                        }}
                                                        transition={{
                                                            duration: 8,
                                                            repeat: Infinity,
                                                            ease: "linear"
                                                        }}
                                                    >
                                                        <Clock className="w-4 h-4 text-white/80" />
                                                    </motion.div>

                                                    <div className="flex-1 flex items-center gap-2">
                                                        <span className="text-white/70 text-sm font-medium">Delay:</span>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={100}
                                                            value={item.delay || 1}
                                                            onChange={(e) => updateDelay(index, Number(e.target.value))}
                                                            className="w-16 h-6 bg-black/50 border-white/20 text-white focus:border-white/40 text-xs"
                                                        />
                                                        <span className="text-white/50 text-xs">ticks</span>
                                                    </div>

                                                    <motion.button
                                                        onClick={() => removeItem(index)}
                                                        className="w-6 h-6 rounded bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <X className="w-3 h-3 text-red-400" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            ))}

                            {/* Final Drop Zone */}
                            <AnimatePresence>
                                {showDropZones && chainItems.length > 0 && chainItems[chainItems.length - 1].type === 'element' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, scaleY: 0 }}
                                        animate={{ opacity: 1, height: "auto", scaleY: 1 }}
                                        exit={{ opacity: 0, height: 0, scaleY: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-2"
                                    >
                                        <motion.div
                                            onClick={() => addDelayAt(chainItems.length)}
                                            className="h-8 border border-dashed border-white/20 rounded bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="text-white/60 text-xs font-medium">
                                                Add delay ({defaultDelay} ticks)
                                            </span>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    )
}