// The reference page's motion constants (look v14, lines 1290–1297 and 1541–1645), ported line for line: easings,
// springs and their integrator, the clips (Failed beat, Hello, the idle repertoire, the invite) and the blink curve.
// Do not "improve" anything here (D25): every number is the page's.
import { clamp, r2 } from './paths';

export type Ease = (t: number) => number;
/** additive clip channels: gaze, lid, openness, brightness, crown line, prop angle / turn / shift, beam */
export type Channels = Partial<
  Record<'gx' | 'gy' | 'lid' | 'op' | 'br' | 'cv' | 'pa' | 'pw' | 'pdx' | 'pb' | 'bm', number>
>;
/** [t ms, ty, sy, rot, ease, channels] */
export type Key = readonly [number, number, number, number?, (Ease | null)?, Channels?];

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** cubic-bezier easing, Newton on x */
const cb =
  (x1: number, y1: number, x2: number, y2: number): Ease =>
  t => {
    let u = t;
    for (let i = 0; i < 6; i++) {
      const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
      const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(dx) < 1e-6) break;
      u = clamp(u - x / dx, 0, 1);
    }
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };
export const E_SETTLE = cb(0.22, 1, 0.36, 1);
export const E_GRAV = cb(0.55, 0, 1, 0.45);
export const E_RISE = cb(0.2, 0.7, 0.3, 1);
export const E_INOUT = cb(0.45, 0, 0.55, 1);
export const E_FILL = cb(0.3, 0.7, 0.2, 1);
export const E_OUT = cb(0.15, 0.85, 0.35, 1);
export const E_IN = cb(0.6, 0, 0.9, 0.4);
export const E_LIN: Ease = t => t;

function gauss(r: () => number) {
  let u = 0;
  let v = 0;
  while (!u) u = r();
  while (!v) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export const logn = (r: () => number, med: number, s: number, lo: number, hi: number) =>
  clamp(med * Math.exp(s * gauss(r)), lo, hi);

// ── springs ──
export interface SpringP {
  k: number;
  c: number;
}
export interface Spring {
  x: number;
  v: number;
  t: number;
  p: SpringP;
}
const SPR = (T: number, z: number): SpringP => {
  const w = (2 * Math.PI) / T;
  return { k: w * w, c: 2 * z * w };
};
export const P_SHAPE = SPR(0.28, 0.8);
export const P_POP = SPR(0.32, 0.45);
export const P_DART = SPR(0.12, 0.65);
export const P_PURSUIT = SPR(0.3, 0.85);
export const P_BRIGHT = SPR(0.2, 1);
export const P_SQ = SPR(0.22, 0.3);
export const P_LAND = SPR(0.35, 0.4);
export const P_W = SPR(0.6, 1);
export const spring = (x: number, p: SpringP): Spring => ({ x, v: 0, t: x, p });
/** semi-implicit Euler in sub-steps of at most 1/240 s */
export function stepS(s: Spring, dt: number) {
  const n = Math.ceil(dt * 240);
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.v += (-s.p.k * (s.x - s.t) - s.p.c * s.v) * h;
    s.x += s.v * h;
  }
}

