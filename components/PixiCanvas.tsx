import { Stage, Container, Graphics } from '@inlet/react-pixi'
import React from 'react'

type Point = { x: number; y: number; color: number }

interface PixiCanvasProps {
  width: number
  height: number
  points: Point[]
}

const PointCloud: React.FC<{ points: Point[] }> = ({ points }) => (
  <Graphics
    draw={g => {
      g.clear()
      points.forEach(pt => {
        g.beginFill(pt.color)
        g.drawCircle(pt.x, pt.y, 2)
        g.endFill()
      })
    }}
  />
)

export const PixiCanvas: React.FC<PixiCanvasProps> = ({ width, height, points }) => (
  <Stage width={width} height={height} options={{ backgroundColor: 0x000000 }}>
    <Container>
      <PointCloud points={points} />
    </Container>
  </Stage>
) 