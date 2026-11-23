import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { funnelColumnClasses } from './classes';

export interface FunnelSkeletonProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Number of empty step columns. Defaults to `3`. */
  steps?: number;
}

/** Loading placeholder for `Funnel`: the empty 288px frame with only the step dividers. */
export const FunnelSkeleton: FC<FunnelSkeletonProps> = ({
  steps = 3,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => (
  <TestIdProvider value={testId}>
    <div
      {...props}
      ref={ref}
      data-slot='funnel-skeleton'
      data-testid={testId}
      aria-busy='true'
      aria-live='polite'
      className={cn('relative flex h-288 min-w-240', className)}
    >
      {Array.from({ length: steps }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
          key={i}
          data-slot='funnel-skeleton-column'
          className={cn(funnelColumnClasses, i > 0 && 'border-l border-border-primary-light')}
        />
      ))}
    </div>
  </TestIdProvider>
);

FunnelSkeleton.displayName = 'FunnelSkeleton';
