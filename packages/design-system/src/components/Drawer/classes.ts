import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const drawerContentVariants = cva(
  cn(
    'relative',
    'bg-bg-surface-2',
    'border border-border-primary-light',
    'rounded-12',
    'shadow-xl',
    'flex flex-col',
    'overflow-visible',
    'outline-none',

    // Scroll Area paddings
    '**:data-[slot=drawer-scroll-area-content]:pb-24',
    'has-data-[slot=drawer-footer]:**:data-[slot=drawer-scroll-area-content]:pb-0',

    // Scroll Area borders (applied to drawer-body based on scroll position)
    // Border shows when content is hidden in that direction
    '[&_[data-slot=drawer-body]:has([data-part=viewport][data-overflow-y])]:border-y',
    '[&_[data-slot=drawer-body]:has([data-part=viewport][data-overflow-y])]:border-transparent',
    '[&_[data-slot=drawer-body]:has([data-part=viewport][data-overflow-y])]:transition-colors',

    // Top border: show when has overflow AND NOT at top (content hidden above)
    '[&_[data-slot=drawer-body]:has([data-part=viewport][data-overflow-y]:not([data-at-top]))]:border-t-border-primary-light',

    // Bottom border: show when has overflow AND NOT at bottom AND has footer
    '[&_[data-slot=drawer-body]:has([data-part=viewport][data-overflow-y]:not([data-at-bottom]))]:border-b-border-primary-light',

    // Remove top border when Tabs are in header
    '[&:has([data-slot=drawer-header] [data-scope=tabs])_[data-slot=drawer-body]]:border-t-0',
    '[&:has([data-slot=drawer-header] [data-slot=tabs-list])_[data-slot=drawer-body]]:border-t-0',

    // Remove top border when Tabs follow header
    '[&:has([data-slot=drawer-header]+[data-scope=tabs])_[data-slot=drawer-body]]:border-t-0',
    '[&:has([data-slot=drawer-header]+[data-slot=tabs-list])_[data-slot=drawer-body]]:border-t-0',

    // Animations
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
    'data-[state=open]:duration-300 data-[state=closed]:duration-150',
  ),
  {
    variants: {
      isResizing: {
        true: 'transition-none',
      },
    },
  },
);

export const drawerPositionerVariants = cva(
  cn(
    'flex w-full',
    'origin-[right center]',
    'z-[calc(var(--drawer-positioner-z-index)+(var(--layer-index)*var(--drawer-level-ratio)))]',
  ),
  {
    variants: {
      isResizing: {
        true: 'transition-transform',
      },
    },
  },
);
