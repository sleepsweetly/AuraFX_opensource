"use client"

import {
  Layers,
  Brush,
  Upload,
  SlidersHorizontal,
  Wand2,
  Code,
  Code2,
  Box,
  BookOpen,
  Zap,
  Link2,
  Video
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { Layer, Element } from "@/types"
import { useSidebar } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"

interface SidebarProps {
  activePanel: string
  onPanelChange: (panel: string) => void
  layers: Layer[]
  onExportElements: (elements: Element[], simpleTransfer?: boolean) => void
  setScale?: (fn: (prev: number) => number) => void
  isTutorialActive?: boolean
  modes?: Record<string, boolean>
}



export function Sidebar(props: SidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [show3DModal, setShow3DModal] = useState(false);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [simpleTransfer, setSimpleTransfer] = useState(false); // Sade geçiş seçeneği
  const router = useRouter();
  const { toast } = useToast();

  // 3D butonuna tıklanınca modalı aç
  const handle3DButtonClick = () => {
    // Eğer tutorial bitmediyse toast göster ve açma
    if (!localStorage.getItem('tutorialDone')) {
      toast({
        title: 'Complete Tutorial First',
        description: 'Please complete the tutorial before using the 3D Editor.',
        variant: 'default',
        duration: 4000,
      });
      return;
    }
    // Varsayılan olarak ilk katmanı seç
    if (props.layers && props.layers.length > 0) {
      setSelectedLayerIds([props.layers[0].id]);
    }
    setShow3DModal(true);
  };

  // Modal onayında sadece seçili katmandaki elementleri aktar ve yönlendir
  const handle3DConfirm = () => {
    if (props.onExportElements && props.layers && selectedLayerIds.length > 0) {
      // Çoklu katman desteği - tüm seçili katmanların elementlerini birleştir
      const allElements = selectedLayerIds.flatMap(layerId => {
        const layer = props.layers.find(l => l.id === layerId);
        return layer?.elements || [];
      });
      // Sade geçiş parametresini de gönder
      props.onExportElements(allElements, simpleTransfer);
    }
    setShow3DModal(false);
    setSimpleTransfer(false);
    router.push("/3d");
  };



  // Modal iptalinde sadece modalı kapat
  const handle3DCancel = () => {
    setShow3DModal(false);
    setSimpleTransfer(false);
  };

  // Panel tipi tanımı
  type PanelType = {
    id: string;
    icon: any;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    hasUnread?: boolean;
  };

  // Tüm paneller tek listede
  const basePanels: PanelType[] = [
    { id: "layers", icon: Layers, label: "Layers" },
    { id: "tools", icon: Brush, label: "Tools" },
    { id: "import", icon: Upload, label: "Import" },
    { id: "settings", icon: SlidersHorizontal, label: "Properties" },
    { id: "modes", icon: Wand2, label: "Effects" },
    { id: "performance", icon: Zap, label: "Performance" },
  ];

  // Chain panel'i sadece chain mode açıkken ekle
  const conditionalPanels: PanelType[] = [];
  if (props.modes?.chainMode) {
    conditionalPanels.push({ id: "chain", icon: Link2, label: "Chain Sequence" });
  }
  
  // Action Recording panel'i sadece action recording mode açıkken ekle
  if (props.modes?.actionRecordingMode) {
    conditionalPanels.push({ id: "action-recording", icon: Video, label: "Action Recording" });
  }

  const bottomPanels: PanelType[] = [
    { id: "code", icon: Code, label: "Code" },
    { id: "code-edit", icon: Code2, label: "Code Edit" },
    { id: "3d", icon: Box, label: "3D Editor", onClick: handle3DButtonClick },
    { id: "help", icon: BookOpen, label: "Help & Wiki", onClick: () => window.open('/wiki', '_blank') },
    // Announcements artık toast olarak gösteriliyor
  ];

  const allPanels = [...basePanels, ...conditionalPanels, ...bottomPanels];

  const isCollapsed = state === 'collapsed';

  return (
    <motion.div
      className={"sidebar-panel h-screen max-h-screen border-r flex flex-col select-none overflow-hidden"}
      style={{
        backgroundColor: '#000000',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative'
      }}
      animate={{
        width: isCollapsed ? 80 : 240,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }}
    >
      {/* Background image with filter */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/sidebar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.4)',
          zIndex: 0
        }}
      />


      {/* Content - tek sütun halinde tüm butonlar */}
      <motion.div
        className="flex-1 flex flex-col py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative"
        style={{ zIndex: 999999999 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {allPanels.map((panel, index) => (
          <div key={panel.id}>
            <SidebarButton
              panel={panel}
              activePanel={props.activePanel}
              onPanelChange={panel.onClick ? () => panel.onClick && panel.onClick() : props.onPanelChange}
              collapsed={isCollapsed}
              hoveredPanel={hoveredPanel}
              setHoveredPanel={setHoveredPanel}
              delay={index * 0.03}
            />
            {/* Minimal ayırıcı çizgi - son buton hariç */}
            {index < allPanels.length - 1 && (
              <div className="mx-3 my-1">
                <div
                  className="h-px"
                  style={{
                    background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.03), transparent)'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </motion.div>
      {/* 3D Transfer Modal - Multiple Layer Support */}
      <AnimatePresence>
        {show3DModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: '#000000aa', backdropFilter: 'blur(4px)' }}
            onClick={handle3DCancel}
          >
            <motion.div
              className="rounded-lg p-6 w-full max-w-md border border-white/10 shadow-xl"
              style={{ backgroundColor: '#000000' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-2">Send to 3D Editor</h2>
              <p className="text-white/60 text-sm mb-4">Select layer(s) to transfer to 3D editor</p>

              {/* Sade Geçiş Seçeneği */}
              <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simpleTransfer}
                    onChange={(e) => setSimpleTransfer(e.target.checked)}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">Simple Transfer</div>
                    <div className="text-white/50 text-xs">
                      {simpleTransfer
                        ? "Clear existing 3D elements and add only 2D elements"
                        : "Add 2D elements to existing 3D elements"}
                    </div>
                  </div>
                </label>
              </div>

              {/* Multiple Layer Selection */}
              <div className="mb-6">
                <label className="block text-sm text-white/80 mb-3">Layers</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {props.layers.map(layer => (
                    <div
                      key={layer.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        const isSelected = selectedLayerIds.includes(layer.id);
                        if (isSelected) {
                          setSelectedLayerIds(selectedLayerIds.filter(id => id !== layer.id));
                        } else {
                          setSelectedLayerIds([...selectedLayerIds, layer.id]);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLayerIds.includes(layer.id)}
                        onChange={() => { }} // Handled by parent onClick
                        className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white focus:ring-2"
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white/20"
                        style={{ background: layer.color || '#fff' }}
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{layer.name}</div>
                        <div className="text-white/50 text-xs">{layer.elements?.length || 0} elements</div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedLayerIds.length > 0 && (
                  <div className="mt-3 text-sm text-white/70">
                    {selectedLayerIds.length} layer{selectedLayerIds.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handle3DCancel}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-medium border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handle3DConfirm}
                  disabled={selectedLayerIds.length === 0}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Send to 3D ({selectedLayerIds.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SidebarButton({
  panel,
  activePanel,
  onPanelChange,
  collapsed,
  hoveredPanel,
  setHoveredPanel,
  delay = 0
}: {
  panel: {
    id: string;
    icon: any;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    hasUnread?: boolean;
  },
  activePanel: string,
  onPanelChange: (panel: string) => void,
  collapsed: boolean,
  hoveredPanel: string | null,
  setHoveredPanel: (panel: string | null) => void,
  delay?: number
}) {
  const isActive = activePanel === panel.id;
  const isHovered = hoveredPanel === panel.id;

  return (
    <motion.div
      className="px-2 py-1"
      initial={{ opacity: 0, x: collapsed ? -10 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.4,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
    >
      <motion.button
        onClick={panel.disabled ? undefined : (panel.onClick ? panel.onClick : () => onPanelChange(panel.id))}
        disabled={panel.disabled}
        onMouseEnter={() => setHoveredPanel(panel.id)}
        onMouseLeave={() => setHoveredPanel(null)}
        className={`group relative w-full flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-3'} py-3 rounded-lg transition-all duration-200 text-left overflow-hidden
          ${isActive
            ? "text-white bg-white/5 border border-white/10"
            : "text-white/60 hover:bg-white/5 hover:text-white"
          } ${panel.disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{
          textShadow: isActive 
            ? '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4), 0 0 30px rgba(255,255,255,0.2)'
            : '0 0 5px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.6)',
          zIndex: 999999999
        }}
        whileHover={panel.disabled ? {} : {
          scale: collapsed ? 1.08 : 1.02,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
        whileTap={panel.disabled ? {} : {
          scale: 0.95,
          transition: { type: "spring", stiffness: 600, damping: 30 }
        }}
      >
        {/* Glow effect for active button */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              filter: 'blur(1px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Content */}
        <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} w-full`}>
          {/* Icon container */}
          <div className="relative p-1 rounded-md transition-all duration-200">
            <panel.icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-white" : "text-white/60 group-hover:text-white"
              }`} />

            {/* Unread indicator for collapsed state */}
            {panel.hasUnread && collapsed && (
              <motion.span
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-black"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          {/* Text content */}
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, x: 15, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -15, width: 0 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{panel.label}</div>
                  </div>

                  {/* Unread indicator for expanded state */}
                  {panel.hasUnread && (
                    <motion.span
                      className="ml-2 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out rounded-lg"></div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r-full"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {collapsed && isHovered && (
          <motion.div
            className="fixed px-3 py-2 border border-zinc-700 rounded-lg shadow-xl pointer-events-none"
            style={{
              backgroundColor: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              left: 84,
              top: 'var(--mouse-y, 50%)',
              zIndex: 1000
            }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
          >
            <div className="font-medium text-white text-sm">{panel.label}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

