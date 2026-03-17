import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';
import {
  chipIdToConditionIndex,
  isBetweenOperator,
  isMultiSelectOperator,
  isNoValueOperator,
} from '../../lib';
import type {
  ChipErrorSegment,
  Condition,
  FieldMetadata,
  FilterOperator,
  MenuState,
} from '../../types';
import {
  resolveDateRangeValue,
  resolveDateValue,
  resolveMultiValues,
  resolveSingleValue,
  validateValueForField,
} from './valueCommitHelpers';

interface MenuFlowDeps {
  editing: {
    editingChipId: string | null;
    editingSegment: string | null;
    setSegmentFilterText: (text: string) => void;
  };
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  fields: FieldMetadata[];
  inputRef: RefObject<HTMLInputElement | null>;
  insertIndex: number;
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
    atIndex?: number,
    error?: ChipErrorSegment,
    dateOrigin?: 'relative' | 'absolute',
  ) => void;
  conditions: Condition[];
  resetState: (continueBuilding?: boolean) => void;
  dateRange: { selectValue: (val: string) => string[] | null };
  setSelectedField: (f: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  setBuildingMultiValue: (val: string | undefined) => void;
}

export const useMenuFlow = ({
  editing,
  selectedField,
  selectedOperator,
  fields,
  inputRef,
  insertIndex,
  upsertCondition,
  conditions,
  resetState,
  dateRange,
  setSelectedField,
  setSelectedOperator,
  setInputText,
  setMenuState,
  setBuildingMultiValue,
}: MenuFlowDeps) => {
  // Ref keeps conditions fresh for callbacks without adding to dependency arrays
  const conditionsRef = useRef(conditions);
  conditionsRef.current = conditions;

  // Ignore Ark UI close when focus is on our input or a segment inline-edit input
  const handleMenuClose = useCallback(() => {
    if (document.activeElement === inputRef.current) return;
    if ((document.activeElement as HTMLElement)?.closest?.('[data-slot^="segment-"]')) return;
    resetState();
  }, [resetState, inputRef]);

  const handleFieldSelect = useCallback(
    (field: FieldMetadata) => {
      // When editing an existing chip's attribute — update field, keep operator/value
      if (editing.editingChipId && editing.editingSegment === 'attribute') {
        const idx = chipIdToConditionIndex(editing.editingChipId);
        const condition = idx !== null ? conditionsRef.current[idx] : null;
        if (condition) {
          const hasValueError = validateValueForField(field, condition.value);
          upsertCondition(
            field,
            condition.operator,
            condition.value,
            editing.editingChipId,
            undefined,
            hasValueError ? 'value' : undefined,
            condition.dateOrigin,
          );
        }
        resetState();
        return;
      }
      setSelectedField(field);
      setInputText('');
      setMenuState('operator');
    },
    [editing, upsertCondition, resetState, setSelectedField, setInputText, setMenuState],
  );

  const handleOperatorSelect = useCallback(
    (operator: FilterOperator) => {
      if (!selectedField) return;

      if (isNoValueOperator(operator)) {
        const isEditing = !!editing.editingChipId;
        upsertCondition(
          selectedField,
          operator,
          null,
          editing.editingChipId,
          isEditing ? undefined : insertIndex,
        );
        resetState(!isEditing);
        return;
      }

      setSelectedOperator(operator);
      setMenuState('value');
    },
    [
      editing,
      selectedField,
      insertIndex,
      upsertCondition,
      resetState,
      setSelectedOperator,
      setMenuState,
    ],
  );

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
          error ? 'value' : undefined,
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
            rangeValue ? undefined : 'value',
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
            error ? 'value' : undefined,
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
          error ? 'value' : undefined,
        );
      }
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit a custom typed attribute (from inline segment editing) */
  const handleCustomAttributeCommit = useCallback(
    (customText: string) => {
      if (!editing.editingChipId || !customText.trim()) return;
      const trimmed = customText.trim();
      const idx = chipIdToConditionIndex(editing.editingChipId);
      const condition = idx !== null ? conditionsRef.current[idx] : null;
      if (!condition) return;

      // Try to match the typed text to a known field
      const matchedField = fields.find(
        f =>
          f.label.toLowerCase() === trimmed.toLowerCase() ||
          f.name.toLowerCase() === trimmed.toLowerCase(),
      );

      if (matchedField) {
        const hasValueError = validateValueForField(matchedField, condition.value);
        upsertCondition(
          matchedField,
          condition.operator,
          condition.value,
          editing.editingChipId,
          undefined,
          hasValueError ? 'value' : undefined,
          condition.dateOrigin,
        );
      } else {
        // Unknown field — create a synthetic FieldMetadata and mark attribute as error
        const syntheticField: FieldMetadata = {
          name: trimmed,
          label: trimmed,
          type: 'string',
        };
        upsertCondition(
          syntheticField,
          condition.operator,
          condition.value,
          editing.editingChipId,
          undefined,
          'attribute',
          condition.dateOrigin,
        );
      }
      resetState();
    },
    [editing, fields, upsertCondition, resetState],
  );

  return {
    handleMenuClose,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleRangeSelect,
    handleCustomValueCommit,
    handleCustomAttributeCommit,
  };
};
