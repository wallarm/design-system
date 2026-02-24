import type { ElementType, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { PolymorphicComponentProps } from '../Polymorphic';

const headingVariants = cva('font-sans-display text-text-primary tracking-[-0.02em]', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl',
    },
    weight: {
      light: 'font-light',
      regular: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    },
    color: {
      primary: 'text-text-primary',
      'primary-alt': 'text-text-primary-alt',
      secondary: 'text-text-secondary',
      'secondary-alt': 'text-text-secondary-alt',
      inherit: 'text-inherit',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    grow: {
      true: 'flex-1 w-full',
    },
    truncate: {
      true: 'truncate',
    },
  },
});

type HeadingVariantProps = VariantProps<typeof headingVariants>;

export interface HeadingBaseProps {
  asChild?: boolean;
  lineClamp?: number;
  ref?: Ref<HTMLElement>;
}

export type HeadingProps<C extends ElementType = 'h1'> = PolymorphicComponentProps<
  C,
  HeadingVariantProps & HeadingBaseProps
>;

export const Heading: FC<
  PolymorphicComponentProps<ElementType, HeadingVariantProps & HeadingBaseProps>
> = ({
  as = 'h1',
  size = 'xl',
  weight = 'bold',
  color = 'inherit',
  asChild = false,
  truncate = false,
  grow = false,
  align,
  lineClamp,
  ...props
}) => {
  const Component = asChild ? Slot : as;

  return (
    <Component
      {...props}
      className={cn(
        headingVariants({ size, weight, truncate, color, align, grow }),
        lineClamp && `line-clamp-${lineClamp}`,
      )}
    />
  );
};

Heading.displayName = 'Heading';
