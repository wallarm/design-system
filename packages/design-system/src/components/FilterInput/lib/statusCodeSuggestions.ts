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
 * Per-character input filter for the HTTP status code field. Accepts only
 * digits and the `X` mask marker (case-insensitive). Meant to be wired to
 * `FieldMetadata.acceptChar` so typing in the value segment is constrained.
 */
export const createStatusCodeInputFilter = (): ((char: string) => boolean) => {
  return c => /^[0-9xX]$/.test(c);
};

/**
 * Commit-time normalizer for the HTTP status code field. Pads partial input
 * to three characters and uppercases the mask marker:
 *   - "2"  → "2XX"
 *   - "22" → "22X"
 *   - "2x" → "2XX"
 *   - "222", "4XX", "40X" → unchanged (already 3 chars)
 * Leaves anything unrecognised alone so `validate` can still flag it.
 */
export const createStatusCodeNormalizer = (): ((
  value: string | number | boolean,
) => string | number | boolean) => {
  return value => {
    if (typeof value !== 'string' && typeof value !== 'number') return value;
    const s = String(value).toUpperCase();
    if (!/^\d[0-9X]{0,2}$/.test(s)) return value;
    if (s.length === 1) return `${s}XX`;
    if (s.length === 2) return `${s}X`;
    return s;
  };
};

/**
 * Build a validator for the HTTP status code field. Accepts only 3-character
 * values whose leading digit is a valid HTTP class (`[1..5]`) and whose
 * remaining two characters form one of:
 *   - `XX` (mask like `4XX`)
 *   - `dX` (narrowed mask like `40X`)
 *   - `dd` (concrete code like `401`)
 *
 * Returns `true` when the value is invalid, matching the
 * `FieldMetadata.validate` contract.
 *
 * The `options` argument is accepted for API symmetry with
 * `createStatusCodeSuggestions` (same wiring on the field), but validity is
 * bound to the static `[1..5]` HTTP class range rather than `codes` — the
 * backend's available-data list doesn't narrow what the user may legitimately
 * type.
 */
export const createStatusCodeValidator = (
  _options?: StatusCodeSuggestionsOptions,
): ((value: string | number | boolean) => boolean) => {
  return value => {
    const s = String(value);
    if (s.length !== 3) return true;
    if (!VALID_MASK_ROOTS.has(s.charAt(0))) return true;
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

  /**
   * Normalize the typed input into the canonical mask it represents, or
   * return `null` if the shape isn't a valid status-code fragment. Accepts
   * partial forms like "3", "3X", "3XX", "30", "30X", "301" (case-insensitive
   * on `X`). Rejects anything with an `X` followed by a digit, or a leading
   * digit outside `maskRoots`.
   */
  const canonicalize = (norm: string): string | null => {
    const s = norm.toUpperCase();
    if (s.length === 0 || s.length > 3) return null;
    if (!/^[\dX]+$/.test(s)) return null;
    const d1 = s.charAt(0);
    if (d1 === 'X' || !maskRoots.includes(d1)) return null;
    if (s.length === 1) return `${d1}XX`;
    const c2 = s.charAt(1);
    if (c2 === 'X') {
      // Once an X appears, only more X's may follow.
      if (s.length === 3 && s.charAt(2) !== 'X') return null;
      return `${d1}XX`;
    }
    if (s.length === 2) return `${d1}${c2}X`;
    const c3 = s.charAt(2);
    if (c3 === 'X') return `${d1}${c2}X`;
    return `${d1}${c2}${c3}`;
  };

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

    const mask = canonicalize(norm);
    if (!mask) return selected;
    return merge([makeMask(mask)]);
  };
};
