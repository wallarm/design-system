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

/** Returns the category bucket for a given numeric or string status code. */
export const getResponseCodeCategory = (code: number | string): ResponseCodeCategory => {
  const numeric = typeof code === 'number' ? code : Number.parseInt(code, 10);
  if (!Number.isFinite(numeric)) return 'unknown';
  if (numeric >= 100 && numeric < 200) return 'informational';
  if (numeric >= 200 && numeric < 300) return 'success';
  if (numeric >= 300 && numeric < 400) return 'redirection';
  if (numeric >= 400 && numeric < 500) return 'client-error';
  if (numeric >= 500 && numeric < 600) return 'server-error';
  return 'unknown';
};
