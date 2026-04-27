import type { FieldMetadata, FieldValueOption } from '../types';

/**
 * Find an option in `field.values` matching the given value, using stringified
 * comparison. Loose-match is required because parser/serializer round-trip
 * coerces typed primitives to strings (e.g. integer field value `5` → string
 * `"5"` after `(field = "5")` parses back), and strict `===` would miss the
 * canonical option. Returns undefined when there is no match or the field
 * has no `values` allowlist.
 */
export const findOptionByValue = (
  field: FieldMetadata | undefined,
  value: string | number | boolean | null | undefined,
): FieldValueOption | undefined => {
  if (!field?.values || value == null) return undefined;
  const key = String(value);
  return field.values.find(opt => String(opt.value) === key);
};

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
