import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, FileStack, Settings2, Download, Info, ChevronDown, ChevronUp, ChevronRight, FileText, Film, Palette, Grid3X3, Layers } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DBSCAN } from 'density-clustering';
import * as yaml from 'js-yaml';
import { parseGIF, decompressFrames } from 'gifuct-js';

// density-clustering types declaration
// Eğer @types yoksa aşağıdaki satırı ekleyin:
declare module 'density-clustering';

// OpenCV.js için global type tanımı
declare global {
  interface Window {
    cv: any;
    addYamlElements?: (elements: any[]) => void;
    addGifLayers?: (layers: any[]) => void;
    addGifElements?: (elements: any[], frameCount: number) => void;
    addPngElements?: (elements: any[]) => void;
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

// Basit Zhang-Suen thinning (skeletonization) algoritması
function skeletonize(imageData: ImageData, width: number, height: number) {
  // 0: background, 1: foreground
  const bin = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = imageData.data[idx + 3];
      bin[y * width + x] = a > 50 ? 1 : 0;
    }
  }
  let changed;
  do {
    changed = false;
    // Step 1
    const toRemove = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        if (bin[i] !== 1) continue;
        const p2 = bin[(y - 1) * width + x];
        const p3 = bin[(y - 1) * width + (x + 1)];
        const p4 = bin[y * width + (x + 1)];
        const p5 = bin[(y + 1) * width + (x + 1)];
        const p6 = bin[(y + 1) * width + x];
        const p7 = bin[(y + 1) * width + (x - 1)];
        const p8 = bin[y * width + (x - 1)];
        const p9 = bin[(y - 1) * width + (x - 1)];
        const neighbors = [p2, p3, p4, p5, p6, p7, p8, p9];
        const transitions = neighbors.reduce((acc, v, idx, arr) => acc + ((v === 0 && arr[(idx + 1) % 8] === 1) ? 1 : 0), 0);
        const count = neighbors.reduce((acc, v) => acc + v, 0);
        if (
          2 <= count && count <= 6 &&
          transitions === 1 &&
          p2 * p4 * p6 === 0 &&
          p4 * p6 * p8 === 0
        ) {
          toRemove.push(i);
        }
      }
    }
    if (toRemove.length > 0) changed = true;
    toRemove.forEach(i => bin[i] = 0);
    // Step 2
    toRemove.length = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        if (bin[i] !== 1) continue;
        const p2 = bin[(y - 1) * width + x];
        const p3 = bin[(y - 1) * width + (x + 1)];
        const p4 = bin[y * width + (x + 1)];
        const p5 = bin[(y + 1) * width + (x + 1)];
        const p6 = bin[(y + 1) * width + x];
        const p7 = bin[(y + 1) * width + (x - 1)];
        const p8 = bin[y * width + (x - 1)];
        const p9 = bin[(y - 1) * width + (x - 1)];
        const neighbors = [p2, p3, p4, p5, p6, p7, p8, p9];
        const transitions = neighbors.reduce((acc, v, idx, arr) => acc + ((v === 0 && arr[(idx + 1) % 8] === 1) ? 1 : 0), 0);
        const count = neighbors.reduce((acc, v) => acc + v, 0);
        if (
          2 <= count && count <= 6 &&
          transitions === 1 &&
          p2 * p4 * p8 === 0 &&
          p2 * p6 * p8 === 0
        ) {
          toRemove.push(i);
        }
      }
    }
    if (toRemove.length > 0) changed = true;
    toRemove.forEach(i => bin[i] = 0);
  } while (changed);
  // Sonuç: bin dizisinde 1 olanlar iskelet
  return bin;
}

// Komşu sayısı haritası çıkarıcı fonksiyon
function getNeighborCounts(skel: any, width: number, height: number): Map<number, number> {
  const counts = new Map<number, number>();
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (skel.ucharPtr(y, x)[0] === 0) continue;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (skel.ucharPtr(y + dy, x + dx)[0] > 0) {
            count++;
          }
        }
      }
      counts.set(y * width + x, count);
    }
  }
  return counts;
}

type Point = [number, number];
type Path = Point[];

function traceSkeleton(skel: any): Path[] {
  const { cols: width, rows: height } = skel;
  const neighborCounts = getNeighborCounts(skel, width, height);
  const visited = new Set<number>();
  const allPaths: Path[] = [];
  const endpoints: Point[] = [];
  neighborCounts.forEach((count, index) => {
    if (count === 1) {
      const y = Math.floor(index / width);
      const x = index % width;
      endpoints.push([x, y]);
    }
  });
  function trace(startX: number, startY: number) {
    const startIndex = startY * width + startX;
    if (visited.has(startIndex) || skel.ucharPtr(startY, startX)[0] === 0) {
      return;
    }
    const path: Path = [[startX, startY]];
    visited.add(startIndex);
    let currX = startX;
    let currY = startY;
    while (true) {
      const currentIndex = currY * width + currX;
      const neighborCount = neighborCounts.get(currentIndex) || 0;
      if (neighborCount !== 2 && path.length > 1) {
        break;
      }
      let foundNext = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nextX = currX + dx;
          const nextY = currY + dy;
          const nextIndex = nextY * width + nextX;
          if (
            nextX >= 0 && nextX < width && nextY >= 0 && nextY < height &&
            skel.ucharPtr(nextY, nextX)[0] > 0 && !visited.has(nextIndex)
          ) {
            visited.add(nextIndex);
            path.push([nextX, nextY]);
            currX = nextX;
            currY = nextY;
            foundNext = true;
            break;
          }
        }
        if (foundNext) break;
      }
      if (!foundNext) break;
    }
    if (path.length > 1) {
      allPaths.push(path);
    }
  }
  for (const [x, y] of endpoints) {
    trace(x, y);
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (skel.ucharPtr(y, x)[0] > 0 && !visited.has(y * width + x)) {
        trace(x, y);
      }
    }
  }
  return allPaths;
}

// Reservoir sampling helper
function reservoirSample<T>(arr: T[], k: number): T[] {
  const reservoir = arr.slice(0, k);
  for (let i = k; i < arr.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < k) reservoir[j] = arr[i];
  }
  return reservoir;
}

