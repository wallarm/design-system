import type { Condition, FieldMetadata, FieldValueOption } from '../types';
import { getFieldValues, hasStaticAllowlist } from './fields';

/** Find a field value option matching by label or value (case-insensitive) */
export const findMatchingFieldValue = (fieldValues: FieldValueOption[], text: string) =>
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
  // A custom validator trumps the static-allowlist check.
  if (field.validate) {
    return values.reduce<number[]>((acc, v, idx) => {
      if (field.validate!(v)) acc.push(idx);
      return acc;
    }, []);
  }
  if (!hasStaticAllowlist(field)) return [];
  const fv = getFieldValues(field);
  if (fv.length === 0) return [];
  return values.reduce<number[]>((acc, v, idx) => {
    if (!isValidFieldValue(fv, v)) acc.push(idx);
    return acc;
  }, []);
};

/** Check if condition value(s) are valid for the given field. Returns true if error. */
export const validateValueForField = (field: FieldMetadata, value: Condition['value']): boolean => {
  // Null value (no-value operators) is always valid.
  if (value == null) return false;
  const values = Array.isArray(value) ? value : [value];
  return getInvalidValueIndices(field, values).length > 0;
};
