import { VALID_MASK_ROOTS } from './constants';

/** Extract the HTTP class digits (`1`..`5`) that actually appear as single-
 *  character entries in the backend `codes` list. These become the "available"
 *  class masks the helper is willing to emit. */
export const getMaskRoots = (codes: string[] | undefined): string[] =>
  (codes ?? []).filter(c => c.length === 1 && VALID_MASK_ROOTS.has(c));
