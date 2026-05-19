import type { ChangeEvent, KeyboardEvent, MutableRefObject, RefObject } from 'react';
import { useCallback, useRef } from 'react';
import {
  applyAcceptChar,
  getOperatorFromLabel,
  hasFieldValues,
  nextBuildingMenu,
  OPERATOR_SYMBOLS,
} from '../../lib';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../../types';

type BuildingStep = 'field' | 'operator' | 'value';

interface UseInputHandlersDeps {
  inputText: string;
  menuState: MenuState;
  selectedField: FieldMetadata | null;
  /** Needed so a click into the main input while a building chip is alive
   *  resumes at the next missing segment instead of doing nothing. */
  selectedOperator: FilterOperator | null;
  isFocused: boolean;
  fields: FieldMetadata[];
  inputRef: RefObject<HTMLInputElement | null>;
  conditionsRef: MutableRefObject<Condition[]>;
  conditionsLengthRef: MutableRefObject<number>;
  effectiveInsertIndexRef: MutableRefObject<number>;
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  setInsertIndex: (fn: (prev: number | null) => number) => void;
  resetMenuOffset: () => void;
  removeConditionAtIndex: (index: number) => void;
  handleFieldSelect: (field: FieldMetadata) => void;
  handleOperatorSelect: (operator: FilterOperator) => void;
  handleCustomValueCommit: (text: string) => void;
  /** Step the building chip one segment back (value → operator → field).
   *  Called on Backspace from an empty main input while a building chip is
   *  alive. At the field step (only attribute remains) it tears the chip
   *  down entirely. */
  stepBackBuildingMenu: (current: BuildingStep) => void;
}

