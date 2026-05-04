import { cva } from 'class-variance-authority';

export const segmentVariants = cva(
  'flex items-center justify-center gap-2 shrink-0 text-sm leading-5 whitespace-nowrap font-sans',
  {
    variants: {
      variant: {
        default: 'text-text-secondary font-normal',
        highlighted: 'text-text-primary font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const encodingVariants = cva([
  'flex items-center justify-center shrink-0 gap-2',
  'rounded-8 border-1 border-dashed border-border-primary',
  'px-4 py-2',
  'font-mono text-xs leading-4 text-text-secondary',
]);

export const jointVariants = cva('flex items-center shrink-0 p-2 text-icon-secondary');

export const ellipsisVariants = cva([
  'flex items-center justify-center shrink-0',
  'min-h-5 px-2 gap-2',
  'text-text-secondary',
]);
