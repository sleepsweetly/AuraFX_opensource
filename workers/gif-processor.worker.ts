// GIF Processing Web Worker - Ultra Optimized
// Handles GIF parsing, frame extraction, and intelligent sampling in separate thread

import { parseGIF, decompressFrames } from 'gifuct-js';

// Types
interface ProcessGIFMessage {
  type: 'PROCESS_GIF';
  buffer: ArrayBuffer;
  settings: GIFSettings;
}

interface GIFSettings {
  maxElements: number;
  alphaThreshold: number;
  particleDensity: number;
  colorSimilarityThreshold: number;
  gifScaleFactor: number;
  imageColorMode: boolean;
  color: string;
  yOffset: number;
  gifFrameDelay: number;
  adaptiveFrameSkip: boolean;
  frameDiffThreshold: number;
}

interface ProgressMessage {
  type: 'PROGRESS';
  progress: number;
  stage: string;
  details: string;
}

interface BatchCompleteMessage {
  type: 'BATCH_COMPLETE';
  elements: any[];
  frameIndex: number;
  batchIndex: number;
}

interface CompleteMessage {
  type: 'COMPLETE';
  totalFrames: number;
  totalElements: number;
  skippedFrames: number;
  processingTime: number;
}

interface ErrorMessage {
  type: 'ERROR';
  error: string;
}

type WorkerMessage = ProgressMessage | BatchCompleteMessage | CompleteMessage | ErrorMessage;

// Helper: Normalize color for similarity grouping
function normalizeColor(color: string, threshold: number = 30): string {
  if (!color.startsWith('#')) return color;

  const hex = color.slice(1);
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const normalizedR = Math.round(r / threshold) * threshold;
  const normalizedG = Math.round(g / threshold) * threshold;
  const normalizedB = Math.round(b / threshold) * threshold;

  return `#${Math.min(255, normalizedR).toString(16).padStart(2, '0')}${Math.min(255, normalizedG).toString(16).padStart(2, '0')}${Math.min(255, normalizedB).toString(16).padStart(2, '0')}`;
}

// Helper: Calculate color brightness
function getColorBrightness(color: string): number {
  if (!color.startsWith('#')) return 0;

  const hex = color.slice(1);
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return (r * 0.299 + g * 0.587 + b * 0.114);
}

// Helper: Calculate frame difference (similarity percentage)
function calculateFrameDifference(frame1: ImageData, frame2: ImageData): number {
  if (frame1.width !== frame2.width || frame1.height !== frame2.height) {
    return 100; // Completely different
  }

  let differentPixels = 0;
  const totalPixels = frame1.width * frame1.height;
  const threshold = 10; // RGB difference threshold

  for (let i = 0; i < frame1.data.length; i += 4) {
    const r1 = frame1.data[i];
    const g1 = frame1.data[i + 1];
    const b1 = frame1.data[i + 2];
    const a1 = frame1.data[i + 3];

    const r2 = frame2.data[i];
    const g2 = frame2.data[i + 1];
    const b2 = frame2.data[i + 2];
    const a2 = frame2.data[i + 3];

    const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) + Math.abs(a1 - a2);
    if (diff > threshold) {
      differentPixels++;
    }
  }

  return (differentPixels / totalPixels) * 100;
}

