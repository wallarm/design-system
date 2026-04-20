import type { BadgeColor } from '../../Badge';
import type { FieldValueOption } from '../types';

const VALID_MASK_ROOTS = new Set(['1', '2', '3', '4', '5']);

const HTTP_CLASS_BADGE_COLOR: Record<string, BadgeColor> = {
  '1': 'slate',
  '2': 'green',
  '3': 'blue',
  '4': 'amber',
  '5': 'red',
};

export interface StatusCodeSuggestionsOptions {
  /**
   * Raw backend status-code list. The helper keeps only 1-char entries in
   * `[1..5]` as mask roots; everything else is ignored. When omitted or empty,
   * the helper returns `[]` for every input.
   */
  codes?: string[];
}

/**
 * Build a validator that matches the same legal shapes the suggestion list
 * proposes: a 3-character status code or mask whose leading digit is one of
 * the configured `maskRoots`. Accepts `NNN`, `NNX`, or `NXX`. Returns `true`
 * when the value is invalid (matching the `FieldMetadata.validate` contract).
 */
export const createStatusCodeValidator = (
  options?: StatusCodeSuggestionsOptions,
): ((value: string | number | boolean) => boolean) => {
  const maskRoots = (options?.codes ?? []).filter(c => c.length === 1 && VALID_MASK_ROOTS.has(c));
  return value => {
    const s = String(value);
    if (s.length !== 3) return true;
    if (!maskRoots.includes(s.charAt(0))) return true;
    // positions 2-3: either both 'X' (NXX), digit + 'X' (NNX), or both digits (NNN)
    return !/^(XX|\dX|\d\d)$/.test(s.slice(1));
  };
};

export const createStatusCodeSuggestions = (
  options?: StatusCodeSuggestionsOptions,
): ((
  inputText: string,
  context?: { selectedValues?: Array<string | number | boolean> },
) => FieldValueOption[]) => {
  const maskRoots = (options?.codes ?? []).filter(c => c.length === 1 && VALID_MASK_ROOTS.has(c));

  const makeMask = (label: string): FieldValueOption => {
    const color = HTTP_CLASS_BADGE_COLOR[label.charAt(0)];
    if (!color) {
      // Unreachable — makeMask is only called with labels whose leading digit
      // came from maskRoots (filtered to [1..5] at factory time).
      throw new Error(`statusCodeSuggestions: no badge color for mask "${label}"`);
    }
    return {
      value: label,
      label,
      badge: { color, text: label },
    };
  };

  /** Build FieldValueOptions for already-committed chip values so the menu can
   *  render them with their canonical badge even when the input-driven list
   *  has narrowed to masks. Skips anything that isn't a valid status code. */
  const resolveSelected = (selectedValues?: Array<string | number | boolean>): FieldValueOption[] =>
    (selectedValues ?? [])
      .map(v => String(v))
      .filter(s => /^\d[\dX]{0,2}$/.test(s) && maskRoots.includes(s.charAt(0)))
      .map(s => makeMask(s));

  return (inputText, context) => {
    const norm = inputText.trim();
    const selected = resolveSelected(context?.selectedValues);
    const seen = new Set(selected.map(o => String(o.value)));
    const merge = (primary: FieldValueOption[]): FieldValueOption[] => [
      ...selected,
      ...primary.filter(o => !seen.has(String(o.value))),
    ];

    if (norm.length > 3) return selected;
    if (norm.length > 0 && !/^\d+$/.test(norm)) return selected;

    if (norm.length === 0) {
      return merge(maskRoots.map(d => makeMask(`${d}XX`)));
    }

    const d1 = norm.charAt(0);
    if (!maskRoots.includes(d1)) return selected;

    if (norm.length === 1) return merge([makeMask(`${norm}XX`)]);
    if (norm.length === 2) return merge([makeMask(`${norm}X`)]);
    if (norm.length === 3) return merge([makeMask(norm)]);
    return selected;
  };
};
