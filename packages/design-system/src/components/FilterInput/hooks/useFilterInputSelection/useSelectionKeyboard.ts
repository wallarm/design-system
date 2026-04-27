import type { KeyboardEvent, RefObject } from 'react';
import { useCallback } from 'react';
import { hasDragSelection } from './lib';

interface UseSelectionKeyboardOptions {
  allSelected: boolean;
  conditionsCount: number;
  chipRegistryRef: RefObject<Map<string, HTMLElement>>;
  containerRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  clearAll: () => void;
  clearSelection: () => void;
  onSelectAll: () => void;
}

export const useSelectionKeyboard = ({
  allSelected,
  conditionsCount,
  chipRegistryRef,
  containerRef,
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
        // Focus the container (tabIndex=-1) instead of blurring the input — this
        // moves the caret off the input visually but keeps focus inside our React
        // subtree, so subsequent Ctrl+C / Ctrl+V still hit onCopy / onPaste.
        containerRef.current?.focus();
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
      containerRef,
      inputRef,
      clearAll,
      clearSelection,
      onSelectAll,
    ],
  );

  return { handleKeyDown };
};
