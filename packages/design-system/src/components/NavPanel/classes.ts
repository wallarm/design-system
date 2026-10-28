import { cva } from 'class-variance-authority';

export const navPanelItemVariants = cva(
  'overlay flex h-32 w-full shrink-0 cursor-pointer items-center gap-8 rounded-10 p-8 text-sm text-text-primary transition-colors outline-none',
  {
    variants: {
      active: {
        true: 'overlay-states-primary-active font-semibold branded:overlay-states-brand-active branded:text-text-brand',
        false:
          'hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
      },
    },
    defaultVariants: { active: false },
  },
);

export const navPanelGroupItemVariants = cva(
  'overlay flex h-32 w-full shrink-0 cursor-pointer items-center gap-8 rounded-10 py-8 pr-8 text-sm text-text-primary transition-colors outline-none',
  {
    variants: {
      active: {
        true: 'overlay-states-primary-active font-semibold branded:overlay-states-brand-active branded:text-text-brand',
        false:
          'hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
      },
    },
    defaultVariants: { active: false },
  },
);
