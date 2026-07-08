import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { resolveChartColor } from '../lib/chartPalette';
import type { ChartColor } from '../types';

/**
 * The family's white "hover detail" card — a floating surface showing a series' name and value
 * on chart hover. Shared so every chart presents detail identically (the same surface the
 * LineChart hover popover uses). Compose `ChartHoverCardRow`s inside.
 *
 * Positioning is the caller's job: charts render it as the content of a `Tooltip` (bars) or a
 * plotting-library tooltip (lines). It sets no tooltip role itself — the wrapping surface owns
 * that — so pass `role`/`aria-live` via props when used standalone.
 */
const chartHoverCardClasses = [
  'bg-bg-surface-2 border border-border-primary-light rounded-12 shadow-md',
  'px-12 py-8 min-w-160',
  'flex flex-col gap-4',
  'pointer-events-none',
].join(' ');

const chartHoverCardRowClasses = [
  'relative h-16 w-full pl-12',
  'flex items-center gap-8',
  'text-xs font-mono text-text-primary',
].join(' ');
const chartHoverCardRowDotClasses = 'absolute left-0 top-4';
const chartHoverCardRowLabelClasses = 'truncate min-w-0 font-normal';
const chartHoverCardRowValueClasses = 'ml-auto shrink-0 font-medium';
const chartHoverCardDotClasses = 'inline-block size-8 rounded-2';

export interface ChartHoverCardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const ChartHoverCard: FC<ChartHoverCardProps> = ({ className, children, ref, ...props }) => (
  <div
    {...props}
    ref={ref}
    data-slot='chart-hover-card'
    className={cn(chartHoverCardClasses, className)}
  >
    {children}
  </div>
);

ChartHoverCard.displayName = 'ChartHoverCard';

export interface ChartHoverCardDotProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** Palette token or CSS colour. Omitted → no inline fill (lets a `className` bg win). */
  color?: ChartColor | (string & {});
}

export const ChartHoverCardDot: FC<ChartHoverCardDotProps> = ({
  color,
  className,
  style,
  ref,
  ...props
}) => (
  <span
    {...props}
    ref={ref}
    data-slot='chart-hover-card-dot'
    aria-hidden='true'
    className={cn(chartHoverCardDotClasses, className)}
    style={{
      ...style,
      backgroundColor:
        style?.backgroundColor ?? (color != null ? resolveChartColor(color) : undefined),
    }}
  />
);

ChartHoverCardDot.displayName = 'ChartHoverCardDot';

const formatValue = (value: number | string | null | undefined): ReactNode => {
  if (value == null) return '—';
  return typeof value === 'number' ? value.toLocaleString('en-US') : value;
};

export interface ChartHoverCardRowProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Dot colour — palette token or CSS colour. */
  color?: ChartColor | (string & {});
  /** Extra dot class (e.g. a `bg-*` escape hatch that wins over `color`). */
  dotClassName?: string;
  /** Series label. */
  label: ReactNode;
  /** Value at the hovered point. A number is locale-formatted; `null`/`undefined` → em dash. */
  value?: number | string | null;
}

export const ChartHoverCardRow: FC<ChartHoverCardRowProps> = ({
  color,
  dotClassName,
  label,
  value,
  className,
  ref,
  ...props
}) => (
  <div
    {...props}
    ref={ref}
    data-slot='chart-hover-card-row'
    className={cn(chartHoverCardRowClasses, className)}
  >
    <ChartHoverCardDot color={color} className={cn(chartHoverCardRowDotClasses, dotClassName)} />
    <span className={chartHoverCardRowLabelClasses}>{label}</span>
    <span className={chartHoverCardRowValueClasses}>{formatValue(value)}</span>
  </div>
);

ChartHoverCardRow.displayName = 'ChartHoverCardRow';
