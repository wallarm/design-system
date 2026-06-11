export interface Dot {
  x: number;
  y: number;
}

export interface GridResult {
  dots: Dot[];
  cols: number;
  sp: number;
}

export function buildGrid(w: number, h: number, sp: number): GridResult {
  const cap = 20_000;
  const safeSp = Math.max(sp, Math.sqrt((w * h) / cap));
  const a: Dot[] = [];

  let cols = 0;

  for (let y = safeSp / 2; y < h; y += safeSp) {
    let rowCols = 0;
    for (let x = safeSp / 2; x < w; x += safeSp) {
      a.push({ x, y });
      rowCols++;
    }
    if (cols === 0) cols = rowCols;
  }
  return { dots: a, cols, sp: safeSp };
}

export function sweepX(t: number, w: number, period: number): number {
  return ((t % period) / period) * (w + 140) - 70;
}