export const useInputHandlers = ({
  inputText,
  menuState,
  selectedField,
  selectedOperator,
  isFocused,
  fields,
  inputRef,
  conditionsRef,
  conditionsLengthRef,
  effectiveInsertIndexRef,
  setInputText,
  setMenuState,
  setInsertIndex,
  resetMenuOffset,
  removeConditionAtIndex,
  handleFieldSelect,
  handleOperatorSelect,
  handleCustomValueCommit,
  stepBackBuildingMenu,
}: UseInputHandlersDeps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let text = e.target.value;
      // When the user is entering a value for a field that specifies a
      // per-character filter, strip everything that isn't allowed.
      if (menuState === 'value' && selectedField?.acceptChar) {
        text = applyAcceptChar(text, selectedField.acceptChar);
        if (text !== e.target.value) {
          e.target.value = text;
        }
      }
      setInputText(text);

      if (text && !selectedField) {
        setMenuState('field');
      } else if (!text && !selectedField) {
        setMenuState(isFocused && conditionsLengthRef.current === 0 ? 'field' : 'closed');
      }
    },
    [menuState, selectedField, isFocused, setInputText, setMenuState, conditionsLengthRef],
  );

  const handleInputClick = useCallback(() => {
    inputRef.current?.focus();
    if (menuState !== 'closed') return;
    // Either start a fresh chip (no building yet) or resume an in-progress
    // one at the next missing segment — the helper handles both.
    resetMenuOffset();
    setMenuState(nextBuildingMenu(selectedField, selectedOperator)!);
  }, [menuState, selectedField, selectedOperator, resetMenuOffset, inputRef, setMenuState]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        if (menuState === 'closed') {
          // Re-open the appropriate menu when the user presses ArrowDown on a
          // closed dropdown (e.g. after Backspace tears down a committed chip
          // and sets menuState='closed'). nextBuildingMenu resolves to 'value'
          // / 'operator' / 'field' depending on the in-progress building chip,
          // matching the behavior of the refocus path in useFocusManagement.
          e.preventDefault();
          resetMenuOffset();
          setMenuState(nextBuildingMenu(selectedField, selectedOperator)!);
          return;
        }
        // For list menus (field/operator/value), useKeyboardNav's window-capture
        // listener intercepts first and stopPropagation() prevents this React
        // handler from running — DOM focus stays on the input (combobox).
        // For menus without useKeyboardNav (e.g. date picker), event reaches
        // here and we hand DOM focus to the menu so its internal keyboard nav
        // can take over (calendar arrow navigation, Apply button, etc.).
        e.preventDefault();
        menuRef.current?.focus();
        return;
      }

      // Enter on field menu: match typed text to a field name/label
      if (e.key === 'Enter' && menuState === 'field' && !selectedField && inputText.trim()) {
        const trimmed = inputText.trim().toLowerCase();
        const matched = fields.find(
          f => f.label.toLowerCase() === trimmed || f.name.toLowerCase() === trimmed,
        );
        if (matched) {
          e.preventDefault();
          handleFieldSelect(matched);
          setInputText('');
          return;
        }
      }

      // Enter on operator menu: match typed text to operator label or symbol
      if (e.key === 'Enter' && menuState === 'operator' && selectedField && inputText.trim()) {
        const trimmed = inputText.trim();
        // Try matching by label first ("is", "greater", etc.)
        let matched = getOperatorFromLabel(trimmed, selectedField.type);
        // Try matching by symbol ("=", "!=", ">", "~", "IN", etc.)
        if (!matched) {
          const symbolMatch = Object.entries(OPERATOR_SYMBOLS).find(
            ([, sym]) => sym.toLowerCase() === trimmed.toLowerCase(),
          );
          if (symbolMatch) matched = symbolMatch[0] as FilterOperator;
        }
        // Try matching by raw operator key ("like", "not_like", etc.)
        if (!matched) {
          const allOperators = selectedField.operators ?? [];
          const rawMatch = allOperators.find(op => op.toLowerCase() === trimmed.toLowerCase());
          if (rawMatch) matched = rawMatch;
        }
        if (matched) {
          e.preventDefault();
          handleOperatorSelect(matched);
          setInputText('');
          return;
        }
      }

      // Enter commits freeform value when no predefined values exist
      if (
        e.key === 'Enter' &&
        menuState === 'value' &&
        selectedField &&
        !hasFieldValues(selectedField) &&
        inputText.trim()
      ) {
        e.preventDefault();
        handleCustomValueCommit(inputText);
        return;
      }

      if (e.key === 'Backspace' && !e.repeat && inputText === '') {
        // Building cascade in main input: empty Backspace steps the menu back
        // (value → operator → field), then tears the building chip down.
        // Takes precedence over the "remove previous chip" branch — while a
        // building chip is alive, Backspace navigates within it rather than
        // jumping to a committed sibling.
        if (
          selectedField &&
          (menuState === 'value' || menuState === 'operator' || menuState === 'field')
        ) {
          e.preventDefault();
          stepBackBuildingMenu(menuState);
          return;
        }
        if (conditionsLengthRef.current > 0) {
          e.preventDefault();
          const removeIdx = effectiveInsertIndexRef.current - 1;
          if (removeIdx >= 0 && !conditionsRef.current[removeIdx]?.disabled) {
            removeConditionAtIndex(removeIdx);
            setInsertIndex(prev => {
              const eff = prev ?? conditionsLengthRef.current;
              return eff > 0 ? eff - 1 : 0;
            });
          }
          setMenuState('closed');
        }
      }
    },
    [
      inputText,
      removeConditionAtIndex,
      menuState,
      selectedField,
      selectedOperator,
      fields,
      handleFieldSelect,
      handleOperatorSelect,
      handleCustomValueCommit,
      setInputText,
      setMenuState,
      setInsertIndex,
      conditionsRef,
      conditionsLengthRef,
      effectiveInsertIndexRef,
      stepBackBuildingMenu,
      resetMenuOffset,
    ],
  );

  return { handleInputChange, handleInputClick, handleKeyDown, menuRef };
};
