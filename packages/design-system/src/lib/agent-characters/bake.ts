// The bake of the reference page (look v14): silhouette → Poisson height field → normals → felt or vinyl light.
// solveField() and shade() are ported line for line and are self-contained (no module references), so the worker
// can run the very same functions from their source text.
import { createCanvas } from './canvas';
import { getRuntime } from './runtime';

export type Material = 'felt' | 'vinyl';
/** Coverage alpha (0–255), N × N, of the path over its square region. */
export type MaskAt = (N: number) => Uint8Array | Uint8ClampedArray;

/** Height field on a 128 × 128 grid: coarse-to-fine SOR at 32, 64 and 128 (80, 80, 120 iterations). */
export function solveField(maskAt: MaskAt, R: number): Float32Array {
  let u: Float32Array | null = null;
  let pN = 0;
  // [N, iterations] pairs, flat: no destructuring or spread here, this function also runs from its source in the worker
  const levels = [32, 80, 64, 80, 128, 120];
  for (let lv = 0; lv < levels.length; lv += 2) {
    const N = levels[lv] as number;
    const it = levels[lv + 1] as number;
    const a = maskAt(N);
    const m = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) m[i] = (a[i] as number) > 127 ? 1 : 0;
    const h = R / N;
    const c = 4 * h * h;
    const nu = new Float32Array(N * N);
    if (u) {
      const prev = u;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i = y * N + x;
          nu[i] = m[i] ? (prev[(y >> 1) * pN + (x >> 1)] as number) : 0;
        }
      }
    }
    for (let k = 0; k < it; k++) {
      for (let y = 1; y < N - 1; y++) {
        for (let x = 1; x < N - 1; x++) {
          const i = y * N + x;
          if (!m[i]) continue;
          const v =
            ((nu[i - 1] as number) +
              (nu[i + 1] as number) +
              (nu[i - N] as number) +
              (nu[i + N] as number) +
              c) *
            0.25;
          const cur = nu[i] as number;
          nu[i] = cur + 1.85 * (v - cur);
        }
      }
    }
    u = nu;
    pN = N;
  }
  return u as Float32Array;
}

/** RGBA pixels of one layer: P × P over the region (y0, R), lit as felt or vinyl, with the page's grain (seed 7). */
export function shade(
  u: Float32Array,
  alpha: Uint8Array | Uint8ClampedArray,
  hex: string,
  P: number,
  mat: Material,
  y0: number,
  R: number,
): Uint8ClampedArray {
  const G = 128;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const s2l = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const l2s = (x: number) => {
    const v = clamp(x, 0, 1);
    return 255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
  };
  const n = parseInt(hex.slice(1), 16);
  const alb = [s2l((n >> 16) & 255), s2l((n >> 8) & 255), s2l(n & 255)];
  const o = new Uint8ClampedArray(P * P * 4);
  const puff = mat === 'vinyl' ? 0.75 : 0.6;
  // light and half vectors, normalised as on the page (no spread: this function also runs from its source in the worker)
  const ln = Math.hypot(-0.45, -0.72, 0.55);
  const L0 = -0.45 / ln;
  const L1 = -0.72 / ln;
  const L2 = 0.55 / ln;
  const hn = Math.hypot(L0, L1, L2 + 1);
  const H0 = L0 / hn;
  const H1 = L1 / hn;
  const H2 = (L2 + 1) / hn;
  const U = (ux: number, uy: number) => {
    const gx = clamp(ux, 0, G - 1.001);
    const gy = clamp(uy, 0, G - 1.001);
    const x = gx | 0;
    const y = gy | 0;
    const fx = gx - x;
    const fy = gy - y;
    const i = y * G + x;
    return (
      ((u[i] as number) * (1 - fx) + (u[i + 1] as number) * fx) * (1 - fy) +
      ((u[i + G] as number) * (1 - fx) + (u[i + G + 1] as number) * fx) * fy
    );
  };
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const h = R / G;
  for (let py = 0; py < P; py++) {
    for (let px = 0; px < P; px++) {
      const j = (py * P + px) * 4;
      const al = alpha[py * P + px] as number;
      if (!al) continue;
      const gx = ((px + 0.5) / P) * G - 0.5;
      const gy = ((py + 0.5) / P) * G - 0.5;
      const su = Math.max(Math.sqrt(Math.max(U(gx, gy), 0)), 1.2);
      const dux = (U(gx + 1, gy) - U(gx - 1, gy)) / (2 * h);
      const duy = (U(gx, gy + 1) - U(gx, gy - 1)) / (2 * h);
      let nx = (-puff * dux) / (2 * su);
      let ny = (-puff * duy) / (2 * su);
      let nz = 1;
      const nl = Math.hypot(nx, ny, nz);
      nx /= nl;
      ny /= nl;
      nz /= nl;
      const ndl = nx * L0 + ny * L1 + nz * L2;
      const wrap = Math.max(0, (ndl + 0.45) / 1.45);
      const sky = 0.5 - 0.5 * ny;
      const bounce = Math.max(0, ny) * 0.18;
      const yU = y0 + ((py + 0.5) / P) * R;
      const ao = 1 - 0.32 * clamp((yU - 84) / 24, 0, 1) * Math.max(0, 0.3 + ny);
      const k = (0.3 * (0.6 + 0.4 * sky) + 0.78 * wrap) * ao;
      const fres = (1 - nz) ** 2.2;
      let add = 0;
      if (mat === 'vinyl') {
        const ndh = Math.max(0, nx * H0 + ny * H1 + nz * H2);
        add = ndh ** 24 * 0.28 + ndh ** 180 * 0.6 + fres * 0.06;
      } else add = fres * 0.16;
      const grain = mat === 'vinyl' ? (rnd() - 0.5) * 0.015 : (rnd() - 0.5) * 0.07;
      for (let ch = 0; ch < 3; ch++) {
        const a = alb[ch] as number;
        const b = bounce * (ch === 0 ? 1 : ch === 1 ? 0.85 : 0.6) * a;
        o[j + ch] = l2s(a * k * (1 + grain) + b + add);
      }
      o[j + 3] = al;
    }
  }
  return o;
}

