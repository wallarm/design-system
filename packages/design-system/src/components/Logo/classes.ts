import { cva } from 'class-variance-authority';

export const logoVariants = cva('inline-block shrink-0', {
  variants: {
    size: {
      xs: 'h-[10px]',
      sm: 'h-[12px]',
      md: 'h-[16px]',
      lg: 'h-[20px]',
      xl: 'h-[24px]',
      '2xl': 'h-[32px]',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});
