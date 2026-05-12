import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { bulkBarSurfaceClasses } from '../BulkBar/classes';

export const selectionItemVariants = cva('flex w-full min-w-0 items-start gap-12');

export const selectionBulkBarVariants = cva(
  cn(
    // Layout
    'z-[200] flex w-fit flex-nowrap items-center gap-16',
    // Shared surface + animations. `Presence` (`asChild`) sets `data-state`
    // on this element to drive the animations.
    bulkBarSurfaceClasses,
    // Selection-specific: keep bulk actions on a single row even when the bar
    // is narrow (e.g. in a small drawer); buttons overflow rather than wrap.
    '[&_button]:shrink-0 [&_button]:whitespace-nowrap',
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
