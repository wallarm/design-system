import { cn } from '../../utils/cn';

/**
 * Visual surface shared between the page-level Selection bulk bar and the
 * Table action bar: background, rounded corners, padding, and the
 * `data-[state=open|closed]` enter/exit animation pair. Consumers compose
 * this onto whatever element acts as the bar's outer container — a plain
 * `<div>` (when driven by `Presence`) or a `Popover.Content`.
 */
export const bulkBarSurfaceClasses = cn(
  // Surface
  'rounded-16 bg-component-toast-bg shadow-lg',
  'py-8 pr-8 pl-12',
  // Animation opened
  'data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom',
  // Animation closed
  'data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom',
);
