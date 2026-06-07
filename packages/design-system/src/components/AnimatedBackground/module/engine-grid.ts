export interface Dot {
  x: number;
  y: number;
}

export function buildGrid(w: number, h: number, sp: number): Dot[] {
  const cap = 20_000;
  const safeSp = Math.max(sp, Math.sqrt((w * h) / cap));
  const a: Dot[] = [];
  for (let y = safeSp / 2; y < h; y += safeSp)
    for (let x = safeSp / 2; x < w; x += safeSp) a.push({ x, y });
  return a;
}

export function sweepX(t: number, w: number, period: number): number {
  return ((t % period) / period) * (w + 140) - 70;
}
