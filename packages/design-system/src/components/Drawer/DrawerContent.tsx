import { type FC, type ReactNode, type Ref, useCallback, useMemo, useState } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { drawerContentVariants } from './classes';
import { DrawerContentContext, useDrawerContext } from './DrawerContext';
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
  // State (not just a ref) so descendants re-render once the panel mounts.
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  // React 19 cleanup-returning ref callback: React invokes the returned
  // cleanup on detach instead of calling us again with `null`.
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContentEl(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      return () => {
        setContentEl(null);
        if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );
  const scope = useMemo(() => ({ element: contentEl }), [contentEl]);

  return (
    <DrawerPortal>
      {overlay && <DrawerOverlay />}

      <DrawerPositioner isResizing={isResizing}>
        <Dialog.Content
          ref={setRef}
          data-testid={testId}
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
          <DrawerContentContext.Provider value={scope}>{children}</DrawerContentContext.Provider>
        </Dialog.Content>
      </DrawerPositioner>
    </DrawerPortal>
  );
};

DrawerContent.displayName = 'DrawerContent';
