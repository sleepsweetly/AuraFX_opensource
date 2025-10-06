"use client"

import React, { useState } from "react";
import { ImageIcon, FileStack, Download, ChevronDown, ChevronUp, FileText, Film, Palette } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import { motion, AnimatePresence } from "framer-motion";
import * as yaml from 'js-yaml';
import { parseGIF, decompressFrames } from 'gifuct-js';

// OpenCV.js için global type tanımı
declare global {
  interface Window {
    cv: any;
    addYamlElements?: (elements: any[]) => void;
    addGifElements?: (elements: any[], frameCount: number) => void;
    addPngElements?: (elements: any[]) => void;
    addObjElements?: (elements: any[]) => void;
  }
}

// OpenCV yüklenene kadar bekleyecek bir fonksiyon
function waitForOpenCV(callback: () => void) {
  if (window.cv && window.cv.imread) {
    callback();
  } else {
    setTimeout(() => waitForOpenCV(callback), 100);
  }
}

// Helper to get pixel color as hex
function getPixelColor(x: number, y: number, imageData: ImageData): string {
  const idx = (y * imageData.width + x) * 4;
  const r = imageData.data[idx];
  const g = imageData.data[idx + 1];
  const b = imageData.data[idx + 2];
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Basit sampling fonksiyonu
function performSampling({ method, maxElements, targetSize, imageData, color, imageColorMode }: {
  method: string,
  maxElements: number,
  targetSize: number,
  imageData: ImageData,
  color: string,
  imageColorMode?: boolean,
}): Array<{
  id: string;
  type: 'image';
  position: { x: number; z: number };
  color: string;
  yOffset: number;
}> {
  const elements: Array<{
    id: string;
    type: 'image';
    position: { x: number; z: number };
    color: string;
    yOffset: number;
  }> = [];

  const candidates: any[] = [];
  for (let y = 0; y < targetSize; y += 2) {
    for (let x = 0; x < targetSize; x += 2) {
      const index = (y * targetSize + x) * 4;
      const a = imageData.data[index + 3];
      if (a > 10) {
        const worldX = (x - targetSize / 2) / 10;
        const worldZ = (y - targetSize / 2) / 10;
        const colorVal = imageColorMode ? getPixelColor(x, y, imageData) : color;
        candidates.push({
          id: `pixel-${x}-${y}`,
          type: 'image',
          position: { x: worldX, z: worldZ },
          color: colorVal,
          yOffset: 0,
        });
      }
    }
  }

  const total = candidates.length;
  if (total === 0) return [];

  if (total <= maxElements) {
    return candidates;
  } else {
    for (let i = 0; i < maxElements; i++) {
      const idx = Math.floor(i * total / maxElements);
      elements.push(candidates[idx]);
    }
  }

  return elements;
}

// GIF frame'lerini elementlere dönüştür
function processGIFFrames(frames: any[], settings: any) {
  const allElements: any[] = [];
  const maxElementsPerFrame = Math.max(1000, Math.floor(settings.maxElements / frames.length));

  frames.forEach((frame, frameIndex) => {
    const frameElements = extractElementsFromFrame(frame.imageData, {
      ...settings,
      maxElements: maxElementsPerFrame,
      frameIndex: frameIndex,
    });

    frameElements.forEach(element => {
      element.frameIndex = frameIndex;
      element.totalFrames = frames.length;
      element.animationGroup = `gif-animation`;
      allElements.push(element);
    });
  });

  if (window.addGifElements) {
    window.addGifElements(allElements, frames.length);
  } else if (window.addPngElements) {
    window.addPngElements(allElements);
  }
}

function extractElementsFromFrame(imageData: ImageData, settings: any) {
  const elements: any[] = [];
  const { width, height } = imageData;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const a = imageData.data[index + 3];
      if (a > 10) {
        const worldX = (x - width / 2) / 10;
        const worldZ = (y - height / 2) / 10;
        const colorVal = settings.imageColorMode
          ? getPixelColor(x, y, imageData)
          : settings.color;
        elements.push({
          id: `frame-${settings.frameIndex}-${x}-${y}`,
          type: 'image',
          position: { x: worldX, z: worldZ },
          color: colorVal,
          yOffset: 0,
        });
      }
    }
  }

  return elements.slice(0, settings.maxElements);
}

