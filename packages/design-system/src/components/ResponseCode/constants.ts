import type { BadgeColor } from '../Badge';
import type { ResponseCodeCategory } from './types';

/**
 * Color mapping per Figma `responce-code` (`5665:38780`). Each HTTP response
 * status class maps to a Badge color expressing its semantics:
 * informational → neutral, success → green, redirection → blue,
 * client error → amber, server error → red. Anything outside the 100–599
 * range falls through to slate as the unknown category.
 */
export const RESPONSE_CODE_COLOR: Record<ResponseCodeCategory, BadgeColor> = {
  informational: 'slate',
  success: 'green',
  redirection: 'blue',
  'client-error': 'amber',
  'server-error': 'red',
  unknown: 'slate',
};

const CATEGORY_BY_LEADING_DIGIT: Record<string, ResponseCodeCategory> = {
  '1': 'informational',
  '2': 'success',
  '3': 'redirection',
  '4': 'client-error',
  '5': 'server-error',
};

/**
 * Returns the category bucket for a given numeric or string status code.
 * Recognizes:
 *   - exact numbers (`200`, `404`) via the standard 100–599 range
 *   - wildcard groups (`"2XX"`, `"4xx"`)
 *   - partial masks (`"40X"`, `"12X"`) used by FilterInput suggestions
 * Anything else falls through to `unknown`.
 */
export const getResponseCodeCategory = (code: number | string): ResponseCodeCategory => {
  // String inputs containing the `X` placeholder are treated as masks: the
  // category is decided by the leading digit and the rest is ignored.
  if (typeof code === 'string' && /[xX]/.test(code)) {
    const mask = code.trim().match(/^([1-5])[\dxX]*$/);
    if (mask?.[1]) return CATEGORY_BY_LEADING_DIGIT[mask[1]] ?? 'unknown';
    return 'unknown';
  }
  const numeric = typeof code === 'number' ? code : Number.parseInt(code, 10);
  if (!Number.isFinite(numeric)) return 'unknown';
  if (numeric >= 100 && numeric < 200) return 'informational';
  if (numeric >= 200 && numeric < 300) return 'success';
  if (numeric >= 300 && numeric < 400) return 'redirection';
  if (numeric >= 400 && numeric < 500) return 'client-error';
  if (numeric >= 500 && numeric < 600) return 'server-error';
  return 'unknown';
};
