import type { GameEngineHost } from './game-logic';
import { SPAWN_EDGE } from './game-logic';
import { clamp01, easeIn, easeOut } from './math';

/* ------------------------------------------------------------------ */
/*  Tunables                                                           */
/* ------------------------------------------------------------------ */

export const CEL_DUR = [0, 2.6, 3.8, 4.0, 5.2] as const;
export const CEL_MAX_PARTICLES = 900;

// Sweep-printed score timing
const CEL_SWEEP_START = 1.6;
const CEL_SWEEP_DUR = 1.2;

// Field effect timing
const CEL_WAVE_DUR = 2.4;
const CEL_WAVE_RISE = 1.5;
const CEL_WAVE_FADE_AT = 1.4;
const CEL_WAVE_SIGMA_SQ2 = 4608; // 2 * 48^2
const CEL_WAVE_STRENGTH = 0.95;

const CEL_BLAST_WAVE_DUR = 1.6;
const CEL_BLAST_WAVE_RISE = 0.9;
const CEL_BLAST_WAVE_FADE_AT = 0.8;
const CEL_BLAST_WAVE_SIGMA_SQ2 = 5408; // 2 * 52^2
const CEL_BLAST_WAVE_STRENGTH = 0.9;

const CEL_BURST_DUR = 0.6;
const CEL_BURST_RADIUS = 70;
const CEL_BURST_SIGMA_SQ2 = 1152; // 2 * 24^2
const CEL_BURST_STRENGTH = 0.9;

// Liftoff
export const CEL_LIFT_AT = 0.5;
export const CEL_LIFT_DUR = 1.2;
const CEL_CANNON_AWAY_AT = 1.7;

// Headline timing per tier
const CEL_LABEL_AT = [0, 0.7, 2.8, 2.4, 2.6] as const;
const CEL_LABEL_RISE_DUR = 0.5;

// Rainbow
const CEL_RAINBOW_START = 3.0;
const CEL_RAINBOW_END = 4.6;

// Rain
const CEL_RAIN_START = 2.0;
const CEL_RAIN_END = 4.6;
const CEL_RAIN_RATE = 360;

/* ------------------------------------------------------------------ */
/*  5x7 dot-matrix glyphs (MSB = leftmost column)                     */
/* ------------------------------------------------------------------ */

// Each glyph is 5 columns x 7 rows. Stored as 7 numbers (one per row),
// each number has 5 bits (bit 4 = col 0, bit 0 = col 4).
const CEL_GLYPHS: Record<string, number[]> = {
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  '3': [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  '%': [0b11001, 0b11010, 0b00100, 0b00100, 0b00100, 0b01011, 0b10011],
};

/* ------------------------------------------------------------------ */
/*  7-color retro palette (hardcoded RGB — NOT design tokens)          */
/* ------------------------------------------------------------------ */

export const CEL_PAL = [
  'rgb(255,60,60)', // red
  'rgb(255,180,40)', // amber
  'rgb(60,220,80)', // green
  'rgb(60,200,220)', // cyan
  'rgb(80,100,255)', // blue
  'rgb(180,80,220)', // purple
  'rgb(255,100,180)', // pink
] as const;

/** Sentinel value for celDotEffect — means "use caught-green palette". */
export const CEL_CAUGHT_COL = '__caught__' as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  half: number;
  color: string;
  conf: boolean; // confetti (no drag/gravity)
  drag: number;
  gravity: number;
}

export interface CelRocket {
  t0: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  dur: number;
  burst: boolean; // has it burst?
}

export interface CelPulse {
  t0: number;
  x: number;
  y: number;
  dur: number;
}

export interface CelState {
  t0: number;
  tier: number;
  score: number;
  settled: boolean;
  particles: CelParticle[];
  rockets: CelRocket[];
  pulses: CelPulse[];
  headline: string;
  subline: string;
  scoreCells: Map<number, true>;
  scoreColCount: number;
  liftStarted: boolean;
  // Confetti scheduling state
  confettiSpawned2: number; // tier 2 confetti count
  confettiVolley1: boolean; // tier 3 volley 1 done
  confettiVolley2: boolean; // tier 3 volley 2 done
  burstSpawned: boolean; // tier 4 opening burst
  rainAccum: number; // tier 4 rain accumulator
}

/* ------------------------------------------------------------------ */
/*  Tier calculation                                                   */
/* ------------------------------------------------------------------ */

