import type { CSSProperties, FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const skeletonVariants = cva(cn('overflow-hidden', 'animate-skeleton'), {
  variants: {
    transparent: {
      true: '',
      false: 'bg-bg-surface-1',
    },
    rounded: {
      none: 'rounded-none',
      full: 'rounded-full',
      2: 'rounded-2',
      4: 'rounded-4',
      6: 'rounded-6',
      8: 'rounded-8',
      12: 'rounded-12',
      16: 'rounded-16',
      24: 'rounded-24',
      32: 'rounded-32',
    },
    withDimensions: {
      true: 'w-(--skeleton-width) h-(--skeleton-height)',
    },
    withChildren: {
      true: 'select-none pointer-events-none text-transparent *:invisible',
    },
  },
  defaultVariants: {
    transparent: true,
  },
});

type SkeletonVariantsProps = VariantProps<typeof skeletonVariants>;

type SkeletonDimension = `${number}px` | `${number}%`;

interface SkeletonSharedProps {
  ref?: Ref<HTMLDivElement>;
  loading?: boolean;
}

type SkeletonStandaloneProps = SkeletonSharedProps & {
  width: SkeletonDimension;
  height: SkeletonDimension;
};

type SkeletonWrapProps = SkeletonSharedProps & {
  children: ReactNode;
  width?: never;
  height?: never;
};

export type SkeletonProps = HTMLAttributes<HTMLDivElement> &
  SkeletonVariantsProps &
  (SkeletonStandaloneProps | SkeletonWrapProps);

export const Skeleton: FC<SkeletonProps> = ({
  children,
  ref,
  className,
  width,
  height,
  loading = true,
  transparent = true,
  rounded = 6,
  ...props
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  const style = {
    ...(width ? { '--skeleton-width': width } : {}),
    ...(height ? { '--skeleton-height': height } : {}),
  } as CSSProperties;

  return (
    <div
      {...props}
      ref={ref}
      data-slot='skeleton'
      style={style}
      className={cn(
        skeletonVariants({
          transparent,
          rounded,
          withDimensions: !!width && !!height,
          withChildren: !!children,
        }),
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
