import type { HTMLAttributes, ReactElement, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { useLineChartActiveKey } from '../LineChart/hooks/useLineChartActiveKey';
import { useLineChartDataWarnings } from '../LineChart/hooks/useLineChartDataWarnings';
import {
  EMPTY_HIDDEN_SET,
  LineChartActiveContext,
  LineChartDataContext,
  type LineChartDataContextValue,
  type LineChartDatum,
  type LineChartSeries,
} from '../LineChart/LineChartContext';
import { barChartRootClasses } from './classes';

// The bar chart has no zoom brush, so nothing ever emits a zoom range.
const noop = () => undefined;

/**
 * Generic over the datum shape, as `LineChart<T>`: pass a concrete datum interface and
 * `yKey` / `series[].key` become compile-time-checked keys of it.
 */
export interface BarChartProps<T extends LineChartDatum = LineChartDatum>
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** One entry per bar (category), top to bottom. The chart does not sort them. */
  data: T[];
  /**
   * The parts each bar is split into, in legend order — the first one starts the bar, on the left.
   * The same schema drives the legend, the parts and the hover popover rows.
   */
  series: LineChartSeries<Extract<keyof T, string>>[];
  /** Key on each datum used as the category label on the Y axis (a host, an endpoint, …). */
  yKey: Extract<keyof T, string>;
}

/**
 * Horizontal stacked bars: a bar per category, split by series. Built on the `LineChart`
 * contexts, so `LineChartLegend` / `LineChartLegendItem` compose inside it unchanged.
 */
export function BarChart<T extends LineChartDatum = LineChartDatum>({
  data,
  series,
  yKey,
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}: BarChartProps<T>): ReactElement {
  const seriesByKey = new Map<string, LineChartSeries>(series.map(s => [s.key, s]));

  // Categories keep the caller's order — no ascending-order warning.
  useLineChartDataWarnings({ data, series, xKey: yKey, ordered: false });

  const { activeKey, setActiveKey } = useLineChartActiveKey({
    controlledActiveKey: undefined,
    onActiveKeyChange: undefined,
    seriesByKey,
  });

  // The shared context calls the category key `xKey` — it is the key the popover heading reads.
  const dataValue: LineChartDataContextValue = {
    data,
    series,
    seriesByKey,
    xKey: yKey,
    hiddenSet: EMPTY_HIDDEN_SET,
    setActiveKey,
    emitZoom: noop,
    syncId: undefined,
    syncMethod: undefined,
  };

  return (
    <LineChartDataContext.Provider value={dataValue}>
      <LineChartActiveContext.Provider value={{ activeKey }}>
        <TestIdProvider value={testId}>
          <div
            {...props}
            ref={ref}
            data-slot='bar-chart'
            data-testid={testId}
            className={cn(barChartRootClasses, className)}
          >
            {children}
          </div>
        </TestIdProvider>
      </LineChartActiveContext.Provider>
    </LineChartDataContext.Provider>
  );
}

BarChart.displayName = 'BarChart';
