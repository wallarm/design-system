import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const selectionItemVariants = cva('flex w-full min-w-0 items-start gap-12');

export const selectionBulkBarVariants = cva(
  cn(
    // Layout
    'z-[200] flex w-fit flex-nowrap items-center gap-16',
    // Surface
    'bg-component-toast-bg rounded-16 shadow-lg',
    'pl-12 pr-8 py-8',
    // Keep bulk actions on a single row even when the bar is narrow
    // (e.g. in a small drawer); buttons overflow rather than wrap.
    '[&_button]:shrink-0 [&_button]:whitespace-nowrap',
    // Presence (`asChild`) sets `data-state` on this element.
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150',
  ),
  {
    variants: {
      placement: {
        // Anchored to the nearest positioned ancestor — useful for embedding
        // inside a Drawer or any other relatively positioned container.
        absolute: 'absolute bottom-12 left-1/2 -translate-x-1/2 max-w-[calc(100%-48px)]',
        floating: 'fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[calc(100vw-32px)]',
      },
    },
    defaultVariants: {
      placement: 'floating',
    },
  },
);
