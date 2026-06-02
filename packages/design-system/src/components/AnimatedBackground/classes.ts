import { cva } from 'class-variance-authority';

export const animatedBackgroundVariants = cva('h-full w-full pointer-events-none', {
  variants: {
    texture: {
      clean: '',
      halftone: '',
    },
  },
  defaultVariants: {
    texture: 'halftone',
  },
});
