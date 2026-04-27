import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { isMenuRelated } from '../../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../../types';

interface UseResetStateDeps {
  editing: { clearEditing: () => void };
  dateRange: { reset: () => void };
  containerRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  resetMenuOffset: () => void;
  setInputText: Dispatch<SetStateAction<string>>;
  setSelectedField: Dispatch<SetStateAction<FieldMetadata | null>>;
  setSelectedOperator: Dispatch<SetStateAction<FilterOperator | null>>;
  setBuildingMultiValue: Dispatch<SetStateAction<string | undefined>>;
  setInsertIndex: Dispatch<SetStateAction<number | null>>;
  setInsertAfterConnector: Dispatch<SetStateAction<boolean>>;
  setMenuState: Dispatch<SetStateAction<MenuState>>;
}

/**
 * Resets all autocomplete state and conditionally returns focus to the main input.
 *
 * Focus restoration policy: only refocus when activeElement still "belongs" to us
 * — inside container, inside a FilterInput-owned menu, or `document.body`. The
 * body case here means activeElement just dropped because a chip/menu was removed
 * on re-render — keep focus in the input. Contrast with useFocusManagement's rAF
 * guard, which treats body-focus as outside. AS-882.
 */
export const useResetState = ({
  editing,
  dateRange,
  containerRef,
  inputRef,
  resetMenuOffset,
  setInputText,
  setSelectedField,
  setSelectedOperator,
  setBuildingMultiValue,
  setInsertIndex,
  setInsertAfterConnector,
  setMenuState,
}: UseResetStateDeps) =>
  useCallback(
    (continueBuilding = false) => {
      const doReset = () => {
        setInputText('');
        setSelectedField(null);
        setSelectedOperator(null);
        editing.clearEditing();
        dateRange.reset();
        setBuildingMultiValue(undefined);
        setInsertIndex(null);
        setInsertAfterConnector(false);
        resetMenuOffset();
        setMenuState('closed');
      };

      if (continueBuilding) {
        // flushSync commits DOM update (input moves to new position) before reopening the menu
        flushSync(doReset);
        setMenuState('field');
      } else {
        doReset();
      }

      const active = document.activeElement as HTMLElement | null;
      const stayedInside =
        active === document.body || containerRef.current?.contains(active) || isMenuRelated(active);
      if (stayedInside) {
        inputRef.current?.focus();
      }
    },
    [
      editing,
      dateRange,
      inputRef,
      containerRef,
      resetMenuOffset,
      setInputText,
      setSelectedField,
      setSelectedOperator,
      setBuildingMultiValue,
      setInsertIndex,
      setInsertAfterConnector,
      setMenuState,
    ],
  );
