import {
  ANOMALY_VIS_THRESHOLD,
  DOT_STEP_BASE,
  DOT_STEP_SCALE,
  IDLE_MARGIN_X,
  IDLE_MARGIN_Y,
} from './constants';
import type { Dot } from './engine-grid';
import { sweepX } from './engine-grid';
import type { EngineOptions, GameStats } from './types';

// constants
export const ROUND_ATTACKS = 100;
export const MAX_TARGETS = 8;
export const MAX_BULLETS = 24;
export const BULLET_SPEED = 720;
export const FIRE_CADENCE = 0.28;
export const CANNON_SPEED = 350;
export const TARGET_LIFE = 2.8;
export const ARMED_SPAWN = 0.4;
export const HIT_R2 = 16 * 16;

// progressive difficulty — end-of-round values
export const TARGET_LIFE_END = 1.6;
export const ARMED_SPAWN_END = 0.2;
export const MAX_TARGETS_END = 12;
export const CLICK_RADIUS = 52;
export const REVEAL_DELAY = 0.3;
export const ARM_RISE = 0.45;
export const FIRST_SPAWN_DELAY = 0.7;
export const ANOMALY_R = 42;
export const ANOMALY_R_SQ = ANOMALY_R * ANOMALY_R;
export const CAUGHT_DUR = 1.4;
export const CANNON_HALF_W = 16;
export const CANNON_BASE_OFFSET = 26;
export const CANNON_BARREL_Y = 40;
export const HUD_CLEAR_W = 120;
export const HUD_CLEAR_H = 140;
export const CARD_CLEAR_PAD = 48;
export const SPAWN_EDGE = 24;
export const CANNON_CLEAR = 72;
export const SPAWN_TRIES = 24;
export const IDLE_ANOMALY_LIFE = 2.4;

export const VERDICTS = [
  'BLOCKED',
  'TERMINATED',
  'NEUTRALIZED',
  'QUARANTINED',
  'MITIGATED',
  'CONTAINED',
] as const;

// types
export interface Anomaly {
  x: number;
  y: number;
  t0: number;
  life: number;
  caught: boolean;
}

export interface Bullet {
  x: number;
  y: number;
}

export interface CaughtCell {
  x: number;
  y: number;
  half: number;
  ao: number;
}

export interface CaughtEffect {
  x: number;
  y: number;
  t0: number;
  cells: CaughtCell[];
  label: string;
}

export type GameMode = 'idle' | 'armed' | 'over';

// mutable state owned by engine, read by game logic
export interface GameEngineHost {
  w: number;
  h: number;
  dots: Dot[];
  opts: EngineOptions;
  tanTilt: number; // cached Math.tan(tilt * PI / 180)
  exclusionBox: { width: number; height: number } | null;
}

export interface GameLogic {
  // Mutable state (for renderer/engine to read and write)
  readonly anomalies: Anomaly[];
  readonly bullets: Bullet[];
  readonly caughtEffects: CaughtEffect[];
  gameActive: boolean;
  gameMode: GameMode;
  cannonX: number;
  armT: number;
  fontLoaded: boolean;

  // Simulation
  gameSim(t: number, dt: number): void;
  pruneCaughtEffects(t: number): void;
  adjustTimeMarkers(skip: number): void;

  // API methods
  setGameActive(active: boolean): void;
  catchAt(x: number, y: number, running: boolean): boolean;
  setMode(mode: 'idle' | 'armed'): void;
  startRound(): void;
  exitGame(): void;
  setCannonDir(dir: number): void;
  setFiring(on: boolean): void;
  onStats(cb: (s: GameStats) => void): void;
  setExclusion(box: { width: number; height: number } | null): void;
}

