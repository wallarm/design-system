import { cva } from 'class-variance-authority';

export const selectFooterVariants = cva('shrink-0 border-t', {
  variants: {
    variant: {
      /** Free-form footer: padded row on the outline-button surface. */
      default: 'border-border-primary bg-component-outline-button-bg px-16 py-8',
      /**
       * Menu actions row (Figma select-menu footer): the divider bleeds to the menu border, the
       * row keeps the menu's 8px inset and right-aligns its buttons.
       */
      actions: 'flex items-center justify-end gap-8 border-border-primary-light p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
