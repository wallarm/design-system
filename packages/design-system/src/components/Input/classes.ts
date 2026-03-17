import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const inputVariants = cva(
  cn(
    'flex w-full px-12 rounded-8 border bg-component-input-bg',
    'font-sans text-sm text-text-primary placeholder:text-text-secondary',
    'shadow-xs transition-[color,border,box-shadow]',
    'focus-visible:outline-none focus-visible:ring-3',

    'disabled:aria-disabled:cursor-not-allowed disabled:aria-disabled:opacity-50',
  ),
  {
    variants: {
      error: {
        true: cn(
          'border-border-strong-danger',

          'hover:not-disabled:border-border-strong-danger',
          'hover:not-disabled:outline-none',
          'hover:not-disabled:ring-3',
          'hover:not-disabled:ring-focus-destructive-hover',

          'focus-visible:ring-focus-destructive',
        ),
        false: cn(
          'border-border-primary',

          'hover:not-disabled:border-component-border-input-hover',

          'focus-visible:not-disabled:border-border-strong-primary',
          'focus-visible:ring-focus-primary',
        ),
      },
    },
  },
);
