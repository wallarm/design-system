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
import { useLineChartActiveKey } from '../LineChart/hooks/useLineChartActiveKey';
import { useLineChartDataWarnings } from '../LineChart/hooks/useLineChartDataWarnings';
import { useLineChartZoomState } from '../LineChart/hooks/useLineChartZoomState';
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
} from '../LineChart/LineChartContext';
import { type AreaChartVariant, AreaChartVariantContext } from './AreaChartContext';
import { areaChartRootClasses } from './classes';

export interface AreaChartProps<T extends LineChartDatum = LineChartDatum>
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Long-form data array, one entry per X position. */
  data: T[];
  /** Schema describing each area drawn from `data`. */
  series: LineChartSeries<Extract<keyof T, string>>[];
  /** Key on each datum used as the X-axis value. */
  xKey: Extract<keyof T, string>;
  /**
   * Area chart variant.
   * - `'stacked'` (default): series stack cumulatively — each band starts where the previous ends.
   * - `'standard'`: series overlap from the baseline with transparency.
   */
  variant?: AreaChartVariant;
  /** Controlled hover key — pass alongside `onActiveKeyChange` for cross-chart sync. */
  activeKey?: string | null;
  onActiveKeyChange?: (key: string | null) => void;
  /** Controlled set of `series.key` values to hide from the plot. */
  filteredKeys?: string[];
  /** Fired after the user confirms a brush selection. */
  onZoomChange?: (range: LineChartZoomRange | null) => void;
  /** Charts that share a `syncId` synchronise their tooltip cursor. */
  syncId?: string | number;
  /** How sibling `syncId` charts match X positions. */
  syncMethod?: SyncMethod;
}

export function AreaChart<T extends LineChartDatum = LineChartDatum>({
  data,
  series,
  xKey,
  variant = 'stacked',
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
}: AreaChartProps<T>): ReactElement {
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
            <AreaChartVariantContext.Provider value={variant}>
              <TestIdProvider value={testId}>
                <div
                  {...props}
                  ref={setRootRef}
                  data-slot='area-chart'
                  data-testid={testId}
                  className={cn(areaChartRootClasses, className)}
                >
                  {children}
                </div>
              </TestIdProvider>
            </AreaChartVariantContext.Provider>
          </LineChartZoomContext.Provider>
        </LineChartSelectionContext.Provider>
      </LineChartActiveContext.Provider>
    </LineChartDataContext.Provider>
  );
}

AreaChart.displayName = 'AreaChart';
