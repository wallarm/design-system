import {
  type FC,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';
import { type TestableProps, useTestId } from '../../../utils/testId';
import { useDateFormat } from '../../DateFormatProvider/useDateFormat';
import { ChartHoverCardRow } from '../internal/ChartHoverCard';
import { formatChartDate } from '../lib/timeFormatters';
import { LineChartHoverPopover, LineChartHoverPopoverTimestamp } from '../LineChart';
import { LINE_CURSOR_DASHARRAY } from '../LineChart/constants';
import {
  metricSparklineClasses,
  metricSparklinePlotClasses,
  metricSparklinePopoverClasses,
  metricSparklineRulerClasses,
} from './classes';

export type MetricSparklineColor = 'brand' | 'positive' | 'negative' | 'neutral';

export interface MetricSparklinePoint {
  /** The point's position on the period — a date (`Date`, timestamp, ISO string) or any label. */
  x: Date | number | string;
  value: number;
}

export interface MetricSparklineProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** The trend over the period, oldest first. */
  data: MetricSparklinePoint[];
  /**
   * Line colour. Independent of the `MetricDelta` sentiment — set both. `brand` (default) ·
   * `positive` (success) · `negative` (danger) · `neutral` (slate).
   */
  color?: MetricSparklineColor;
  /** Series name on the hover popover row (Figma "Attribute"). */
  label?: ReactNode;
  /** Formats the hovered point's `x` for the popover. Defaults to `1 Jan, 2026` for dates. */
  formatX?: (x: MetricSparklinePoint['x']) => ReactNode;
  /** Formats the hovered value. Defaults to `toLocaleString('en-US')`. */
  formatValue?: (value: number) => ReactNode;
}

// Line and area tokens per colour. Figma puts the area's 20% on the layer (a token can't
// carry opacity), so the gradient stops below apply it. Neutral's area is a lighter slate.
const SPARKLINE_COLORS: Record<MetricSparklineColor, { line: string; area: string }> = {
  brand: { line: 'var(--color-bg-fill-brand)', area: 'var(--color-bg-fill-brand)' },
  positive: { line: 'var(--color-bg-fill-success)', area: 'var(--color-bg-fill-success)' },
  negative: { line: 'var(--color-bg-fill-danger)', area: 'var(--color-bg-fill-danger)' },
  neutral: { line: 'var(--color-border-strong-primary)', area: 'var(--color-bg-strong-primary)' },
};

const HEIGHT = 48;
// ponytail: fixed headroom, tune against Figma if the line hugs an edge.
const PAD_TOP = 4;
const PAD_BOTTOM = 8;
const STROKE_WIDTH = 1.5;
// Popover offset from the ruler / plot top (Figma line-popover 12610:11378).
const POPOVER_OFFSET_X = 8;
const POPOVER_OFFSET_Y = 14;

/**
 * One SVG unit per data step on X, one pixel on Y: with `preserveAspectRatio='none'` the plot
 * stretches to any card width without measuring, and `non-scaling-stroke` keeps the line 1.5px.
 * The Y domain is the data's own min..max — a sparkline shows shape, not magnitude.
 */
const buildPaths = (values: number[]) => {
  // A lone point becomes a flat line across the card.
  const ys = values.length === 1 ? values.concat(values) : values;
  const finite = ys.filter(Number.isFinite);
  const min = Math.min(...finite);
  const span = Math.max(...finite) - min;
  const inner = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const toY = (v: number) =>
    span === 0 ? PAD_TOP + inner / 2 : PAD_TOP + (1 - (v - min) / span) * inner;
  // A non-finite value leaves a gap: each run of finite points is its own line + area segment.
  const line: string[] = [];
  const area: string[] = [];
  let runEnd = -1;
  ys.forEach((v, i) => {
    if (!Number.isFinite(v)) {
      if (runEnd >= 0) area.push(`L${runEnd},${HEIGHT} Z`);
      runEnd = -1;
      return;
    }
    const y = toY(v);
    line.push(`${runEnd < 0 ? 'M' : 'L'}${i},${y}`);
    area.push(runEnd < 0 ? `M${i},${HEIGHT} L${i},${y}` : `L${i},${y}`);
    runEnd = i;
  });
  if (runEnd >= 0) area.push(`L${runEnd},${HEIGHT} Z`);
  return { width: ys.length - 1, line: line.join(' '), area: area.join(' ') };
};

// Strings are dates only in ISO form — `Date.parse` also accepts labels like "Week 1".
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

interface HoverState {
  index: number;
  /** The plot's viewport box at the last pointer move — the popover is portalled to `body`. */
  left: number;
  top: number;
  width: number;
}

