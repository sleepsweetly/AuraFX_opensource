"use client"

import { use3DStore } from "../store/use3DStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Box, Circle, Minus } from "lucide-react"

export function AddMenu() {
  const { showAddMenu, toggleAddMenu, createBox, createSphere, createLine, addElement, currentLayer } = use3DStore()

  if (!showAddMenu || !currentLayer) {
    return null
  }

  const handleAddShape = (shapeType: string) => {
    const centerPosition = { x: 0, z: 0 }

    switch (shapeType) {
      case "box":
        createBox(centerPosition, 2)
        break
      case "sphere":
        createSphere(centerPosition, 1)
        break
      case "line":
        createLine({ x: -2, z: 0 }, { x: 2, z: 0 })
        break
    }

    toggleAddMenu()
  }

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-zinc-800 border-zinc-700 w-80">
        <CardHeader>
          <CardTitle className="text-zinc-200 flex items-center justify-between">
            Add Object
            <Button variant="ghost" size="sm" onClick={toggleAddMenu} className="text-zinc-400 hover:text-zinc-200">
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-zinc-600 hover:bg-zinc-700"
            onClick={() => handleAddShape("box")}
          >
            <Box className="h-8 w-8 mb-2" />
            <span className="text-sm">Box</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-zinc-600 hover:bg-zinc-700"
            onClick={() => handleAddShape("sphere")}
          >
            <Circle className="h-8 w-8 mb-2" />
            <span className="text-sm">Sphere</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-zinc-600 hover:bg-zinc-700"
            onClick={() => handleAddShape("line")}
          >
            <Minus className="h-8 w-8 mb-2" />
            <span className="text-sm">Line</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-zinc-600 hover:bg-zinc-700"
            onClick={() => {
              addElement({
                type: "circle",
                position: { x: 0, z: 0 },
                yOffset: 0,
                color: currentLayer.color,
              })
              toggleAddMenu()
            }}
          >
            <Circle className="h-8 w-8 mb-2" />
            <span className="text-sm">Point</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
