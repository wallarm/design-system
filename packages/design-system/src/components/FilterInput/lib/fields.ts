import type { FieldMetadata, FieldValueOption } from '../types';

/**
 * Get value options for a field.
 * Priority: `getSuggestions(inputText, context)` > `values` > `options` (converted to `{value, label}`).
 *
 * `context.selectedValues` is forwarded to `getSuggestions` so helpers can
 * include the currently-committed values in their output (e.g. to preserve a
 * badge style on a concrete code once suggestions have narrowed to masks).
 */
export const getFieldValues = (
  field: FieldMetadata,
  inputText: string = '',
  context?: { selectedValues?: Array<string | number | boolean> },
): FieldValueOption[] => {
  if (field.getSuggestions) return field.getSuggestions(inputText, context);
  const fromValues = field.values ?? [];
  if (fromValues.length > 0) return fromValues;
  return field.options?.map(s => ({ value: s, label: s })) ?? [];
};

/**
 * Check whether a field has a source of value suggestions — dynamic callback, static
 * `values`, or `options`. Used to decide whether to render a value dropdown at all.
 * Fields with `getSuggestions` always get a dropdown (empty list is still a list).
 */
export const hasFieldValues = (field: FieldMetadata): boolean => {
  if (field.getSuggestions) return true;
  if ((field.values ?? []).length > 0) return true;
  return (field.options?.length ?? 0) > 0;
};

/**
 * Whether the field has an exhaustive static allowlist of accepted values.
 * Used by validation code to decide whether to reject values outside the list.
 * Fields with `getSuggestions` return false — their suggestion list is a hint,
 * not an allowlist (consumer may accept freeform values that aren't currently suggested).
 */
export const hasStaticAllowlist = (field: FieldMetadata): boolean => {
  if (field.getSuggestions) return false;
  if ((field.values?.length ?? 0) > 0) return true;
  return (field.options?.length ?? 0) > 0;
};
