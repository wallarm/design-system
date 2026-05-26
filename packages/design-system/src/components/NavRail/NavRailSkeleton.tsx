import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Skeleton } from '../Skeleton';

export interface NavRailSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  count?: number;
}

export const NavRailSkeleton: FC<NavRailSkeletonProps> = ({
  ref,
  className,
  count = 4,
  ...props
}) => {
  const testId = useTestId('skeleton');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-rail-skeleton'
      data-testid={testId}
      className={cn('flex flex-col gap-6', className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} width='100%' height='28px' rounded={6} />
      ))}
    </div>
  );
};

NavRailSkeleton.displayName = 'NavRailSkeleton';
