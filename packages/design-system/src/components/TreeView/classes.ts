import { cva } from 'class-variance-authority';

export const treeViewRowVariants = cva(
  'group/row relative flex min-h-24 w-full items-center gap-4 px-8 py-2 text-left',
  {
    variants: {
      interactive: {
        true: 'cursor-pointer active:bg-states-primary-pressed',
        false: '',
      },
      selected: {
        true: 'bg-states-primary-default-alt',
        false: '',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      {
        interactive: true,
        selected: false,
        // Exclude :active so pressed (:active) always wins over hover on every click.
        className: '[&:hover:not(:active)]:bg-states-primary-hover',
      },
    ],
    defaultVariants: {
      interactive: false,
      selected: false,
      disabled: false,
    },
  },
);
