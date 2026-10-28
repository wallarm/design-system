import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const pageTabVariants = cva(
  cn(
    'relative inline-flex items-center justify-center',
    'rounded-lg bg-transparent',
    'border-b-2 border-transparent',
    'cursor-pointer transition-all',
    'font-sans font-medium whitespace-nowrap text-text-secondary',
    'h-32 gap-6 px-8 py-6',
    'text-sm',
    'not-disabled:hover:bg-states-primary-hover not-disabled:hover:text-text-primary',
    'not-disabled:active:bg-states-primary-pressed not-disabled:active:text-text-secondary',
    'focus-visible:bg-states-primary-hover focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  {
    variants: {
      active: {
        true: cn('border-b-border-brand text-text-primary'),
        false: '',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);