// ── clips ──
export const NOX: Channels = {};
/** a key that moves only eye and prop channels */
const kx = (t: number, x: Channels, e?: Ease): Key => [t, 0, 1, 0, e || null, x];
function osc(ch: keyof Channels, t0: number, amps: number[], per: number, end: number): Key[] {
  const ks: Key[] = [kx(t0, { [ch]: 0 })];
  amps.forEach((a, i) => {
    ks.push(kx(t0 + per / 4 + (i * per) / 2, { [ch]: a }, E_INOUT));
  });
  ks.push(kx(end, { [ch]: 0 }, E_SETTLE));
  return ks;
}
/** "Failed": a signal glitch, then a small "no-no"; every 2.5–4 s */
export const BEAT: Key[] = [
  [0, 0, 1, 0, null, { gx: 0, gy: 0, br: 0 }],
  [40, 0, 1, 0, E_LIN, { gx: 0.12, gy: 0.05, br: -0.4 }],
  [80, 0, 1, 0, E_LIN, { gx: -0.08, gy: 0, br: 0.1 }],
  [120, 0, 1, 0, E_LIN, { gx: 0.04, gy: 0.03, br: -0.3 }],
  [160, 0, 1, 0, E_LIN, { gx: 0, gy: 0, br: 0 }],
  [280, 0, 1, -2.4, E_INOUT, { gx: -0.42, gy: 0, br: 0 }],
  [420, 0, 1, 2.2, E_INOUT, { gx: 0.42, gy: 0, br: 0 }],
  [550, 0, 1, -1.1, E_INOUT, { gx: -0.2, gy: 0, br: 0 }],
  [680, 0, 1, 0, E_SETTLE, { gx: 0, gy: 0, br: 0 }],
];
/** "Hello": a head tilt in place of a wave */
export const HELLO_TILT: Key[] = [
  [0, 0, 1, 0],
  [430, 0, 1, 0],
  [650, 0, 1, -6, E_OUT],
  [790, 0, 1, -6],
  [1130, 0, 1, 6, E_INOUT],
  [1270, 0, 1, 6],
  [1600, 0, 1, 0, E_SETTLE],
];
/** "Hello": the prop joins in from the top of the hop */
export const HELLO_PROP: Record<string, Key[]> = {
  twitch: osc('pa', 250, [12, -12, 11, -10, 8, -5], 420, 1650), // Wally's antennae wave
  flutter: osc('pa', 250, [14, -14, 13, -12, 10, -7], 300, 1350), // the pennant waves
  sway: osc('pa', 250, [10, -10, 8, -6], 560, 1650), // the sprout sways
  scan: osc('pa', 250, [14, -14, 10], 640, 1450), // the dish waves
  sweep: osc('pa', 250, [10, -10, 8, -5], 560, 1650), // the magnifier waves
  turn: [kx(0, { pw: 0 }), kx(250, { pw: 0 }), kx(1250, { pw: 360 }, E_INOUT)], // the periscope spins once
  spin: [kx(0, { pw: 0 }), kx(250, { pw: 0 }), kx(1450, { pw: 720 }, E_INOUT)], // the key turns twice
  flicker: [
    kx(0, { bm: 0, pb: 0 }),
    kx(250, { bm: 0, pb: 0 }),
    kx(300, { bm: 0.5, pb: -1.6 }, E_OUT),
    kx(600, { bm: 0.5, pb: 0 }, E_GRAV),
    kx(650, { bm: 0, pb: 0 }),
    kx(760, { bm: 0, pb: 0 }),
    kx(810, { bm: 0.5, pb: 0 }),
    kx(1100, { bm: 0.5, pb: 0 }),
    kx(1200, { bm: 0, pb: 0 }),
  ], // two flashes
  bob: [
    kx(0, { pb: 0 }),
    kx(250, { pb: 0 }),
    kx(370, { pb: -2.4 }, E_OUT),
    kx(520, { pb: 0 }, E_GRAV),
    kx(820, { pb: 0 }),
    kx(940, { pb: -1.8 }, E_OUT),
    kx(1090, { pb: 0 }, E_GRAV),
  ], // any other prop: a small lift, twice
};
HELLO_PROP.slip = HELLO_PROP.bob!; // the monocle lifts like a raised brow
/** idle "Plays with its prop"; props without a move never pick it */
export const FIDDLE: Record<string, Key[]> = {
  twitch: [
    kx(0, { pa: 0 }),
    kx(60, { pa: 6 }),
    kx(120, { pa: -4 }),
    kx(190, { pa: 5 }),
    kx(270, { pa: 0 }),
    kx(560, { pa: 0 }),
    kx(620, { pa: 5 }),
    kx(690, { pa: -3 }),
    kx(770, { pa: 3 }),
    kx(900, { pa: 0 }),
  ],
  scan: [
    kx(0, { pa: 0, gx: 0 }),
    kx(700, { pa: -18, gx: -0.25 }, E_INOUT),
    kx(1500, { pa: 16, gx: 0.22 }, E_INOUT),
    kx(2300, { pa: 0, gx: 0 }, E_INOUT),
  ],
  turn: [
    kx(0, { pw: 0, gx: 0 }),
    kx(450, { pw: 180, gx: -0.3 }, E_INOUT),
    kx(1450, { pw: 180, gx: -0.3 }),
    kx(1900, { pw: 360, gx: 0 }, E_INOUT),
  ],
  sweep: [
    kx(0, { pa: 0, gx: 0 }),
    kx(500, { pa: -14, gx: 0.3 }, E_INOUT),
    kx(1200, { pa: 12, gx: 0.3 }, E_INOUT),
    kx(1700, { pa: 0, gx: 0 }, E_INOUT),
  ],
  flutter: osc('pa', 0, [7, -6, 5, -4, 3, -2, 1], 260, 1150),
  sway: [
    kx(0, { pa: 0 }),
    kx(500, { pa: 9 }, E_INOUT),
    kx(1100, { pa: -7 }, E_INOUT),
    kx(1600, { pa: 3 }, E_INOUT),
    kx(2000, { pa: 0 }, E_SETTLE),
  ],
  flicker: [
    kx(0, { bm: 0 }),
    kx(60, { bm: 0.5 }, E_LIN),
    kx(110, { bm: 0.05 }, E_LIN),
    kx(170, { bm: 0.55 }, E_LIN),
    kx(220, { bm: 0.12 }, E_LIN),
    kx(300, { bm: 0.55 }, E_LIN),
    kx(1150, { bm: 0.55 }),
    kx(1500, { bm: 0 }, E_INOUT),
  ],
  spin: [kx(0, { pw: 0 }), kx(1500, { pw: 720 }, E_INOUT)],
  slip: [
    kx(0, { pb: 0, pdx: 0, lid: 0, gx: 0 }),
    kx(280, { pb: 3.2, pdx: 0.8, lid: 0, gx: 0.15 }, E_IN),
    kx(560, { pb: 3.2, pdx: 0.8, lid: 0, gx: 0.15 }),
    kx(760, { pb: -0.6, pdx: 0, lid: 0.3, gx: 0.2 }, E_OUT),
    kx(900, { pb: 0, pdx: 0, lid: 0.3, gx: 0.2 }, E_SETTLE),
    kx(1300, { pb: 0, pdx: 0, lid: 0.3, gx: 0.2 }),
    kx(1650, { pb: 0, pdx: 0, lid: 0, gx: 0 }, E_INOUT),
  ], // the monocle slips and is screwed back in
};
/** fiddles with 50–130 ms keys need the full frame rate */
export const FAST = new Set(['twitch', 'flutter', 'flicker']);

