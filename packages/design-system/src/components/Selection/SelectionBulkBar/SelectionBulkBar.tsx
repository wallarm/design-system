import type { FC, ReactNode } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { useOptionalDrawerContentRef } from '../../Drawer/DrawerContext';
import { HStack } from '../../Stack';
import { useSelectionContext } from '../useSelectionContext';
import { SelectionBulkBarSummary } from './SelectionBulkBarSummary';

export interface SelectionBulkBarProps {
  /** Override the toolbar accessible name. Defaults to "Bulk actions". */
  'aria-label'?: string;
  'data-testid'?: string;
  children?: ReactNode;
}

export const SelectionBulkBar: FC<SelectionBulkBarProps> = ({
  'aria-label': ariaLabel = 'Bulk actions',
  'data-testid': testIdProp,
  children,
}) => {
  const { selectedIds } = useSelectionContext();
  const fallbackTestId = useTestId('bulk-bar');
  const testId = testIdProp ?? fallbackTestId;
  // When rendered inside a DrawerContent panel, anchor the bar to the
  // panel itself (not body, not the inner ScrollArea) so it stays pinned
  // while DrawerBody scrolls and never overlaps a DrawerFooter.
  const drawerContentRef = useOptionalDrawerContentRef();
  const isInDrawer = !!drawerContentRef;

  return (
    <ArkUiPortal container={drawerContentRef ?? undefined}>
      <ArkUiPresence present={selectedIds.size > 0} asChild>
        <div
          role='toolbar'
          aria-label={ariaLabel}
          data-slot='selection-bulk-bar'
          data-testid={testId}
          className={cn(
            'z-[200] flex w-fit flex-nowrap items-center gap-8',
            isInDrawer
              ? 'absolute bottom-12 left-1/2 -translate-x-1/2 max-w-[calc(100%-24px)]'
              : 'fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[calc(100vw-32px)]',
            'bg-component-toast-bg rounded-16 shadow-lg',
            'pl-12 pr-8 py-8',
            // Keep bulk actions on a single row even when the bar is narrow
            // (e.g. in a small drawer); buttons overflow rather than wrap.
            '[&_button]:shrink-0 [&_button]:whitespace-nowrap',
            // Presence sets data-state on this element via asChild.
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150',
          )}
        >
          <SelectionBulkBarSummary />
          <HStack gap={8} align='center'>
            {children}
          </HStack>
        </div>
      </ArkUiPresence>
    </ArkUiPortal>
  );
};

SelectionBulkBar.displayName = 'SelectionBulkBar';
