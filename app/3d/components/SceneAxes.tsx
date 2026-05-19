"use client"

export function SceneAxes({ size = 6, visible = true }) {
  if (!visible) return null;

  const halfSize = size / 2;

  return (
    <group>
      {/* X Axis - Red (Pozitif yön kalın, negatif ince) */}
      <mesh position={[halfSize / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, halfSize]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
      
      <mesh position={[-halfSize / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, halfSize]} />
        <meshBasicMaterial color="#aa2222" transparent opacity={0.6} />
      </mesh>

      {/* Y Axis - Green */}
      <mesh position={[0, halfSize / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, halfSize]} />
        <meshBasicMaterial color="#44ff44" />
      </mesh>
      
      <mesh position={[0, -halfSize / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, halfSize]} />
        <meshBasicMaterial color="#22aa22" transparent opacity={0.6} />
      </mesh>

      {/* Z Axis - Blue */}
      <mesh position={[0, 0, halfSize / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, halfSize]} />
        <meshBasicMaterial color="#4444ff" />
      </mesh>
      
      <mesh position={[0, 0, -halfSize / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, halfSize]} />
        <meshBasicMaterial color="#2222aa" transparent opacity={0.6} />
      </mesh>

      {/* Origin point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Pozitif yön ok başları */}
      <mesh position={[halfSize, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.2]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>

      <mesh position={[0, halfSize, 0]}>
        <coneGeometry args={[0.1, 0.2]} />
        <meshBasicMaterial color="#44ff44" />
      </mesh>

      <mesh position={[0, 0, halfSize]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.2]} />
        <meshBasicMaterial color="#4444ff" />
      </mesh>
    </group>
  )
}

// Toplam sadece 10 mesh - çok minimal!
// Kullanım: <SceneAxes size={8} visible={true} />