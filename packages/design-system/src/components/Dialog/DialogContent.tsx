import type { FC, Ref } from 'react';
import { Dialog as ArkUiDialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
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
  const { width, overlay } = useDrawerContext();

  return (
    <DrawerPortal>
      {overlay && <DrawerOverlay />}

      <DialogPositioner>
        <ArkUiDialog.Content
          ref={ref}
          className={cn(
            drawerContentVariants({ isResizing: false }),
            'flex flex-col min-h-0',
            'slide-in-from-bottom-[25%] slide-out-to-bottom-[25%]',
            'origin-top',

            // Animations
            'data-[has-nested=dialog]:scale-[calc(var(--dialog-pushed-back-scale)-(var(--nested-layer-count)*var(--dialog-pushed-back-ratio)))]',
            'data-[has-nested=dialog]:-translate-y-[calc((var(--dialog-pushed-back-offset)/(var(--dialog-pushed-back-scale)-(var(--nested-layer-count)*var(--dialog-pushed-back-ratio))))*var(--nested-layer-count))]',

            // Header
            '[&_[data-slot=drawer-header]]:pt-20 [&_[data-slot=drawer-header]]:pb-16 [&_[data-slot=drawer-header]]:px-24',
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
