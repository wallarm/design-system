import {
  type ComponentPropsWithRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutContainer, tableLayoutTable } from '../classes';
import { TableLayoutContext, type TableLayoutContextValue } from '../TableLayoutContext';
import type { TableLayoutColumnController, TableLayoutHandle } from '../types';
import { useColumnRegistry } from '../useColumnRegistry';

export interface TableLayoutProps extends Omit<ComponentPropsWithRef<'table'>, 'ref'> {
  /** Column engine controller from `useTableLayoutColumns` — enables pin/resize/visibility. */
  controller?: TableLayoutColumnController;
}

export const TableLayout = forwardRef<TableLayoutHandle, TableLayoutProps>(
  ({ className, children, controller, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { registerColumn, unregisterColumn, getColumn: getRegistered } = useColumnRegistry();

    useImperativeHandle(
      ref,
      (): TableLayoutHandle => ({
        scrollToRow(id, opts) {
          const row = containerRef.current?.querySelector<HTMLTableRowElement>(
            `[data-row-id="${CSS.escape(id)}"]`,
          );
          if (!row) return false;
          row.scrollIntoView({
            block: !opts?.align || opts.align === 'auto' ? 'nearest' : opts.align,
            behavior: opts?.behavior ?? 'auto',
          });
          return true;
        },
      }),
      [],
    );

    const value = useMemo<TableLayoutContextValue>(
      () => ({
        registerColumn,
        unregisterColumn,
        getColumn: (id: string) => controller?.resolved[id] ?? getRegistered(id),
        containerRef,
        resizeMode: controller?.resizeMode ?? 'onEnd',
        setColumnSize: controller?.setColumnSize,
      }),
      [registerColumn, unregisterColumn, getRegistered, controller],
    );

    return (
      <TableLayoutContext.Provider value={value}>
        <div ref={containerRef} className={cn(tableLayoutContainer, className)}>
          <table className={tableLayoutTable} {...props}>
            {children}
          </table>
        </div>
      </TableLayoutContext.Provider>
    );
  },
);
TableLayout.displayName = 'TableLayout';
