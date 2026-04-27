import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { HStack } from '../../Stack';
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
  const fallbackTestId = useTestId('bulk-bar');
  const testId = testIdProp ?? fallbackTestId;

  return (
    <ArkUiPortal>
      <ArkUiPopover.Positioner className='z-[calc(var(--drawer-positioner-z-index,50)+(var(--layer-index,0)*var(--drawer-level-ratio,20))+10)]'>
        <ArkUiPopover.Content
          role='toolbar'
          aria-label={ariaLabel}
          data-slot='selection-bulk-bar'
          data-testid={testId}
          className={cn(
            'bg-component-toast-bg rounded-16 shadow-lg',
            'pl-12 pr-8 py-8',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150',
          )}
        >
          <HStack gap={40} align='center'>
            <SelectionBulkBarSummary />
            <HStack gap={8} align='center'>
              {children}
            </HStack>
          </HStack>
        </ArkUiPopover.Content>
      </ArkUiPopover.Positioner>
    </ArkUiPortal>
  );
};

SelectionBulkBar.displayName = 'SelectionBulkBar';
