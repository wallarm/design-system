import { MASK_PLACEHOLDER, STATUS_CODE_LENGTH } from './constants';

/**
 * Normalize the user-typed input (up to 3 chars, digits + X, case-insensitive)
 * into the canonical mask it represents. Returns `null` if the shape isn't a
 * valid status-code fragment.
 *
 * Accepted inputs:
 *   "3"   → "3XX"    (single digit pads to full class mask)
 *   "3X"  → "3XX"    (partial mask)
 *   "3XX" → "3XX"    (full mask)
 *   "30"  → "30X"    (two digits pad to narrowed mask)
 *   "30X" → "30X"    (full narrowed mask)
 *   "301" → "301"    (concrete code)
 *
 * Rejected:
 *   "3X0"            (digit after placeholder)
 *   "X30"            (starts with placeholder)
 *   "6..."           (leading digit not in `maskRoots`)
 *   "ab..."          (non-digit, non-X)
 */
export const canonicalizeStatusCodeInput = (input: string, maskRoots: string[]): string | null => {
  const s = input.toUpperCase();
  if (s.length === 0 || s.length > STATUS_CODE_LENGTH) return null;
  if (!/^[\dX]+$/.test(s)) return null;

  const d1 = s.charAt(0);
  if (d1 === MASK_PLACEHOLDER || !maskRoots.includes(d1)) return null;

  if (s.length === 1) return `${d1}XX`;

  const c2 = s.charAt(1);
  if (c2 === MASK_PLACEHOLDER) {
    // Once a placeholder appears, only more placeholders may follow.
    if (s.length === 3 && s.charAt(2) !== MASK_PLACEHOLDER) return null;
    return `${d1}XX`;
  }

  if (s.length === 2) return `${d1}${c2}X`;

  const c3 = s.charAt(2);
  if (c3 === MASK_PLACEHOLDER) return `${d1}${c2}X`;
  return `${d1}${c2}${c3}`;
};
