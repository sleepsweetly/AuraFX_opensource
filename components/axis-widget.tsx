import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, MoveDiagonal, Axis3D, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AxisWidgetProps {
  viewMode: "top" | "side" | "diagonal" | "isometric" | "front";
  setViewMode: (mode: "top" | "side" | "diagonal" | "isometric" | "front") => void;
}

const VIEW_ANGLES = {
  top:      { rotateX: 90, rotateY: 0, label: "Top", icon: Eye, desc: "Top-down view" },
  side:     { rotateX: 0, rotateY: 0, label: "Side", icon: Square, desc: "Side view" },
  diagonal: { rotateX: 45, rotateY: 45, label: "Diagonal", icon: MoveDiagonal, desc: "Diagonal view" },
  isometric:{ rotateX: 35.264, rotateY: 45, label: "Isometric", icon: Axis3D, desc: "3D view" },
  front:    { rotateX: 0, rotateY: 90, label: "Front", icon: EyeOff, desc: "Front view" },
};

export const AxisWidget: React.FC<AxisWidgetProps> = ({ viewMode, setViewMode }) => {
  const [animating, setAnimating] = useState(false);
  const [localView, setLocalView] = useState(viewMode);
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  const handleSwitch = () => {
    // Sadece aktif view mode'lar arasında geçiş yap
    const activeModes: Array<"top" | "side"> = ["top", "side"];
    const currentIndex = activeModes.indexOf(viewMode as "top" | "side");
    const nextIndex = (currentIndex + 1) % activeModes.length;
    setViewMode(activeModes[nextIndex]);
  };

  const handleViewSelect = (mode: "top" | "side" | "diagonal" | "isometric" | "front") => {
    // Sadece top ve side view mode'ları aktif
    if (mode === "diagonal" || mode === "isometric" || mode === "front") {
      toast({
        title: "Feature Temporarily Disabled 🔧",
        description: `The ${VIEW_ANGLES[mode].label} view mode has been temporarily disabled due to technical issues. It will be restored in the next update.`,
        duration: 4000,
      });
      setShowMenu(false);
      return;
    }
    
    setViewMode(mode);
    setShowMenu(false);
  };

  React.useEffect(() => {
    if (!animating) setLocalView(viewMode);
  }, [viewMode, animating]);

  const { rotateX, rotateY } = VIEW_ANGLES[localView];
  const style = {
    transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
    transition: animating ? "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)" : undefined,
  } as React.CSSProperties;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        initial={false}
        animate={{
          backgroundColor: "#000000",
          color: "#fff",
          borderColor: viewMode === "top" ? "#666666" : "#ffffff20",
          boxShadow: viewMode === "top" ? "0 0 20px #66666633" : "0 2px 12px #0008",
          scale: 1,
        }}
        whileHover={{
          backgroundColor: "#1a1a1a",
          borderColor: "#666666",
          color: "#fff",
          scale: 1.05,
          boxShadow: "0 0 25px #66666633",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          border: "1px solid",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          margin: 0,
          padding: 0,
          position: "relative",
        }}
        title={`Current: ${VIEW_ANGLES[viewMode].label} - Click to change`}
      >
        <motion.div
          animate={{ rotateY: showMenu ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 18,
            marginBottom: 2,
            filter: viewMode === "top" ? "drop-shadow(0 0 8px #666666)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {React.createElement(VIEW_ANGLES[viewMode].icon, { size: 20 })}
        </motion.div>
        <div style={{
          fontSize: 8,
          fontWeight: 600,
          color: viewMode === "top" ? "#666666" : "#ffffff80",
          textAlign: "center",
          lineHeight: 1,
        }}>
          {VIEW_ANGLES[viewMode].label}
        </div>
        {/* Active indicator */}
        {viewMode === "top" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#666666",
              border: "2px solid #000000",
              boxShadow: "0 0 8px #666666",
            }}
          />
        )}
      </motion.button>
      {/* View Mode Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            position: "absolute",
            top: 52,
            right: 0,
            background: "#000000",
            border: "1px solid #ffffff20",
            borderRadius: 12,
            padding: 8,
            boxShadow: "0 8px 32px #000000cc",
            zIndex: 1000,
            minWidth: 160,
            backdropFilter: "blur(10px)",
          }}
        >
          {Object.entries(VIEW_ANGLES).map(([mode, config], index) => {
            const Icon = config.icon;
            const isActive = viewMode === mode;
            
            return (
              <motion.button
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleViewSelect(mode as any)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: isActive ? "#ffffff10" : "transparent",
                  color: "#fff",
                  border: isActive ? "1px solid #666666" : "1px solid transparent",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 2,
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: isActive ? "#ffffff15" : "#ffffff05",
                  borderColor: "#666666",
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{ rotateY: isActive ? 360 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{
                    fontSize: 18,
                    width: 24,
                    textAlign: "center",
                    filter: isActive ? "drop-shadow(0 0 8px #666666)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {React.createElement(Icon, { size: 18 })}
                </motion.div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ 
                    fontWeight: 600, 
                    color: isActive ? "#666666" : "#fff",
                    fontSize: 13,
                  }}>
                    {config.label}
                  </div>
                  <div style={{ 
                    fontSize: 10, 
                    color: isActive ? "#666666aa" : "#ffffff60", 
                    marginTop: 1,
                    fontWeight: 400,
                  }}>
                    {config.desc}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
      <div style={{
        position: "absolute",
        left: "50%",
        top: 52,
        transform: "translateX(-50%)",
        background: "#000000",
        color: "#fff",
        fontSize: 11,
        padding: "4px 8px",
        borderRadius: 6,
        opacity: 0.92,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 100,
        fontWeight: 500,
        boxShadow: "0 2px 8px #0005",
        display: "none"
      }}
      className="axis-widget-tooltip"
      >
        {VIEW_ANGLES[viewMode].label}
      </div>
    </div>
  );
};