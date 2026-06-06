// Web Worker for code generation - runs off-main-thread
// This worker receives serialized data and performs code generation without blocking the UI

import type { Layer, Element, ActionRecord } from "../types"

// ─── HELPER FUNCTIONS (duplicated from generate-effect-code.ts to avoid store deps) ───

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const paramAliases: Record<string, string> = {
  particle: 'p', mob: 'm', amount: 'a', count: 'a', spread: 'offset',
  hSpread: 'hs', vSpread: 'vs', xSpread: 'xs', zSpread: 'zs', speed: 's',
  yOffset: 'y', viewDistance: 'vd', fromorigin: 'fo', directional: 'd',
  directionReversed: 'dr', direction: 'dir', fixedyaw: 'yaw', fixedpitch: 'pitch',
  color: 'c', exactoffsets: 'eo', useEyeLocation: 'uel', forwardOffset: 'sfo',
  sideOffset: 'sso', repeatInterval: 'repeati', targetInterval: 'targetI',
};

function buildParams(params: Record<string, any>) {
  const usedAliases = new Set<string>();
  return Object.entries(params)
    .filter(([k, v]) => !(v === 0 && k !== 'repeatInterval') && v !== false && v !== undefined && v !== "" && v !== null)
    .filter(([k]) => { const alias = paramAliases[k] || k; if (usedAliases.has(alias)) return false; usedAliases.add(alias); return true; })
    .map(([k, v]) => `${paramAliases[k] || k}=${v}`)
    .join(";");
}

let _useRelativeOffsets = false;

function buildTargeterOffset(targeter: string, x: number, z: number, y: number, useRelativeOffsets: boolean = false): string {
  if (useRelativeOffsets) {
    return `@${targeter}{fo=${z.toFixed(4)};so=${x.toFixed(4)};uo=${y.toFixed(4)}}`;
  }
  return `@${targeter}{xoffset=${x.toFixed(4)};zoffset=${z.toFixed(4)};yoffset=${y.toFixed(4)}}`;
}

function generateEffectLine(effectType: string, p: string, c: string, a: number, repeat: number, interval: number, x: number, z: number, y: number, targeter: string, effectParams?: any) {
  const offsetStr = buildTargeterOffset(targeter, x, z, y, _useRelativeOffsets);
  switch (effectType) {
    case "particles": { const params = buildParams({ particle: p, color: c, amount: a, size: 1, repeat, repeatInterval: interval }); return `  - e:p{${params}} ${offsetStr}`; }
    case "particlelinehelix": { const { distanceBetween, startYOffset, targetYOffset, fromOrigin, helixLength, helixRadius, helixRotation, maxDistance } = effectParams || {}; const params = buildParams({ Fo: fromOrigin, db: distanceBetween, hl: helixLength, syo: startYOffset, tyo: targetYOffset, particle: p, color: c, hr: helixRadius, speed: interval, md: maxDistance }); return `  - particlelinehelix{${params}} ${offsetStr}`; }
    case "particleorbital": { const { radius, points, ticks, interval: orbitalInterval, rotationX, rotationY, rotationZ, offsetX, offsetY, offsetZ, angularVelocityX, angularVelocityY, angularVelocityZ, rotate, reversed } = effectParams || {}; const params = buildParams({ r: radius, points, t: ticks, i: orbitalInterval, rotX: rotationX, rotY: rotationY, rotZ: rotationZ, offx: offsetX, offy: offsetY, offz: offsetZ, avx: angularVelocityX, avy: angularVelocityY, avz: angularVelocityZ, rotate, reversed, particle: p, color: c }); return `  - particleorbital{${params}} ${offsetStr}`; }
    case "particlering": { const { ringPoints, ringRadius } = effectParams || {}; const params = buildParams({ particle: p, color: c, radius: ringRadius, points: ringPoints, amount: a }); return `  - particlering{${params}} ${offsetStr}`; }
    case "particleline": { const { distanceBetween: d, startYOffset: s, targetYOffset: t, fromOrigin: f, zigzag, zigzags, zigzagOffset, maxDistance: m } = effectParams || {}; const params = buildParams({ db: d, syo: s, tyo: t, fo: f, zz: zigzag, zzs: zigzags, zzo: zigzagOffset, md: m, particle: p, color: c }); return `  - particleline{${params}} ${offsetStr}`; }
    case "particlelinering": { const { distanceBetween: d, startYOffset: s, targetYOffset: t, fromOrigin: f, ringpoints, ringradius, maxDistance: m } = effectParams || {}; const params = buildParams({ db: d, syo: s, tyo: t, fo: f, rp: ringpoints, rr: ringradius, md: m, particle: p, color: c }); return `  - particlelinering{${params}} ${offsetStr}`; }
    case "particlesphere": { const { sphereRadius } = effectParams || {}; const params = buildParams({ particle: p, color: c, amount: a, radius: sphereRadius }); return `  - particlesphere{${params}} ${offsetStr}`; }
    case "particletornado": { const { maxRadius, tornadoHeight, tornadoInterval, tornadoDuration, rotationSpeed, sliceHeight, stopOnCasterDeath, stopOnEntityDeath, cloudParticle, cloudSize, cloudAmount, cloudHSpread, cloudVSpread, cloudPSpeed, cloudYOffset } = effectParams || {}; const params = buildParams({ p: p, cp: cloudParticle, mr: maxRadius, h: tornadoHeight, i: tornadoInterval, d: tornadoDuration, rs: rotationSpeed, sh: sliceHeight, scd: stopOnCasterDeath, sed: stopOnEntityDeath, cs: cloudSize, ca: cloudAmount, chs: cloudHSpread, cvs: cloudVSpread, cps: cloudPSpeed, cyo: cloudYOffset }); return `  - particletornado{${params}} ${offsetStr}`; }
    default: { const params = buildParams({ particle: p, color: c, amount: a, size: 1, repeat, repeatInterval: interval }); return `  - e:p{${params}} ${offsetStr}`; }
  }
}

