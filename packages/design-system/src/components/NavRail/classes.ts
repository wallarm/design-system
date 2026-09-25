import { cva } from 'class-variance-authority';

export const navRailVariants = cva(
  'flex h-full shrink-0 flex-col overflow-hidden px-8 pt-6 pb-12 transition-[width] duration-200 ease-in-out',
  {
    variants: {
      collapsed: {
        true: 'w-[48px]',
        false: 'w-[184px]',
      },
    },
    defaultVariants: { collapsed: false },
  },
);

export const navRailItemVariants = cva(
  'overlay flex h-32 w-full cursor-pointer items-center rounded-10 p-8 text-sm text-text-primary transition-colors outline-none data-[state=open]:overlay-states-primary-active',
  {
    variants: {
      active: {
        true: 'overlay-states-primary-active',
        false:
          'hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
      },
    },
    defaultVariants: { active: false },
  },
);
