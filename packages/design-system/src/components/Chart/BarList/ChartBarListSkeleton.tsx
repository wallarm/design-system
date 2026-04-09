import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { Skeleton } from '../../Skeleton';
import { ROW_HEIGHT } from './constants';

export interface ChartBarListSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  rows?: number;
}

export const ChartBarListSkeleton: FC<ChartBarListSkeletonProps> = ({
  ref,
  rows = 5,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-bar-list-skeleton'
      className={cn('flex flex-col', className)}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex items-center px-8' style={{ height: ROW_HEIGHT }}>
          <Skeleton width='100%' height='24px' rounded={6} />
        </div>
      ))}
    </div>
  );
};

ChartBarListSkeleton.displayName = 'ChartBarListSkeleton';
