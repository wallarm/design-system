import { cva } from 'class-variance-authority';

export const wallyIconVariants = cva('inline-block shrink-0', {
  variants: {
    size: {
      xs: 'h-[16px]',
      sm: 'h-[20px]',
      md: 'h-[24px]',
      lg: 'h-[32px]',
      xl: 'h-[64px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
