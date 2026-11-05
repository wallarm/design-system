import type { AgentShapeDef } from './data.gen';
import { EYE_BASE } from './data.gen';
import { r2 } from './paths';

export type StateId =
  | 'idle'
  | 'hello'
  | 'working'
  | 'needs'
  | 'done'
  | 'failed'
  | 'off'
  | 'box'
  | 'power'
  | 'invite'
  | 'partly';
export interface EyePose {
  w: number;
  ht: number;
  hb: number;
  kt: number;
  kb: number;
  lid: number;
  rot: number;
  bright: number;
  gy: number;
}

export function eyeTargets(style: string, st: StateId): EyePose {
  const b: EyePose = {
    ...(EYE_BASE[style as keyof typeof EYE_BASE] || EYE_BASE.oval),
    rot: 0,
    bright: 1,
    gy: 0,
  };
  switch (st) {
    case 'working':
      return {
        ...b,
        ht: b.ht * 0.5,
        hb: b.hb * 0.5,
        kt: 0.7,
        kb: 0.7,
        lid: Math.min(1, b.lid + 0.15),
      };
    case 'needs':
      return { ...b, w: b.w * 1.12, ht: b.ht * 1.15, hb: b.hb * 1.15, lid: Math.min(b.lid, 0.15) };
    case 'done':
    case 'hello': {
      const ht = Math.max(b.ht, 1.1) * 0.95;
      return { ...b, w: b.w * 1.1, ht, hb: -0.6 * ht, kt: 0.6, kb: 0.6, lid: 0, gy: -0.1 };
    }
    case 'failed':
      return {
        ...b,
        w: Math.max(b.w, 1) * 1.05,
        ht: 0,
        hb: 0,
        lid: 0,
        rot: 6,
        bright: 0.7,
        gy: 0.55,
      };
    case 'off':
      return { ...b, w: b.w * 0.15, ht: 0.06, hb: 0.06, lid: 0, bright: 0.12 };
    case 'box':
    case 'power':
      return { ...b, lid: 0.5, ht: 1.15, hb: 1.15, kt: 0.55, kb: 0.55, bright: 0.35 };
    case 'invite': // awake and lit in its own tint, never widened
      return { ...b, lid: Math.min(b.lid, 0.3), bright: 0.8 };
    default:
      return b;
  }
}

/** "Hello": the eyes pop open, wider and brighter, before the arcs. */
export const helloPop = (b: EyePose): EyePose => ({
  ...b,
  w: b.w * 1.16,
  ht: b.ht * 1.28,
  hb: b.hb * 1.28,
  kt: 0.55,
  kb: 0.55,
  lid: 0,
  rot: 0,
  bright: 1.15,
  gy: -0.06,
});

export function eyeD(
  cx: number,
  cyIn: number,
  w: number,
  ht: number,
  hb: number,
  kt: number,
  kb: number,
  lid: number,
  rot: number,
  open: number,
  s: number,
) {
  const h1 = ht * open * (1 - lid);
  let h2 = hb * open;
  const k1 = kt + (1 - kt) * 0.8 * lid;
  const cy = cyIn + 0.25 * (1 - open) * ht;
  if (h2 < -0.8 * h1) h2 = -0.8 * h1;
  const W = Math.max(0.05, w - s / 2);
  const T = Math.max(0, h1 - s / 2);
  let B = h2 > 0 ? Math.max(0, h2 - s / 2) : h2 + s / 2;
  if (B < -0.8 * T) B = -0.8 * T;
  const a = (rot * Math.PI) / 180;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const R = (x: number, y: number) =>
    `${r2(cx + (x - cx) * c - (y - cy) * sn)} ${r2(cy + (x - cx) * sn + (y - cy) * c)}`;
  return `M${R(cx - W, cy)}C${R(cx - W, cy - k1 * T)} ${R(cx - k1 * W, cy - T)} ${R(cx, cy - T)}C${R(cx + k1 * W, cy - T)} ${R(cx + W, cy - k1 * T)} ${R(cx + W, cy)}C${R(cx + W, cy + kb * B)} ${R(cx + kb * W, cy + B)} ${R(cx, cy + B)}C${R(cx - kb * W, cy + B)} ${R(cx - W, cy + kb * B)} ${R(cx - W, cy)}Z`;
}

export function eyesPath(S: AgentShapeDef, e: EyePose, open: number, gx = 0, gy = 0) {
  const [vx, vy, vw, vh] = S.v;
  const unit = vh * 0.17;
  const cy0 = vy + vh / 2;
  let d = '';
  for (const side of [-1, 1]) {
    const near = side * gx > 0 ? 1 + 0.08 * Math.abs(gx) : 1 - 0.06 * Math.abs(gx);
    const wm = 1 - 0.1 * Math.abs(gx);
    const cx = vx + vw * (0.5 + 0.2 * side) + gx * 0.18 * vw;
    const cy = cy0 + gy * 0.12 * vh;
    const w = e.w * unit * near * wm * (1 + 0.06 * (1 - open));
    const s = 0.25 * e.w * unit;
    const lid = Math.max(e.lid, 0.25 * Math.max(0, gy));
    d += eyeD(
      cx,
      cy,
      w,
      e.ht * unit * near,
      e.hb * unit * near,
      e.kt,
      e.kb,
      lid,
      side * e.rot,
      open,
      s,
    );
  }
  return d;
}
