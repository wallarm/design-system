import { type CSSProperties, type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
import { Skeleton } from '../../Skeleton';
import { funnelColumnClasses } from './classes';
import { FUNNEL_BAND_HEIGHT, FUNNEL_MAX_BODY } from './constants';
import { funnelSegmentPath } from './lib/funnelGeometry';

/** The silhouette narrows linearly from the full body to this thickness on the last step. */
const SKELETON_MIN_BODY = 40;

export interface FunnelSkeletonProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Number of step columns. Defaults to `3`. */
  steps?: number;
}

/**
 * Loading placeholder for `Funnel`: the same 288px track and step dividers, a shimmer block per
 * title line (name, value, caption) and a shimmering funnel silhouette in place of the ribbon,
 * so the card does not jump when the data arrives.
 */
export const FunnelSkeleton: FC<FunnelSkeletonProps> = ({
  steps = 3,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const clipId = useId();
  const count = Math.max(1, steps);
  const thickness = (i: number) =>
    count === 1
      ? FUNNEL_MAX_BODY
      : FUNNEL_MAX_BODY - ((FUNNEL_MAX_BODY - SKELETON_MIN_BODY) * i) / (count - 1);

  return (
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
        // The clip url rides on a CSS variable: `Skeleton` owns its own `style`.
        style={
          {
            '--funnel-steps': count,
            '--funnel-skeleton-clip': `url("#${clipId}")`,
          } as CSSProperties
        }
      >
        {/* Ribbon silhouette: one shimmer block clipped to the funnel shape. The clip path is in
            bounding-box units (x 0..1 across all steps), so it stretches with the track. */}
        <svg aria-hidden className='absolute size-0'>
          <clipPath id={clipId} clipPathUnits='objectBoundingBox'>
            {Array.from({ length: count }, (_, i) => (
              <path
                // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
                key={i}
                transform={`scale(1 ${1 / FUNNEL_BAND_HEIGHT})`}
                d={funnelSegmentPath(
                  thickness(i),
                  thickness(Math.min(i + 1, count - 1)),
                  0,
                  i / count,
                  1 / count,
                )}
              />
            ))}
          </clipPath>
        </svg>
        <Skeleton
          data-slot='funnel-skeleton-ribbon'
          data-testid={testId ? `${testId}--ribbon` : undefined}
          width='100%'
          height={`${FUNNEL_BAND_HEIGHT}px`}
          rounded='none'
          className='absolute inset-x-0 top-100 [clip-path:var(--funnel-skeleton-clip)] rtl:-scale-x-100'
        />
        {/* Own row after the ribbon: the dividers paint over it and `not-first:` sees only columns. */}
        <div className='relative flex flex-1 min-w-0'>
          {Array.from({ length: count }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
              key={i}
              data-slot='funnel-skeleton-column'
              className={cn(
                funnelColumnClasses,
                'not-first:border-l not-first:border-border-primary-light',
              )}
            >
              {/* Mirrors the FunnelStep cell: padding, 2px gap, name / value / caption line boxes. */}
              <div className='flex flex-col gap-2 pt-8 px-12'>
                <Skeleton width='64px' height='16px' rounded={4} />
                <Skeleton width='48px' height='28px' rounded={6} />
                <Skeleton width='96px' height='16px' rounded={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FunnelSkeleton.displayName = 'FunnelSkeleton';
