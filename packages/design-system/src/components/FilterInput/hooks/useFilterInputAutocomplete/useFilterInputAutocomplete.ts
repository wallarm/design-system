import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { useDateRange } from '../../FilterInputMenu/FilterInputDateValueMenu/hooks';
import { applyAcceptChar, chipIdToConditionIndex, getOperatorLabel } from '../../lib';
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

  /**
   * Main-input Backspace cascade for the building chip: drop into inline-edit
   * on the previous segment with its current text pre-selected (consistent
   * with the segment-click + cascade flow). User can immediately Backspace to
   * wipe the segment and continue cascading; when the attribute segment is
   * wiped via that flow, removeEditingChip tears the building chip down.
   * At the field step (only attribute, no segment to step into) tear the
   * whole building down directly.
   */
  const stepBackBuildingMenu = useCallback(
    (current: 'field' | 'operator' | 'value') => {
      if (!selectedField) {
        resetState();
        return;
      }
      if (current === 'value') {
        setBuildingMultiValue(undefined);
        setInputText('');
        const operatorText = selectedOperator
          ? getOperatorLabel(selectedOperator, selectedField.type)
          : '';
        editing.startBuildingEdit(SEGMENT_VARIANT.operator, operatorText);
        setMenuState('operator');
        return;
      }
      if (current === 'operator') {
        setSelectedOperator(null);
        setBuildingMultiValue(undefined);
        setInputText('');
        editing.startBuildingEdit(SEGMENT_VARIANT.attribute, selectedField.label);
        setMenuState('field');
        return;
      }
      resetState();
    },
    [selectedField, selectedOperator, editing, resetState],
  );

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
  /**
   * Walk inline-edit one segment to the left within the chip currently being
   * edited (Backspace on an empty segment input). The source segment's
   * underlying chip data is cleared so the deletion persists past the switch
   * (otherwise the just-emptied segment would re-render its committed text).
   * For committed chips the value-clear is routed through upsertCondition;
   * leaving operator also clears value since value shape depends on operator.
   * Returns true if a switch was performed.
   */
  const switchEditSegment = useCallback(
    (targetSegment: ChipSegment): boolean => {
      const sourceSegment = editing.editingSegment;
      if (sourceSegment === null) return false;
      const isBuildingEdit = !editing.editingChipId;
      const menuForSegment: Record<ChipSegment, MenuState> = {
        attribute: 'field',
        operator: 'operator',
        value: 'value',
      };

      if (isBuildingEdit) {
        if (!selectedField) return false;
        // Clear chip data for the segment we're leaving so it doesn't re-appear.
        if (sourceSegment === SEGMENT_VARIANT.value) {
          setBuildingMultiValue(undefined);
        } else if (sourceSegment === SEGMENT_VARIANT.operator) {
          setSelectedOperator(null);
          setBuildingMultiValue(undefined);
        }
        const initialText =
          targetSegment === SEGMENT_VARIANT.attribute
            ? selectedField.label
            : targetSegment === SEGMENT_VARIANT.operator
              ? selectedOperator
                ? getOperatorLabel(selectedOperator, selectedField.type)
                : ''
              : (buildingMultiValue ?? '');
        editing.startBuildingEdit(targetSegment, initialText);
        setInputText('');
        setMenuState(menuForSegment[targetSegment]);
        return true;
      }

      const editingId = editing.editingChipId!;
      const chip = chips.find(c => c.id === editingId);
      if (!chip || chip.variant !== 'chip') return false;
      const idx = chipIdToConditionIndex(editingId);
      const condition = idx !== null ? conditionsRef.current[idx] : null;
      const field = condition ? fields.find(f => f.name === condition.field) : null;

      // Clear chip data for the segment we're leaving. Without a field we
      // can't upsert, so fall back to a plain segment switch in that case.
      if (condition && field) {
        if (sourceSegment === SEGMENT_VARIANT.value) {
          upsertCondition(
            field,
            condition.operator,
            null,
            editingId,
            undefined,
            undefined,
            condition.dateOrigin,
          );
        } else if (sourceSegment === SEGMENT_VARIANT.operator) {
          upsertCondition(field, undefined, null, editingId, undefined, undefined, undefined);
        }
      }

      // Load the target segment's still-present text into the inline-edit so
      // the next Backspace deletes a char of it (per "gap then deletion" spec).
      const targetText =
        targetSegment === SEGMENT_VARIANT.attribute
          ? (chip.attribute ?? '')
          : targetSegment === SEGMENT_VARIANT.operator
            ? (chip.operator ?? '')
            : '';
      editing.switchEditSegment(targetSegment, targetText);
      setMenuState(menuForSegment[targetSegment]);
      return true;
    },
    [editing, selectedField, selectedOperator, buildingMultiValue, chips, fields, upsertCondition],
  );

  /**
   * Remove the chip currently being edited (Backspace on an empty attribute
   * segment when operator/value are absent). Handles both the building flow
   * (drop in-progress state) and committed chips (remove the condition,
   * adjusting insertIndex like handleChipRemove does).
   */
  const removeEditingChip = useCallback(() => {
    if (editing.editingSegment === null) return;
    const editingId = editing.editingChipId;
    if (!editingId) {
      resetState();
      return;
    }
    const chipCondIdx = chipIdToConditionIndex(editingId);
    if (chipCondIdx !== null && chipCondIdx < effectiveInsertIndexRef.current) {
      setInsertIndex(prev => (prev != null ? prev - 1 : prev));
    }
    removeCondition(editingId);
    resetState();
  }, [editing, removeCondition, resetState]);

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
