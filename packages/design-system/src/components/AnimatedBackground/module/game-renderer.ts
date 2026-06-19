import type { CelDotParams, CelState } from './celebration';
import {
  AMB_SCALE,
  ANOMALY_ALPHA_BASE,
  ANOMALY_VIS_THRESHOLD,
  DOT_STEP_BASE,
  DOT_STEP_SCALE,
  HALFTONE_BASE_ALPHA,
  HALFTONE_BLOOM_PEAK,
  LABEL_ALPHA_BOOST,
  LABEL_DRIFT,
  LABEL_MIN_Y,
  LABEL_OFFSET_Y,
  LABEL_SHADOW_ALPHA,
  MIN_DOT_VALUE,
  NOISE_FREQ_T,
} from './constants';
import type { RGB } from './engine-colors';
import { ALPHA_STEPS, alphaIdx } from './engine-colors';
import { sweepX } from './engine-grid';
import type { GameEngineHost, GameLogic } from './game-logic';
import {
  ANOMALY_R,
  ANOMALY_R_SQ,
  ARM_RISE,
  CANNON_BASE_OFFSET,
  CANNON_HALF_W,
  CAUGHT_DUR,
  REVEAL_DELAY,
} from './game-logic';

// render context — mutable; engine updates palettes on theme change
export interface GameRenderCtx {
  ctx: CanvasRenderingContext2D;
  dotPalette: string[];
  accentPalette: string[];
  caughtPalette: string[];
  caughtRgb: RGB;
  shadowPalette: string[];
}

/** Plugin interface for lazily-loaded celebration rendering modules. */
export interface RenderPlugins {
  CEL_CAUGHT_COL?: string;
  celDotEffect?(
    di: number,
    x: number,
    y: number,
    params: CelDotParams,
    w: number,
    h: number,
  ): { celBoost: number; celCol: string | null } | null;
  computeCelFrameParams?(cel: CelState, t: number, w: number, h: number): CelDotParams | null;
  drawCelebrationOverlay?(
    rc: GameRenderCtx,
    cel: CelState,
    t: number,
    host: GameEngineHost,
    fontLoaded: boolean,
  ): void;
  getCelCannonOffset?(cel: CelState | null, cannonAway: boolean, t: number, h: number): number;
}

