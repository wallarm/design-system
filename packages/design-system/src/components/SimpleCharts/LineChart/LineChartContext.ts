import { createContext, type RefObject } from 'react';
import type { SyncMethod } from 'recharts/types/synchronisation/types';
import { makeIsHoverSyncTarget } from '../lib/hoverSync';
import type { ChartColor } from '../types';

/**
 * A single point on the X axis. Extra keys are series values.
 *
 * The loose default form is `Record<string, …>` — pass a concrete interface
 * (e.g. `interface MyDatum { timestamp: number; requests: number }`) to gain
 * compile-time safety on `xKey` and `series[].key`. See `LineChartProps<T>`.
 */
export type LineChartDatum = Record<string, number | string | null | undefined>;

/**
 * Series schema. `K` is the literal-string union of valid keys; defaults to
 * `string` so untyped callers keep the loose form. When `LineChartProps<T>`
 * is parameterised with a concrete `T`, `K` collapses to `Extract<keyof T,
 * string>` and a typo in `key` becomes a compile error rather than a
 * dev-mode `console.warn`.
 */
export interface LineChartSeries<K extends string = string> {
  /**
   * Stable identity. Used as the lookup key on each `LineChartDatum`, the join key
   * for legend/line/tooltip sync, and the React reconciliation key. Must be unique
   * within `series`.
   */
  key: K;
  /** Visible label rendered by the legend and the tooltip rows. */
  label: string;
  /**
   * Series colour. Either a built-in palette token (`'brand'`, `'red'`, …) or
   * any CSS colour string (`'var(--color-violet-500)'`, `'#8b5cf6'`,
   * `'oklch(…)'`). Drives both the line stroke and the legend/tooltip dot — a
   * single value keeps the two surfaces in sync. Defaults to `'slate'`.
   */
  color?: ChartColor | (string & {});
  /** Visual line style. Defaults to `'solid'`. */
  variant?: 'solid' | 'dashed';
}

export interface LineChartZoomRange {
  /** Inclusive index into `data`. */
  fromIndex: number;
  /** Inclusive index into `data`. */
  toIndex: number;
  /** The `xKey` value at `fromIndex`. */
  from: number | string;
  /** The `xKey` value at `toIndex`. */
  to: number | string;
}

/**
 * Legend's internal row vs column layout. Pair with the wrapping layout the
 * consumer chooses: `'horizontal'` for top/bottom JSX-order placement,
 * `'vertical'` when wrapping body+legend in an `<HStack>` for left/right.
 */
export type LineChartLegendOrientation = 'horizontal' | 'vertical';

/** Static chart shape — recomputes only when data/series/filter changes. */
export interface LineChartDataContextValue {
  data: LineChartDatum[];
  series: LineChartSeries[];
  seriesByKey: Map<string, LineChartSeries>;
  xKey: string;
  hiddenSet: ReadonlySet<string>;
  setActiveKey: (key: string | null) => void;
  emitZoom: (range: LineChartZoomRange | null) => void;
  /**
   * Pair of charts that share a `syncId` get their tooltip cursor + brush
   * synchronised by recharts' own redux middleware. `LineChartBody` forwards
   * both values to `<RechartsLineChart>`; the chart itself does not read them.
   */
  syncId: string | number | undefined;
  syncMethod: SyncMethod | undefined;
}

/**
 * Active *series* — set by legend hover/focus. Drives line dimming and the
 * legend item's `aria-current`/`data-active`. Cross-chart sync of the *cursor
 * X* (tooltip + brush) is handled by recharts' built-in `syncId` mechanism on
 * `<LineChart>` — only the series highlight needs custom controlled state, so
 * the index has no equivalent context.
 */
export interface LineChartActiveContextValue {
  activeKey: string | null;
}

/** Set of `series.key` values that should be hidden from the plot and tooltip. */
export interface LineChartSelectionContextValue {
  hiddenSet: ReadonlySet<string>;
}

/** In-progress zoom selection. Indices are inclusive into `data`. */
export interface LineChartZoomDragState {
  startIndex: number;
  endIndex: number;
  /** Viewport coords of the latest pointer position — drives the floating popover. */
  clientX: number;
  clientY: number;
}

/**
 * Released-but-unconfirmed zoom selection. The drag has ended, the gray
 * selection rectangle stays, and the popover surfaces a "Zoom in" button for
 * the user to confirm or dismiss. Position is locked at the cursor release.
 */
export interface LineChartZoomPendingState {
  range: LineChartZoomRange;
  clientX: number;
  clientY: number;
}

/**
 * Zoom-drag state lives in its own context so the body re-renders on every
 * mousemove frame without dragging the whole tree (static contexts like
 * `LineChartDataContext` stay quiet). `enabled` flips when `LineChartZoomBrush`
 * is mounted — the body uses it to decide whether to capture mousedown.
 *
 * The flow is two-phase: `drag` while the mouse button is held, then `pending`
 * once it releases. `pending` is what the Figma confirm popover renders against
 * — committing fires `onZoomChange`, dismissing just clears the state.
 */
export interface LineChartZoomContextValue {
  enabled: boolean;
  drag: LineChartZoomDragState | null;
  pending: LineChartZoomPendingState | null;
  /**
   * Ref to the owning chart root. Scopes the pending-state Enter/Escape
   * handler so it only reacts to keystrokes from within *this* chart, even
   * when several charts share the page (e.g. cross-chart hover sync).
   */
  rootRef: RefObject<HTMLDivElement | null>;
  /** Called by `LineChartZoomBrush` on mount to opt the chart into zoom mode. */
  registerEnabled: () => () => void;
  startDrag: (index: number, clientX: number, clientY: number) => void;
  updateDrag: (index: number, clientX: number, clientY: number) => void;
  /** Releases the drag — moves it into `pending` for the user to confirm. */
  endDrag: () => void;
  /** Discards the in-progress drag without emitting. */
  cancelDrag: () => void;
  /** Commits the pending selection as a zoom range and clears it. */
  confirmZoom: () => void;
  /** Dismisses the pending selection without emitting. */
  cancelPending: () => void;
}

/** Per-legend-row context — published by `LineChartLegendItem` to its children. */
export interface LineChartItemContextValue {
  seriesKey: string;
  selected: boolean;
  interactive: boolean;
  active: boolean;
  color: ChartColor | string | undefined;
  label: string | undefined;
}

export const EMPTY_HIDDEN_SET: ReadonlySet<string> = new Set();

export const isHoverSyncTarget = makeIsHoverSyncTarget(['line-chart-legend-item']);

export const LineChartDataContext = createContext<LineChartDataContextValue | null>(null);

export const LineChartActiveContext = createContext<LineChartActiveContextValue>({
  activeKey: null,
});

export const LineChartSelectionContext = createContext<LineChartSelectionContextValue>({
  hiddenSet: EMPTY_HIDDEN_SET,
});

export const LineChartZoomContext = createContext<LineChartZoomContextValue | null>(null);

export const LineChartItemContext = createContext<LineChartItemContextValue | null>(null);
