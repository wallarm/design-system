import type { RefObject } from 'react';
import { useCallback } from 'react';
import { chipIdToConditionIndex, isBetweenOperator, isDatePreset, isMultiSelectOperator, isNoValueOperator } from '../../lib';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../../types';

interface MenuFlowDeps {
  editing: {
    editingChipId: string | null;
    tryEditField: (field: FieldMetadata) => boolean;
    tryEditOperator: (operator: FilterOperator, field: FieldMetadata) => boolean;
  };
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
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
  // Ignore Ark UI close when focus is returning to our input (e.g. ArrowUp on first item)
  const handleMenuClose = useCallback(() => {
    if (document.activeElement === inputRef.current) return;
    resetState();
  }, [resetState, inputRef]);

  const handleFieldSelect = useCallback((field: FieldMetadata) => {
    if (editing.tryEditField(field)) {
      resetState();
      return;
    }
    setSelectedField(field);
    setInputText('');
    setMenuState('operator');
  }, [editing, resetState, setSelectedField, setInputText, setMenuState]);

  const handleOperatorSelect = useCallback((operator: FilterOperator) => {
    if (isNoValueOperator(operator)) {
      const isEditing = !!editing.editingChipId;
      upsertCondition(selectedField!, operator, null, editing.editingChipId, isEditing ? undefined : insertIndex);
      resetState();
      return;
    }

    if (editing.editingChipId) {
      if (editing.tryEditOperator(operator, selectedField!)) {
        resetState();
        return;
      }
    }

    setSelectedOperator(operator);
    setMenuState('value');
  }, [editing, selectedField, upsertCondition, resetState, setSelectedOperator, setMenuState]);

  /** Single-select value (including date presets, between date collection) */
  const handleValueSelect = useCallback((val: string | number | boolean) => {
    if (!selectedField || !selectedOperator) return;

    if (isBetweenOperator(selectedOperator) && selectedField.type === 'date') {
      const result = dateRange.selectValue(String(val));
      if (!result) return;
      upsertCondition(selectedField, selectedOperator, result, editing.editingChipId);
      resetState();
      return;
    }

    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, val, editing.editingChipId, isEditing ? undefined : insertIndex);
    resetState();
  }, [selectedField, selectedOperator, editing, dateRange, insertIndex, upsertCondition, resetState]);

  /** Multi-select commit: receives final array from QueryBarValueMenu */
  const handleMultiCommit = useCallback((values: Array<string | number | boolean>) => {
    if (!selectedField || !selectedOperator || values.length === 0) return;
    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, values, editing.editingChipId, isEditing ? undefined : insertIndex);
    resetState();
  }, [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState]);

  /** Building value preview from QueryBarValueMenu multi-select */
  const handleBuildingValueChange = useCallback((preview: string | undefined) => {
    setBuildingMultiValue(preview);
  }, [setBuildingMultiValue]);

  /** Range select (between + calendar) */
  const handleRangeSelect = useCallback((from: string, to: string) => {
    if (!selectedField || !selectedOperator) return;
    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, [from, to], editing.editingChipId, isEditing ? undefined : insertIndex);
    resetState();
  }, [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState]);

  /** Commit a custom typed value (from inline segment editing) */
  const handleCustomValueCommit = useCallback((customText: string) => {
    if (!selectedField || !selectedOperator || !customText.trim()) return;
    const trimmed = customText.trim();
    const isEditing = !!editing.editingChipId;

    let error: boolean | undefined;
    let dateOrigin: 'relative' | 'absolute' | undefined;

    if (isMultiSelectOperator(selectedOperator)) {
      // Parse comma-separated values, resolve each to field value
      const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
      const resolved = parts.map(part => {
        const match = selectedField.values?.find(
          v => v.label.toLowerCase() === part.toLowerCase() || String(v.value).toLowerCase() === part.toLowerCase(),
        );
        return match ? match.value : part;
      });
      // Error if any value is not in the allowed list
      if (selectedField.values && selectedField.values.length > 0) {
        const hasInvalid = resolved.some(v => !selectedField.values!.some(opt => opt.value === v));
        if (hasInvalid) error = true;
      }
      upsertCondition(selectedField, selectedOperator, resolved, editing.editingChipId, isEditing ? undefined : insertIndex, error);
      resetState();
      return;
    }

    if (selectedField.type === 'date') {
      // Determine dateOrigin from previous condition value
      if (editing.editingChipId) {
        const idx = chipIdToConditionIndex(editing.editingChipId);
        const oldCondition = idx !== null ? conditions[idx] : null;
        if (oldCondition) {
          const oldVal = String(oldCondition.value ?? '');
          dateOrigin = oldCondition.dateOrigin ?? (isDatePreset(oldVal) ? 'relative' : 'absolute');
        }
      }
      // Validate: must be a valid preset or a properly formatted date (ISO-like or locale)
      const isValidPreset = isDatePreset(trimmed);
      // Reject short strings that Date() parses loosely (e.g. '2' → 2001-02-01)
      const isValidDate = !isValidPreset && trimmed.length >= 6 && !isNaN(new Date(trimmed).getTime());
      if (!isValidPreset && !isValidDate) error = true;
    } else {
      // Non-date single-select: error if value not in allowed list
      const hasMatch = selectedField.values?.some(
        v => v.label.toLowerCase() === trimmed.toLowerCase() || String(v.value).toLowerCase() === trimmed.toLowerCase(),
      );
      if (selectedField.values && selectedField.values.length > 0 && !hasMatch) error = true;
    }

    upsertCondition(selectedField, selectedOperator, trimmed, editing.editingChipId, isEditing ? undefined : insertIndex, error, dateOrigin);
    resetState();
  }, [selectedField, selectedOperator, editing, conditions, insertIndex, upsertCondition, resetState]);

  return {
    handleMenuClose,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleRangeSelect,
    handleCustomValueCommit,
  };
};
