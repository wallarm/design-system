import type { CelState } from './celebration';
import { cannonLiftOffset, computeHeadlineY, headlineAlpha, headlineRise } from './celebration';
import type { GameEngineHost } from './game-logic';
import type { GameRenderCtx } from './game-renderer';

/* ------------------------------------------------------------------ */
/*  Overlay drawing — particles, rockets, headline                     */
/* ------------------------------------------------------------------ */

export function drawCelebrationOverlay(
  rc: GameRenderCtx,
  cel: CelState,
  t: number,
  host: GameEngineHost,
  fontLoaded: boolean,
): void {
  const { ctx } = rc;
  const { w, h, gridSp } = host;

  // Draw rockets (tier 2)
  for (const rocket of cel.rockets) {
    const re = t - rocket.t0;
    if (re < 0 || rocket.burst) continue;
    if (re >= rocket.dur) continue;
    const p = easeOut(re / rocket.dur);
    const rx = snap(rocket.sx + (rocket.tx - rocket.sx) * p, gridSp);
    const ry = snap(rocket.sy + (rocket.ty - rocket.sy) * p, gridSp);
    // 8x8 snapped slug
    ctx.fillStyle = rc.dotPalette[rc.dotPalette.length - 1]!;
    ctx.fillRect(rx - 4, ry - 4, 8, 8);
  }

  // Draw particles (grid-snapped, quarter-stepped alpha)
  for (const p of cel.particles) {
    const alpha = Math.ceil((1 - p.age / p.life) * 4) / 4;
    if (alpha <= 0) continue;
    const sx = snap(p.x, gridSp);
    const sy = snap(p.y, gridSp);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(sx - p.half, sy - p.half, p.half * 2, p.half * 2);
  }
  ctx.globalAlpha = 1;

  // Draw headline
  if (cel.headline && fontLoaded) {
    const alpha = headlineAlpha(cel, t);
    if (alpha > 0) {
      const baseY = computeHeadlineY(h, host.exclusionBox);
      const rise = headlineRise(cel, t);
      const y = baseY + rise;

      // Headline: Press Start 2P 13px, caught-green with shadow
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '13px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Shadow
      ctx.fillStyle = `rgba(0,0,0,${(0.3 * alpha).toFixed(3)})`;
      ctx.fillText(cel.headline, w / 2 + 1, y + 1);

      // Main text in caught-green
      ctx.fillStyle = rc.caughtPalette[rc.caughtPalette.length - 1]!;
      ctx.fillText(cel.headline, w / 2, y);

      // Subline: Geist Mono 11px, dot-grey at 0.85 alpha
      if (cel.subline) {
        ctx.font = '11px "Geist Mono", monospace';
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = rc.dotPalette[rc.dotPalette.length - 1]!;
        ctx.fillText(cel.subline, w / 2, y + 24);
      }

      ctx.restore();
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Cannon liftoff offset (exported for game-renderer drawCannon)      */
/* ------------------------------------------------------------------ */

export function getCelCannonOffset(
  cel: CelState | null,
  cannonAway: boolean,
  t: number,
  h: number,
): number {
  if (cannonAway) return h + 120;
  if (!cel || cel.tier < 3) return 0;
  return cannonLiftOffset(cel, t, h);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function snap(v: number, gridSp: number): number {
  if (gridSp <= 0) return v;
  return gridSp / 2 + Math.round((v - gridSp / 2) / gridSp) * gridSp;
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}
