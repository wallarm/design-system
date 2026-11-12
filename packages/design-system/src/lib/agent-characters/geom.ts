import { createCanvas } from './canvas';
import { type AgentShapeDef, GEOMS, SHAPES } from './data.gen';
import { r2 } from './paths';

export const SHAPE: Record<string, AgentShapeDef> = Object.fromEntries(SHAPES.map(s => [s.id, s]));
export const shapeOf = (id: string): AgentShapeDef => SHAPE[id] || SHAPE.dome!;

/** Geometry analysis: top anchor, half-width per row (240 rows, y = i / 2), footprint at y 104. */
export interface Geom {
  top: [number, number];
  HW: Float32Array;
  foot: [number, number];
}
export interface GeomView extends Geom {
  hw: (y: number) => number;
}

const GEOM = new Map<string, GeomView>();
const view = (g: Geom): GeomView => ({
  ...g,
  hw: y => {
    const i = Math.round(y * 2);
    return i >= 0 && i < 240 ? g.HW[i]! : 0;
  },
});

function maskOf(d: string, N = 240, R = 120) {
  const { ctx } = createCanvas(N);
  ctx.scale(N / R, N / R);
  ctx.fill(new Path2D(d));
  return ctx.getImageData(0, 0, N, N).data;
}

/** Seeds the cache with known geometry (tests without a canvas, or precomputed data). */
export function primeGeom(id: string, g: Geom) {
  GEOM.set(id, view(g));
}

export function geom(S: AgentShapeDef): GeomView {
  const cached = GEOM.get(S.id);
  if (cached) return cached;
  // The kit's shapes ship their measured geometry as data; the canvas path is for shapes outside the kit.
  const known = (GEOMS as Partial<Record<string, (typeof GEOMS)[keyof typeof GEOMS]>>)[S.id];
  if (known && S.d === SHAPE[S.id]?.d) {
    const g = view({ top: known.top, HW: Float32Array.from(known.HW), foot: known.foot });
    GEOM.set(S.id, g);
    return g;
  }
  const N = 240;
  const k = N / 120;
  const body = maskOf(S.d);
  const all = maskOf(S.d + (S.parts || []).map(p => p.d).join(''));
  const at = (m: Uint8ClampedArray, ux: number, uy: number) => {
    const x = Math.round(ux * k);
    const y = Math.round(uy * k);
    return x >= 0 && y >= 0 && x < N && y < N && m[(y * N + x) * 4 + 3]! > 127;
  };
  let top = S.top;
  if (!top) {
    let ty = 120;
    for (let y = 0; y < 120; y += 0.5) {
      if (at(body, 60, y) || at(body, 58, y) || at(body, 62, y)) {
        ty = y;
        break;
      }
    }
    top = [60, ty];
  }
  const HW = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const y = i / k;
    let l = 0;
    let r = 0;
    while (l < 60 && at(body, top[0] - l - 0.5, y)) l += 0.5;
    while (r < 60 && at(body, top[0] + r + 0.5, y)) r += 0.5;
    HW[i] = Math.max(l, r);
  }
  let fl = 0;
  let fr = 0;
  for (let x = 0; x < 120; x += 0.5) {
    if (at(all, x, 104)) {
      fl = x;
      break;
    }
  }
  for (let x = 120; x > 0; x -= 0.5) {
    if (at(all, x, 104)) {
      fr = x;
      break;
    }
  }
  const g = view({ top, HW, foot: [fl, fr] });
  GEOM.set(S.id, g);
  return g;
}

const OPTY = new Map<string, number>();
/** Optical centre: units below the viewBox centre (y 50); halfway between the body's box centre and its area centroid. */
export function optY(c: { shape: string }) {
  const S = shapeOf(c.shape);
  const cached = OPTY.get(S.id);
  if (cached !== undefined) return cached;
  const g = geom(S);
  const top = g.top[1];
  let sw = 0;
  let sy = 0;
  for (let y = top; y <= 108; y += 0.5) {
    const w = g.hw(y);
    sw += w;
    sy += w * y;
  }
  const v = ((top + 108) / 2 + (sw ? sy / sw : (top + 108) / 2)) / 2 - 50;
  OPTY.set(S.id, v);
  return v;
}

/** The px to move the character up so its optical centre sits on the row's centre line. */
export const optPx = (c: { shape: string }, size: number) => -r2((optY(c) * size) / 136);

const INSET = new Map<string, number>();
/** The empty box beside the body, each side, in viewBox units: the box is 136 wide, the body centred at x 60. */
const insetOf = (c: { shape: string }) => {
  const S = shapeOf(c.shape);
  let v = INSET.get(S.id);
  if (v === undefined) {
    v = 68 - Math.max(...geom(S).HW);
    INSET.set(S.id, v);
  }
  return v;
};

/** The px between the character's box and its body on each side, so a name can keep its gap from the body. */
export const insetPx = (c: { shape: string }, size: number) => r2((insetOf(c) * size) / 136);
