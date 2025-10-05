import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, FileStack, Settings2, Download, Info, ChevronDown, ChevronRight, FileText, Film, Palette, Grid3X3, Layers } from "lucide-react";
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
  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
    {text}
  </span>
)

// Modern Info icon with tooltip
const InfoIcon = ({ desc }: { desc: string }) => (
  <div className="group relative">
    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
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
    className={`w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-300 ${className}`}
    style={{
      background: `linear-gradient(to right, #000 0%, #000 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
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
    className={`w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm font-medium transition-all duration-200 focus:border-black focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black ${className}`}
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
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        >
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="px-4 pb-4 space-y-3 border-t border-gray-100 bg-gray-50"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            <div>
              {children}
            </div>

            {/* Import Button */}
            <button
              onClick={onImport}
              className="w-full py-2 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              {importText}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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

  const handleFileUpload = (type: "png" | "obj" | "yaml" | "gif") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = type === "png" ? "image/png,image/jpg,image/jpeg" : type === "obj" ? ".obj" : type === "gif" ? "image/gif" : ".yaml,.yml"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
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
    input.click()
  }







  // OBJ ayar paneli için state
  const [showObjSettings, setShowObjSettings] = useState(false);
  const [showYamlSettings, setShowYamlSettings] = useState(false);
  const [showGifSettings, setShowGifSettings] = useState(false);

  // OBJ için optimize ayarı (örnek)
  const handleObjPerformance = (v: boolean) => onSettingsChange({ ...settings, objPerformance: v });
  const objPerformance = settings.objPerformance ?? false;

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-md">
            <FileStack className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Import Files</h3>
            <p className="text-xs text-gray-500">Convert various file formats to editable elements</p>
          </div>
        </div>
      </div>

      <div
        className={`flex-1 space-y-4 ${isDragOver ? 'bg-gray-100 border-2 border-dashed border-gray-400 rounded-xl p-4' : ''
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

      {/* Import Sections */}
      <div className="space-y-4">
        {/* PNG Import */}
        <ImportSection
          title="PNG Import"
          icon={ImageIcon}
          description="Convert PNG images to vector elements"
          onImport={() => handleFileUpload("png")}
          importText="Import PNG"
        >
          <div className="space-y-4">
            {/* PNG Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  PNG Size
                  <InfoIcon desc="The resolution to process the PNG. Higher values preserve more detail." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {pngSize}px
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={pngSize}
                  onChange={handlePngSize}
                  min={32}
                  max={1024}
                  step={8}
                  className="flex-1"
                />
                <ModernInput
                  value={pngSize}
                  onChange={handlePngSize}
                  min={32}
                  max={1024}
                  step={8}
                />
              </div>
            </div>

            {/* Max Elements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  Max Elements
                  <InfoIcon desc="Maximum number of points to generate from the image." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {maxElements.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={maxElements}
                  onChange={handleMaxElements}
                  min={100}
                  max={20000}
                  step={100}
                  className="flex-1"
                />
                <ModernInput
                  value={maxElements}
                  onChange={handleMaxElements}
                  min={100}
                  max={20000}
                  step={100}
                />
              </div>
            </div>

            {/* Image Color Mode */}
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Preserve Image Colors
                <InfoIcon desc="Use original image colors instead of default color." />
              </Label>
              <ModernToggle
                checked={!!settings.imageColorMode}
                onChange={(checked) => onSettingsChange({ ...settings, imageColorMode: checked })}
              />
            </div>

            {/* Advanced Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Advanced Settings
                  <InfoIcon desc="Enable advanced PNG processing options." />
                </Label>
                <ModernToggle
                  checked={showAdvanced}
                  onChange={(checked) => {
                    setShowAdvanced(checked);
                    onSettingsChange({ ...settings, pngAutoMode: checked });
                  }}
                />
              </div>

              {showAdvanced && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  {/* Sampling Method */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                      Sampling Method
                      <InfoIcon desc="How to extract points from the image (Skeleton, Contour, Pixel, Legacy)." />
                    </Label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      value={settings.samplingMethod || 'legacy'}
                      onChange={e => onSettingsChange({ ...settings, samplingMethod: e.target.value })}
                    >
                      <option value="legacy">Legacy</option>
                      <option value="skeleton">Skeleton</option>
                      <option value="contour">Contour</option>
                      <option value="pixel">Pixel</option>
                      <option value="circle">Optimized Circle (BETA)</option>
                    </select>
                  </div>

                  {/* Morphological Kernel Size */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                      Morphological Kernel Size
                      <InfoIcon desc="Helps connect broken lines or remove noise." />
                    </Label>
                    <ModernInput
                      value={morphKernelSize}
                      onChange={setMorphKernelSize}
                      min={1}
                      max={15}
                      step={2}
                    />
                  </div>

                  {/* Min Path Length */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                      Min Path Length
                      <InfoIcon desc="Ignore very short paths (noise)." />
                    </Label>
                    <ModernInput
                      value={minPathLength}
                      onChange={setMinPathLength}
                      min={1}
                      max={20}
                      step={1}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ImportSection>

        {/* OBJ Import */}
        <ImportSection
          title="OBJ Import"
          icon={FileStack}
          description="Convert 3D OBJ files to vector elements"
          onImport={() => handleFileUpload("obj")}
          importText="Import OBJ"
        >
          <div className="space-y-4">
            {/* Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  Scale
                  <InfoIcon desc="Scale factor for the imported OBJ model." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {objScale}x
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={objScale}
                  onChange={handleObjScale}
                  min={0.01}
                  max={10}
                  step={0.01}
                  className="flex-1"
                />
                <ModernInput
                  value={objScale}
                  onChange={handleObjScale}
                  min={0.01}
                  max={10}
                  step={0.01}
                />
              </div>
            </div>

            {/* Performance Mode */}
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Optimize Performance
                <InfoIcon desc="Reduce element count for better performance." />
              </Label>
              <ModernToggle
                checked={!!settings.objPerformance}
                onChange={(checked) => onSettingsChange({ ...settings, objPerformance: checked })}
              />
            </div>
          </div>
        </ImportSection>

        {/* GIF Import */}
        <ImportSection
          title="GIF Import"
          icon={Film}
          description="Convert animated GIFs to frame layers"
          onImport={() => handleFileUpload("gif")}
          importText="Import GIF"
        >
          <div className="space-y-4">
            {/* Frame Processing Info */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-700 text-sm font-medium mb-2">
                🎬 Advanced GIF Processing
              </div>
              <div className="text-gray-600 text-xs space-y-1">
                <div>• All frames from GIF are automatically extracted</div>
                <div>• Each frame becomes a separate layer</div>
                <div>• Frame order and timing information preserved</div>
                <div>• Supports up to 100 frames maximum</div>
                <div>• Original GIF dimensions are preserved</div>
              </div>
            </div>

            {/* Frame Delay */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                Frame Delay (ticks)
                <InfoIcon desc="Delay between frames in Minecraft ticks (20 ticks = 1 second)." />
              </Label>
              <ModernInput
                value={settings.gifFrameDelay || 2}
                onChange={(value: number) => onSettingsChange({ ...settings, gifFrameDelay: value })}
                min={1}
                max={20}
                step={1}
              />
            </div>

            {/* Particle Density */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  Particle Density
                  <InfoIcon desc="Controls how close particles are to each other." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {settings.gifScaleFactor || 25}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={settings.gifScaleFactor || 25}
                  onChange={(value: number) => onSettingsChange({ ...settings, gifScaleFactor: value })}
                  min={1}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <ModernInput
                  value={settings.gifScaleFactor || 25}
                  onChange={(value: number) => onSettingsChange({ ...settings, gifScaleFactor: value })}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            {/* Particle Spacing - Çakışma Önleme */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  Particle Spacing
                  <InfoIcon desc="Higher values prevent particle overlap (1=every pixel, 3=every 3rd pixel)." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {settings.particleDensity || 2}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={settings.particleDensity || 2}
                  onChange={(value: number) => onSettingsChange({ ...settings, particleDensity: value })}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <ModernInput
                  value={settings.particleDensity || 2}
                  onChange={(value: number) => onSettingsChange({ ...settings, particleDensity: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>

            {/* Color Similarity Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  Color Similarity
                  <InfoIcon desc="Higher values group similar colors together (prevents color overlap)." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {settings.colorSimilarityThreshold || 30}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={settings.colorSimilarityThreshold || 30}
                  onChange={(value: number) => onSettingsChange({ ...settings, colorSimilarityThreshold: value })}
                  min={10}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <ModernInput
                  value={settings.colorSimilarityThreshold || 30}
                  onChange={(value: number) => onSettingsChange({ ...settings, colorSimilarityThreshold: value })}
                  min={10}
                  max={100}
                  step={10}
                />
              </div>
            </div>

            {/* Total Max Elements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  Total Max Elements
                  <InfoIcon desc="Total maximum number of elements. Automatically divided by frame count." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {maxElements.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={maxElements}
                  onChange={handleMaxElements}
                  min={10000}
                  max={200000}
                  step={5000}
                  className="flex-1"
                />
                <ModernInput
                  value={maxElements}
                  onChange={handleMaxElements}
                  min={10000}
                  max={200000}
                  step={5000}
                />
              </div>
            </div>

            {/* Preserve Colors */}
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Preserve Frame Colors
                <InfoIcon desc="Use original GIF colors for each frame." />
              </Label>
              <ModernToggle
                checked={!!settings.imageColorMode}
                onChange={(checked) => onSettingsChange({ ...settings, imageColorMode: checked })}
              />
            </div>

            {/* Alpha Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  Alpha Threshold
                  <InfoIcon desc="Minimum transparency level to include pixels (0-255)." />
                </Label>
                <span className="text-gray-700 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {settings.alphaThreshold || 10}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ModernSlider
                  value={settings.alphaThreshold || 10}
                  onChange={(value: number) => onSettingsChange({ ...settings, alphaThreshold: value })}
                  min={0}
                  max={255}
                  step={5}
                  className="flex-1"
                />
                <ModernInput
                  value={settings.alphaThreshold || 10}
                  onChange={(value: number) => onSettingsChange({ ...settings, alphaThreshold: value })}
                  min={0}
                  max={255}
                  step={5}
                />
              </div>
            </div>
          </div>
        </ImportSection>

        {/* YAML Import */}
        <ImportSection
          title="YAML Import"
          icon={FileText}
          description="Convert MythicMobs YAML files to elements"
          onImport={() => handleFileUpload("yaml")}
          importText="Import YAML"
        >
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-gray-700 text-sm font-medium mb-2">
              Supported Formats:
            </div>
            <div className="text-gray-600 text-xs space-y-1">
              <div>• e:p{`{...}`} @Origin{`{...}`}</div>
              <div>• effect:particles{`{...}`} @Origin{`{...}`}</div>
              <div>• effect:{`{...}`} @Origin{`{...}`}</div>
            </div>
          </div>
        </ImportSection>
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Drag and drop files directly onto the canvas for instant import
        </p>
        {isDragOver && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-700 text-sm font-medium">
              📁 Drop file here
            </p>
            <p className="text-gray-500 text-xs mt-1">
              PNG, OBJ, GIF, YAML files supported
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
} 