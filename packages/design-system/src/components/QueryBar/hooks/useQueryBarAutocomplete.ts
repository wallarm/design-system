import type { ChangeEvent, FocusEvent, KeyboardEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Condition, FieldMetadata, FilterOperator, MenuState, QueryBarChipData } from '../types';
import { useChipEditing } from './useChipEditing';
import { useDateRange } from '../QueryBarMenu/QueryBarDateValueMenu/hooks';
import { useMenuPositioning } from './useMenuPositioning';
import { deriveAutocompleteValues } from './deriveAutocompleteValues';
import { useMenuFlow } from './useMenuFlow';

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
  const [buildingMultiValue, setBuildingMultiValue] = useState<string | undefined>(undefined);

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
    setMenuOffset,
    setSelectedField,
    setSelectedOperator,
    setMenuState,
  });

  const dateRange = useDateRange();

  // ── State reset ───────────────────────────────────────────

  const resetState = useCallback((openFieldMenu = false) => {
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    dateRange.reset();
    setBuildingMultiValue(undefined);
    resetMenuOffset();
    setMenuState(openFieldMenu ? 'field' : 'closed');
    inputRef.current?.focus();
  }, [editing, inputRef, resetMenuOffset]);

  // ── Menu flow handlers ────────────────────────────────────

  const {
    handleMenuClose,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleRangeSelect,
  } = useMenuFlow({
    editing,
    selectedField,
    selectedOperator,
    inputRef,
    upsertCondition,
    resetState,
    dateRange,
    setSelectedField,
    setSelectedOperator,
    setInputText,
    setMenuState,
    setBuildingMultiValue,
  });

  // ── Input events ──────────────────────────────────────────

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (text && !selectedField) {
      setMenuState('field');
    } else if (!text && !selectedField) {
      setMenuState(isFocused && conditions.length === 0 ? 'field' : 'closed');
    }
  }, [selectedField, isFocused, conditions.length]);

  const handleInputClick = useCallback(() => {
    if (menuState === 'closed' && !selectedField) {
      resetMenuOffset();
      setMenuState('field');
    }
  }, [menuState, selectedField, resetMenuOffset]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && menuState !== 'closed') {
      e.preventDefault();
      const menuEl = document.querySelector<HTMLElement>('[role="menu"][data-state="open"]');
      menuEl?.focus();
      return;
    }
    if (e.key === 'Backspace' && !e.repeat && inputText === '' && conditions.length > 0) {
      e.preventDefault();
      removeLastCondition();
      setMenuState('closed');
    }
  }, [inputText, conditions.length, removeLastCondition, menuState]);

  // ── Focus ─────────────────────────────────────────────────

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback((e: FocusEvent) => {
    if (menuState !== 'closed') return;
    const related = e.relatedTarget as HTMLElement | null;
    if (containerRef.current?.contains(related)) return;
    setIsFocused(false);
    resetState();
  }, [menuState, containerRef, resetState]);

  // ── Chip management ───────────────────────────────────────

  const handleChipRemove = useCallback((chipId: string) => {
    removeCondition(chipId);
    resetMenuOffset();
    setMenuState('closed');
    inputRef.current?.focus();
  }, [removeCondition, resetMenuOffset, inputRef]);

  const handleClear = useCallback(() => {
    clearAll();
    resetState();
  }, [clearAll, resetState]);

  // ── Auto-open field menu on initial focus when empty ──────

  const prevFocusedRef = useRef(false);
  useEffect(() => {
    if (isFocused && !prevFocusedRef.current && conditions.length === 0 && inputText === '') {
      resetMenuOffset();
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, conditions.length, inputText, resetMenuOffset]);

  // ── Prevent Ark UI focus steal on menu open ──────────────
  // Ark UI Menu steals focus via rAF when a menu mounts.
  // We redirect once per menu state change so focus stays on the input.
  // After that, ArrowDown can freely move focus to the menu.

  useEffect(() => {
    if (menuState === 'closed') return;

    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled && document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      });
    });
    return () => { cancelled = true; };
  }, [menuState, inputRef]);

  // ── Derived values ────────────────────────────────────────

  const {
    isBuilding,
    buildingChipData,
    editingMultiValues,
    editingSingleValue,
    editingDateIsAbsolute,
  } = deriveAutocompleteValues({
    editingChipId: editing.editingChipId,
    selectedField,
    selectedOperator,
    conditions,
    buildingMultiValue,
    dateRangeFromValue: dateRange.fromValue,
  });

  // ── Public API ────────────────────────────────────────────

  return {
    inputText,
    menuState,
    selectedField,
    selectedOperator,
    isBuilding,
    buildingChipData,
    menuPositioning,
    editingMultiValues,
    editingSingleValue,
    inputRef,
    handleInputChange,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleMenuClose,
    handleMenuDiscard: resetState,
    handleChipClick: editing.handleChipClick,
    handleConnectorClick: toggleConnector,
    handleChipRemove,
    handleClear,
    handleKeyDown,
    handleInputClick,
    handleFocus,
    handleBlur,
    handleRangeSelect,
    dateRangeIndex: dateRange.currentIndex,
    editingDateIsAbsolute,
  };
};
