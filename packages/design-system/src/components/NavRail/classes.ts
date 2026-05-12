import { cva } from 'class-variance-authority';

export const navRailVariants = cva(
  'flex h-full shrink-0 flex-col overflow-hidden px-8 py-6 transition-[width] duration-200 ease-in-out',
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
  'overlay flex h-32 cursor-pointer items-center rounded-6 p-8 text-sm transition-colors',
  {
    variants: {
      active: {
        true: 'overlay-states-primary-active text-text-primary',
        false:
          'text-text-secondary hover:overlay-states-primary-hover active:overlay-states-primary-pressed',
      },
    },
    defaultVariants: { active: false },
  },
);
