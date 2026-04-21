import type { FieldValueOption } from '../../types';
import { canonicalizeStatusCodeInput, MASK_ROOTS, makeMask } from './utils';

/**
 * Build the `getSuggestions` callback for an HTTP status code field. The
 * returned function:
 *   - on empty input, offers every HTTP class mask (`1XX..5XX`)
 *   - on partial input (`"3"`, `"3X"`, `"30"`, …), expands it via
 *     `canonicalizeStatusCodeInput` and offers the single matching mask
 *   - merges any `context.selectedValues` (values already committed to the
 *     chip) in front of the input-driven output so they always appear with
 *     their canonical badge styling
 *
 * No backend config is required — the status-code class range is fixed to
 * `[1..5]` per the HTTP spec.
 */
export const createStatusCodeSuggestions = (): ((
  inputText: string,
  context?: { selectedValues?: Array<string | number | boolean> },
) => FieldValueOption[]) => {
  const resolveSelected = (selectedValues?: Array<string | number | boolean>): FieldValueOption[] =>
    (selectedValues ?? [])
      .map(v => String(v))
      .filter(s => /^\d[\dX]{0,2}$/.test(s) && MASK_ROOTS.includes(s.charAt(0)))
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
      return merge(MASK_ROOTS.map(d => makeMask(`${d}XX`)));
    }

    const mask = canonicalizeStatusCodeInput(norm);
    if (!mask) return selected;
    return merge([makeMask(mask)]);
  };
};
