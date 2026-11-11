import { type FC, useContext } from 'react';
import { XAxis } from 'recharts';
import type { TickFormatter } from 'recharts/types/cartesian/CartesianAxis';
import type { XAxisTickContentProps } from 'recharts/types/util/types';
import { LINE_X_LABEL_HEIGHT } from '../LineChart/constants';
import { renderAxisTick } from '../LineChart/lib/renderAxisTick';
import { LineChartDataContext } from '../LineChart/LineChartContext';

export interface ColumnChartXAxisProps {
  /** Format the rendered tick label. Receives the raw `xKey` value of the column. */
  tickFormatter?: (value: unknown, index: number) => string;
  /**
   * Recharts tick interval. Defaults to `'preserveStartEnd'`: the first and last columns keep
   * their labels and middle ones drop out when the labels would collide. `0` labels every column.
   */
  interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
  /** Minimum gap (in pixels) between rendered tick labels. */
  minTickGap?: number;
}

const AXIS_LINE_PROPS = { stroke: 'var(--color-border-primary-light)' } as const;

// Every label centred under its column. `LineChartXAxis` anchors its edge labels to the plot
// edges instead, which would pull the first and last labels off their columns.
const renderTick = renderAxisTick<XAxisTickContentProps>();

export const ColumnChartXAxis: FC<ColumnChartXAxisProps> = ({
  tickFormatter,
  interval = 'preserveStartEnd',
  minTickGap,
}) => {
  const dataCtx = useContext(LineChartDataContext);

  return (
    <XAxis
      dataKey={dataCtx?.xKey}
      // Figma's 16px label band (`12612-31838`: grid 148 + labels 16) instead of recharts' 30px.
      height={LINE_X_LABEL_HEIGHT}
      tickLine={false}
      // The hidden tick line still offsets the label by its 6px length, which pushes the label
      // out of the 16px band onto the card border. Without it the label keeps Figma's 4px below.
      tickSize={0}
      axisLine={AXIS_LINE_PROPS}
      tick={renderTick}
      tickFormatter={tickFormatter as TickFormatter | undefined}
      interval={interval}
      minTickGap={minTickGap}
    />
  );
};

ColumnChartXAxis.displayName = 'ColumnChartXAxis';
