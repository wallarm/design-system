import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { chipIdToConditionIndex } from '../../lib';
import type { MenuState } from '../../types';

interface UseChipActionsDeps {
  effectiveInsertIndexRef: RefObject<number>;
  inputRef: RefObject<HTMLInputElement | null>;
  removeCondition: (chipId: string) => void;
  clearAll: () => void;
  resetMenuAnchor: () => void;
  resetState: () => void;
  setInsertIndex: Dispatch<SetStateAction<number | null>>;
  setInsertAfterConnector: Dispatch<SetStateAction<boolean>>;
  setMenuState: Dispatch<SetStateAction<MenuState>>;
}

/**
 * Imperative chip/menu commands exposed by FilterInput's autocomplete:
 * - removing a single chip (with insertIndex compensation)
 * - clearing all chips
 * - clicking a gap between chips to insert a new condition there
 * - closing the menu (used by external consumers like the connector chip)
 */
export const useChipActions = ({
  effectiveInsertIndexRef,
  inputRef,
  removeCondition,
  clearAll,
  resetMenuAnchor,
  resetState,
  setInsertIndex,
  setInsertAfterConnector,
  setMenuState,
}: UseChipActionsDeps) => {
  const handleChipRemove = useCallback(
    (chipId: string) => {
      const chipCondIdx = chipIdToConditionIndex(chipId);
      if (chipCondIdx !== null && chipCondIdx < effectiveInsertIndexRef.current) {
        setInsertIndex(prev => (prev != null ? prev - 1 : prev));
      }
      removeCondition(chipId);
      resetMenuAnchor();
      setMenuState('closed');
      inputRef.current?.focus();
    },
    [
      removeCondition,
      resetMenuAnchor,
      inputRef,
      effectiveInsertIndexRef,
      setInsertIndex,
      setMenuState,
    ],
  );

  const handleClear = useCallback(() => {
    clearAll();
    resetState();
  }, [clearAll, resetState]);

  const handleGapClick = useCallback(
    (conditionIndex: number, afterConnector: boolean) => {
      // Drop any in-progress building chip first — AS-970 made them
      // long-lived, so without this reset the gap click would relocate
      // the half-built chip to the new index.
      resetState();
      // Unmount the menu (flushSync + closed-then-field) so getAnchorRect
      // reads the new input position after the DOM commits.
      flushSync(() => {
        setInsertIndex(conditionIndex);
        setInsertAfterConnector(afterConnector);
        resetMenuAnchor();
        setMenuState('closed');
      });
      setMenuState('field');
      inputRef.current?.focus();
    },
    [resetState, resetMenuAnchor, inputRef, setInsertIndex, setInsertAfterConnector, setMenuState],
  );

  const closeAutocompleteMenu = useCallback(() => {
    setMenuState('closed');
  }, [setMenuState]);

  return { handleChipRemove, handleClear, handleGapClick, closeAutocompleteMenu };
};
