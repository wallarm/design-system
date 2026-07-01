import type { FC, HTMLAttributes, Ref } from 'react';
import { useEffect, useMemo } from 'react';
import { ArrowDown, ArrowUp } from '../../../icons';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
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
  const barTestId = useTestId('bar');
  const valueTestId = useTestId('value');
  const legendTestId = useTestId('legend');
  const legendItemTestId = useTestId('legend-item');
  const legendSegments = useMemo(() => segments.filter(s => !s.isRemainder), [segments]);
  const barAriaLabel = useMemo(
    () =>
      legend
        ? undefined
        : legendSegments.length
          ? legendSegments.map(s => `${s.key} ${s.value}`).join(', ')
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
      // eslint-disable-next-line no-console
      console.warn(
        '[HorizontalBar] `data` contains duplicate `name` values. Names are used as the React key ' +
          'and the `data-name` hook — duplicates cause key collisions and ambiguous selectors. Provide unique names.',
      );
    }
  }, [hasDuplicateNames]);
  const hasValue = typeof value === 'number';
  const hasDelta = !!delta;
  const deltaDirection = delta ? (delta.trend ?? (delta.value >= 0 ? 'up' : 'down')) : null;
  const deltaAbs = delta ? Math.abs(delta.value) : 0;

  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='horizontal-bar'
        data-testid={testId}
        className={cn(horizontalBarRootClasses, className)}
      >
        {(hasValue || hasDelta) && (
          <div data-slot='horizontal-bar-header' className={horizontalBarHeaderClasses}>
            {hasValue && (
              <span
                data-slot='horizontal-bar-value'
                data-testid={valueTestId}
                className={horizontalBarValueClasses}
              >
                {value.toLocaleString('en-US')}
              </span>
            )}
            {delta && (
              <Badge
                type='secondary'
                color='w-orange'
                size='medium'
                aria-label={`${deltaDirection} ${deltaAbs}`}
              >
                {deltaDirection === 'up' ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
                {deltaAbs.toLocaleString('en-US')}
              </Badge>
            )}
          </div>
        )}
        <div data-slot='horizontal-bar-bar-wrapper' className={horizontalBarBarWrapperClasses}>
          <div
            data-slot='horizontal-bar-bar'
            data-testid={barTestId}
            aria-hidden={legend ? 'true' : undefined}
            aria-label={barAriaLabel}
            className={horizontalBarBarClasses}
          >
            {segments.map(seg => (
              <div
                key={seg.key}
                data-slot='horizontal-bar-segment'
                data-name={seg.isRemainder ? undefined : seg.key}
                data-remainder={seg.isRemainder ? 'true' : undefined}
                className={cn(horizontalBarSegmentClasses, seg.className)}
                style={{
                  flexGrow: seg.value,
                  flexBasis: 0,
                  backgroundColor: seg.isRemainder
                    ? 'var(--color-bg-strong-primary)'
                    : seg.className
                      ? undefined
                      : resolveChartColor(seg.color),
                }}
              />
            ))}
          </div>
        </div>
        {legend && legendSegments.length > 0 && (
          <div
            data-slot='horizontal-bar-legend'
            data-testid={legendTestId}
            className={horizontalBarLegendClasses}
          >
            {legendSegments.map(seg => (
              <span
                key={seg.key}
                data-slot='horizontal-bar-legend-item'
                data-testid={legendItemTestId}
                data-name={seg.key}
                className={horizontalBarLegendItemClasses}
              >
                <span
                  data-slot='horizontal-bar-legend-dot'
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
    </TestIdProvider>
  );
};

HorizontalBar.displayName = 'HorizontalBar';
