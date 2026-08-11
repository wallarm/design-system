import { getResponseCodeCategory, RESPONSE_CODE_COLOR } from '../../../../ResponseCode';
import type { FieldValueOption } from '../../../types';

/** Build a `FieldValueOption` for a status-code mask or concrete code. Badge
 *  color is derived via the shared `ResponseCode` primitive so the two stay
 *  in sync.
 *
 *  The `0XX` class (Wallarm's "no HTTP response captured", backend
 *  `status_code=0`) has no standard HTTP category, so it renders as a neutral
 *  slate pill. Any other value outside the `1XX–5XX` classes throws — this is
 *  unreachable in practice because callers gate on `MASK_ROOTS`, but the check
 *  is kept as a safety net so a future refactor can't silently emit a
 *  colorless pill. */
export const makeMask = (label: string): FieldValueOption => {
  const category = getResponseCodeCategory(label);
  if (category === 'unknown') {
    if (label.startsWith('0')) {
      return {
        value: label,
        label,
        badge: { color: RESPONSE_CODE_COLOR.unknown, text: label },
      };
    }
    throw new Error(`statusCode: no badge color for mask "${label}"`);
  }
  return {
    value: label,
    label,
    badge: { color: RESPONSE_CODE_COLOR[category], text: label },
  };
};
