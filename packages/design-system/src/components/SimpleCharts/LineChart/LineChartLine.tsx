import { type FC, type MouseEvent, useContext, useEffect, useId } from 'react';
import { Line, LineDrawShape, type LineDrawShapeProps } from 'recharts';
import type { CurveMouseEventHandler } from 'recharts/types/shape/Curve';
import { useTestId } from '../../../utils/testId';
import {
  LINE_DASH_DASHARRAY,
  LINE_INACTIVE_OPACITY,
  LINE_STROKE_FILL,
  LINE_STROKE_WIDTH,
  resolveSeriesColor,
} from './constants';
import { useRangeEdges } from './hooks/useRangeEdges';
import {
  LineChartActiveContext,
  LineChartDataContext,
  LineChartRangeContext,
} from './LineChartContext';
import { warnLineChartLine } from './lib/warn';

// Strip recharts' first `(curveProps, event)` arg so the public API stays event-only.
const IN_RANGE_STROKE = 'var(--color-bg-fill-danger)';

const wrap = (
  cb: ((event: MouseEvent<SVGPathElement>) => void) | undefined,
): CurveMouseEventHandler | undefined => (cb ? (_props, event) => cb(event) : undefined);

export interface LineChartLineProps {
  /** Joins to `LineChartSeries.key` from the root `series` prop. */
  seriesKey: string;
  /** Recharts curve type. Defaults to `'monotone'`. */
  curve?: 'linear' | 'monotone';
  /** Force-disable the recharts mount animation. */
  disableAnimation?: boolean;
  /** Recharts pass-through — when `true`, the line bridges `null`/`undefined` gaps. */
  connectNulls?: boolean;
  /** Stroke width override. Defaults to `LINE_STROKE_WIDTH`. */
  strokeWidth?: number;
  onClick?: (event: MouseEvent<SVGPathElement>) => void;
  onMouseEnter?: (event: MouseEvent<SVGPathElement>) => void;
  onMouseLeave?: (event: MouseEvent<SVGPathElement>) => void;
}

// Recharts requires `<Line>` to be a direct child of `<RechartsLineChart>` so it
// can hoist it into the chart's layout. `LineChartLine` therefore returns the
// bare `<Line>` element (or `null`) — no wrapper element. The `seriesKey` is
// looked up in `seriesByKey` from the data context, which means callers compose
// one `<LineChartLine seriesKey={s.key} />` per series in JSX, mirroring the
// per-row composition of `<LineChartLegendItem>`.
export const LineChartLine: FC<LineChartLineProps> = ({
  seriesKey,
  curve = 'monotone',
  disableAnimation = false,
  connectNulls = false,
  strokeWidth = LINE_STROKE_WIDTH,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const dataCtx = useContext(LineChartDataContext);
  const { activeKey } = useContext(LineChartActiveContext);
  const testId = useTestId('line');
  const inRangeTestId = useTestId('line-in-range');
  const clipId = useId();
  const { ranges } = useContext(LineChartRangeContext);
  const geometry = useRangeEdges();

  const series = dataCtx?.seriesByKey.get(seriesKey);
  const isHidden = dataCtx?.hiddenSet.has(seriesKey) ?? false;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!dataCtx) return;
    if (!series) {
      warnLineChartLine(
        `\`seriesKey="${seriesKey}"\` does not match any entry in the root \`series\` array. ` +
          'The line will not render. Add the series to the schema or check the key spelling.',
      );
    }
  }, [dataCtx, series, seriesKey]);

  if (!series || isHidden) return null;

  const stroke = resolveSeriesColor(series.color) ?? LINE_STROKE_FILL.slate;
  const strokeDasharray = series.variant === 'dashed' ? LINE_DASH_DASHARRAY : undefined;
  const isActive = activeKey === seriesKey;
  const opacity = activeKey !== null && !isActive ? LINE_INACTIVE_OPACITY : 1;

  const clipRects = geometry
    ? ranges.flatMap(range => {
        if (range.seriesKey !== seriesKey) return [];
        const edges = geometry.edgesOf(range);
        return edges ? [{ key: range.key, ...edges }] : [];
      })
    : [];

  // A danger copy of the line drawn over the base line, clipped to the range rectangles — the
  // colour switches at exactly the range fill's edge. Recharts drops a `clipPath` prop on
  // `<Line>` (it sets its own on the curve), so the clip goes through a custom `shape`.
  const renderInRangeShape = (shapeProps: LineDrawShapeProps) => (
    <>
      <defs>
        <clipPath id={clipId}>
          {clipRects.map(rect => (
            <rect
              key={rect.key}
              x={rect.x1}
              y={geometry?.plotArea.y}
              width={Math.max(0, rect.x2 - rect.x1)}
              height={geometry?.plotArea.height}
            />
          ))}
        </clipPath>
      </defs>
      <LineDrawShape {...shapeProps} clipPath={`url(#${clipId})`} />
    </>
  );

  const base = (
    <Line
      dataKey={seriesKey}
      name={series.label}
      type={curve}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap='round'
      strokeLinejoin='round'
      dot={false}
      activeDot={false}
      opacity={opacity}
      connectNulls={connectNulls}
      isAnimationActive={false}
      onClick={wrap(onClick)}
      onMouseEnter={wrap(onMouseEnter)}
      onMouseLeave={wrap(onMouseLeave)}
      data-slot='line-chart-line'
      data-testid={testId}
      data-key={seriesKey}
      data-active={isActive ? 'true' : undefined}
    />
  );

  if (clipRects.length === 0) return base;

  return (
    <>
      {base}
      <Line
        dataKey={seriesKey}
        name={series.label}
        type={curve}
        stroke={IN_RANGE_STROKE}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap='round'
        strokeLinejoin='round'
        dot={false}
        activeDot={false}
        opacity={opacity}
        connectNulls={connectNulls}
        isAnimationActive={false}
        tooltipType='none'
        legendType='none'
        // Clicks fall through to the base line underneath.
        pointerEvents='none'
        shape={renderInRangeShape}
        data-slot='line-chart-line'
        data-testid={inRangeTestId}
        data-key={seriesKey}
        data-in-range='true'
      />
    </>
  );
};

LineChartLine.displayName = 'LineChartLine';
