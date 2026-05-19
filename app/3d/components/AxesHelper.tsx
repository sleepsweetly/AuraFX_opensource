"use client"

export function AxesHelper({ size = 5 }: { size?: number }) {
  return (
    <group>
      {/* X Axis - Red (horizontal, left-right) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, size]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Y Axis - Green (vertical, up-down) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, size]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Z Axis - Blue (horizontal, depth) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, size]} />
        <meshBasicMaterial color="#0000ff" />
      </mesh>

      {/* Origin point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}