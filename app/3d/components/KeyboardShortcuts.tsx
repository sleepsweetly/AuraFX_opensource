"use client"

import { useEffect, useState } from "react"
import { use3DStore } from "../store/use3DStore"
import { AddObjectsMenu } from "./AddObjectsMenu"

export function KeyboardShortcuts() {
  const {
    currentTool,
    setCurrentTool,
    selectedVertices,
    selectedShapes,
    deleteSelectedObjects,
    undo,
    redo,
    clearAllSelections,
    selectAllObjects,
    xrayMode,
    setXrayMode,
  } = use3DStore()

  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Shift+A: Add Objects Menu
      if (event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault()
        setShowAddMenu(true)
      }

      // Q: Select Tool
      if (event.key.toLowerCase() === "q") {
        event.preventDefault()
        setCurrentTool("select")
      }

      // W: Move Tool
      if (event.key.toLowerCase() === "w") {
        event.preventDefault()
        setCurrentTool("move")
      }

      // E: Rotate Tool
      if (event.key.toLowerCase() === "e") {
        event.preventDefault()
        setCurrentTool("rotate")
      }

      // R: Scale Tool
      if (event.key.toLowerCase() === "r") {
        event.preventDefault()
        setCurrentTool("scale")
      }

      // Ctrl+A: Select All
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault()
        selectAllObjects()
      }

      // Delete: Delete selected objects
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault()
        if (selectedVertices.length > 0 || selectedShapes.length > 0) {
          deleteSelectedObjects()
        }
      }

      // Escape: Clear selection / Close add menu
      if (event.key === "Escape") {
        event.preventDefault()
        if (showAddMenu) {
          setShowAddMenu(false)
        } else {
          clearAllSelections()
        }
      }

      // Ctrl/Cmd + Z: Undo
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault()
        undo()
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey))
      ) {
        event.preventDefault()
        redo()
      }

      // Alt + Z: Toggle X-Ray Mode
      if (event.altKey && event.key.toLowerCase() === "z") {
        event.preventDefault()
        setXrayMode(!xrayMode)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    currentTool,
    selectedVertices,
    selectedShapes,
    showAddMenu,
    setCurrentTool,
    deleteSelectedObjects,
    undo,
    redo,
    clearAllSelections,
    selectAllObjects,
    xrayMode,
    setXrayMode,
  ])

  return <AddObjectsMenu isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} />
}
