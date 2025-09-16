import React, { useRef, useEffect } from "react"

// 8 yön + None: -1=None, 0=Up, 1=Up-Right, 2=Right, 3=Down-Right, 4=Down, 5=Down-Left, 6=Left, 7=Up-Left
const directions = [
  { label: "None", dx: 0, dy: 0 },
  { label: "Up", dx: 0, dy: -1 },
  { label: "Up-Right", dx: 1, dy: -1 },
  { label: "Right", dx: 1, dy: 0 },
  { label: "Down-Right", dx: 1, dy: 1 },
  { label: "Down", dx: 0, dy: 1 },
  { label: "Down-Left", dx: -1, dy: 1 },
  { label: "Left", dx: -1, dy: 0 },
  { label: "Up-Left", dx: -1, dy: -1 },
]

export function getDirectionLabel(idx: number) {
  if (idx === -1) return "None"
  return directions[idx + 1]?.label || "Unknown"
}

const ArrowIcon = ({ angle, size = 20, color = "currentColor" }: { angle: number, size?: number, color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.2s ease' }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 19V5M12 5L6 11M12 5L18 11" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
)

interface DirectionWidgetProps {
  value: number
  onChange: (val: number) => void
  elevation?: number
  onElevationChange?: (val: number) => void
}

export const DirectionWidget: React.FC<DirectionWidgetProps> = ({ 
  value, 
  onChange, 
  elevation = 0, 
  onElevationChange 
}) => {
  const elevationRef = useRef(elevation);
  useEffect(() => { elevationRef.current = elevation }, [elevation]);

  // Value'yu -1 ile 7 arasında normalize et (None için -1, yönler için 0-7)
  const normalizedValue = value === -1 ? -1 : Math.max(0, Math.min(7, value));

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "20px",
      margin: "20px auto"
    }}>
      {/* Ana yön widget'i */}
      <div style={{ 
        width: 160, 
        height: 160, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        position: "relative",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        borderRadius: "50%",
        padding: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
      }}>
        
        {/* Outer ring decoration */}
        <div style={{
          position: "absolute",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.1)",
          top: "10px",
          left: "10px"
        }} />
        
        {/* Inner ring decoration */}
        <div style={{
          position: "absolute",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)",
          top: "30px",
          left: "30px"
        }} />

        {/* Merkez buton (None seçeneği) */}
        <button
          onClick={() => onChange(-1)}
          style={{
            position: "absolute", 
            left: "50%", 
            top: "50%", 
            transform: "translate(-50%, -50%)",
            width: 40, 
            height: 40, 
            borderRadius: "50%",
            background: normalizedValue === -1 
              ? "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)" 
              : "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)", 
            color: normalizedValue === -1 ? "#000000" : "#ffffff", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontWeight: "bold", 
            zIndex: 3, 
            fontSize: 12,
            border: normalizedValue === -1 ? "2px solid #ffffff" : "2px solid #333333",
            cursor: "pointer",
            boxShadow: normalizedValue === -1 
              ? "0 8px 20px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" 
              : "0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          onMouseEnter={(e) => {
            if (normalizedValue !== -1) {
              e.currentTarget.style.background = "linear-gradient(135deg, #333333 0%, #444444 100%)";
              e.currentTarget.style.borderColor = "#555555";
            }
          }}
          onMouseLeave={(e) => {
            if (normalizedValue !== -1) {
              e.currentTarget.style.background = "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)";
              e.currentTarget.style.borderColor = "#333333";
            }
          }}
          title="None (No Direction)"
        >
          {normalizedValue === -1 ? "N" : "○"}
        </button>

        {/* 8 yön butonları */}
        {directions.slice(1).map((dir, idx) => {
          // Matematiksel açı hesaplama (0° = sağ, saat yönünün tersine)
          const mathAngle = (idx / 8) * 2 * Math.PI - Math.PI / 2; // -π/2 ile yukarıdan başlat
          const radius = 50;
          const x = 80 + radius * Math.cos(mathAngle);
          const y = 80 + radius * Math.sin(mathAngle);
          
          // Ok açısını hesapla - oklar dışarı doğru kendi yönlerini göstermeli
          const arrowAngle = (idx / 8) * 360;
          
          const isSelected = normalizedValue === idx;
          
          return (
            <button
              key={dir.label}
              style={{
                position: "absolute", 
                left: x - 18, 
                top: y - 18, 
                width: 36, 
                height: 36, 
                borderRadius: "50%",
                background: isSelected 
                  ? "linear-gradient(135deg, #000000 0%, #2a2a2a 100%)" 
                  : "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)", 
                color: isSelected ? "#ffffff" : "#888888", 
                border: isSelected 
                  ? "2px solid #ffffff" 
                  : "1px solid #333333",
                cursor: "pointer", 
                zIndex: 2, 
                fontSize: 18, 
                fontWeight: 600, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isSelected 
                  ? "0 8px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)" 
                  : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                transform: isSelected ? "scale(1.1)" : "scale(1)"
              }}
              onClick={() => onChange(idx)}
              title={dir.label}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "#555555";
                  e.currentTarget.style.color = "#bbbbbb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "#333333";
                  e.currentTarget.style.color = "#888888";
                }
              }}
            >
              <ArrowIcon 
                angle={arrowAngle} 
                color={isSelected ? "#ffffff" : "#888888"} 
                size={18} 
              />
            </button>
          )
        })}
        
        {/* Direction label */}
        <div style={{
          position: "absolute",
          bottom: "-40px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "500",
          textAlign: "center",
          background: "rgba(0,0,0,0.8)",
          padding: "6px 12px",
          borderRadius: "12px",
          border: "1px solid #333333"
        }}>
          {getDirectionLabel(normalizedValue)}
        </div>
      </div>

      {/* Elevation Slider */}
      {onElevationChange && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "160px",
          justifyContent: "center"
        }}>
          {/* Slider container */}
          <div style={{
            position: "relative",
            height: "120px",
            width: "40px",
            background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)",
            borderRadius: "20px",
            border: "1px solid #333333",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
          }}>
            {/* Slider track */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: "10px",
              bottom: "10px",
              width: "4px",
              background: "linear-gradient(180deg, #666666 0%, #333333 100%)",
              borderRadius: "2px",
              transform: "translateX(-50%)"
            }} />
            
            {/* Slider thumb */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                width: "20px",
                height: "20px",
                background: "linear-gradient(135deg, #000000 0%, #2a2a2a 100%)",
                borderRadius: "50%",
                border: "2px solid #ffffff",
                cursor: "pointer",
                transform: `translateX(-50%) translateY(${90 - (elevation + 50)}px)`,
                boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                transition: "all 0.2s ease"
              }}
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startElevation = elevationRef.current;
                const handleMouseMove = (e: MouseEvent) => {
                  const deltaY = startY - e.clientY;
                  const newElevation = Math.max(-50, Math.min(50, startElevation + deltaY * 0.5));
                  onElevationChange && onElevationChange(Math.round(newElevation));
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            {/* Elevation markers */}
            {[-40, -20, 0, 20, 40].map(mark => (
              <div
                key={mark}
                style={{
                  position: "absolute",
                  right: "-8px",
                  top: `${90 - (mark + 50)}px`,
                  width: "6px",
                  height: "1px",
                  background: "#555555"
                }}
              />
            ))}
          </div>
          
          {/* Elevation label */}
          <div style={{
            marginTop: "10px",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "500",
            textAlign: "center",
            background: "rgba(0,0,0,0.8)",
            padding: "4px 8px",
            borderRadius: "8px",
            border: "1px solid #333333",
            minWidth: "40px"
          }}>
            {elevation > 0 ? `+${elevation}` : elevation}°
          </div>
        </div>
      )}
    </div>
  )
}

// Static method ekleme
(DirectionWidget as any).getDirectionLabel = getDirectionLabel

// Demo component
export default function DirectionWidgetDemo() {
  const [direction, setDirection] = React.useState(-1);
  const [elevation, setElevation] = React.useState(0);
  
  return (
    <div style={{ 
      padding: "40px", 
      background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)", 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 style={{ 
        color: "#ffffff", 
        marginBottom: "30px", 
        fontSize: "24px", 
        fontWeight: "300",
        textAlign: "center"
      }}>
        Direction & Elevation Widget
      </h1>
      
      <DirectionWidget 
        value={direction} 
        onChange={setDirection}
        elevation={elevation}
        onElevationChange={setElevation}
      />
      
      <div style={{
        marginTop: "40px",
        color: "#888888",
        fontSize: "16px",
        textAlign: "center"
      }}>
        <div>
          Direction: <span style={{ color: "#ffffff", fontWeight: "600" }}>
            {getDirectionLabel(direction)} ({direction})
          </span>
        </div>
        <div style={{ marginTop: "8px" }}>
          Elevation: <span style={{ color: "#ffffff", fontWeight: "600" }}>
            {elevation > 0 ? `+${elevation}` : elevation}°
          </span>
        </div>
      </div>
    </div>
  )
}