// Helper to get pixel color as hex
function getPixelColor(x: number, y: number, imageData: ImageData): string {
  const idx = (y * imageData.width + x) * 4;
  const r = imageData.data[idx];
  const g = imageData.data[idx + 1];
  const b = imageData.data[idx + 2];
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function findCirclePath(elements: any[], maxStepDist = 2, minPoints = 10) {
  if (elements.length < minPoints) return null;
  let start = elements.reduce((min: any, e: any) => e.position.x < min.position.x ? e : min, elements[0]);
  let path = [start];
  let used = new Set([start.id]);
  let current = start;

  while (true) {
    // Kullanılmayanlar arasından mesafeye göre sırala
    let candidates = elements.filter((e: any) => !used.has(e.id));
    if (candidates.length === 0) break;
    candidates.sort((a: any, b: any) => {
      const da = Math.hypot(a.position.x - current.position.x, a.position.z - current.position.z);
      const db = Math.hypot(b.position.x - current.position.x, b.position.z - current.position.z);
      return da - db;
    });

    // Sırayla dene: ilk uygun olanı bul
    let found = false;
    for (let e of candidates) {
      let dist = Math.hypot(e.position.x - current.position.x, e.position.z - current.position.z);
      if (dist <= maxStepDist) {
        path.push(e);
        used.add(e.id);
        current = e;
        found = true;
        break;
      }
    }
    if (!found) break; // Hiçbiri uymuyorsa path biter
  }

  // Path kapanıyor mu?
  let distStartEnd = Math.hypot(path[0].position.x - path[path.length - 1].position.x, path[0].position.z - path[path.length - 1].position.z);
  if (distStartEnd > maxStepDist * 1.5) return null;

  // Dairelik kontrolü
  let centerX = path.reduce((sum: number, e: any) => sum + e.position.x, 0) / path.length;
  let centerZ = path.reduce((sum: number, e: any) => sum + e.position.z, 0) / path.length;
  let distances = path.map((e: any) => Math.hypot(e.position.x - centerX, e.position.z - centerZ));
  let avg = distances.reduce((a: number, b: number) => a + b, 0) / distances.length;
  let std = Math.sqrt(distances.reduce((a: number, d: number) => a + (d - avg) ** 2, 0) / distances.length);
  if (std < avg * 0.20 && path.length > minPoints) return path;
  return null;
}

function groupCircles(elements: Array<any>, gridSize: number) {
  const minPoints = 10;
  const maxStepDist = gridSize * 2.5;
  let remaining = [...elements];
  let groupCounter = 0;
  let totalCircles = 0;

  while (remaining.length >= minPoints) {
    const path = findCirclePath(remaining, maxStepDist, minPoints);
    if (!path) break;
    // Circle olarak işaretle
    const groupId = `circle-png-ring-${groupCounter++}`;
    for (const e of path) {
      e.type = 'circle';
      e.groupId = groupId;
    }
    totalCircles++;
    // Kalanlardan çıkar
    const usedIds = new Set(path.map((e: any) => e.id));
    remaining = remaining.filter((e: any) => !usedIds.has(e.id));
    // Log
    let centerX = path.reduce((sum: number, e: any) => sum + e.position.x, 0) / path.length;
    let centerZ = path.reduce((sum: number, e: any) => sum + e.position.z, 0) / path.length;
    let avg = path.map((e: any) => Math.hypot(e.position.x - centerX, e.position.z - centerZ)).reduce((a: number, b: number) => a + b, 0) / path.length;
    let std = Math.sqrt(path.map((e: any) => Math.hypot(e.position.x - centerX, e.position.z - centerZ)).reduce((a: number, d: number) => a + (d - avg) ** 2, 0) / path.length);
    const firstColor = path[0].color;
    console.log(`✔ Circle bulundu: ${groupId} (${path.length} eleman, merkez: ${centerX.toFixed(1)},${centerZ.toFixed(1)}, r: ${avg.toFixed(1)}, std: ${std.toFixed(2)}, renk: ${firstColor})`);
  }
  const circleCount = elements.filter((e: any) => e.groupId).length;
  console.log(`[groupCircles] Toplam element: ${elements.length}, Bulunan circle: ${totalCircles}`);
  console.log(`[groupCircles] groupId atanmış element: ${circleCount}`);
}

function performSampling({ method, gray, maxElements, targetSize, alphaAt, color, morphKernelSize, minPathLength, imageColorMode, imageData, pngSize, alphaThreshold, colorTolerance, includeAllColors }: {
  method: string,
  gray: any,
  maxElements: number,
  targetSize: number,
  alphaAt: (x: number, y: number) => number,
  color: string,
  morphKernelSize: number,
  minPathLength: number,
  imageColorMode?: boolean,
  imageData?: ImageData,
  pngSize?: number,
  alphaThreshold?: number,
  colorTolerance?: number,
  includeAllColors?: boolean
}): Array<{
  id: string;
  type: 'image';
  position: { x: number; z: number };
  color: string;
  yOffset: number;
  group?: string;
}> {
  let elements: Array<{
    id: string;
    type: 'image';
    position: { x: number; z: number };
    color: string;
    yOffset: number;
    group?: string;
  }> = [];
  if (method === 'skeleton') {
    // 1. Global threshold (magic circle gibi net çizimler için daha iyi)
    let bw = new window.cv.Mat();
    window.cv.threshold(gray, bw, 128, 255, window.cv.THRESH_BINARY_INV);
    // 2. Morfolojik temizlik
    const kernel = window.cv.Mat.ones(morphKernelSize, morphKernelSize, window.cv.CV_8U);
    window.cv.morphologyEx(bw, bw, window.cv.MORPH_CLOSE, kernel);
    window.cv.morphologyEx(bw, bw, window.cv.MORPH_OPEN, kernel);
    // 3. Thinning (iskelet)
    let skel = new window.cv.Mat();
    if (window.cv.ximgproc && window.cv.ximgproc.thinning) {
      window.cv.ximgproc.thinning(bw, skel, window.cv.ximgproc.THINNING_ZHANGSUEN);
    } else {
      window.cv.erode(bw, skel, new window.cv.Mat(), new window.cv.Point(-1, -1), 1);
    }
    // 4. Gelişmiş path extraction
    const allPaths = traceSkeleton(skel);
    const totalLength = allPaths.reduce((sum, path) => sum + path.length, 0);
    if (totalLength === 0) {
      bw.delete(); skel.delete(); kernel.delete();
      return [];
    }
    allPaths.forEach((path, pathIdx) => {
      const numSamples = Math.max(1, Math.round((path.length / totalLength) * maxElements));
      const step = path.length / numSamples;
      for (let i = 0; i < numSamples; i++) {
        const [x, y] = path[Math.floor(i * step)];
        if (alphaAt(x, y) > 10) {
          elements.push({
            id: `path-${pathIdx}-el-${i}`,
            type: 'image',
            position: { x: (x - targetSize / 2) / 10, z: (y - targetSize / 2) / 10 },
            color: imageColorMode && imageData ? getPixelColor(x, y, imageData) : color,
            yOffset: 0,
            group: `path-${pathIdx}`,
          });
        }
      }
    });
    if (elements.length > maxElements) {
      elements = reservoirSample(elements, maxElements);
    } else if (elements.length < maxElements && elements.length > 0) {
      const base = [...elements];
      while (elements.length < maxElements) {
        const pick = base[Math.floor(Math.random() * base.length)];
        elements.push({ ...pick, id: `${pick.id}-dup-${elements.length}` });
      }
    }
    bw.delete(); skel.delete(); kernel.delete();
  } else if (method === 'contour') {
    let edges = new window.cv.Mat();
    window.cv.Canny(gray, edges, 50, 150);
    let contours = new window.cv.MatVector();
    let hierarchy = new window.cv.Mat();
    window.cv.findContours(edges, contours, hierarchy, window.cv.RETR_LIST, window.cv.CHAIN_APPROX_NONE);
    let totalLength = 0;
    for (let i = 0; i < contours.size(); ++i) {
      totalLength += Math.floor(contours.get(i).data32S.length / 2);
    }
    for (let i = 0; i < contours.size(); ++i) {
      let cnt = contours.get(i);
      let cntLen = Math.floor(cnt.data32S.length / 2);
      let n = Math.max(1, Math.round(cntLen / totalLength * maxElements));
      for (let j = 0; j < n; ++j) {
        let idx = Math.floor(j * cntLen / n);
        let x = cnt.data32S[idx * 2];
        let y = cnt.data32S[idx * 2 + 1];
        if (alphaAt(x, y) <= 10) continue;
        const worldX = (x - targetSize / 2) / 10;
        const worldZ = (y - targetSize / 2) / 10;
        elements.push({ id: `png-${x}-${y}`, type: 'image', position: { x: worldX, z: worldZ }, color, yOffset: 0 });
      }
    }
    if (elements.length < maxElements && elements.length > 0) {
      const orig = [...elements];
      for (let i = elements.length; i < maxElements; i++) {
        elements.push(orig[i % orig.length]);
      }
    }
    edges.delete(); contours.delete(); hierarchy.delete();
  } else if (method === 'edge') {
    let edges = new window.cv.Mat();
    window.cv.Canny(gray, edges, 50, 150);
    const points: [number, number][] = [];
    for (let y = 0; y < edges.rows; y++) {
      for (let x = 0; x < edges.cols; x++) {
        if (edges.ucharPtr(y, x)[0] > 0 && alphaAt(x, y) > 10) {
          points.push([x, y]);
        }
      }
    }
    let sampledPoints: [number, number][] = [];
    if (points.length === 0) {
      // No edge points found, return empty
      edges.delete();
      return elements;
    }
    if (points.length <= maxElements) {
      sampledPoints = [...points];
      while (sampledPoints.length < maxElements) {
        sampledPoints.push(points[sampledPoints.length % points.length]);
      }
    } else {
      for (let i = 0; i < maxElements; i++) {
        const idx = Math.floor(i * points.length / maxElements);
        sampledPoints.push(points[idx]);
      }
    }
    for (const [x, y] of sampledPoints) {
      const worldX = (x - targetSize / 2) / 10;
      const worldZ = (y - targetSize / 2) / 10;
      elements.push({ id: `edge-${x}-${y}`, type: 'image', position: { x: worldX, z: worldZ }, color, yOffset: 0 });
    }
    edges.delete();
  } else if (method === 'pixel') {
    if (!imageData) return [];
    const alphaThresholdVal = alphaThreshold || 10; // 50 -> 10, siyah pikseller için
    const colorToleranceVal = colorTolerance || 20;
    const candidates: any[] = [];
    for (let y = 0; y < targetSize; y += 1) {
      for (let x = 0; x < targetSize; x += 1) {
        const index = (y * targetSize + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];
        if (a > alphaThresholdVal) {
          const worldX = (x - targetSize / 2) / 10;
          const worldZ = (y - targetSize / 2) / 10;
          const colorVal = imageColorMode && imageData
            ? getPixelColor(x, y, imageData)
            : color;
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
    // Eşit aralıklı sampling
    const total = candidates.length;
    if (total === 0) return [];
    let elements: any[] = [];
    if (total <= maxElements) {
      elements = candidates;
    } else {
      for (let i = 0; i < maxElements; i++) {
        const idx = Math.floor(i * total / maxElements);
        elements.push(candidates[idx]);
      }
    }
    return elements;
  } else if (method === 'advanced') {
    // Kullanıcının verdiği gelişmiş sampling algoritması
    if (!imageData) return [];
    let targetSize = pngSize || 100;
    const originalWidth = imageData.width;
    const originalHeight = imageData.height;
    const maxDimension = Math.max(originalWidth, originalHeight);
    const targetElements = maxElements || 10000;
    const totalPixels = originalWidth * originalHeight;
    const step = Math.max(1, Math.floor(Math.sqrt(totalPixels / targetElements)));
    targetSize = Math.min(originalWidth, originalHeight) / step;
    targetSize = Math.max(20, Math.min(500, Math.floor(targetSize)));
    if (maxDimension > 1000) {
      targetSize = Math.min(targetSize, 300);
    } else if (maxDimension > 500) {
      targetSize = Math.min(targetSize, 250);
    } else if (maxDimension > 200) {
      targetSize = Math.min(targetSize, 200);
    }
    // imageData zaten uygun boyutta olmalı
    const alphaThresholdVal = alphaThreshold || 10; // 50 -> 10, siyah pikseller için
    const colorToleranceVal = colorTolerance || 20;
    let elementCount = 0;
    for (let y = 0; y < targetSize && elementCount < maxElements; y += 1) {
      for (let x = 0; x < targetSize && elementCount < maxElements; x += 1) {
        const index = (y * targetSize + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];
        if (a > alphaThresholdVal) {
          const worldX = (x - targetSize / 2) / 10;
          const worldZ = (y - targetSize / 2) / 10;
          const colorVal = imageColorMode && imageData
            ? getPixelColor(x, y, imageData)
            : color;
          elements.push({
            id: `png-${x}-${y}`,
            type: 'image' as const,
            position: { x: worldX, z: worldZ },
            color: String(colorVal),
            yOffset: 0,
          });
          elementCount++;
          if (elementCount >= maxElements) break;
        }
      }
      if (elementCount >= maxElements) break;
    }
  } else if (method === 'grid') {
    if (!imageData) return [];
    // gridSize sadece burada tanımlı
    const gridSize = 0.5;
    const uniqueMap = new Map<string, any>();
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const index = (y * imageData.width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];
        if (a > 10) { // 50 -> 10, siyah pikseller için
          const worldX = Math.round(((x - imageData.width / 2) / 10) / gridSize) * gridSize;
          const worldZ = Math.round(((y - imageData.height / 2) / 10) / gridSize) * gridSize;
          const key = `${Math.round(worldX / gridSize)},${Math.round(worldZ / gridSize)}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
              id: `grid-${x}-${y}`,
              type: 'image',
              position: { x: worldX, z: worldZ },
              totalR: r,
              totalG: g,
              totalB: b,
              count: 1,
              yOffset: 0,
            });
          } else {
            const item = uniqueMap.get(key);
            item.totalR += r;
            item.totalG += g;
            item.totalB += b;
            item.count += 1;
          }
        }
      }
    }
    const uniqueElements = Array.from(uniqueMap.values()).map(el => ({
      ...el,
      color: imageColorMode
        ? `rgb(${Math.round(el.totalR / el.count)}, ${Math.round(el.totalG / el.count)}, ${Math.round(el.totalB / el.count)})`
        : color
    }));
    let finalElements: any[];
    if (uniqueElements.length > maxElements) {
      const sampled: any[] = [];
      for (let i = 0; i < maxElements; i++) {
        const idx = Math.floor(i * uniqueElements.length / maxElements);
        sampled.push(uniqueElements[idx]);
      }
      finalElements = sampled;
    } else {
      finalElements = uniqueElements;
    }
    console.log(`[grid sampling] uniqueElements: ${uniqueElements.length}`);
    if (window.addPngElements) {
      window.addPngElements(finalElements);
    } else {
      console.log("window.addPngElements fonksiyonu tanımlı değil!");
    }
    return finalElements;
  }
  if (elements.length > maxElements) {
    elements = reservoirSample(elements, maxElements);
  } else if (elements.length < maxElements && elements.length > 0) {
    const base = [...elements];
    while (elements.length < maxElements) {
      const pick = base[Math.floor(Math.random() * base.length)];
      elements.push({ ...pick, id: `${pick.id}-dup-${elements.length}` });
    }
  }
  if (window.addPngElements) {
    window.addPngElements(elements);
  } else {
    console.log("window.addPngElements fonksiyonu tanımlı değil!");
  }
  return elements;
}

// Modern Tooltip component
const Tooltip = ({ text }: { text: string }) => (
  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
    {text}
  </span>
)

// Modern Info icon with tooltip
const InfoIcon = ({ desc }: { desc: string }) => (
  <div className="group relative">
    <Info className="w-4 h-4 text-white/40 hover:text-white/60 transition-colors cursor-help" />
    <Tooltip text={desc} />
  </div>
)

// YENİ VE GÜVENİLİR GIF YÜKLEME FONKSİYONU
async function loadGifWithLibrary(file: File, settings: any) {
  console.log("🎬 Modern GIF import başladı (gifuct-js ile)", {
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
  });

  // 1. Dosyayı ArrayBuffer olarak oku
  const buffer = await file.arrayBuffer();

  // 2. Kütüphane ile GIF dosyasını parse et
  const parsedGif = parseGIF(buffer);

  // 3. Tüm frameleri decompress et (bu işlem pikselleri çıkarır)
  // not: true parametresi, her frame'in bir önceki üzerine çizilmesini sağlar, bu animasyonlar için önemlidir.
  const decompressedFrames = decompressFrames(parsedGif, true);

  if (!decompressedFrames || decompressedFrames.length === 0) {
    alert("Bu GIF dosyası işlenemedi. Lütfen farklı bir dosya deneyin.");
    console.error("❌ GIF frameleri decompress edilemedi.");
    return;
  }

  console.log(`✅ GIF başarıyla çözüldü: ${decompressedFrames.length} frame bulundu.`);

  // 4. Her bir frame'i ImageData'ya çevir
  const framesData = decompressedFrames.map((frame, index) => {
    // Kütüphane bize her pikselin patch'ini verir, bunu canvas'a çizerek tam ImageData elde ederiz.
    const frameImageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );

    return {
      frameIndex: index,
      imageData: frameImageData,
      delay: frame.delay, // Her frame'in kendi gecikme süresi
      timestamp: decompressedFrames.slice(0, index + 1).reduce((acc, f) => acc + f.delay, 0)
    };
  });

  // 5. Elde ettiğimiz frame verilerini mevcut işleme fonksiyonuna gönder
  // Artık processGIFFrames fonksiyonu, güvenilir ve tam frame listesiyle çalışacak.
  processGIFFrames(framesData, settings);
}



















// GIF frame'lerini elementlere dönüştür
function processGIFFrames(frames: any[], settings: any) {
  console.log(`🔄 ${frames.length} frame işleniyor...`);

  // Her frame için ayrı layer oluştur
  const gifLayers: any[] = [];

  // Her frame için maksimum element sayısını hesapla
  // Toplam element limitini frame sayısına böl, ama minimum 5000 element garantile
  const totalMaxElements = settings.maxElements || 100000; // Default artırıldı
  const minElementsPerFrame = 5000; // Minimum artırıldı
  const maxElementsPerFrame = Math.max(
    minElementsPerFrame,
    Math.floor(totalMaxElements / frames.length)
  );

  console.log(`📊 Her frame için maksimum ${maxElementsPerFrame} element işlenecek (toplam limit: ${totalMaxElements})`);

  frames.forEach((frame, frameIndex) => {
    console.log(`🎨 Frame ${frameIndex + 1}/${frames.length} işleniyor...`);

    const frameElements = extractElementsFromFrame(frame.imageData, {
      ...settings,
      maxElements: maxElementsPerFrame,
      frameIndex: frameIndex,
      timestamp: frame.timestamp
    });

    // Frame bilgisini elementlere ekle
    frameElements.forEach(element => {
      element.frameIndex = frameIndex;
      element.timestamp = frame.timestamp;
      element.animationGroup = `gif-frame-${frameIndex}`;
      element.layerId = `gif-frame-${frameIndex}`;
      element.delay = settings.gifFrameDelay || 2; // Minecraft ticks
    });

    // Frame için layer oluştur
    const frameLayer = {
      id: `gif-frame-${frameIndex}`,
      name: `GIF Frame ${frameIndex + 1}`,
      elements: frameElements,
      particle: settings.particle || 'flame',
      color: settings.color || '#ff6b35',
      alpha: settings.alpha || 10,
      repeat: settings.repeat || 1,
      repeatInterval: settings.repeatInterval || 1,
      targeter: settings.targeter || 'origin',
      effectType: 'particles',
      yOffset: settings.yOffset || 0,
      isGifFrame: true,
      frameIndex: frameIndex,
      timestamp: frame.timestamp,
      visible: true,
      // Frame timing bilgileri
      delay: frame.timestamp,
      duration: frame.delay || 100,
      frameDelay: settings.gifFrameDelay || 2
    };

    gifLayers.push(frameLayer);
    console.log(`✅ Frame ${frameIndex + 1}: ${frameElements.length} elements added`);
  });

  const totalElements = gifLayers.reduce((sum, layer) => sum + layer.elements.length, 0);
  console.log(`🎉 ${gifLayers.length} GIF layers created, total ${totalElements} elements`);

  // Tüm frame'leri tek bir animasyonlu layer olarak birleştir
  console.log('🎬 GIF frames being combined into single animated layer...');

  // Tüm elementleri birleştir ve frame bilgilerini koru
  const allElements: any[] = [];

  gifLayers.forEach((layer, frameIndex) => {
    layer.elements.forEach((element: any) => {
      // Her elemente frame bilgisi ekle
      element.frameIndex = frameIndex;
      element.totalFrames = gifLayers.length;
      element.animationGroup = `gif-animation`;
      allElements.push(element);
    });
  });

  console.log(`🎉 ${allElements.length} total elements combined from ${gifLayers.length} frames`);

  // GIF elementlerini özel callback ile gönder
  if (window.addGifElements) {
    console.log('🚀 GIF elements being sent via addGifElements...');
    window.addGifElements(allElements, gifLayers.length);
  } else if (window.addPngElements) {
    console.log('⚠️ addGifElements not found, using addPngElements as fallback...');
    // Fallback: Sadece ilk frame'i ekle
    const firstFrameElements = gifLayers[0]?.elements || [];
    window.addPngElements(firstFrameElements);
  } else {
    console.error("❌ Neither addGifElements nor addPngElements function found!");
  }

  console.log(`✅ GIF animation successfully added: ${gifLayers.length} frames, ${allElements.length} elements`);
}

// Renk varyasyonu helper fonksiyonu
function adjustColorForFrame(color: string, frameIndex: number): string {
  if (!color.startsWith('#')) return color;

  try {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Siyah ve koyu renkler için özel kontrol - bunları değiştirme
    const brightness = (r + g + b) / 3;
    if (brightness < 50) {
      return color; // Koyu renkleri olduğu gibi bırak
    }

    // Frame'e göre hafif hue shift - sadece açık renkler için
    const variation = frameIndex * 0.05; // Daha az varyasyon

    const newR = Math.max(0, Math.min(255, r + Math.sin(variation) * 10)); // 20 -> 10
    const newG = Math.max(0, Math.min(255, g + Math.cos(variation) * 10)); // 20 -> 10
    const newB = Math.max(0, Math.min(255, b + Math.sin(variation + 1) * 10)); // 20 -> 10

    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  } catch {
    return color;
  }
}

// Renk normalizasyonu - benzer renkleri birleştir
function normalizeColor(color: string, threshold: number = 30): string {
  if (!color.startsWith('#')) return color;

  const hex = color.slice(1);
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Renkleri threshold'a göre yuvarla
  const normalizedR = Math.round(r / threshold) * threshold;
  const normalizedG = Math.round(g / threshold) * threshold;
  const normalizedB = Math.round(b / threshold) * threshold;

  return `#${normalizedR.toString(16).padStart(2, '0')}${normalizedG.toString(16).padStart(2, '0')}${normalizedB.toString(16).padStart(2, '0')}`;
}

// Renk parlaklığı hesaplama
function getColorBrightness(color: string): number {
  if (!color.startsWith('#')) return 0;

  const hex = color.slice(1);
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Luminance hesaplama (0-255 arası)
  return (r * 0.299 + g * 0.587 + b * 0.114);
}

// Frame'den element çıkarma - PARTİKÜL ÇAKIŞMA ÖNLEME İLE
function extractElementsFromFrame(imageData: ImageData, settings: any): any[] {
  const width = imageData.width;
  const height = imageData.height;
  const maxElements = settings.maxElements || 50000;
  const alphaThreshold = settings.alphaThreshold || 10;
  const frameIndex = settings.frameIndex || 0;

  // Partikül yoğunluğu ayarı - çakışmayı önlemek için
  const particleDensity = settings.particleDensity || 2; // 1-5 arası, 2 = her 2 pikselde bir
  const colorSimilarityThreshold = settings.colorSimilarityThreshold || 30; // Benzer renkler için threshold

  console.log(`🔍 Frame ${frameIndex} (ÇAKIŞMA ÖNLEME): ${width}x${height}, density: ${particleDensity}, max elements: ${maxElements}`);

  const candidates: any[] = [];
  const positionMap = new Map<string, string>(); // Pozisyon -> renk mapping

  // Ana pixel tarama döngüsü - PARTİKÜL YOĞUNLUĞUNA GÖRE
  for (let y = 0; y < height; y += particleDensity) {
    for (let x = 0; x < width; x += particleDensity) {
      const index = (y * width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];

      // Siyah pikseller için özel kontrol
      const isDarkPixel = (r + g + b) < 100;
      const effectiveThreshold = isDarkPixel ? Math.min(alphaThreshold, 5) : alphaThreshold;
      const isVisible = a > effectiveThreshold || (isDarkPixel && a > 0);

      // Görünür pikseller için element oluştur
      if (isVisible) {
        // Dünya koordinatlarına çevir
        const scaleFactor = settings.gifScaleFactor || 25;
        const worldX = (x - width / 2) / scaleFactor;
        const worldZ = (y - height / 2) / scaleFactor;

        // Renk modu ayarına göre rengi belirle
        let color = settings.imageColorMode !== false
          ? `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
          : settings.color || '#ff6b35';

        // Siyah renk kontrolü
        if (isDarkPixel && settings.imageColorMode !== false) {
          const brightness = (r + g + b) / 3;
          if (brightness < 30) {
            color = '#000000';
          }
        }

        // Benzer renkleri birleştir - çakışmayı önle
        const normalizedColor = normalizeColor(color, colorSimilarityThreshold);

        // Pozisyon anahtarı oluştur
        const positionKey = `${worldX.toFixed(2)},${worldZ.toFixed(2)}`;

        // Aynı pozisyonda farklı renk varsa, daha parlak olanı seç
        const existingColor = positionMap.get(positionKey);
        if (existingColor && existingColor !== normalizedColor) {
          // Mevcut rengin parlaklığını hesapla
          const existingBrightness = getColorBrightness(existingColor);
          const newBrightness = getColorBrightness(normalizedColor);

          // Daha parlak olanı seç
          if (newBrightness > existingBrightness) {
            positionMap.set(positionKey, normalizedColor);
            // Eski elementi kaldır ve yenisini ekle
            const existingIndex = candidates.findIndex(c =>
              Math.abs(c.position.x - worldX) < 0.1 &&
              Math.abs(c.position.z - worldZ) < 0.1
            );
            if (existingIndex !== -1) {
              candidates[existingIndex] = {
                id: `gif-f${frameIndex}-${x}-${y}`,
                type: 'gif-particle',
                position: { x: worldX, z: worldZ },
                color: normalizedColor,
                yOffset: settings.yOffset || 0,
                alpha: Math.max(a / 255, 0.1)
              };
            }
          }
          continue; // Aynı pozisyonda daha parlak renk yoksa atla
        }

        // Pozisyon map'ine ekle
        positionMap.set(positionKey, normalizedColor);

        // Elementi aday listesine ekle
        candidates.push({
          id: `gif-f${frameIndex}-${x}-${y}`,
          type: 'gif-particle',
          position: { x: worldX, z: worldZ },
          color: normalizedColor,
          yOffset: settings.yOffset || 0,
          alpha: Math.max(a / 255, 0.1)
        });
      }
    }
  }

  console.log(`📊 Frame ${frameIndex}: ${candidates.length} aday element bulundu (her pikselden).`);

  // Final örnekleme: Eğer aday sayısı hala maxElements limitinden fazlaysa,
  // limitte kalacak şekilde eşit aralıklarla örnekleme yap.
  let finalElements: any[] = [];
  if (candidates.length > maxElements) {
    console.log(`⚡ Frame ${frameIndex}: ${candidates.length} aday > ${maxElements} limit, örnekleme yapılıyor...`);

    // Deterministik uniform sampling (eşit aralıklı eleme)
    for (let i = 0; i < maxElements; i++) {
      const idx = Math.floor(i * candidates.length / maxElements);
      finalElements.push(candidates[idx]);
    }
  } else {
    // Limit aşılmadıysa, tüm adayları kullan.
    finalElements = candidates;
  }

  console.log(`✅ Frame ${frameIndex}: ${finalElements.length} final element oluşturuldu.`);
  return finalElements;
}

// Eski loadPngFile fonksiyonunu ekle
function legacyLoadPngFile(file: File, settings: any) {
  console.log("Legacy PNG import başladı", { settings });
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      console.log("img loaded", img.width, img.height);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      // Her zaman kullanıcı pngSize'ı kullan
      const size = settings.pngSize || 100;
      const maxElements = settings.maxElements || 10000;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      type ImageElement = { id: string; type: 'image'; position: { x: number; z: number }; color: string; yOffset: number };
      const candidates: ImageElement[] = [];
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const index = (y * size + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const a = imageData.data[index + 3];
          const alphaThreshold = settings.alphaThreshold || 10; // 50 -> 10, siyah pikseller için
          const colorTolerance = settings.colorTolerance || 20;
          if (a > alphaThreshold) {
            const worldX = (x - size / 2) / 10;
            const worldZ = (y - size / 2) / 10;
            const color = settings.imageColorMode
              ? `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
              : settings.color;
            candidates.push({
              id: `png-${x}-${y}`,
              type: 'image',
              position: { x: worldX, z: worldZ },
              color: String(color),
              yOffset: 0,
            });
          }
        }
      }
      let elements: ImageElement[] = [];
      if (candidates.length > maxElements) {
        for (let i = 0; i < maxElements; i++) {
          const idx = Math.floor(i * candidates.length / maxElements);
          elements.push(candidates[idx]);
        }
      } else {
        elements = candidates;
      }
      console.log(`[Legacy PNG] ${elements.length} elements added (candidates: ${candidates.length})`);
      if (window.addPngElements) {
        window.addPngElements(elements);
      } else {
        console.log("window.addPngElements function is not defined!");
      }
    }
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
}

export function autoGroupCirclesOnElements(elements: Array<any>, gridSize: number) {
  // groupCircles çağrısını kaldır
}

// Modern toggle switch component
const ModernToggle = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
  <div
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${checked
      ? 'bg-white shadow-[0_0_12px_0_rgba(255,255,255,0.3)]'
      : 'bg-white/20 hover:bg-white/30'
      }`}
  >
    <div
      className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-all duration-300 shadow-lg ${checked ? 'left-5' : 'left-0.5'
        }`}
    />
  </div>
)

// Modern slider with gradient
const ModernSlider = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = ""
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  className?: string
}) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={e => onChange(Number(e.target.value))}
    className={`w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer transition-all duration-200 hover:bg-white/20 ${className}`}
    style={{
      background: `linear-gradient(to right, white 0%, white ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`
    }}
  />
)