export function tierForScore(score: number): number {
  if (score < 20) return 0;
  if (score < 35) return 1;
  if (score < 90) return 2;
  if (score < 100) return 3;
  return 4;
}

/* ------------------------------------------------------------------ */
/*  Build score cells — maps "XX%" onto the dot grid                   */
/* ------------------------------------------------------------------ */

export function buildScoreCells(
  score: number,
  gridCols: number,
  gridSp: number,
  w: number,
  h: number,
  exclusionBox: { width: number; height: number } | null,
): { cells: Map<number, true>; colCount: number } {
  const str = `${Math.round(score)}%`;
  const glyphW = 5;
  const glyphH = 7;
  const gap = 1;

  // Total columns/rows for the block
  const totalCols = str.length * (glyphW + gap) - gap;
  const totalRows = glyphH;
  const blockW = totalCols * gridSp;
  const blockH = totalRows * gridSp;

  // Total rows in grid
  const totalGridRows = gridCols > 0 ? Math.ceil(h / gridSp) : 0;

  if (gridCols === 0 || totalGridRows < glyphH) {
    return { cells: new Map(), colCount: totalCols };
  }

  // Placement ladder
  let startCol: number;
  let startRow: number;

  if (exclusionBox) {
    const cardTop = (h - exclusionBox.height) / 2;
    const cardLeft = (w - exclusionBox.width) / 2;

    // 1. Strip above the centered card
    if (cardTop >= blockH + 8) {
      const stripCenterY = cardTop / 2;
      startRow = Math.max(0, Math.round((stripCenterY - blockH / 2) / gridSp));
      startCol = Math.max(0, Math.round((w / 2 - blockW / 2) / gridSp));
      // 2. Left gutter
    } else if (cardLeft >= blockW + 32) {
      const gutterCenterX = cardLeft / 2;
      startCol = Math.max(0, Math.round((gutterCenterX - blockW / 2) / gridSp));
      startRow = Math.max(0, Math.round((h / 2 - blockH / 2) / gridSp));
      // 3. Skip the print
    } else {
      return { cells: new Map(), colCount: totalCols };
    }
  } else {
    // No exclusion box — centered, near top
    const topY = Math.max(gridSp, 0.16 * h);
    startRow = Math.max(0, Math.round(topY / gridSp));
    startCol = Math.max(0, Math.round((w / 2 - blockW / 2) / gridSp));
  }

  // Clamp
  if (startCol + totalCols > gridCols) startCol = Math.max(0, gridCols - totalCols);
  if (startRow + totalRows > totalGridRows) startRow = Math.max(0, totalGridRows - totalRows);

  const cells = new Map<number, true>();

  let colOffset = 0;
  for (const ch of str) {
    const glyph = CEL_GLYPHS[ch];
    if (!glyph) {
      colOffset += glyphW + gap;
      continue;
    }
    for (let row = 0; row < glyphH; row++) {
      const bits = glyph[row]!;
      for (let gc = 0; gc < glyphW; gc++) {
        if (bits & (1 << (glyphW - 1 - gc))) {
          const c = startCol + colOffset + gc;
          const r = startRow + row;
          if (c >= 0 && c < gridCols && r >= 0) {
            const idx = r * gridCols + c;
            cells.set(idx, true);
          }
        }
      }
    }
    colOffset += glyphW + gap;
  }

  return { cells, colCount: totalCols };
}

/* ------------------------------------------------------------------ */
/*  Confetti spawner                                                   */
/* ------------------------------------------------------------------ */

