import type { FC, ReactNode } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { useTestId } from '../../../utils/testId';
import { HStack } from '../../Stack';
import { selectionBulkBarVariants } from '../classes';
import { useSelectionContext } from '../useSelectionContext';
import { SelectionBulkBarSummary } from './SelectionBulkBarSummary';

const TEST_ID_SLOT = 'bulk-bar';
const DEFAULT_ARIA_LABEL = 'Bulk actions';

export type SelectionBulkBarPlacement = 'floating' | 'absolute';

export interface SelectionBulkBarProps {
  /** Override the toolbar accessible name. Defaults to "Bulk actions". */
  'aria-label'?: string;
  'data-testid'?: string;
  /**
   * How the bar is positioned.
   *
   * - `'floating'` (default): portaled to `document.body` and pinned to the
   *   bottom of the viewport with `position: fixed`. Use for page-level
   *   selection lists.
   * - `'absolute'`: rendered in place with `position: absolute`. Anchors to
   *   the nearest positioned ancestor — by default the enclosing `Selection`
   *   root (which is `position: relative`), so the bar pins to the bottom of
   *   the selection area. Use this inside a Drawer or any other bounded
   *   container.
   */
  placement?: SelectionBulkBarPlacement;
  children?: ReactNode;
}

export const SelectionBulkBar: FC<SelectionBulkBarProps> = ({
  'aria-label': ariaLabel = DEFAULT_ARIA_LABEL,
  'data-testid': testIdProp,
  placement = 'floating',
  children,
}) => {
  const { selectedIds } = useSelectionContext();
  const fallbackTestId = useTestId(TEST_ID_SLOT);
  const testId = testIdProp ?? fallbackTestId;

  const bar = (
    <ArkUiPresence present={selectedIds.size > 0} asChild>
      <div
        role='toolbar'
        aria-label={ariaLabel}
        data-slot='selection-bulk-bar'
        data-testid={testId}
        className={selectionBulkBarVariants({ placement })}
      >
        <SelectionBulkBarSummary />
        <HStack gap={8} align='center'>
          {children}
        </HStack>
      </div>
    </ArkUiPresence>
  );

  if (placement === 'floating') {
    return <ArkUiPortal>{bar}</ArkUiPortal>;
  }

  return bar;
};

SelectionBulkBar.displayName = 'SelectionBulkBar';
