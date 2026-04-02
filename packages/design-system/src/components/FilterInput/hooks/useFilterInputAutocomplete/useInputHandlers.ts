import type { ChangeEvent, KeyboardEvent, MutableRefObject, RefObject } from 'react';
import { useCallback, useRef } from 'react';
import { getOperatorFromLabel, hasFieldValues, OPERATOR_SYMBOLS } from '../../lib';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../../types';

interface UseInputHandlersDeps {
  inputText: string;
  menuState: MenuState;
  selectedField: FieldMetadata | null;
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
}

export const useInputHandlers = ({
  inputText,
  menuState,
  selectedField,
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
}: UseInputHandlersDeps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setInputText(text);

      if (text && !selectedField) {
        setMenuState('field');
      } else if (!text && !selectedField) {
        setMenuState(isFocused && conditionsLengthRef.current === 0 ? 'field' : 'closed');
      }
    },
    [selectedField, isFocused, setInputText, setMenuState, conditionsLengthRef],
  );

  const handleInputClick = useCallback(() => {
    inputRef.current?.focus();
    if (menuState === 'closed' && !selectedField) {
      resetMenuOffset();
      setMenuState('field');
    }
  }, [menuState, selectedField, resetMenuOffset, inputRef, setMenuState]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' && menuState !== 'closed') {
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

      if (
        e.key === 'Backspace' &&
        !e.repeat &&
        inputText === '' &&
        conditionsLengthRef.current > 0
      ) {
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
    },
    [
      inputText,
      removeConditionAtIndex,
      menuState,
      selectedField,
      fields,
      handleFieldSelect,
      handleOperatorSelect,
      handleCustomValueCommit,
      setInputText,
      setMenuState,
      setInsertIndex,
      conditionsLengthRef,
      effectiveInsertIndexRef,
    ],
  );

  return { handleInputChange, handleInputClick, handleKeyDown, menuRef };
};
