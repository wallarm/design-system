import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * The pill that holds the trigger and, when a multi filter is set, the ✕. It owns the border,
 * surface and state overlays so the two buttons read as one control (Figma `filter-dropdown`).
 */
export const filterDropdownControlVariants = cva(
  cn(
    'inline-flex h-36 min-w-0 max-w-180 items-stretch',
    'rounded-12 border-1 border-border-primary bg-component-outline-button-bg',
    'font-sans text-sm text-text-primary',
    'overlay hover:not-data-disabled:overlay-states-primary-hover',
    'active:not-data-disabled:overlay-states-primary-pressed data-[state=open]:overlay-states-primary-pressed',
    'transition-[border,box-shadow,opacity]',
    // Focus ring belongs to the pill but follows the trigger's keyboard focus.
    'has-[[data-slot=filter-dropdown-trigger]:focus-visible]:ring-3 has-[[data-slot=filter-dropdown-trigger]:focus-visible]:ring-focus-primary',
    'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
  ),
  {
    variants: {
      /** Whether the filter has a value: dashed while unset, solid with a shadow once set. */
      applied: {
        true: 'border-solid shadow-2xs has-[[data-slot=filter-dropdown-trigger]:focus-visible]:shadow-none',
        false: 'border-dashed',
      },
      /** A ✕ sits after the trigger: 24px target, icon kept 10px from the border. */
      clearable: {
        true: 'pr-6',
        false: '',
      },
    },
    defaultVariants: {
      applied: false,
      clearable: false,
    },
  },
);

export const filterDropdownTriggerVariants = cva(
  cn(
    'flex min-w-0 flex-1 items-center gap-8 py-8 pl-16',
    'cursor-pointer outline-none disabled:cursor-not-allowed',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ),
  {
    variants: {
      /** With the ✕ the end padding moves to the ✕ button; with the chevron it is the 10px trick. */
      clearable: {
        true: 'pr-4',
        false: 'pr-10',
      },
    },
    defaultVariants: {
      clearable: false,
    },
  },
);

export const filterDropdownLabelVariants = cva('min-w-0 truncate', {
  variants: {
    /** The picked value reads in medium; names and «All …» stay regular. */
    emphasis: {
      value: 'font-medium',
      name: 'font-normal',
    },
  },
  defaultVariants: {
    emphasis: 'name',
  },
});

export const filterDropdownClearClassName = cn(
  'inline-flex size-24 shrink-0 items-center justify-center self-center rounded-6',
  'cursor-pointer text-icon-secondary transition-colors hover:not-disabled:text-icon-primary',
  'outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
  'disabled:cursor-not-allowed [&_svg]:icon-md [&_svg]:pointer-events-none',
);

export const filterDropdownContentClassName = cn(
  // Hug the options instead of Select's 240px floor, cap at 360px.
  'min-w-128 max-w-360',
  // A bare max-h-340 would stop the menu flipping when there is no room below; min() keeps
  // the available-height cap (TableSettingsMenu precedent).
  'max-h-[min(340px,var(--available-height))]',
);
