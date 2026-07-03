import { cva } from 'class-variance-authority';

export const inlineEditPreviewVariants = cva(
  'group flex w-full min-w-0 gap-4 rounded-8 border border-transparent px-6 py-4 transition-colors',
  {
    variants: {
      // Multi-line values align the trigger icon to the top; single-line centers it.
      multiline: {
        true: 'items-start',
        false: 'items-center',
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
