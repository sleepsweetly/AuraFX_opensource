"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Info, ArrowRight, Sparkles, Layers, Zap } from "lucide-react"
import { use3DStore } from "../store/use3DStore"

export function SendTo2DButton() {
    const [showModal, setShowModal] = useState(false)
    const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])
    const [simpleTransfer, setSimpleTransfer] = useState(false)


    const { shapes, layers, vertices } = use3DStore()

    // Filter shapes that have vertices (actual content to export)
    const threeDShapes = shapes.filter(shape => shape.vertices.length > 0)
    const threeDLayers = layers.filter(layer => layer.id !== 'default' && layer.elements.length > 0)

    const handleSendElements = () => {
        console.log('=== 3D->2D TRANSFER ===');

        try {
            const elements = use3DStore.getState().exportToMainSystem();

            console.log('Exported elements:', elements);
            console.log('Elements count:', elements.length);
            console.log('Vertices count:', vertices.size);
            console.log('Shapes with vertices:', threeDShapes.length);

            if (elements.length > 0) {
                const transferData = {
                    elements,
                    layers: [],
                    clearExisting: simpleTransfer,
                    timestamp: Date.now(),
                    layerNames: selectedLayerIds
                };

                sessionStorage.setItem('aurafx-3d-transfer', JSON.stringify(transferData));
                console.log('Transfer data saved to sessionStorage');

                window.location.href = "/";
            } else {
                console.log('No elements to transfer to 2D editor');
                alert('No elements found to transfer to 2D editor');
            }
        } catch (error) {
            console.error('Transfer failed:', error);
            alert('Transfer failed: ' + error);
        }

        setShowModal(false);
        setSelectedLayerIds([]);
        setSimpleTransfer(false);
    }

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.85,
            y: 60
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0
        },
        exit: {
            opacity: 0,
            scale: 0.92,
            y: -20
        }
    } as const;

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 25,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1
        },
        exit: {
            opacity: 0,
            y: -15,
            scale: 0.98
        }
    } as const;


    return (
        <>
            {/* Send to 2D Button - TopCenterToolbar Style */}
            <div className="fixed top-4 right-4 z-50">
                <motion.button
                    className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-lg border border-gray-200 h-10 hover:bg-gray-50 text-gray-700 transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: 0.2
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(true)}
                    layout
                    layoutId="send-to-2d-toolbar"
                >
                    <motion.div
                        animate={{ rotate: 0 }}
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Send className="w-4 h-4" />
                    </motion.div>
                    <span className="text-xs font-medium">Send to 2D</span>
                </motion.button>
            </div>


            {/* Send Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[9999] bg-black backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-black rounded-3xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative p-6 pb-4 bg-black border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                                        <Send className="w-7 h-7 text-black" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Send to 2D Editor
                                        </h2>
                                        <p className="text-white/60 text-sm mt-1">
                                            Export your 3D elements to the 2D editor
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Simple Transfer Option */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="relative mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={simpleTransfer}
                                            onChange={(e) => setSimpleTransfer(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${simpleTransfer
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'bg-white/10 border-white/20'
                                                }`}
                                        >
                                            {simpleTransfer && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-medium text-sm flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-yellow-400" />
                                            Simple Transfer
                                        </div>
                                        <div className={`text-xs mt-2 leading-relaxed ${simpleTransfer ? 'text-white/80' : 'text-white/60'
                                            }`}>
                                            {simpleTransfer
                                                ? "🔄 Clear existing elements and add only 3D elements"
                                                : "➕ Add 3D elements to existing elements"}
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* 3D Elements Info */}
                            <div>
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-blue-400" />
                                    Elements to Export
                                </h3>
                                <div className="space-y-3">
                                    {threeDShapes.map((shape: any, index: number) => (
                                        <div
                                            key={shape.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:border-green-500/40 transition-colors hover:shadow-lg hover:shadow-green-500/10"
                                        >
                                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
                                            <div className="flex-1">
                                                <div className="text-white font-medium text-sm">{shape.name || `${shape.type} ${shape.id.slice(-4)}`}</div>
                                                <div className="text-green-400/80 text-xs font-mono">{shape.vertices.length} vertices</div>
                                            </div>
                                            <div
                                                className="w-4 h-4 rounded-full border-2 border-white/30 shadow-inner"
                                                style={{ backgroundColor: shape.color || '#ffffff' }}
                                            />
                                        </div>
                                    ))}

                                    {/* Individual Vertices */}
                                    {vertices.size > 0 && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors hover:shadow-lg hover:shadow-purple-500/10">
                                            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/30" />
                                            <div className="flex-1">
                                                <div className="text-white font-medium text-sm">Individual Vertices</div>
                                                <div className="text-purple-400/80 text-xs font-mono">{vertices.size} vertices</div>
                                            </div>
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 shadow-inner bg-purple-400" />
                                        </div>
                                    )}

                                    {threeDLayers.filter((layer: any) => layer.id !== 'default').map((layer: any, index: number) => (
                                        <div
                                            key={layer.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors hover:shadow-lg hover:shadow-blue-500/10"
                                        >
                                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
                                            <div className="flex-1">
                                                <div className="text-white font-medium text-sm">{layer.name}</div>
                                                <div className="text-blue-400/80 text-xs font-mono">{layer.elements?.length || 0} elements</div>
                                            </div>
                                            <div
                                                className="w-4 h-4 rounded-full border-2 border-white/30 shadow-inner"
                                                style={{ backgroundColor: layer.color }}
                                            />
                                        </div>
                                    ))}
                                    {threeDShapes.length === 0 && vertices.size === 0 && (
                                        <div className="text-white/60 text-sm p-6 text-center bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <Info className="w-8 h-8 mx-auto mb-2 text-white/40" />
                                            </div>
                                            No 3D elements to export
                                            <div className="text-xs text-white/40 mt-1">Create some 3D shapes or add vertices first</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 h-12 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-white/20"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendElements}
                                    className="flex-1 h-12 text-sm font-medium text-black rounded-xl transition-all bg-white hover:bg-gray-100 border border-white/20 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>Export to 2D</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
