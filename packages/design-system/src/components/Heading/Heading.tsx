import type { ElementType, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import type { PolymorphicComponentProps } from '../Polymorphic';

const headingVariants = cva('font-sans-display text-text-primary', {
  variants: {
    // Tracking is per-size, not a constant: it tightens as the size grows and is
    // normal below 20px. See --tracking-* in theme/typography.css.
    size: {
      sm: 'text-sm tracking-normal',
      md: 'text-base tracking-normal',
      lg: 'text-lg tracking-normal',
      xl: 'text-xl tracking-xl',
      '2xl': 'text-2xl tracking-2xl',
      '3xl': 'text-3xl tracking-3xl',
      '4xl': 'text-4xl tracking-4xl',
      '5xl': 'text-5xl tracking-5xl',
      '6xl': 'text-6xl tracking-6xl',
      '7xl': 'text-7xl tracking-7xl',
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
  HeadingVariantProps & HeadingBaseProps & TestableProps
>;

export const Heading: FC<
  PolymorphicComponentProps<ElementType, HeadingVariantProps & HeadingBaseProps & TestableProps>
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
