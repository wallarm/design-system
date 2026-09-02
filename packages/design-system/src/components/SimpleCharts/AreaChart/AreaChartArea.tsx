import { type FC, useContext, useEffect } from 'react';
import { Area } from 'recharts';
import { LineChartActiveContext, LineChartDataContext } from '../LineChart/LineChartContext';
import { warnLineChartLine } from '../LineChart/lib/warn';
import { AreaChartVariantContext } from './AreaChartContext';
import {
  AREA_ANIMATION_BEGIN,
  AREA_ANIMATION_DURATION,
  AREA_FILL_OPACITY,
  AREA_INACTIVE_OPACITY,
  AREA_STROKE_FILL,
  AREA_STROKE_WIDTH,
  resolveSeriesColor,
} from './constants';

export interface AreaChartAreaProps {
  /** Joins to `LineChartSeries.key` from the root `series` prop. */
  seriesKey: string;
  /** Recharts curve type. Defaults to `'monotone'`. */
  curve?: 'linear' | 'monotone';
  /** Force-disable the recharts mount animation. */
  disableAnimation?: boolean;
  /** Recharts pass-through — when `true`, the area bridges `null`/`undefined` gaps. */
  connectNulls?: boolean;
  /** Stroke width override. Defaults to `AREA_STROKE_WIDTH`. */
  strokeWidth?: number;
}

export const AreaChartArea: FC<AreaChartAreaProps> = ({
  seriesKey,
  curve = 'monotone',
  disableAnimation = false,
  connectNulls = false,
  strokeWidth = AREA_STROKE_WIDTH,
}) => {
  const dataCtx = useContext(LineChartDataContext);
  const { activeKey } = useContext(LineChartActiveContext);
  const variant = useContext(AreaChartVariantContext);

  const series = dataCtx?.seriesByKey.get(seriesKey);
  const isHidden = dataCtx?.hiddenSet.has(seriesKey) ?? false;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!dataCtx) return;
    if (!series) {
      warnLineChartLine(
        `\`seriesKey="${seriesKey}"\` does not match any entry in the root \`series\` array. ` +
          'The area will not render. Add the series to the schema or check the key spelling.',
      );
    }
  }, [dataCtx, series, seriesKey]);

  if (!series || isHidden) return null;

  const stroke = resolveSeriesColor(series.color) ?? AREA_STROKE_FILL.slate;
  const fill = stroke;
  const isActive = activeKey === seriesKey;
  const opacity = activeKey !== null && !isActive ? AREA_INACTIVE_OPACITY : 1;

  return (
    <Area
      dataKey={seriesKey}
      name={series.label}
      type={curve}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      fill={fill}
      fillOpacity={AREA_FILL_OPACITY}
      dot={false}
      activeDot={false}
      opacity={opacity}
      connectNulls={connectNulls}
      stackId={variant === 'stacked' ? 'area-stack' : undefined}
      isAnimationActive={disableAnimation ? false : 'auto'}
      animationBegin={AREA_ANIMATION_BEGIN}
      animationDuration={AREA_ANIMATION_DURATION}
      animationEasing='ease-out'
      data-slot='area-chart-area'
      data-key={seriesKey}
      data-active={isActive ? 'true' : undefined}
    />
  );
};

AreaChartArea.displayName = 'AreaChartArea';
