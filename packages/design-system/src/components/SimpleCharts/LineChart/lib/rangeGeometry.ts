/** An X value of a LineChart datum (`xKey` value): a timestamp/number or a category string. */
export type RangeX = number | string;

/** Pixel edges of a highlighted range. A clamped edge sits on the plot edge. */
export interface RangeEdges {
  x1: number;
  x2: number;
  clampedStart: boolean;
  clampedEnd: boolean;
}

interface RangeBounds {
  from: RangeX;
  to?: RangeX;
}

const isAscendingNumbers = (xs: readonly RangeX[]): xs is readonly number[] =>
  xs.every((x, i) => typeof x === 'number' && (i === 0 || x > (xs[i - 1] as number)));

/** Pixel of numeric value `v` (inside `[xs[0], xs[last]]`), interpolated between its neighbours. */
const interpolatePixel = (
  v: number,
  xs: readonly number[],
  pixelOf: (index: number) => number | undefined,
): number | undefined => {
  const above = xs.findIndex(x => x > v);
  const i = above === -1 ? xs.length - 1 : Math.max(0, above - 1);
  const j = Math.min(i + 1, xs.length - 1);
  const p1 = pixelOf(i);
  const p2 = pixelOf(j);
  const a = xs[i];
  const b = xs[j];
  if (p1 === undefined || p2 === undefined || a === undefined || b === undefined) return undefined;
  if (i === j) return p1;
  return p1 + ((v - a) / (b - a)) * (p2 - p1);
};

/**
 * Pixel edges of a range from the data X values (not the scale domain — the default X axis is a
 * category axis that only knows exact data values). Numeric X is interpolated between the
 * bracketing data points and must be strictly ascending; string X must match a datum exactly.
 * Edges at or beyond the first/last datum clamp to the plot edges; `to` omitted = ongoing.
 * Returns `null` when nothing can be drawn.
 */
export function resolveRangeEdges({
  from,
  to,
  xs,
  pixelOf,
  plotLeft,
  plotRight,
}: {
  from: RangeX;
  to?: RangeX;
  xs: readonly RangeX[];
  pixelOf: (index: number) => number | undefined;
  plotLeft: number;
  plotRight: number;
}): RangeEdges | null {
  if (xs.length < 2) return null;

  if (isAscendingNumbers(xs)) {
    if (typeof from !== 'number' || (to !== undefined && typeof to !== 'number')) return null;
    const end = to ?? Number.POSITIVE_INFINITY;
    const first = xs[0] ?? 0;
    const last = xs[xs.length - 1] ?? 0;
    if (from > end || from > last || end < first) return null;
    const clampedStart = from <= first;
    const clampedEnd = end >= last;
    const x1 = clampedStart ? plotLeft : interpolatePixel(from, xs, pixelOf);
    const x2 = clampedEnd ? plotRight : interpolatePixel(end, xs, pixelOf);
    if (x1 === undefined || x2 === undefined) return null;
    return { x1, x2, clampedStart, clampedEnd };
  }

  if (xs.some(x => typeof x !== 'string')) return null;
  const fromIndex = xs.indexOf(from);
  const toIndex = to === undefined ? xs.length - 1 : xs.indexOf(to);
  if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) return null;
  const clampedStart = fromIndex === 0;
  const clampedEnd = toIndex === xs.length - 1;
  const x1 = clampedStart ? plotLeft : pixelOf(fromIndex);
  const x2 = clampedEnd ? plotRight : pixelOf(toIndex);
  if (x1 === undefined || x2 === undefined) return null;
  return { x1, x2, clampedStart, clampedEnd };
}

/**
 * Whether datum X `x` lies inside the range (inclusive; `to` omitted = ongoing). Numeric X compares
 * values; string X compares indexes in `xs` between the matched edges.
 */
export function isInRange(x: RangeX, { from, to }: RangeBounds, xs: readonly RangeX[]): boolean {
  if (typeof x === 'number') {
    if (typeof from !== 'number' || (to !== undefined && typeof to !== 'number')) return false;
    return x >= from && (to === undefined || x <= to);
  }
  const index = xs.indexOf(x);
  const fromIndex = xs.indexOf(from);
  const toIndex = to === undefined ? xs.length - 1 : xs.indexOf(to);
  if (index === -1 || fromIndex === -1 || toIndex === -1) return false;
  return index >= fromIndex && index <= toIndex;
}

/**
 * Pairs of range keys whose numeric `[from, to]` intervals overlap (touching counts; `to` omitted =
 * ongoing). Ranges with string edges are skipped — they cannot be ordered without the data.
 */
export function findOverlappingRanges(
  ranges: readonly ({ key: string } & RangeBounds)[],
): [string, string][] {
  const numeric = ranges.flatMap(({ key, from, to }) =>
    typeof from === 'number' && (to === undefined || typeof to === 'number')
      ? [{ key, from, to: to ?? Number.POSITIVE_INFINITY }]
      : [],
  );
  const pairs: [string, string][] = [];
  numeric.forEach((a, i) => {
    for (const b of numeric.slice(i + 1)) {
      if (a.from <= b.to && b.from <= a.to) pairs.push([a.key, b.key]);
    }
  });
  return pairs;
}

export interface RangeLabelLayout {
  start: { x: number; anchor: 'end' } | null;
  end: { x: number; anchor: 'start' | 'end' } | null;
}

/**
 * Where to draw the start/end labels of a range, or `null` to hide one. No labels when 2+ ranges
 * are visible. Start label sits outside the left edge (right-aligned, `gap` away), end label
 * outside the right edge; an ongoing end label sits inside the range, right-aligned to the plot.
 * A label that would leave the plot, or collide with the other one, is hidden; a clamped start
 * has no label.
 */
export function layoutRangeLabels({
  edges,
  ongoing,
  visibleRangeCount,
  startWidth,
  endWidth,
  plotLeft,
  plotRight,
  gap,
}: {
  edges: RangeEdges;
  ongoing: boolean;
  visibleRangeCount: number;
  startWidth: number;
  endWidth: number;
  plotLeft: number;
  plotRight: number;
  gap: number;
}): RangeLabelLayout {
  if (visibleRangeCount >= 2) return { start: null, end: null };

  const startX = edges.x1 - gap;
  const start =
    !edges.clampedStart && startX - startWidth >= plotLeft
      ? { x: startX, anchor: 'end' as const }
      : null;

  if (ongoing) {
    // Inside the range: its left side must clear the start label by `gap`, i.e. not cross x1.
    const fits = plotRight - endWidth >= edges.x1;
    return { start, end: fits ? { x: plotRight, anchor: 'end' } : null };
  }

  const endX = edges.x2 + gap;
  return { start, end: endX + endWidth <= plotRight ? { x: endX, anchor: 'start' } : null };
}
