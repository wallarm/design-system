import type { ComponentProps, FC } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const kbdVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-1 w-fit',
    'border border-component-border-hotkey rounded-4 bg-bg-surface-2',
    'font-sans font-medium',
    'text-text-primary  text-xs',
    'pointer-events-none select-none',
  ),
  {
    variants: {
      size: {
        small: 'h-20 min-w-20 p-4',
        medium: 'h-24 min-w-24 p-6',
      },
    },
  },
);

type KbdVariantsProps = VariantProps<typeof kbdVariants>;

type KbdProps = ComponentProps<'kbd'> & KbdVariantsProps;

export const Kbd: FC<KbdProps> = ({ size = 'small', ...props }) => (
  <kbd {...props} data-slot="kbd" className={cn(kbdVariants({ size }))} />
);

Kbd.displayName = 'Kbd';
