import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import type { RowData } from '@tanstack/react-table';
import { useTableContext } from '../TableContext';

/**
 * Encapsulates master cell click logic for a body cell.
 * Returns flags and a click handler for the master column.
 */
export const useMasterCell = <T extends RowData>(columnId: string, rowId: string) => {
  const { masterColumnId, onMasterCellClick } = useTableContext<T>();

  const isMasterColumn = columnId === masterColumnId;
  const hasMasterClick = isMasterColumn && !!onMasterCellClick;

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Skip when the click originates from the action area so the drawer
      // doesn't open while still letting the event propagate for analytics.
      if ((e.target as HTMLElement).closest('[data-master-cell-action]')) return;
      onMasterCellClick?.(rowId);
    },
    [onMasterCellClick, rowId],
  );

  return {
    /** Master cell click is enabled */
    isMasterTrigger: hasMasterClick,
    /** Fire master cell click for this row */
    handleClick,
    /** Tooltip text for master cell hover */
    tooltipText: hasMasterClick ? 'Open details' : undefined,
  };
};
