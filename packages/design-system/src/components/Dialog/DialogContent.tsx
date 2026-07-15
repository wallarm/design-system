import type { FC, Ref } from 'react';
import { Dialog as ArkUiDialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  type DrawerContentProps,
  DrawerOverlay,
  DrawerPortal,
  drawerContentVariants,
  useDrawerContext,
} from '../Drawer';
import { DialogPositioner } from './DialogPositioner';

type DialogContentProps = DrawerContentProps & { ref?: Ref<HTMLDivElement> };

export const DialogContent: FC<DialogContentProps> = ({ children, ref }) => {
  const testId = useTestId('content');
  const { width, overlay } = useDrawerContext();

  return (
    <DrawerPortal>
      {overlay && <DrawerOverlay />}

      <DialogPositioner>
        <ArkUiDialog.Content
          ref={ref}
          data-testid={testId}
          className={cn(
            drawerContentVariants({ isResizing: false }),
            'flex flex-col min-h-0',
            'slide-in-from-bottom-[25%] slide-out-to-bottom-[25%]',
            'origin-top',

            // Animations
            'data-[has-nested=dialog]:scale-[calc(var(--dialog-pushed-back-scale)-(var(--nested-layer-count)*var(--dialog-pushed-back-ratio)))]',
            'data-[has-nested=dialog]:-translate-y-[calc((var(--dialog-pushed-back-offset)/(var(--dialog-pushed-back-scale)-(var(--nested-layer-count)*var(--dialog-pushed-back-ratio))))*var(--nested-layer-count))]',

            // Header
            '[&_[data-slot=drawer-header]]:pt-20 [&_[data-slot=drawer-header]]:px-24',

            // The scroll viewport clips descendant box-shadows at its own edge with
            // zero vertical buffer above/below the content, so a focused input's
            // ring can render clipped there. Borrow 8px from the header/footer
            // padding (which sit outside the clipped viewport, so a ring there is
            // never cut off) and hand it to the scroll content as top/bottom
            // padding (inside the clip, where a focus ring needs the room) -
            // net-zero height change.
            //
            // Top: applied unconditionally. The first child always sits right after
            // the content's own padding regardless of scroll state, so this closes
            // the top clip in every case.
            '[&_[data-slot=drawer-header]]:pb-8',
            '[&_[data-slot=drawer-scroll-area-content]]:pt-8',
            //
            // Bottom: only while NOT overflowing. `ScrollAreaContent` is `h-full`,
            // so once content overflows its own box is capped at the viewport's
            // height and the real (overflowing) children spill past it - the
            // padding then lands at that cap, not at the true trailing edge, so it
            // can't reach a focus ring there. Growing it anyway would also
            // spuriously resize the scrollbar/border separators for no benefit.
            '[&:not(:has([data-part=viewport][data-overflow-y])):has([data-slot=drawer-footer])_[data-slot=drawer-scroll-area-content]]:pb-8',
            '[&:not(:has([data-part=viewport][data-overflow-y]))_[data-slot=drawer-footer]]:pt-8',
            '[&:has([data-part=viewport][data-overflow-y])_[data-slot=drawer-footer]]:pt-16',
            //
            // Remaining edge case: an input scrolled flush to the true bottom while
            // overflowing has no padding buffer available (see above), so its ring
            // would still clip there. `outline` isn't clipped by ancestor overflow
            // at all, so swap the ring for one while overflowing - only there, since
            // padding alone already fully covers the non-overflowing case.
            '[&:has([data-part=viewport][data-overflow-y])_[data-slot=input]:focus-visible]:[--tw-ring-shadow:0_0_#0000]',
            '[&:has([data-part=viewport][data-overflow-y])_[data-slot=input]:focus-visible]:[outline:3px_solid_var(--tw-ring-color)]',
          )}
          style={{ width }}
        >
          {children}
        </ArkUiDialog.Content>
      </DialogPositioner>
    </DrawerPortal>
  );
};

DialogContent.displayName = 'DialogContent';
