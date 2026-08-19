import { cva } from 'class-variance-authority';

export const passwordComplexityIconVariants = cva('', {
  variants: {
    met: {
      true: 'text-text-success',
      false: 'text-text-tertiary',
    },
  },
});

export const passwordComplexityLabelVariants = cva('text-sm', {
  variants: {
    met: {
      true: 'text-text-secondary line-through',
      false: 'text-text-primary',
    },
  },
});
