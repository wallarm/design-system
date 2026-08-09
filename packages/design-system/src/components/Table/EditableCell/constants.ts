/**
 * Spread onto an editable column's `meta` so `EditableTextCell` /
 * `EditableSelectCell` can own the whole body cell:
 *
 * - `p-0` removes the body-cell padding (the shell re-applies its own), so the
 *   hover fill and the editing border reach the cell edges.
 * - `h-[1px]` gives the cell a definite height. A percentage height (`h-full`
 *   on the shell) only resolves against a parent with a resolvable height; a
 *   bare table cell is `height: auto`, so the shell would sit top-aligned and
 *   leave a gap. The `1px` acts as a minimum the row grows past, and the
 *   shell's `h-full` then resolves against the real row height (the standard
 *   "fill a table-cell height" trick).
 *
 * Use on a NON-master column — the first/master column is pinned, cut and
 * truncated by the Table and is not a clean host for a full-bleed editable cell.
 */
export const EDITABLE_CELL_COLUMN_META = { cellClassName: 'h-[1px] p-0' } as const;
