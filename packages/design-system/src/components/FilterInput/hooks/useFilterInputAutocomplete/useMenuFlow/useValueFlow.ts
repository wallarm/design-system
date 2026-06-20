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
  buildingSide,
  setBuildingSide,
  buildingBase,
  setBuildingBase,
  setSelectedField,
  setSelectedOperator,
  setMenuState,
  setBuildingMultiValue,
  setInputText,
}: MenuFlowInternalDeps) => {
  const { editingChipId, editingSegment, resetSegmentTyping } = editing;

  /**
   * Building a paired field's base value: stash it and advance into the second
   * triplet (swap to the paired field, reopen the operator menu) instead of
   * committing. The base is committed together with the pair when the second
   * value is chosen, so the whole thing stays one building chip. Returns true
   * if it advanced.
   */
  const stashAndAdvance = useCallback(
    (value: string | number | boolean | null | Array<string | number | boolean>): boolean => {
      const pairedField = selectedField?.pairedField;
      if (
        buildingSide !== 0 ||
        !pairedField ||
        editingChipId ||
        !selectedField ||
        !selectedOperator
      )
        return false;
      setBuildingBase({ field: selectedField, operator: selectedOperator, value });
      setSelectedField(pairedField);
      setSelectedOperator(null);
      setBuildingSide(1);
      setInputText('');
      setMenuState('operator');
      return true;
    },
    [
      selectedField,
      selectedOperator,
      buildingSide,
      editingChipId,
      setBuildingBase,
      setSelectedField,
      setSelectedOperator,
      setBuildingSide,
      setInputText,
      setMenuState,
    ],
  );

  /**
   * Committing a paired field's second value: persist the stashed base triplet
   * and the pair as one condition, then reset. Returns true if it handled the
   * commit.
   */
  const commitPairedSecond = useCallback(
    (
      value: string | number | boolean | null | Array<string | number | boolean>,
      error?: 'value',
      dateOrigin?: 'relative' | 'absolute',
    ): boolean => {
      if (buildingSide !== 1 || !buildingBase || !selectedField || !selectedOperator) return false;
      upsertCondition(
        buildingBase.field,
        buildingBase.operator,
        buildingBase.value,
        null,
        insertIndex,
      );
      upsertCondition(
        selectedField,
        selectedOperator,
        value,
        null,
        undefined,
        error,
        dateOrigin,
        1,
      );
      setBuildingBase(null);
      setBuildingSide(0);
      resetState(true);
      return true;
    },
    [
      buildingSide,
      buildingBase,
      selectedField,
      selectedOperator,
      insertIndex,
      upsertCondition,
      setBuildingBase,
      setBuildingSide,
      resetState,
    ],
  );

  /** Single-select value (including date presets, between date collection) */
  const handleValueSelect = useCallback(
    (val: string | number | boolean) => {
      if (!selectedField || !selectedOperator) return;

      // Resolve the value to commit (date "between" collects across two calls).
      let committedValue: string | number | boolean | null | Array<string | number | boolean> = val;
      if (isBetweenOperator(selectedOperator) && selectedField.type === 'date') {
        const result = dateRange.selectValue(String(val));
        if (!result) return;
        committedValue = result;
      }

      if (stashAndAdvance(committedValue)) return;
      if (commitPairedSecond(committedValue)) return;

      const isEditing = !!editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        committedValue,
        editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [
      selectedField,
      selectedOperator,
      editingChipId,
      dateRange,
      insertIndex,
      upsertCondition,
      resetState,
      stashAndAdvance,
      commitPairedSecond,
    ],
  );

  /** Multi-select commit: receives final array from FilterInputValueMenu */
  const handleMultiCommit = useCallback(
    (values: Array<string | number | boolean>) => {
      if (!selectedField || !selectedOperator || values.length === 0) return;
      const isEditing = !!editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        values,
        editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editingChipId, insertIndex, upsertCondition, resetState],
  );

  /** Building value preview from FilterInputValueMenu multi-select */
  const handleBuildingValueChange = useCallback(
    (preview: string | undefined) => {
      setBuildingMultiValue(preview);
    },
    [setBuildingMultiValue],
  );

  /** Multi-select toggle: reset dropdown filter source so menu shows all
   *  options. Segment-edit only resets the typing flag (preserves displayed
   *  chip text — prevents flicker between clicks). */
  const handleMultiSelectToggle = useCallback(() => {
    if (editingSegment === SEGMENT_VARIANT.value) {
      resetSegmentTyping();
    } else {
      setInputText('');
    }
  }, [editingSegment, resetSegmentTyping, setInputText]);

  /** Range select (between + calendar) */
  const handleRangeSelect = useCallback(
    (from: string, to: string) => {
      if (!selectedField || !selectedOperator) return;
      const isEditing = !!editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        [from, to],
        editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editingChipId, insertIndex, upsertCondition, resetState],
  );

  /** Commit a custom typed value (from inline segment editing or freeform input) */
  const handleCustomValueCommit = useCallback(
    (customText: string) => {
      if (!selectedField || !selectedOperator || !customText.trim()) return;
      const trimmed = customText.trim();
      const isEditing = !!editingChipId;

      // Resolve the typed text to a value + per-segment error + date origin
      // based on the field/operator shape.
      let resolvedValue: string | number | boolean | null | Array<string | number | boolean> =
        trimmed;
      let valueError: 'value' | undefined;
      let dateOrigin: 'relative' | 'absolute' | undefined;

      if (isMultiSelectOperator(selectedOperator)) {
        const { resolved, error } = resolveMultiValues(selectedField, trimmed);
        resolvedValue = resolved;
        valueError = error ? SEGMENT_VARIANT.value : undefined;
      } else if (selectedField.type === 'date') {
        if (isBetweenOperator(selectedOperator)) {
          // Parse "Mar 5, 2026 – Mar 15, 2026" → ["2026-03-05", "2026-03-15"].
          const rangeValue = resolveDateRangeValue(trimmed);
          resolvedValue = rangeValue ?? trimmed;
          valueError = rangeValue ? undefined : SEGMENT_VARIANT.value;
          dateOrigin = 'absolute';
        } else {
          const resolved = resolveDateValue(trimmed, editingChipId, conditionsRef.current);
          resolvedValue = trimmed;
          valueError = resolved.error ? SEGMENT_VARIANT.value : undefined;
          dateOrigin = resolved.dateOrigin;
        }
      } else {
        const { resolved, error } = resolveSingleValue(selectedField, trimmed);
        resolvedValue = resolved;
        valueError = error ? SEGMENT_VARIANT.value : undefined;
      }

      if (stashAndAdvance(resolvedValue)) return;
      if (commitPairedSecond(resolvedValue, valueError, dateOrigin)) return;

      upsertCondition(
        selectedField,
        selectedOperator,
        resolvedValue,
        editingChipId,
        isEditing ? undefined : insertIndex,
        valueError,
        dateOrigin,
      );
      resetState(!isEditing);
    },
    [
      selectedField,
      selectedOperator,
      editingChipId,
      insertIndex,
      conditionsRef,
      upsertCondition,
      resetState,
      stashAndAdvance,
      commitPairedSecond,
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
