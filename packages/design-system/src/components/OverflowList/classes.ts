import { cva } from 'class-variance-authority';

export const overflowListMoreItemVariants = cva('flex', {
  variants: {
    dimmed: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: {
    dimmed: false,
  },
});
