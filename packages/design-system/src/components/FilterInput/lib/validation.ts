import { isDatePreset } from '../FilterInputMenu/FilterInputDateValueMenu/constants';
import type { Condition, FieldMetadata, FieldType, FieldValueOption } from '../types';
import { getFieldValues, hasStaticAllowlist } from './fields';

/**
 * Whether a value conforms to a field's data type. Catches a value left over
 * from a previous field — e.g. a host string carried into a `date` field after
 * a field change.
 *
 * `string` and `enum` are not type-checked: any string is a valid string, and
 * enum validity comes from its allowlist. `date` accepts a relative preset
 * (`7d`, `1h`, …) or any value `Date` can parse (ISO etc.).
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
    case 'date': {
      const s = String(value).trim();
      if (s === '') return false;
      // Note: a bare numeric string ("2026", "12") parses as a valid Date, so
      // numeric-only values aren't flagged here — the target case is a text
      // value (e.g. a host string) carried into a date field.
      return isDatePreset(s) || !Number.isNaN(new Date(s).getTime());
    }
    default:
      return true;
  }
};

/**
 * Whether a chip/menu may borrow a value's human label from *another* field's
 * options. Only consulted when the current field doesn't define the value
 * itself.
 *
 * Borrowing is allowed only for a value that is *foreign* to the current field —
 * one that fails the field's own type/allowlist validation. Such a value cannot
 * have been entered into this field directly, so it was carried over from the
 * field it came from (after a field change) and keeps that field's label
 * (AS-1085, AS-1134). A value that is *valid* for the current field is a genuine
 * user entry (e.g. `1` typed into the freeform `total_requests` field) and must
 * never be relabelled from an unrelated field that happens to define the same
 * value — even on untyped string/enum fields (AS-1171).
 *
 * An unknown field can't validate, so its values may always borrow.
 */
export const canBorrowCrossFieldLabel = (
  field: FieldMetadata | null | undefined,
  value: string | number | boolean | null | undefined,
): boolean => {
  if (value == null) return false;
  if (!field) return true;
  return validateValueForField(field, value);
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

/**
 * Return indices of invalid values. Empty array = all valid.
 *
 * Validation runs in two stages: first the value's data type, then — only if
 * the type matches — membership in the field's options (when it has any). So a
 * value can fail either because it's the wrong type (e.g. a string in a `date`
 * field) or because it's the right type but not one of the allowed options.
 */
export const getInvalidValueIndices = (
  field: FieldMetadata,
  values: Array<string | number | boolean>,
): number[] => {
  // A custom validator trumps every built-in check.
  if (field.validate) {
    return values.reduce<number[]>((acc, v, idx) => {
      if (field.validate!(v)) acc.push(idx);
      return acc;
    }, []);
  }
  // Dynamic (getSuggestions) fields are consumer-owned — their list is a hint,
  // not an allowlist — so nothing is flagged.
  if (field.getSuggestions) return [];

  const allowlist = hasStaticAllowlist(field) ? getFieldValues(field) : null;
  return values.reduce<number[]>((acc, v, idx) => {
    if (v == null) return acc;
    // 1) Data type.
    if (!isValueOfType(v, field.type)) {
      acc.push(idx);
      return acc;
    }
    // 2) Allowlist membership, when the field defines options.
    if (allowlist && allowlist.length > 0 && !isValidFieldValue(allowlist, v)) {
      acc.push(idx);
    }
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
