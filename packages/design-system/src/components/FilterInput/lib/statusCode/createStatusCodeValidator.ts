import { MASK_ROOTS, STATUS_CODE_LENGTH } from './utils';

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
 */
export const createStatusCodeValidator = (): ((value: string | number | boolean) => boolean) => {
  return value => {
    const s = String(value);
    if (s.length !== STATUS_CODE_LENGTH) return true;
    if (!MASK_ROOTS.includes(s.charAt(0))) return true;
    return !/^(XX|\dX|\d\d)$/.test(s.slice(1));
  };
};
