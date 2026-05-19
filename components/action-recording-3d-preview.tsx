"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { useActionRecordingStore, type ActionRecord } from "@/store/useActionRecordingStore"
import { useLayerStore } from "@/store/useLayerStore"
import { useElementStore } from "@/store/useElementStore"
import { Play, Pause, RotateCcw, X, SkipBack, SkipForward, Maximize2, Minimize2 } from "lucide-react"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

// --- Frame builder ---
interface PreviewFrame {
  delay: number
  elements: Array<{ id: string; x: number; z: number; yOffset: number; color?: string }>
  isIdle: boolean
  sourceType: string
}

function buildPreviewFrames(records: ActionRecord[], layers: any[]): PreviewFrame[] {
  const frames: PreviewFrame[] = []
  const livePositions: Record<string, { x: number; z: number; yOffset: number; color?: string }> = {}

  const elementMap = useElementStore.getState().elements
  layers.forEach(layer => {
    layer.elements.forEach((el: any) => {
      const fresh = elementMap[el.id] || el
      livePositions[el.id] = {
        x: fresh.position.x,
        z: fresh.position.z,
        yOffset: typeof fresh.yOffset === "number" ? fresh.yOffset : 0,
        color: fresh.color || layer.color || "#ff6b35"
      }
    })
  })

  const snapshot = () => Object.entries(livePositions).map(([id, p]) => ({
    id, x: p.x, z: p.z, yOffset: p.yOffset, color: p.color
  }))

  frames.push({ delay: 0, elements: snapshot(), isIdle: false, sourceType: "start" })

  records.forEach(record => {
    if (record.type === "transform_update" || record.type === "transform_end" || record.type === "move_continuous") {
      const positions = record.data.currentPositions || record.data.positions
      if (positions && positions.length > 0) {
        positions.forEach((pos: any) => {
          if (livePositions[pos.id]) {
            livePositions[pos.id] = { ...livePositions[pos.id], x: pos.x, z: pos.z, yOffset: pos.yOffset || 0 }
          }
        })
        frames.push({ delay: Math.max(1, record.delayTicks), elements: snapshot(), isIdle: false, sourceType: record.type })
      }
    } else if (record.type === "move") {
      const { deltaX = 0, deltaZ = 0, deltaYOffset = 0 } = record.data || {} as any
      record.elementIds.forEach(id => {
        const prev = livePositions[id]
        if (prev) livePositions[id] = { ...prev, x: prev.x + deltaX, z: prev.z + deltaZ, yOffset: prev.yOffset + deltaYOffset }
      })
      frames.push({ delay: Math.max(1, record.delayTicks), elements: snapshot(), isIdle: false, sourceType: record.type })
    } else if (record.type === "element_add") {
      const pos = record.data?.position
      const yOffset = typeof record.data?.yOffset === "number" ? record.data.yOffset : 0
      const id = record.elementIds?.[0]
      if (id && pos) livePositions[id] = { x: pos.x, z: pos.z, yOffset, color: record.data?.color as string || "#ff6b35" }
    } else if (record.type === "idle") {
      frames.push({ delay: record.delayTicks, elements: snapshot(), isIdle: true, sourceType: "idle" })
    }
  })

  return frames
}

// --- Instanced particle cloud ---
function ParticleCloud({ elements, isDark }: {
  elements: Array<{ id: string; x: number; z: number; yOffset: number; color?: string }>
  isDark: boolean
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!meshRef.current) return
    const mesh = meshRef.current
    const glow = glowRef.current

    const colors = new Float32Array(elements.length * 3)
    const glowColors = new Float32Array(elements.length * 3)

    elements.forEach((el, i) => {
      dummy.position.set(el.x, el.yOffset, el.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      if (glow) glow.setMatrixAt(i, dummy.matrix)

      const c = new THREE.Color(el.color || "#ff6b35")
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      
      glowColors[i * 3] = c.r
      glowColors[i * 3 + 1] = c.g
      glowColors[i * 3 + 2] = c.b
    })

    mesh.instanceMatrix.needsUpdate = true
    mesh.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(colors, 3))
    if (glow) {
      glow.instanceMatrix.needsUpdate = true
      glow.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(glowColors, 3))
    }
  }, [elements, dummy])

  if (elements.length === 0) return null

  return (
    <group>
      {/* Outer glow aura */}
      <instancedMesh ref={glowRef} args={[undefined, undefined, elements.length]} frustumCulled={false}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshBasicMaterial vertexColors transparent opacity={isDark ? 0.25 : 0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      
      {/* Inner spark */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, elements.length]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          vertexColors
          toneMapped={false}
          emissive={isDark ? "white" : "black"}
          emissiveIntensity={isDark ? 2 : 0}
          roughness={0.1}
          metalness={0.9}
        />
      </instancedMesh>
    </group>
  )
}

