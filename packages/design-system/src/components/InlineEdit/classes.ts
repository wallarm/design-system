import { cva } from 'class-variance-authority';

export const inlineEditPreviewVariants = cva(
  // Typography/padding match Input's `size='small'` (2px padding + 20px/
  // text-sm line-height) so toggling into edit mode causes no visual jump.
  'group flex w-full min-w-0 gap-4 rounded-8 border border-transparent px-6 py-2 font-sans text-sm text-text-primary transition-colors',
  {
    variants: {
      // Multi-line values align the trigger icon to the top and grow with
      // content (lineClamp); single-line centers it and fixes the row at
      // Input's small 24px height (border-box: 2px padding + 1px border on
      // each side + the 20px text-sm line-height above = 24px total).
      multiline: {
        true: 'items-start',
        false: 'items-center h-24',
      },
      activatable: {
        true: '',
        false: '',
      },
      invalid: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Editable, no error: neutral hover background + primary focus ring.
      {
        activatable: true,
        invalid: false,
        className:
          'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
      },
      // Editable with an error: hover/focus reveal the destructive text-box border + ring.
      {
        activatable: true,
        invalid: true,
        className:
          'cursor-pointer bg-component-input-bg hover:border-border-strong-danger hover:ring-3 hover:ring-focus-destructive focus-visible:border-border-strong-danger focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-destructive',
      },
    ],
    defaultVariants: {
      multiline: false,
      activatable: false,
      invalid: false,
    },
  },
);
