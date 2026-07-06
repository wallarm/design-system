import { cva } from 'class-variance-authority';

export const treeViewRowVariants = cva(
  'group/row relative flex min-h-24 w-full items-center gap-4 px-8 py-2 text-left',
  {
    variants: {
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
      selected: {
        true: 'bg-states-primary-default-alt',
        false: '',
      },
    },
    compoundVariants: [
      {
        interactive: true,
        selected: false,
        className: 'hover:not-data-[selected=true]:bg-states-primary-hover',
      },
    ],
    defaultVariants: {
      interactive: false,
      selected: false,
    },
  },
);
