import type { ChangeEvent, FocusEvent, KeyboardEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { chipIdToConditionIndex, isMenuRelated } from '../../lib';
import { useDateRange } from '../../QueryBarMenu/QueryBarDateValueMenu/hooks';
import type {
  Condition,
  FieldMetadata,
  FilterOperator,
  MenuState,
  QueryBarChipData,
} from '../../types';
import { deriveAutocompleteValues } from './deriveAutocompleteValues';
import { useChipEditing } from './useChipEditing';
import { useMenuFlow } from './useMenuFlow';
import { useMenuPositioning } from './useMenuPositioning';

interface UseQueryBarAutocompleteOptions {
  fields: FieldMetadata[];
  conditions: Condition[];
  chips: QueryBarChipData[];
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
    atIndex?: number,
    error?: boolean,
    dateOrigin?: 'relative' | 'absolute',
  ) => void;
  removeCondition: (chipId: string) => void;
  removeConditionAtIndex: (index: number) => void;
  clearAll: () => void;
  setConnectorValue: (connectorId: string, value: 'and' | 'or') => void;
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
  removeConditionAtIndex,
  clearAll,
  setConnectorValue,
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
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [insertAfterConnector, setInsertAfterConnector] = useState(false);
  const effectiveInsertIndex = insertIndex ?? conditions.length;

  // Refs keep values fresh for callbacks to avoid stale closures and unnecessary recreation
  const effectiveInsertIndexRef = useRef(effectiveInsertIndex);
  effectiveInsertIndexRef.current = effectiveInsertIndex;
  const conditionsLengthRef = useRef(conditions.length);
  conditionsLengthRef.current = conditions.length;

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
    setMenuOffset,
    setSelectedField,
    setSelectedOperator,
    setMenuState,
  });

  const dateRange = useDateRange();

  // ── State reset ───────────────────────────────────────────

  const resetState = useCallback(() => {
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    dateRange.reset();
    setBuildingMultiValue(undefined);
    setInsertIndex(null);
    setInsertAfterConnector(false);
    resetMenuOffset();
    setMenuState('closed');
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
    handleCustomValueCommit,
    handleCustomAttributeCommit,
  } = useMenuFlow({
    editing,
    selectedField,
    selectedOperator,
    fields,
    inputRef,
    insertIndex: effectiveInsertIndex,
    upsertCondition,
    conditions,
    resetState,
    dateRange,
    setSelectedField,
    setSelectedOperator,
    setInputText,
    setMenuState,
    setBuildingMultiValue,
  });

  // ── Input events ──────────────────────────────────────────

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
    [selectedField, isFocused],
  );

  const handleInputClick = useCallback(() => {
    inputRef.current?.focus();
    if (menuState === 'closed' && !selectedField) {
      resetMenuOffset();
      setMenuState('field');
    }
  }, [menuState, selectedField, resetMenuOffset, inputRef]);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' && menuState !== 'closed') {
        e.preventDefault();
        menuRef.current?.focus();
        return;
      }
      if (e.key === 'Backspace' && !e.repeat && inputText === '' && conditionsLengthRef.current > 0) {
        e.preventDefault();
        const removeIdx = effectiveInsertIndexRef.current - 1;
        if (removeIdx >= 0) {
          removeConditionAtIndex(removeIdx);
          setInsertIndex(prev => {
            const eff = prev ?? conditionsLengthRef.current;
            return eff > 0 ? eff - 1 : 0;
          });
        }
        setMenuState('closed');
      }
    },
    [inputText, removeConditionAtIndex, menuState],
  );

  // ── Focus ─────────────────────────────────────────────────

  const handleFocus = useCallback((e: FocusEvent) => {
    // Ignore focus from connector chip — its DropdownMenu manages its own focus
    if ((e.target as HTMLElement)?.closest?.('[data-slot="query-bar-connector-chip"]')) return;
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(
    (e: FocusEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (containerRef.current?.contains(related)) return;
      if (isMenuRelated(related)) return;
      setIsFocused(false);
      resetState();
    },
    [containerRef, resetState],
  );

  // ── Chip management ───────────────────────────────────────

  const handleChipRemove = useCallback(
    (chipId: string) => {
      const chipCondIdx = chipIdToConditionIndex(chipId);
      if (chipCondIdx !== null && chipCondIdx < effectiveInsertIndexRef.current) {
        setInsertIndex(prev => (prev != null ? prev - 1 : prev));
      }
      removeCondition(chipId);
      resetMenuOffset();
      setMenuState('closed');
      inputRef.current?.focus();
    },
    [removeCondition, resetMenuOffset, inputRef],
  );

  const handleClear = useCallback(() => {
    clearAll();
    resetState();
  }, [clearAll, resetState]);

  // ── Gap click (insertion between chips) ─────────────────────

  const handleGapClick = useCallback(
    (conditionIndex: number, afterConnector: boolean) => {
      setInsertIndex(conditionIndex);
      setInsertAfterConnector(afterConnector);
      resetMenuOffset();
      setMenuState('field');
      inputRef.current?.focus();
    },
    [resetMenuOffset, inputRef],
  );

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
  // Ark UI Menu (zag.js) steals focus via single rAF when a menu mounts.
  // Double rAF beats this by executing after zag's focus redirect.
  // ⚠️ Fragile: if Ark UI changes its focus timing, this workaround may break.
  // After redirect, ArrowDown can freely move focus to the menu.

  useEffect(() => {
    if (menuState === 'closed') return;

    let outerRaf = 0;
    let innerRaf = 0;
    outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        if (editing.editingSegment) {
          // Redirect focus to the segment input, beating Ark UI's focus steal
          const segmentInput = containerRef.current?.querySelector<HTMLInputElement>(
            `[data-slot="segment-${editing.editingSegment}"] input`,
          );
          if (segmentInput && document.activeElement !== segmentInput) {
            segmentInput.focus();
            segmentInput.select();
          } else if (!segmentInput && document.activeElement !== inputRef.current) {
            // Segment has no inline input (e.g., operator) — focus main input
            inputRef.current?.focus();
          }
        } else if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      });
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [menuState, inputRef, editing.editingSegment, containerRef]);

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
    segmentFilterText:
      editing.editingSegment === 'value' ? editing.segmentFilterText : undefined,
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
    handleConnectorChange: setConnectorValue,
    handleChipRemove,
    handleClear,
    handleKeyDown,
    handleInputClick,
    handleGapClick,
    handleFocus,
    handleBlur,
    handleRangeSelect,
    insertIndex: effectiveInsertIndex,
    insertAfterConnector,
    editingDateIsAbsolute,
    // Inline segment editing
    editingChipId: editing.editingChipId,
    editingSegment: editing.editingSegment,
    segmentFilterText: editing.segmentFilterText,
    handleSegmentFilterChange: editing.setSegmentFilterText,
    cancelSegmentEdit: editing.cancelSegmentEdit,
    handleCustomValueCommit,
    handleCustomAttributeCommit,
    menuRef,
  };
};
