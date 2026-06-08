import {
  CLEAN_BASE_ALPHA,
  CLEAN_DOT_HALF_BASE,
  CLEAN_DOT_HALF_BLOOM,
  GLOW_INNER_ALPHA,
  GLOW_INNER_HALF,
  GLOW_LIFETIME,
  GLOW_OUTER_ALPHA,
  GLOW_OUTER_HALF,
  SPAWN_PROBABILITY,
  SWEEP_OFFSET_GUARD,
} from './constants';
import {
  alphaIdx,
  buildPalette,
  FALLBACK_ACCENT,
  FALLBACK_BASE,
  FALLBACK_CAUGHT,
  FALLBACK_DOT,
  parseColor,
} from './engine-colors';
import { buildGrid, sweepX } from './engine-grid';
import type { GameEngineHost } from './game-logic';
import { CANNON_HALF_W, createGameLogic } from './game-logic';
import type { GameRenderCtx } from './game-renderer';
import { createGameRenderer } from './game-renderer';
import type { EngineOptions, GameStats } from './types';

/**
 * Framework-agnostic "detection sweep" canvas engine.
 * A scan line crosses a dot grid; dots react as it passes; rare accent events
 * appear behind the sweep. Two textures share this engine, selected via `texture`.
 *
 * Performance notes:
 * - All dots use `fillRect` (no `arc`/`beginPath` overhead).
 * - Color strings are pre-computed in palettes — zero allocation in the hot loop.
 * - No `shadowBlur` — glow is faked with layered rects.
 * - Game sim folds into the existing frame() behind mode guards.
 * - Bounded pools (MAX_TARGETS, MAX_BULLETS). No per-frame allocation.
 */

/* ------------------------------------------------------------------ */
/*  Engine                                                             */
/* ------------------------------------------------------------------ */

export interface SweepEngine {
  start(): void;
  stop(): void;
  setOptions(next: Partial<EngineOptions>): void;
  renderStatic(t?: number): void;
  resize(): void;

  // Game
  setGameActive(active: boolean): void;
  catchAt(x: number, y: number): boolean;
  setMode(mode: 'idle' | 'armed'): void;
  startRound(): void;
  exitGame(): void;
  setCannonDir(dir: number): void;
  setFiring(on: boolean): void;
  onStats(cb: (s: GameStats) => void): void;
  setExclusion(box: { width: number; height: number } | null): void;
}

