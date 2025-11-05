"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X } from "lucide-react"
import { use3DStore } from "../store/use3DStore"

export function SendTo2DButton() {
    const [showModal, setShowModal] = useState(false)
    const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])
    const [simpleTransfer, setSimpleTransfer] = useState(false)


    const { shapes, layers, vertices } = use3DStore()

    // Filter shapes that have vertices (actual content to export)
    const threeDShapes = shapes.filter(shape => shape.vertices.length > 0)
    const threeDLayers = layers.filter(layer => layer.id !== 'default' && layer.elements.length > 0)
    
    // Get vertices that don't belong to any shape (standalone vertices)
    const allShapeVertexIds = new Set(threeDShapes.flatMap(shape => shape.vertices))
    const standaloneVertices = Array.from(vertices.values()).filter(vertex => 
        !vertex.groupId && !allShapeVertexIds.has(vertex.id)
    )

    const handleSendElements = () => {
        console.log('=== 3D->2D TRANSFER ===');

        try {
            const elements = use3DStore.getState().exportToMainSystem();

            console.log('Exported elements:', elements);
            console.log('Elements count:', elements.length);
            console.log('Vertices count:', vertices.size);
            console.log('Shapes with vertices:', threeDShapes.length);

            // Element olmasa bile transfer yap - sadece boş array gönder
            const transferData = {
                elements: elements || [],
                layers: [],
                clearExisting: simpleTransfer,
                timestamp: Date.now(),
                layerNames: selectedLayerIds
            };

            sessionStorage.setItem('aurafx-3d-transfer', JSON.stringify(transferData));
            console.log('Transfer data saved to sessionStorage');

            // Her durumda 2D editöre git
            window.location.href = "/";
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


            {/* Send Modal - Modern Dark Design */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="bg-black rounded-2xl w-full max-w-lg border border-white/20 shadow-2xl overflow-hidden"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header - 3D Style */}
                            <div className="relative p-6 pb-4 bg-black border-b border-white/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Send className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-white">
                                                Export to 2D Editor
                                            </h2>
                                            <p className="text-white/60 text-sm mt-1">
                                                Transfer your 3D elements to 2D workspace
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Simple Transfer Option - Modern Dark */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <div className="relative mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={simpleTransfer}
                                                onChange={(e) => setSimpleTransfer(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${simpleTransfer
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'bg-transparent border-white/30 hover:border-white/50'
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
                                            <div className="text-white font-medium text-sm">
                                                Replace Mode
                                            </div>
                                            <div className="text-white/60 text-xs mt-1">
                                                {simpleTransfer
                                                    ? "Clear existing 2D elements and replace with 3D export"
                                                    : "Add 3D elements alongside existing 2D elements"}
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* 3D Elements Info - Modern Dark */}
                                <div>
                                    <h3 className="text-white font-medium mb-4">
                                        Elements to Export
                                    </h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                                        {threeDShapes.map((shape: any) => (
                                            <div
                                                key={shape.id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                                            >
                                                <div className="w-3 h-3 rounded-full bg-white/60" />
                                                <div className="flex-1">
                                                    <div className="text-white text-sm">{shape.name || `${shape.type} ${shape.id.slice(-4)}`}</div>
                                                    <div className="text-white/60 text-xs">{shape.vertices.length} vertices</div>
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white/30"
                                                    style={{ backgroundColor: shape.color || '#ffffff' }}
                                                />
                                            </div>
                                        ))}

                                        {standaloneVertices.length > 0 && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                <div className="w-3 h-3 rounded-full bg-white/60" />
                                                <div className="flex-1">
                                                    <div className="text-white text-sm">Individual Vertices</div>
                                                    <div className="text-white/60 text-xs">{standaloneVertices.length} vertices</div>
                                                </div>
                                                <div className="w-4 h-4 rounded-full border border-white/30 bg-white/60" />
                                            </div>
                                        )}

                                        {threeDLayers.filter((layer: any) => layer.id !== 'default').map((layer: any) => (
                                            <div
                                                key={layer.id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                                            >
                                                <div className="w-3 h-3 rounded-full bg-white/60" />
                                                <div className="flex-1">
                                                    <div className="text-white text-sm">{layer.name}</div>
                                                    <div className="text-white/60 text-xs">{layer.elements?.length || 0} elements</div>
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white/30"
                                                    style={{ backgroundColor: layer.color }}
                                                />
                                            </div>
                                        ))}
                                        
                                        {threeDShapes.length === 0 && standaloneVertices.length === 0 && threeDLayers.length === 0 && (
                                            <div className="text-white/60 text-sm p-6 text-center bg-white/5 rounded-lg border border-white/10">
                                                No 3D elements to export
                                                <div className="text-xs text-white/40 mt-1">You can still go to 2D Editor to start creating</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions - 3D Style */}
                                <div className="flex gap-3 pt-4 border-t border-white/20">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 h-12 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendElements}
                                        className="flex-1 h-12 text-sm font-medium text-white rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {threeDShapes.length > 0 || standaloneVertices.length > 0 || threeDLayers.length > 0 
                                            ? 'Export to 2D' 
                                            : 'Go to 2D Editor'
                                        }
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
