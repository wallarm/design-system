import { chipIdToConditionIndex, getDateDisplayLabel, getOperatorLabel, isDatePreset, isMultiSelectOperator } from '../../lib';
import type { Condition, FieldMetadata, FilterOperator } from '../../types';
import type { BuildingChipData } from '../../QueryBarContext/types';

interface DeriveOptions {
  editingChipId: string | null;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  conditions: Condition[];
  buildingMultiValue: string | undefined;
  dateRangeFromValue: string | null | undefined;
}

export interface DerivedAutocompleteValues {
  isBuilding: boolean;
  buildingChipData: BuildingChipData | null;
  editingMultiValues: Array<string | number | boolean>;
  editingSingleValue: string | number | boolean | undefined;
  editingDateIsAbsolute: boolean;
}

export const deriveAutocompleteValues = ({
  editingChipId,
  selectedField,
  selectedOperator,
  conditions,
  buildingMultiValue,
  dateRangeFromValue,
}: DeriveOptions): DerivedAutocompleteValues => {
  const isBuilding = selectedField !== null && !editingChipId;

  // ── Editing date absolute check ─────────────────────────
  const editingDateIsAbsolute = (() => {
    if (!editingChipId || selectedField?.type !== 'date') return false;
    const idx = chipIdToConditionIndex(editingChipId);
    if (idx === null) return false;
    const condition = conditions[idx];
    if (!condition) return false;
    // Use stored dateOrigin if available (preserves original type after invalid edits)
    if (condition.dateOrigin) return condition.dateOrigin === 'absolute';
    const val = String(condition.value ?? '');
    return val !== '' && !isDatePreset(val);
  })();

  // ── Editing values for QueryBarValueMenu ────────────────
  const editingMultiValues = (() => {
    if (!editingChipId || !selectedOperator || !isMultiSelectOperator(selectedOperator)) return [];
    const idx = chipIdToConditionIndex(editingChipId);
    if (idx === null) return [];
    const condition = conditions[idx];
    if (!condition) return [];
    const values = Array.isArray(condition.value) ? condition.value : condition.value != null ? [condition.value] : [];
    // When condition has error, only pre-check values that exist in the field's values list
    if (condition.error && selectedField?.values) {
      return values.filter(v => selectedField.values!.some(opt => opt.value === v));
    }
    return values;
  })();

  const editingSingleValue = (() => {
    if (!editingChipId || !selectedOperator || isMultiSelectOperator(selectedOperator)) return undefined;
    const idx = chipIdToConditionIndex(editingChipId);
    if (idx === null) return undefined;
    const condition = conditions[idx];
    if (condition?.value != null && !Array.isArray(condition.value)) return condition.value;
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

  const buildingChipData: BuildingChipData | null = isBuilding ? {
    attribute: selectedField!.label,
    operator: selectedOperator ? getOperatorLabel(selectedOperator, selectedField!.type) : undefined,
    value: buildingValue,
  } : null;

  return {
    isBuilding,
    buildingChipData,
    editingMultiValues,
    editingSingleValue,
    editingDateIsAbsolute,
  };
};
