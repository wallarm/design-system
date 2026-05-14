import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { Skeleton } from '../../Skeleton';

export interface ChartPieSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  rows?: number;
}

export const ChartPieSkeleton: FC<ChartPieSkeletonProps> = ({
  ref,
  rows = 5,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-pie-skeleton'
      className={cn('flex items-start', className)}
    >
      <div className='relative shrink-0' style={{ width: 168, height: 136 }}>
        <div
          className='absolute left-24 top-8 overflow-hidden rounded-full'
          style={{
            width: 120,
            height: 120,
            WebkitMaskImage: 'radial-gradient(circle, transparent 40px, black 41px)',
            maskImage: 'radial-gradient(circle, transparent 40px, black 41px)',
          }}
        >
          <Skeleton width='120px' height='120px' rounded='full' />
        </div>
      </div>
      <div className='flex flex-1 flex-col gap-8 pr-12'>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width='100%' height='24px' rounded={6} />
        ))}
      </div>
    </div>
  );
};

ChartPieSkeleton.displayName = 'ChartPieSkeleton';
