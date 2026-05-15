import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { useDateRange } from '../../FilterInputMenu/FilterInputDateValueMenu/hooks';
import { applyAcceptChar, getOperatorLabel } from '../../lib';
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
    resetMenuOffset,
    removeConditionAtIndex,
    handleFieldSelect,
    handleOperatorSelect,
    handleCustomValueCommit,
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

  // Cancel segment edit must clear ALL autocomplete state, not just the
  // segment-level state. Leaving `selectedField` / `selectedOperator` /
  // `editingChipId` set after a blur-cancel leaks "building" state into the
  // main input: handleInputClick gates on `!selectedField` and would refuse
  // to reopen the field menu when the user clicks back into the input. AS-929.
  //
  // EXCEPTION: when cancelling an inline-edit on the *building* chip
  // (`editingChipId === null` while a segment is being edited), we must
  // preserve `selectedField` / `selectedOperator` / value preview — the user
  // is still building and just bailed out of changing one segment.
  const cancelSegmentEdit = useCallback(() => {
    const isBuildingEdit = !editing.editingChipId && editing.editingSegment !== null;
    if (isBuildingEdit) {
      editing.clearEditing();
      setMenuState('closed');
      return;
    }
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    setMenuState('closed');
  }, [editing]);

  /**
   * Escape from a menu: when the user is inline-editing a *building* chip
   * segment, preserve `selectedField`/`selectedOperator`/value preview so the
   * chip survives. In any other case fall back to the existing destructive
   * `resetState` behavior (matches committed-chip editing UX).
   */
  const handleMenuDiscard = useCallback(() => {
    const isBuildingEdit = !editing.editingChipId && editing.editingSegment !== null;
    if (isBuildingEdit) {
      editing.clearEditing();
      setMenuState('closed');
      return;
    }
    resetState();
  }, [editing, resetState]);

  /**
   * Click on a segment of the *building* chip — enter inline-edit on that
   * segment and reopen the corresponding menu. Existing downstream state
   * (operator, value preview) is preserved here; compatibility checks run
   * only when the user actually picks a new value via handleFieldSelect /
   * handleOperatorSelect.
   */
  const handleBuildingChipClick = useCallback(
    (segment: ChipSegment, anchorRect: DOMRect) => {
      if (!selectedField) return;
      const containerRect = containerRef.current?.getBoundingClientRect();
      setMenuOffset(containerRect ? anchorRect.left - containerRect.left : 0);
      const initialText =
        segment === SEGMENT_VARIANT.attribute
          ? selectedField.label
          : segment === SEGMENT_VARIANT.operator
            ? selectedOperator
              ? getOperatorLabel(selectedOperator, selectedField.type)
              : ''
            : (buildingMultiValue ?? '');
      editing.startBuildingEdit(segment, initialText);
      setInputText('');
      setMenuState(
        segment === SEGMENT_VARIANT.attribute
          ? 'field'
          : segment === SEGMENT_VARIANT.operator
            ? 'operator'
            : 'value',
      );
    },
    [selectedField, selectedOperator, buildingMultiValue, containerRef, setMenuOffset, editing],
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
    handleMenuDiscard,
    /** Hard reset of autocomplete state — used by paste/clipboard flows where
     *  the conditions array is replaced and any in-progress building must be
     *  scrapped, regardless of inline-edit mode. */
    resetAutocompleteState: resetState,
    handleChipClick: editing.handleChipClick,
    handleBuildingChipClick,
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
