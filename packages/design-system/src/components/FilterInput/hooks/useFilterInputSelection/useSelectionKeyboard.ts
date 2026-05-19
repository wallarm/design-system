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

      if (isMod && e.key === 'a' && conditionsCount > 0) {
        e.preventDefault();
        clearSelection();
        onSelectAll();
        // Focus container (tabIndex=-1) so Ctrl+C/V still hit onCopy/onPaste
        // while the caret moves off the input.
        containerRef.current?.focus();
        return;
      }

      if (hasSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        clearAll();
        clearSelection();
        return;
      }

      if (hasSelection && e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        inputRef.current?.focus();
        return;
      }

      // Any other key deselects.
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
