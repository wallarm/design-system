import { type FC, type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import type { RowData } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { useStickyGroupParent } from './hooks';
import {
  type ScrollRoot,
  scrollRootBy,
  TABLE_DRAG_HANDLE_COLUMN_ID,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  useRenderEveryTime,
  useTableValue,
  withTableState,
} from './lib';
import { Td, Tr } from './primitives';
import { TableBodyCell } from './TableBody/TableBodyCell';
import { TableColGroup } from './TableColGroup';
import { useTableContext } from './TableContext';
import { TableFullWidthCell } from './TableRow';

const SYSTEM_COLUMN_IDS = new Set([
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  TABLE_DRAG_HANDLE_COLUMN_ID,
]);

interface StickyGroupParentProps {
  tableWidth: number;
  headerHeight: number;
  /**
   * `virtualized='window'`: the resolved scroll root. The overlay is then drawn
   * by the caller inside the sticky header shell, right under `headerRef`: the
   * body's horizontal scroll viewport never scrolls vertically, so nothing in it
   * can stick.
   */
  windowScrollRoot?: ScrollRoot | null;
  headerRef?: RefObject<HTMLElement | null>;
}

export const StickyGroupParent: FC<StickyGroupParentProps> = ({
  tableWidth,
  headerHeight,
  windowScrollRoot,
  headerRef,
}) => {
  const { table, containerRef, tbodyRef, virtualizerRef, renderFullWidthGroupRow } =
    useTableContext();

  const useWindowScroll = windowScrollRoot != null;

  const { stickyRow, pushUpOffset } = useStickyGroupParent<RowData>({
    table,
    scrollElementRef: containerRef,
    windowScrollRoot,
    headerRef,
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
            if (windowScrollRoot) {
              const headerBottom =
                headerRef?.current?.getBoundingClientRect().bottom ?? headerHeight;
              scrollRootBy(windowScrollRoot, rowEl.getBoundingClientRect().top - headerBottom);
            } else {
              scrollElement.scrollTop = rowEl.offsetTop + (tbodyEl.offsetTop || 0) - headerHeight;
            }
          }
        }
      }
    }

    prevExpandedRef.current = isExpanded;
    prevStickyIdRef.current = stickyRow.id;
  }, [stickyRow, containerRef, tbodyRef, windowScrollRoot, headerRef, headerHeight]);

  const cells = useTableValue(() => stickyRow?.getVisibleCells());
  const systemCells = cells?.filter(c => SYSTEM_COLUMN_IDS.has(c.column.id));
  const dataCells = cells?.filter(c => !SYSTEM_COLUMN_IDS.has(c.column.id));
  const firstDataCell = dataCells?.[0];
  const isSelected = useTableValue(() => stickyRow?.getIsAllSubRowsSelected());
  const fullWidthContent = useRenderEveryTime(() =>
    stickyRow ? renderFullWidthGroupRow?.(stickyRow) : undefined,
  );
  const isFullWidth = fullWidthContent !== undefined;

  // Window mode: the caller mirrors the body's scrollLeft onto this anchor's
  // wrapper, so the anchor is as wide as the table (else its clip hides the
  // overflow and there is nothing to scroll). Empty, it still clamps to 0, so a
  // row that sticks takes the body's scrollLeft again.
  const anchorRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const wrapper = anchorRef.current?.parentElement;
    if (useWindowScroll && stickyRow && wrapper && containerRef.current)
      wrapper.scrollLeft = containerRef.current.scrollLeft;
  }, [useWindowScroll, stickyRow, containerRef]);

  // The stuck row is an aria-hidden copy of the real one, still clickable: its
  // controls stay out of the tab order, which reaches the real row instead.
  useLayoutEffect(() => {
    for (const el of anchorRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]',
    ) ?? [])
      el.tabIndex = -1;
  });

  // Always render the sticky anchor to avoid DOM insertion/removal during
  // scroll which causes a brief layout reflow (the "jump" glitch).
  return (
    <div
      ref={anchorRef}
      className={cn(
        'pointer-events-none',
        !useWindowScroll && 'sticky z-[21] h-0 overflow-visible',
      )}
      style={useWindowScroll ? { width: tableWidth } : { top: headerHeight }}
      aria-hidden='true'
    >
      {stickyRow && (
        <div className='overflow-hidden' style={{ height: rowRef.current?.offsetHeight ?? 40 }}>
          <div style={{ transform: pushUpOffset ? `translateY(${pushUpOffset}px)` : undefined }}>
            <table
              className='table-fixed border-separate border-spacing-0 pointer-events-auto'
              style={{ width: tableWidth }}
            >
              <TableColGroup tableWidth={tableWidth} />
              <tbody>
                <Tr ref={rowRef} className='group/row' data-selected={isSelected || undefined}>
                  {systemCells!.map(cell => (
                    <TableBodyCell key={cell.id} cell={cell} disablePinnedShadow />
                  ))}
                  {isFullWidth && (
                    <TableFullWidthCell colSpan={dataCells!.length}>
                      {fullWidthContent}
                    </TableFullWidthCell>
                  )}
                  {!isFullWidth && firstDataCell && (
                    <TableBodyCell
                      cell={firstDataCell}
                      className='border-r-0'
                      disablePinnedShadow
                    />
                  )}
                  {/* Filler cells read their column width — recreated on every table state change. */}
                  {withTableState(table.state, () =>
                    (isFullWidth ? [] : dataCells!)
                      .slice(1)
                      .map(cell => (
                        <Td
                          key={cell.id}
                          className={cn(
                            'border-b border-border-primary-light bg-bg-surface-2 overlay',
                            'group-hover/row:overlay-states-primary-hover group-data-[selected]/row:overlay-states-primary-active',
                            'group-data-[preview-active]/row:overlay-states-primary-hover group-has-[[data-state=open]]/row:overlay-states-primary-hover',
                          )}
                          style={{ width: cell.column.getSize() }}
                          aria-hidden='true'
                        />
                      )),
                  )}
                </Tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

StickyGroupParent.displayName = 'StickyGroupParent';
