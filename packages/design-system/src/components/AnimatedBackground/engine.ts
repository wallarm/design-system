import type { EngineOptions } from './types';

/**
 * Framework-agnostic "detection sweep" canvas engine.
 * A scan line crosses a dot grid; dots react as it passes; rare accent events
 * appear behind the sweep. Two textures share this engine, selected via `texture`.
 *
 * Performance notes:
 * - All dots use `fillRect` (no `arc`/`beginPath` overhead).
 * - Color strings are pre-computed in palettes — zero allocation in the hot loop.
 * - No `shadowBlur` — glow is faked with layered rects.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

const FALLBACK_DOT: RGB = { r: 69, g: 85, b: 108 };
const FALLBACK_ACCENT: RGB = { r: 251, g: 44, b: 54 };
const FALLBACK_BASE = '#f8fafc';

/** Number of discrete alpha levels in pre-computed palettes. */
const ALPHA_STEPS = 16;

/** Pre-compute RGBA strings for 0…ALPHA_STEPS so the hot loop never allocates. */
function buildPalette(rgb: RGB): string[] {
  const p: string[] = new Array(ALPHA_STEPS + 1);
  for (let i = 0; i <= ALPHA_STEPS; i++) {
    p[i] = `rgba(${rgb.r},${rgb.g},${rgb.b},${(i / ALPHA_STEPS).toFixed(3)})`;
  }
  return p;
}

/** Map a 0–1 alpha to the nearest palette index. */
function alphaIdx(a: number): number {
  return Math.min(ALPHA_STEPS, (a * ALPHA_STEPS + 0.5) | 0);
}