export interface Gaze {
  gx: number;
  gy: number;
}
/** the idle repertoire inside "On duty"; side s = ±1 */
export const ACTS = {
  bored: (): Key[] => [
    [0, 0, 1, 0, null, { lid: 0, gy: 0, br: 0, op: 0 }],
    [650, 0, 1.018, 0, E_INOUT, { lid: 0.3, gy: 0.1, br: -0.05, op: 0 }],
    [1500, 0, 0.975, 0, E_INOUT, { lid: 0.42, gy: 0.2, br: -0.08, op: 0 }],
    [1850, 0, 0.975, 0, null, { lid: 0.42, gy: 0.2, br: -0.08, op: 0 }],
    [2050, 0, 0.975, 0, E_IN, { lid: 0.42, gy: 0.2, br: -0.08, op: -0.75 }],
    [2300, 0, 0.978, 0, E_OUT, { lid: 0.4, gy: 0.18, br: -0.08, op: 0 }],
    [2900, 0, 1, 0, E_SETTLE, { lid: 0, gy: 0, br: 0, op: 0 }],
  ],
  lean: (s: number): Key[] => [
    [0, 0, 1, 0],
    [380, 0, 1, 2.6 * s, E_OUT],
    [1150, 0, 1, 2.6 * s],
    [1500, 0, 1, -0.5 * s, E_INOUT],
    [1800, 0, 1, 0, E_SETTLE],
  ],
  shuffle: (s: number): Key[] => [
    [0, 0, 1, 0],
    [110, -2, 1.01, -1.8 * s, E_OUT],
    [220, 0, 0.975, -0.5 * s, E_GRAV],
    [330, -2, 1.01, 1.8 * s, E_OUT],
    [440, 0, 0.975, 0.5 * s, E_GRAV],
    [650, 0, 1, 0, E_SETTLE],
  ],
  look: (g: Gaze, L: number): Key[] => [
    [0, 0, 1, 0, null, { gx: 0, gy: 0 }],
    [200, 0, 1, L, E_OUT, { gx: g.gx, gy: g.gy }],
    [1200, 0, 1, L, null, { gx: g.gx, gy: g.gy }],
    [1550, 0, 1, 0, E_INOUT, { gx: 0, gy: 0 }],
  ],
  /** double take */
  take: (g: Gaze, L: number): Key[] => [
    [0, 0, 1, 0, null, { gx: 0, gy: 0 }],
    [180, 0, 1, 0.6 * L, E_OUT, { gx: 0.8 * g.gx, gy: 0.8 * g.gy }],
    [520, 0, 1, 0.6 * L, null, { gx: 0.8 * g.gx, gy: 0.8 * g.gy }],
    [700, 0, 1, 0, E_INOUT, { gx: 0, gy: 0 }],
    [900, 0, 1, L, E_OUT, { gx: g.gx, gy: g.gy }],
    [1750, 0, 1, L, null, { gx: g.gx, gy: g.gy }],
    [2100, 0, 1, 0, E_INOUT, { gx: 0, gy: 0 }],
  ],
  stretch: (): Key[] => [
    [0, 0, 1, 0, null, { op: 0 }],
    [380, 0, 0.955, 0, E_INOUT, { op: -0.25 }],
    [1050, 0, 1.07, 0, E_OUT, { op: -0.88 }],
    [1200, 0, 1.07, 0.9, E_INOUT, { op: -0.88 }],
    [1350, 0, 1.07, -0.9, E_INOUT, { op: -0.88 }],
    [1500, 0, 1.07, 0, E_INOUT, { op: -0.88 }],
    [1850, 0, 0.97, 0, E_INOUT, { op: -0.2 }],
    [2100, 0, 1.012, 0, E_INOUT, { op: 0 }],
    [2400, 0, 1, 0, E_SETTLE, { op: 0 }],
  ],
  /** "Partial coverage" instead of the stretch: the colour climbs 70% of the crown as it looks up, a content
   *  blink, then it sinks home slower than it rose */
  reach: (L: number): Key[] => [
    [0, 0, 1, 0, null, { cv: 0, gy: 0, br: 0, op: 0 }],
    [220, 0, 0.985, 0, E_INOUT, { cv: 0, gy: 0.06, br: 0, op: 0 }],
    [820, 0, 1.03, 0, E_OUT, { cv: -L, gy: -0.4, br: 0.08, op: 0 }],
    [1250, 0, 1.03, 0, null, { cv: -L, gy: -0.4, br: 0.08, op: 0 }],
    [1340, 0, 1.025, 0, E_IN, { cv: -0.92 * L, gy: -0.34, br: 0.06, op: -0.9 }],
    [1450, 0, 1.015, 0, E_OUT, { cv: -0.75 * L, gy: -0.25, br: 0.04, op: 0 }],
    [1700, 0, 1, 0, E_SETTLE, { cv: -0.35 * L, gy: -0.1, br: 0, op: 0 }],
    [2400, 0, 1, 0, E_INOUT, { cv: 0, gy: 0, br: 0, op: 0 }],
  ],
};
export const ACT_W: Record<string, number> = {
  bored: 0.22,
  fidget: 0.26,
  prop: 0.24,
  look: 0.18,
  stretch: 0.1,
};

