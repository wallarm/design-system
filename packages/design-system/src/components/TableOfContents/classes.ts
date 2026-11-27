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

/** Minimized-view dash: a 2px bar, long for level 1, short for level 2, longest and dark when active. */
export const tableOfContentsDashVariants = cva(
  'relative block h-14 w-full before:absolute before:top-6 before:left-4 before:h-2 before:rounded-2',
  {
    variants: {
      level: { 1: '', 2: '' },
      active: {
        true: 'before:w-28 before:bg-text-primary',
        false: 'before:bg-border-primary',
      },
    },
    compoundVariants: [
      { active: false, level: 1, class: 'before:w-21' },
      { active: false, level: 2, class: 'before:w-12' },
    ],
    defaultVariants: { level: 1, active: false },
  },
);
