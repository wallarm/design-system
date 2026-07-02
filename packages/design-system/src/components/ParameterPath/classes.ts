import { cva } from 'class-variance-authority';

export const rowVariants = cva('flex items-center gap-0 min-w-0', {
  variants: {
    expanded: {
      // Expanded stays on one line and scrolls horizontally (an expanded path
      // never fits by definition — otherwise it would not have been collapsed);
      // collapsed clips.
      true: 'overflow-x-auto overflow-y-hidden [scrollbar-width:thin]',
      false: 'overflow-hidden',
    },
  },
  defaultVariants: {
    expanded: false,
  },
});

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
  'h-20 rounded-8 border-1 border-dashed border-border-primary',
  'px-4',
  'font-mono text-xs leading-4 text-text-secondary',
]);

export const jointVariants = cva('flex items-center shrink-0 p-2 text-icon-secondary');

export const ellipsisVariants = cva([
  'flex items-center justify-center shrink-0',
  'h-20 px-2 gap-2',
  'text-text-secondary',
]);
