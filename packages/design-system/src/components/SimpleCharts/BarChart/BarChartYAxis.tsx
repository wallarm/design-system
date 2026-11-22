import { type FC, type ReactNode, useContext } from 'react';
import { Text, YAxis } from 'recharts';
import type { YAxisTickContentProps } from 'recharts/types/util/types';
import { LINE_AXIS_TICK_TEXT_PROPS } from '../LineChart/constants';
import { LineChartDataContext } from '../LineChart/LineChartContext';
import { BAR_CATEGORY_LABEL_GAP, BAR_CATEGORY_LABEL_WIDTH } from './constants';

export interface BarChartYAxisProps {
  /** Format the rendered category label. Receives the raw `yKey` value of the bar. */
  tickFormatter?: (value: unknown, index: number) => string;
  /**
   * Width of the label gutter in pixels. Defaults to 96px; a longer label is cut with an
   * ellipsis — the full one is in the hover popover.
   */
  width?: number;
}

const AXIS_LINE_PROPS = { stroke: 'var(--color-border-primary-light)' } as const;

// recharts measures a label for `maxLines` truncation in a hidden `<span>` styled from `style`,
// not from the `fontSize` attribute. The size needs its unit there: a bare `10` is dropped by
// the browser, the span falls back to 16px and labels are cut at ~60% of the gutter.
const LABEL_MEASURE_STYLE = {
  fontSize: `${LINE_AXIS_TICK_TEXT_PROPS.fontSize}px`,
  fontFamily: LINE_AXIS_TICK_TEXT_PROPS.fontFamily,
  fontWeight: LINE_AXIS_TICK_TEXT_PROPS.fontWeight,
} as const;

/**
 * The category axis on the left — `ColumnChartXAxis` turned on its side: a solid axis line and
 * one label per bar, right-aligned against the line and centred on the bar. Every category is
 * labelled: rows have a fixed height, so labels never collide.
 */
export const BarChartYAxis: FC<BarChartYAxisProps> = ({
  tickFormatter,
  width = BAR_CATEGORY_LABEL_WIDTH,
}) => {
  const dataCtx = useContext(LineChartDataContext);
  const labelWidth = Math.max(0, width - BAR_CATEGORY_LABEL_GAP);

  const renderTick = ({ x, y, payload }: YAxisTickContentProps): ReactNode => {
    const value = tickFormatter ? tickFormatter(payload.value, payload.index) : payload.value;
    return (
      <Text
        x={x}
        y={y}
        textAnchor='end'
        verticalAnchor='middle'
        width={labelWidth}
        maxLines={1}
        breakAll
        {...LINE_AXIS_TICK_TEXT_PROPS}
        style={LABEL_MEASURE_STYLE}
      >
        {String(value ?? '')}
      </Text>
    );
  };

  return (
    <YAxis
      type='category'
      dataKey={dataCtx?.xKey}
      width={width}
      tickLine={false}
      tickSize={0}
      tickMargin={BAR_CATEGORY_LABEL_GAP}
      axisLine={AXIS_LINE_PROPS}
      tick={renderTick}
      interval={0}
    />
  );
};

BarChartYAxis.displayName = 'BarChartYAxis';
