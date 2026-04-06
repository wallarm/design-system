import type { KeyboardEvent, RefObject } from 'react';
import { useCallback } from 'react';
import { hasDragSelection } from './lib';

interface UseSelectionKeyboardOptions {
  allSelected: boolean;
  conditionsCount: number;
  chipRegistryRef: RefObject<Map<string, HTMLElement>>;
  inputRef: RefObject<HTMLInputElement | null>;
  clearAll: () => void;
  clearSelection: () => void;
  onSelectAll: () => void;
}

export const useSelectionKeyboard = ({
  allSelected,
  conditionsCount,
  chipRegistryRef,
  inputRef,
  clearAll,
  clearSelection,
  onSelectAll,
}: UseSelectionKeyboardOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isMod = e.metaKey || e.ctrlKey;
      const hasSelection = allSelected || hasDragSelection(chipRegistryRef.current);

      // Ctrl+A — select all
      if (isMod && e.key === 'a' && conditionsCount > 0) {
        e.preventDefault();
        clearSelection();
        onSelectAll();
        inputRef.current?.blur();
        return;
      }

      // Delete/Backspace — remove selected (non-disabled)
      if (hasSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        clearAll();
        clearSelection();
        return;
      }

      // Escape — deselect
      if (hasSelection && e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        inputRef.current?.focus();
        return;
      }

      // Any other key — deselect
      if (hasSelection && !isMod) {
        clearSelection();
      }
    },
    [
      allSelected,
      conditionsCount,
      chipRegistryRef,
      inputRef,
      clearAll,
      clearSelection,
      onSelectAll,
    ],
  );

  return { handleKeyDown };
};