// Modern number input
const ModernInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = ""
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  className?: string
}) => (
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={e => onChange(Number(e.target.value))}
    className={`w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium transition-all duration-200 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 ${className}`}
  />
)

// Import section component (BAĞIMSIZ BİR COMPONENT OLARAK)
const ImportSection = ({
  title,
  icon: Icon,
  description,
  children,
  onImport,
  importText = "Import"
}: {
  title: string
  icon: any
  description: string
  children?: React.ReactNode
  onImport: () => void
  importText?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-white/50 text-sm">{description}</p>
          </div>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {children}

          {/* Import Button */}
          <button
            onClick={onImport}
            className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-5 text-white" />
            {importText}
          </button>
        </div>
      )}
    </div>
  );
}

export function ImportPanel({ settings, onSettingsChange }: { settings: any, onSettingsChange: (s: any) => void }) {
  // Drag & Drop state
  const [isDragOver, setIsDragOver] = useState(false);
  // Advanced settings toggle
  const [showAdvanced, setShowAdvanced] = useState(!!settings.pngAutoMode);
  const [morphKernelSize, setMorphKernelSize] = useState<number>(settings.morphKernelSize ?? 3);
  const [minPathLength, setMinPathLength] = useState<number>(settings.minPathLength ?? 3);
  const [showPngSettings, setShowPngSettings] = useState(false);

  // Sliders state (sync with settings) - GIF için optimize edilmiş default'lar
  const pngSize = settings.pngSize ?? 300; // GIF için daha büyük default
  const maxElements = settings.maxElements ?? 50000; // GIF için çok daha yüksek default
  const objScale = settings.objScale ?? 1;

  // Styles
  const labelStyle = {
    fontWeight: 700,
    fontSize: 16,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: 6,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  };
  const inputStyle = {
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)',
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 16,
    width: 90,
    marginLeft: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease',
    outline: 'none'
  } as React.CSSProperties;

  const inputFocusStyle = {
    ...inputStyle,
    border: "1px solid rgba(99, 102, 241, 0.5)",
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3)'
  } as React.CSSProperties;
  const sliderStyle = {
    width: 240,
    marginLeft: 16,
    marginRight: 8,
    verticalAlign: "middle",
    height: 8,
    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
    borderRadius: 4,
    outline: 'none',
    cursor: 'pointer'
  } as React.CSSProperties;
  const buttonStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    color: "#000000",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: "16px 40px",
    fontWeight: 800,
    fontSize: 18,
    marginTop: 20,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)',
    position: 'relative',
    overflow: 'hidden'
  } as React.CSSProperties;

  // Main panel style (column layout, scrollable) - Header'daki gibi modern gradient
  const panelStyle = {
    background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
    color: "#ffffff",
    width: "100%",
    maxWidth: 800,
    margin: "0 auto",
    padding: 32,
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    justifyContent: "flex-start",
    alignItems: "stretch"
  } as React.CSSProperties;
  const sectionStyle = {
    width: "100%",
    maxWidth: 700,
    margin: "0 auto",
    marginBottom: 24,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 24,
    transition: 'all 0.3s ease',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  } as React.CSSProperties;
  const sectionTitle = {
    fontWeight: 800,
    fontSize: 22,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

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

    // File type detection
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

  // Slider+input sync helpers
  const handlePngSize = (v: number) => onSettingsChange({ ...settings, pngSize: v });
  const handleMaxElements = (v: number) => onSettingsChange({ ...settings, maxElements: v });
  const handleObjScale = (v: number) => onSettingsChange({ ...settings, objScale: v });

  const loadPngFile = (file: File) => {
    const samplingMethod = settings.samplingMethod || 'legacy';
    if (samplingMethod === 'legacy') {
      legacyLoadPngFile(file, settings);
      return;
    }
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
        waitForOpenCV(() => {
          let src = window.cv.imread(canvas);
          let gray = new window.cv.Mat();
          window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);
          const imageData = ctx.getImageData(0, 0, pngSize, pngSize);
          const alphaAt = (x: number, y: number) => imageData.data[(y * pngSize + x) * 4 + 3];
          const color = settings.color;
          const elements = performSampling({
            method: samplingMethod,
            gray,
            maxElements,
            targetSize: pngSize,
            alphaAt,
            color,
            morphKernelSize,
            minPathLength,
            imageColorMode: !!settings.imageColorMode,
            imageData,
            pngSize: settings.pngSize,
            alphaThreshold: settings.alphaThreshold,
            colorTolerance: settings.colorTolerance,
            includeAllColors: settings.includeAllColors
          });
          src.delete(); gray.delete();
          if (window.addPngElements) {
            window.addPngElements(elements);
          }
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const loadObjFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const objData = event.target?.result as string
      const lines = objData.split("\n")
      const vertices: any[] = []
      lines.forEach((line) => {
        if (line.startsWith("v ")) {
          const parts = line.trim().split(/\s+/)
          if (parts.length >= 4) {
            const x_blender = parseFloat(parts[1]);
            const y_blender = parseFloat(parts[2]);
            const z_blender = parseFloat(parts[3]);

            // DÜZELTME: Blender X → x, Blender Z → z (işareti ters), Blender Y → yOffset (Minecraft derinlik)
            const x = x_blender * objScale;         // X → X
            const z = -z_blender * objScale;        // Z → -Y (canvas Y)
            const y = y_blender * objScale;         // Y → Minecraft derinlik

            vertices.push({
              id: `obj-${vertices.length}`,
              type: "obj",
              position: { x: x, z: z }, // Blender X → x, Blender Z → z (canvas Y)
              color: settings.color,
              yOffset: y, // Blender Y → yOffset (Minecraft derinlik)
            })
          }
        }
      })
      const finalVertices = settings.performanceMode ? vertices.filter((_, index) => index % 4 === 0) : vertices
      if (window.addObjElements) {
        window.addObjElements(finalVertices)
      }
    }
    reader.readAsText(file)
  }

  const loadYamlFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const yamlData = event.target?.result as string
        const parsed = yaml.load(yamlData) as any

        console.log("YAML parsed:", parsed)

        const elements: any[] = []
        let elementId = 0

        // MythicMobs YAML formatını parse et
        if (parsed && typeof parsed === 'object') {
          // Her skill'i bul
          Object.keys(parsed).forEach(skillName => {
            const skillData = parsed[skillName]
            if (skillData && skillData.Skills) {
              const skills = skillData.Skills

              skills.forEach((skillLine: string, skillIndex: number) => {
                // delay satırlarını atla
                if (skillLine.includes('delay')) return

                // Effect satırlarını parse et (e:p, effect:particles, vb.)
                if ((skillLine.includes('e:p') || skillLine.includes('effect:particles') || skillLine.includes('effect:')) && skillLine.includes('@Origin')) {
                  // Effect türünü belirle
                  let effectType = 'particle'
                  let effectProps = ''

                  if (skillLine.includes('e:p{')) {
                    // e:p formatı
                    const particleMatch = skillLine.match(/e:p\{([^}]+)\}/)
                    if (particleMatch) {
                      effectProps = particleMatch[1]
                      effectType = 'e:p'
                    }
                  } else if (skillLine.includes('effect:particles{')) {
                    // effect:particles formatı
                    const effectMatch = skillLine.match(/effect:particles\{([^}]+)\}/)
                    if (effectMatch) {
                      effectProps = effectMatch[1]
                      effectType = 'effect:particles'
                    }
                  } else if (skillLine.includes('effect:{')) {
                    // effect: formatı
                    const effectMatch = skillLine.match(/effect:\{([^}]+)\}/)
                    if (effectMatch) {
                      effectProps = effectMatch[1]
                      effectType = 'effect'
                    }
                  }

                  const originMatch = skillLine.match(/@Origin\{([^}]+)\}/)

                  if (effectProps && originMatch) {
                    const originProps = originMatch[1]

                    // Effect özelliklerini parse et
                    const colorMatch = effectProps.match(/c=([^;]+)/)
                    const sizeMatch = effectProps.match(/size=([^;]+)/)
                    const alphaMatch = effectProps.match(/a=([^;]+)/)
                    const particleMatch = effectProps.match(/p=([^;]+)/)

                    // Origin koordinatlarını parse et
                    const xoffsetMatch = originProps.match(/xoffset=([^;]+)/)
                    const zoffsetMatch = originProps.match(/zoffset=([^;]+)/)
                    const yoffsetMatch = originProps.match(/yoffset=([^;]+)/)

                    const x = parseFloat(xoffsetMatch?.[1] || '0')
                    const z = parseFloat(zoffsetMatch?.[1] || '0')
                    const yOffset = parseFloat(yoffsetMatch?.[1] || '0')

                    // Renk bilgisini çıkar
                    let color = settings.color
                    if (colorMatch) {
                      const colorValue = colorMatch[1]
                      if (colorValue.startsWith('#')) {
                        color = colorValue
                      } else if (colorValue.includes(',')) {
                        // RGB formatı varsa
                        const rgb = colorValue.split(',').map(c => parseInt(c.trim()))
                        if (rgb.length >= 3) {
                          color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
                        }
                      }
                    }

                    // Size ve alpha bilgisini çıkar
                    const size = parseFloat(sizeMatch?.[1] || '1')
                    const alpha = parseFloat(alphaMatch?.[1] || '1')
                    const particleType = particleMatch?.[1] || 'reddust'

                    elements.push({
                      id: `yaml-${skillName}-${skillIndex}-${elementId++}`,
                      type: 'yaml',
                      position: { x, z },
                      color: color,
                      yOffset: yOffset,
                      size: size,
                      alpha: alpha,
                      particleType: particleType,
                      effectType: effectType,
                      meta: {
                        skillName,
                        skillIndex,
                        originalLine: skillLine,
                        effectProps,
                        originProps
                      }
                    })
                  }
                }
              })
            }
          })
        }

        console.log(`YAML import: ${elements.length} elements added`)

        if (window.addYamlElements) {
          window.addYamlElements(elements)
        } else if (window.addPngElements) {
          // Fallback: PNG elements olarak ekle
          window.addPngElements(elements)
        }

      } catch (error) {
        console.error("YAML parse error:", error)
        alert("YAML file could not be parsed. Please make sure it's a valid MythicMobs YAML file.")
      }
    }
    reader.readAsText(file)
  }









  // OBJ ayar paneli için state
  const [showObjSettings, setShowObjSettings] = useState(false);
  const [showYamlSettings, setShowYamlSettings] = useState(false);
  const [showGifSettings, setShowGifSettings] = useState(false);

  // OBJ için optimize ayarı (örnek)
  const handleObjPerformance = (v: boolean) => onSettingsChange({ ...settings, objPerformance: v });
  const objPerformance = settings.objPerformance ?? false;

  // --- ÖZEL SLIDER BİLEŞENİ ---
  interface CustomSliderProps {
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    step: number
    accentColor?: string
  }

  const CustomSlider: React.FC<CustomSliderProps> = ({ value, onChange, min, max, step, accentColor = "#10b981" }) => {
    return (
      <div className="relative w-full group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
          }}
        />
        <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 3px solid ${accentColor};
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 3px solid ${accentColor};
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
      </div>
    );
  };


  // File upload handler
  const handleFileUpload = (type: "png" | "obj" | "yaml" | "gif") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = type === "png" ? ".png" : type === "obj" ? ".obj" : type === "yaml" ? ".yml,.yaml" : ".gif"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (type === "png") {
          loadPngFile(file)
        } else if (type === "obj") {
          loadObjFile(file)
        } else if (type === "yaml") {
          loadYamlFile(file)
        } else if (type === "gif") {
          loadGifWithLibrary(file, settings)
        }
      }
    }
    input.click()
  }

  return (
    // ARKA PLAN KALDIRILDI: bg-slate-50 sınıfı silindi.
    <div className="h-full w-full flex flex-col text-sm relative text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-850">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-xl">Import Files</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Convert files to elements</p>
          </div>
        </div>
      </div>

      {/* Import Types List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
        <ImportTypeSection
          id="png"
          title="PNG Import"
          icon={ImageIcon} // ImageIcon'ı import ettiğinizden emin olun
          description="Convert PNG images to vector elements"
          onImport={() => handleFileUpload("png")}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />

        <ImportTypeSection
          id="obj"
          title="OBJ Import"
          icon={FileStack} // FileStack'ı import ettiğinizden emin olun
          description="Convert 3D OBJ files to vector elements"
          onImport={() => handleFileUpload("obj")}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />

        <ImportTypeSection
          id="gif"
          title="GIF Import"
          icon={Film} // Film'i import ettiğinizden emin olun
          description="Convert animated GIFs to frame layers"
          onImport={() => handleFileUpload("gif")}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />

        <ImportTypeSection
          id="yaml"
          title="YAML Import"
          icon={FileText} // FileText'i import ettiğinizden emin olun
          description="Convert MythicMobs YAML files to elements"
          onImport={() => handleFileUpload("yaml")}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </div>

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-2 border-dashed border-slate-400 dark:border-zinc-800 rounded-xl flex items-center justify-center z-50"
          >
            <div className="text-center p-8">
              <div className="p-4 bg-slate-900 dark:bg-zinc-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border dark:border-zinc-800">
                <Download className="w-10 h-10 text-white" />
              </div>
              <p className="text-slate-800 dark:text-zinc-300 font-semibold text-lg mb-2">Drop file here to import</p>
              <p className="text-slate-500 dark:text-zinc-400">PNG, OBJ, GIF, YAML supported</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        :global(.dark) .slider::-webkit-slider-thumb {
          border-color: #18181b;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        :global(.dark) .slider::-moz-range-thumb {
          border-color: #18181b;
        }
      `}</style>
    </div>
  );
}

// --- ImportTypeSection Component (Arka Plan Kaldırıldı) ---
function ImportTypeSection({
  id,
  title,
  icon: Icon,
  description,
  onImport,
  settings,
  onSettingsChange
}: {
  id: string;
  title: string;
  icon: any;
  description: string;
  onImport: () => void;
  settings: any;
  onSettingsChange: (settings: any) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSettings = id !== 'yaml';

  return (
    <div className="mb-3">
      <motion.div
        layout
        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 relative border ${isExpanded
          ? "bg-slate-900 dark:bg-zinc-900 text-white dark:text-zinc-100 shadow-lg border-slate-800 dark:border-zinc-800"
          : "text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 shadow-sm border-transparent"
          }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isExpanded && (
          <motion.div
            layoutId="activeImportBar"
            className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700 dark:bg-zinc-500 rounded-r-xl"
          />
        )}
        <div className={`p-2 rounded-lg ${isExpanded ? "bg-slate-800 dark:bg-zinc-800" : "bg-slate-100 dark:bg-zinc-800/40"}`}>
          <Icon className={`w-5 h-5 ${isExpanded ? "text-white" : "text-slate-705 dark:text-zinc-300"}`} />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-base">{title}</span>
          <p className={`text-xs mt-1 ${isExpanded ? "text-slate-300 dark:text-zinc-400" : "text-slate-500 dark:text-zinc-400"}`}>{description}</p>
        </div>

        {hasSettings && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${isExpanded ? "hover:bg-slate-800 dark:hover:bg-zinc-800" : "hover:bg-slate-200 dark:hover:bg-zinc-900"}`}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onImport}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isExpanded
            ? "bg-white dark:bg-zinc-100 text-slate-900 hover:bg-slate-100 shadow-sm"
            : "bg-slate-900 dark:bg-zinc-900 text-white hover:bg-slate-800 dark:hover:bg-zinc-800/80 border dark:border-zinc-800"
            }`}
        >
          Import
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {hasSettings && isExpanded && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-8">
              {/* ARKA PLAN KALDIRILDI: bg-white sınıfı silindi. */}
              <div className="rounded-xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800/80 bg-gray-50/30 dark:bg-zinc-900/10">
                {id === 'png' && <PngSettings settings={settings} onSettingsChange={onSettingsChange} />}
                {id === 'obj' && <ObjSettings settings={settings} onSettingsChange={onSettingsChange} />}
                {id === 'gif' && <GifSettings settings={settings} onSettingsChange={onSettingsChange} />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- PngSettings Component (Slider Sorunu Düzeltildi) ---
function PngSettings({ settings, onSettingsChange }: { settings: any; onSettingsChange: (s: any) => void }) {
  const pngSize = settings.pngSize ?? 300;
  const maxElements = settings.maxElements ?? 50000;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-707 dark:text-zinc-300">PNG Size</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{pngSize}px</span>
        </div>
        <input
          type="range"
          min={32}
          max={1024}
          step={8}
          value={pngSize}
          // SORUN ÇÖZÜLDÜ: e.stopPropagation() eklendi.
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, pngSize: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Max Elements</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{maxElements.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={100}
          max={20000}
          step={100}
          value={maxElements}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, maxElements: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Preserve Colors</span>
        <button
          onClick={() => onSettingsChange({ ...settings, imageColorMode: !settings.imageColorMode })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.imageColorMode ? 'bg-blue-600 dark:bg-blue-600' : 'bg-slate-300 dark:bg-zinc-800'
            }`}
        >
          <motion.span
            layout
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${settings.imageColorMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Sampling Method</span>
        <select
          className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 focus:border-slate-900 dark:focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-700"
          value={settings.samplingMethod || 'legacy'}
          onChange={e => onSettingsChange({ ...settings, samplingMethod: e.target.value })}
        >
          <option value="legacy">Legacy</option>
          <option value="skeleton">Skeleton</option>
          <option value="contour">Contour</option>
          <option value="pixel">Pixel</option>
          <option value="advanced">Advanced</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Alpha Threshold</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{settings.alphaThreshold ?? 10}</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          step={5}
          value={settings.alphaThreshold ?? 10}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, alphaThreshold: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
}

// --- ObjSettings Component (Slider Sorunu Düzeltildi) ---
function ObjSettings({ settings, onSettingsChange }: { settings: any; onSettingsChange: (s: any) => void }) {
  const objScale = settings.objScale ?? 1;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-707 dark:text-zinc-300">Scale</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{objScale}x</span>
        </div>
        <input
          type="range"
          min={0.01}
          max={10}
          step={0.01}
          value={objScale}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, objScale: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Optimize Performance</span>
        <button
          onClick={() => onSettingsChange({ ...settings, objPerformance: !settings.objPerformance })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.objPerformance ? 'bg-blue-600 dark:bg-blue-600' : 'bg-slate-300 dark:bg-zinc-800'
            }`}
        >
          <motion.span
            layout
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${settings.objPerformance ? 'translate-x-5' : 'translate-x-0.5'
              }`}
          />
        </button>
      </div>
    </div>
  );
}

// --- GifSettings Component (Slider Sorunu Düzeltildi) ---
function GifSettings({ settings, onSettingsChange }: { settings: any; onSettingsChange: (s: any) => void }) {
  const maxElements = settings.maxElements ?? 50000;
  const gifFrameDelay = settings.gifFrameDelay ?? 2;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Frame Delay</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{gifFrameDelay} ticks</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          value={gifFrameDelay}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, gifFrameDelay: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Max Elements</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{maxElements.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={10000}
          max={200000}
          step={5000}
          value={maxElements}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, maxElements: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Preserve Colors</span>
        <button
          onClick={() => onSettingsChange({ ...settings, imageColorMode: !settings.imageColorMode })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.imageColorMode ? 'bg-blue-600 dark:bg-blue-600' : 'bg-slate-300 dark:bg-zinc-800'
            }`}
        >
          <motion.span
            layout
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${settings.imageColorMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
          />
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Particle Density</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{settings.gifScaleFactor ?? 25}</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={settings.gifScaleFactor ?? 25}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, gifScaleFactor: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Particle Spacing</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{settings.particleDensity ?? 2}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={settings.particleDensity ?? 2}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, particleDensity: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Color Similarity</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{settings.colorSimilarityThreshold ?? 30}</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          step={10}
          value={settings.colorSimilarityThreshold ?? 30}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, colorSimilarityThreshold: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Alpha Threshold</span>
          <span className="text-sm bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg font-mono border dark:border-zinc-800">{settings.alphaThreshold ?? 10}</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          step={5}
          value={settings.alphaThreshold ?? 10}
          onChange={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, alphaThreshold: Number(e.target.value) }); }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
}