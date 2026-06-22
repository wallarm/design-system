import {
  Children,
  cloneElement,
  type FC,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  BulkBarSummary,
  BulkBarSummaryClear,
  type BulkBarSummaryClearProps,
  BulkBarSummaryCount,
  type BulkBarSummaryCountProps,
  BulkBarSummarySelectAll,
  type BulkBarSummarySelectAllProps,
  BulkBarSummarySeparator,
} from '../../BulkBar';
import { useTableContext } from '../TableContext';

export interface TableActionBarSelectionProps {
  /**
   * Optional override of the selection summary. Compose it from the exported
   * `BulkBarSummary*` primitives; the DS injects table state and actions
   * (`onClick`, `disabled`, `count`) into the recognized parts while preserving
   * every attribute you set (`data-analytics-id`, `data-analytics-props`,
   * `aria-*`, `ref`, any `data-*`). Omit `children` to render the DS default
   * block.
   *
   * Injection targets the **direct** `BulkBarSummary*` children (Fragments are
   * not unwrapped); wrapping a part in your own element opts it out of wiring.
   */
  children?: ReactNode;
}

type ClickHandler = (event: MouseEvent<HTMLButtonElement>) => void;

// In-table precedent (TableScrollHandler): the consumer handler runs first and
// can opt out of the DS action with event.preventDefault().
const composeClick =
  (consumer: ClickHandler | undefined, internal: () => void): ClickHandler =>
  event => {
    consumer?.(event);
    if (event.defaultPrevented) return;
    internal();
  };

export const TableActionBarSelection: FC<TableActionBarSelectionProps> = ({ children }) => {
  const { table } = useTableContext();

  const count = Object.keys(table.getState().rowSelection).length;
  const isAllSelected = table.getIsAllRowsSelected();

  const selectAll = () => table.toggleAllRowsSelected(true);
  const clear = () => table.resetRowSelection();

  // Default block — unchanged behavior when the consumer composes nothing.
  if (children === undefined) {
    return (
      <BulkBarSummary>
        <BulkBarSummaryCount count={count} />
        <BulkBarSummarySelectAll onClick={selectAll} disabled={isAllSelected} />
        <BulkBarSummarySeparator />
        <BulkBarSummaryClear onClick={clear} />
      </BulkBarSummary>
    );
  }

  // Consumer-composed block — wire state/actions into recognized parts, keep
  // every consumer attribute (analytics ids, overrides) intact.
  const wired = Children.map(children, child => {
    if (!isValidElement(child)) return child;

    if (child.type === BulkBarSummarySelectAll) {
      const el = child as ReactElement<BulkBarSummarySelectAllProps>;
      return cloneElement(el, {
        disabled: el.props.disabled ?? isAllSelected,
        onClick: composeClick(el.props.onClick, selectAll),
      });
    }

    if (child.type === BulkBarSummaryClear) {
      const el = child as ReactElement<BulkBarSummaryClearProps>;
      return cloneElement(el, { onClick: composeClick(el.props.onClick, clear) });
    }

    if (child.type === BulkBarSummaryCount) {
      const el = child as ReactElement<BulkBarSummaryCountProps>;
      return cloneElement(el, { count: el.props.count ?? count });
    }

    return child;
  });

  return <BulkBarSummary>{wired}</BulkBarSummary>;
};

TableActionBarSelection.displayName = 'TableActionBarSelection';
