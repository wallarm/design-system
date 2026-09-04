import { type FC, useEffect, useRef } from 'react';
import type { RowData } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { useStickyGroupParent } from './hooks';
import { TABLE_DRAG_HANDLE_COLUMN_ID, TABLE_EXPAND_COLUMN_ID, TABLE_SELECT_COLUMN_ID } from './lib';
import { Td, Tr } from './primitives';
import { TableBodyCell } from './TableBody/TableBodyCell';
import { TableColGroup } from './TableColGroup';
import { useTableContext } from './TableContext';

const SYSTEM_COLUMN_IDS = new Set([
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  TABLE_DRAG_HANDLE_COLUMN_ID,
]);

interface StickyGroupParentProps {
  tableWidth: number;
  headerHeight: number;
}

export const StickyGroupParent: FC<StickyGroupParentProps> = ({ tableWidth, headerHeight }) => {
  const { table, containerRef, tbodyRef, virtualizerRef, virtualized } = useTableContext();

  const useWindowScroll = virtualized === 'window';

  const { stickyRow, pushUpOffset } = useStickyGroupParent<RowData>({
    table,
    scrollElementRef: containerRef,
    useWindowScroll,
    headerHeight,
    tbodyRef,
    virtualizerRef,
    enabled: true,
  });

  // Measure the overlay row height for the clip wrapper
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Track the sticky row's expanded state so we can adjust scroll when
  // a group is collapsed while stuck. The expand toggle inside
  // TableBodyCell calls row.toggleExpanded() directly.
  const prevExpandedRef = useRef<boolean | null>(null);
  const prevStickyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!stickyRow) {
      prevExpandedRef.current = null;
      prevStickyIdRef.current = null;
      return;
    }

    const isExpanded = stickyRow.getIsExpanded();
    const isSameRow = prevStickyIdRef.current === stickyRow.id;

    // Detect collapse of a stuck group
    if (isSameRow && prevExpandedRef.current === true && !isExpanded) {
      const scrollElement = containerRef.current;
      if (scrollElement) {
        const tbodyEl = tbodyRef.current;
        if (tbodyEl) {
          const rowEl = tbodyEl.querySelector(`[data-row-id="${stickyRow.id}"]`);
          if (rowEl instanceof HTMLElement) {
            if (useWindowScroll) {
              const rect = rowEl.getBoundingClientRect();
              window.scrollTo({ top: window.scrollY + rect.top - headerHeight });
            } else {
              scrollElement.scrollTop = rowEl.offsetTop + (tbodyEl.offsetTop || 0) - headerHeight;
            }
          }
        }
      }
    }

    prevExpandedRef.current = isExpanded;
    prevStickyIdRef.current = stickyRow.id;
  }, [stickyRow, containerRef, tbodyRef, useWindowScroll, headerHeight]);

  if (!stickyRow) return null;

  const cells = stickyRow.getVisibleCells();
  const systemCells = cells.filter(c => SYSTEM_COLUMN_IDS.has(c.column.id));
  const dataCells = cells.filter(c => !SYSTEM_COLUMN_IDS.has(c.column.id));
  const firstDataCell = dataCells[0];
  const isSelected = stickyRow.getIsAllSubRowsSelected();

  return (
    <div
      className='sticky z-20 h-0 overflow-visible pointer-events-none'
      style={{ top: headerHeight }}
      aria-hidden='true'
    >
      <div className='overflow-hidden' style={{ height: rowRef.current?.offsetHeight ?? 40 }}>
        <div style={{ transform: pushUpOffset ? `translateY(${pushUpOffset}px)` : undefined }}>
          <table
            className='table-fixed border-separate border-spacing-0 pointer-events-auto'
            style={{ width: tableWidth }}
          >
            <TableColGroup tableWidth={tableWidth} />
            <tbody>
              <Tr ref={rowRef} className='group/row' data-selected={isSelected || undefined}>
                {systemCells.map(cell => (
                  <TableBodyCell key={cell.id} cell={cell} disablePinnedShadow />
                ))}
                {firstDataCell && (
                  <TableBodyCell cell={firstDataCell} className='border-r-0' disablePinnedShadow />
                )}
                {dataCells.slice(1).map(cell => (
                  <Td
                    key={cell.id}
                    className={cn(
                      'border-b border-border-primary-light bg-bg-surface-2 overlay',
                      'group-hover/row:overlay-states-primary-hover group-data-[selected]/row:overlay-states-primary-active',
                    )}
                    style={{ width: cell.column.getSize() }}
                    aria-hidden='true'
                  />
                ))}
              </Tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

StickyGroupParent.displayName = 'StickyGroupParent';
