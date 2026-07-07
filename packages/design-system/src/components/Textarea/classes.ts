import { cva } from 'class-variance-authority';

export const textareaPaddingVariants = cva('', {
  variants: {
    size: {
      small: 'py-0',
      medium: 'py-6',
      default: 'py-8',
    },
  },
});

export const textareaHeightVariants = cva('min-h-[64px]', {
  variants: {
    size: {
      small: 'min-h-[64px]',
      medium: 'min-h-[72px]',
      default: 'min-h-[76px]',
    },
  },
});
