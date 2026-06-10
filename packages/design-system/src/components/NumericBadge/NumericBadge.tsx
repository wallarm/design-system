import type { FC, HTMLAttributes } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { numericBadgeVariants } from './classes';

type NumericBadgeNativeProps = HTMLAttributes<HTMLDivElement>;

type NumericBadgeVariantsProps = Omit<VariantProps<typeof numericBadgeVariants>, 'clickable'>;

export type NumericBadgeProps = NumericBadgeNativeProps & NumericBadgeVariantsProps & TestableProps;

export const NumericBadge: FC<NumericBadgeProps> = ({
  type = 'primary',
  size = 'default',
  onClick,
  ...props
}) => {
  const isClickable = !!onClick;

  return (
    <div
      {...props}
      tabIndex={isClickable ? 0 : undefined}
      data-slot='numeric-badge'
      data-type={type}
      onClick={onClick}
      className={cn(numericBadgeVariants({ type, size, clickable: isClickable }))}
    />
  );
};

NumericBadge.displayName = 'NumericBadge';
