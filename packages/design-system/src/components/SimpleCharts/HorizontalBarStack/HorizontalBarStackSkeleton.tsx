import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { Skeleton } from '../../Skeleton';
import {
  horizontalBarStackBarWrapperClasses,
  horizontalBarStackLegendClasses,
  horizontalBarStackRootClasses,
  horizontalBarStackSkeletonHeaderClasses,
} from './classes';

export interface HorizontalBarStackSkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Number of legend placeholder pills. Defaults to `3`. */
  legendItems?: number;
}

const HorizontalBarStackSkeletonLegendItem: FC = () => {
  const testId = useTestId('skeleton-legend-item');

  return (
    <div data-slot='horizontal-bar-stack-skeleton-legend-item' data-testid={testId}>
      <Skeleton width='72px' height='20px' rounded={6} />
    </div>
  );
};

HorizontalBarStackSkeletonLegendItem.displayName = 'HorizontalBarStackSkeletonLegendItem';

/**
 * Loading placeholder for `HorizontalBarStack`, matching `BarListSkeleton` /
 * `PieChartSkeleton`. Mirrors the loaded layout — a value-sized block where the
 * header sits, the 8px bar track, and legend pills — so the card doesn't jump
 * when data arrives. Compose inside the `Chart` card in place of the chart.
 */
export const HorizontalBarStackSkeleton: FC<HorizontalBarStackSkeletonProps> = ({
  legendItems = 3,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='horizontal-bar-stack-skeleton'
        data-testid={testId}
        aria-busy='true'
        aria-live='polite'
        className={cn(horizontalBarStackRootClasses, className)}
      >
        <div className={horizontalBarStackSkeletonHeaderClasses}>
          <Skeleton width='72px' height='36px' rounded={6} />
        </div>
        <div className={horizontalBarStackBarWrapperClasses}>
          <Skeleton width='100%' height='8px' rounded={6} />
        </div>
        <div className={horizontalBarStackLegendClasses}>
          {Array.from({ length: legendItems }, (_, i) => (
            <HorizontalBarStackSkeletonLegendItem key={i} />
          ))}
        </div>
      </div>
    </TestIdProvider>
  );
};

HorizontalBarStackSkeleton.displayName = 'HorizontalBarStackSkeleton';
