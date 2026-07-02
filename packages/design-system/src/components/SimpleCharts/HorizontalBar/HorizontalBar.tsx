import type { FC, HTMLAttributes, Ref } from 'react';
import { useEffect, useMemo } from 'react';
import { ArrowDown, ArrowUp } from '../../../icons';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
import { Badge } from '../../Badge';
import { resolveChartColor } from '../lib/chartPalette';
import type { ChartColor } from '../types';
import {
  horizontalBarBarClasses,
  horizontalBarBarWrapperClasses,
  horizontalBarHeaderClasses,
  horizontalBarLegendClasses,
  horizontalBarLegendDotClasses,
  horizontalBarLegendItemClasses,
  horizontalBarLegendLabelClasses,
  horizontalBarRemainderClasses,
  horizontalBarRootClasses,
  horizontalBarSegmentClasses,
  horizontalBarValueClasses,
} from './classes';
import { resolveSegments } from './lib/resolveSegments';

export interface HorizontalBarDatum {
  /** Legend label, React key, and `data-name` hook. */
  name: string;
  /** Segment size; proportional to the bar total. */
  value: number;
  /** Built-in palette; resolves via `resolveChartColor`. Omitted → auto-assigned by index. */
  color?: ChartColor;
  /** Tailwind `bg-*` escape hatch; wins over `color` (inline fill is skipped). */
  className?: string;
}

export interface HorizontalBarProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Segments + legend. One array drives both, so colors stay in sync. */
  data: HorizontalBarDatum[];
  /** Headline number, rendered as `value.toLocaleString('en-US')`. Omitted → header hidden. */
  value?: number;
  /** Delta chip. Rendered as an internal Badge (arrow + number). Omitted → no chip. */
  delta?: { value: number; trend?: 'up' | 'down' };
  /** Bar denominator. `> sum(data.value)` → grey remainder tail. Default: `sum(data.value)`. */
  total?: number;
  /** Show/hide the legend. Default: true. */
  legend?: boolean;
}

const formatNumber = (n: number): string => n.toLocaleString('en-US');

export const HorizontalBar: FC<HorizontalBarProps> = ({
  data,
  value,
  delta,
  total,
  legend = true,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const segments = useMemo(() => resolveSegments(data, total), [data, total]);
  // Slot testids derive from this component's own `data-testid`, not from a parent
  // `TestIdProvider` — all slots render inline here, so `useTestId` would resolve
  // the context above this component (e.g. a wrapping `Chart`) instead of its own base.
  const slotTestId = (slot: string): string | undefined =>
    testId ? `${testId}--${slot}` : undefined;
  const legendSegments = useMemo(() => segments.filter(s => !s.isRemainder), [segments]);
  const barAriaLabel = useMemo(
    () =>
      legend
        ? undefined
        : legendSegments.length
          ? legendSegments.map(s => `${s.key} ${formatNumber(s.value)}`).join(', ')
          : undefined,
    [legend, legendSegments],
  );
  const hasDuplicateNames = useMemo(() => {
    const seen = new Set<string>();
    for (const d of data) {
      if (seen.has(d.name)) return true;
      seen.add(d.name);
    }
    return false;
  }, [data]);

  useEffect(() => {
    if (hasDuplicateNames && process.env.NODE_ENV !== 'production') {
      // biome-ignore lint/suspicious/noConsole: dev-only misuse warning, stripped in production
      console.warn(
        '[HorizontalBar] `data` contains duplicate `name` values. Names are used as the React key ' +
          'and the `data-name` hook — duplicates cause key collisions and ambiguous selectors. Provide unique names.',
      );
    }
  }, [hasDuplicateNames]);
  const hasBar = data.length > 0;
  const hasValue = typeof value === 'number';
  const hasDelta = !!delta;
  const deltaDirection = delta ? (delta.trend ?? (delta.value >= 0 ? 'up' : 'down')) : null;
  const deltaAbs = delta ? Math.abs(delta.value) : 0;

  return (
    <div
      {...props}
      ref={ref}
      data-slot='horizontal-bar'
      data-testid={testId}
      className={cn(horizontalBarRootClasses, className)}
    >
      {(hasValue || hasDelta) && (
        <div
          data-slot='horizontal-bar-header'
          data-testid={slotTestId('header')}
          className={horizontalBarHeaderClasses}
        >
          {hasValue && (
            <span
              data-slot='horizontal-bar-value'
              data-testid={slotTestId('value')}
              className={horizontalBarValueClasses}
            >
              {formatNumber(value)}
            </span>
          )}
          {delta && (
            <Badge
              type='secondary'
              color='w-orange'
              size='medium'
              // Badge renders a generic <div>; without a role its aria-label is
              // ignored — role='img' makes "up 10" the computed accessible name.
              role='img'
              aria-label={`${deltaDirection} ${formatNumber(deltaAbs)}`}
            >
              {deltaDirection === 'up' ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
              {formatNumber(deltaAbs)}
            </Badge>
          )}
        </div>
      )}
      {hasBar && (
        <div data-slot='horizontal-bar-bar-wrapper' className={horizontalBarBarWrapperClasses}>
          <div
            data-slot='horizontal-bar-bar'
            data-testid={slotTestId('bar')}
            aria-hidden={legend ? 'true' : undefined}
            // `aria-label` is ignored on generic elements — `role='img'` makes the
            // summary announceable when the legend (the readable form) is hidden.
            role={barAriaLabel ? 'img' : undefined}
            aria-label={barAriaLabel}
            className={horizontalBarBarClasses}
          >
            {segments.map(seg => (
              <div
                key={seg.key}
                data-slot='horizontal-bar-segment'
                data-testid={slotTestId('segment')}
                data-name={seg.isRemainder ? undefined : seg.key}
                data-remainder={seg.isRemainder ? 'true' : undefined}
                className={cn(
                  horizontalBarSegmentClasses,
                  seg.isRemainder && horizontalBarRemainderClasses,
                  seg.className,
                )}
                style={{
                  flexGrow: seg.value,
                  flexBasis: 0,
                  backgroundColor:
                    seg.isRemainder || seg.className ? undefined : resolveChartColor(seg.color),
                }}
              />
            ))}
          </div>
        </div>
      )}
      {legend && legendSegments.length > 0 && (
        <div
          data-slot='horizontal-bar-legend'
          data-testid={slotTestId('legend')}
          className={horizontalBarLegendClasses}
        >
          {legendSegments.map(seg => (
            <span
              key={seg.key}
              data-slot='horizontal-bar-legend-item'
              data-testid={slotTestId('legend-item')}
              data-name={seg.key}
              className={horizontalBarLegendItemClasses}
            >
              <span
                data-slot='horizontal-bar-legend-dot'
                data-testid={slotTestId('legend-dot')}
                aria-hidden='true'
                className={cn(horizontalBarLegendDotClasses, seg.className)}
                style={{
                  backgroundColor: seg.className ? undefined : resolveChartColor(seg.color),
                }}
              />
              <span className={horizontalBarLegendLabelClasses}>{seg.key}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

HorizontalBar.displayName = 'HorizontalBar';
