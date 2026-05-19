"use client"
import { ChevronUp, ChevronDown, Plus, Trash2, Eye, EyeOff, Edit3, Copy, GripVertical, Layers, Undo, Redo } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useLayerStore } from "@/store/useLayerStore"
import { useHistoryStore } from "@/lib/history-store"

interface LayersPanelProps {
  isOpen: boolean
  onClose: () => void
  layers?: any[]
  onAddLayer?: () => void
  onDeleteLayer?: (layerId: string) => void
  onSelectLayer?: (layerId: string) => void
  onUpdateLayer?: (layerId: string, updates: any) => void
  onReorderLayers?: (fromIndex: number, toIndex: number) => void
  currentLayer?: any
  onUndo?: () => void
  onRedo?: () => void
}

export function LayersPanel({
  isOpen,
  onClose,
  layers = [],
  onAddLayer = () => { },
  onDeleteLayer = () => { },
  onSelectLayer = () => { },
  onUpdateLayer = () => { },
  onReorderLayers = () => { },
  currentLayer = null,
  onUndo = () => { },
  onRedo = () => { }
}: LayersPanelProps) {
  const [historyExpanded, setHistoryExpanded] = useState(true)
  const [layersExpanded, setLayersExpanded] = useState(true)
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)

  // Store'dan layer bilgilerini al
  const { layers: storeLayers, currentLayerId, setCurrentLayerId } = useLayerStore()

  // History store'dan bilgileri al
  const { past, future, undo, redo, canUndo, canRedo } = useHistoryStore()

  // Props'tan gelen layers varsa onu kullan, yoksa store'dan al
  const displayLayers = layers.length > 0 ? layers : storeLayers
  const displayCurrentLayer = currentLayer || storeLayers.find(l => l.id === currentLayerId)

  // console.log('LayersPanel render:', {
  //   propsLayers: layers.length,
  //   storeLayers: storeLayers.length,
  //   displayLayers: displayLayers.length,
  //   currentLayerId
  // })

  // Panel dışına tıklandığında kapanma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Layers toggle butonuna tıklandıysa kapanma (buton kendi toggle'ını yapacak)
        const target = event.target as Element
        const layersButton = document.getElementById('layers-toggle-button')
        if (layersButton && (layersButton.contains(target) || layersButton === target)) {
          return
        }
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Layer değişikliklerini takip et
  useEffect(() => {
    console.log('Layers changed:', displayLayers.map(l => ({ id: l.id, name: l.name })))
  }, [displayLayers])

  // Layer seçimi fonksiyonu - hem store'u hem callback'i güncelle
  const handleLayerSelect = (layerId: string) => {
    console.log('Layer selected:', layerId)
    setCurrentLayerId(layerId)
    onSelectLayer(layerId)
  }

  // Layer reorder fonksiyonu - store'u da güncelle
  const handleReorderLayers = (fromIndex: number, toIndex: number) => {
    console.log('handleReorderLayers called:', { fromIndex, toIndex })
    console.log('onReorderLayers function:', typeof onReorderLayers)

    try {
      // Önce callback'i çağır (prop'ları günceller)
      onReorderLayers(fromIndex, toIndex)
      console.log('onReorderLayers callback executed successfully')
    } catch (error) {
      console.error('Error calling onReorderLayers:', error)
    }
  }

  const handleStartRename = (layer: any) => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
  }

  const handleFinishRename = () => {
    if (editingLayerId && editingName.trim()) {
      onUpdateLayer(editingLayerId, { name: editingName.trim() })
    }
    setEditingLayerId(null)
    setEditingName("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename()
    } else if (e.key === 'Escape') {
      setEditingLayerId(null)
      setEditingName("")
    }
  }

  const toggleLayerVisibility = (layerId: string) => {
    const layer = displayLayers.find(l => l.id === layerId)
    if (layer) {
      onUpdateLayer(layerId, { visible: !layer.visible })
    }
  }

  const duplicateLayer = (layerId: string) => {
    const layer = displayLayers.find(l => l.id === layerId)
    if (layer) {
      // Basit duplicate - sadece ismi değiştir
      onAddLayer()
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    console.log('Drag started for layer:', layerId)
    setDraggedLayer(layerId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', layerId)

    // Drag image'ı ayarla
    const dragElement = e.currentTarget as HTMLElement
    e.dataTransfer.setDragImage(dragElement, 0, 0)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'

    // Sadece farklı index'e geldiğinde güncelle
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Sadece panel dışına çıkıldığında temizle
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    const draggedLayerId = e.dataTransfer.getData('text/plain')
    console.log('Drop event:', { draggedLayerId, dropIndex, draggedLayer })

    if (draggedLayerId && draggedLayer === draggedLayerId) {
      const dragIndex = displayLayers.findIndex(l => l.id === draggedLayerId)
      console.log('Reordering layers:', { dragIndex, dropIndex })

      if (dragIndex !== -1 && dragIndex !== dropIndex) {
        handleReorderLayers(dragIndex, dropIndex)
      }
    }

    // State'i temizle
    setDraggedLayer(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('Drag ended')
    setDraggedLayer(null)
    setDragOverIndex(null)
  }

  return (
    <div
      ref={panelRef}
      className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl z-50 transition-all duration-300 ease-out rounded-r-lg ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
    >
      <div className="flex flex-col h-full">
        {/* History Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-2">
              <Undo className="w-4 h-4 text-gray-700" />
              <span className="font-medium text-sm text-gray-900">History</span>
            </div>
            {historyExpanded ? <ChevronUp className="h-4 w-4 text-gray-700" /> : <ChevronDown className="h-4 w-4 text-gray-700" />}
          </button>
          {historyExpanded && (
            <div className="px-4 py-3">
              {/* Undo/Redo Buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={onUndo}
                  disabled={!canUndo()}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canUndo() 
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                  title={canUndo() ? 'Undo last action' : 'Nothing to undo'}
                >
                  <Undo className="w-4 h-4" />
                  Undo
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo()}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canRedo() 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                  title={canRedo() ? 'Redo last action' : 'Nothing to redo'}
                >
                  <Redo className="w-4 h-4" />
                  Redo
                </button>
              </div>

              {/* History Stats */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Actions Available</span>
                  <span className="font-medium text-gray-900">{past.length + future.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Current Elements</span>
                  <span className="font-medium text-gray-900">
                    {displayLayers.reduce((total, layer) => total + layer.elements.length, 0)}
                  </span>
                </div>
                {past.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Last Action:</div>
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {((past[past.length - 1] as any)?.action || 'Unknown action').substring(0, 30)}
                      {((past[past.length - 1] as any)?.action || '').length > 30 ? '...' : ''}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date((past[past.length - 1] as any)?.timestamp || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Layers Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-200">
            <button
              onClick={() => setLayersExpanded(!layersExpanded)}
              className="flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-gray-700" />
              <span className="font-medium text-sm text-gray-900">Layers</span>
              {layersExpanded ? <ChevronUp className="h-4 w-4 text-gray-700" /> : <ChevronDown className="h-4 w-4 text-gray-700" />}
            </button>
            <button
              onClick={onAddLayer}
              className="w-8 h-8 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {layersExpanded && (
            <div className="flex-1 overflow-y-auto scrollbar-hidden">
              {!displayLayers || displayLayers.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No layers yet</p>
                </div>
              ) : (
                displayLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, layer.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${(displayCurrentLayer?.id === layer.id || currentLayerId === layer.id) ? 'bg-blue-50 border-blue-200' : ''
                      } ${draggedLayer === layer.id ? 'opacity-50' : ''
                      } ${dragOverIndex === index ? 'border-t-2 border-t-blue-500' : ''
                      }`}
                    onClick={() => handleLayerSelect(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Drag Handle */}
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => {
                          // Drag handle'a tıklandığında layer seçimini engelle
                          e.stopPropagation()
                        }}
                        onDragStart={(e) => {
                          // Drag handle'dan başlayan drag'i engelle, parent'ın drag'ini kullan
                          e.preventDefault()
                        }}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>

                      {/* Layer Icon */}
                      <Layers className={`w-4 h-4 ${(displayCurrentLayer?.id === layer.id || currentLayerId === layer.id)
                        ? 'text-blue-600'
                        : layer.visible !== false ? 'text-gray-700' : 'text-gray-400'
                        }`} />

                      {editingLayerId === layer.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleFinishRename}
                          onKeyDown={handleKeyPress}
                          className="h-6 text-sm flex-1"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-sm flex-1 ${(displayCurrentLayer?.id === layer.id || currentLayerId === layer.id)
                          ? 'text-blue-700 font-medium'
                          : layer.visible !== false ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                          {layer.name}
                        </span>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLayerVisibility(layer.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={layer.visible !== false ? "Hide layer" : "Show layer"}
                        >
                          {layer.visible !== false ? (
                            <Eye className="w-4 h-4 text-gray-700" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartRename(layer)
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Rename layer"
                        >
                          <Edit3 className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateLayer(layer.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Duplicate layer"
                        >
                          <Copy className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteLayer(layer.id)
                          }}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete layer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}