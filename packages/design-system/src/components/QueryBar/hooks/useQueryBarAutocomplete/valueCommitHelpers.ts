import { chipIdToConditionIndex, getFieldValues, isDatePreset } from '../../lib';
import type { Condition, FieldMetadata, FieldValueOption, FilterOperator } from '../../types';

/** Find a field value option matching by label or value (case-insensitive) */
const findMatchingFieldValue = (fieldValues: FieldValueOption[], text: string) =>
  fieldValues.find(
    v =>
      v.label.toLowerCase() === text.toLowerCase() ||
      String(v.value).toLowerCase() === text.toLowerCase(),
  );

/** Check if a single value matches any option in the field's values list */
export const isValidFieldValue = (
  fieldValues: FieldValueOption[],
  v: string | number | boolean,
): boolean =>
  fieldValues.some(
    opt => opt.value === v || String(opt.value).toLowerCase() === String(v).toLowerCase(),
  );

/** Return indices of values that don't match any field option. Empty array = all valid. */
export const getInvalidValueIndices = (
  field: FieldMetadata,
  values: Array<string | number | boolean>,
): number[] => {
  const fv = getFieldValues(field);
  if (fv.length === 0) return [];
  return values.reduce<number[]>((acc, v, idx) => {
    if (!isValidFieldValue(fv, v)) acc.push(idx);
    return acc;
  }, []);
};

/** Check if condition value(s) are valid for the given field. Returns true if error. */
export const validateValueForField = (field: FieldMetadata, value: Condition['value']): boolean => {
  // Null value (no-value operators) is always valid
  if (value == null) return false;
  const values = Array.isArray(value) ? value : [value];
  return getInvalidValueIndices(field, values).length > 0;
};

/** Resolve a text input to the actual field value (e.g. label "Active" → value "active") */
export const resolveFieldValue = (
  field: FieldMetadata,
  text: string,
): string | number | boolean => {
  const match = findMatchingFieldValue(getFieldValues(field), text);
  return match ? match.value : text;
};

/** Resolve and validate a single-select value from text */
export const resolveSingleValue = (
  field: FieldMetadata,
  trimmed: string,
): { resolved: string | number | boolean; error: boolean | undefined } => {
  const fv = getFieldValues(field);
  const match = findMatchingFieldValue(fv, trimmed);
  return {
    resolved: match ? match.value : trimmed,
    error: fv.length > 0 && !match ? true : undefined,
  };
};

/** Resolve and validate multi-select values from comma-separated text */
export const resolveMultiValues = (
  field: FieldMetadata,
  trimmed: string,
): { resolved: Array<string | number | boolean>; error: boolean | undefined } => {
  const parts = trimmed
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const resolved = parts.map(part => resolveFieldValue(field, part));
  const error = getInvalidValueIndices(field, resolved).length > 0 ? true : undefined;
  return { resolved, error };
};

/** Validate and resolve a date value from text */
export const resolveDateValue = (
  trimmed: string,
  editingChipId: string | null,
  conditions: Condition[],
): { error: boolean | undefined; dateOrigin: 'relative' | 'absolute' | undefined } => {
  let error: boolean | undefined;
  let dateOrigin: 'relative' | 'absolute' | undefined;

  if (editingChipId) {
    const idx = chipIdToConditionIndex(editingChipId);
    const oldCondition = idx !== null ? conditions[idx] : null;
    if (oldCondition) {
      const oldVal = String(oldCondition.value ?? '');
      dateOrigin = oldCondition.dateOrigin ?? (isDatePreset(oldVal) ? 'relative' : 'absolute');
    }
  }
  const isValidPreset = isDatePreset(trimmed);
  // Reject short strings that Date() parses loosely (e.g. '2' → 2001-02-01)
  const isValidDate =
    !isValidPreset && trimmed.length >= 6 && !Number.isNaN(new Date(trimmed).getTime());
  if (!isValidPreset && !isValidDate) error = true;

  return { error, dateOrigin };
};
