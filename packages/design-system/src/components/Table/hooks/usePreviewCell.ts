import { useCallback } from 'react';
import { useTableContext } from '../TableContext';

/**
 * Encapsulates preview drawer logic for a body cell.
 * Returns flags and a click handler based on `preview.trigger` mode.
 */
export const usePreviewCell = <T>(columnId: string, rowId: string) => {
  const { masterColumnId, preview } = useTableContext<T>();

  const isMasterColumn = columnId === masterColumnId;
  const hasPreview = isMasterColumn && !!preview.renderContent;
  const isMasterTrigger = hasPreview && preview.trigger === 'master';
  const isButtonTrigger = hasPreview && preview.trigger === 'button';
  const isActive = preview.rowId === rowId;

  const togglePreview = useCallback(() => {
    preview.setRowId(isActive ? null : rowId);
  }, [preview.setRowId, isActive, rowId]);

  return {
    /** Preview opens by clicking the master cell */
    isMasterTrigger,
    /** Preview opens via a toggle button in actions */
    isButtonTrigger,
    /** This row is currently shown in the preview drawer */
    isActive,
    /** Toggle preview for this row (open/close) */
    togglePreview,
    /** Tooltip text for master cell hover */
    tooltipText: hasPreview ? preview.tooltipText : undefined,
  };
};
