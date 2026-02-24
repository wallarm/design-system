import type { FC, HTMLAttributes, PropsWithChildren, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const skeletonVariants = cva('overflow-clip relative rounded-6', {
  variants: {
    transparent: {
      true: '',
      false: 'bg-bg-surface-1',
    },
  },
  defaultVariants: {
    transparent: true,
  },
});

type SkeletonVariantsProps = VariantProps<typeof skeletonVariants>;

interface SkeletonBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  loading?: boolean;
  animated?: boolean;
  width?: string | number;
  height?: string | number;
  rounded?: number;
}

export type SkeletonProps = HTMLAttributes<HTMLDivElement> &
  SkeletonVariantsProps &
  SkeletonBaseProps &
  PropsWithChildren;

export const Skeleton: FC<SkeletonProps> = ({
  ref,
  asChild = false,
  loading = true,
  animated = true,
  transparent = true,
  width,
  height,
  rounded,
  className,
  children,
  ...props
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      {...props}
      ref={ref}
      data-slot='skeleton'
      className={cn('w-full h-[20px]', skeletonVariants({ transparent }), className)}
      style={{ width, height, borderRadius: rounded }}
    >
      <div
        className={cn('absolute inset-0', animated && 'animate-pulse')}
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(71, 85, 105, 0.06) 0px, rgba(71, 85, 105, 0.16) 284px, rgba(71, 85, 105, 0.06) 568px, rgba(71, 85, 105, 0.16) 852px)',
          backgroundSize: '852px 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />
    </Comp>
  );
};

Skeleton.displayName = 'Skeleton';
