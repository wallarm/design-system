import { cva } from 'class-variance-authority';

/** Selection highlight applied via Ctrl+A (parent data attr) and drag (wrapper data attr) */
const selectionHighlight = [
  'group-data-[selected-all]/filter-input:bg-bg-light-info group-data-[selected-all]/filter-input:border-border-info',
  '[[data-drag-selected]_&]:bg-bg-light-info [[data-drag-selected]_&]:border-border-info',
].join(' ');

/** Hide element when chip is in any selection state */
const hiddenWhenSelected = [
  'group-data-[selected-all]/filter-input:hidden',
  '[[data-drag-selected]_&]:hidden',
].join(' ');

/** Base chip container styles shared by FilterInputChip and FilterInputConnectorChip */
export const chipVariants = cva(
  `group/chip relative flex h-22 items-center justify-center gap-4 rounded-8 border border-solid px-5 py-0 ${selectionHighlight}`,
  {
    variants: {
      error: {
        true: 'border-border-danger bg-bg-light-danger',
        false: 'border-border-primary bg-badge-badge-bg',
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
      disabled: {
        true: 'cursor-default opacity-50',
        false: '',
      },
      /** Visual marker for an in-progress (not yet committed) building chip. */
      building: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [{ building: true, error: false, className: 'border-border-strong-primary' }],
    defaultVariants: {
      error: false,
      interactive: false,
      disabled: false,
      building: false,
    },
  },
);

/** Segment container */
export const segmentContainer = 'flex flex-col justify-center overflow-hidden leading-none';

/** Hit target for an empty required value: a small full-height box so the value
 *  is clickable and the trailing × can't sit on top of it (AS-1192). */
export const emptyValueHitTarget = 'min-w-[4px] self-stretch';

/** The value edit input hugs its content (measured width + WIDTH_OFFSET). `min-w-0`
 *  drops the flex/intrinsic min-width so a short value like "f" isn't forced into a
 *  wide box; an empty value falls back to the sizer's MIN_INPUT_WIDTH floor. */
export const editingValueMinWidth = 'min-w-0';

/** Segment text styles by variant */
export const segmentTextVariants = cva('truncate text-sm', {
  variants: {
    variant: {
      attribute: 'font-normal',
      operator: 'font-normal',
      value: 'font-medium',
    },
    error: {
      true: 'text-text-danger',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'attribute', error: false, className: 'text-text-primary' },
    { variant: 'operator', error: false, className: 'text-text-secondary' },
    { variant: 'value', error: false, className: 'text-text-info' },
  ],
  defaultVariants: {
    error: false,
  },
});

/** Remove button styles — hidden by default, shown on chip hover or button focus.
 *  `pointer-events-none` while invisible stops it swallowing clicks meant for the
 *  chip/input and silently deleting the chip (AS-1179). */
export const removeButtonVariants = cva(
  `pointer-events-none absolute top-[-1px] -right-[13px] bottom-[-1px] flex w-[18px] cursor-pointer items-center justify-center rounded-r-8 border border-l-0 border-solid p-0 opacity-0 transition-opacity group-hover/chip:pointer-events-auto group-hover/chip:opacity-100 focus:pointer-events-auto focus:opacity-100 ${hiddenWhenSelected}`,
  {
    variants: {
      error: {
        true: 'border-border-danger bg-bg-light-danger text-text-danger',
        false: 'border-border-primary bg-badge-badge-bg text-text-secondary',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);
