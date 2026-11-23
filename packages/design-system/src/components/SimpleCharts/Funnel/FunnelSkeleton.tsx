import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
import { funnelRootClasses, funnelStepClasses } from './classes';

export interface FunnelSkeletonProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Number of step columns to draw. Defaults to `3`. */
  steps?: number;
}

/**
 * Loading frame: an empty plot with only the step dividers, like the `LineChart`
 * loading grid. Same height as a drawn funnel, so the card does not jump.
 */
export const FunnelSkeleton: FC<FunnelSkeletonProps> = ({
  steps = 3,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => (
  <div
    aria-busy='true'
    {...props}
    ref={ref}
    data-slot='funnel-skeleton'
    data-testid={testId}
    className={cn(funnelRootClasses, className)}
  >
    {Array.from({ length: Math.max(steps, 1) }, (_, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder columns
      <div key={index} className={cn(funnelStepClasses, 'h-288')} />
    ))}
  </div>
);

FunnelSkeleton.displayName = 'FunnelSkeleton';