// --- Cinematic grid & background ---
function Environment({ isDark }: { isDark: boolean }) {
  const floorColor = isDark ? "#020202" : "#ffffff"
  const gridColor1 = isDark ? "#1e293b" : "#e2e8f0"
  const gridColor2 = isDark ? "#0f172a" : "#f1f5f9"

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color={floorColor} 
          roughness={0.1}
          metalness={isDark ? 0.9 : 0.1}
          transparent={isDark}
          opacity={isDark ? 0.95 : 1}
        />
      </mesh>
      <primitive object={(() => {
        const grid = new THREE.GridHelper(40, 40, gridColor1, gridColor2);
        grid.position.y = -0.04;
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = isDark ? 0.15 : 0.4;
        return grid;
      })()} />
    </group>
  )
}

function CameraController({ elements }: { elements: Array<{ x: number; z: number; yOffset: number }> }) {
  const { camera } = useThree()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || elements.length === 0) return
    const avgX = elements.reduce((s, e) => s + e.x, 0) / elements.length
    const avgZ = elements.reduce((s, e) => s + e.z, 0) / elements.length
    const avgY = elements.reduce((s, e) => s + e.yOffset, 0) / elements.length
    const maxSpread = Math.max(
      ...elements.map(e => Math.abs(e.x - avgX)),
      ...elements.map(e => Math.abs(e.z - avgZ)),
      ...elements.map(e => Math.abs(e.yOffset - avgY)),
      6
    )
    camera.position.set(avgX + maxSpread * 1.8, avgY + maxSpread * 1.4, avgZ + maxSpread * 1.8)
    camera.lookAt(avgX, avgY, avgZ)
    initialized.current = true
  }, [elements, camera])

  return null
}

const ActionButton = ({ onClick, icon: Icon, active = false, title = "", isDark }: any) => (
  <button 
    onClick={onClick}
    title={title}
    className={`p-2.5 rounded-xl transition-all duration-300 ${
      active 
        ? (isDark ? "bg-white text-black shadow-lg shadow-white/10" : "bg-black text-white")
        : (isDark ? "text-zinc-500 hover:text-white hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5")
    } active:scale-95`}
  >
    <Icon className="w-4 h-4" />
  </button>
)

