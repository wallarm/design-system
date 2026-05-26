import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Skeleton } from '../Skeleton';

export interface NavPanelSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  count?: number;
}

export const NavPanelSkeleton: FC<NavPanelSkeletonProps> = ({
  ref,
  className,
  count = 6,
  ...props
}) => {
  const testId = useTestId('skeleton');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-panel-skeleton'
      data-testid={testId}
      className={cn('flex flex-col gap-6', className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} width='100%' height='28px' rounded={6} />
      ))}
    </div>
  );
};

NavPanelSkeleton.displayName = 'NavPanelSkeleton';
