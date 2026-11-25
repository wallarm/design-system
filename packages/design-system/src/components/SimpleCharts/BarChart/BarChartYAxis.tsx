import { type FC, type ReactNode, useContext } from 'react';
import { Text, useChartWidth, YAxis } from 'recharts';
import type { YAxisTickContentProps } from 'recharts/types/util/types';
import { formatFullNumber } from '../../../utils/abbreviateNumber';
import { LineChartDataContext } from '../LineChart/LineChartContext';
import { BarChartTotalContext } from './BarChartContext';
import {
  BAR_CATEGORY_LABEL_GAP,
  BAR_CATEGORY_LABEL_WIDTH,
  BAR_ROW_INSET,
  BAR_ROW_TEXT_PROPS,
  BAR_TOTAL_WIDTH,
} from './constants';

export interface BarChartYAxisProps {
  /** Format the rendered category label. Receives the raw `yKey` value of the bar. */
  tickFormatter?: (value: unknown, index: number) => string;
  /**
   * Width of the label column in pixels. Defaults to 144px; a longer label is cut with an
   * ellipsis — the full one is in the hover popover.
   */
  width?: number;
  /** Format the row total on the right. */
  totalFormatter?: (value: number) => string;
}

// recharts measures a label for `maxLines` truncation in a hidden `<span>` styled from `style`,
// not from the `fontSize` attribute, and the size needs its unit there.
const LABEL_MEASURE_STYLE = {
  fontSize: `${BAR_ROW_TEXT_PROPS.fontSize}px`,
  fontFamily: BAR_ROW_TEXT_PROPS.fontFamily,
  fontWeight: 400,
} as const;

interface BarChartRowTextProps {
  x: number;
  y: number;
  label: string;
  /** Left edge of the label column. */
  labelX: number;
  labelWidth: number;
  total: string;
  /** `'end'` pins the total to the chart's right edge, `'start'` puts it right before the bar. */
  totalPlacement: 'end' | 'start' | false;
}

// A row's text, in the `BarList` style: the category on the left, the row total on the right.
const BarChartRowText: FC<BarChartRowTextProps> = ({
  x,
  y,
  label,
  labelX,
  labelWidth,
  total,
  totalPlacement,
}) => {
  const chartWidth = useChartWidth();
  const totalX = totalPlacement === 'start' ? x : (chartWidth ?? 0) - BAR_ROW_INSET;
  return (
    <>
      <Text
        x={labelX}
        y={y}
        textAnchor='start'
        verticalAnchor='middle'
        width={labelWidth}
        maxLines={1}
        breakAll
        {...BAR_ROW_TEXT_PROPS}
        fontWeight={400}
        style={LABEL_MEASURE_STYLE}
      >
        {label}
      </Text>
      {totalPlacement && chartWidth ? (
        <Text
          x={totalX}
          y={y}
          textAnchor='end'
          verticalAnchor='middle'
          {...BAR_ROW_TEXT_PROPS}
          fontWeight={500}
        >
          {total}
        </Text>
      ) : null}
    </>
  );
};

/**
 * The rows' text — the category label column on the left and the row total on the right, in
 * the `BarList` label / value style. Every category is labelled: rows have a fixed height.
 */
export const BarChartYAxis: FC<BarChartYAxisProps> = ({
  tickFormatter,
  width = BAR_CATEGORY_LABEL_WIDTH,
  totalFormatter = formatFullNumber,
}) => {
  const dataCtx = useContext(LineChartDataContext);
  const totalPlacement = useContext(BarChartTotalContext);
  const labelWidth = Math.max(0, width - BAR_CATEGORY_LABEL_GAP);
  // With the total before the bar, its column is part of the axis band.
  const axisWidth = totalPlacement === 'start' ? width + BAR_TOTAL_WIDTH : width;

  const renderTick = ({ x, y, payload }: YAxisTickContentProps): ReactNode => {
    const value = tickFormatter ? tickFormatter(payload.value, payload.index) : payload.value;
    const datum = dataCtx?.data[payload.index];
    const total = (dataCtx?.series ?? []).reduce((sum, s) => {
      const part = Number(datum?.[s.key] ?? 0);
      return Number.isFinite(part) ? sum + part : sum;
    }, 0);
    return (
      <BarChartRowText
        x={Number(x)}
        y={Number(y)}
        label={String(value ?? '')}
        labelX={Number(x) + BAR_CATEGORY_LABEL_GAP - axisWidth}
        labelWidth={labelWidth}
        total={totalFormatter(total)}
        totalPlacement={totalPlacement}
      />
    );
  };

  return (
    <YAxis
      type='category'
      dataKey={dataCtx?.xKey}
      width={axisWidth}
      tickLine={false}
      tickSize={0}
      tickMargin={BAR_CATEGORY_LABEL_GAP}
      axisLine={false}
      tick={renderTick}
      interval={0}
    />
  );
};

BarChartYAxis.displayName = 'BarChartYAxis';
