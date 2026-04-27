import { type FC, type ReactNode, type RefObject, useMemo } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { useTestId } from '../../../utils/testId';
import { useOptionalDrawerContentScope } from '../../Drawer/DrawerContext';
import { HStack } from '../../Stack';
import { selectionBulkBarVariants } from '../classes';
import { useSelectionContext } from '../useSelectionContext';
import { SelectionBulkBarSummary } from './SelectionBulkBarSummary';

const TEST_ID_SLOT = 'bulk-bar';
const DEFAULT_ARIA_LABEL = 'Bulk actions';

export interface SelectionBulkBarProps {
  /** Override the toolbar accessible name. Defaults to "Bulk actions". */
  'aria-label'?: string;
  'data-testid'?: string;
  children?: ReactNode;
}

export const SelectionBulkBar: FC<SelectionBulkBarProps> = ({
  'aria-label': ariaLabel = DEFAULT_ARIA_LABEL,
  'data-testid': testIdProp,
  children,
}) => {
  const { selectedIds } = useSelectionContext();
  const fallbackTestId = useTestId(TEST_ID_SLOT);
  const testId = testIdProp ?? fallbackTestId;
  // When rendered inside a DrawerContent panel, anchor the bar to the
  // panel itself (not body, not the inner ScrollArea) so it stays pinned
  // while DrawerBody scrolls and never overlaps a DrawerFooter.
  const drawerScope = useOptionalDrawerContentScope();
  const isInDrawer = drawerScope !== null;
  const placement = isInDrawer ? 'drawer' : 'floating';

  // Build a fresh ref every time the panel element changes so ARK Portal's
  // `[props.container]` effect re-runs and resyncs to the new container.
  const containerRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({ current: drawerScope?.element ?? null }),
    [drawerScope?.element],
  );

  // Wait for the panel to mount before portaling. Otherwise ARK Portal's
  // first render reads `containerRef.current === null`, falls back to
  // document.body, and we'd briefly flash the bar there.
  if (isInDrawer && !drawerScope.element) return null;

  return (
    <ArkUiPortal container={containerRef}>
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
    </ArkUiPortal>
  );
};

SelectionBulkBar.displayName = 'SelectionBulkBar';
