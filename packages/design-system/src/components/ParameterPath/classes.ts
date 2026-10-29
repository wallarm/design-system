import { cva } from 'class-variance-authority';

export const rowVariants = cva('flex min-w-0 items-center gap-0', {
  variants: {
    expanded: {
      // Expanded wraps (won't fit on one line); collapsed clips.
      true: 'flex-wrap',
      false: 'overflow-hidden',
    },
  },
  defaultVariants: {
    expanded: false,
  },
});

export const segmentVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 font-sans text-sm leading-5 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'font-normal text-text-secondary',
        highlighted: 'font-medium text-text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const encodingVariants = cva([
  'flex shrink-0 items-center justify-center gap-2',
  'h-20 rounded-8 border-1 border-dashed border-border-primary',
  'px-4',
  'font-mono text-xs leading-4 text-text-secondary',
]);

export const jointVariants = cva('flex shrink-0 items-center p-2 text-icon-secondary');

export const ellipsisVariants = cva([
  'flex shrink-0 items-center justify-center',
  'h-20 gap-2 px-2',
  'text-text-secondary',
]);
