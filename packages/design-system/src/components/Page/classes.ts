import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const pageTabVariants = cva(
  cn(
    'relative inline-flex items-center justify-center',
    'rounded-lg bg-transparent',
    'border-b-2 border-transparent',
    'transition-all cursor-pointer',
    'text-text-secondary font-medium font-sans whitespace-nowrap',
    'h-32 px-8 py-6 gap-6',
    'text-sm',
    'not-disabled:hover:bg-states-primary-hover not-disabled:hover:text-text-primary',
    'not-disabled:active:bg-states-primary-pressed not-disabled:active:text-text-secondary',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:bg-states-primary-hover',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ),
  {
    variants: {
      active: {
        true: cn('text-text-primary border-b-border-brand'),
        false: '',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);
