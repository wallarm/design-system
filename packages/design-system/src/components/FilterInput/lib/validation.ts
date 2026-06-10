import type { Condition, FieldMetadata, FieldType, FieldValueOption } from '../types';
import { getFieldValues, hasStaticAllowlist } from './fields';

/**
 * Whether a value conforms to a field's data type. Used for freeform fields
 * (no allowlist, no validator) so a value left over from a previous field — e.g.
 * a string carried into an `integer` field after a field change — is caught.
 *
 * `string`, `date` and `enum` are not type-checked here: any string is a valid
 * string; date values include relative presets and ISO forms that are unsafe to
 * validate generically; enum validity comes from its allowlist.
 */
export const isValueOfType = (value: string | number | boolean, type: FieldType): boolean => {
  switch (type) {
    case 'integer': {
      if (typeof value === 'number') return Number.isInteger(value);
      const s = String(value).trim();
      return s !== '' && /^-?\d+$/.test(s);
    }
    case 'float': {
      if (typeof value === 'number') return Number.isFinite(value);
      const s = String(value).trim();
      return s !== '' && Number.isFinite(Number(s));
    }
    case 'boolean': {
      if (typeof value === 'boolean') return true;
      const s = String(value).trim().toLowerCase();
      return s === 'true' || s === 'false';
    }
    default:
      return true;
  }
};

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
  if (!hasStaticAllowlist(field)) {
    // Dynamic (getSuggestions) fields are consumer-owned — their list is a hint,
    // not an allowlist — so no value is flagged.
    if (field.getSuggestions) return [];
    // Plain freeform field: validate each value against the field's data type.
    return values.reduce<number[]>((acc, v, idx) => {
      if (v != null && !isValueOfType(v, field.type)) acc.push(idx);
      return acc;
    }, []);
  }
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
