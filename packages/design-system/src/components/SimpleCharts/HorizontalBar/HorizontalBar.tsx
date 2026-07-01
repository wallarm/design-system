import type { FC, HTMLAttributes, Ref } from 'react';
import { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { resolveChartColor } from '../lib/chartPalette';
import type { ChartColor } from '../types';
import {
  horizontalBarBarClasses,
  horizontalBarBarWrapperClasses,
  horizontalBarRootClasses,
  horizontalBarSegmentClasses,
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

  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='horizontal-bar'
        data-testid={testId}
        className={cn(horizontalBarRootClasses, className)}
      >
        {/* header added in a later task */}
        <div data-slot='horizontal-bar-bar-wrapper' className={horizontalBarBarWrapperClasses}>
          <div
            data-slot='horizontal-bar-bar'
            data-testid={barTestId}
            aria-hidden='true'
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
        {/* legend added in a later task */}
      </div>
    </TestIdProvider>
  );
};

HorizontalBar.displayName = 'HorizontalBar';
