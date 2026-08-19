import {
  aggregationFn_count,
  aggregationFn_extent,
  aggregationFn_first,
  aggregationFn_last,
  aggregationFn_max,
  aggregationFn_mean,
  aggregationFn_median,
  aggregationFn_min,
  aggregationFn_sum,
  aggregationFn_unique,
  aggregationFn_uniqueCount,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * Fixed feature set for this component. getCoreRowModel is automatic in v9
 * and must not be listed here. Every other feature this Table supports
 * (sorting, grouping, expanding, selection, pinning, ordering, visibility,
 * sizing, resizing, aggregation) must be registered explicitly — v9 has no
 * "everything on by default" mode.
 *
 * `sortFns`/`aggregationFns` are opt-in registries: without them, v9's
 * built-in name resolution (including `sortFn: 'auto'` and named
 * `aggregationFn`s like `'sum'`) silently falls back to `sortFn_basic` or
 * `undefined` instead of resolving the intended built-in. Individual
 * `sortFn_*`/`aggregationFn_*` functions are imported (rather than the
 * deprecated `sortFns`/`aggregationFns` registry exports) to keep tree-shaking
 * intact, matching v8's built-in sorting/aggregation function set.
 */
export const dsTableFeatures = tableFeatures({
  rowSortingFeature,
  columnGroupingFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSelectionFeature,
  columnPinningFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature,
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  aggregationFns: {
    count: aggregationFn_count,
    extent: aggregationFn_extent,
    first: aggregationFn_first,
    last: aggregationFn_last,
    max: aggregationFn_max,
    mean: aggregationFn_mean,
    median: aggregationFn_median,
    min: aggregationFn_min,
    sum: aggregationFn_sum,
    unique: aggregationFn_unique,
    uniqueCount: aggregationFn_uniqueCount,
  },
  sortedRowModel: createSortedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
});

export type DSTableFeatures = typeof dsTableFeatures;
