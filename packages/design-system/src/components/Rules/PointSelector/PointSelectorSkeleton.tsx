import type { FC } from 'react';
import { Skeleton } from '../../Skeleton';
import { Text } from '../../Text';

/**
 * PointSelectorSkeleton Component
 *
 * Loading skeleton shown while SDK initializes.
 * Matches PointSelector layout with placeholder shapes.
 */
export const PointSelectorSkeleton: FC = () => {
  return (
    <div data-slot='point-selector-skeleton' className='flex flex-col gap-12'>
      <div className='flex flex-col gap-8 rounded-12 border border-border-primary-light bg-bg-surface-1 p-12'>
        <div className='flex items-center justify-between gap-12'>
          <Skeleton width='200px' height='20px' rounded={4} />
          <Skeleton width='160px' height='36px' rounded={8} />
        </div>
        <div className='flex flex-col gap-8'>
          <Skeleton width='100%' height='40px' rounded={8} />
          <Skeleton width='180px' height='16px' rounded={4} />
        </div>
      </div>
      <div className='flex items-center justify-center py-8'>
        <Text size='sm' color='secondary'>
          Loading SDK...
        </Text>
      </div>
    </div>
  );
};

PointSelectorSkeleton.displayName = 'PointSelectorSkeleton';
