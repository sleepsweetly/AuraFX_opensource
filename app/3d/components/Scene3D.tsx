"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Environment } from "@react-three/drei"
import { use3DStore } from "../store/use3DStore"
import { ElementMesh } from "./objects/ElementMesh"
import { AxesHelper } from "./AxesHelper"
import { Button } from "@/components/ui/button"
import { Send, Code } from "lucide-react"
import { generateEffectCode } from "@/app/generate-effect-code"

export function Scene3D() {
  const { layers, currentLayer, scene, exportVerticesToMainSystem } = use3DStore()

  // Görünür layer'ları al
  const visibleLayers = layers.filter((layer) => layer.visible)

  // Kod üretme fonksiyonu
  const handleGenerateCode = async () => {
    // Ana sistemdeki kod üretme fonksiyonunu çağır
    const code = await generateEffectCode(
      layers,
      { skillName: "Generated3DSkill" },
      { rotateMode: false },
      {},
      "manual",
      1,
      '3D Editor'
    )

    // Kodu kopyala
    await navigator.clipboard.writeText(code)
    alert("Kod kopyalandı!")
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [10, 10, 10],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="studio" />

        {/* Grid */}
        {scene.showGrid && (
          <Grid
            args={[20, 20]}
            cellSize={scene.gridSize}
            cellThickness={0.5}
            cellColor="#404040"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#606060"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />
        )}

        {/* Axes */}
        {scene.showAxes && <AxesHelper size={5} />}

        {/* Elements from all visible layers */}
        {visibleLayers.map((layer) =>
          layer.elements.map((element) => (
            <ElementMesh
              key={element.id}
              element={element}
              layer={layer}
              isSelected={use3DStore.getState().selectedVertices.includes(element.id) || use3DStore.getState().selectedShapes.includes(element.id)}
              isCurrentLayer={currentLayer?.id === layer.id}
            />
          )),
        )}

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
          enableDamping={true}
          maxPolarAngle={Math.PI}
          minDistance={1}
          maxDistance={100}
        />
      </Canvas>
    </div>
  )
}
