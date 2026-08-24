import { cva } from 'class-variance-authority';

export const indicatorVariants = cva('inline-block shrink-0 rounded-2', {
  variants: {
    size: {
      sm: 'size-6',
      md: 'size-8',
    },
    color: {
      info: 'bg-icon-info',
      brand: 'bg-icon-brand',
      warning: 'bg-icon-warning',
      success: 'bg-icon-success',
      ai: 'bg-icon-ai',
      danger: 'bg-icon-danger',
    },
  },
  defaultVariants: {
    size: 'sm',
    color: 'info',
  },
});
