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
  resetMenuOffset: () => void;
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
  resetMenuOffset,
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
      resetMenuOffset();
      setMenuState('closed');
      inputRef.current?.focus();
    },
    [
      removeCondition,
      resetMenuOffset,
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
      // flushSync commits DOM update (input moves to gap position) before reopening the menu.
      // setMenuState('closed') inside + setMenuState('field') outside is intentional:
      // the menu must fully unmount so getAnchorRect reads the new input position.
      flushSync(() => {
        setInsertIndex(conditionIndex);
        setInsertAfterConnector(afterConnector);
        resetMenuOffset();
        setMenuState('closed');
      });
      setMenuState('field');
      inputRef.current?.focus();
    },
    [resetMenuOffset, inputRef, setInsertIndex, setInsertAfterConnector, setMenuState],
  );

  const closeAutocompleteMenu = useCallback(() => {
    setMenuState('closed');
  }, [setMenuState]);

  return { handleChipRemove, handleClear, handleGapClick, closeAutocompleteMenu };
};
