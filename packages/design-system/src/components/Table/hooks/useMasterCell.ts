import { useCallback } from 'react';
import { useTableContext } from '../TableContext';

/**
 * Encapsulates master cell click logic for a body cell.
 * Returns flags and a click handler for the master column.
 */
export const useMasterCell = <T>(columnId: string, rowId: string) => {
  const { masterColumnId, masterCell } = useTableContext<T>();

  const isMasterColumn = columnId === masterColumnId;
  const hasMasterClick = isMasterColumn && !!masterCell.onMasterCellClick;

  const handleClick = useCallback(() => {
    masterCell.onMasterCellClick?.(rowId);
  }, [masterCell.onMasterCellClick, rowId]);

  return {
    /** Master cell click is enabled */
    isMasterTrigger: hasMasterClick,
    /** Fire master cell click for this row */
    handleClick,
    /** Tooltip text for master cell hover */
    tooltipText: hasMasterClick ? masterCell.tooltipText : undefined,
  };
};
