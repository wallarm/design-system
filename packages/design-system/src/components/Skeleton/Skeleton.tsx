import type { ComponentProps, FC, PropsWithChildren, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const skeletonVariants = cva('animate-pulse bg-bg-primary rounded-6', {
  variants: {
    variant: {
      text: 'h-16 w-full',
      circular: 'rounded-full',
      rect: '',
      rounded: 'rounded-12',
    },
    asChild: {
      true: 'select-none pointer-events-none overflow-hidden text-transparent *:invisible',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'rect',
    asChild: false,
  },
});

type SkeletonNativeProps = ComponentProps<'div'>;

type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;

export type SkeletonProps = SkeletonNativeProps &
  SkeletonVariantProps &
  PropsWithChildren & {
    ref?: Ref<HTMLDivElement>;
    loading?: boolean;
  };

export const Skeleton: FC<SkeletonProps> = ({
  variant = 'rect',
  loading = true,
  asChild = false,
  className,
  children,
  ref,
  ...props
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      ref={ref}
      data-slot='skeleton'
      aria-hidden
      tabIndex={-1}
      className={cn(skeletonVariants({ variant, asChild }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

Skeleton.displayName = 'Skeleton';
