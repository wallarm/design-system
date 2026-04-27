import type { FC, ReactNode } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { useOptionalDrawerContext } from '../../Drawer/DrawerContext';
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
  const isInDrawer = !!useOptionalDrawerContext();

  const bar = (
    <ArkUiPresence present={selectedIds.size > 0}>
      <div
        role='toolbar'
        aria-label={ariaLabel}
        data-slot='selection-bulk-bar'
        data-testid={testId}
        className={cn(
          'z-[200] flex items-center gap-40',
          isInDrawer
            ? 'absolute inset-x-12 bottom-12 justify-between'
            : 'fixed bottom-32 left-1/2 -translate-x-1/2 w-fit max-w-[calc(100vw-32px)]',
          'bg-component-toast-bg rounded-16 shadow-lg',
          'pl-12 pr-8 py-8',
          // ButtonBase has min-w-0 + overflow-hidden — without this, action
          // buttons would flex-shrink below their text width.
          '[&_button]:shrink-0 [&_button]:whitespace-nowrap',
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
  );

  // Inside a Drawer, render the bar in-place so it can absolute-position
  // against DrawerContent (which is `relative`) and follow drawer width.
  return isInDrawer ? bar : <ArkUiPortal>{bar}</ArkUiPortal>;
};

SelectionBulkBar.displayName = 'SelectionBulkBar';
