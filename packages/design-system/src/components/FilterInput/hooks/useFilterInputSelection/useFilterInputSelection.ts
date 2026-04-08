import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Condition, ExprNode, FieldMetadata } from '../../types';
import { clearDragAttributes, hasDragSelection } from './lib';
import { useDragSelection } from './useDragSelection';
import { useSelectionClipboard } from './useSelectionClipboard';
import { useSelectionKeyboard } from './useSelectionKeyboard';

interface UseFilterInputSelectionOptions {
  conditions: Condition[];
  connectors: Array<'and' | 'or'>;
  fields: FieldMetadata[];
  containerRef: RefObject<HTMLDivElement | null>;
  chipRegistryRef: RefObject<Map<string, HTMLElement>>;
  inputRef: RefObject<HTMLInputElement | null>;
  clearAll: () => void;
  setInputText: (text: string) => void;
  closeMenu: () => void;
  onChange?: (expression: ExprNode | null) => void;
}

export const useFilterInputSelection = ({
  conditions,
  connectors,
  fields,
  containerRef,
  chipRegistryRef,
  inputRef,
  clearAll,
  setInputText,
  closeMenu,
  onChange,
}: UseFilterInputSelectionOptions) => {
  const [allSelected, setAllSelected] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  const onSelectAll = useCallback(() => setAllSelected(true), []);

  const clearSelection = useCallback(() => {
    setAllSelected(false);
    clearDragAttributes(chipRegistryRef.current);
  }, [chipRegistryRef]);

  const dismissPasteError = useCallback(() => setPasteError(null), []);

  // Clear chip selection when clicking outside the filter input
  const allSelectedRef = useRef(false);
  allSelectedRef.current = allSelected;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        if (allSelectedRef.current || hasDragSelection(chipRegistryRef.current)) {
          clearSelection();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [containerRef, chipRegistryRef, clearSelection]);

  const { handleMouseDown } = useDragSelection({
    chipRegistryRef,
    inputRef,
    closeMenu,
  });

  const { handleKeyDown } = useSelectionKeyboard({
    allSelected,
    conditionsCount: conditions.length,
    chipRegistryRef,
    inputRef,
    clearAll,
    clearSelection,
    onSelectAll,
  });

  const { handleCopy, handlePaste, retryParse } = useSelectionClipboard({
    conditions,
    connectors,
    fields,
    chipRegistryRef,
    clearSelection,
    setPasteError,
    setInputText,
    closeMenu,
    onChange,
  });

  return {
    allSelected,
    pasteError,
    clearSelection,
    dismissPasteError,
    handleMouseDown,
    handleKeyDown,
    handleCopy,
    handlePaste,
    retryParse,
  };
};
