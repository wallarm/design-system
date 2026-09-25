import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Skeleton } from '../Skeleton';
import { navRailSkeletonVariants } from './classes';
import { type NavRailMode, useNavRailContext } from './NavRailContext';

export interface NavRailSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  count?: number;
}

// Bar sizes per mode, 2px inside the 32px items and 4px/2px inside the 62×42px compact ones.
// `as const` keeps the literal sizes, which is what Skeleton's px/% dimension type needs.
const SKELETON_BARS = {
  expanded: { width: '100%', height: '28px' },
  collapsed: { width: '28px', height: '28px' },
  compact: { width: '54px', height: '38px' },
} as const satisfies Record<NavRailMode, { width: string; height: string }>;

export const NavRailSkeleton: FC<NavRailSkeletonProps> = ({
  ref,
  className,
  count = 4,
  ...props
}) => {
  const { mode } = useNavRailContext();
  const testId = useTestId('skeleton');
  const bar = SKELETON_BARS[mode];

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-rail-skeleton'
      data-testid={testId}
      className={cn(navRailSkeletonVariants({ mode }), className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} width={bar.width} height={bar.height} rounded={10} />
      ))}
    </div>
  );
};

NavRailSkeleton.displayName = 'NavRailSkeleton';
