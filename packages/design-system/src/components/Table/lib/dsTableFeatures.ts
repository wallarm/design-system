import {
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * Fixed feature set for this component. getCoreRowModel is automatic in v9
 * and must not be listed here. Every other feature this Table supports
 * (sorting, grouping, expanding, selection, pinning, ordering, visibility,
 * sizing, resizing) must be registered explicitly — v9 has no "everything
 * on by default" mode.
 */
export const dsTableFeatures = tableFeatures({
  rowSortingFeature,
  columnGroupingFeature,
  rowExpandingFeature,
  rowSelectionFeature,
  columnPinningFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature,
  sortedRowModel: createSortedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
});

export type DSTableFeatures = typeof dsTableFeatures;
