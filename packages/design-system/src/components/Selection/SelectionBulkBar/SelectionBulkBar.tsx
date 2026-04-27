import type { FC, ReactNode } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
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

  if (selectedIds.size === 0) return null;

  return (
    <ArkUiPortal>
      <div
        role='toolbar'
        aria-label={ariaLabel}
        data-slot='selection-bulk-bar'
        data-testid={testId}
        className={cn(
          'fixed bottom-32 left-1/2 -translate-x-1/2 z-[200]',
          'flex w-fit max-w-[calc(100vw-32px)] items-center gap-40',
          'bg-component-toast-bg rounded-16 shadow-lg',
          'pl-12 pr-8 py-8',
          // ButtonBase has min-w-0 + overflow-hidden — without this, action
          // buttons would flex-shrink below their text width.
          '[&_button]:shrink-0 [&_button]:whitespace-nowrap',
          'animate-in fade-in-0 slide-in-from-bottom duration-300',
        )}
      >
        <SelectionBulkBarSummary />
        <HStack gap={8} align='center'>
          {children}
        </HStack>
      </div>
    </ArkUiPortal>
  );
};

SelectionBulkBar.displayName = 'SelectionBulkBar';