// ─── Action recording processors ───

function processActionRecords(actionRecords: ActionRecord[], layers: Layer[], elementStoreMap: Record<string, Element>): { [elementId: string]: { x: number, z: number, yOffset: number } } {
  const elementPositions: { [elementId: string]: { x: number, z: number, yOffset: number } } = {};
  layers.forEach(layer => {
    layer.elements.forEach(element => {
      const fresh = elementStoreMap[element.id] || element;
      elementPositions[element.id] = { x: fresh.position.x, z: fresh.position.z, yOffset: fresh.yOffset || 0 };
    });
  });
  actionRecords.forEach(record => {
    if (record.type === 'transform_update' || record.type === 'move_continuous') {
      const positions = record.data.currentPositions || record.data.positions;
      if (positions) positions.forEach((pos: any) => { if (elementPositions[pos.id]) elementPositions[pos.id] = { x: pos.x, z: pos.z, yOffset: pos.yOffset || 0 }; });
    } else if (record.type === 'transform_end') {
      if (record.data.currentPositions) record.data.currentPositions.forEach((pos: any) => { if (elementPositions[pos.id]) elementPositions[pos.id] = { x: pos.x, z: pos.z, yOffset: pos.yOffset || 0 }; });
    } else if (record.type === 'move') {
      const { deltaX = 0, deltaZ = 0, deltaYOffset = 0 } = record.data || {} as any;
      record.elementIds.forEach((id: string) => { const prev = elementPositions[id]; if (prev) elementPositions[id] = { x: prev.x + deltaX, z: prev.z + deltaZ, yOffset: (prev.yOffset || 0) + deltaYOffset }; });
    } else if (record.type === 'element_add') {
      const { position, yOffset = 0 } = record.data || {} as any;
      if (position) record.elementIds.forEach((id: string) => { elementPositions[id] = { x: position.x, z: position.z, yOffset }; });
    }
  });
  return elementPositions;
}

function processActionAttributes(actionRecords: ActionRecord[], layers: Layer[]): { colors: Record<string, string>, repeats: Record<string, number> } {
  const colors: Record<string, string> = {};
  const repeats: Record<string, number> = {};
  layers.forEach(layer => { layer.elements.forEach(el => { if ((el as any).color) colors[el.id] = (el as any).color; if ((el as any).elementCount) repeats[el.id] = (el as any).elementCount; }); });
  actionRecords.forEach(record => {
    if (record.type === 'color') { const c = record.data.color as string | undefined; if (!c) return; record.elementIds?.forEach(id => { colors[id] = c; }); }
    else if (record.type === 'particle_count') { const cnt = record.data.particleCount as number | undefined; if (typeof cnt !== 'number') return; record.elementIds?.forEach(id => { repeats[id] = cnt; }); }
  });
  return { colors, repeats };
}

