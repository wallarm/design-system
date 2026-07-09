import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
import { Skeleton } from '../../Skeleton';
import { metricRootClasses, metricSkeletonLineClasses } from './classes';

export interface MetricSkeletonProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Loading placeholder for `Metric`, matching `BarListSkeleton` / `PieChartSkeleton`.
 * A value-sized block plus a thin caption line, sized to the loaded layout so the
 * card doesn't jump when data arrives. Compose inside the `Chart` card in place
 * of `Metric`.
 */
export const MetricSkeleton: FC<MetricSkeletonProps> = ({
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='metric-skeleton'
      data-testid={testId}
      aria-busy='true'
      aria-live='polite'
      className={cn(metricRootClasses, className)}
    >
      <Skeleton width='72px' height='36px' rounded={6} />
      <div data-slot='metric-skeleton-line' className={metricSkeletonLineClasses}>
        <Skeleton width='100%' height='8px' rounded={6} />
      </div>
    </div>
  );
};

MetricSkeleton.displayName = 'MetricSkeleton';