function parseColor(value: string): RGB | null {
  const v = value.trim();
  if (!v) return null;
  if (v[0] === '#') {
    let hex = v.slice(1);
    if (hex.length === 3)
      hex = hex
        .split('')
        .map(c => c + c)
        .join('');
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const m = v.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (m?.[1] && m[2] && m[3]) return { r: +m[1], g: +m[2], b: +m[3] };
  return null;
}

/* ------------------------------------------------------------------ */
/*  Grid                                                               */
/* ------------------------------------------------------------------ */

interface Dot {
  x: number;
  y: number;
}

function buildGrid(w: number, h: number, sp: number): Dot[] {
  const cap = 20_000;
  const safeSp = Math.max(sp, Math.sqrt((w * h) / cap));
  const a: Dot[] = [];
  for (let y = safeSp / 2; y < h; y += safeSp)
    for (let x = safeSp / 2; x < w; x += safeSp) a.push({ x, y });
  return a;
}

function sweepX(t: number, w: number, period: number): number {
  return ((t % period) / period) * (w + 140) - 70;
}

/* ------------------------------------------------------------------ */
/*  Engine                                                             */
/* ------------------------------------------------------------------ */

export interface SweepEngine {
  start(): void;
  stop(): void;
  setOptions(next: Partial<EngineOptions>): void;
  renderStatic(t?: number): void;
  resize(): void;
}

export function createSweepEngine(canvas: HTMLCanvasElement, options: EngineOptions): SweepEngine {
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) throw new Error('2D canvas context unavailable');
  const ctx = maybeCtx;

  let opts = { ...options };
  let w = 0;
  let h = 0;
  let dots: Dot[] = [];

  // Pre-computed color palettes (rebuilt on theme / color change).
  let baseColor = FALLBACK_BASE;
  let dotPalette = buildPalette(FALLBACK_DOT);
  let accentPalette = buildPalette(FALLBACK_ACCENT);

  // Anomaly state — shared across textures.
  let anomalyTime = -Infinity;
  let anomalyX = 0;
  let anomalyY = 0;
  // Clean-mode latched glows.
  const latched: Array<{ x: number; y: number; t0: number }> = [];
  let lastLatch = -Infinity;

  let rafId: number | null = null;
  let running = false;

  /* ---------- colours ---------- */

  function resolveColors() {
    const cs = getComputedStyle(canvas);
    const dot = parseColor(cs.getPropertyValue(opts.dotColorVar)) ?? FALLBACK_DOT;
    const accent = parseColor(cs.getPropertyValue(opts.accentColorVar)) ?? FALLBACK_ACCENT;
    baseColor = cs.getPropertyValue(opts.baseColorVar).trim() || FALLBACK_BASE;
    dotPalette = buildPalette(dot);
    accentPalette = buildPalette(accent);
  }

  /* ---------- sizing ---------- */

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = buildGrid(w, h, opts.spacing);
    resolveColors();
    if (!running) renderStatic();
  }

  /* ---------- clean texture ---------- */

  function drawClean(t: number) {
    const sx = sweepX(t, w, opts.sweepPeriod);
    const tanT = Math.tan((opts.tilt * Math.PI) / 180);
    const k = opts.intensity;

    for (const d of dots) {
      const dist = Math.abs(d.x - (sx + (h / 2 - d.y) * tanT));
      const inBloom = dist < opts.bloomRadius;
      const a = inBloom
        ? (0.13 + (opts.bloomAlpha - 0.13) * (1 - dist / opts.bloomRadius)) * k
        : 0.13 * k;
      const idx = alphaIdx(a);
      if (idx === 0) continue;
      ctx.fillStyle = dotPalette[idx]!;
      const half = inBloom ? 1.5 : 1;
      ctx.fillRect(d.x - half, d.y - half, half * 2, half * 2);
    }

    // Latch a new accent event behind the sweep.
    const sweepAt = (y: number) => sx + (h / 2 - y) * tanT;
    if (t - lastLatch > opts.anomalyInterval && Math.random() < 0.05 && dots.length) {
      const cand = dots[(Math.random() * dots.length) | 0]!;
      if (cand.x < sweepAt(cand.y) - 8) {
        lastLatch = t;
        latched.push({ x: cand.x, y: cand.y, t0: t });
      }
    }

    // Draw latched glows — layered rects instead of expensive shadowBlur.
    let kept = 0;
    for (const l of latched) {
      const age = t - l.t0;
      if (age >= 3.2) continue;
      latched[kept++] = l;
      const fade = 1 - age / 3.2;

      // Outer glow layer.
      const glowIdx = alphaIdx(0.35 * fade);
      if (glowIdx > 0) {
        ctx.fillStyle = accentPalette[glowIdx]!;
        ctx.fillRect(l.x - 5, l.y - 5, 10, 10);
      }
      // Core dot.
      ctx.fillStyle = accentPalette[alphaIdx(0.95 * fade)]!;
      ctx.fillRect(l.x - 2.4, l.y - 2.4, 4.8, 4.8);
    }
    latched.length = kept;
  }

  /* ---------- halftone texture ---------- */

  function drawHalftone(t: number) {
    const sx = sweepX(t, w, opts.sweepPeriod);
    const tanT = Math.tan((opts.tilt * Math.PI) / 180);
    const k = opts.intensity;
    const halfCap = opts.maxDotSize / 2;

    // Advance the single anomaly cluster.
    if (t - anomalyTime > opts.anomalyInterval) {
      anomalyTime = t;
      anomalyX = 30 + Math.random() * Math.max(1, w - 60);
      anomalyY = 16 + Math.random() * Math.max(1, h - 32);
    }
    const aEnv = Math.max(0, Math.sin(((t - anomalyTime) / 2.4) * Math.PI));

    for (const p of dots) {
      const sxAt = sx + (h / 2 - p.y) * tanT;
      const amb = 0.11 * (0.5 + 0.5 * Math.sin(p.x * 0.045 + p.y * 0.032 + t * 0.9));
      const d = Math.abs(p.x - sxAt);
      const bloom = d < opts.bloomRadius ? 0.62 * (1 - d / opts.bloomRadius) : 0;
      const ad = Math.hypot(p.x - anomalyX, p.y - anomalyY);
      const ao = ad < 42 && p.x < sxAt ? aEnv * (1 - ad / 42) : 0;
      const val = Math.min(1, Math.max(amb + bloom, ao));
      if (val < 0.05) continue;

      const step = Math.round(val * 5);
      const half = Math.min(step * 1.05 + 0.5, halfCap);

      if (ao > 0.06) {
        ctx.fillStyle = accentPalette[alphaIdx(Math.min(1, 0.45 + ao))]!;
      } else {
        ctx.fillStyle = dotPalette[alphaIdx((0.12 + val * (opts.bloomAlpha - 0.12)) * k)]!;
      }
      ctx.fillRect(p.x - half, p.y - half, half * 2, half * 2);
    }
  }

  /* ---------- frame / loop ---------- */

  function frame(t: number) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);
    if (opts.texture === 'halftone') drawHalftone(t);
    else drawClean(t);
  }

  function tick(ts: number) {
    if (!running) return;
    frame(ts / 1000);
    rafId = requestAnimationFrame(tick);
  }

  function onVisibility() {
    if (document.hidden) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (running && rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function start() {
    if (running) return;
    running = true;
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    document.removeEventListener('visibilitychange', onVisibility);
  }

  function renderStatic(t = 1.4) {
    frame(t);
  }

  function setOptions(next: Partial<EngineOptions>) {
    const spacingChanged = next.spacing !== undefined && next.spacing !== opts.spacing;
    opts = { ...opts, ...next };
    if (spacingChanged) dots = buildGrid(w, h, opts.spacing);
    resolveColors();
    if (!running) renderStatic();
  }

  resize();
  return { start, stop, setOptions, renderStatic, resize };
}
