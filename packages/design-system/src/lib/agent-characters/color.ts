import { COLORS } from './data.gen';

export function hexRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const luma = (h: string) => {
  const [r, g, b] = hexRgb(h);
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

/** Linear in sRGB, rounded per channel, as on the page. */
export function mix(a: string, b: string, t: number) {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return `#${x
    .map((v, i) =>
      Math.round(v + (y[i]! - v) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Unknown ids fall back to the second palette entry (cobalt), as on the page. */
export const hexOf = (id: string) => (COLORS.find(c => c.id === id) || COLORS[1]!).hex;
