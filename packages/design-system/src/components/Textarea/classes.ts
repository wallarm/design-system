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

export const textareaHeightVariants = cva('min-h-[60px]', {
  variants: {
    size: {
      small: 'min-h-[60px]',
      medium: 'min-h-[72px]',
      default: 'min-h-[76px]',
    },
  },
});