function generateActionRecordingFrames(actionRecords: ActionRecord[], layers: Layer[]): Array<{ delay: number, elements: Array<{ id: string, x: number, z: number, yOffset: number }>, isIdle: boolean, sourceType: string }> {
  const frames: Array<{ delay: number, elements: Array<{ id: string, x: number, z: number, yOffset: number }>, isIdle: boolean, sourceType: string }> = [];
  const livePositions: Record<string, { x: number, z: number, yOffset: number }> = {};
  layers.forEach(layer => { layer.elements.forEach(el => { livePositions[el.id] = { x: el.position.x, z: el.position.z, yOffset: typeof el.yOffset === 'number' ? el.yOffset : 0 }; }); });
  const hasTransformActions = actionRecords.some(r => r.type === 'transform_update' || r.type === 'transform_end' || r.type === 'move' || r.type === 'move_continuous' || r.type === 'element_add' || r.type === 'idle');
  if (!hasTransformActions) return frames;

  actionRecords.forEach((record, index) => {
    if (record.type === 'transform_update' || record.type === 'transform_end' || record.type === 'move_continuous') {
      const positions = record.data.currentPositions || record.data.positions;
      if (positions && positions.length > 0) {
        const frameElements: Array<{ id: string, x: number, z: number, yOffset: number }> = [];
        positions.forEach((pos: any) => { livePositions[pos.id] = { x: pos.x, z: pos.z, yOffset: pos.yOffset || 0 }; frameElements.push({ id: pos.id, x: pos.x, z: pos.z, yOffset: pos.yOffset || 0 }); });
        frames.push({ delay: index === 0 ? 0 : Math.max(1, record.delayTicks), elements: frameElements, isIdle: false, sourceType: record.type });
      }
    } else if (record.type === 'move') {
      const { deltaX = 0, deltaZ = 0, deltaYOffset = 0 } = record.data || {} as any;
      const affectedIds = record.elementIds || [];
      if (affectedIds.length > 0 && (deltaX !== 0 || deltaZ !== 0 || deltaYOffset !== 0)) {
        const frameElements: Array<{ id: string, x: number, z: number, yOffset: number }> = [];
        affectedIds.forEach(id => { const prev = livePositions[id]; if (prev) { const updated = { x: prev.x + deltaX, z: prev.z + deltaZ, yOffset: (prev.yOffset || 0) + deltaYOffset }; livePositions[id] = updated; frameElements.push({ id, ...updated }); } });
        if (frameElements.length > 0) frames.push({ delay: index === 0 ? 0 : Math.max(1, record.delayTicks), elements: frameElements, isIdle: false, sourceType: record.type });
      }
    } else if (record.type === 'element_add') {
      const id = record.elementIds?.[0]; const pos = record.data?.position; const yOffset = typeof record.data?.yOffset === 'number' ? record.data.yOffset : 0;
      if (id && pos && typeof pos.x === 'number' && typeof pos.z === 'number') livePositions[id] = { x: pos.x, z: pos.z, yOffset };
    } else if (record.type === 'idle') {
      const frameElements: Array<{ id: string, x: number, z: number, yOffset: number }> = [];
      if (record.data.lastPositions && record.data.lastPositions.length > 0) {
        record.data.lastPositions.forEach((pos: any) => { frameElements.push({ id: pos.id, x: pos.x, z: pos.z, yOffset: pos.yOffset }); });
      } else if (record.elementIds && record.elementIds.length > 0) {
        record.elementIds.forEach(elementId => { let found: Element | undefined; for (const layer of layers) { const el = layer.elements.find(e => e.id === elementId); if (el) { found = el; break; } } if (found && (found as any).position) { frameElements.push({ id: elementId, x: (found as any).position.x, z: (found as any).position.z, yOffset: typeof (found as any).yOffset === 'number' ? (found as any).yOffset : 0 }); } });
      } else {
        Object.entries(livePositions).forEach(([id, pos]) => { frameElements.push({ id, x: pos.x, z: pos.z, yOffset: pos.yOffset }); });
      }
      if (frameElements.length > 0) frames.push({ delay: record.delayTicks, elements: frameElements, isIdle: true, sourceType: record.type });
    }
  });
  return frames;
}

// ─── MAIN WORKER MESSAGE HANDLER ───

interface WorkerInput {
  layers: Layer[];
  settings: any;
  modes: any;
  modeSettings: any;
  frameMode: string;
  manualFrameCount: number;
  optimize: boolean;
  chainSequence: string[];
  chainItems: Array<{ type: 'element' | 'delay', id: string, elementId?: string, elementIds?: string[], delay?: number }>;
  actionRecords: ActionRecord[];
  actionRecordingSettings?: { optimizeCircleFrames?: boolean; optimizeIdleRepeat?: boolean; debugFrameComments?: boolean; };
  elementStoreMap: Record<string, Element>;
  discordInviteUrl: string;
}

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  try {
    const result = generateCode(event.data);
    self.postMessage({ type: 'success', code: result });
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err.message || String(err) });
  }
};

