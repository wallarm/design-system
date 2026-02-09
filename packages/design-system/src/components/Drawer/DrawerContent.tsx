import type { FC, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
import { drawerContentVariants } from './classes';
import { useDrawerContext } from './DrawerContext';
import { DrawerOverlay } from './DrawerOverlay';
import { DrawerPortal } from './DrawerPortal';
import { DrawerPositioner } from './DrawerPositioner';

export interface DrawerContentProps {
  children: ReactNode;
  asChild?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const DrawerContent: FC<DrawerContentProps> = ({ children, asChild, ref }) => {
  const { width, isResizing, overlay } = useDrawerContext();

  return (
    <DrawerPortal>
      {overlay && <DrawerOverlay />}

      <DrawerPositioner isResizing={isResizing}>
        <Dialog.Content
          ref={ref}
          className={cn(
            drawerContentVariants({ isResizing }),
            'h-full',
            'slide-in-from-right-[25%] slide-out-to-right-[25%]',
            'origin-left',

            'data-[has-nested=dialog]:scale-[calc(var(--drawer-pushed-back-scale)-(var(--nested-layer-count)*var(--drawer-pushed-back-ratio)))]',
            'data-[has-nested=dialog]:-translate-x-[calc((var(--drawer-pushed-back-offset)/(var(--drawer-pushed-back-scale)-(var(--nested-layer-count)*var(--drawer-pushed-back-ratio))))*var(--nested-layer-count))]',
          )}
          style={{ width }}
          asChild={asChild}
        >
          {children}
        </Dialog.Content>
      </DrawerPositioner>
    </DrawerPortal>
  );
};

DrawerContent.displayName = 'DrawerContent';
