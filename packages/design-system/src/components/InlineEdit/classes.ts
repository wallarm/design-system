import { cva } from 'class-variance-authority';

export const inlineEditPreviewVariants = cva(
  // Typography matches Input's `size='small'` (text-sm) so toggling into
  // edit mode causes no visual jump. Vertical padding is per-variant below,
  // since it must match whichever control's own `size='small'` this row
  // toggles into (Input's is 2px; Textarea's is 0).
  // -ml-7 pulls the hover/pressed background and hit target further left
  // than surrounding content, while the left px-6 keeps the text itself
  // readably inset from that extended edge (the "padded hover row,
  // compensated margin" pattern — the two values are deliberately
  // asymmetric, not a cancel-out pair).
  'group flex w-full min-w-0 gap-4 rounded-8 border border-transparent px-6 -ml-7 font-sans text-sm text-text-primary transition-colors',
  {
    variants: {
      // Multi-line values (Textarea) align the icon to the top, use
      // Textarea's `size='small'` py-0, and grow with content (lineClamp).
      // Single-line values (Input/NumberInput/Select/Date/Time) center the
      // icon, use Input's `size='small'` py-2, and fix the row at Input's
      // small 24px height (border-box: 2px padding + 1px border on each
      // side + the 20px text-sm line-height above = 24px total).
      multiline: {
        true: 'items-start py-0',
        false: 'items-center py-2 h-24',
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
