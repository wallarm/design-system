import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { Skeleton } from '../../Skeleton';

export interface ChartLineSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  height?: number;
  showLegend?: boolean;
}

export const ChartLineSkeleton: FC<ChartLineSkeletonProps> = ({
  ref,
  height = 200,
  showLegend = false,
  className,
  ...props
}) => {
  return (
    <div {...props} ref={ref} data-slot='chart-line-skeleton' className={cn('pb-12', className)}>
      {showLegend && (
        <div className='flex items-center gap-12 px-12 pb-8'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton width='8px' height='8px' rounded={4} />
              <Skeleton width='60px' height='12px' rounded={4} />
            </div>
          ))}
        </div>
      )}
      <div className='px-12' style={{ height }}>
        <div className='flex h-full flex-col justify-between py-10'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-px w-full border-t-1 border-dashed border-border-primary-light'
            />
          ))}
        </div>
      </div>
    </div>
  );
};

ChartLineSkeleton.displayName = 'ChartLineSkeleton';
