import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { Skeleton } from '../../Skeleton';
import { barListRootClasses, barListSkeletonRowClasses } from './classes';

export interface BarListSkeletonProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Number of skeleton rows to render. Defaults to `5`. */
  rows?: number;
}

const BarListSkeletonRow: FC = () => {
  const testId = useTestId('skeleton-row');

  return (
    <div
      data-slot='bar-list-skeleton-row'
      data-testid={testId}
      className={barListSkeletonRowClasses}
    >
      <Skeleton width='100%' height='24px' rounded={6} />
    </div>
  );
};

BarListSkeletonRow.displayName = 'BarListSkeletonRow';

export const BarListSkeleton: FC<BarListSkeletonProps> = ({
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
        data-slot='bar-list-skeleton'
        data-testid={testId}
        aria-busy='true'
        aria-live='polite'
        className={cn(barListRootClasses, className)}
      >
        {Array.from({ length: rows }, (_, i) => (
          <BarListSkeletonRow key={i} />
        ))}
      </div>
    </TestIdProvider>
  );
};

BarListSkeleton.displayName = 'BarListSkeleton';
