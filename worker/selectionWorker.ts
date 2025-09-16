// selectionWorker.ts
// Web Worker for fast selection box calculations

interface ElementData {
  id: string;
  x: number;
  y?: number;
  z: number;
  yOffset?: number;
}

interface SelectionBox {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

interface SelectionRequest {
  elements: ElementData[];
  selectionBox: SelectionBox;
  viewMode: 'top' | 'side';
  offset: { x: number; y: number };
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface SelectionResponse {
  selectedIds: string[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const ctx: Worker = self as any;

ctx.addEventListener('message', (event: MessageEvent<SelectionRequest>) => {
  const { elements, selectionBox, viewMode, offset, scale, canvasWidth, canvasHeight } = event.data;

  const centerX = canvasWidth / 2 + offset.x;
  const centerY = canvasHeight / 2 + offset.y;

  const x1 = Math.min(selectionBox.start.x, selectionBox.end.x);
  const y1 = Math.min(selectionBox.start.y, selectionBox.end.y);
  const x2 = Math.max(selectionBox.start.x, selectionBox.end.x);
  const y2 = Math.max(selectionBox.start.y, selectionBox.end.y);

  const selectedIds: string[] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const el of elements) {
    let screenX, screenY;
    if (viewMode === 'side') {
      screenX = centerX + el.x * 10 * scale;
      const yVal = typeof el.yOffset === 'number' ? el.yOffset : (typeof el.y === 'number' ? el.y : 0);
      screenY = centerY - yVal * 10 * scale;
    } else {
      screenX = centerX + el.x * 10 * scale;
      screenY = centerY + el.z * 10 * scale;
    }
    if (screenX >= x1 && screenX <= x2 && screenY >= y1 && screenY <= y2) {
      selectedIds.push(el.id);
      if (screenX < minX) minX = screenX;
      if (screenX > maxX) maxX = screenX;
      if (screenY < minY) minY = screenY;
      if (screenY > maxY) maxY = screenY;
    }
  }

  ctx.postMessage({ selectedIds, minX, minY, maxX, maxY } as SelectionResponse);
});

export {}; 