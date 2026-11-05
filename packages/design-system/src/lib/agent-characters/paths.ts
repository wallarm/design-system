// Geometry helpers of the reference page (look v14), ported line for line: same rounding, same string output.
// All outlines are clockwise; holes are counter-clockwise.

export type Pt = [number, number];

export const r2 = (n: number) => Math.round(n * 100) / 100;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function ell(cx: number, cy: number, rx: number, ry = rx, ccw = false) {
  const s = ccw ? 0 : 1;
  return `M${r2(cx - rx)} ${r2(cy)}A${r2(rx)} ${r2(ry)} 0 1 ${s} ${r2(cx + rx)} ${r2(cy)}A${r2(rx)} ${r2(ry)} 0 1 ${s} ${r2(cx - rx)} ${r2(cy)}Z`;
}

export function rr(x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.min(radius, w / 2, h / 2);
  return `M${r2(x + r)} ${r2(y)}H${r2(x + w - r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x + w)} ${r2(y + r)}V${r2(y + h - r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x + w - r)} ${r2(y + h)}H${r2(x + r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x)} ${r2(y + h - r)}V${r2(y + r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x + r)} ${r2(y)}Z`;
}

export function smooth(p: Pt[]) {
  const n = p.length;
  // Indices wrap modulo n, so every point exists.
  let d = `M${r2(p[0]![0])} ${r2(p[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n]!;
    const p1 = p[i]!;
    const p2 = p[(i + 1) % n]!;
    const p3 = p[(i + 2) % n]!;
    d += `C${r2(p1[0] + (p2[0] - p0[0]) / 6)} ${r2(p1[1] + (p2[1] - p0[1]) / 6)} ${r2(p2[0] - (p3[0] - p1[0]) / 6)} ${r2(p2[1] - (p3[1] - p1[1]) / 6)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return `${d}Z`;
}

export function polar(cx: number, cy: number, rf: (a: number) => number, n = 96) {
  const p: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = rf(a);
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return smooth(p);
}

export function poly(p: Pt[]) {
  return `M${p.map(q => `${r2(q[0])} ${r2(q[1])}`).join('L')}Z`;
}

export function rotRect(cx: number, cy: number, w: number, h: number, ang: number) {
  const a = (ang * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const corners: Pt[] = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  return poly(corners.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]));
}

export function qpts(p0: Pt, c: Pt, p1: Pt, n = 14) {
  const o: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    o.push([
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1],
    ]);
  }
  return o;
}

export function cpts(p0: Pt, c1: Pt, c2: Pt, p1: Pt, n = 20) {
  const o: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    o.push([
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
    ]);
  }
  return o;
}

/** Thick polyline with round caps, clockwise. */
export function tube(pts: Pt[], w: number) {
  const h = w / 2;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    const p = pts[i]!;
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    L.push([p[0] - dy * h, p[1] + dx * h]);
    R.push([p[0] + dy * h, p[1] - dx * h]);
  }
  const r0 = R[0]!;
  let d = `M${r2(r0[0])} ${r2(r0[1])}`;
  for (const q of R.slice(1)) d += `L${r2(q[0])} ${r2(q[1])}`;
  const le = L[L.length - 1]!;
  d += `A${r2(h)} ${r2(h)} 0 0 1 ${r2(le[0])} ${r2(le[1])}`;
  for (const q of L.slice(0, -1).reverse()) d += `L${r2(q[0])} ${r2(q[1])}`;
  return `${d}A${r2(h)} ${r2(h)} 0 0 1 ${r2(r0[0])} ${r2(r0[1])}Z`;
}
