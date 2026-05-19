import { useCallback } from 'react';
import { SEGMENT_VARIANT } from '../../../FilterInputField/FilterInputChip';
import { isBetweenOperator, isMultiSelectOperator } from '../../../lib';
import {
  resolveDateRangeValue,
  resolveDateValue,
  resolveMultiValues,
  resolveSingleValue,
} from '../lib';
import type { MenuFlowInternalDeps } from './types';

/**
 * Value-segment handlers: single/multi/range select from the menu and the
 * keyboard-typed custom-value commit (which routes through the field-type
 * specific resolver). Also handles multi-select preview/toggle plumbing.
 */
export const useValueFlow = ({
  editing,
  selectedField,
  selectedOperator,
  insertIndex,
  upsertCondition,
  conditionsRef,
  resetState,
  dateRange,
  setBuildingMultiValue,
  setInputText,
}: MenuFlowInternalDeps) => {
  /** Single-select value (including date presets, between date collection) */
  const handleValueSelect = useCallback(
    (val: string | number | boolean) => {
      if (!selectedField || !selectedOperator) return;

      if (isBetweenOperator(selectedOperator) && selectedField.type === 'date') {
        const result = dateRange.selectValue(String(val));
        if (!result) return;
        upsertCondition(selectedField, selectedOperator, result, editing.editingChipId);
        resetState(!editing.editingChipId);
        return;
      }

      const isEditing = !!editing.editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        val,
        editing.editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, dateRange, insertIndex, upsertCondition, resetState],
  );

  /** Multi-select commit: receives final array from FilterInputValueMenu */
  const handleMultiCommit = useCallback(
    (values: Array<string | number | boolean>) => {
      if (!selectedField || !selectedOperator || values.length === 0) return;
      const isEditing = !!editing.editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        values,
        editing.editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Building value preview from FilterInputValueMenu multi-select */
  const handleBuildingValueChange = useCallback(
    (preview: string | undefined) => {
      setBuildingMultiValue(preview);
    },
    [setBuildingMultiValue],
  );

  /** Fires only on explicit multi-select toggle (not on mount). Resets the
   *  *dropdown filter source* so the menu shows all options + already-checked
   *  items for the next selection, without wiping what the user sees.
   *  - Building mode: clear the main input (nothing is rendered from it).
   *  - Segment-edit mode: reset the typing flag only. The displayed segment
   *    text (the original chip value being edited) stays visible on the chip
   *    so there's no flicker to an empty string between clicks. */
  const handleMultiSelectToggle = useCallback(() => {
    if (editing.editingSegment === SEGMENT_VARIANT.value) {
      editing.resetSegmentTyping();
    } else {
      setInputText('');
    }
  }, [editing, setInputText]);

  /** Range select (between + calendar) */
  const handleRangeSelect = useCallback(
    (from: string, to: string) => {
      if (!selectedField || !selectedOperator) return;
      const isEditing = !!editing.editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        [from, to],
        editing.editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit a custom typed value (from inline segment editing or freeform input) */
  const handleCustomValueCommit = useCallback(
    (customText: string) => {
      if (!selectedField || !selectedOperator || !customText.trim()) return;
      const trimmed = customText.trim();
      const isEditing = !!editing.editingChipId;

      if (isMultiSelectOperator(selectedOperator)) {
        const { resolved, error } = resolveMultiValues(selectedField, trimmed);
        upsertCondition(
          selectedField,
          selectedOperator,
          resolved,
          editing.editingChipId,
          isEditing ? undefined : insertIndex,
          error ? SEGMENT_VARIANT.value : undefined,
        );
      } else if (selectedField.type === 'date') {
        // Handle "between" date ranges: parse "Mar 5, 2026 – Mar 15, 2026" → ["2026-03-05", "2026-03-15"]
        if (isBetweenOperator(selectedOperator)) {
          const rangeValue = resolveDateRangeValue(trimmed);
          upsertCondition(
            selectedField,
            selectedOperator,
            rangeValue ?? trimmed,
            editing.editingChipId,
            isEditing ? undefined : insertIndex,
            rangeValue ? undefined : SEGMENT_VARIANT.value,
            'absolute',
          );
        } else {
          const { error, dateOrigin } = resolveDateValue(
            trimmed,
            editing.editingChipId,
            conditionsRef.current,
          );
          upsertCondition(
            selectedField,
            selectedOperator,
            trimmed,
            editing.editingChipId,
            isEditing ? undefined : insertIndex,
            error ? SEGMENT_VARIANT.value : undefined,
            dateOrigin,
          );
        }
      } else {
        const { resolved, error } = resolveSingleValue(selectedField, trimmed);
        upsertCondition(
          selectedField,
          selectedOperator,
          resolved,
          editing.editingChipId,
          isEditing ? undefined : insertIndex,
          error ? SEGMENT_VARIANT.value : undefined,
        );
      }
      resetState(!isEditing);
    },
    [
      selectedField,
      selectedOperator,
      editing,
      insertIndex,
      conditionsRef,
      upsertCondition,
      resetState,
    ],
  );

  return {
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleMultiSelectToggle,
    handleRangeSelect,
    handleCustomValueCommit,
  };
};
