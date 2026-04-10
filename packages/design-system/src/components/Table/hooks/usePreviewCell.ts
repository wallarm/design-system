import { useCallback } from 'react';
import { useTableContext } from '../TableContext';

/**
 * Encapsulates master cell click logic for a body cell.
 * Returns flags and a click handler for the master column.
 */
export const usePreviewCell = <T>(columnId: string, rowId: string) => {
  const { masterColumnId, masterCell } = useTableContext<T>();

  const isMasterColumn = columnId === masterColumnId;
  const hasMasterClick = isMasterColumn && !!masterCell.onMasterCellClick;
  const isActive = masterCell.activeRowId === rowId;

  const handleClick = useCallback(() => {
    masterCell.onMasterCellClick?.(rowId);
  }, [masterCell.onMasterCellClick, rowId]);

  return {
    /** Master cell click is enabled */
    isMasterTrigger: hasMasterClick,
    /** This row is currently active (highlighted) */
    isActive,
    /** Fire master cell click for this row */
    togglePreview: handleClick,
    /** Tooltip text for master cell hover */
    tooltipText: hasMasterClick ? masterCell.tooltipText : undefined,
  };
};