// Core: Extract elements from a single frame with spatial optimization
function extractElementsFromFrame(
  imageData: ImageData,
  settings: GIFSettings,
  frameIndex: number
): any[] {
  const width = imageData.width;
  const height = imageData.height;
  const maxElements = settings.maxElements;
  const alphaThreshold = settings.alphaThreshold;
  const particleDensity = settings.particleDensity;
  const colorSimilarityThreshold = settings.colorSimilarityThreshold;

  const candidates: any[] = [];
  const spatialGrid = new Map<string, any>(); // Grid-based deduplication

  // Adaptive step size based on total pixels and max elements
  const totalPixels = width * height;
  const targetDensity = Math.max(1, Math.ceil(Math.sqrt(totalPixels / maxElements)));
  const step = Math.max(particleDensity, Math.min(targetDensity, 5));

  // Scan pixels with adaptive step
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];

      // Dark pixel special handling
      const isDarkPixel = (r + g + b) < 100;
      const effectiveThreshold = isDarkPixel ? Math.min(alphaThreshold, 5) : alphaThreshold;
      const isVisible = a > effectiveThreshold || (isDarkPixel && a > 0);

      if (isVisible) {
        // World coordinates
        const scaleFactor = settings.gifScaleFactor;
        const worldX = (x - width / 2) / scaleFactor;
        const worldZ = (y - height / 2) / scaleFactor;

        // Color extraction
        let color = settings.imageColorMode
          ? `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
          : settings.color;

        // Ensure dark colors stay dark
        if (isDarkPixel && settings.imageColorMode) {
          const brightness = (r + g + b) / 3;
          if (brightness < 30) {
            color = '#000000';
          }
        }

        // Normalize color for clustering
        const normalizedColor = normalizeColor(color, colorSimilarityThreshold);

        // Grid-based spatial deduplication (0.1 block precision)
        const gridKey = `${Math.round(worldX * 10)},${Math.round(worldZ * 10)}`;
        const existing = spatialGrid.get(gridKey);

        if (existing) {
          // Keep brighter color at this position
          const existingBrightness = getColorBrightness(existing.color);
          const newBrightness = getColorBrightness(normalizedColor);

          if (newBrightness > existingBrightness) {
            existing.color = normalizedColor;
            existing.alpha = Math.max(a / 255, 0.1);
          }
        } else {
          // New position
          const element = {
            id: `gif-f${frameIndex}-${x}-${y}`,
            type: 'gif-particle',
            position: { x: worldX, z: worldZ },
            color: normalizedColor,
            yOffset: settings.yOffset,
            alpha: Math.max(a / 255, 0.1),
          };
          spatialGrid.set(gridKey, element);
          candidates.push(element);
        }
      }
    }
  }

  // Final sampling if still over limit
  let finalElements: any[] = [];
  if (candidates.length > maxElements) {
    // Uniform sampling
    for (let i = 0; i < maxElements; i++) {
      const idx = Math.floor((i * candidates.length) / maxElements);
      finalElements.push(candidates[idx]);
    }
  } else {
    finalElements = candidates;
  }

  return finalElements;
}

// Main worker message handler
self.onmessage = async (event: MessageEvent<ProcessGIFMessage>) => {
  if (event.data.type !== 'PROCESS_GIF') return;

  const startTime = performance.now();
  const { buffer, settings } = event.data;

  try {
    // Step 1: Parse GIF
    postMessage({
      type: 'PROGRESS',
      progress: 10,
      stage: 'Parsing',
      details: 'Reading GIF structure...',
    } as ProgressMessage);

    const parsedGif = parseGIF(buffer);
    const decompressedFrames = decompressFrames(parsedGif, true);

    if (!decompressedFrames || decompressedFrames.length === 0) {
      throw new Error('Failed to decompress GIF frames');
    }

    postMessage({
      type: 'PROGRESS',
      progress: 20,
      stage: 'Decompressed',
      details: `Found ${decompressedFrames.length} frames`,
    } as ProgressMessage);

    // Step 2: Convert frames to ImageData
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
        timestamp: decompressedFrames.slice(0, index + 1).reduce((acc, f) => acc + f.delay, 0),
      };
    });

    // Step 3: Adaptive frame skipping
    const framesToProcess: typeof framesData = [];
    let skippedFrames = 0;

    if (settings.adaptiveFrameSkip && framesData.length > 10) {
      // Always keep first frame
      framesToProcess.push(framesData[0]);

      for (let i = 1; i < framesData.length; i++) {
        const prevFrame = framesToProcess[framesToProcess.length - 1];
        const currentFrame = framesData[i];

        const diff = calculateFrameDifference(prevFrame.imageData, currentFrame.imageData);

        // Keep frame if difference is significant
        if (diff >= settings.frameDiffThreshold) {
          framesToProcess.push(currentFrame);
        } else {
          skippedFrames++;
        }
      }

      postMessage({
        type: 'PROGRESS',
        progress: 30,
        stage: 'Optimized',
        details: `Skipped ${skippedFrames} similar frames (${framesToProcess.length} remain)`,
      } as ProgressMessage);
    } else {
      framesToProcess.push(...framesData);
    }

    // Step 4: Process frames in batches
    const BATCH_SIZE = 5;
    const totalBatches = Math.ceil(framesToProcess.length / BATCH_SIZE);
    let totalElementsProcessed = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, framesToProcess.length);
      const batch = framesToProcess.slice(batchStart, batchEnd);

      // Process batch
      const batchElements: any[] = [];

      for (const frame of batch) {
        const elements = extractElementsFromFrame(frame.imageData, settings, frame.frameIndex);

        // Add frame metadata to each element
        elements.forEach((el) => {
          el.frameIndex = frame.frameIndex;
          el.timestamp = frame.timestamp;
          el.animationGroup = 'gif-animation';
          el.layerId = `gif-frame-${frame.frameIndex}`;
          el.delay = settings.gifFrameDelay;
          el.totalFrames = framesToProcess.length;
        });

        batchElements.push(...elements);
        totalElementsProcessed += elements.length;
      }

      // Send batch complete
      postMessage({
        type: 'BATCH_COMPLETE',
        elements: batchElements,
        frameIndex: batch[0].frameIndex,
        batchIndex: batchIndex,
      } as BatchCompleteMessage);

      // Update progress
      const progress = 30 + ((batchIndex + 1) / totalBatches) * 60;
      postMessage({
        type: 'PROGRESS',
        progress: Math.round(progress),
        stage: 'Processing',
        details: `Batch ${batchIndex + 1}/${totalBatches} (${totalElementsProcessed} elements)`,
      } as ProgressMessage);
    }

    // Step 5: Complete
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    postMessage({
      type: 'COMPLETE',
      totalFrames: framesToProcess.length,
      totalElements: totalElementsProcessed,
      skippedFrames: skippedFrames,
      processingTime: processingTime,
    } as CompleteMessage);
  } catch (error: any) {
    postMessage({
      type: 'ERROR',
      error: error.message || 'Unknown error during GIF processing',
    } as ErrorMessage);
  }
};
