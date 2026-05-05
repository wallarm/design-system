import { getResponseCodeCategory, RESPONSE_CODE_COLOR } from '../../../../ResponseCode';
import type { FieldValueOption } from '../../../types';

/** Build a `FieldValueOption` for a status-code mask or concrete code. Badge
 *  color is derived via the shared `ResponseCode` primitive so the two stay
 *  in sync. Throws if the input falls outside the 1XX–5XX classes — this is
 *  unreachable in practice because callers gate on `maskRoots`, but the check
 *  is kept as a safety net so a future refactor can't silently emit a
 *  colorless pill. */
export const makeMask = (label: string): FieldValueOption => {
  const category = getResponseCodeCategory(label);
  if (category === 'unknown') {
    throw new Error(`statusCode: no badge color for mask "${label}"`);
  }
  return {
    value: label,
    label,
    badge: { color: RESPONSE_CODE_COLOR[category], text: label },
  };
};