/**
 * The trend under a `Metric`: a 48px line + area spanning the card width, with a ruler and a
 * date/value popover on hover. Compose it inside `Chart`, after `Metric` — the metric's bottom
 * padding is the 8px gap, and the sparkline sits flush with the card's bottom edge.
 */
export const MetricSparkline: FC<MetricSparklineProps> = ({
  data,
  color = 'brand',
  label,
  formatX,
  formatValue,
  className,
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('sparkline', testIdProp);
  const popoverTestId = testId ? `${testId}--popover` : undefined;
  const { order } = useDateFormat();
  const gradientId = `metric-sparkline-${useId().replace(/[^\w-]/g, '')}`;
  const [hover, setHover] = useState<HoverState | null>(null);

  const { line, area } = SPARKLINE_COLORS[color];
  const paths = data.length > 0 ? buildPaths(data.map(d => d.value)) : null;
  const last = data.length - 1;
  const fractionOf = (index: number) => (last === 0 ? 0.5 : index / last);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (last < 0 || rect.width === 0) return;
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setHover({
      index: Math.round(ratio * last),
      left: rect.left,
      top: rect.top,
      width: rect.width,
    });
  };

  const handlePointerLeave = () => setHover(null);

  // The fixed popover can't follow a scroll or resize, so either one ends the hover.
  const isHovering = hover !== null;
  useEffect(() => {
    if (!isHovering) return;
    const clear = () => setHover(null);
    window.addEventListener('scroll', clear, { capture: true, passive: true });
    window.addEventListener('resize', clear);
    return () => {
      window.removeEventListener('scroll', clear, { capture: true });
      window.removeEventListener('resize', clear);
    };
  }, [isHovering]);

  // `data` may shrink under a held pointer — drop an index that no longer exists.
  const index = hover && hover.index <= last ? hover.index : null;
  const point = index === null ? undefined : data[index];
  const fraction = index === null ? 0 : fractionOf(index);
  // Right half → the popover opens to the left of the ruler so it stays over the card.
  const flip = fraction > 0.5;
  const formattedX = !point
    ? null
    : formatX
      ? formatX(point.x)
      : typeof point.x === 'string' && !ISO_DATE.test(point.x)
        ? point.x
        : formatChartDate(point.x, { order, withYear: true }) || String(point.x);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='metric-sparkline'
      data-testid={testId}
      data-color={color}
      className={cn(metricSparklineClasses, className)}
    >
      <div
        data-slot='metric-sparkline-plot'
        data-testid={testId && `${testId}--plot`}
        aria-hidden='true'
        className={metricSparklinePlotClasses}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {paths && (
          <svg
            className='block size-full'
            viewBox={`0 0 ${paths.width} ${HEIGHT}`}
            preserveAspectRatio='none'
          >
            <defs>
              <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0' stopColor={area} stopOpacity={0.2} />
                <stop offset='1' stopColor={area} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={paths.area} fill={`url(#${gradientId})`} />
            <path
              d={paths.line}
              fill='none'
              stroke={line}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin='round'
              strokeLinecap='round'
              vectorEffect='non-scaling-stroke'
            />
          </svg>
        )}
        {point && (
          <svg
            data-slot='metric-sparkline-ruler'
            data-testid={testId && `${testId}--ruler`}
            className={metricSparklineRulerClasses}
            style={{ left: `${fraction * 100}%` }}
          >
            <line
              x1='0.5'
              x2='0.5'
              y1='0'
              y2='100%'
              stroke='var(--color-border-strong-primary)'
              strokeDasharray={LINE_CURSOR_DASHARRAY}
            />
          </svg>
        )}
      </div>
      {hover &&
        point &&
        createPortal(
          <div
            className={cn(metricSparklinePopoverClasses, flip && '-translate-x-full')}
            style={{
              left:
                hover.left + fraction * hover.width + (flip ? -POPOVER_OFFSET_X : POPOVER_OFFSET_X),
              top: hover.top + POPOVER_OFFSET_Y,
            }}
          >
            <LineChartHoverPopover data-testid={popoverTestId}>
              <LineChartHoverPopoverTimestamp>{formattedX}</LineChartHoverPopoverTimestamp>
              <ChartHoverCardRow
                color={line}
                label={label}
                value={Number.isFinite(point.value) ? point.value : null}
                formatValue={formatValue && (v => (typeof v === 'number' ? formatValue(v) : '—'))}
              />
            </LineChartHoverPopover>
          </div>,
          document.body,
        )}
    </div>
  );
};

MetricSparkline.displayName = 'MetricSparkline';