// ── Browser side: region, masks, caches. Not reachable in jsdom (no canvas, no getBBox): checked side by side. ──
// The caches belong to the document runtime, shared by every bundled copy on the page.

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Square region around the path's bbox, 2 units of padding, as on the page (SVG getBBox, main thread only). */
export function region(d: string): [number, number, number] {
  const C = getRuntime().caches;
  const cached = C.reg.get(d);
  if (cached) return cached;
  let measurePath = C.measure;
  if (!measurePath?.isConnected) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    measurePath = document.createElementNS(SVG_NS, 'path');
    C.measure = measurePath;
    svg.appendChild(measurePath);
    document.body.appendChild(svg);
  }
  measurePath.setAttribute('d', d);
  const b = measurePath.getBBox();
  const pad = 2;
  const R = Math.ceil(Math.max(b.width, b.height) + 2 * pad);
  const r: [number, number, number] = [
    Math.floor(b.x + b.width / 2 - R / 2),
    Math.floor(b.y + b.height / 2 - R / 2),
    R,
  ];
  C.reg.set(d, r);
  return r;
}

/** Coverage alpha of the path over the region at N × N (canvas fill, the page's rmask). */
export function rmaskAlpha(d: string, x0: number, y0: number, R: number, N: number) {
  const { ctx } = createCanvas(N);
  ctx.scale(N / R, N / R);
  ctx.translate(-x0, -y0);
  ctx.fill(new Path2D(d));
  const rgba = ctx.getImageData(0, 0, N, N).data;
  const a = new Uint8ClampedArray(N * N);
  for (let i = 0; i < N * N; i++) a[i] = rgba[i * 4 + 3] as number;
  return a;
}

export interface Baked {
  /** cache key: retain it while an <image> shows this url */
  key: string;
  url: string;
  x0: number;
  y0: number;
  R: number;
}

// 64 height fields and 256 baked layers (06 §9) on the runtime; evicted object URLs are revoked.
const caches = () => getRuntime().caches;
/** Marks a bake as shown: its object URL is not revoked until every retain is released. */
export const retain = (key: string) => {
  const R = caches().retain;
  R.set(key, (R.get(key) ?? 0) + 1);
};
export const release = (key: string) => {
  const R = caches().retain;
  const n = (R.get(key) ?? 0) - 1;
  if (n > 0) R.set(key, n);
  else R.delete(key);
};
export const isRetained = (key: string) => caches().retain.has(key);
export const retainedCount = () => caches().retain.size;

/** Bump with any change to the shading or the shapes, so copies with different shading never share bitmaps. */
export const LOOK_VERSION = 'v14.1';
export const bakeKey = (d: string, col: string, P: number, mat: Material) =>
  `${LOOK_VERSION}|${d}|${col}|${P}|${mat}`;

export function solveCached(d: string, x0: number, y0: number, R: number) {
  const { hc } = caches();
  let u = hc.get(d);
  if (!u) {
    u = solveField(N => rmaskAlpha(d, x0, y0, R, N), R);
    hc.set(d, u);
  }
  return u;
}

async function encode(rgba: Uint8ClampedArray, P: number) {
  const { ctx, toBlob } = createCanvas(P);
  ctx.putImageData(new ImageData(rgba as Uint8ClampedArray<ArrayBuffer>, P, P), 0, 0);
  return toBlob();
}

export type BakeRunner = (job: {
  d: string;
  col: string;
  P: number;
  mat: Material;
  region: [number, number, number];
}) => Promise<Blob>;

/** Main-thread runner: the page's bake, encoded to a PNG blob instead of a data URL (same pixels). */
export const bakeOnMain: BakeRunner = async ({ d, col, P, mat, region: [x0, y0, R] }) =>
  encode(shade(solveCached(d, x0, y0, R), rmaskAlpha(d, x0, y0, R, P), col, P, mat, y0, R), P);

/** One layer, cached by look version, path, colour, pixel size and material. Overlapping calls share one bake;
 *  a failed bake is forgotten so the next call retries. */
export function bake(
  d: string,
  col: string,
  P: number,
  mat: Material,
  run: BakeRunner = bakeOnMain,
): Promise<Baked> {
  const key = bakeKey(d, col, P, mat);
  const { bc: BC, inflight: INFLIGHT } = caches();
  const hit = BC.get(key);
  if (hit) return Promise.resolve(hit);
  const pending = INFLIGHT.get(key);
  if (pending) return pending;
  const reg = region(d);
  const p = run({ d, col, P, mat, region: reg })
    .then(blob => {
      const res = { key, url: URL.createObjectURL(blob), x0: reg[0], y0: reg[1], R: reg[2] };
      BC.set(key, res);
      return res;
    })
    .finally(() => INFLIGHT.delete(key));
  INFLIGHT.set(key, p);
  return p;
}
