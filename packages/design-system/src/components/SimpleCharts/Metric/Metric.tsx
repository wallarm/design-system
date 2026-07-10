import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { metricRootClasses } from './classes';

export interface MetricProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/**
 * The family's compact stat, as a compound "brick set". Compose:
 * `MetricHeader` (the shared value/total/delta row — also reused by `HorizontalBarStack`),
 * `MetricValue`, `MetricTotal`, `MetricDelta`, and `MetricCaption`.
 *
 * Body-only: the card frame and "Title" header come from `Chart` / `ChartHeader` /
 * `ChartTitle`, like every member of the family.
 */
export const Metric: FC<MetricProps> = ({
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='metric'
        data-testid={testId}
        className={cn(metricRootClasses, className)}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

Metric.displayName = 'Metric';
