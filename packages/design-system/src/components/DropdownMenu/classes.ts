import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const dropdownMenuClassNames = cn(
  // Dimensions
  'flex flex-col gap-1 min-w-128',
  // Layer-aware z-index — set HERE on the content (not the positioner)
  // because @zag-js/popper sets an inline `style.zIndex = var(--z-index)` on
  // the positioner element which would override any class-based z-index
  // there. Popper reads `getComputedStyle(content).zIndex` and propagates it
  // up via the `--z-index` CSS variable, so the positioner ends up at the
  // same z-index as the content.
  //
  // Formula mirrors the Drawer / Dialog positioners. Values come from
  // src/theme/components/drawer.css (--drawer-positioner-z-index = 50,
  // --drawer-level-ratio = 20, --layer-index defaulted to 0 on :root). Zag's
  // dismissable layer stack overrides --layer-index inline on the rendered
  // content node when nested in a parent dismissable layer.
  'z-[calc(var(--drawer-positioner-z-index)+(var(--layer-index)*var(--drawer-level-ratio)))]',
  // Scrolling
  'overflow-y-auto overflow-x-hidden outline-none',
  // Visual
  'rounded-12 border border-border-primary-light bg-bg-surface-2 p-8 font-sans text-text-primary shadow-md outline-none',
  // Animation opened
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  // Animation closed
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0  data-[state=closed]:zoom-out-95',
  // Animation sides
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
);

export const dropdownMenuItemVariants = cva(
  [
    // Base
    'flex items-center gap-8 rounded-6 px-8 py-6 text-sm',
    // Misc
    'relative cursor-pointer select-none outline-none transition-colors',
    // States
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    // Icons
    '[&_svg]:pointer-events-none [&_svg]:icon-md [&>svg]:icon-md [&>svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: cn(
          'text-text-primary',
          'not-data-disabled:hover:bg-states-primary-hover',
          'not-data-disabled:focus:bg-states-primary-hover',
          'not-data-disabled:data-highlighted:bg-states-primary-hover',
          'not-data-disabled:active:bg-states-primary-pressed',
          'not-data-disabled:data-[state=open]:bg-states-primary-hover',
        ),
        brand: cn(
          'text-text-brand',
          'not-data-disabled:hover:bg-states-brand-hover',
          'not-data-disabled:focus:bg-states-brand-hover',
          'not-data-disabled:data-highlighted:bg-states-brand-hover',
          'not-data-disabled:active:bg-states-brand-pressed',
          'not-data-disabled:data-[state=open]:bg-states-brand-hover',
        ),
        destructive: cn(
          'text-text-danger',
          'not-data-disabled:hover:bg-states-danger-hover',
          'not-data-disabled:focus:bg-states-danger-hover',
          'not-data-disabled:data-highlighted:bg-states-danger-hover',
          'not-data-disabled:active:bg-states-danger-pressed',
          'not-data-disabled:data-[state=open]:bg-states-danger-hover',
        ),
      },
      inset: {
        true: 'pl-32',
      },
    },
  },
);

export const dropdownMenuLabelVariants = cva(
  'flex justify-between gap-8 px-8 pt-8 pb-2 text-xs font-medium text-text-secondary',
  {
    variants: {
      inset: {
        true: 'pl-32',
      },
    },
  },
);
