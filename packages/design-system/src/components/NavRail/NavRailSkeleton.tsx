import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Skeleton } from '../Skeleton';
import { useNavRailContext } from './NavRailContext';

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
  const { collapsed } = useNavRailContext();
  const testId = useTestId('skeleton');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-rail-skeleton'
      data-testid={testId}
      // 28px bars on a 34px pitch, inset 2px so each one centres on the 32px item it stands in for.
      className={cn('flex flex-col items-center gap-6 py-2', className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} width={collapsed ? '28px' : '100%'} height='28px' rounded={10} />
      ))}
    </div>
  );
};

NavRailSkeleton.displayName = 'NavRailSkeleton';
