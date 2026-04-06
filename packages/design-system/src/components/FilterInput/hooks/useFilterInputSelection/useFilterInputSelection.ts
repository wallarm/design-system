import type { RefObject } from 'react';
import { useCallback, useState } from 'react';
import type { Condition, ExprNode, FieldMetadata } from '../../types';
import { clearDragAttributes } from './lib';
import { useDragSelection } from './useDragSelection';
import { useSelectionClipboard } from './useSelectionClipboard';
import { useSelectionKeyboard } from './useSelectionKeyboard';

interface UseFilterInputSelectionOptions {
  conditions: Condition[];
  connectors: Array<'and' | 'or'>;
  fields: FieldMetadata[];
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
    setPasteError(null);
    clearDragAttributes(chipRegistryRef.current);
  }, [chipRegistryRef]);

  const { handleMouseDown } = useDragSelection({
    chipRegistryRef,
    inputRef,
    onSelectAll,
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

  const { handleCopy, handlePaste } = useSelectionClipboard({
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
    handleMouseDown,
    handleKeyDown,
    handleCopy,
    handlePaste,
  };
};
