import type { FieldValueOption } from '../types';

const VALID_MASK_ROOTS = new Set(['1', '2', '3', '4', '5']);

export interface StatusCodeSuggestionsOptions {
  /**
   * Raw backend status-code list. The helper keeps only 1-char entries in
   * `[1..5]` as mask roots; everything else is ignored. When omitted or empty,
   * the helper returns `[]` for every input.
   */
  codes?: string[];
}

export const createStatusCodeSuggestions = (
  options?: StatusCodeSuggestionsOptions,
): ((inputText: string) => FieldValueOption[]) => {
  const maskRoots = (options?.codes ?? []).filter(c => c.length === 1 && VALID_MASK_ROOTS.has(c));

  const makeMask = (label: string): FieldValueOption => ({
    value: label,
    label,
  });

  return (inputText: string): FieldValueOption[] => {
    const norm = inputText.trim();
    if (norm.length === 0) {
      return maskRoots.map(d => makeMask(`${d}XX`));
    }
    if (norm.length === 1) {
      return maskRoots.includes(norm) ? [makeMask(`${norm}XX`)] : [];
    }
    if (norm.length === 2) {
      const d1 = norm[0];
      return maskRoots.includes(d1) ? [makeMask(`${norm}X`)] : [];
    }
    return [];
  };
};
