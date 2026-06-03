"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Send, X, ArrowLeft } from "lucide-react"
import { use3DStore } from "../store/use3DStore"

export function SendTo2DButton() {
    const [showModal, setShowModal] = useState(false)
    const [simpleTransfer, setSimpleTransfer] = useState(false)
    const { shapes, layers, vertices } = use3DStore()

    const threeDShapes = shapes.filter(shape => shape.vertices.length > 0)
    const threeDLayers = layers.filter(layer => layer.id !== 'default' && layer.elements.length > 0)
    const totalElements = threeDShapes.length + (vertices.size > 0 ? 1 : 0) + threeDLayers.length

    const handleSendElements = () => {
        try {
            const elements = use3DStore.getState().exportToMainSystem()

            // FIXED: Allow navigation even with no elements (user wants to go to 2D)
            const transferData = {
                elements: elements || [],
                layers: [],
                clearExisting: simpleTransfer,
                timestamp: Date.now(),
                layerNames: []
            }

            sessionStorage.setItem('aurafx-3d-transfer', JSON.stringify(transferData))
            window.location.href = "/"
        } catch (error) {
            console.error('Transfer failed:', error)
            alert('Transfer failed')
        }

        setShowModal(false)
        setSimpleTransfer(false)
    }

    return (
        <>
            {/* Button */}
            <div className="fixed top-4 right-4 z-50">
                <motion.button
                    className="flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/90 px-3 text-xs font-medium text-white/80 shadow-lg transition-colors hover:bg-white/10 hover:text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(true)}
                >
                    <Send className="h-3 w-3" />
                    <span>Send 2D</span>
                </motion.button>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-900">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transfer to 2D</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            {/* Clear Option */}
                            <button
                                onClick={() => setSimpleTransfer(!simpleTransfer)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    simpleTransfer ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-zinc-600"
                                }`}>
                                    {simpleTransfer && (
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">Clear existing</div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-400">Remove current 2D elements</div>
                                </div>
                            </button>

                            {/* Elements */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {threeDShapes.map((shape) => (
                                    <div key={shape.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shape.color || '#ffffff' }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {shape.name || `${shape.type} ${shape.id.slice(-4)}`}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-zinc-400">{shape.vertices.length} vertices</div>
                                        </div>
                                    </div>
                                ))}

                                {vertices.size > 0 && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Vertices</div>
                                            <div className="text-xs text-gray-500 dark:text-zinc-400">{vertices.size} points</div>
                                        </div>
                                    </div>
                                )}

                                {threeDLayers.map((layer) => (
                                    <div key={layer.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-900">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{layer.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-zinc-400">{layer.elements?.length || 0} elements</div>
                                        </div>
                                    </div>
                                ))}

                                {totalElements === 0 && (
                                    <div className="p-6 text-center text-sm text-gray-500 dark:text-zinc-400 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg">
                                        No elements to export
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-zinc-900">
                            <span className="text-sm text-gray-600 dark:text-zinc-400">
                                {totalElements} element{totalElements !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={handleSendElements}
                                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                            >
                                {totalElements > 0 ? 'Transfer' : 'Go to 2D'}
                                <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    )
}