export default function ActionRecording3DPreview({ onClose }: { onClose: () => void }) {
  const { records } = useActionRecordingStore()
  const { layers } = useLayerStore()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const frames = useMemo(() => buildPreviewFrames(records, layers), [records, layers])
  const totalFrames = frames.length

  const currentElements = useMemo(() => {
    if (totalFrames === 0) return []
    return frames[Math.min(currentFrame, totalFrames - 1)].elements
  }, [frames, currentFrame, totalFrames])

  useEffect(() => {
    if (isPlaying && totalFrames > 1) {
      const frame = frames[currentFrame]
      const delayMs = Math.max(16, (frame?.delay || 1) * 50 / speed)
      intervalRef.current = setTimeout(() => {
        setCurrentFrame(prev => {
          if (prev >= totalFrames - 1) { setIsPlaying(false); return prev }
          return prev + 1
        })
      }, delayMs)
    }
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current) }
  }, [isPlaying, currentFrame, totalFrames, frames, speed])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handlePlayPause = useCallback(() => {
    if (currentFrame >= totalFrames - 1) setCurrentFrame(0)
    setIsPlaying(p => !p)
  }, [currentFrame, totalFrames])

  const progress = totalFrames > 1 ? (currentFrame / (totalFrames - 1)) * 100 : 0

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-8 ${
        isDark ? "bg-black/95" : "bg-zinc-100/95"
      } backdrop-blur-md`}
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative w-full overflow-hidden flex flex-col border shadow-2xl transition-all duration-500 ${
          isDark 
            ? "bg-[#050505] border-white/10 text-white" 
            : "bg-white border-zinc-200 text-zinc-900"
        } ${isFullscreen ? "h-full md:rounded-3xl" : "max-w-5xl h-[80vh] md:rounded-3xl"}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Cinematic Gradient */}
        <div className={`absolute inset-0 pointer-events-none opacity-25 ${
          isDark 
            ? "bg-[radial-gradient(circle_at_50%_-20%,_#3b82f6_0%,_transparent_60%)]" 
            : "bg-[radial-gradient(circle_at_50%_-20%,_#94a3b8_0%,_transparent_60%)]"
        }`} />

        {/* Top UI */}
        <div className={`relative z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl ${
          isDark ? "border-white/5 bg-black/40" : "border-zinc-100 bg-white/60"
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-blue-500 shadow-lg shadow-blue-500/50" : "bg-blue-600"}`} />
              <span className="text-sm font-bold tracking-tight">3D RECORDING PREVIEW</span>
            </div>
            <div className={`h-4 w-px ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
            <div className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
              {currentFrame + 1}/{totalFrames} FRM · {currentElements.length} OBJ
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFullscreen(f => !f)} className="p-2 text-zinc-500 hover:text-foreground">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className={`ml-2 w-8 h-8 flex items-center justify-center rounded-full transition-all ${isDark ? "bg-white/5 hover:bg-white hover:text-black" : "bg-zinc-100 hover:bg-black hover:text-white"}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scene */}
        <div className="flex-1 relative">
          <Canvas gl={{ antialias: true, alpha: false }}>
            <color attach="background" args={[isDark ? "#000000" : "#ffffff"]} />
            <fog attach="fog" args={[isDark ? "#000000" : "#ffffff", 25, 60]} />
            <PerspectiveCamera makeDefault fov={50} position={[15, 10, 15]} />
            <ambientLight intensity={isDark ? 0.2 : 0.5} />
            <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} intensity={isDark ? 2 : 1} color="#60a5fa" castShadow />
            <Environment isDark={isDark} />
            <CameraController elements={currentElements} />
            <ParticleCloud elements={currentElements} isDark={isDark} />
            <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          </Canvas>

          {/* Badge */}
          <div className="absolute bottom-6 left-6 pointer-events-none">
            <div className={`px-3 py-1 border rounded-lg backdrop-blur-md text-[10px] font-mono uppercase ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"}`}>
              {frames[currentFrame]?.sourceType || "static"}{frames[currentFrame]?.isIdle ? " (IDLE)" : ""}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`relative z-10 px-8 py-6 backdrop-blur-2xl border-t ${isDark ? "bg-black/80 border-white/5" : "bg-white/80 border-zinc-100"}`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div 
              className={`h-1 w-full rounded-full cursor-pointer relative ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                setIsPlaying(false)
                setCurrentFrame(Math.round(pct * (totalFrames - 1)))
              }}
            >
              <div className={`absolute inset-y-0 left-0 rounded-full ${isDark ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-black"}`} style={{ width: `${progress}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActionButton onClick={() => { setIsPlaying(false); setCurrentFrame(0) }} icon={RotateCcw} isDark={isDark} />
                <ActionButton onClick={() => { setIsPlaying(false); setCurrentFrame(p => Math.max(0, p - 1)) }} icon={SkipBack} isDark={isDark} />
                <button onClick={handlePlayPause} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-xl active:scale-95 hover:scale-110 ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
                <ActionButton onClick={() => { setIsPlaying(false); setCurrentFrame(p => Math.min(totalFrames - 1, p + 1)) }} icon={SkipForward} isDark={isDark} />
              </div>

              <div className={`flex items-center p-1 border rounded-xl ${isDark ? "bg-white/[0.03] border-white/5" : "bg-black/[0.03] border-black/5"}`}>
                {[0.5, 1, 2, 4].map(s => (
                  <button key={s} onClick={() => setSpeed(s)} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${speed === s ? (isDark ? "bg-white/10 text-white" : "bg-black/10 text-zinc-900") : "text-zinc-500 hover:text-foreground"}`}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
