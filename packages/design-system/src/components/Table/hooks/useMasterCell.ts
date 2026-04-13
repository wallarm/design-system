import { useCallback } from 'react';
import { useTableContext } from '../TableContext';

/**
 * Encapsulates master cell click logic for a body cell.
 * Returns flags and a click handler for the master column.
 */
export const useMasterCell = <T>(columnId: string, rowId: string) => {
  const { masterColumnId, onMasterCellClick } = useTableContext<T>();

  const isMasterColumn = columnId === masterColumnId;
  const hasMasterClick = isMasterColumn && !!onMasterCellClick;

  const handleClick = useCallback(() => {
    onMasterCellClick?.(rowId);
  }, [onMasterCellClick, rowId]);

  return {
    /** Master cell click is enabled */
    isMasterTrigger: hasMasterClick,
    /** Fire master cell click for this row */
    handleClick,
    /** Tooltip text for master cell hover */
    tooltipText: hasMasterClick ? 'Open details' : undefined,
  };
};
