import { cva } from 'class-variance-authority';

export const navPanelItemVariants = cva(
  'overlay flex h-32 shrink-0 w-full cursor-pointer items-center gap-8 rounded-6 p-8 text-sm transition-colors outline-none',
  {
    variants: {
      active: {
        true: 'overlay-states-primary-active font-semibold text-text-primary',
        false:
          'text-text-secondary hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
      },
    },
    defaultVariants: { active: false },
  },
);

export const navPanelGroupItemVariants = cva(
  'overlay flex h-32 shrink-0 w-full cursor-pointer items-center gap-8 rounded-6 py-8 pr-8 text-sm transition-colors outline-none',
  {
    variants: {
      active: {
        true: 'overlay-states-primary-active font-semibold text-text-primary',
        false:
          'text-text-secondary hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
      },
    },
    defaultVariants: { active: false },
  },
);
