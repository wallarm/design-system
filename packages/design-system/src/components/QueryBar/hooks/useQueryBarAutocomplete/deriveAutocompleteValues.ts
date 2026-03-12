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

    // Always derive from committed condition values.
    // Segment text is NOT used here to avoid a circular dependency:
    // segmentFilterText → editingMultiValues → initialValues → checkedValues
    // → buildingMultiValue → setSegmentFilterText → loop
    const idx = chipIdToConditionIndex(editingChipId);
    if (idx === null) return [];
    const condition = conditions[idx];
    if (!condition) return [];
    const values = Array.isArray(condition.value)
      ? condition.value
      : condition.value != null
        ? [condition.value]
        : [];
    if (condition.error && selectedField) {
      const fieldValues = getFieldValues(selectedField);
      if (fieldValues.length > 0) {
        return values.filter(v => fieldValues.some(opt => opt.value === v));
      }
    }
    return values;
  })();

  const editingSingleValue = (() => {
    if (!editingChipId || !selectedOperator || isMultiSelectOperator(selectedOperator))
      return undefined;
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
