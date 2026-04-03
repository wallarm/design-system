import { useCallback } from 'react';
import { useTableContext } from '../TableContext';

/**
 * Encapsulates preview drawer logic for a body cell.
 * Returns flags and a click handler based on `previewTrigger` mode.
 */
export const usePreviewCell = <T>(columnId: string, rowId: string) => {
  const { masterColumnId, previewRowId, setPreviewRowId, renderPreviewContent, previewTrigger } =
    useTableContext<T>();

  const isMasterColumn = columnId === masterColumnId;
  const hasPreview = isMasterColumn && !!renderPreviewContent;
  const isMasterTrigger = hasPreview && previewTrigger === 'master';
  const isButtonTrigger = hasPreview && previewTrigger === 'button';
  const isActive = previewRowId === rowId;

  const togglePreview = useCallback(() => {
    setPreviewRowId(isActive ? null : rowId);
  }, [setPreviewRowId, isActive, rowId]);

  return {
    /** Preview opens by clicking the master cell */
    isMasterTrigger,
    /** Preview opens via a toggle button in actions */
    isButtonTrigger,
    /** This row is currently shown in the preview drawer */
    isActive,
    /** Toggle preview for this row (open/close) */
    togglePreview,
  };
};
