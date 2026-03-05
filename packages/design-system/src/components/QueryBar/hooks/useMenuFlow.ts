import { useCallback } from 'react';
import { isBetweenOperator, isNoValueOperator } from '../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../types';

interface MenuFlowDeps {
  editing: {
    editingChipId: string | null;
    tryEditField: (field: FieldMetadata) => boolean;
    tryEditOperator: (operator: FilterOperator, field: FieldMetadata) => boolean;
  };
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
  ) => void;
  resetState: (openFieldMenu?: boolean) => void;
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
  upsertCondition,
  resetState,
  dateRange,
  setSelectedField,
  setSelectedOperator,
  setInputText,
  setMenuState,
  setBuildingMultiValue,
}: MenuFlowDeps) => {
  const handleMenuClose = useCallback(() => {
    resetState();
  }, [resetState]);

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
      upsertCondition(selectedField!, operator, null, editing.editingChipId);
      resetState(!isEditing);
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
      const isEditing = !!editing.editingChipId;
      upsertCondition(selectedField, selectedOperator, result, editing.editingChipId);
      resetState(!isEditing);
      return;
    }

    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, val, editing.editingChipId);
    resetState(!isEditing);
  }, [selectedField, selectedOperator, editing, dateRange, upsertCondition, resetState]);

  /** Multi-select commit: receives final array from QueryBarValueMenu */
  const handleMultiCommit = useCallback((values: Array<string | number | boolean>) => {
    if (!selectedField || !selectedOperator || values.length === 0) return;
    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, values, editing.editingChipId);
    resetState(!isEditing);
  }, [selectedField, selectedOperator, editing, upsertCondition, resetState]);

  /** Building value preview from QueryBarValueMenu multi-select */
  const handleBuildingValueChange = useCallback((preview: string | undefined) => {
    setBuildingMultiValue(preview);
  }, [setBuildingMultiValue]);

  /** Range select (between + calendar) */
  const handleRangeSelect = useCallback((from: string, to: string) => {
    if (!selectedField || !selectedOperator) return;
    const isEditing = !!editing.editingChipId;
    upsertCondition(selectedField, selectedOperator, [from, to], editing.editingChipId);
    resetState(!isEditing);
  }, [selectedField, selectedOperator, editing.editingChipId, upsertCondition, resetState]);

  return {
    handleMenuClose,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleRangeSelect,
  };
};
