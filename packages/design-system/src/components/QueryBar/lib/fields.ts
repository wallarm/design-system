import type { FieldMetadata, FieldValueOption } from '../types';

/**
 * Get normalized value options for a field.
 * Merges `values` (full FieldValueOption[]) with `options` (string[] shorthand).
 * `options` strings are converted to `{ value: s, label: s }`.
 */
export const getFieldValues = (field: FieldMetadata): FieldValueOption[] => {
  const fromValues = field.values ?? [];
  const fromOptions = field.options?.map(s => ({ value: s, label: s })) ?? [];
  return fromValues.length > 0 ? fromValues : fromOptions;
};

/**
 * Check if a field has predefined values (from `values` or `options`).
 * Returns false for freeform fields (`options: []` or no values at all).
 */
export const hasFieldValues = (field: FieldMetadata): boolean =>
  getFieldValues(field).length > 0;
