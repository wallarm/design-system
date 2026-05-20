import type { RefObject } from 'react';
import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { useDateRange } from '../../FilterInputMenu/FilterInputDateValueMenu/hooks';
import type { Condition, FieldMetadata, FilterInputChipData, UpsertCondition } from '../../types';
import { deriveAutocompleteValues } from './lib';
import { useAutocompleteState } from './useAutocompleteState';
import { useBlurCommit } from './useBlurCommit';
import { useChipActions } from './useChipActions';
import { useChipCascade } from './useChipCascade';
import { useChipEditing } from './useChipEditing';
import { useFocusManagement } from './useFocusManagement';
import { useInputHandlers } from './useInputHandlers';
import { useMenuFlow } from './useMenuFlow';
import { useMenuPositioning } from './useMenuPositioning';
import { useResetState } from './useResetState';
import { useSegmentEditFlow } from './useSegmentEditFlow';

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
  const state = useAutocompleteState({ conditions });
  const {
    inputText,
    setInputText,
    menuState,
    setMenuState,
    selectedField,
    setSelectedField,
    selectedOperator,
    setSelectedOperator,
    isFocused,
    setIsFocused,
    buildingMultiValue,
    setBuildingMultiValue,
    insertIndex,
    setInsertIndex,
    insertAfterConnector,
    setInsertAfterConnector,
    effectiveInsertIndex,
    effectiveInsertIndexRef,
    conditionsRef,
    conditionsLengthRef,
    blurCommitRef,
    segmentAttributeInputRef,
    segmentOperatorInputRef,
    segmentValueInputRef,
    commitBuildingOnBlurRef,
  } = state;

  const { menuPositioning, setMenuAnchor, resetMenuAnchor } = useMenuPositioning({
    containerRef,
    buildingChipRef,
    inputRef,
    isBuilding: selectedField !== null,
    insertIndex: effectiveInsertIndex,
    chipsCount: chips.length,
    isMenuOpen: menuState !== 'closed',
  });

  const editing = useChipEditing({
    conditions,
    chips,
    fields,
    setMenuAnchor,
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
    resetMenuAnchor,
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
    handleCustomOperatorCommit,
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

  const { switchEditSegment, removeEditingChip, stepBackBuildingMenu } = useChipCascade({
    editing,
    chips,
    fields,
    conditionsRef,
    selectedField,
    selectedOperator,
    buildingMultiValue,
    upsertCondition,
    removeCondition,
    resetState,
    setInputText,
    setMenuState,
    setSelectedOperator,
    setBuildingMultiValue,
  });

  const { handleInputChange, handleInputClick, handleKeyDown, menuRef } = useInputHandlers({
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
  });

  const { commitBuildingOnBlur, hasIncompleteBuilding } = useBlurCommit({
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
    selectedField,
    selectedOperator,
    containerRef,
    inputRef,
    editingSegment: editing.editingSegment,
    segmentAttributeInputRef,
    segmentOperatorInputRef,
    segmentValueInputRef,
    blurCommitRef,
    commitBuildingOnBlur,
    hasIncompleteBuilding,
    setIsFocused,
    setMenuState,
    resetMenuAnchor,
    resetState,
  });

  const { handleChipRemove, handleClear, handleGapClick, closeAutocompleteMenu } = useChipActions({
    effectiveInsertIndexRef,
    inputRef,
    removeCondition,
    clearAll,
    resetMenuAnchor,
    resetState,
    setInsertIndex,
    setInsertAfterConnector,
    setMenuState,
  });

  const {
    handleSegmentFilterChange,
    cancelSegmentEdit,
    handleMenuDiscard,
    handleBuildingChipClick,
  } = useSegmentEditFlow({
    editing,
    selectedField,
    selectedOperator,
    buildingMultiValue,
    resetState,
    setSelectedField,
    setSelectedOperator,
    setInputText,
    setMenuState,
    setMenuAnchor,
  });

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
    handleMenuDiscard,
    /** Hard reset for paste/clipboard flows — scraps in-progress building. */
    resetAutocompleteState: resetState,
    handleChipClick: editing.handleChipClick,
    handleBuildingChipClick,
    switchEditSegment,
    removeEditingChip,
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
    cancelSegmentEdit,
    handleCustomValueCommit,
    handleCustomAttributeCommit,
    handleCustomOperatorCommit,
    menuRef,
    closeAutocompleteMenu,
    blurCommitRef,
    setInputText,
    segmentAttributeInputRef,
    segmentOperatorInputRef,
    segmentValueInputRef,
  };
};
