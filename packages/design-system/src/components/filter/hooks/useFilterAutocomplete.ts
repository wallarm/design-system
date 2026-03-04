import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  toggleConnector: (connectorId: string) => void;
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
    setMultiSelectValues,
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

  const resetState = useCallback((openFieldMenu = false) => {
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    setMultiSelectValues([]);
    resetMenuOffset();
    setMenuState(openFieldMenu ? 'field' : 'closed');
    inputRef.current?.focus();
  }, [editing, inputRef, resetMenuOffset]);

  // --- Handlers ---

  /** Close menu and save pending multi-select values (click outside) */
  const handleMenuClose = useCallback(() => {
    const isEditing = !!editing.editingChipId;
    const hasMultiValues = multiSelectValues.length > 0 && selectedField && selectedOperator;

    if (hasMultiValues) {
      upsertCondition(selectedField, selectedOperator, multiSelectValues, editing.editingChipId);
    }

    resetState(!!hasMultiValues && !isEditing);
  }, [multiSelectValues, selectedField, selectedOperator, editing, upsertCondition, resetState]);

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
      const isEditing = !!editing.editingChipId;
      upsertCondition(selectedField!, operator, null, editing.editingChipId);
      resetState(!isEditing);
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

    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, val, editing.editingChipId);
    resetState(!isEditing);
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

  const handleInputClick = () => {
    if (menuState === 'closed' && !selectedField) {
      resetMenuOffset();
      setMenuState('field');
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
        resetState();
      }
    }, 200);
  };

  // --- Derived values ---

  // Compute selectedValues for the value menu (multi-select + single-select editing)
  const selectedValues = useMemo(() => {
    if (multiSelectValues.length > 0) return multiSelectValues;
    if (editing.editingChipId && selectedOperator && !isMultiSelectOperator(selectedOperator)) {
      const match = editing.editingChipId.match(/^chip-(\d+)$/);
      const idx = match ? Number(match[1]) : null;
      if (idx !== null) {
        const condition = conditions[idx];
        if (condition?.value != null && !Array.isArray(condition.value)) {
          return [condition.value];
        }
      }
    }
    return [];
  }, [multiSelectValues, editing.editingChipId, selectedOperator, conditions]);

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
    selectedValues,
    isBuilding,
    buildingChipData,
    menuPositioning,
    handleInputChange,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMenuClose,
    handleMenuDiscard: resetState,
    handleChipClick: editing.handleChipClick,
    handleChipRemove,
    handleClear,
    handleKeyDown,
    handleInputClick,
    handleFocus,
    handleBlur,
  };
};
