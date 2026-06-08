import { Children, type FC, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { useTestId } from '../../../utils/testId';
import {
  BulkBarSummary,
  BulkBarSummaryClear,
  BulkBarSummaryCount,
  BulkBarSummarySelectAll,
  BulkBarSummarySeparator,
} from '../../BulkBar';
import { HStack } from '../../Stack';
import { selectionBulkBarVariants } from '../classes';
import { useSelectionContext } from '../useSelectionContext';

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

interface PartitionedChildren {
  summary: ReactElement | undefined;
  actions: ReactNode[];
}

const partitionChildren = (children: ReactNode): PartitionedChildren => {
  let summary: ReactElement | undefined;
  const actions: ReactNode[] = [];

  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === BulkBarSummary && !summary) {
      summary = child;
      continue;
    }
    actions.push(child);
  }

  return { summary, actions };
};

const DefaultSummary: FC = () => {
  const { selectedIds, isAllSelected, selectAll, clear } = useSelectionContext();

  return (
    <BulkBarSummary>
      <BulkBarSummaryCount count={selectedIds.size} />
      <HStack gap={6}>
        <BulkBarSummarySelectAll onClick={selectAll} disabled={isAllSelected} />
        <BulkBarSummarySeparator />
        <BulkBarSummaryClear onClick={clear} />
      </HStack>
    </BulkBarSummary>
  );
};

export const SelectionBulkBar: FC<SelectionBulkBarProps> = ({
  'aria-label': ariaLabel = DEFAULT_ARIA_LABEL,
  'data-testid': testIdProp,
  placement = 'floating',
  children,
}) => {
  const { selectedIds } = useSelectionContext();
  const testId = useTestId(TEST_ID_SLOT, testIdProp);

  // Consumer composes a custom <BulkBarSummary> for analytics-tagged links;
  // anything else (action buttons) lives in the right-hand HStack. Without
  // an explicit summary, render the Selection-wired default.
  const { summary, actions } = partitionChildren(children);

  const bar = (
    <ArkUiPresence present={selectedIds.size > 0} asChild>
      <div
        role='toolbar'
        aria-label={ariaLabel}
        data-slot='selection-bulk-bar'
        data-testid={testId}
        className={selectionBulkBarVariants({ placement })}
      >
        {summary ?? <DefaultSummary />}
        <HStack gap={8} align='center'>
          {actions}
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
