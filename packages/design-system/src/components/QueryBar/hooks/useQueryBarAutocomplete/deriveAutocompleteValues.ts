import {
  chipIdToConditionIndex,
  getDateDisplayLabel,
  getFieldValues,
  getOperatorLabel,
  isDatePreset,
  isMultiSelectOperator,
} from '../../lib';
import type { BuildingChipData } from '../../QueryBarContext/types';
import type { Condition, FieldMetadata, FilterOperator } from '../../types';

interface DeriveOptions {
  editingChipId: string | null;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  conditions: Condition[];
  buildingMultiValue: string | undefined;
  dateRangeFromValue: string | null | undefined;
  /** Segment text when inline-editing a value — used to derive checked values from text */
  segmentFilterText?: string;
}

export interface DerivedAutocompleteValues {
  isBuilding: boolean;
  buildingChipData: BuildingChipData | null;
  editingMultiValues: Array<string | number | boolean>;
  editingSingleValue: string | number | boolean | undefined;
  editingDateIsAbsolute: boolean;
}

/** Resolve chip ID → Condition from the conditions array */
const getEditingCondition = (
  editingChipId: string | null,
  conditions: Condition[],
): Condition | null => {
  if (!editingChipId) return null;
  const idx = chipIdToConditionIndex(editingChipId);
  return idx !== null ? (conditions[idx] ?? null) : null;
};

export const deriveAutocompleteValues = ({
  editingChipId,
  selectedField,
  selectedOperator,
  conditions,
  buildingMultiValue,
  dateRangeFromValue,
  segmentFilterText,
}: DeriveOptions): DerivedAutocompleteValues => {
  const isBuilding = selectedField !== null && !editingChipId;
  const editingCondition = getEditingCondition(editingChipId, conditions);

  // ── Editing date absolute check ─────────────────────────
  const editingDateIsAbsolute = (() => {
    if (!editingCondition || selectedField?.type !== 'date') return false;
    // Use stored dateOrigin if available (preserves original type after invalid edits)
    if (editingCondition.dateOrigin) return editingCondition.dateOrigin === 'absolute';
    const val = String(editingCondition.value ?? '');
    return val !== '' && !isDatePreset(val);
  })();

  // ── Editing values for QueryBarValueMenu ────────────────
  const editingMultiValues = (() => {
    if (!editingCondition || !selectedOperator || !isMultiSelectOperator(selectedOperator))
      return [];

    // Always derive from committed condition values.
    // Segment text is NOT used here to avoid a circular dependency:
    // segmentFilterText → editingMultiValues → initialValues → checkedValues
    // → buildingMultiValue → setSegmentFilterText → loop
    const values = Array.isArray(editingCondition.value)
      ? editingCondition.value
      : editingCondition.value != null
        ? [editingCondition.value]
        : [];
    if (editingCondition.error && selectedField) {
      const fieldValues = getFieldValues(selectedField);
      if (fieldValues.length > 0) {
        return values.filter(v => fieldValues.some(opt => opt.value === v));
      }
    }
    return values;
  })();

  const editingSingleValue = (() => {
    if (!editingCondition || !selectedOperator || isMultiSelectOperator(selectedOperator))
      return undefined;
    if (editingCondition.value != null && !Array.isArray(editingCondition.value))
      return editingCondition.value;
    return undefined;
  })();

  // ── Building chip preview ───────────────────────────────
  const buildingValue = (() => {
    if (buildingMultiValue) return buildingMultiValue;
    if (dateRangeFromValue && selectedOperator === 'between') {
      return `${getDateDisplayLabel(dateRangeFromValue)} – ...`;
    }
    return undefined;
  })();

  const buildingChipData: BuildingChipData | null = isBuilding
    ? {
        attribute: selectedField!.label,
        operator: selectedOperator
          ? getOperatorLabel(selectedOperator, selectedField!.type)
          : undefined,
        value: buildingValue,
      }
    : null;

  return {
    isBuilding,
    buildingChipData,
    editingMultiValues,
    editingSingleValue,
    editingDateIsAbsolute,
  };
};