// factory
export function createGameLogic(host: GameEngineHost): GameLogic {
  const state = {
    gameActive: false,
    gameMode: 'idle' as GameMode,
    cannonX: 0,
    armT: 0,
    fontLoaded: false,
  };

  const anomalies: Anomaly[] = [];
  const bullets: Bullet[] = [];
  const caughtEffects: CaughtEffect[] = [];

  let cannonDir = 0;
  let firing = false;
  let lastFire = -Infinity;

  let killTotal = 0;
  let roundKills = 0;
  let roundEscaped = 0;
  let roundSpawned = 0;
  let roundDone = false;

  let lastSpawn = -Infinity;

  let statsCb: ((s: GameStats) => void) | null = null;
  let exclusionBox: { width: number; height: number } | null = null;

  if (typeof document !== 'undefined') {
    document.fonts
      .load('9px "Press Start 2P"')
      .then(() => {
        state.fontLoaded = true;
      })
      // biome-ignore lint/suspicious/noEmptyBlockStatements: intentionally swallow font-load failures
      .catch(() => {});
  }

  function emitStats() {
    statsCb?.({
      kills: killTotal,
      stopped: roundKills,
      escaped: roundEscaped,
      spawned: roundSpawned,
      done: roundDone,
    });
  }

  function spawnRing(): { x: number; y: number } | null {
    const { w, h } = host;
    if (!exclusionBox) {
      return {
        x: w * (0.1 + Math.random() * 0.8),
        y: h * (0.1 + Math.random() * 0.35),
      };
    }

    const exW = Math.min(exclusionBox.width, w);
    const exH = Math.min(exclusionBox.height, h);
    const cl = (w - exW) / 2 - CARD_CLEAR_PAD;
    const cr = (w + exW) / 2 + CARD_CLEAR_PAD;
    const ct = (h - exH) / 2 - CARD_CLEAR_PAD;
    const cb = (h + exH) / 2 + CARD_CLEAR_PAD;

    for (let i = 0; i < SPAWN_TRIES; i++) {
      const x = SPAWN_EDGE + Math.random() * Math.max(1, w - 2 * SPAWN_EDGE);
      const y = SPAWN_EDGE + Math.random() * Math.max(1, h - SPAWN_EDGE - CANNON_CLEAR);

      if (x > cl && x < cr && y > ct && y < cb) continue;
      if (x > w - HUD_CLEAR_W && y < HUD_CLEAR_H) continue;

      return { x, y };
    }

    const bands = [
      { area: cl - SPAWN_EDGE, cx: (SPAWN_EDGE + cl) / 2, cy: h / 2 },
      { area: w - SPAWN_EDGE - cr, cx: (cr + w - SPAWN_EDGE) / 2, cy: h / 2 },
      { area: ct - SPAWN_EDGE, cx: w / 2, cy: (SPAWN_EDGE + ct) / 2 },
      { area: h - CANNON_CLEAR - cb, cx: w / 2, cy: (cb + h - CANNON_CLEAR) / 2 },
    ];
    let best = bands[0]!;
    for (const b of bands) {
      if (b.area > best.area) best = b;
    }
    if (best.area > 0) return { x: best.cx, y: best.cy };
    return { x: w / 2, y: SPAWN_EDGE };
  }

  function spawnIdleAnomaly(t: number): Anomaly | null {
    const { w, h } = host;
    if (exclusionBox) {
      const pos = spawnRing();
      if (!pos) return null;
      return { x: pos.x, y: pos.y, t0: t, life: IDLE_ANOMALY_LIFE, caught: false };
    }
    return {
      x: IDLE_MARGIN_X + Math.random() * Math.max(1, w - IDLE_MARGIN_X * 2),
      y: IDLE_MARGIN_Y + Math.random() * Math.max(1, h - IDLE_MARGIN_Y * 2),
      t0: t,
      life: IDLE_ANOMALY_LIFE,
      caught: false,
    };
  }

  // shared kill path
  function neutralize(anomaly: Anomaly, t: number) {
    anomaly.caught = true;

    const cells: CaughtCell[] = [];
    const halfCap = host.opts.maxDotSize / 2;
    const env = Math.max(0, Math.sin(((t - anomaly.t0) / anomaly.life) * Math.PI));

    for (const dot of host.dots) {
      const dx = Math.abs(dot.x - anomaly.x);
      const dy = Math.abs(dot.y - anomaly.y);
      if (dx > ANOMALY_R || dy > ANOMALY_R) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq > ANOMALY_R_SQ) continue;
      const dist = Math.sqrt(distSq);
      const ao = env * (1 - dist / ANOMALY_R);
      if (ao < ANOMALY_VIS_THRESHOLD) continue;
      const step = Math.min(Math.round(ao * 5) * DOT_STEP_SCALE + DOT_STEP_BASE, halfCap);
      cells.push({ x: dot.x, y: dot.y, half: step, ao });
    }

    const label = VERDICTS[(Math.random() * VERDICTS.length) | 0]!;
    caughtEffects.push({ x: anomaly.x, y: anomaly.y, t0: t, cells, label });

    recordKill();
  }

  function recordKill() {
    killTotal += 1;
    if (state.gameMode === 'armed') roundKills += 1;
    emitStats();
  }

  // round management
  function endRound() {
    state.gameMode = 'over';
    roundDone = true;
    bullets.length = 0;
    firing = false;
    cannonDir = 0;
    emitStats();
  }

  // hittability check
  function isHittable(anomaly: Anomaly, t: number): boolean {
    if (anomaly.caught) return false;
    const env = Math.max(0, Math.sin(((t - anomaly.t0) / anomaly.life) * Math.PI));
    if (env < ANOMALY_VIS_THRESHOLD) return false;

    const { w, h, opts, tanTilt } = host;
    const sx = sweepX(t, w, opts.sweepPeriod);

    if (state.gameMode === 'armed' || state.gameMode === 'over') {
      const sxAtY = sx + (h / 2 - anomaly.y) * tanTilt;
      return anomaly.x < sxAtY || t - anomaly.t0 > REVEAL_DELAY;
    }
    return anomaly.x - ANOMALY_R < sx + (h / 2 - anomaly.y) * tanTilt;
  }

  // shared pruning — removes caught or expired anomalies in place
  function pruneExpired(t: number) {
    let kept = 0;
    for (const anomaly of anomalies) {
      if (anomaly.caught || t - anomaly.t0 > anomaly.life) continue;
      anomalies[kept++] = anomaly;
    }
    anomalies.length = kept;
  }

  // --- gameSim sub-functions ---

  function idleSim(t: number) {
    let liveCount = 0;
    for (const anomaly of anomalies) if (!anomaly.caught) liveCount++;
    if (liveCount < 2 && t - lastSpawn > host.opts.anomalyInterval) {
      const anomaly = spawnIdleAnomaly(t);
      if (anomaly) {
        anomalies.push(anomaly);
        lastSpawn = t;
      }
    }
    pruneExpired(t);
  }

  function updateCannon(dt: number) {
    const { w } = host;
    state.cannonX += cannonDir * CANNON_SPEED * dt;
    state.cannonX = Math.max(CANNON_HALF_W, Math.min(w - CANNON_HALF_W, state.cannonX));
  }

  function fireBullets(t: number) {
    if (firing && t - lastFire >= FIRE_CADENCE && bullets.length < MAX_BULLETS) {
      bullets.push({ x: state.cannonX, y: host.h - CANNON_BARREL_Y });
      lastFire = t;
    }
  }

  function moveBullets(dt: number) {
    let bulletKept = 0;
    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i]!;
      bullet.y -= BULLET_SPEED * dt;
      if (bullet.y < -14) continue;
      bullets[bulletKept++] = bullet;
    }
    bullets.length = bulletKept;
  }

  function checkCollisions(t: number) {
    let bulletWrite = 0;
    for (let bi = 0; bi < bullets.length; bi++) {
      const bullet = bullets[bi]!;
      let consumed = false;
      for (const anomaly of anomalies) {
        if (anomaly.caught) continue;
        if (!isHittable(anomaly, t)) continue;
        const dx = bullet.x - anomaly.x;
        const dy = bullet.y - anomaly.y;
        if (dx * dx + dy * dy < HIT_R2) {
          neutralize(anomaly, t);
          consumed = true;
          break;
        }
      }
      if (!consumed) {
        bullets[bulletWrite++] = bullet;
      }
    }
    bullets.length = bulletWrite;
  }

  function spawnTargets(t: number) {
    const sinceArm = t - state.armT;
    // progressive difficulty: interpolate from start → end over the round
    const progress = Math.min(roundSpawned / ROUND_ATTACKS, 1);
    const p = progress * progress; // ease-in: first half gentle, second half ramps hard
    const curSpawnInterval = ARMED_SPAWN + (ARMED_SPAWN_END - ARMED_SPAWN) * p;
    const curMaxTargets = Math.round(MAX_TARGETS + (MAX_TARGETS_END - MAX_TARGETS) * p);
    const curLife = TARGET_LIFE + (TARGET_LIFE_END - TARGET_LIFE) * p;

    if (
      sinceArm > FIRST_SPAWN_DELAY &&
      roundSpawned < ROUND_ATTACKS &&
      t - lastSpawn >= curSpawnInterval
    ) {
      let liveCount = 0;
      for (const anomaly of anomalies) if (!anomaly.caught) liveCount++;
      if (liveCount < curMaxTargets) {
        const pos = spawnRing();
        if (pos) {
          anomalies.push({ x: pos.x, y: pos.y, t0: t, life: curLife, caught: false });
          roundSpawned += 1;
          lastSpawn = t;
        }
      }
    }
  }

  function pruneAndCount(t: number) {
    let anomalyKept = 0;
    let escapedCount = 0;
    for (const anomaly of anomalies) {
      if (anomaly.caught) continue;
      if (t - anomaly.t0 > anomaly.life) {
        escapedCount++;
        continue;
      }
      anomalies[anomalyKept++] = anomaly;
    }
    anomalies.length = anomalyKept;
    if (escapedCount > 0) {
      roundEscaped += escapedCount;
      emitStats();
    }

    if (roundSpawned >= ROUND_ATTACKS && anomalies.length === 0) {
      endRound();
    }
  }

  // game simulation step
  function gameSim(t: number, dt: number) {
    if (state.gameMode === 'idle') {
      idleSim(t);
      return;
    }

    if (state.gameMode === 'over') {
      pruneExpired(t);
      return;
    }

    // armed mode sim
    updateCannon(dt);
    fireBullets(t);
    moveBullets(dt);
    checkCollisions(t);
    spawnTargets(t);
    pruneAndCount(t);
  }

  // prune caught effects — called by engine after gameSim
  function pruneCaughtEffects(t: number) {
    let kept = 0;
    for (const effect of caughtEffects) {
      if (t - effect.t0 >= CAUGHT_DUR) continue;
      caughtEffects[kept++] = effect;
    }
    caughtEffects.length = kept;
  }

  // time-skip adjustment
  function adjustTimeMarkers(skip: number) {
    for (const anomaly of anomalies) anomaly.t0 += skip;
    for (const effect of caughtEffects) effect.t0 += skip;
    if (state.armT > 0) state.armT += skip;
    if (lastSpawn > -Infinity && lastSpawn !== 0) lastSpawn += skip;
  }

  // game API
  function setGameActive(active: boolean) {
    if (state.gameActive === active) return;
    state.gameActive = active;
    if (active) {
      lastSpawn = -Infinity;
    } else {
      anomalies.length = 0;
      bullets.length = 0;
      caughtEffects.length = 0;
      state.gameMode = 'idle';
      killTotal = 0;
      roundKills = 0;
      roundEscaped = 0;
      roundSpawned = 0;
      roundDone = false;
      firing = false;
      cannonDir = 0;
    }
  }

  function catchAt(x: number, y: number, running: boolean): boolean {
    if (!running) return false;
    const now = performance.now() / 1000;

    let best: Anomaly | null = null;
    let bestDist = CLICK_RADIUS * CLICK_RADIUS;

    for (const anomaly of anomalies) {
      if (!isHittable(anomaly, now)) continue;
      const dx = x - anomaly.x;
      const dy = y - anomaly.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        best = anomaly;
      }
    }

    if (best) {
      neutralize(best, now);
      return true;
    }
    return false;
  }

  function setMode(mode: 'idle' | 'armed') {
    if (mode === state.gameMode) return;
    if (mode === 'idle') {
      state.gameMode = 'idle';
      lastSpawn = -Infinity;
    } else {
      state.gameMode = 'armed';
    }
  }

  function startRound() {
    const { w } = host;
    const now = performance.now() / 1000;
    roundKills = 0;
    roundEscaped = 0;
    roundSpawned = 0;
    roundDone = false;
    state.gameMode = 'armed';
    bullets.length = 0;
    anomalies.length = 0;
    caughtEffects.length = 0;
    firing = false;
    cannonDir = 0;
    state.armT = now;
    lastSpawn = now;
    state.cannonX = w / 2;
    emitStats();
  }

  function exitGame() {
    killTotal = 0;
    roundKills = 0;
    roundEscaped = 0;
    roundSpawned = 0;
    roundDone = false;
    state.gameMode = 'idle';
    bullets.length = 0;
    anomalies.length = 0;
    caughtEffects.length = 0;
    firing = false;
    cannonDir = 0;
    lastSpawn = -Infinity;
    emitStats();
  }

  function setCannonDir(dir: number) {
    if (state.gameMode !== 'armed') return;
    cannonDir = dir;
  }

  function setFiring(on: boolean) {
    if (state.gameMode !== 'armed') return;
    if (on && !firing) {
      lastFire = -Infinity;
    }
    firing = on;
  }

  function onStats(cb: (s: GameStats) => void) {
    statsCb = cb;
  }

  function setExclusion(box: { width: number; height: number } | null) {
    if (!box) {
      exclusionBox = null;
      host.exclusionBox = null;
      return;
    }
    const val = {
      width: Math.min(box.width, host.w),
      height: Math.min(box.height, host.h),
    };
    exclusionBox = val;
    host.exclusionBox = val;
  }

  return {
    anomalies,
    bullets,
    caughtEffects,

    gameSim,
    pruneCaughtEffects,
    adjustTimeMarkers,

    setGameActive,
    catchAt,
    setMode,
    startRound,
    exitGame,
    setCannonDir,
    setFiring,
    onStats,
    setExclusion,

    get gameActive() {
      return state.gameActive;
    },
    set gameActive(v: boolean) {
      state.gameActive = v;
    },
    get gameMode() {
      return state.gameMode;
    },
    set gameMode(v: GameMode) {
      state.gameMode = v;
    },
    get cannonX() {
      return state.cannonX;
    },
    set cannonX(v: number) {
      state.cannonX = v;
    },
    get armT() {
      return state.armT;
    },
    set armT(v: number) {
      state.armT = v;
    },
    get fontLoaded() {
      return state.fontLoaded;
    },
    set fontLoaded(v: boolean) {
      state.fontLoaded = v;
    },
  };
}
