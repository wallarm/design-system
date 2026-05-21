import {
  type HTMLAttributes,
  type ReactElement,
  type Ref,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import type { SyncMethod } from 'recharts/types/synchronisation/types';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { lineChartRootClasses } from './classes';
import { useLineChartActiveKey } from './hooks/useLineChartActiveKey';
import { useLineChartDataWarnings } from './hooks/useLineChartDataWarnings';
import { useLineChartZoomState } from './hooks/useLineChartZoomState';
import {
  EMPTY_HIDDEN_SET,
  LineChartActiveContext,
  type LineChartActiveContextValue,
  LineChartDataContext,
  type LineChartDataContextValue,
  type LineChartDatum,
  LineChartSelectionContext,
  type LineChartSelectionContextValue,
  type LineChartSeries,
  LineChartZoomContext,
  type LineChartZoomContextValue,
  type LineChartZoomRange,
} from './LineChartContext';

/**
 * Generic over the datum shape so `xKey` and `series[].key` are checked at
 * compile time against the actual data interface. When `T` is left at the
 * default `LineChartDatum`, the constraints collapse to `string` and the API
 * keeps its untyped form — the safety only kicks in when callers pass a
 * concrete datum interface.
 *
 * ```ts
 * interface RequestRow { timestamp: number; requests: number; errors: number }
 *
 * <LineChart<RequestRow>
 *   data={rows}
 *   xKey='timestamp'                                 // ✅ valid keyof T
 *   series={[{ key: 'errors', label: 'Errors' }]}    // ✅ valid keyof T
 * />
 * <LineChart<RequestRow> data={rows} xKey='timetamp' /> // ❌ Type error
 * ```
 */
export interface LineChartProps<T extends LineChartDatum = LineChartDatum>
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Long-form data array, one entry per X position. */
  data: T[];
  /** Schema describing each line drawn from `data`. */
  series: LineChartSeries<Extract<keyof T, string>>[];
  /**
   * Key on each datum used as the X-axis value. Required — a silent fallback
   * would hide key-name typos until the chart renders empty.
   */
  xKey: Extract<keyof T, string>;
  /**
   * Controlled hover key — pass alongside `onActiveKeyChange` for cross-chart
   * sync.
   *
   * **Heads-up:** if the controlled value points at a series key that no
   * longer exists in `series` (filter, schema change, refresh), the chart
   * pushes `null` back through `onActiveKeyChange` so sibling charts stop
   * highlighting a stale key. If you wire `activeKey` to external state, the
   * snap-to-null write will arrive as a normal state change — do not be
   * surprised when your value resets after a series disappears.
   */
  activeKey?: string | null;
  onActiveKeyChange?: (key: string | null) => void;
  /** Controlled set of `series.key` values to hide from the plot. */
  filteredKeys?: string[];
  /** Fired after the user confirms a brush selection. */
  onZoomChange?: (range: LineChartZoomRange | null) => void;
  /**
   * Charts that share a `syncId` synchronise their tooltip cursor and brush
   * via recharts' built-in middleware — hovering one chart highlights the
   * matching X on every sibling chart with the same id. Pair with `activeKey`
   * + `onActiveKeyChange` if you also want the *series* highlight to sync.
   */
  syncId?: string | number;
  /**
   * How sibling `syncId` charts match X positions. Defaults to `'index'`
   * (Recharts' default). Use `'value'` when the synced charts have different
   * dataset lengths but share categorical X values.
   *
   * @see {@link https://recharts.github.io/en-US/examples/SynchronizedAreaChart/ Recharts synchronisation example}
   */
  syncMethod?: SyncMethod;
}

export function LineChart<T extends LineChartDatum = LineChartDatum>({
  data,
  series,
  xKey,
  activeKey: controlledActiveKey,
  onActiveKeyChange,
  filteredKeys,
  onZoomChange,
  syncId,
  syncMethod,
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}: LineChartProps<T>): ReactElement {
  const seriesByKey = useMemo<Map<string, LineChartSeries>>(() => {
    const map = new Map<string, LineChartSeries>();
    for (const s of series) map.set(s.key, s);
    return map;
  }, [series]);

  useLineChartDataWarnings({ data, series, xKey });

  const { activeKey, setActiveKey } = useLineChartActiveKey({
    controlledActiveKey,
    onActiveKeyChange,
    seriesByKey,
  });

  // Consumer callback held behind a ref so `emitZoom` (and `useLineChartZoomState`'s
  // `confirmZoom`) stay referentially stable. Otherwise an inline
  // `onZoomChange` invalidates `dataValue` and re-renders every context
  // consumer on each parent render.
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;
  const emitZoom = useCallback((range: LineChartZoomRange | null) => {
    onZoomChangeRef.current?.(range);
  }, []);

  const zoom = useLineChartZoomState({ data, xKey, onZoomChangeRef });

  const hiddenSet = useMemo<ReadonlySet<string>>(() => {
    if (!filteredKeys?.length) return EMPTY_HIDDEN_SET;
    const set = new Set<string>();
    for (const key of filteredKeys) {
      if (seriesByKey.has(key)) set.add(key);
    }
    return set.size > 0 ? set : EMPTY_HIDDEN_SET;
  }, [filteredKeys, seriesByKey]);

  const dataValue = useMemo<LineChartDataContextValue>(
    () => ({
      data,
      series,
      seriesByKey,
      xKey,
      hiddenSet,
      setActiveKey,
      emitZoom,
      syncId,
      syncMethod,
    }),
    [data, series, seriesByKey, xKey, hiddenSet, setActiveKey, emitZoom, syncId, syncMethod],
  );

  const activeKeyContextValue = useMemo<LineChartActiveContextValue>(
    () => ({ activeKey }),
    [activeKey],
  );

  const selectionValue = useMemo<LineChartSelectionContextValue>(
    () => ({ hiddenSet }),
    [hiddenSet],
  );

  // Scopes the pending-zoom keyboard handler so it ignores keystrokes from
  // sibling charts on the page.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [ref],
  );

  const {
    enabled: zoomEnabled,
    drag: zoomDrag,
    pending: zoomPending,
    registerEnabled,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    confirmZoom,
    cancelPending,
  } = zoom;

  const zoomContextValue = useMemo<LineChartZoomContextValue>(
    () => ({
      enabled: zoomEnabled,
      drag: zoomDrag,
      pending: zoomPending,
      rootRef,
      registerEnabled,
      startDrag,
      updateDrag,
      endDrag,
      cancelDrag,
      confirmZoom,
      cancelPending,
    }),
    [
      zoomEnabled,
      zoomDrag,
      zoomPending,
      registerEnabled,
      startDrag,
      updateDrag,
      endDrag,
      cancelDrag,
      confirmZoom,
      cancelPending,
    ],
  );

  return (
    <LineChartDataContext.Provider value={dataValue}>
      <LineChartActiveContext.Provider value={activeKeyContextValue}>
        <LineChartSelectionContext.Provider value={selectionValue}>
          <LineChartZoomContext.Provider value={zoomContextValue}>
            <TestIdProvider value={testId}>
              <div
                {...props}
                ref={setRootRef}
                data-slot='line-chart'
                data-testid={testId}
                className={cn(lineChartRootClasses, className)}
              >
                {children}
              </div>
            </TestIdProvider>
          </LineChartZoomContext.Provider>
        </LineChartSelectionContext.Provider>
      </LineChartActiveContext.Provider>
    </LineChartDataContext.Provider>
  );
}

LineChart.displayName = 'LineChart';
