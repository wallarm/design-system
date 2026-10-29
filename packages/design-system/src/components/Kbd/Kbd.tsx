import type { ComponentProps, FC } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';

const kbdVariants = cva(
  cn(
    'inline-flex w-fit items-center justify-center gap-1',
    'rounded-4 border border-component-border-hotkey bg-bg-surface-2',
    'font-sans font-medium',
    'text-xs text-text-primary',
    'pointer-events-none select-none',
  ),
  {
    variants: {
      size: {
        xsmall: 'h-16 min-w-20 p-2',
        small: 'h-20 min-w-20 p-4',
        medium: 'h-24 min-w-24 p-6',
      },
    },
  },
);

type KbdVariantsProps = VariantProps<typeof kbdVariants>;

type KbdProps = ComponentProps<'kbd'> & KbdVariantsProps & TestableProps;

export const Kbd: FC<KbdProps> = ({ size = 'small', ...props }) => (
  <kbd {...props} data-slot='kbd' className={cn(kbdVariants({ size }))} />
);

Kbd.displayName = 'Kbd';
