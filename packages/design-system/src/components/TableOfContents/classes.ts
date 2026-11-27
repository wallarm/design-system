import { cva } from 'class-variance-authority';

/** Row link — NavPanel row states, plus the ToC rail indent and an outer focus ring. */
export const tableOfContentsItemVariants = cva(
  'overlay flex min-h-32 w-full cursor-pointer items-start gap-8 rounded-10 py-6 pr-8 text-sm text-text-secondary transition-colors outline-none hover:overlay-states-primary-hover hover:text-text-primary active:overlay-states-primary-pressed active:text-text-primary focus-visible:ring-3 focus-visible:ring-focus-primary',
  {
    variants: {
      level: {
        1: 'pl-32',
        2: 'pl-48',
      },
      active: {
        true: 'text-text-primary',
        false: '',
      },
    },
    defaultVariants: { level: 1, active: false },
  },
);
