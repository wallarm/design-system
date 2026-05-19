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
  setInsertIndex: Dispatch<SetStateAction<number | null>>;
  setInsertAfterConnector: Dispatch<SetStateAction<boolean>>;
  setMenuState: Dispatch<SetStateAction<MenuState>>;
}

/**
 * Resets all autocomplete state and conditionally returns focus to the main input.
 *
 * ── Body-focus policy (READ THIS) ─────────────────────────────────────────────
 * `document.activeElement === document.body` is treated **as "stayed inside"** here
 * — i.e. we DO refocus the main input. The reasoning: state mutations in
 * `doReset()` (e.g. `editing.clearEditing()`) can synchronously unmount the
 * element that previously had focus (a chip's inline input, a menu item), and
 * the browser drops focus to body in that case. We want to honor "user is still
 * working in the FilterInput" intent and put the caret back in the input.
 *
 * The opposite policy lives in `useFocusManagement.ts`'s rAF effect: there,
 * body-focus means "user clicked outside" (e.g. tenant switcher) and we MUST
 * NOT recapture. The two policies coexist because the triggers are different
 * (state-driven re-render vs. genuine outside click).
 *
 * If you find yourself unifying these — make sure the "DOM dropped focus on
 * re-render" case still refocuses, otherwise resetState during commit chains
 * breaks. AS-882.
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
        setInsertIndex(null);
        setInsertAfterConnector(false);
        resetMenuAnchor();
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
      resetMenuAnchor,
      setInputText,
      setSelectedField,
      setSelectedOperator,
      setBuildingMultiValue,
      setInsertIndex,
      setInsertAfterConnector,
      setMenuState,
    ],
  );

  return resetState;
};
