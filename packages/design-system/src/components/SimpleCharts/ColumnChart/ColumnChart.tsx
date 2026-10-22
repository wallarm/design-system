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
import { columnChartRootClasses } from './classes';

// The column chart has no zoom brush, so nothing ever emits a zoom range.
const noop = () => undefined;

/**
 * Generic over the datum shape, as `LineChart<T>`: pass a concrete datum interface and
 * `xKey` / `series[].key` become compile-time-checked keys of it.
 */
export interface ColumnChartProps<T extends LineChartDatum = LineChartDatum>
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** One entry per column (step), sorted ascending by `xKey`. */
  data: T[];
  /**
   * The categories each column is split into, in legend order — the first one stacks on top.
   * The same schema drives the legend, the parts and the hover popover rows.
   */
  series: LineChartSeries<Extract<keyof T, string>>[];
  /** Key on each datum used as the X-axis value (the step: a day, an hour, …). */
  xKey: Extract<keyof T, string>;
}

/**
 * Vertical stacked columns: a column per step, split by category. Built on the `LineChart`
 * contexts, so `LineChartLegend` / `LineChartLegendItem`, `LineChartGrid`, `LineChartYAxis`
 * and `LineChartTooltip` compose inside it unchanged.
 */
export function ColumnChart<T extends LineChartDatum = LineChartDatum>({
  data,
  series,
  xKey,
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}: ColumnChartProps<T>): ReactElement {
  const seriesByKey = new Map<string, LineChartSeries>(series.map(s => [s.key, s]));

  useLineChartDataWarnings({ data, series, xKey });

  const { activeKey, setActiveKey } = useLineChartActiveKey({
    controlledActiveKey: undefined,
    onActiveKeyChange: undefined,
    seriesByKey,
  });

  const dataValue: LineChartDataContextValue = {
    data,
    series,
    seriesByKey,
    xKey,
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
            data-slot='column-chart'
            data-testid={testId}
            className={cn(columnChartRootClasses, className)}
          >
            {children}
          </div>
        </TestIdProvider>
      </LineChartActiveContext.Provider>
    </LineChartDataContext.Provider>
  );
}

ColumnChart.displayName = 'ColumnChart';
