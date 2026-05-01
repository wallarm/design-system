import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { Skeleton } from '../../Skeleton';
import {
  pieChartDonutClasses,
  pieChartLegendClasses,
  pieChartRootClasses,
  pieChartSkeletonRowClasses,
} from './classes';

export interface PieChartSkeletonProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Number of skeleton rows in the legend column. Defaults to `5`. */
  rows?: number;
}

const PieChartSkeletonRow: FC = () => {
  const testId = useTestId('skeleton-row');

  return (
    <div
      data-slot='pie-chart-skeleton-row'
      data-testid={testId}
      className={pieChartSkeletonRowClasses}
    >
      <Skeleton width='100%' height='24px' rounded={6} />
    </div>
  );
};

PieChartSkeletonRow.displayName = 'PieChartSkeletonRow';

export const PieChartSkeleton: FC<PieChartSkeletonProps> = ({
  rows = 5,
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
        data-slot='pie-chart-skeleton'
        data-testid={testId}
        aria-busy='true'
        aria-live='polite'
        className={cn(pieChartRootClasses, className)}
      >
        <div className={cn(pieChartDonutClasses, 'flex items-center justify-center')}>
          {/* 48px transparent disc keeps the ring metrics in sync with `PIE_DONUT_INNER_RADIUS`. */}
          <Skeleton
            width='120px'
            height='120px'
            rounded='full'
            className='mask-[radial-gradient(circle,transparent_48px,#000_49px)]'
          />
        </div>
        <div className={cn(pieChartLegendClasses, 'gap-8 pl-0 pr-12 py-12')}>
          {Array.from({ length: rows }, (_, i) => (
            <PieChartSkeletonRow key={i} />
          ))}
        </div>
      </div>
    </TestIdProvider>
  );
};

PieChartSkeleton.displayName = 'PieChartSkeleton';
