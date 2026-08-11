/** The valid status-code class roots, used both for suggestion-building and
 *  validation. `1`–`5` are the standard HTTP classes; `0` is Wallarm's
 *  "no HTTP response captured" class (the backend publishes `status_code=0`,
 *  shown as the `0XX` mask). Entirely frontend-driven, independent of what the
 *  backend config carries.
 *
 *  Typed as `readonly string[]` (not `as const`) so `.includes(someString)`
 *  stays callable without casting; declaration-file generation rejects the
 *  tuple-narrowed overload of `.includes`. */
export const MASK_ROOTS: readonly string[] = ['0', '1', '2', '3', '4', '5'];

/** Fixed length of a status-code value (mask or concrete). Exposed as a
 *  constant so downstream helpers stay in sync. */
export const STATUS_CODE_LENGTH = 3;

/** Placeholder character used inside masks (e.g. the `X` in `4XX`). */
export const MASK_PLACEHOLDER = 'X';
