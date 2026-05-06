import { createContext } from 'react';
import { makeIsHoverSyncTarget } from '../lib/hoverSync';
import type { ChartColor } from '../types';

export interface PieChartDatum {
  /**
   * Stable identity string — **never rendered by the component**. Used as the join key
   * for percent lookup, bidirectional hover sync between slice and legend row, recharts'
   * sector reconciliation, and the `data-name` E2E hook on slice + row DOM.
   *
   * Must be unique within `data` — duplicates trigger a dev-only warning and produce
   * incorrect percentages, ambiguous hover, and unstable rendering. The visible label
   * comes from caller JSX inside `<PieChartLegendItem>` (e.g. `<Badge>{row.name}</Badge>`),
   * so this string can be a slug, ID, or any opaque key when display ≠ identity.
   */
  name: string;
  /**
   * Slice magnitude. Non-finite or negative values are coerced to `0` before reaching
   * recharts (which rejects negatives). Percent = `value / total`.
   */
  value: number;
  /**
   * Built-in palette token. Resolves to a slice-fill CSS variable via `PIE_SLICE_FILL`
   * in `constants.ts` — most colours map to `--color-{color}-500`, with documented
   * exceptions for `'brand'` and `'slate'`. Ignored when `className` is set.
   */
  color?: ChartColor;
  /**
   * Tailwind `fill-*` utility applied directly to the slice `<path>`. Wins over `color`.
   * `bg-*` does NOT work — slices are SVG paths, not divs.
   */
  className?: string;
}

/** Static chart shape — recomputes only when data/total changes. */
export interface PieChartDataContextValue {
  data: PieChartDatum[];
  byName: Map<string, PieChartDatum>;
  total: number;
  isValidTotal: boolean;
  setActive: (name: string | null) => void;
}

/** Volatile hover state — recomputes on every hover, kept separate so static
 * consumers (donut layout, legend rows that don't care about active) skip
 * re-rendering when only the hover target changes. */
export interface PieChartActiveContextValue {
  activeName: string | null;
}

/** Multi-selection set pushed by the root. Empty when no selection is active. */
export interface PieChartSelectionContextValue {
  selectedSet: Set<string>;
}

export interface PieChartItemContextValue {
  ratio: number;
  selected: boolean;
  interactive: boolean;
  name: string;
  active: boolean;
}

export const EMPTY_SELECTION: Set<string> = new Set();

export const isHoverSyncTarget = makeIsHoverSyncTarget([
  'pie-chart-legend-item',
  'pie-chart-slice',
]);

export const PieChartDataContext = createContext<PieChartDataContextValue | null>(null);
export const PieChartActiveContext = createContext<PieChartActiveContextValue>({
  activeName: null,
});
export const PieChartSelectionContext = createContext<PieChartSelectionContextValue>({
  selectedSet: EMPTY_SELECTION,
});
export const PieChartItemContext = createContext<PieChartItemContextValue | null>(null);
