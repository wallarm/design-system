import type { CSSProperties, FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
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
  <div
    {...props}
    ref={ref}
    data-slot='funnel-skeleton'
    data-testid={testId}
    aria-busy='true'
    aria-live='polite'
    className={cn('overflow-x-auto overflow-y-hidden', className)}
  >
    {/* Same track as Funnel, so loading and loaded take the same width and scroll alike. */}
    <div
      className='relative flex h-288 min-w-[max(240px,calc(var(--funnel-steps)*120px))]'
      style={{ '--funnel-steps': steps } as CSSProperties}
    >
      {Array.from({ length: steps }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
          key={i}
          data-slot='funnel-skeleton-column'
          className={cn(
            funnelColumnClasses,
            'not-first:border-l not-first:border-border-primary-light',
          )}
        />
      ))}
    </div>
  </div>
);

FunnelSkeleton.displayName = 'FunnelSkeleton';
