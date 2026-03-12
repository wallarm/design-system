import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { chipIdToConditionIndex } from '../../lib';
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
import { useFocusManagement } from './useFocusManagement';
import { useInputHandlers } from './useInputHandlers';
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
    insertIndex: effectiveInsertIndex,
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
        resetMenuOffset();
        setMenuState('closed');
      };

      if (continueBuilding) {
        // flushSync commits DOM update (input moves to new position) before reopening the menu
        flushSync(doReset);
        setMenuState('field');
      } else {
        doReset();
      }
      inputRef.current?.focus();
    },
    [editing, inputRef, resetMenuOffset],
  );

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

  // ── Input handlers ──────────────────────────────────────────

  const { handleInputChange, handleInputClick, handleKeyDown, menuRef } = useInputHandlers({
    inputText,
    menuState,
    selectedField,
    isFocused,
    fields,
    inputRef,
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
  });

  // ── Focus ─────────────────────────────────────────────────

  const { handleFocus, handleBlur } = useFocusManagement({
    menuState,
    isFocused,
    conditionsLength: conditions.length,
    inputText,
    containerRef,
    inputRef,
    editingSegment: editing.editingSegment,
    setIsFocused,
    setMenuState,
    resetMenuOffset,
    resetState,
  });

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
      // flushSync forces DOM update before reopening so getAnchorRect reads the new input position
      flushSync(() => {
        setInsertIndex(conditionIndex);
        setInsertAfterConnector(afterConnector);
        resetMenuOffset();
        setMenuState('closed');
      });
      setMenuState('field');
      inputRef.current?.focus();
    },
    [resetMenuOffset, inputRef],
  );

  // ── Close menu (for external consumers like connector chip) ──
  const closeAutocompleteMenu = useCallback(() => {
    setMenuState('closed');
  }, []);

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
    segmentFilterText: editing.editingSegment === 'value' ? editing.segmentFilterText : undefined,
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
    closeAutocompleteMenu,
  };
};
