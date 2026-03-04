import type { ChangeEvent, FocusEvent, KeyboardEvent, RefObject } from 'react';
import { useCallback } from 'react';
import { isBetweenOperator, isMultiSelectOperator, isNoValueOperator } from '../lib';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../types';
import type { useChipEditing } from './useChipEditing';
import type { useDateRange } from '../DateValue/hooks';
import type { useMultiSelect } from './useMultiSelect';

interface UseAutocompleteHandlersOptions {
  // State
  inputText: string;
  menuState: MenuState;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  isFocused: boolean;
  conditions: Condition[];

  // Setters
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  setSelectedField: (field: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setIsFocused: (focused: boolean) => void;

  // Child hooks
  editing: ReturnType<typeof useChipEditing>;
  multiSelect: ReturnType<typeof useMultiSelect>;
  dateRange: ReturnType<typeof useDateRange>;

  // External callbacks
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
  ) => void;
  removeCondition: (chipId: string) => void;
  removeLastCondition: () => void;
  clearAll: () => void;

  // Refs
  containerRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;

  // Helpers
  resetMenuOffset: () => void;
  resetState: (openFieldMenu?: boolean) => void;
}

export const useAutocompleteHandlers = ({
  inputText,
  menuState,
  selectedField,
  selectedOperator,
  isFocused,
  conditions,
  setInputText,
  setMenuState,
  setSelectedField,
  setSelectedOperator,
  setIsFocused,
  editing,
  multiSelect,
  dateRange,
  upsertCondition,
  removeCondition,
  removeLastCondition,
  clearAll,
  containerRef,
  inputRef,
  resetMenuOffset,
  resetState,
}: UseAutocompleteHandlersOptions) => {

  // ── Menu flow ─────────────────────────────────────────────

  /** Close menu and save pending multi-select values (click outside) */
  const handleMenuClose = useCallback(() => {
    const isEditing = !!editing.editingChipId;
    const committed = multiSelect.commitIfNeeded();

    if (committed && selectedField && selectedOperator) {
      upsertCondition(selectedField, selectedOperator, committed, editing.editingChipId);
    }

    resetState(!!committed && !isEditing);
  }, [editing.editingChipId, multiSelect, selectedField, selectedOperator, upsertCondition, resetState]);

  /** ArrowRight in multi-select value menu → commit selected values and start new chip */
  const handleCommitAndNewChip = useCallback(() => {
    const committed = multiSelect.commitIfNeeded();
    if (committed && selectedField && selectedOperator) {
      upsertCondition(selectedField, selectedOperator, committed, editing.editingChipId);
      resetState(true);
    }
  }, [editing.editingChipId, multiSelect, selectedField, selectedOperator, upsertCondition, resetState]);

  const handleFieldSelect = (field: FieldMetadata) => {
    if (editing.tryEditField(field)) {
      resetState();
      return;
    }
    setSelectedField(field);
    setInputText('');
    setMenuState('operator');
  };

  const handleOperatorSelect = (operator: FilterOperator) => {
    if (isNoValueOperator(operator)) {
      const isEditing = !!editing.editingChipId;
      upsertCondition(selectedField!, operator, null, editing.editingChipId);
      resetState(!isEditing);
      return;
    }

    // When editing: check if selectivity changed (single↔multi)
    if (editing.editingChipId) {
      const condition = conditions.find((_, i) => `chip-${i}` === editing.editingChipId);
      const wasMulti = Array.isArray(condition?.value);
      const willBeMulti = isMultiSelectOperator(operator);

      if (wasMulti !== willBeMulti) {
        multiSelect.setMultiSelectValues(
          willBeMulti && condition
            ? (Array.isArray(condition.value) ? condition.value : condition.value != null ? [condition.value] : [])
            : [],
        );
        setSelectedOperator(operator);
        setMenuState('value');
        return;
      }

      if (editing.tryEditOperator(operator, selectedField!)) {
        resetState();
        return;
      }
    }

    setSelectedOperator(operator);
    setMenuState('value');
  };

  const handleValueSelect = (val: string | number | boolean) => {
    if (!selectedField || !selectedOperator) return;

    if (isMultiSelectOperator(selectedOperator)) {
      multiSelect.toggleValue(val);
      return;
    }

    // Between operator: collect two values before committing
    if (isBetweenOperator(selectedOperator) && selectedField.type === 'date') {
      const result = dateRange.selectValue(String(val));
      if (!result) return; // Waiting for second value
      const isEditing = !!editing.editingChipId;
      upsertCondition(selectedField, selectedOperator, result, editing.editingChipId);
      resetState(!isEditing);
      return;
    }

    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, val, editing.editingChipId);
    resetState(!isEditing);
  };

  // ── Input events ──────────────────────────────────────────

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (text && !selectedField) {
      setMenuState('field');
    } else if (!text && !selectedField) {
      setMenuState(isFocused && conditions.length === 0 ? 'field' : 'closed');
    }
  };

  const handleInputClick = () => {
    if (menuState === 'closed' && !selectedField) {
      resetMenuOffset();
      setMenuState('field');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputText === '' && conditions.length > 0) {
      e.preventDefault();
      removeLastCondition();
    }
  };

  // ── Focus ─────────────────────────────────────────────────

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e: FocusEvent) => {
    // Menu is open — Ark UI handles outside clicks via onOpenChange → handleMenuClose
    if (menuState !== 'closed') return;

    // Focus stayed within the container
    const related = e.relatedTarget as HTMLElement | null;
    if (containerRef.current?.contains(related)) return;

    setIsFocused(false);
    resetState();
  };

  // ── Chip management ───────────────────────────────────────

  const handleChipRemove = (chipId: string) => {
    removeCondition(chipId);
    resetMenuOffset();
    inputRef.current?.focus();
  };

  const handleClear = () => {
    clearAll();
    resetState();
  };

  return {
    handleMenuClose,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleInputChange,
    handleInputClick,
    handleKeyDown,
    handleFocus,
    handleBlur,
    handleChipRemove,
    handleClear,
    handleCommitAndNewChip,
  };
};
