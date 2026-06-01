/**
 * `data-measure` slot names tag elements in the offscreen measurement row so
 * {@link useParameterPathTruncation} can read their widths via `querySelector`.
 * They are the contract between the rendered row (`ParameterPathRow`) and the
 * truncation hook — both sides must import from here so a rename can't silently
 * break width measurement.
 */
export const MEASURE = {
  method: 'method',
  joint: 'joint',
  segment: 'segment',
  encoding: 'encoding',
} as const;

/**
 * `data-row` markers distinguishing the visible row from the offscreen
 * measurement row. E2E tests scope text queries with these (the measurement row
 * always renders every segment, so a global query would match its hidden copy).
 */
export const ROW = {
  visible: 'visible',
  measure: 'measure',
} as const;

/** Keys that toggle an interactive (truncated + expandable) path. */
export const EXPAND_KEYS: readonly string[] = ['Enter', ' '];
