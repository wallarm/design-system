import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { useDateRange } from '../../FilterInputMenu/FilterInputDateValueMenu/hooks';
import { applyAcceptChar } from '../../lib';
import type {
  Condition,
  FieldMetadata,
  FilterInputChipData,
  FilterOperator,
  MenuState,
  UpsertCondition,
} from '../../types';
import { deriveAutocompleteValues } from './deriveAutocompleteValues';
import { useBlurCommit } from './useBlurCommit';
import { useChipActions } from './useChipActions';
import { useChipEditing } from './useChipEditing';
import { useFocusManagement } from './useFocusManagement';
import { useInputHandlers } from './useInputHandlers';
import { useMenuFlow } from './useMenuFlow';
import { useMenuPositioning } from './useMenuPositioning';
import { useResetState } from './useResetState';

interface UseFilterInputAutocompleteOptions {
  fields: FieldMetadata[];
  conditions: Condition[];
  chips: FilterInputChipData[];
  upsertCondition: UpsertCondition;
  removeCondition: (chipId: string) => void;
  removeConditionAtIndex: (index: number) => void;
  clearAll: () => void;
  setConnectorValue: (connectorId: string, value: 'and' | 'or') => void;
  containerRef: RefObject<HTMLDivElement | null>;
  buildingChipRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}

export const useFilterInputAutocomplete = ({
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
}: UseFilterInputAutocompleteOptions) => {
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
  const conditionsRef = useRef(conditions);
  conditionsRef.current = conditions;
  const conditionsLengthRef = useRef(conditions.length);
  conditionsLengthRef.current = conditions.length;

  // Multi-select blur commit ref — set by FilterInputValueMenu when open in multi-select mode
  const blurCommitRef = useRef<(() => boolean) | null>(null);

  // Inline segment input refs — used by useFocusManagement to focus the right input
  const segmentAttributeInputRef = useRef<HTMLInputElement>(null);
  const segmentOperatorInputRef = useRef<HTMLInputElement>(null);
  const segmentValueInputRef = useRef<HTMLInputElement>(null);

  // Indirection ref breaks the circular dep useMenuFlow ↔ useBlurCommit:
  // useMenuFlow calls through this ref, useBlurCommit assigns its callback to it.
  const commitBuildingOnBlurRef = useRef<() => boolean>(() => false);

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
    upsertCondition,
  });

  const dateRange = useDateRange();

  const resetState = useResetState({
    editing,
    dateRange,
    containerRef,
    inputRef,
    resetMenuOffset,
    setInputText,
    setSelectedField,
    setSelectedOperator,
    setBuildingMultiValue,
    setInsertIndex,
    setInsertAfterConnector,
    setMenuState,
  });

  const {
    handleMenuClose,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleMultiSelectToggle,
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
    commitBuildingOnBlur: () => commitBuildingOnBlurRef.current(),
    dateRange,
    setSelectedField,
    setSelectedOperator,
    setInputText,
    setMenuState,
    setBuildingMultiValue,
  });

  const { handleInputChange, handleInputClick, handleKeyDown, menuRef } = useInputHandlers({
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
  });

  const commitBuildingOnBlur = useBlurCommit({
    selectedField,
    selectedOperator,
    inputText,
    editingChipId: editing.editingChipId,
    effectiveInsertIndexRef,
    handleCustomValueCommit,
    upsertCondition,
    resetState,
    commitBuildingOnBlurRef,
  });

  const { handleFocus, handleBlur } = useFocusManagement({
    menuState,
    isFocused,
    conditionsLength: conditions.length,
    inputText,
    containerRef,
    inputRef,
    editingSegment: editing.editingSegment,
    segmentAttributeInputRef,
    segmentOperatorInputRef,
    segmentValueInputRef,
    blurCommitRef,
    commitBuildingOnBlur,
    setIsFocused,
    setMenuState,
    resetMenuOffset,
    resetState,
  });

  const { handleChipRemove, handleClear, handleGapClick, closeAutocompleteMenu } = useChipActions({
    effectiveInsertIndexRef,
    inputRef,
    removeCondition,
    clearAll,
    resetMenuOffset,
    resetState,
    setInsertIndex,
    setInsertAfterConnector,
    setMenuState,
  });

  // ── Derived values ────────────────────────────────────────

  const { isBuilding, buildingChipData, editingMultiValues, editingSingleValue, editingDateRange } =
    deriveAutocompleteValues({
      editingChipId: editing.editingChipId,
      selectedField,
      selectedOperator,
      conditions,
      buildingMultiValue,
      dateRangeFromValue: dateRange.fromValue,
      segmentFilterText:
        editing.editingSegment === SEGMENT_VARIANT.value
          ? editing.segmentMenuFilterText
          : undefined,
    });

  // Mirror the main-input acceptChar rule when editing a value segment so both
  // entry paths (building input + inline segment edit) apply the same filter.
  const handleSegmentFilterChange = useCallback(
    (text: string) => {
      const accept = selectedField?.acceptChar;
      const next =
        editing.editingSegment === SEGMENT_VARIANT.value && accept
          ? applyAcceptChar(text, accept)
          : text;
      editing.setSegmentFilterText(next);
    },
    [selectedField, editing],
  );

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
    editingDateRange,
    inputRef,
    handleInputChange,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleMultiSelectToggle,
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
    // Inline segment editing
    editingChipId: editing.editingChipId,
    editingSegment: editing.editingSegment,
    segmentFilterText: editing.segmentFilterText,
    segmentMenuFilterText: editing.segmentMenuFilterText,
    handleSegmentFilterChange,
    cancelSegmentEdit: editing.cancelSegmentEdit,
    handleCustomValueCommit,
    handleCustomAttributeCommit,
    menuRef,
    closeAutocompleteMenu,
    blurCommitRef,
    setInputText,
    segmentAttributeInputRef,
    segmentOperatorInputRef,
    segmentValueInputRef,
  };
};