/** perks up, glances at Set up, looks back, a slow blink; feet on the floor; rest gaze straight ahead */
export const INVITE = (c: Gaze): Key[] => {
  const s = Math.abs(c.gx) >= 0.15 ? Math.sign(c.gx) : 0; // s = 0: Set up is below, a nod instead of a lean
  const lo = s === 0;
  const O = { gx: 0, gy: 0 };
  const C = { gx: c.gx, gy: 1.25 * c.gy };
  return [
    [0, 0, 1, 0, null, { gx: 0, gy: 0, lid: 0, br: 0, op: 0 }],
    [240, 0, 1.022, -0.6 * s, E_OUT, { ...O, lid: 0, br: 0.2, op: 0 }],
    [460, 0, 1.022, -0.6 * s, null, { ...O, lid: 0, br: 0.2, op: 0 }],
    [700, 0, lo ? 0.985 : 1.01, 3 * s, E_INOUT, { ...C, lid: 0, br: 0.2, op: 0 }],
    [1350, 0, lo ? 0.988 : 1.008, 2.6 * s, E_INOUT, { ...C, lid: 0, br: 0.2, op: 0 }],
    [1550, 0, 1.006, 1.4 * s, E_INOUT, { ...O, lid: 0, br: 0.12, op: 0 }],
    [1710, 0, 1.004, 0.8 * s, E_IN, { ...O, lid: 0.1, br: 0.1, op: -0.9 }],
    [1930, 0, 1.002, 0.3 * s, E_OUT, { ...O, lid: 0.04, br: 0.06, op: 0 }],
    [2350, 0, 1, 0, E_SETTLE, { gx: 0, gy: 0, lid: 0, br: 0, op: 0 }],
  ];
};

/** the .props group transform from the prop channels */
export function propTr(X: Channels, F?: { px: number; py: number } | null) {
  const f = F || { px: 60, py: 30 };
  let s = '';
  const dx = X.pdx || 0;
  const dy = X.pb || 0;
  if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) s += `translate(${r2(dx)} ${r2(dy)})`;
  if (Math.abs(X.pa || 0) > 0.01) s += ` rotate(${r2(X.pa as number)} ${f.px} ${f.py})`;
  if (Math.abs(X.pw || 0) > 0.5) {
    let c = Math.cos(((X.pw as number) * Math.PI) / 180);
    c = (c < 0 ? -1 : 1) * Math.max(0.04, Math.abs(c));
    s += ` translate(${f.px} 0) scale(${r2(c)} 1) translate(${-f.px} 0)`;
  }
  return s.trim();
}

export const blinkOpen = (u: number) => {
  if (u < 0 || u > 1) return 1;
  if (u < 0.38) return 1 - E_IN(u / 0.38);
  const v = (u - 0.38) / 0.62;
  return v < 0.85 ? E_OUT(v / 0.85) * 1.04 : 1.04 - 0.04 * ((v - 0.85) / 0.15);
};
