import type { CSSProperties, FC, Ref } from 'react';
import { Dialog as ArkUiDialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  type DrawerContentProps,
  DrawerOverlay,
  DrawerPortal,
  drawerContentVariants,
  useDrawerContext,
  useNestedSameKindCount,
} from '../Drawer';
import { DialogPositioner } from './DialogPositioner';

type DialogContentProps = DrawerContentProps & { ref?: Ref<HTMLDivElement> };

export const DialogContent: FC<DialogContentProps> = ({ children, ref }) => {
  const testId = useTestId('content');
  const { width, overlay } = useDrawerContext();
  const nestedSameKindCount = useNestedSameKindCount();

  return (
    <DrawerPortal>
      {overlay && <DrawerOverlay />}

      <DialogPositioner>
        <ArkUiDialog.Content
          ref={ref}
          data-testid={testId}
          // Pushed-back is keyed on the DS-owned same-kind attribute, not
          // zag's data-has-nested — zag can't tell a nested Drawer from a
          // nested Dialog (both are dialog machines), see DrawerNestingContext.
          data-has-nested-same={nestedSameKindCount > 0 ? '' : undefined}
          className={cn(
            drawerContentVariants({ isResizing: false }),
            'flex flex-col min-h-0',
            'slide-in-from-bottom-[25%] slide-out-to-bottom-[25%]',
            'origin-top',

            // Animations
            'data-[has-nested-same]:scale-[calc(var(--dialog-pushed-back-scale)-(var(--nested-same-kind-count)*var(--dialog-pushed-back-ratio)))]',
            'data-[has-nested-same]:-translate-y-[calc((var(--dialog-pushed-back-offset)/(var(--dialog-pushed-back-scale)-(var(--nested-same-kind-count)*var(--dialog-pushed-back-ratio))))*var(--nested-same-kind-count))]',

            // Header
            '**:data-[slot=drawer-header]:pt-20 **:data-[slot=drawer-header]:pb-16 **:data-[slot=drawer-header]:px-24',
          )}
          style={{ width, '--nested-same-kind-count': nestedSameKindCount } as CSSProperties}
        >
          {children}
        </ArkUiDialog.Content>
      </DialogPositioner>
    </DrawerPortal>
  );
};

DialogContent.displayName = 'DialogContent';
