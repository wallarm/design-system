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
  resetMenuAnchor: () => void;
  setInputText: Dispatch<SetStateAction<string>>;
  setSelectedField: Dispatch<SetStateAction<FieldMetadata | null>>;
  setSelectedOperator: Dispatch<SetStateAction<FilterOperator | null>>;
  setBuildingMultiValue: Dispatch<SetStateAction<string | undefined>>;
  setBuildingSide: (side: 0 | 1) => void;
  setBuildingBase: (base: null) => void;
  setInsertIndex: Dispatch<SetStateAction<number | null>>;
  setInsertAfterConnector: Dispatch<SetStateAction<boolean>>;
  setMenuState: Dispatch<SetStateAction<MenuState>>;
}

/**
 * Resets all autocomplete state and refocuses the input.
 *
 * Body-focus policy: here, activeElement===body is treated as "stayed inside"
 * (refocus the input) because doReset()'s state mutations can synchronously
 * unmount the element that had focus, and the browser drops to body. The
 * opposite policy in useFocusManagement treats body-focus as "user clicked
 * outside" — both coexist because the triggers differ (state-driven re-render
 * vs. genuine outside click). If unifying these, preserve the re-render
 * refocus case or commit chains break. AS-882.
 */
export const useResetState = ({
  editing,
  dateRange,
  containerRef,
  inputRef,
  resetMenuAnchor,
  setInputText,
  setSelectedField,
  setSelectedOperator,
  setBuildingMultiValue,
  setBuildingSide,
  setBuildingBase,
  setInsertIndex,
  setInsertAfterConnector,
  setMenuState,
}: UseResetStateDeps) => {
  const resetState = useCallback(
    (continueBuilding = false) => {
      const doReset = () => {
        setInputText('');
        setSelectedField(null);
        setSelectedOperator(null);
        editing.clearEditing();
        dateRange.reset();
        setBuildingMultiValue(undefined);
        setBuildingSide(0);
        setBuildingBase(null);
        setInsertIndex(null);
        setInsertAfterConnector(false);
        resetMenuAnchor();
        setMenuState('closed');
      };

      if (continueBuilding) {
        // flushSync commits DOM (input moves) before reopening the menu.
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
      resetMenuAnchor,
      setInputText,
      setSelectedField,
      setSelectedOperator,
      setBuildingMultiValue,
      setBuildingSide,
      setBuildingBase,
      setInsertIndex,
      setInsertAfterConnector,
      setMenuState,
    ],
  );

  return resetState;
};
