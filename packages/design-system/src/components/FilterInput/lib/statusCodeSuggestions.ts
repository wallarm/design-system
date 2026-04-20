import type { FieldValueOption } from '../types';

const VALID_MASK_ROOTS = new Set(['1', '2', '3', '4', '5']);

const HTTP_CLASS_BADGE_COLOR: Record<string, string> = {
  '1': 'var(--color-bg-light-success)',
  '2': 'var(--color-bg-success)',
  '3': 'var(--color-bg-info)',
  '4': 'var(--color-bg-warning)',
  '5': 'var(--color-bg-danger)',
};

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
    badge: {
      color: HTTP_CLASS_BADGE_COLOR[label.charAt(0)] ?? '',
      text: label,
    },
  });

  return (inputText: string): FieldValueOption[] => {
    const norm = inputText.trim();
    if (norm.length > 3) return [];
    if (norm.length > 0 && !/^\d+$/.test(norm)) return [];

    if (norm.length === 0) {
      return maskRoots.map(d => makeMask(`${d}XX`));
    }

    const d1 = norm.charAt(0);
    if (!maskRoots.includes(d1)) return [];

    if (norm.length === 1) return [makeMask(`${norm}XX`)];
    if (norm.length === 2) return [makeMask(`${norm}X`)];
    return [];
  };
};
