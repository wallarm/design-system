import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';
import {
  chipIdToConditionIndex,
  isBetweenOperator,
  isDatePreset,
  isMultiSelectOperator,
  isNoValueOperator,
} from '../../lib';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../../types';

/** Check if condition value(s) are valid for the given field. Returns true if error. */
const validateValueForField = (
  field: FieldMetadata,
  value: Condition['value'],
): boolean => {
  // No values list means any value is acceptable (free-text field)
  if (!field.values || field.values.length === 0) return false;
  // Null value (no-value operators) is always valid
  if (value == null) return false;

  const values = Array.isArray(value) ? value : [value];
  return values.some(
    v =>
      !field.values!.some(
        opt =>
          opt.value === v ||
          String(opt.value).toLowerCase() === String(v).toLowerCase(),
      ),
  );
};

/** Resolve a text input to the actual field value (e.g. label "Active" → value "active") */
const resolveFieldValue = (
  field: FieldMetadata,
  text: string,
): string | number | boolean => {
  const match = field.values?.find(
    v =>
      v.label.toLowerCase() === text.toLowerCase() ||
      String(v.value).toLowerCase() === text.toLowerCase(),
  );
  return match ? match.value : text;
};

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
    error?: boolean,
    dateOrigin?: 'relative' | 'absolute',
  ) => void;
  conditions: Condition[];
  resetState: () => void;
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
          // Check if current value(s) are valid for the new field
          const error = validateValueForField(field, condition.value);
          upsertCondition(
            field,
            condition.operator,
            condition.value,
            editing.editingChipId,
            undefined,
            error || undefined,
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
        resetState();
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
        resetState();
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
      resetState();
    },
    [selectedField, selectedOperator, editing, dateRange, insertIndex, upsertCondition, resetState],
  );

  /** Multi-select commit: receives final array from QueryBarValueMenu */
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
      resetState();
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Building value preview from QueryBarValueMenu multi-select */
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
      resetState();
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit multi-select values from inline text (comma-separated) */
  const commitMultiSelectValue = useCallback(
    (trimmed: string, field: FieldMetadata, operator: FilterOperator) => {
      const isEditing = !!editing.editingChipId;
      const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
      const resolved = parts.map(part => resolveFieldValue(field, part));
      let error: boolean | undefined;
      if (field.values && field.values.length > 0) {
        const hasInvalid = resolved.some(
          v => !field.values!.some(opt => opt.value === v),
        );
        if (hasInvalid) error = true;
      }
      upsertCondition(field, operator, resolved, editing.editingChipId, isEditing ? undefined : insertIndex, error);
      resetState();
    },
    [editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit a date value from inline text */
  const commitDateValue = useCallback(
    (trimmed: string, field: FieldMetadata, operator: FilterOperator) => {
      const isEditing = !!editing.editingChipId;
      let error: boolean | undefined;
      let dateOrigin: 'relative' | 'absolute' | undefined;

      if (editing.editingChipId) {
        const idx = chipIdToConditionIndex(editing.editingChipId);
        const oldCondition = idx !== null ? conditionsRef.current[idx] : null;
        if (oldCondition) {
          const oldVal = String(oldCondition.value ?? '');
          dateOrigin = oldCondition.dateOrigin ?? (isDatePreset(oldVal) ? 'relative' : 'absolute');
        }
      }
      const isValidPreset = isDatePreset(trimmed);
      // Reject short strings that Date() parses loosely (e.g. '2' → 2001-02-01)
      const isValidDate = !isValidPreset && trimmed.length >= 6 && !isNaN(new Date(trimmed).getTime());
      if (!isValidPreset && !isValidDate) error = true;

      upsertCondition(field, operator, trimmed, editing.editingChipId, isEditing ? undefined : insertIndex, error, dateOrigin);
      resetState();
    },
    [editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit a single-select value from inline text */
  const commitSingleValue = useCallback(
    (trimmed: string, field: FieldMetadata, operator: FilterOperator) => {
      const isEditing = !!editing.editingChipId;
      const resolved = resolveFieldValue(field, trimmed);
      let error: boolean | undefined;
      if (field.values && field.values.length > 0 && resolved === trimmed) {
        // resolveFieldValue returned the raw text — no match found
        const hasMatch = field.values.some(
          v =>
            v.label.toLowerCase() === trimmed.toLowerCase() ||
            String(v.value).toLowerCase() === trimmed.toLowerCase(),
        );
        if (!hasMatch) error = true;
      }
      upsertCondition(field, operator, resolved, editing.editingChipId, isEditing ? undefined : insertIndex, error);
      resetState();
    },
    [editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit a custom typed value (from inline segment editing) */
  const handleCustomValueCommit = useCallback(
    (customText: string) => {
      if (!selectedField || !selectedOperator || !customText.trim()) return;
      const trimmed = customText.trim();

      if (isMultiSelectOperator(selectedOperator)) {
        commitMultiSelectValue(trimmed, selectedField, selectedOperator);
      } else if (selectedField.type === 'date') {
        commitDateValue(trimmed, selectedField, selectedOperator);
      } else {
        commitSingleValue(trimmed, selectedField, selectedOperator);
      }
    },
    [selectedField, selectedOperator, commitMultiSelectValue, commitDateValue, commitSingleValue],
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
        const error = validateValueForField(matchedField, condition.value);
        upsertCondition(
          matchedField,
          condition.operator,
          condition.value,
          editing.editingChipId,
          undefined,
          error || undefined,
          condition.dateOrigin,
        );
      } else {
        // Unknown field — create a synthetic FieldMetadata and mark as error
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
          true,
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
