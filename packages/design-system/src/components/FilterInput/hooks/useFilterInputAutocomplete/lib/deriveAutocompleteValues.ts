import type { BuildingChipData } from '../../../FilterInputContext/types';
import {
  chipIdToConditionIndex,
  getDateDisplayLabel,
  getFieldValues,
  getOperatorLabel,
  hasStaticAllowlist,
  isMultiSelectOperator,
  isNoValueOperator,
  NO_VALUE_PLACEHOLDER,
} from '../../../lib';
import type { Condition, FieldMetadata, FilterOperator } from '../../../types';
import type { BuildingBase } from '../useAutocompleteState';

interface DeriveOptions {
  editingChipId: string | null;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  conditions: Condition[];
  buildingMultiValue: string | undefined;
  dateRangeFromValue: string | null | undefined;
  /** Segment text when inline-editing a value. */
  segmentFilterText?: string;
  /** Which triplet is being built: 0 = base, 1 = paired second. */
  buildingSide?: 0 | 1;
  /** Stashed base triplet while building the paired second value. */
  buildingBase?: BuildingBase | null;
}

/** Resolve a scalar/array value to a display string via the field's allowlist. */
const displayBaseValue = (
  value: string | number | boolean | null | Array<string | number | boolean>,
  field: FieldMetadata,
): string => {
  const options = getFieldValues(field);
  const resolve = (v: string | number | boolean | null): string =>
    options.find(opt => String(opt.value) === String(v))?.label ?? String(v ?? '');
  return Array.isArray(value) ? value.map(resolve).join(', ') : resolve(value);
};

export interface DerivedAutocompleteValues {
  isBuilding: boolean;
  buildingChipData: BuildingChipData | null;
  editingMultiValues: Array<string | number | boolean>;
  editingSingleValue: string | number | boolean | undefined;
  /** [from, to] ISO strings when editing a "between" date condition */
  editingDateRange: [string, string] | undefined;
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
  buildingSide,
  buildingBase,
}: DeriveOptions): DerivedAutocompleteValues => {
  const isBuilding = selectedField !== null && !editingChipId;
  const editingCondition = getEditingCondition(editingChipId, conditions);

  const editingMultiValues = (() => {
    if (!editingCondition || !selectedOperator || !isMultiSelectOperator(selectedOperator))
      return [];

    // Derive from committed condition values only — using segmentFilterText
    // would create a loop: segmentFilterText → editingMultiValues →
    // initialValues → checkedValues → buildingMultiValue → setSegmentFilterText.
    const values = Array.isArray(editingCondition.value)
      ? editingCondition.value
      : editingCondition.value != null
        ? [editingCondition.value]
        : [];
    if (editingCondition.error && selectedField && hasStaticAllowlist(selectedField)) {
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

  const editingDateRange: [string, string] | undefined = (() => {
    if (
      !editingCondition ||
      selectedOperator !== 'between' ||
      selectedField?.type !== 'date' ||
      !Array.isArray(editingCondition.value) ||
      editingCondition.value.length < 2
    )
      return undefined;
    return [String(editingCondition.value[0]), String(editingCondition.value[1])];
  })();

  const buildingValue = (() => {
    if (buildingMultiValue) return buildingMultiValue;
    if (dateRangeFromValue && selectedOperator === 'between') {
      return `${getDateDisplayLabel(dateRangeFromValue)} – ...`;
    }
    // Placeholder makes no-value chip look complete before auto-commit.
    if (selectedOperator && isNoValueOperator(selectedOperator)) return NO_VALUE_PLACEHOLDER;
    return undefined;
  })();

  // While building the paired second value, the base triplet is stashed and the
  // active field/operator drive the *pair* segment — so render base from the
  // stash and pair from the live selection. Keeps it one building chip.
  const buildingChipData: BuildingChipData | null = !isBuilding
    ? null
    : buildingSide === 1 && buildingBase
      ? {
          attribute: buildingBase.field.label,
          operator: buildingBase.operator
            ? getOperatorLabel(buildingBase.operator, buildingBase.field.type)
            : undefined,
          value: displayBaseValue(buildingBase.value, buildingBase.field),
          pair: {
            attribute: selectedField!.label,
            operator: selectedOperator
              ? getOperatorLabel(selectedOperator, selectedField!.type)
              : undefined,
            value: buildingValue,
          },
        }
      : {
          attribute: selectedField!.label,
          operator: selectedOperator
            ? getOperatorLabel(selectedOperator, selectedField!.type)
            : undefined,
          value: buildingValue,
        };

  return {
    isBuilding,
    buildingChipData,
    editingMultiValues,
    editingSingleValue,
    editingDateRange,
  };
};