function generateCode(input: WorkerInput): string {
  const { layers: rawLayers, settings, modes, modeSettings, frameMode, manualFrameCount, optimize, chainSequence, chainItems, actionRecords, actionRecordingSettings, elementStoreMap, discordInviteUrl } = input;

  _useRelativeOffsets = settings.useRelativeOffsets !== false;

  // Merge element store data
  const layers = rawLayers.map(layer => ({
    ...layer,
    elements: layer.elements.map(el => ({ ...el, ...(elementStoreMap[el.id] || {}) }))
  }));

  const totalElements = layers.reduce((sum, l) => sum + l.elements.length, 0);
  const updatedElementPositions = processActionRecords(actionRecords, layers, elementStoreMap);
  const { colors: liveColors, repeats: liveRepeats } = processActionAttributes(actionRecords, layers);
  const actionFrames = generateActionRecordingFrames(actionRecords, layers);
  const hasActionRecording = actionRecords.length > 0;
  const now = new Date().toISOString();

  const modeNames: { [key: string]: string } = { rotateMode: "Rotate Mode", rainbowMode: "Rainbow Mode", riseMode: "Rise Mode", localRotateMode: "Local Rotate Mode", proximityMode: "Proximity Chain", chainMode: "Manual Chain", staticRainbowMode: "Static Rainbow", moveMode: "Move Mode" };
  const activeModes = Object.entries(modes || {}).filter(([_, value]) => value === true).map(([key]) => modeNames[key] || key);

  let codeLines: string[] = [];
  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
  codeLines.push(`# 🎆 CREATED WITH AURAFX.ONLINE - FREE PARTICLE EFFECT GENERATOR`);
  codeLines.push(`# ⚡ Create your own effects: https://aurafx.online`);
  codeLines.push(`# 💬 Join our Discord: ${discordInviteUrl}`);
  codeLines.push(`# 🚀 No registration required - 100% Free!`);
  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
  codeLines.push(`# Generated: ${now}`);
  codeLines.push(`# Elements: ${totalElements}`);
  if (activeModes.length > 0) codeLines.push(`# Active Modes: ${activeModes.join(', ')}`);
  if (actionRecords.length > 0) { codeLines.push(`# Action Recording: ${actionRecords.length} recorded actions`); codeLines.push(``); }
  if (modes.chainMode && chainItems.length > 0) { const ec = chainItems.filter(i => i.type === 'element').length; codeLines.push(`# Chain Mode: ${ec} groups`); }

  codeLines.push(`${settings.skillName}:`);
  codeLines.push(`  Skills:`);

  // ─── ACTION RECORDING PATH ───
  if (hasActionRecording) {
    codeLines.push(`  # Action Recording Mode - Base canvas elements skipped, only actions shown`);
    const elementAddActions = actionRecords.filter(r => r.type === 'element_add');
    if (elementAddActions.length > 0) {
      codeLines.push(`  # Added Elements: ${elementAddActions.length} elements`);
      elementAddActions.forEach((record, index) => {
        const { position, yOffset = 0, elementType = 'particles', particle = 'flame', color = '#ff6b35', alpha = 10, elementCount = 1 } = record.data as any || {};
        if (position && typeof position.x === 'number' && typeof position.z === 'number') {
          codeLines.push(`  # Element ${index + 1}: Added at (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);
          codeLines.push(generateEffectLine(elementType, particle, color, alpha, elementCount, 1, position.x, position.z, yOffset + (settings.yOffset ?? 0), 'origin', {}));
        }
      });
      if (actionFrames.length > 0) codeLines.push(`  # Animation frames follow:`);
    }

    if (actionFrames.length > 0) {
      codeLines.push(`  # Action Recording Animation: ${actionFrames.length} frames`);
      type CompactFrame = { delay: number, elements: Array<{ id: string, x: number, z: number, yOffset: number }>, repeatCount: number, isIdle: boolean, sourceType: string };
      const compactFrames: CompactFrame[] = [];
      const elementsEqual = (a: Array<{ id: string, x: number, z: number, yOffset: number }>, b: Array<{ id: string, x: number, z: number, yOffset: number }>) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) { if (a[i].id !== b[i].id || Math.abs(a[i].x - b[i].x) > 1e-6 || Math.abs(a[i].z - b[i].z) > 1e-6 || Math.abs((a[i].yOffset || 0) - (b[i].yOffset || 0)) > 1e-6) return false; }
        return true;
      };

      for (let i = 0; i < actionFrames.length; i++) {
        const current = actionFrames[i];
        if (compactFrames.length === 0) { compactFrames.push({ delay: current.delay, elements: current.elements, repeatCount: 1, isIdle: current.isIdle, sourceType: current.sourceType }); continue; }
        const last = compactFrames[compactFrames.length - 1];
        if (last.isIdle && current.isIdle && last.delay === current.delay && elementsEqual(last.elements, current.elements)) { last.repeatCount += 1; }
        else { compactFrames.push({ delay: current.delay, elements: current.elements, repeatCount: 1, isIdle: current.isIdle, sourceType: current.sourceType }); }
      }

      compactFrames.forEach((frame, frameIndex) => {
        if (actionRecordingSettings?.debugFrameComments ?? false) codeLines.push(`  # frame=${frameIndex + 1} type=${frame.sourceType} idle=${frame.isIdle ? 'yes' : 'no'} delay=${frame.delay} repeatx=${frame.repeatCount}`);
        if (!frame.isIdle && frameIndex > 0 && frame.delay > 0) codeLines.push(`  - delay ${frame.delay}`);

        const layerIdToItems: Record<string, { layer: Layer, items: Array<{ fe: { id: string, x: number, z: number, yOffset: number }, el: Element }> }> = {};
        frame.elements.forEach(fe => { for (const layer of layers) { const el = layer.elements.find(e => e.id === fe.id); if (el) { if (!layerIdToItems[layer.id]) layerIdToItems[layer.id] = { layer, items: [] }; layerIdToItems[layer.id].items.push({ fe, el }); break; } } });

        Object.values(layerIdToItems).forEach(group => {
          const elementLayer = group.layer as any;
          const items = group.items;
          if (items.length === 0) return;
          let repeat = 1; let repeatIntervalOverride = elementLayer.repeatInterval;
          if (frame.isIdle && (actionRecordingSettings?.optimizeIdleRepeat ?? true)) {
            const fr = Math.max(1, frame.repeatCount); const oi = Math.max(0, frame.delay || 0);
            if (oi === 0) { repeat = fr; repeatIntervalOverride = 0; }
            else { const ti = Math.max(1, Math.floor(oi / 2)); repeat = Math.max(1, Math.round((fr * oi) / ti)); repeatIntervalOverride = ti; }
          }
          const colors = items.map(({ el }) => (liveColors[el.id] || (el as any).color || elementLayer.color));
          const typesOk = items.every(({ el }) => (el as any).type === 'circle');
          const allSameColor = colors.every(c => c === colors[0]);
          const allowCircleOpt = actionRecordingSettings?.optimizeCircleFrames ?? false;
          if (allowCircleOpt && typesOk && allSameColor && items.length > 2) {
            const cx = items.reduce((s, { fe }) => s + fe.x, 0) / items.length;
            const cz = items.reduce((s, { fe }) => s + fe.z, 0) / items.length;
            let radius = items.reduce((s, { fe }) => s + Math.hypot(fe.x - cx, fe.z - cz), 0) / items.length;
            const y = (items[0].fe.yOffset || 0) + (elementLayer.yOffset ?? 0) + (settings.yOffset ?? 0);
            codeLines.push(generateEffectLine("particlering", elementLayer.particle, colors[0], elementLayer.alpha, repeat, repeatIntervalOverride, cx, cz, y, elementLayer.targeter, { ...(elementLayer.effectParams || {}), ringPoints: items.length, ringRadius: radius }));
          } else {
            items.forEach(({ fe, el }) => { const y = fe.yOffset + (elementLayer.yOffset ?? 0) + (settings.yOffset ?? 0); const color = liveColors[el.id] || (el as any).color || elementLayer.color; codeLines.push(generateEffectLine(elementLayer.effectType || "particles", elementLayer.particle, color, elementLayer.alpha, repeat, repeatIntervalOverride, fe.x, fe.z, y, elementLayer.targeter, elementLayer.effectParams)); });
          }
        });
        if (frame.isIdle) { const totalIdleTicks = (frame.repeatCount || 1) * Math.max(0, frame.delay || 0); if (totalIdleTicks > 0) codeLines.push(`  - delay ${totalIdleTicks}`); }
      });
    } else {
      codeLines.push(`  # No transform frames recorded`);
    }
    return codeLines.join('\n');
  }

  // ─── GIF ANIMATION ───
  const gifLayers = layers.filter(l => l.isGifFrame);
  if (gifLayers.length > 0) {
    gifLayers.sort((a, b) => (a.frameIndex || 0) - (b.frameIndex || 0));
    codeLines.push(`  # GIF Animation: ${gifLayers.length} frames`);
    const frameDelay = settings.gifFrameDelay || 2;
    gifLayers.forEach((layer, index) => {
      codeLines.push(`  # Frame ${index + 1}/${gifLayers.length} (${layer.elements.length} elements)`);
      if (index > 0) codeLines.push(`  - delay ${frameDelay}`);
      layer.elements.forEach(element => {
        if (element?.position && typeof element.position.x === "number" && typeof element.position.z === "number") {
          const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
          const repeat = element.elementCount || layer.repeat;
          codeLines.push(generateEffectLine(layer.effectType || "particles", layer.particle, element.color || layer.color, layer.alpha, repeat, layer.repeatInterval, element.position.x, element.position.z, y, layer.targeter, layer.effectParams));
        }
      });
      if (index < gifLayers.length - 1) codeLines.push(``);
    });
    if (settings.gifLoop !== false) { codeLines.push(`  # Loop animation`); codeLines.push(`  - delay ${settings.gifLoopDelay || 10}`); }
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
    codeLines.push(`# 🎬 GIF Animation Complete! Made with AuraFX.online`);
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
    return codeLines.join('\n');
  }

  // ─── CHAIN MODE (global) ───
  if (modes.chainMode && chainItems.length > 0 && !modes.rainbowMode && !modes.rotateMode && !modes.riseMode && !modes.localRotateMode && !modes.moveMode && !modes.staticRainbowMode) {
    const allElements: Array<Element & { layerId: string, layerRef: Layer }> = [];
    layers.forEach(layer => { layer.elements.forEach(element => { if (element?.position && typeof element.position.x === "number" && typeof element.position.z === "number") allElements.push({ ...element, layerId: layer.id, layerRef: layer }); }); });
    let groupNumber = 1;
    for (const item of chainItems) {
      if (item.type === 'delay') { codeLines.push(`  - delay ${item.delay || 1}`); }
      else if (item.type === 'element') {
        const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
        codeLines.push(`  # Chain ${elementIds.length > 1 ? 'Group' : 'Element'} ${groupNumber} (${elementIds.length} element${elementIds.length > 1 ? 's' : ''})`);
        for (const elementId of elementIds) {
          const element = allElements.find(el => el.id === elementId);
          if (element) { const layer = element.layerRef; const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0); const repeat = element.elementCount || layer.repeat; codeLines.push(generateEffectLine(layer.effectType || "particles", layer.particle, element.color || layer.color, layer.alpha, repeat, layer.repeatInterval, element.position.x, element.position.z, y, layer.targeter, layer.effectParams)); }
        }
        codeLines.push(""); groupNumber++;
      }
    }
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
    codeLines.push(`# ⛓️ Chain Effect Complete! Powered by AuraFX.online`);
    codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
    return codeLines.join("\n");
  }

  // ─── NORMAL / ANIMATED LAYERS ───
  layers.forEach((layer: Layer) => {
    if (layer.elements.length === 0) return;
    codeLines.push(`  # ${layer.name} - Made with AuraFX.online`);

    const elementsToProcess = layer.elements.filter((el): el is Element => !!el?.position && typeof el.position.x === "number" && typeof el.position.z === "number");
    if (elementsToProcess.length === 0) return;

    // Optimize mode
    if (optimize) {
      const groups: Record<string, Element[]> = {};
      for (const el of elementsToProcess) { const gid = el.groupId || `single-${el.id}`; if (!groups[gid]) groups[gid] = []; groups[gid].push(el); }
      for (const groupElements of Object.values(groups)) {
        const allCircle = groupElements.every(el => el.type === "circle");
        const firstColor = groupElements[0]?.color || layer.color;
        const allSameColor = groupElements.every(el => (el.color || layer.color) === firstColor);
        if (allCircle && groupElements.length > 2 && allSameColor) {
          const center = { x: groupElements.reduce((s, el) => s + el.position.x, 0) / groupElements.length, z: groupElements.reduce((s, el) => s + el.position.z, 0) / groupElements.length };
          const radius = groupElements.reduce((s, el) => s + Math.hypot(el.position.x - center.x, el.position.z - center.z), 0) / groupElements.length;
          const y = (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
          codeLines.push(generateEffectLine("particlering", layer.particle, firstColor, layer.alpha, layer.repeat, layer.repeatInterval, center.x, center.z, y, layer.targeter, { ...layer.effectParams, ringPoints: groupElements.length, ringRadius: radius }));
        } else {
          for (const element of groupElements) { const y = (element.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0); const repeat = element.elementCount || layer.repeat; codeLines.push(generateEffectLine(layer.effectType || "particles", layer.particle, element.color || layer.color, layer.alpha, repeat, layer.repeatInterval, element.position.x, element.position.z, y, layer.targeter, layer.effectParams)); }
        }
      }
      return;
    }

    // Sort by chain/proximity
    let filtered = elementsToProcess;
    if (modes.chainMode && chainItems.length > 0) {
      const chainElements: Element[] = [];
      for (const item of chainItems) { if (item.type === 'element') { const ids = item.elementIds || (item.elementId ? [item.elementId] : []); for (const id of ids) { const el = elementsToProcess.find(e => e.id === id); if (el) chainElements.push(el); } } }
      const allIds = chainItems.filter(i => i.type === 'element').flatMap(i => i.elementIds || (i.elementId ? [i.elementId] : []));
      filtered = [...chainElements, ...elementsToProcess.filter(el => !allIds.includes(el.id))];
    } else if (modes.proximityMode) {
      const dist = (a: Element, b: Element) => { const dx = a.position.x - b.position.x; const dz = a.position.z - b.position.z; return dx * dx + dz * dz; };
      const els = [...elementsToProcess]; const ordered: Element[] = []; let cur = els.shift();
      if (cur) { ordered.push(cur); while (els.length) { let mi = 0, md = dist(cur, els[0]); for (let i = 1; i < els.length; i++) { const d = dist(cur, els[i]); if (d < md) { md = d; mi = i; } } cur = els.splice(mi, 1)[0]; ordered.push(cur); } }
      filtered = ordered;
    }

    // Rainbow (animated)
    if (modes.rainbowMode && !modes.staticRainbowMode && !modes.rotateMode && !modes.riseMode && !modes.localRotateMode) {
      const period = modeSettings.rainbowMode?.period || 3;
      const frames = frameMode === "manual" && manualFrameCount ? Math.max(1, Math.min(manualFrameCount, 1000)) : Math.floor(period * 20);
      for (let frame = 0; frame < frames; frame++) {
        codeLines.push(`  - delay 1`);
        const hue = (frame / frames) % 1.0; const rgb = hsvToRgb(hue, 1, 1);
        const color = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
        filtered.forEach(el => { const y = (el.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0); codeLines.push(generateEffectLine(layer.effectType || "particles", layer.particle, color, layer.alpha, layer.repeat, layer.repeatInterval, el.position.x, el.position.z, y, layer.targeter, layer.effectParams)); });
      }
      return;
    }

    // Static Rainbow
    if (modes.staticRainbowMode && !modes.rainbowMode && !modes.rotateMode && !modes.riseMode && !modes.localRotateMode) {
      filtered.forEach((el, idx) => {
        const y = (el.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0);
        const hue = filtered.length > 1 ? idx / (filtered.length - 1) : 0; const rgb = hsvToRgb(hue, 1, 1);
        const color = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
        codeLines.push(generateEffectLine(layer.effectType || "particles", layer.particle, color, layer.alpha, layer.repeat, layer.repeatInterval, el.position.x, el.position.z, y, layer.targeter, layer.effectParams));
      });
      return;
    }

    // No modes
    if (!Object.values(modes).some(Boolean)) {
      codeLines.push(`  - delay ${layer.tickDelay}`);
      elementsToProcess.forEach(el => { const y = (el.yOffset ?? 0) + (layer.yOffset ?? 0) + (settings.yOffset ?? 0); const repeat = el.elementCount || layer.repeat; codeLines.push(generateEffectLine(layer.effectType || "particles", layer.particle, el.color || layer.color, layer.alpha, repeat, layer.repeatInterval, el.position.x, el.position.z, y, layer.targeter, layer.effectParams)); });
      return;
    }

    // Animation loop
    let frames = frameMode === "manual" && manualFrameCount ? Math.max(1, Math.min(manualFrameCount, 1000)) : 100;
    if (frameMode !== 'manual') {
      let moveFrames = 0; if (modes.moveMode) { const speed = modeSettings.moveMode?.speed || 0.5; const maxDist = modeSettings.moveMode?.maxDistance || 10; if (speed > 0) moveFrames = Math.ceil(maxDist / speed); }
      let rotateFrames = 0; if (modes.rotateMode) { rotateFrames = Math.floor((modeSettings.rotateMode?.period || 5) * 20); }
      frames = Math.max(moveFrames, rotateFrames, 1);
    }

    const globalCenter = { x: 0, z: 0 };
    const elementOrbits = filtered.map(el => { const dx = el.position.x - globalCenter.x; const dz = el.position.z - globalCenter.z; return { radius: Math.sqrt(dx * dx + dz * dz), initialAngle: Math.atan2(dz, dx), startX: el.position.x, startZ: el.position.z }; });

    for (let frame = 0; frame <= frames; frame++) {
      if (frame > 0) codeLines.push(`  - delay 1`);
      const angle = (frame / frames) * (2 * Math.PI);

      filtered.forEach((element, elementIdx) => {
        const orbit = elementOrbits[elementIdx];
        let total_dx = 0, total_dy = 0, total_dz = 0;

        if (modes.moveMode) {
          const { direction = 0, elevation = 0, speed = 0.5, maxDistance = 10 } = modeSettings.moveMode || {};
          if (direction !== -1) { const dr = (direction / 8) * 2 * Math.PI + Math.PI / 2; const er = (elevation / 90) * (Math.PI / 2); const dist = Math.min(frame * speed, maxDistance); total_dx += Math.cos(dr) * Math.cos(er) * dist; total_dz += Math.sin(dr) * Math.cos(er) * dist; total_dy += Math.sin(er) * dist; }
          else { if (elevation !== 0) { const dist = Math.min(frame * speed, maxDistance); total_dy += elevation * (dist / maxDistance); } }
        }
        if (modes.rotateMode) { const ca = orbit.initialAngle + angle; total_dx += (globalCenter.x + orbit.radius * Math.cos(ca) - element.position.x); total_dz += (globalCenter.z + orbit.radius * Math.sin(ca) - element.position.z); }

        const rp = updatedElementPositions[element.id];
        let bx = rp ? rp.x : element.position.x, bz = rp ? rp.z : element.position.z, by = rp ? rp.yOffset : (element.yOffset ?? 0);
        let xF = bx + total_dx, zF = bz + total_dz, y = by + (layer.yOffset ?? 0) + (settings.yOffset ?? 0) + total_dy;

        if (modes.localRotateMode) { const { speed: ls = 3, radius: lr = 2 } = modeSettings.localRotateMode || {}; const la = frame * (ls * 0.1); xF = xF + Math.cos(la) * lr; zF = zF + Math.sin(la) * lr; }

        let currentColor;
        if (modes.rainbowMode) { const hue = (frame * 0.02) % 1.0; const r = Math.floor(255 * Math.max(0, Math.min(1, Math.abs(hue * 6 - 3) - 1))); const g = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 2)))); const b = Math.floor(255 * Math.max(0, Math.min(1, 2 - Math.abs(hue * 6 - 4)))); currentColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`; }
        else if (settings.imageColorMode && element.color) currentColor = element.color;
        else currentColor = element.color || layer.color;

        codeLines.push(generateEffectLine(layer.effectType || "particles", layer.particle, currentColor, layer.alpha, layer.repeat, layer.repeatInterval, xF, zF, y, layer.targeter, layer.effectParams));

        if (modes.proximityMode && !modes.rotateMode && !modes.moveMode && !modes.localRotateMode) { const step = modeSettings.proximityMode?.step || 5; if ((elementIdx + 1) % step === 0 && (elementIdx + 1) < filtered.length) codeLines.push(`  - delay ${modeSettings.proximityMode?.delay}`); }
      });
    }
  });

  const totalLines = codeLines.length;
  codeLines.splice(3, 0, `# Total Lines: ${totalLines}`);

  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);
  codeLines.push(`#    _                _____  __`);
  codeLines.push(`#   /_\\ _  _ _ _ __ _| __\\ \\/ /`);
  codeLines.push(`#  / _ \\ || | '_/ _\` | _| >  < `);
  codeLines.push(`# /_/ \\_\\_,_|_| \\__,_|_| /_/\\_\\`);
  codeLines.push(`#`);
  codeLines.push(`# 🎉 Effect complete! Share your creation with friends!`);
  codeLines.push(`# 🔗 Create more effects: https://aurafx.online`);
  codeLines.push(`# ⭐ Join our community: ${discordInviteUrl}`);
  codeLines.push(`# ═══════════════════════════════════════════════════════════════`);

  return codeLines.join("\n");
}

//    _                _____  __
//   /_\ _  _ _ _ __ _| __\ \/ /
//  / _ \ || | '_/ _` | _| >  < 
// /_/ \_\_,_|_| \__,_|_| /_/\_\