// factory
export function createGameRenderer(rc: GameRenderCtx, game: GameLogic, host: GameEngineHost) {
  // Pre-allocated arrays for per-frame anomaly envelope/visibility pre-computation.
  // Avoids allocating new arrays every frame.
  let envCache: number[] = [];
  let revealedCache: boolean[] = [];
  let plugins: RenderPlugins = {};

  function drawGameDots(t: number): void {
    const { ctx, dotPalette, accentPalette, caughtPalette } = rc;
    const { w, h, dots, opts, tanTilt, exclusionBox } = host;
    const sx = sweepX(t, w, opts.sweepPeriod);
    const intensity = opts.intensity;
    const halfCap = opts.maxDotSize / 2;
    const liveAnomalies = game.anomalies;
    const aLen = liveAnomalies.length;
    const isIdle = game.gameMode === 'idle';

    // Celebration pre-pass — compute frame-level params once
    const cel = game.cel;
    let celParams: CelDotParams | null = null;
    if (cel) {
      celParams = plugins.computeCelFrameParams?.(cel, t, w, h) ?? null;
    }

    // Precompute card exclusion rect (centered on canvas).
    const exL = exclusionBox ? (w - exclusionBox.width) / 2 : 0;
    const exR = exclusionBox ? (w + exclusionBox.width) / 2 : 0;
    const exT = exclusionBox ? (h - exclusionBox.height) / 2 : 0;
    const exB = exclusionBox ? (h + exclusionBox.height) / 2 : 0;

    // Pre-compute envelope and revealed flag per anomaly once per frame,
    // saving ~120k Math.sin calls/frame when many dots x anomalies.
    if (envCache.length < aLen) {
      envCache = new Array(aLen);
      revealedCache = new Array(aLen);
    }
    for (let i = 0; i < aLen; i++) {
      const anomaly = liveAnomalies[i]!;
      if (anomaly.caught) {
        envCache[i] = 0;
        revealedCache[i] = false;
      } else {
        envCache[i] = Math.max(0, Math.sin(((t - anomaly.t0) / anomaly.life) * Math.PI));
        // In armed/over mode, revealed if ahead of sweep or past reveal delay.
        // Idle-mode visibility depends on dot position, so we mark revealed=true
        // and check per-dot below.
        revealedCache[i] = isIdle ? true : anomaly.x < sx || t - anomaly.t0 > REVEAL_DELAY;
      }
    }

    for (let di = 0; di < dots.length; di++) {
      const dot = dots[di]!;
      if (exclusionBox && dot.x >= exL && dot.x <= exR && dot.y >= exT && dot.y <= exB) continue;
      const sxAt = sx + (h / 2 - dot.y) * tanTilt;
      const amb = AMB_SCALE * (0.5 + 0.5 * Math.sin(dot.noiseSpatial + t * NOISE_FREQ_T));
      const distToSweep = Math.abs(dot.x - sxAt);
      const bloom =
        distToSweep < opts.bloomRadius
          ? HALFTONE_BLOOM_PEAK * (1 - distToSweep / opts.bloomRadius)
          : 0;

      let maxAo = 0;
      for (let i = 0; i < aLen; i++) {
        const env = envCache[i]!;
        if (env === 0) continue;
        const anomaly = liveAnomalies[i]!;
        const dx = Math.abs(dot.x - anomaly.x);
        if (dx > ANOMALY_R) continue;
        const dy = Math.abs(dot.y - anomaly.y);
        if (dy > ANOMALY_R) continue;
        const distSq = dx * dx + dy * dy;
        if (distSq > ANOMALY_R_SQ) continue;

        // In idle mode, visibility depends on dot position relative to sweep.
        if (isIdle ? dot.x >= sxAt : !revealedCache[i]) continue;

        const dist = Math.sqrt(distSq);
        const ao = env * (1 - dist / ANOMALY_R);
        if (ao > maxAo) maxAo = ao;
      }

      // Celebration per-dot effect
      let celBoost = 0;
      let celCol: string | null = null;
      if (celParams) {
        const eff = plugins.celDotEffect?.(di, dot.x, dot.y, celParams, w, h);
        if (eff) {
          celBoost = eff.celBoost;
          celCol = eff.celCol;
        }
      }

      const val = Math.min(1, Math.max(amb + bloom, maxAo));
      // Modified early-continue: also consider celBoost
      if (val < MIN_DOT_VALUE && celBoost < 0.02) continue;

      const effVal = Math.min(1, val + celBoost);
      const step = Math.round(effVal * 5);
      const half = Math.min(step * DOT_STEP_SCALE + DOT_STEP_BASE, halfCap);

      // A live red anomaly still wins the pixel
      if (maxAo > ANOMALY_VIS_THRESHOLD) {
        ctx.fillStyle = accentPalette[alphaIdx(Math.min(1, ANOMALY_ALPHA_BASE + maxAo))]!;
      } else if (celBoost > 0.02) {
        // Celebration dot — render at full strength (ignore intensity)
        const celAlpha = Math.min(1, 0.15 + effVal * 0.85);
        if (celCol === plugins.CEL_CAUGHT_COL) {
          ctx.fillStyle = caughtPalette[alphaIdx(celAlpha)]!;
        } else if (celCol) {
          // Rainbow or custom color
          ctx.globalAlpha = celAlpha;
          ctx.fillStyle = celCol;
          ctx.fillRect(dot.x - half, dot.y - half, half * 2, half * 2);
          ctx.globalAlpha = 1;
          continue;
        } else {
          ctx.fillStyle = caughtPalette[alphaIdx(celAlpha)]!;
        }
      } else {
        ctx.fillStyle =
          dotPalette[
            alphaIdx(
              (HALFTONE_BASE_ALPHA + val * (opts.bloomAlpha - HALFTONE_BASE_ALPHA)) * intensity,
            )
          ]!;
      }
      ctx.fillRect(dot.x - half, dot.y - half, half * 2, half * 2);
    }
  }

  // caught effects (green dissolve + verdict) — read-only; pruning happens in game-logic
  function drawCaughtEffects(t: number): void {
    const { ctx, caughtPalette, shadowPalette } = rc;
    const effects = game.caughtEffects;

    for (const effect of effects) {
      const age = t - effect.t0;
      if (age >= CAUGHT_DUR) continue;

      const progress = age / CAUGHT_DUR;
      const fade = 1 - progress * progress;

      for (const cell of effect.cells) {
        const alpha = Math.min(1, ANOMALY_ALPHA_BASE + cell.ao) * fade;
        const idx = alphaIdx(alpha);
        if (idx === 0) continue;
        ctx.fillStyle = caughtPalette[idx]!;
        ctx.fillRect(cell.x - cell.half, cell.y - cell.half, cell.half * 2, cell.half * 2);
      }

      if (game.fontLoaded) {
        const labelY = Math.round(
          Math.max(LABEL_MIN_Y, effect.y - LABEL_OFFSET_Y - progress * LABEL_DRIFT),
        );
        const labelX = Math.round(effect.x);
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = shadowPalette[alphaIdx(LABEL_SHADOW_ALPHA * fade)]!;
        ctx.fillText(effect.label, labelX + 1, labelY + 1);
        ctx.fillStyle = caughtPalette[alphaIdx(Math.min(1, fade * LABEL_ALPHA_BOOST))]!;
        ctx.fillText(effect.label, labelX, labelY);
      }
    }
  }

  function drawCannon(t: number): void {
    const { ctx, dotPalette } = rc;
    const cel = game.cel;
    const hasCel = cel !== null;

    // Draw cannon when armed, over, or when a celebration is active (demo idle field)
    if (game.gameMode !== 'armed' && game.gameMode !== 'over' && !hasCel) return;

    // Celebration cannon liftoff
    const liftOffset = plugins.getCelCannonOffset?.(cel, game.cannonAway, t, host.h) ?? 0;

    if (game.gameMode === 'armed' && !hasCel) {
      const riseP = Math.min(1, (t - game.armT) / ARM_RISE);
      const ease = 1 - (1 - riseP) * (1 - riseP);
      const offsetY = (1 - ease) * 40;

      ctx.save();
      ctx.globalAlpha = ease;
      ctx.translate(0, offsetY);
    }

    const baseY = host.h - CANNON_BASE_OFFSET - liftOffset;
    // Skip drawing if cannon is off-screen
    if (baseY < -40) {
      if (game.gameMode === 'armed' && !hasCel) {
        ctx.restore();
      }
      return;
    }
    const cx = Math.round(game.cannonX);

    ctx.fillStyle = dotPalette[ALPHA_STEPS]!;
    ctx.fillRect(cx - CANNON_HALF_W, baseY, CANNON_HALF_W * 2, 8);
    ctx.fillRect(cx - 6, baseY - 6, 12, 6);
    ctx.fillRect(cx - 2, baseY - 12, 4, 6);

    if (game.gameMode === 'armed' && !hasCel) {
      ctx.restore();
    }
  }

  function drawBullets(): void {
    const { ctx, dotPalette } = rc;
    ctx.fillStyle = dotPalette[ALPHA_STEPS]!;
    for (const bullet of game.bullets) {
      ctx.fillRect(bullet.x - 2, bullet.y - 7, 4, 14);
    }
  }

  function drawCelOverlay(t: number): void {
    const cel = game.cel;
    if (!cel) return;
    plugins.drawCelebrationOverlay?.(rc, cel, t, host, game.fontLoaded);
  }

  function setRenderPlugins(p: RenderPlugins) {
    plugins = p;
  }

  return {
    drawGameDots,
    drawCaughtEffects,
    drawCannon,
    drawBullets,
    drawCelOverlay,
    setRenderPlugins,
  };
}
