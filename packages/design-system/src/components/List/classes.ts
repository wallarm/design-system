import { cva } from 'class-variance-authority';

export const listVariants = cva('flex flex-col', {
  variants: {
    spacing: {
      0: 'gap-0',
      2: 'gap-2',
      4: 'gap-4',
      8: 'gap-8',
      12: 'gap-12',
      16: 'gap-16',
      24: 'gap-24',
    },
    marker: {
      none: 'list-none',
      disc: 'list-disc pl-24',
      decimal: 'list-decimal pl-24',
    },
  },
  defaultVariants: {
    spacing: 4,
    marker: 'none',
  },
});

export const listItemVariants = cva('flex');

export const listIconVariants = cva('mr-6 inline-flex shrink-0 items-center align-middle');
