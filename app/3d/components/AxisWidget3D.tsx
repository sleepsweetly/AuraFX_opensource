"use client"

import { Text } from "@react-three/drei"
import { useState } from "react"
import { use3DStore } from "../store/use3DStore"
import { cameraAnimator } from "../utils/cameraAnimator"

interface AxisWidget3DProps {
    onAxisClick?: (axis: 'x' | 'y' | 'z') => void
    showLabels?: boolean
}

// Gerçek 3D axis widget komponenti
function AxisGizmo3D({ onAxisClick, showLabels = true }: {
    onAxisClick?: (axis: 'x' | 'y' | 'z') => void
    showLabels?: boolean
}) {
    const [hoveredAxis, setHoveredAxis] = useState<string | null>(null)

    const handleAxisClick = (axis: 'x' | 'y' | 'z') => {
        onAxisClick?.(axis)
    }

    const getAxisColor = (axis: string, baseColor: string) => {
        return hoveredAxis === axis ? '#ffffff' : baseColor
    }

    return (
        <group>
            {/* X Axis - Red */}
            <group rotation={[0, 0, -Math.PI / 2]}>
                <mesh
                    position={[0.8, 0, 0]}
                    onPointerEnter={() => setHoveredAxis('x')}
                    onPointerLeave={() => setHoveredAxis(null)}
                    onClick={() => handleAxisClick('x')}
                >
                    <cylinderGeometry args={[0.03, 0.03, 1.6]} />
                    <meshBasicMaterial color={getAxisColor('x', '#ef4444')} />
                </mesh>
                <mesh
                    position={[1.7, 0, 0]}
                    rotation={[0, 0, -Math.PI / 2]}
                    onPointerEnter={() => setHoveredAxis('x')}
                    onPointerLeave={() => setHoveredAxis(null)}
                    onClick={() => handleAxisClick('x')}
                >
                    <coneGeometry args={[0.1, 0.3]} />
                    <meshBasicMaterial color={getAxisColor('x', '#ef4444')} />
                </mesh>
                {showLabels && (
                    <Text
                        position={[2.1, 0, 0]}
                        fontSize={0.3}
                        color={getAxisColor('x', '#ef4444')}
                        anchorX="center"
                        anchorY="middle"
                    >
                        X
                    </Text>
                )}
            </group>

            {/* Y Axis - Green */}
            <group>
                <mesh
                    position={[0, 0.8, 0]}
                    onPointerEnter={() => setHoveredAxis('y')}
                    onPointerLeave={() => setHoveredAxis(null)}
                    onClick={() => handleAxisClick('y')}
                >
                    <cylinderGeometry args={[0.03, 0.03, 1.6]} />
                    <meshBasicMaterial color={getAxisColor('y', '#22c55e')} />
                </mesh>
                <mesh
                    position={[0, 1.7, 0]}
                    onPointerEnter={() => setHoveredAxis('y')}
                    onPointerLeave={() => setHoveredAxis(null)}
                    onClick={() => handleAxisClick('y')}
                >
                    <coneGeometry args={[0.1, 0.3]} />
                    <meshBasicMaterial color={getAxisColor('y', '#22c55e')} />
                </mesh>
                {showLabels && (
                    <Text
                        position={[0, 2.1, 0]}
                        fontSize={0.3}
                        color={getAxisColor('y', '#22c55e')}
                        anchorX="center"
                        anchorY="middle"
                    >
                        Y
                    </Text>
                )}
            </group>

            {/* Z Axis - Blue */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh
                    position={[0, 0.8, 0]}
                    onPointerEnter={() => setHoveredAxis('z')}
                    onPointerLeave={() => setHoveredAxis(null)}
                    onClick={() => handleAxisClick('z')}
                >
                    <cylinderGeometry args={[0.03, 0.03, 1.6]} />
                    <meshBasicMaterial color={getAxisColor('z', '#3b82f6')} />
                </mesh>
                <mesh
                    position={[0, 1.7, 0]}
                    onPointerEnter={() => setHoveredAxis('z')}
                    onPointerLeave={() => setHoveredAxis(null)}
                    onClick={() => handleAxisClick('z')}
                >
                    <coneGeometry args={[0.1, 0.3]} />
                    <meshBasicMaterial color={getAxisColor('z', '#3b82f6')} />
                </mesh>
                {showLabels && (
                    <Text
                        position={[0, 2.1, 0]}
                        fontSize={0.3}
                        color={getAxisColor('z', '#3b82f6')}
                        anchorX="center"
                        anchorY="middle"
                    >
                        Z
                    </Text>
                )}
            </group>

            {/* Center sphere */}
            <mesh>
                <sphereGeometry args={[0.15]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
        </group>
    )
}

export function AxisWidget3D({
    onAxisClick,
    showLabels = true
}: AxisWidget3DProps) {
    const { updateCamera } = use3DStore()

    const handleAxisClick = async (axis: 'x' | 'y' | 'z') => {
        try {
            await cameraAnimator.animateToAxis(axis, 'positive')
            onAxisClick?.(axis)
        } catch (error) {
            console.warn('Camera animation failed:', error)

            const distance = 10
            const target = { x: 0, y: 0, z: 0 }

            let newPosition
            switch (axis) {
                case 'x':
                    newPosition = { x: distance, y: 0, z: 0 }
                    break
                case 'y':
                    newPosition = { x: 0, y: distance, z: 0 }
                    break
                case 'z':
                    newPosition = { x: 0, y: 0, z: distance }
                    break
            }

            updateCamera({ position: newPosition, target })
            onAxisClick?.(axis)
        }
    }

    // GizmoViewport içinde [0,0,0] merkezli render edilecek
    return (
        <AxisGizmo3D
            onAxisClick={handleAxisClick}
            showLabels={showLabels}
        />
    )
}