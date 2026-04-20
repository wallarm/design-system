import type { FieldValueOption } from '../../types';
import { HTTP_CLASS_BADGE_COLOR } from './constants';

/** Build a `FieldValueOption` for a status-code mask or concrete code. Badge
 *  color is derived from the leading digit via `HTTP_CLASS_BADGE_COLOR`.
 *  Throws if the leading digit has no color mapping — this is unreachable in
 *  practice because callers gate on `maskRoots`, but the check is kept as a
 *  safety net so a future refactor can't silently emit a colorless pill. */
export const makeMask = (label: string): FieldValueOption => {
  const color = HTTP_CLASS_BADGE_COLOR[label.charAt(0)];
  if (!color) {
    throw new Error(`statusCode: no badge color for mask "${label}"`);
  }
  return {
    value: label,
    label,
    badge: { color, text: label },
  };
};
