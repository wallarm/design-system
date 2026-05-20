import type { FieldMetadata, FieldValueOption } from '../types';

/**
 * Find an option in `field.values` matching the value (stringified compare).
 * Loose-match needed because parser/serializer round-trip stringifies typed
 * primitives (5 → "5") and strict === would miss the canonical option.
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
 * Get value options for a field — priority: getSuggestions > values > options.
 * `context.selectedValues` lets helpers preserve a committed value's badge
 * style once suggestions have narrowed.
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
 * True if a field has any value suggestions (dynamic, values, or options).
 * Decides whether to render a value dropdown. getSuggestions always yields one.
 */
export const hasFieldValues = (field: FieldMetadata): boolean => {
  if (field.getSuggestions) return true;
  if ((field.values ?? []).length > 0) return true;
  return (field.options?.length ?? 0) > 0;
};

/**
 * True if the field has an exhaustive static allowlist. getSuggestions
 * fields return false — their list is a hint, not a strict allowlist.
 */
export const hasStaticAllowlist = (field: FieldMetadata): boolean => {
  if (field.getSuggestions) return false;
  if ((field.values?.length ?? 0) > 0) return true;
  return (field.options?.length ?? 0) > 0;
};
