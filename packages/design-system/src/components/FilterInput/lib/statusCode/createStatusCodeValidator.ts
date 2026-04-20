import { STATUS_CODE_LENGTH, type StatusCodeSuggestionsOptions, VALID_MASK_ROOTS } from './utils';

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
    if (s.length !== STATUS_CODE_LENGTH) return true;
    if (!VALID_MASK_ROOTS.has(s.charAt(0))) return true;
    return !/^(XX|\dX|\d\d)$/.test(s.slice(1));
  };
};
