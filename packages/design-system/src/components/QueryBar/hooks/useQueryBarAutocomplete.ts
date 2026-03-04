import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getDateDisplayLabel, getOperatorLabel, isDatePreset } from '../lib';
import type { Condition, FieldMetadata, FilterOperator, MenuState, QueryBarChipData } from '../types';
import { useAutocompleteHandlers } from './useAutocompleteHandlers';
import { useChipEditing } from './useChipEditing';
import { useDateRange } from '../DateValue/hooks';
import { useMenuPositioning } from './useMenuPositioning';
import { useMultiSelect } from './useMultiSelect';

interface UseQueryBarAutocompleteOptions {
  fields: FieldMetadata[];
  conditions: Condition[];
  chips: QueryBarChipData[];
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
  ) => void;
  removeCondition: (chipId: string) => void;
  removeLastCondition: () => void;
  clearAll: () => void;
  toggleConnector: (connectorId: string) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  buildingChipRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}

export const useQueryBarAutocomplete = ({
  fields,
  conditions,
  chips,
  upsertCondition,
  removeCondition,
  removeLastCondition,
  clearAll,
  toggleConnector,
  containerRef,
  buildingChipRef,
  inputRef,
}: UseQueryBarAutocompleteOptions) => {
  // ── Core state ────────────────────────────────────────────

  const [inputText, setInputText] = useState('');
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [selectedField, setSelectedField] = useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // ── Child hooks ───────────────────────────────────────────

  const { menuPositioning, setMenuOffset, resetMenuOffset } = useMenuPositioning({
    containerRef,
    buildingChipRef,
    inputRef,
    isBuilding: selectedField !== null,
    menuState,
  });

  const editing = useChipEditing({
    conditions,
    chips,
    fields,
    containerRef,
    upsertCondition,
    toggleConnector,
    setMenuOffset,
    setSelectedField,
    setSelectedOperator,
    setMultiSelectValues: vals => multiSelect.setMultiSelectValues(vals),
    setMenuState,
  });

  const multiSelect = useMultiSelect({
    selectedField,
    selectedOperator,
    editingChipId: editing.editingChipId,
    conditions,
  });

  const dateRange = useDateRange();

  // ── State reset ───────────────────────────────────────────

  const resetState = useCallback((openFieldMenu = false) => {
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    multiSelect.reset();
    dateRange.reset();
    resetMenuOffset();
    setMenuState(openFieldMenu ? 'field' : 'closed');
    inputRef.current?.focus();
  }, [editing, multiSelect, inputRef, resetMenuOffset]);

  // ── Handlers ──────────────────────────────────────────────

  const handlers = useAutocompleteHandlers({
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
  });

  // ── Auto-open field menu on initial focus when empty ──────

  const prevFocusedRef = useRef(false);
  useEffect(() => {
    if (isFocused && !prevFocusedRef.current && conditions.length === 0 && inputText === '') {
      resetMenuOffset();
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, conditions.length, inputText, resetMenuOffset]);

  // ── Derived values ────────────────────────────────────────

  const isBuilding = selectedField !== null && !editing.editingChipId;

  // When editing a date chip, determine if its value is an absolute date (not a preset)
  const editingDateIsAbsolute = (() => {
    if (!editing.editingChipId || selectedField?.type !== 'date') return false;
    const idx = Number(editing.editingChipId.replace('chip-', ''));
    const condition = conditions[idx];
    if (!condition) return false;
    const val = String(condition.value ?? '');
    return val !== '' && !isDatePreset(val);
  })();

  const buildingValue = (() => {
    if (multiSelect.buildingMultiValue) return multiSelect.buildingMultiValue;
    if (dateRange.fromValue && selectedOperator === 'between') {
      return `${getDateDisplayLabel(dateRange.fromValue)} – ...`;
    }
    return undefined;
  })();

  const buildingChipData = isBuilding ? {
    attribute: selectedField!.label,
    operator: selectedOperator ? getOperatorLabel(selectedOperator, selectedField!.type) : undefined,
    value: buildingValue,
  } : null;

  // ── Range select (between + calendar) ────────────────────

  const handleRangeSelect = useCallback((from: string, to: string) => {
    if (!selectedField || !selectedOperator) return;
    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, [from, to], editing.editingChipId);
    resetState(!isEditing);
  }, [selectedField, selectedOperator, editing.editingChipId, upsertCondition, resetState]);

  // ── Public API ────────────────────────────────────────────

  return {
    inputText,
    menuState,
    selectedField,
    selectedOperator,
    multiSelectValues: multiSelect.multiSelectValues,
    selectedValues: multiSelect.selectedValues,
    isBuilding,
    buildingChipData,
    menuPositioning,
    handleInputChange: handlers.handleInputChange,
    handleFieldSelect: handlers.handleFieldSelect,
    handleOperatorSelect: handlers.handleOperatorSelect,
    handleValueSelect: handlers.handleValueSelect,
    handleMenuClose: handlers.handleMenuClose,
    handleMenuDiscard: resetState,
    handleChipClick: editing.handleChipClick,
    handleChipRemove: handlers.handleChipRemove,
    handleClear: handlers.handleClear,
    handleKeyDown: handlers.handleKeyDown,
    handleInputClick: handlers.handleInputClick,
    handleFocus: handlers.handleFocus,
    handleBlur: handlers.handleBlur,
    handleCommitAndNewChip: handlers.handleCommitAndNewChip,
    handleRangeSelect,
    dateRangeIndex: dateRange.currentIndex,
    editingDateIsAbsolute,
  };
};