// GIF YÜKLEME FONKSİYONU
async function loadGifWithLibrary(file: File, settings: any) {
  const buffer = await file.arrayBuffer();
  const parsedGif = parseGIF(buffer);
  const decompressedFrames = decompressFrames(parsedGif, true);

  if (!decompressedFrames || decompressedFrames.length === 0) {
    alert("Bu GIF dosyası işlenemedi.");
    return;
  }

  const framesData = decompressedFrames.map((frame, index) => {
    const frameImageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );

    return {
      frameIndex: index,
      imageData: frameImageData,
      delay: frame.delay,
    };
  });

  processGIFFrames(framesData, settings);
}

interface ImportPanelProps {
  settings?: any
  onSettingsChange?: (s: any) => void
}

export function ImportPanel({ settings, onSettingsChange }: ImportPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pngExpanded, setPngExpanded] = useState(true);
  const [objExpanded, setObjExpanded] = useState(false);
  const [gifExpanded, setGifExpanded] = useState(false);
  const [yamlExpanded, setYamlExpanded] = useState(false);

  // Settings with defaults
  const pngSize = settings?.pngSize ?? 200;
  const maxElements = settings?.maxElements ?? 10000;
  const objScale = settings?.objScale ?? 1;

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      loadPngFile(file);
    } else if (fileName.endsWith('.obj')) {
      loadObjFile(file);
    } else if (fileName.endsWith('.gif')) {
      loadGifWithLibrary(file, settings);
    } else if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
      loadYamlFile(file);
    } else {
      alert('Unsupported file format. Please use PNG, OBJ, GIF, or YAML files.');
    }
  };

  const handleFileUpload = (type: "png" | "obj" | "yaml" | "gif") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "png" ? "image/png,image/jpg,image/jpeg" :
      type === "obj" ? ".obj" :
        type === "gif" ? "image/gif" : ".yaml,.yml";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (type === "png") {
        loadPngFile(file);
      } else if (type === "obj") {
        loadObjFile(file);
      } else if (type === "yaml") {
        loadYamlFile(file);
      } else if (type === "gif") {
        loadGifWithLibrary(file, settings);
      }
    };
    input.click();
  };

  const loadPngFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = pngSize;
        canvas.height = pngSize;
        ctx.drawImage(img, 0, 0, pngSize, pngSize);

        const imageData = ctx.getImageData(0, 0, pngSize, pngSize);

        const elements = performSampling({
          method: 'pixel',
          maxElements,
          targetSize: pngSize,
          imageData,
          color: settings?.color || '#ff6b35',
          imageColorMode: !!settings?.imageColorMode,
        });

        if (window.addPngElements) {
          window.addPngElements(elements);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const loadObjFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const objData = event.target?.result as string;
      const lines = objData.split("\n");
      const vertices: any[] = [];

      lines.forEach((line) => {
        if (line.startsWith("v ")) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 4) {
            const x_blender = parseFloat(parts[1]);
            const y_blender = parseFloat(parts[2]);
            const z_blender = parseFloat(parts[3]);

            const x = x_blender * objScale;
            const z = -z_blender * objScale;
            const y = y_blender * objScale;

            vertices.push({
              id: `obj-${vertices.length}`,
              type: "obj",
              position: { x: x, z: z },
              color: settings?.color || '#ff6b35',
              yOffset: y,
            });
          }
        }
      });

      const finalVertices = settings?.objPerformance ? vertices.filter((_, index) => index % 4 === 0) : vertices;
      if (window.addObjElements) {
        window.addObjElements(finalVertices);
      }
    };
    reader.readAsText(file);
  };

  const loadYamlFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const yamlData = event.target?.result as string;
        const parsed = yaml.load(yamlData) as any;

        const elements: any[] = [];
        // Basit YAML parsing - gerçek implementasyon daha karmaşık olacak

        if (window.addYamlElements) {
          window.addYamlElements(elements);
        }
      } catch (error) {
        console.error('YAML parsing error:', error);
        alert('Invalid YAML file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <FileStack className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Import Files</h3>
            <p className="text-sm text-gray-500">Convert various file formats to elements</p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Indicator */}
      {isDragOver && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg text-center">
          <p className="text-blue-700 text-sm font-medium">📁 Drop file here</p>
          <p className="text-blue-500 text-xs mt-1">PNG, OBJ, GIF, YAML files supported</p>
        </div>
      )}

      {/* PNG Import Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setPngExpanded(!pngExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">PNG Import</h4>
              <p className="text-xs text-gray-500">Convert images to elements</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: pngExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {pngExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* PNG Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Size</span>
                    <span className="text-xs text-gray-500">{pngSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={512}
                    step={8}
                    value={pngSize}
                    onChange={(e) => onSettingsChange?.({ ...settings, pngSize: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                  />
                </div>

                {/* Max Elements */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Elements</span>
                    <span className="text-xs text-gray-500">{maxElements.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={20000}
                    step={100}
                    value={maxElements}
                    onChange={(e) => onSettingsChange?.({ ...settings, maxElements: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                  />
                </div>

                {/* Image Color Mode */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Use Image Colors</span>
                  <div
                    onClick={() => onSettingsChange?.({ ...settings, imageColorMode: !settings?.imageColorMode })}
                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${settings?.imageColorMode ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${settings?.imageColorMode ? 'left-5' : 'left-0.5'
                        }`}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFileUpload("png")}
                  className="w-full py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Import PNG
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OBJ Import Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setObjExpanded(!objExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <FileStack className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">OBJ Import</h4>
              <p className="text-xs text-gray-500">Convert 3D models to elements</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: objExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {objExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* OBJ Scale */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Scale</span>
                    <span className="text-xs text-gray-500">{objScale}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={objScale}
                    onChange={(e) => onSettingsChange?.({ ...settings, objScale: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-modern"
                  />
                </div>

                {/* Performance Mode */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Performance Mode</span>
                  <div
                    onClick={() => onSettingsChange?.({ ...settings, objPerformance: !settings?.objPerformance })}
                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${settings?.objPerformance ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${settings?.objPerformance ? 'left-5' : 'left-0.5'
                        }`}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFileUpload("obj")}
                  className="w-full py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Import OBJ
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GIF Import Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setGifExpanded(!gifExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Film className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">GIF Import</h4>
              <p className="text-xs text-gray-500">Convert animated GIFs to layers</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: gifExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {gifExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFileUpload("gif")}
                  className="w-full py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Import GIF
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* YAML Import Section */}
      <div className="flex-shrink-0 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setYamlExpanded(!yamlExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">YAML Import</h4>
              <p className="text-xs text-gray-500">Convert MythicMobs files</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: yamlExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {yamlExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFileUpload("yaml")}
                  className="w-full py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Import YAML
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Auto-group circles function for element store
export function autoGroupCirclesOnElements(elements: any[], threshold: number = 5) {
  // Simple grouping logic - group elements that are close to each other
  const groups: any[][] = [];
  const processed = new Set<string>();

  elements.forEach(element => {
    if (processed.has(element.id)) return;

    const group = [element];
    processed.add(element.id);

    // Find nearby elements
    elements.forEach(otherElement => {
      if (processed.has(otherElement.id) || element.id === otherElement.id) return;

      const distance = Math.sqrt(
        Math.pow(element.position.x - otherElement.position.x, 2) +
        Math.pow(element.position.z - otherElement.position.z, 2)
      );

      if (distance <= threshold) {
        group.push(otherElement);
        processed.add(otherElement.id);
      }
    });

    if (group.length > 1) {
      groups.push(group);
    }
  });

  return groups;
}