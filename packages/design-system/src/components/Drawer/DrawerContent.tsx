import type { CSSProperties, FC, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { drawerContentVariants } from './classes';
import { useDrawerContext } from './DrawerContext';
import { useNestedSameKindCount } from './DrawerNestingContext';
import { DrawerOverlay } from './DrawerOverlay';
import { DrawerPortal } from './DrawerPortal';
import { DrawerPositioner } from './DrawerPositioner';

export interface DrawerContentProps {
  children: ReactNode;
  asChild?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const DrawerContent: FC<DrawerContentProps> = ({ children, asChild, ref }) => {
  const testId = useTestId('content');
  const { width, isResizing, overlay } = useDrawerContext();
  const nestedSameKindCount = useNestedSameKindCount();

  return (
    <DrawerPortal>
      {overlay && <DrawerOverlay />}

      <DrawerPositioner isResizing={isResizing}>
        <Dialog.Content
          ref={ref}
          data-testid={testId}
          // Pushed-back is keyed on the DS-owned same-kind attribute, not
          // zag's data-has-nested — zag can't tell a nested Drawer from a
          // nested Dialog (both are dialog machines), see DrawerNestingContext.
          data-has-nested-same={nestedSameKindCount > 0 ? '' : undefined}
          className={cn(
            drawerContentVariants({ isResizing }),
            'h-full',
            'slide-in-from-right-[25%] slide-out-to-right-[25%]',
            'origin-left',

            'data-[has-nested-same]:scale-[calc(var(--drawer-pushed-back-scale)-(var(--nested-same-kind-count)*var(--drawer-pushed-back-ratio)))]',
            'data-[has-nested-same]:-translate-x-[calc((var(--drawer-pushed-back-offset)/(var(--drawer-pushed-back-scale)-(var(--nested-same-kind-count)*var(--drawer-pushed-back-ratio))))*var(--nested-same-kind-count))]',
          )}
          style={{ width, '--nested-same-kind-count': nestedSameKindCount } as CSSProperties}
          asChild={asChild}
        >
          {children}
        </Dialog.Content>
      </DrawerPositioner>
    </DrawerPortal>
  );
};

DrawerContent.displayName = 'DrawerContent';
