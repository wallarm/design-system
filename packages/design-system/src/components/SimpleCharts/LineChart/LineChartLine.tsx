import { type FC, type MouseEvent, useContext, useEffect } from 'react';
import { Line } from 'recharts';
import type { CurveMouseEventHandler } from 'recharts/types/shape/Curve';
import {
  LINE_ANIMATION_BEGIN,
  LINE_ANIMATION_DURATION,
  LINE_DASH_DASHARRAY,
  LINE_INACTIVE_OPACITY,
  LINE_STROKE_FILL,
  LINE_STROKE_WIDTH,
  resolveSeriesColor,
} from './constants';
import { LineChartActiveContext, LineChartDataContext } from './LineChartContext';
import { warnLineChartLine } from './lib/warn';

// Strip recharts' first `(curveProps, event)` arg so the public API stays event-only.
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

  return (
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
      isAnimationActive={disableAnimation ? false : 'auto'}
      animationBegin={LINE_ANIMATION_BEGIN}
      animationDuration={LINE_ANIMATION_DURATION}
      animationEasing='ease-out'
      onClick={wrap(onClick)}
      onMouseEnter={wrap(onMouseEnter)}
      onMouseLeave={wrap(onMouseLeave)}
      data-slot='line-chart-line'
      data-key={seriesKey}
      data-active={isActive ? 'true' : undefined}
    />
  );
};

LineChartLine.displayName = 'LineChartLine';
