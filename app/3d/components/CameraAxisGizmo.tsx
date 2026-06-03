"use client"

import { useMemo, useRef } from "react"
import { Spherical, Vector3 } from "three"
import { use3DStore } from "../store/use3DStore"

type AxisName = "x" | "y" | "z"

interface AxisPoint {
  id: string
  axis: AxisName
  sign: 1 | -1
  label: string
  color: string
  position: Vector3
  x: number
  y: number
  depth: number
}

const AXES: Array<Pick<AxisPoint, "axis" | "label" | "color" | "position">> = [
  { axis: "x", label: "X", color: "#ff2f68", position: new Vector3(1, 0, 0) },
  { axis: "y", label: "Y", color: "#1fd084", position: new Vector3(0, 1, 0) },
  { axis: "z", label: "Z", color: "#2f74ff", position: new Vector3(0, 0, 1) },
]

export function CameraAxisGizmo() {
  const { camera, updateCamera } = use3DStore()
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const draggedRef = useRef(false)

  const points = useMemo(() => {
    const cameraPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z)
    const target = new Vector3(camera.target.x, camera.target.y, camera.target.z)
    const forward = target.clone().sub(cameraPosition).normalize()

    let right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize()
    if (right.lengthSq() < 0.0001) {
      right = new Vector3(1, 0, 0)
    }

    const up = new Vector3().crossVectors(right, forward).normalize()
    const radius = 34

    return AXES.flatMap((axis) => {
      return ([1, -1] as const).map((sign) => {
        const direction = axis.position.clone().multiplyScalar(sign)
        return {
          id: `${axis.axis}-${sign}`,
          axis: axis.axis,
          sign,
          label: sign === 1 ? axis.label : "",
          color: axis.color,
          position: direction,
          x: direction.dot(right) * radius,
          y: -direction.dot(up) * radius,
          depth: direction.dot(forward),
        }
      })
    }).sort((a, b) => b.depth - a.depth)
  }, [camera.position.x, camera.position.y, camera.position.z, camera.target.x, camera.target.y, camera.target.z])

  const center = 48

  const orbitCamera = (deltaX: number, deltaY: number) => {
    const cameraPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z)
    const target = new Vector3(camera.target.x, camera.target.y, camera.target.z)
    const offset = cameraPosition.sub(target)
    const spherical = new Spherical().setFromVector3(offset)

    spherical.theta -= deltaX * 0.01
    spherical.phi = Math.max(0.08, Math.min(Math.PI - 0.08, spherical.phi - deltaY * 0.01))

    const nextPosition = target.clone().add(new Vector3().setFromSpherical(spherical))

    updateCamera({
      position: { x: nextPosition.x, y: nextPosition.y, z: nextPosition.z },
      target: { x: target.x, y: target.y, z: target.z },
    })
  }

  const focusAxis = (axis: AxisName, sign: 1 | -1) => {
    const currentPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z)
    const target = new Vector3(camera.target.x, camera.target.y, camera.target.z)
    const distance = Math.max(currentPosition.distanceTo(target), 6)

    const direction =
      axis === "x"
        ? new Vector3(sign, 0, 0)
        : axis === "y"
          ? new Vector3(0, sign, 0)
          : new Vector3(0, 0, sign)

    const nextPosition = target.clone().add(direction.multiplyScalar(distance))

    updateCamera({
      position: { x: nextPosition.x, y: nextPosition.y, z: nextPosition.z },
      target: { x: target.x, y: target.y, z: target.z },
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 h-24 w-24 select-none">
      <svg
        viewBox="0 0 96 96"
        className="h-full w-full touch-none overflow-visible"
        onPointerDown={(event) => {
          const target = event.currentTarget
          target.setPointerCapture(event.pointerId)
          lastPointerRef.current = { x: event.clientX, y: event.clientY }
          draggedRef.current = false
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return

          const previousX = lastPointerRef.current.x
          const previousY = lastPointerRef.current.y
          const deltaX = event.clientX - previousX
          const deltaY = event.clientY - previousY

          if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
            if (Math.abs(deltaX) + Math.abs(deltaY) > 2) {
              draggedRef.current = true
            }
            orbitCamera(deltaX, deltaY)
          }

          lastPointerRef.current = { x: event.clientX, y: event.clientY }
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
      >
        <circle cx={center} cy={center} r="4" fill="#ffffff" opacity="0.9" />

        {points.map((point) => {
          const isBehind = point.depth > 0.08

          return (
            <line
              key={`line-${point.id}`}
              x1={center}
              y1={center}
              x2={center + point.x}
              y2={center + point.y}
              stroke={point.color}
              strokeWidth={point.sign === 1 ? 3 : 2}
              strokeLinecap="round"
              opacity={isBehind ? 0.26 : 0.9}
            />
          )
        })}

        {points.map((point) => {
          const isPositive = point.sign === 1
          const isBehind = point.depth > 0.08
          const size = isPositive ? (isBehind ? 18 : 22) : (isBehind ? 10 : 13)

          return (
            <g
              key={`point-${point.id}`}
              role="button"
              tabIndex={0}
              className="cursor-pointer outline-none"
              onClick={(event) => {
                event.stopPropagation()
                if (draggedRef.current) {
                  draggedRef.current = false
                  return
                }
                focusAxis(point.axis, point.sign)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  focusAxis(point.axis, point.sign)
                }
              }}
            >
              <circle
                cx={center + point.x}
                cy={center + point.y}
                r={size / 2}
                fill={point.color}
                opacity={isBehind ? 0.42 : isPositive ? 1 : 0.86}
                className="transition-opacity hover:opacity-80"
              />
              {point.label && !isBehind && (
                <text
                  x={center + point.x}
                  y={center + point.y + 4}
                  textAnchor="middle"
                  className="pointer-events-none fill-black text-[11px] font-bold"
                >
                  {point.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
