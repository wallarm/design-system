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
  'bg-component-toast-bg rounded-16 shadow-lg',
  'pl-12 pr-8 py-8',
  // Animation opened
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300',
  // Animation closed
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150',
);
