import type { FieldMetadata, FieldValueOption } from '../types';

/**
 * A **group** value option: a presentational node with nested `children` and no
 * committable `value` of its own. Discriminated by the presence of `children`.
 */
export const isValueGroup = (
  option: FieldValueOption | undefined,
): option is FieldValueOption & { children: FieldValueOption[] } => Array.isArray(option?.children);

/**
 * Recursively flatten value options to their committable **leaves** (options
 * without `children`). Section headers and parent categories are dropped —
 * only leaves carry a `value` that can reach the expression.
 */
export const collectLeaves = (options: FieldValueOption[] | undefined): FieldValueOption[] => {
  if (!options) return [];
  const leaves: FieldValueOption[] = [];
  for (const option of options) {
    if (isValueGroup(option)) leaves.push(...collectLeaves(option.children));
    else leaves.push(option);
  }
  return leaves;
};

/**
 * Find a leaf option matching `value` within an option tree (recursing into
 * groups). Loose (stringified) match — parser/serializer round-trip stringifies
 * typed primitives (5 → "5") and strict === would miss the canonical option.
 */
const findLeafInOptions = (
  options: FieldValueOption[] | undefined,
  key: string,
): FieldValueOption | undefined => {
  if (!options) return undefined;
  for (const option of options) {
    if (isValueGroup(option)) {
      const found = findLeafInOptions(option.children, key);
      if (found) return found;
    } else if (String(option.value) === key) {
      return option;
    }
  }
  return undefined;
};

/**
 * Find an option in `field.values` matching the value (stringified compare),
 * recursing into nested groups so submenu leaves resolve too.
 */
export const findOptionByValue = (
  field: FieldMetadata | undefined,
  value: string | number | boolean | null | undefined,
): FieldValueOption | undefined => {
  if (!field?.values || value == null) return undefined;
  return findLeafInOptions(field.values, String(value));
};

/**
 * Find a value's human label across *all* fields' option lists (recursing into
 * nested groups). Used when a value isn't defined on its current field (e.g.
 * after a field change) but its label still lives on the field it came from, so
 * the chip and the value menu can both show the label instead of the raw value.
 */
export const findValueLabelInFields = (
  value: string | number | boolean | null | undefined,
  fields: FieldMetadata[],
): string | undefined => {
  if (value == null) return undefined;
  const key = String(value);
  for (const f of fields) {
    const opt = findLeafInOptions(f.values, key);
    if (opt) return opt.label;
  }
  return undefined;
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
 * fields and `strictValues: false` fields return false — their list is a
 * hint, not a strict allowlist.
 */
export const hasStaticAllowlist = (field: FieldMetadata): boolean => {
  if (field.strictValues === false) return false;
  if (field.getSuggestions) return false;
  if ((field.values?.length ?? 0) > 0) return true;
  return (field.options?.length ?? 0) > 0;
};
