import type { FC, HTMLAttributes } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const numericBadgeVariants = cva(
  'inline-flex items-center rounded-full border-1 px-4 py-1 font-mono text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2',
  {
    variants: {
      type: {
        primary:
          'border-transparent bg-states-primary-active text-text-primary',
        'primary-alt':
          'border-transparent bg-states-primary-alt-active text-text-primary-alt',
        brand: 'border-bg-fill-brand bg-bg-fill-brand text-text-primary-alt',
        destructive:
          'border-bg-fill-danger bg-bg-fill-danger text-text-primary-alt',
        outline:
          'border-border-primary bg-component-outline-button-bg text-text-primary',
        info: 'border-states-info-active bg-states-info-active text-text-info',
      },
    },
  },
);

type NumericBadgeNativeProps = HTMLAttributes<HTMLDivElement>;

type NumericBadgeVariantsProps = VariantProps<typeof numericBadgeVariants>;

export type NumericBadgeProps = NumericBadgeNativeProps &
  NumericBadgeVariantsProps;

export const NumericBadge: FC<NumericBadgeProps> = ({
  type = 'primary',
  ...props
}) => {
  return (
    <div
      {...props}
      data-slot="numeric-badge"
      data-type={type}
      className={cn(numericBadgeVariants({ type }))}
    />
  );
};

NumericBadge.displayName = 'NumericBadge';
