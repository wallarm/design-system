// data-measure/data-row are the contract between ParameterPathRow (sets them)
// and useParameterPathTruncation (reads them) — keep both sides on these.
export const MEASURE = {
  method: 'method',
  joint: 'joint',
  segment: 'segment',
  encoding: 'encoding',
  ellipsis: 'ellipsis',
} as const;

export const ROW = {
  visible: 'visible',
  measure: 'measure',
} as const;

// Keys that toggle an interactive (truncated + expandable) path.
export const EXPAND_KEYS: readonly string[] = ['Enter', ' '];
