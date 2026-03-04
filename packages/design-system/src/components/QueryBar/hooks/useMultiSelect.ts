import { useMemo, useState } from 'react';
import { chipIdToConditionIndex, isMultiSelectOperator } from '../lib';
import type { Condition, FieldMetadata, FilterOperator } from '../types';

type ConditionValue = string | number | boolean;

interface UseMultiSelectOptions {
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  editingChipId: string | null;
  conditions: Condition[];
}

export const useMultiSelect = ({
  selectedField,
  selectedOperator,
  editingChipId,
  conditions,
}: UseMultiSelectOptions) => {
  const [multiSelectValues, setMultiSelectValues] = useState<ConditionValue[]>([]);

  /** Toggle a value in the multi-select set */
  const toggleValue = (val: ConditionValue) => {
    setMultiSelectValues(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val],
    );
  };

  /** Try to commit pending multi-select values. Returns the values if committed, null otherwise. */
  const commitIfNeeded = (): ConditionValue[] | null => {
    if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
      return multiSelectValues;
    }
    return null;
  };

  /** Clear multi-select state */
  const reset = () => setMultiSelectValues([]);

  /** Derived: values to highlight in the value menu */
  const selectedValues = useMemo(() => {
    if (multiSelectValues.length > 0) return multiSelectValues;

    if (editingChipId && selectedOperator && !isMultiSelectOperator(selectedOperator)) {
      const idx = chipIdToConditionIndex(editingChipId);
      if (idx !== null) {
        const condition = conditions[idx];
        if (condition?.value != null && !Array.isArray(condition.value)) {
          return [condition.value];
        }
      }
    }

    return [];
  }, [multiSelectValues, editingChipId, selectedOperator, conditions]);

  /** Derived: display string for building chip preview */
  const buildingMultiValue = multiSelectValues.length > 0
    ? multiSelectValues
      .map(v => selectedField?.values?.find(opt => opt.value === v)?.label ?? String(v))
      .join(', ')
    : undefined;

  return {
    multiSelectValues,
    setMultiSelectValues,
    toggleValue,
    commitIfNeeded,
    selectedValues,
    buildingMultiValue,
    reset,
  };
};
