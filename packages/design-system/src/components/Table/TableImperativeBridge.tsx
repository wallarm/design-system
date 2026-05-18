import { type Ref, useImperativeHandle } from 'react';
import { useTableContext } from './TableContext';
import type { TableHandle, TableScrollToRowOptions } from './types';

interface TableImperativeBridgeProps {
  handleRef: Ref<TableHandle>;
}

const resolveScrollIntoViewBlock = (
  align: TableScrollToRowOptions['align'],
): ScrollLogicalPosition => {
  switch (align) {
    case 'start':
      return 'start';
    case 'center':
      return 'center';
    case 'end':
      return 'end';
    default:
      return 'nearest';
  }
};

/**
 * Bridges the imperative ref forwarded to `<Table>` to context-backed
 * refs (`virtualizerRef`, `tbodyRef`). Mounted inside `TableProvider` so
 * it has access to the context; renders nothing.
 */
export const TableImperativeBridge = ({ handleRef }: TableImperativeBridgeProps) => {
  const { table, virtualizerRef, tbodyRef } = useTableContext();

  useImperativeHandle(
    handleRef,
    (): TableHandle => ({
      scrollToRow(id, opts = {}) {
        const rows = table.getRowModel().rows;
        const index = rows.findIndex(r => r.id === id);
        if (index < 0) return false;

        const virtualizer = virtualizerRef.current;
        if (virtualizer) {
          virtualizer.scrollToIndex(index, {
            align: opts.align ?? 'auto',
            behavior: opts.behavior,
          });
          return true;
        }

        const tbody = tbodyRef.current;
        if (!tbody) return false;
        const el = tbody.querySelector(`[data-row-id="${CSS.escape(id)}"]`);
        if (!(el instanceof HTMLElement)) return false;
        el.scrollIntoView({
          block: resolveScrollIntoViewBlock(opts.align),
          behavior: opts.behavior,
        });
        return true;
      },
    }),
    [table, virtualizerRef, tbodyRef],
  );

  return null;
};

TableImperativeBridge.displayName = 'TableImperativeBridge';
