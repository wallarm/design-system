export const TABLE_SKELETON_ROWS = 6;
export const TABLE_SKELETON_ROWS_APPEND = 6;
export const TABLE_VIRTUALIZATION_OVERSCAN = 5;
export const TABLE_MIN_COLUMN_WIDTH = 96;

export const TABLE_SELECT_COLUMN_ID = '_selection';
export const TABLE_SELECT_COLUMN_WIDTH = 33;

export const TABLE_EXPAND_COLUMN_ID = '_expand';
export const TABLE_EXPAND_COLUMN_WIDTH = 33;

/** Sort labels by sortType: [ascLabel, descLabel] */
export const SORT_LABELS: Record<string, [string, string]> = {
  text: ['A \u2192 Z', 'Z \u2192 A'],
  number: ['Highest on top', 'Lowest on top'],
  date: ['Newest on top', 'Oldest on top'],
  duration: ['Longest on top', 'Shortest on top'],
  score: ['Highest on top', 'Lowest on top'],
  boolean: ['Yes on top', 'No on top'],
  version: ['Latest on top', 'Earliest on top'],
  severity: ['Most critical on top', 'Least critical on top'],
  size: ['Largest on top', 'Smallest on top'],
};
