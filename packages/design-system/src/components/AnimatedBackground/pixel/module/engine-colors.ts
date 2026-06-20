export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const FALLBACK_DOT: RGB = { r: 69, g: 85, b: 108 };
export const FALLBACK_ACCENT: RGB = { r: 251, g: 44, b: 54 };
export const FALLBACK_CAUGHT: RGB = { r: 0, g: 201, b: 80 };
export const FALLBACK_BASE = '#f8fafc';

/** Number of discrete alpha levels in pre-computed palettes. */
export const ALPHA_STEPS = 16;

/** Pre-compute RGBA strings for 0-ALPHA_STEPS so the hot loop never allocates. */
export function buildPalette(rgb: RGB): string[] {
  const p: string[] = new Array(ALPHA_STEPS + 1);
  for (let i = 0; i <= ALPHA_STEPS; i++) {
    p[i] = `rgba(${rgb.r},${rgb.g},${rgb.b},${(i / ALPHA_STEPS).toFixed(3)})`;
  }
  return p;
}

/** Map a 0-1 alpha to the nearest palette index. */
export function alphaIdx(a: number): number {
  return Math.min(ALPHA_STEPS, (a * ALPHA_STEPS + 0.5) | 0);
}

export function parseColor(value: string): RGB | null {
  const v = value.trim();
  if (!v) return null;
  if (v[0] === '#') {
    let hex = v.slice(1);
    if (hex.length === 3)
      hex = hex
        .split('')
        .map(c => c + c)
        .join('');
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const m = v.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (m?.[1] && m[2] && m[3]) return { r: +m[1], g: +m[2], b: +m[3] };
  return null;
}
