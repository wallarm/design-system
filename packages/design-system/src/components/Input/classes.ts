import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  [
    'flex w-full px-12 rounded-8 border bg-component-input-bg',
    'font-sans text-sm text-text-primary placeholder:text-text-secondary',
    'shadow-xs transition-[color,border,box-shadow]',
    'focus-visible:outline-none focus-visible:ring-3',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      error: {
        true: 'border-border-strong-danger hover:not-disabled:border-border-strong-danger hover:not-disabled:outline-none hover:not-disabled:ring-3 hover:not-disabled:ring-focus-destructive-hover focus-visible:ring-focus-destructive',
        false: [
          'border-border-primary hover:not-disabled:border-component-border-input-hover',
          'focus-visible:not-disabled:border-border-strong-primary focus-visible:ring-focus-primary',
        ],
      },
    },
  },
);
