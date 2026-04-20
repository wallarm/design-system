import type { FieldValueOption } from '../../types';
import {
  canonicalizeStatusCodeInput,
  getMaskRoots,
  makeMask,
  type StatusCodeSuggestionsOptions,
} from './utils';

/**
 * Build the `getSuggestions` callback for an HTTP status code field. The
 * returned function:
 *   - reads the active `maskRoots` from `options.codes`
 *   - on empty input, offers every available class mask
 *   - on partial input (`"3"`, `"3X"`, `"30"`, …), expands it via
 *     `canonicalizeStatusCodeInput` and offers the single matching mask
 *   - merges any `context.selectedValues` (values already committed to the
 *     chip) in front of the input-driven output so they always appear with
 *     their canonical badge styling
 */
export const createStatusCodeSuggestions = (
  options?: StatusCodeSuggestionsOptions,
): ((
  inputText: string,
  context?: { selectedValues?: Array<string | number | boolean> },
) => FieldValueOption[]) => {
  const maskRoots = getMaskRoots(options?.codes);

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

    if (norm.length === 0) {
      return merge(maskRoots.map(d => makeMask(`${d}XX`)));
    }

    const mask = canonicalizeStatusCodeInput(norm, maskRoots);
    if (!mask) return selected;
    return merge([makeMask(mask)]);
  };
};
