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
  /** Lets click resume at the next missing segment of a live building chip. */
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
  resetMenuAnchor: () => void;
  removeConditionAtIndex: (index: number) => void;
  handleFieldSelect: (field: FieldMetadata) => void;
  handleOperatorSelect: (operator: FilterOperator) => void;
  handleCustomValueCommit: (text: string) => void;
  /** Step building chip back one segment; tears it down at the field step. */
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
  resetMenuAnchor,
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
      // Apply field-level acceptChar filter when entering a value.
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
    // Start a fresh chip or resume at next missing segment.
    resetMenuAnchor();
    setMenuState(nextBuildingMenu(selectedField, selectedOperator)!);
  }, [menuState, selectedField, selectedOperator, resetMenuAnchor, inputRef, setMenuState]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        if (menuState === 'closed') {
          // Re-open the next building menu (e.g. after Backspace tore down a
          // chip and set menuState='closed').
          e.preventDefault();
          resetMenuAnchor();
          setMenuState(nextBuildingMenu(selectedField, selectedOperator)!);
          return;
        }
        // List menus are handled by useKeyboardNav's capture listener which
        // stops propagation. Menus without it (date picker) reach here and we
        // hand DOM focus over so their internal keyboard nav can take over.
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

      // Enter on operator menu: match typed text by label, symbol, or raw key.
      if (e.key === 'Enter' && menuState === 'operator' && selectedField && inputText.trim()) {
        const trimmed = inputText.trim();
        let matched = getOperatorFromLabel(trimmed, selectedField.type);
        if (!matched) {
          const symbolMatch = Object.entries(OPERATOR_SYMBOLS).find(
            ([, sym]) => sym.toLowerCase() === trimmed.toLowerCase(),
          );
          if (symbolMatch) matched = symbolMatch[0] as FilterOperator;
        }
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
        // While a building chip is alive, Backspace steps its menu back
        // (value → operator → field) rather than removing a committed sibling.
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
          // Reopen field menu so the next ArrowDown highlights the first item
          // and Enter selects it (otherwise ArrowDown only opens the menu).
          resetMenuAnchor();
          setMenuState('field');
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
      resetMenuAnchor,
    ],
  );

  return { handleInputChange, handleInputClick, handleKeyDown, menuRef };
};