function spawnConfetti(particles: CelParticle[], count: number, w: number, spread: number): void {
  for (let i = 0; i < count; i++) {
    if (particles.length >= CEL_MAX_PARTICLES) break;
    particles.push({
      x: Math.random() * w,
      y: -8 - Math.random() * spread,
      vx: (Math.random() - 0.5) * 30,
      vy: 110 + Math.random() * 130,
      age: 0,
      life: 7,
      half: 4,
      color: CEL_PAL[(Math.random() * CEL_PAL.length) | 0]!,
      conf: true,
      drag: 0,
      gravity: 0,
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Firework burst spawner                                             */
/* ------------------------------------------------------------------ */

function spawnBurst(
  particles: CelParticle[],
  x: number,
  y: number,
  count: number,
  caughtColor: string,
  dotColor: string,
): void {
  for (let i = 0; i < count; i++) {
    if (particles.length >= CEL_MAX_PARTICLES) break;
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 120;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: 0.9 + Math.random() * 0.4,
      half: 4,
      color: Math.random() < 0.7 ? caughtColor : dotColor,
      conf: false,
      drag: 2.5,
      gravity: 30,
    });
  }
}

/* ------------------------------------------------------------------ */
/*  startCelebration                                                   */
/* ------------------------------------------------------------------ */

export function startCelebration(score: number, t: number, host: GameEngineHost): CelState | null {
  const tier = tierForScore(score);
  if (tier === 0) return null;

  const { gridCols, gridSp } = host;
  const { cells, colCount } = buildScoreCells(
    score,
    gridCols,
    gridSp,
    host.w,
    host.h,
    host.exclusionBox,
  );

  const headlines: Record<number, string> = {
    1: 'THREAT CONTAINED',
    2: 'PERIMETER HELD',
    3: 'ZERO BREACH',
    4: 'AIRTIGHT \u2014 100%',
  };
  const sublines: Record<number, string> = {
    1: 'well done \u2014 share it with your mates',
    2: 'you nailed it',
    3: 'you rock \u2014 worth a screenshot',
    4: 'flawless \u00B7 the field salutes you',
  };

  const cel: CelState = {
    t0: t,
    tier,
    score,
    settled: false,
    particles: [],
    rockets: [],
    pulses: [],
    headline: headlines[tier] ?? '',
    subline: sublines[tier] ?? '',
    scoreCells: cells,
    scoreColCount: colCount,
    liftStarted: false,
    confettiSpawned2: 0,
    confettiVolley1: false,
    confettiVolley2: false,
    burstSpawned: false,
    rainAccum: 0,
  };

  // Tier 2: schedule 3 rockets
  if (tier === 2) {
    const cannonX = host.w / 2;
    const cannonY = host.h - 40;
    const targets = computeRocketTargets(host);
    for (let i = 0; i < 3 && i < targets.length; i++) {
      cel.rockets.push({
        t0: t + i * 0.4,
        sx: cannonX,
        sy: cannonY,
        tx: targets[i]!.x,
        ty: targets[i]!.y,
        dur: 0.6,
        burst: false,
      });
    }
  }

  return cel;
}

/* ------------------------------------------------------------------ */
/*  Rocket target positions                                            */
/* ------------------------------------------------------------------ */

function computeRocketTargets(host: GameEngineHost): Array<{ x: number; y: number }> {
  const { w, h, exclusionBox } = host;
  const targets: Array<{ x: number; y: number }> = [];
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  if (exclusionBox) {
    const cardLeft = (w - exclusionBox.width) / 2;
    const cardRight = (w + exclusionBox.width) / 2;
    const cardTop = (h - exclusionBox.height) / 2;

    // Left gutter center
    targets.push({
      x: clamp(cardLeft / 2, SPAWN_EDGE, w - SPAWN_EDGE),
      y: 0.42 * h,
    });
    // Right gutter center
    targets.push({
      x: clamp((cardRight + w) / 2, SPAWN_EDGE, w - SPAWN_EDGE),
      y: 0.42 * h,
    });
    // Top strip
    targets.push({
      x: w / 2,
      y: Math.max(40, cardTop * 0.45),
    });
  } else {
    targets.push({ x: w * 0.2, y: 0.3 * h });
    targets.push({ x: w * 0.8, y: 0.3 * h });
    targets.push({ x: w * 0.5, y: 0.15 * h });
  }
  return targets;
}

/* ------------------------------------------------------------------ */
/*  stepCelebration                                                    */
/* ------------------------------------------------------------------ */

export function stepCelebration(
  cel: CelState,
  t: number,
  dt: number,
  host: GameEngineHost,
  caughtColor: string,
  dotColor: string,
): void {
  const elapsed = t - cel.t0;
  const { tier, particles, rockets } = cel;
  const { w, h } = host;

  // Advance particles
  let kept = 0;
  for (const p of particles) {
    p.age += dt;
    if (p.age >= p.life) continue;
    if (p.conf) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    } else {
      const dragFactor = Math.exp(-p.drag * dt);
      p.vx *= dragFactor;
      p.vy *= dragFactor;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    // Cull off-screen confetti
    if (p.y > h + 12 || p.x < -20 || p.x > w + 20) continue;
    particles[kept++] = p;
  }
  particles.length = kept;

  // Tier 2: confetti + rocket logic
  if (tier === 2) {
    const confettiTarget = cel.score >= 60 ? 56 : 32;
    if (elapsed > 1.0 && cel.confettiSpawned2 < confettiTarget) {
      const batch = Math.min(confettiTarget - cel.confettiSpawned2, confettiTarget);
      spawnConfetti(particles, batch, w, 40);
      cel.confettiSpawned2 += batch;
    }

    // Check rockets for burst
    for (const rocket of rockets) {
      if (rocket.burst) continue;
      const re = t - rocket.t0;
      if (re >= rocket.dur) {
        rocket.burst = true;
        spawnBurst(particles, rocket.tx, rocket.ty, 16, caughtColor, dotColor);
        cel.pulses.push({
          t0: t,
          x: rocket.tx,
          y: rocket.ty,
          dur: CEL_BURST_DUR,
        });
      }
    }
  }

  // Tier 3: two confetti volleys
  if (tier === 3) {
    if (elapsed > 1.7 && !cel.confettiVolley1) {
      cel.confettiVolley1 = true;
      spawnConfetti(particles, 60, w, 60);
    }
    if (elapsed > 2.6 && !cel.confettiVolley2) {
      cel.confettiVolley2 = true;
      spawnConfetti(particles, 40, w, 40);
    }
  }

  // Tier 4: opening burst + confetti rain + volleys
  if (tier === 4) {
    if (elapsed > 0.8 && !cel.burstSpawned) {
      cel.burstSpawned = true;
      spawnConfetti(particles, 80, w, 80);
    }
    // Rain
    if (elapsed >= CEL_RAIN_START && elapsed < CEL_RAIN_END) {
      cel.rainAccum += CEL_RAIN_RATE * dt;
      const toSpawn = Math.floor(cel.rainAccum);
      if (toSpawn > 0) {
        cel.rainAccum -= toSpawn;
        spawnConfetti(particles, toSpawn, w, 20);
      }
    }
  }

  // Tiers 3-4: thruster exhaust while lifting
  if (tier >= 3 && !cel.settled) {
    const liftE = elapsed - CEL_LIFT_AT;
    if (liftE > 0 && liftE < CEL_LIFT_DUR) {
      const rise = easeIn(clamp01(liftE / CEL_LIFT_DUR));
      const cannonX = host.w / 2;
      const baseY = h - 22 - rise * (h + 120);
      for (let i = 0; i < 3; i++) {
        if (particles.length >= CEL_MAX_PARTICLES) break;
        particles.push({
          x: cannonX + (Math.random() - 0.5) * 10,
          y: baseY,
          vx: (Math.random() - 0.5) * 20,
          vy: 80 + Math.random() * 80,
          age: 0,
          life: 0.45,
          half: 3,
          color: Math.random() < 0.5 ? caughtColor : dotColor,
          conf: false,
          drag: 0,
          gravity: 0,
        });
      }
    }
  }

  // Prune expired pulses
  let pKept = 0;
  for (const pulse of cel.pulses) {
    if (t - pulse.t0 < pulse.dur) {
      cel.pulses[pKept++] = pulse;
    }
  }
  cel.pulses.length = pKept;

  // Rocket trail particles
  for (const rocket of rockets) {
    if (rocket.burst) continue;
    const re = t - rocket.t0;
    if (re < 0 || re >= rocket.dur) continue;
    const p = easeOut(re / rocket.dur);
    const rx = rocket.sx + (rocket.tx - rocket.sx) * p;
    const ry = rocket.sy + (rocket.ty - rocket.sy) * p;
    if (particles.length < CEL_MAX_PARTICLES) {
      particles.push({
        x: rx,
        y: ry,
        vx: (Math.random() - 0.5) * 8,
        vy: 20 + Math.random() * 20,
        age: 0,
        life: 0.3,
        half: 3,
        color: dotColor,
        conf: false,
        drag: 0,
        gravity: 0,
      });
    }
  }

  // Cannon liftoff flag
  if (tier >= 3 && elapsed > CEL_CANNON_AWAY_AT) {
    cel.liftStarted = true;
  }

  // Check settled
  const dur = CEL_DUR[tier] ?? 0;
  if (!cel.settled && elapsed >= dur) {
    cel.settled = true;
  }
}

/* ------------------------------------------------------------------ */
/*  Time-skip adjustment for celebration state                         */
/* ------------------------------------------------------------------ */

export function adjustCelebrationTimeMarkers(cel: CelState, skip: number): void {
  cel.t0 += skip;
  for (const rocket of cel.rockets) rocket.t0 += skip;
  for (const pulse of cel.pulses) pulse.t0 += skip;
}

/* ------------------------------------------------------------------ */
/*  Field effect computation (per-dot, called from renderer)           */
/* ------------------------------------------------------------------ */

export interface CelDotParams {
  // Pre-computed per frame
  elapsed: number;
  tier: number;
  waveRadius: number;
  waveStrength: number;
  waveOriginX: number;
  waveOriginY: number;
  waveSigmaSq2: number;
  blastRadius: number;
  blastStrength: number;
  blastOriginX: number;
  blastOriginY: number;
  blastSigmaSq2: number;
  sweepX: number; // ceremonial sweep x position
  sweepActive: boolean;
  rainbowQ: number;
  rainbowActive: boolean;
  t: number;
  cel: CelState;
}

export function computeCelFrameParams(
  cel: CelState,
  t: number,
  w: number,
  h: number,
): CelDotParams {
  const elapsed = t - cel.t0;
  const tier = cel.tier;
  const diag = Math.hypot(w / 2, h);

  // All-clear wave (tier 1)
  let waveRadius = 0;
  let waveStrength = 0;
  const waveOriginX = w / 2;
  const waveOriginY = h - 30;
  if (tier === 1 && elapsed < CEL_WAVE_DUR) {
    waveRadius = easeOut(clamp01(elapsed / CEL_WAVE_RISE)) * diag * 0.9;
    waveStrength = CEL_WAVE_STRENGTH * (1 - clamp01((elapsed - CEL_WAVE_FADE_AT) / 1));
  }

  // Blast-off wave (tier 3-4)
  let blastRadius = 0;
  let blastStrength = 0;
  const blastOriginX = w / 2;
  const blastOriginY = h - 30;
  if (tier >= 3 && elapsed < CEL_BLAST_WAVE_DUR) {
    blastRadius = easeOut(clamp01(elapsed / CEL_BLAST_WAVE_RISE)) * diag;
    blastStrength =
      CEL_BLAST_WAVE_STRENGTH * (1 - clamp01((elapsed - CEL_BLAST_WAVE_FADE_AT) / 0.8));
  }

  // Sweep column position
  const sweepStart = cel.t0 + CEL_SWEEP_START;
  const sweepEnd = sweepStart + CEL_SWEEP_DUR;
  const sweepActive = tier >= 2 && t >= sweepStart && t <= sweepEnd + 0.5;
  let sweepXPos = -9999;
  if (sweepActive && cel.scoreColCount > 0) {
    const sweepProgress = clamp01((t - sweepStart) / CEL_SWEEP_DUR);
    sweepXPos = sweepProgress * cel.scoreColCount;
  }

  // Rainbow wave (tier 4)
  const rainbowActive = tier === 4 && elapsed >= CEL_RAINBOW_START && elapsed < CEL_RAINBOW_END;
  let rainbowQ = 0;
  if (rainbowActive) {
    rainbowQ =
      Math.sin(((elapsed - CEL_RAINBOW_START) / (CEL_RAINBOW_END - CEL_RAINBOW_START)) * Math.PI) *
      0.5;
  }

  return {
    elapsed,
    tier,
    waveRadius,
    waveStrength,
    waveOriginX,
    waveOriginY,
    waveSigmaSq2: CEL_WAVE_SIGMA_SQ2,
    blastRadius,
    blastStrength,
    blastOriginX,
    blastOriginY,
    blastSigmaSq2: CEL_BLAST_WAVE_SIGMA_SQ2,
    sweepX: sweepXPos,
    sweepActive,
    rainbowQ,
    rainbowActive,
    t,
    cel,
  };
}

/**
 * Per-dot celebration effect — returns boost/color modifiers or null.
 * Called inside the hot dot loop only when cel !== null.
 */
export function celDotEffect(
  dotIndex: number,
  dotX: number,
  dotY: number,
  p: CelDotParams,
  w: number,
  h: number,
): { celBoost: number; celCol: string | null } | null {
  let boost = 0;
  let col: string | null = null;

  // Score digit dot — force caught-green at full
  const isDigit = p.cel.scoreCells.has(dotIndex);
  if (isDigit) {
    // Reveal timing: column-based
    const scoreColCount = p.cel.scoreColCount;
    if (scoreColCount > 0) {
      const sweepStart = p.cel.t0 + CEL_SWEEP_START;
      const elapsed = p.t - sweepStart;
      if (elapsed >= 0) {
        const revealProgress = clamp01(elapsed / CEL_SWEEP_DUR);
        if (revealProgress > 0) {
          boost = 1;
          col = CEL_CAUGHT_COL;
        }
      }
    }
  }

  // All-clear wave (tier 1)
  if (p.waveStrength > 0) {
    const dx = dotX - p.waveOriginX;
    const dy = dotY - p.waveOriginY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dd = dist - p.waveRadius;
    const gauss = Math.exp(-(dd * dd) / p.waveSigmaSq2);
    const waveVal = gauss * p.waveStrength;
    if (waveVal > boost) {
      boost = waveVal;
      if (!isDigit) col = CEL_CAUGHT_COL;
    }
  }

  // Blast-off wave (tier 3-4)
  if (p.blastStrength > 0) {
    const dx = dotX - p.blastOriginX;
    const dy = dotY - p.blastOriginY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dd = dist - p.blastRadius;
    const gauss = Math.exp(-(dd * dd) / p.blastSigmaSq2);
    const waveVal = gauss * p.blastStrength;
    if (waveVal > boost) {
      boost = waveVal;
      if (!isDigit) col = CEL_CAUGHT_COL;
    }
  }

  // Burst pulses (tier 2)
  for (const pulse of p.cel.pulses) {
    const pe = p.t - pulse.t0;
    if (pe < 0 || pe >= pulse.dur) continue;
    const dx = dotX - pulse.x;
    const dy = dotY - pulse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pRadius = easeOut(pe / pulse.dur) * CEL_BURST_RADIUS;
    const dd = dist - pRadius;
    const gauss = Math.exp(-(dd * dd) / CEL_BURST_SIGMA_SQ2);
    const pulseVal = gauss * CEL_BURST_STRENGTH * (1 - pe / pulse.dur);
    if (pulseVal > boost) {
      boost = pulseVal;
      if (!isDigit) col = CEL_CAUGHT_COL;
    }
  }

  // Rainbow wave (tier 4)
  if (p.rainbowActive && p.rainbowQ > 0) {
    const palIdx = Math.floor(dotX * 0.03 + dotY * 0.02 + p.elapsed * 3) % CEL_PAL.length;
    const idx = palIdx < 0 ? palIdx + CEL_PAL.length : palIdx;
    const rainbowBoost = p.rainbowQ;
    if (rainbowBoost > boost || (rainbowBoost > 0.05 && !isDigit)) {
      boost = Math.max(boost, rainbowBoost);
      if (!isDigit) col = CEL_PAL[idx]!;
    }
  }

  if (boost < 0.02 && !isDigit) return null;
  return { celBoost: boost, celCol: col };
}

/* ------------------------------------------------------------------ */
/*  Headline geometry                                                  */
/* ------------------------------------------------------------------ */

export function computeHeadlineY(
  h: number,
  exclusionBox: { width: number; height: number } | null,
): number {
  const cannonClear = 72;
  if (exclusionBox) {
    const cardBottom = (h + exclusionBox.height) / 2;
    return cardBottom + (h - cannonClear - cardBottom) * 0.45;
  }
  return h * 0.75;
}

export function headlineAlpha(cel: CelState, t: number): number {
  const labelAt = CEL_LABEL_AT[cel.tier] ?? 0;
  const elapsed = t - cel.t0 - labelAt;
  if (elapsed < 0) return 0;
  return clamp01(elapsed / CEL_LABEL_RISE_DUR);
}

export function headlineRise(cel: CelState, t: number): number {
  const labelAt = CEL_LABEL_AT[cel.tier] ?? 0;
  const elapsed = t - cel.t0 - labelAt;
  if (elapsed < 0) return 10;
  return 10 * (1 - easeOut(clamp01(elapsed / CEL_LABEL_RISE_DUR)));
}

/* ------------------------------------------------------------------ */
/*  Liftoff offset for cannon                                          */
/* ------------------------------------------------------------------ */

export function cannonLiftOffset(cel: CelState, t: number, h: number): number {
  const elapsed = t - cel.t0;
  const liftE = elapsed - CEL_LIFT_AT;
  if (liftE <= 0) return 0;
  return easeIn(clamp01(liftE / CEL_LIFT_DUR)) * (h + 120);
}
