import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getOperatorLabel, isMultiSelectOperator } from '../lib';
import type { Condition, FieldMetadata, FilterChipData, FilterOperator } from '../types';
import { useBlurGuard } from './useBlurGuard';
import { useChipEditing } from './useChipEditing';
import { useMenuPositioning } from './useMenuPositioning';

type MenuState = 'closed' | 'field' | 'operator' | 'value';

interface UseFilterAutocompleteOptions {
  fields: FieldMetadata[];
  conditions: Condition[];
  chips: FilterChipData[];
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
  ) => void;
  removeCondition: (chipId: string) => void;
  removeLastCondition: () => void;
  clearAll: () => void;
  toggleConnector: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  buildingChipRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}

export const useFilterAutocomplete = ({
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
}: UseFilterAutocompleteOptions) => {
  const [inputText, setInputText] = useState('');
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [selectedField, setSelectedField] = useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState<Array<string | number | boolean>>([]);

  // Extracted hooks — ordered to avoid circular deps
  const isPointerInMenuRef = useBlurGuard({ containerRef });

  const { menuPositioning, setMenuOffset, resetMenuOffset } = useMenuPositioning({
    containerRef,
    buildingChipRef,
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
    setMenuState,
  });

  const isBuilding = selectedField !== null && !editing.editingChipId;

  // Auto-open field menu on initial focus when empty
  const prevFocusedRef = useRef(false);
  useEffect(() => {
    if (isFocused && !prevFocusedRef.current && conditions.length === 0 && inputText === '') {
      resetMenuOffset();
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, conditions.length, inputText, resetMenuOffset]);

  // --- State reset ---

  const resetState = () => {
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    setMultiSelectValues([]);
    setMenuState('closed');
    resetMenuOffset();
    inputRef.current?.focus();
  };

  // --- Handlers ---

  const handleMenuClose = useCallback(() => {
    if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
      upsertCondition(selectedField, selectedOperator, multiSelectValues, editing.editingChipId);
    }
    setMenuState('closed');
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    setMultiSelectValues([]);
    resetMenuOffset();
    inputRef.current?.focus();
  }, [multiSelectValues, selectedField, selectedOperator, editing, upsertCondition, inputRef, resetMenuOffset]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (text && !selectedField) {
      setMenuState('field');
    } else if (!text && !selectedField) {
      setMenuState(isFocused && conditions.length === 0 ? 'field' : 'closed');
    }
  };

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
    const noValueOps: FilterOperator[] = ['is_null', 'is_not_null'];

    if (noValueOps.includes(operator)) {
      upsertCondition(selectedField!, operator, null, editing.editingChipId);
      resetState();
      return;
    }

    if (editing.tryEditOperator(operator, selectedField!)) {
      resetState();
      return;
    }

    setSelectedOperator(operator);
    setMenuState('value');
  };

  const handleValueSelect = (val: string | number | boolean) => {
    if (!selectedField || !selectedOperator) return;

    if (isMultiSelectOperator(selectedOperator)) {
      setMultiSelectValues(prev =>
        prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val],
      );
      return;
    }

    upsertCondition(selectedField, selectedOperator, val, editing.editingChipId);
    resetState();
  };

  const handleChipRemove = (chipId: string) => {
    removeCondition(chipId);
    resetMenuOffset();
    inputRef.current?.focus();
  };

  const handleClear = () => {
    clearAll();
    resetState();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputText === '' && conditions.length > 0) {
      e.preventDefault();
      removeLastCondition();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (isPointerInMenuRef.current) return;

      const activeEl = document.activeElement;
      const isInContainer = containerRef.current?.contains(activeEl);
      const isInMenu = activeEl?.closest('[data-scope="menu"]');
      const hasOpenMenu = document.querySelector('[data-scope="menu"][data-state="open"]');

      if (!isInContainer && !isInMenu && !hasOpenMenu) {
        if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
          upsertCondition(selectedField, selectedOperator, multiSelectValues, editing.editingChipId);
        }
        setIsFocused(false);
        setMenuState('closed');
        setSelectedField(null);
        setSelectedOperator(null);
        editing.clearEditing();
        setMultiSelectValues([]);
      }
    }, 200);
  };

  // --- Derived values ---

  const buildingMultiValue = multiSelectValues.length > 0
    ? multiSelectValues
      .map(v => selectedField?.values?.find(opt => opt.value === v)?.label ?? String(v))
      .join(', ')
    : undefined;

  const buildingChipData = isBuilding ? {
    variant: 'chip' as const,
    attribute: selectedField!.label,
    operator: selectedOperator ? getOperatorLabel(selectedOperator, selectedField!.type) : undefined,
    value: buildingMultiValue,
  } : null;

  return {
    inputText,
    menuState,
    selectedField,
    selectedOperator,
    multiSelectValues,
    isBuilding,
    buildingChipData,
    menuPositioning,
    handleInputChange,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMenuClose,
    handleChipClick: editing.handleChipClick,
    handleChipRemove,
    handleClear,
    handleKeyDown,
    handleFocus,
    handleBlur,
  };
};