export function createSweepEngine(canvas: HTMLCanvasElement, options: EngineOptions): SweepEngine {
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) throw new Error('2D canvas context unavailable');
  const ctx = maybeCtx;

  let opts = { ...options };

  // Mutable host object — game logic reads current w/h/dots/opts from here.
  const host: GameEngineHost = {
    w: 0,
    h: 0,
    dots: [],
    opts,
    tanTilt: Math.tan((options.tilt * Math.PI) / 180),
    exclusionBox: null,
  };
  const game = createGameLogic(host);

  // Render context — shared mutable object; palettes updated by resolveColors().
  const rc: GameRenderCtx = {
    ctx,
    dotPalette: buildPalette(FALLBACK_DOT),
    accentPalette: buildPalette(FALLBACK_ACCENT),
    caughtPalette: buildPalette(FALLBACK_CAUGHT),
    caughtRgb: FALLBACK_CAUGHT,
    shadowPalette: buildPalette({ r: 0, g: 0, b: 0 }),
  };
  const gr = createGameRenderer(rc, game, host);

  let baseColor = FALLBACK_BASE;

  // Clean-mode latched glows.
  const latched: Array<{ x: number; y: number; t0: number }> = [];
  let lastLatch = -Infinity;

  let rafId: number | null = null;
  let running = false;
  let lastFrameT = 0;

  // colours

  function resolveColors() {
    const cs = getComputedStyle(canvas);
    const dot = parseColor(cs.getPropertyValue(opts.dotColorVar)) ?? FALLBACK_DOT;
    const accent = parseColor(cs.getPropertyValue(opts.accentColorVar)) ?? FALLBACK_ACCENT;
    const caught = parseColor(cs.getPropertyValue(opts.caughtColorVar)) ?? FALLBACK_CAUGHT;
    baseColor = cs.getPropertyValue(opts.baseColorVar).trim() || FALLBACK_BASE;
    rc.dotPalette = buildPalette(dot);
    rc.accentPalette = buildPalette(accent);
    rc.caughtPalette = buildPalette(caught);
    rc.caughtRgb = caught;
  }

  // sizing
  function resize() {
    const rect = canvas.getBoundingClientRect();
    host.w = Math.max(1, Math.round(rect.width));
    host.h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(host.w * dpr);
    canvas.height = Math.round(host.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    host.dots = buildGrid(host.w, host.h, opts.spacing);
    host.tanTilt = Math.tan((opts.tilt * Math.PI) / 180);
    resolveColors();
    game.cannonX = Math.max(CANNON_HALF_W, Math.min(host.w - CANNON_HALF_W, game.cannonX));
    if (!running) renderStatic();
  }

  /* ---------- clean texture ---------- */

  function drawClean(t: number) {
    const { w, h, dots, tanTilt, exclusionBox } = host;
    const sx = sweepX(t, w, opts.sweepPeriod);
    const intensity = opts.intensity;

    // Precompute card exclusion rect (centered on canvas).
    const exL = exclusionBox ? (w - exclusionBox.width) / 2 : 0;
    const exR = exclusionBox ? (w + exclusionBox.width) / 2 : 0;
    const exT = exclusionBox ? (h - exclusionBox.height) / 2 : 0;
    const exB = exclusionBox ? (h + exclusionBox.height) / 2 : 0;

    for (const dot of dots) {
      if (exclusionBox && dot.x >= exL && dot.x <= exR && dot.y >= exT && dot.y <= exB) continue;
      const dist = Math.abs(dot.x - (sx + (h / 2 - dot.y) * tanTilt));
      const inBloom = dist < opts.bloomRadius;
      const alpha = inBloom
        ? (CLEAN_BASE_ALPHA +
            (opts.bloomAlpha - CLEAN_BASE_ALPHA) * (1 - dist / opts.bloomRadius)) *
          intensity
        : CLEAN_BASE_ALPHA * intensity;
      const idx = alphaIdx(alpha);
      if (idx === 0) continue;
      ctx.fillStyle = rc.dotPalette[idx]!;
      const half = inBloom ? CLEAN_DOT_HALF_BLOOM : CLEAN_DOT_HALF_BASE;
      ctx.fillRect(dot.x - half, dot.y - half, half * 2, half * 2);
    }

    // Latch a new accent event behind the sweep.
    const sweepAt = (y: number) => sx + (h / 2 - y) * tanTilt;
    if (t - lastLatch > opts.anomalyInterval && Math.random() < SPAWN_PROBABILITY && dots.length) {
      const cand = dots[(Math.random() * dots.length) | 0]!;
      if (exclusionBox && cand.x >= exL && cand.x <= exR && cand.y >= exT && cand.y <= exB) {
        // skip — candidate is under the card
      } else if (cand.x < sweepAt(cand.y) - SWEEP_OFFSET_GUARD) {
        lastLatch = t;
        latched.push({ x: cand.x, y: cand.y, t0: t });
      }
    }

    // Draw latched glows — layered rects instead of expensive shadowBlur.
    let kept = 0;
    for (const glow of latched) {
      const age = t - glow.t0;
      if (age >= GLOW_LIFETIME) continue;
      latched[kept++] = glow;
      const fade = 1 - age / GLOW_LIFETIME;

      const glowIdx = alphaIdx(GLOW_OUTER_ALPHA * fade);
      if (glowIdx > 0) {
        ctx.fillStyle = rc.accentPalette[glowIdx]!;
        ctx.fillRect(
          glow.x - GLOW_OUTER_HALF,
          glow.y - GLOW_OUTER_HALF,
          GLOW_OUTER_HALF * 2,
          GLOW_OUTER_HALF * 2,
        );
      }
      ctx.fillStyle = rc.accentPalette[alphaIdx(GLOW_INNER_ALPHA * fade)]!;
      ctx.fillRect(
        glow.x - GLOW_INNER_HALF,
        glow.y - GLOW_INNER_HALF,
        GLOW_INNER_HALF * 2,
        GLOW_INNER_HALF * 2,
      );
    }
    latched.length = kept;
  }

  function drawHalftone(t: number) {
    gr.drawGameDots(t);
  }

  function frame(t: number) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, host.w, host.h);
    if (opts.texture === 'halftone') {
      drawHalftone(t);
      gr.drawCaughtEffects(t);
      gr.drawCannon(t);
      gr.drawBullets();
    } else {
      drawClean(t);
    }
  }

  const DT_CLAMP = 0.05;

  function tick(ts: number) {
    if (!running) return;
    const now = ts / 1000;

    const rawDt = lastFrameT > 0 ? now - lastFrameT : 0;
    const dt = Math.min(rawDt, DT_CLAMP);

    if (rawDt > DT_CLAMP) {
      const skip = rawDt - dt;
      game.adjustTimeMarkers(skip);
      for (const glow of latched) glow.t0 += skip;
      if (lastLatch > -Infinity) lastLatch += skip;
    }

    lastFrameT = now;

    if (opts.texture === 'halftone') {
      game.gameSim(now, dt);
    }

    game.pruneCaughtEffects(now);
    frame(now);
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
    lastFrameT = 0;
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    document.removeEventListener('visibilitychange', onVisibility);
    game.setFiring(false);
    game.setCannonDir(0);
  }

  function renderStatic(t = 1.4) {
    const savedT = lastFrameT;
    frame(t);
    lastFrameT = savedT;
  }

  function setOptions(next: Partial<EngineOptions>) {
    const keys = Object.keys(next);
    if (keys.length === 0) {
      // Theme-change path — only need to re-resolve CSS custom properties.
      resolveColors();
      if (!running) renderStatic();
      return;
    }
    const spacingChanged = next.spacing !== undefined && next.spacing !== opts.spacing;
    opts = { ...opts, ...next };
    host.opts = opts;
    host.tanTilt = Math.tan((opts.tilt * Math.PI) / 180);
    if (spacingChanged) host.dots = buildGrid(host.w, host.h, opts.spacing);
    resolveColors();
    if (!running) renderStatic();
  }

  function exitGame() {
    game.exitGame();
  }

  resize();
  return {
    start,
    stop,
    setOptions,
    renderStatic,
    resize,
    setGameActive: (active: boolean) => game.setGameActive(active),
    catchAt: (x: number, y: number) => game.catchAt(x, y, running),
    setMode: (mode: 'idle' | 'armed') => game.setMode(mode),
    startRound: () => {
      game.startRound();
      lastFrameT = performance.now() / 1000;
    },
    exitGame,
    setCannonDir: (dir: number) => game.setCannonDir(dir),
    setFiring: (on: boolean) => game.setFiring(on),
    onStats: (cb: (s: GameStats) => void) => game.onStats(cb),
    setExclusion: (box: { width: number; height: number } | null) => game.setExclusion(box),
  };
}
