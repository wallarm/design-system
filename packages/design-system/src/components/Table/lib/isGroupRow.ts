import type { Row, RowData } from '@tanstack/react-table';
import type { DSTableFeatures } from './dsTableFeatures';

/**
 * Whether a row renders as a group parent: it has sub-rows, or — with
 * `showEmptyGroups` — it is a top-level row whose `getSubRows` returned an
 * array, empty or not.
 */
export const isGroupRow = <T extends RowData>(
  row: Row<DSTableFeatures, T>,
  showEmptyGroups: boolean,
): boolean =>
  row.subRows.length > 0 ||
  (showEmptyGroups && row.depth === 0 && row.originalSubRows !== undefined);
