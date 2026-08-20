import type { FC, HTMLAttributes, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { indicatorVariants } from './classes';

type IndicatorNativeProps = HTMLAttributes<HTMLSpanElement>;

type IndicatorVariantProps = VariantProps<typeof indicatorVariants>;

interface IndicatorBaseProps {
  ref?: Ref<HTMLSpanElement>;
}

export type IndicatorProps = IndicatorNativeProps &
  IndicatorVariantProps &
  IndicatorBaseProps &
  TestableProps;

export const Indicator: FC<IndicatorProps> = ({
  ref,
  className,
  size = 'md',
  color = 'info',
  ...props
}) => {
  return (
    <span
      {...props}
      ref={ref}
      className={cn(indicatorVariants({ size, color }), className)}
      data-slot='indicator'
    />
  );
};

Indicator.displayName = 'Indicator';
