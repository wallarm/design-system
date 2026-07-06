import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
import { ChartDelta, type ChartDeltaProps } from '../internal/ChartDelta';
import {
  metricCaptionClasses,
  metricHeaderClasses,
  metricRootClasses,
  metricTotalClasses,
  metricTotalLabelClasses,
  metricValueClasses,
  metricValueGroupClasses,
} from './classes';

export interface MetricProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Headline number, rendered as `value.toLocaleString('en-US')`. */
  value: number;
  /**
   * Optional denominator. When set, renders `/{total} total` after the value
   * (e.g. "91 /120 total") in a muted tone — the same "value out of total"
   * relationship as `HorizontalBarStack`'s `total`.
   */
  total?: number;
  /** Optional secondary caption rendered under the value (freeform). */
  caption?: ReactNode;
  /**
   * Trend chip (the shared `ChartDelta`). `sentiment` sets the colour
   * (positive → green, negative → w-orange, neutral → slate; default neutral),
   * `trend` sets the arrow — independent axes. Omitted → no chip.
   */
  delta?: Pick<ChartDeltaProps, 'value' | 'trend' | 'sentiment'>;
}

const formatNumber = (n: number): string => n.toLocaleString('en-US');

/**
 * The family's compact stat: a headline number with an optional `/ total`
 * denominator, an optional trend delta chip, and an optional caption. The
 * standalone sibling of `HorizontalBarStack` — the same value/total/delta
 * header, without the segmented bar or legend. Composed inside a `Chart` card.
 */
export const Metric: FC<MetricProps> = ({
  value,
  total,
  caption,
  delta,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const slotTestId = (slot: string): string | undefined =>
    testId ? `${testId}--${slot}` : undefined;
  const totalText =
    typeof total === 'number' && Number.isFinite(total) ? `/${formatNumber(total)}` : null;

  return (
    <div
      {...props}
      ref={ref}
      data-slot='metric'
      data-testid={testId}
      className={cn(metricRootClasses, className)}
    >
      <div data-slot='metric-header' className={metricHeaderClasses}>
        <div data-slot='metric-value-group' className={metricValueGroupClasses}>
          <span
            data-slot='metric-value'
            data-testid={slotTestId('value')}
            className={metricValueClasses}
          >
            {formatNumber(value)}
          </span>
          {totalText && (
            <>
              <span
                data-slot='metric-total'
                data-testid={slotTestId('total')}
                className={metricTotalClasses}
              >
                {totalText}
              </span>
              <span data-slot='metric-total-label' className={metricTotalLabelClasses}>
                total
              </span>
            </>
          )}
        </div>
        {delta && <ChartDelta {...delta} data-testid={slotTestId('delta')} />}
      </div>
      {caption != null && (
        <span
          data-slot='metric-caption'
          data-testid={slotTestId('caption')}
          className={metricCaptionClasses}
        >
          {caption}
        </span>
      )}
    </div>
  );
};

Metric.displayName = 'Metric';
