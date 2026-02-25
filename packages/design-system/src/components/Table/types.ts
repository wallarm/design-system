import type { ReactNode } from 'react';
import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // biome-ignore lint/correctness/noUnusedVariables: TanStack Table augmentation requires matching generic parameter name
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
    /** Sort label type — controls the wording in the sort submenu */
    sortType?:
      | 'text'
      | 'number'
      | 'date'
      | 'duration'
      | 'score'
      | 'boolean'
      | 'version'
      | 'severity'
      | 'size';
  }
}

// ---------------------------------------------------------------------------
// Public API types — consumers use these instead of @tanstack/react-table
// ---------------------------------------------------------------------------

/** Virtualization mode */
export type TableVirtualized = 'container' | 'window';

/** Sorting state: array of `{ id, desc }` */
export type TableSortingState = { id: string; desc: boolean }[];

/** Row selection state: `{ [rowId]: boolean }` */
export type TableRowSelectionState = Record<string, boolean>;

/** Column sizing state: `{ [columnId]: number }` */
export type TableColumnSizingState = Record<string, number>;

/** Column pinning state */
export type TableColumnPinningState = { left?: string[]; right?: string[] };

/** Expanded state: `true` (all) or `{ [rowId]: boolean }` */
export type TableExpandedState = true | Record<string, boolean>;

/** Grouping state: array of column IDs */
export type TableGroupingState = string[];

/** Column visibility state: `{ [columnId]: boolean }` */
export type TableVisibilityState = Record<string, boolean>;

/** State updater — value or functional update */
export type TableUpdater<T> = T | ((prev: T) => T);

/** onChange callback */
export type TableOnChangeFn<T> = (updaterOrValue: TableUpdater<T>) => void;

/** Public row interface — structural subset of TanStack Row<T> */
export interface TableRow<T> {
  id: string;
  original: T;
  subRows: TableRow<T>[];
  getIsExpanded: () => boolean;
  getToggleExpandedHandler: () => () => void;
  getIsSelected: () => boolean;
  getToggleSelectedHandler: () => (event: unknown) => void;
  getIsGrouped: () => boolean;
}

/** Public cell context — structural subset of TanStack CellContext<T, V> */
export interface TableCellContext<T, V> {
  getValue: () => V;
  row: TableRow<T>;
}

/** Column meta — mirrors the ColumnMeta augmentation */
export interface TableColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
  sortType?:
    | 'text'
    | 'number'
    | 'date'
    | 'duration'
    | 'score'
    | 'boolean'
    | 'version'
    | 'severity'
    | 'size';
}

/** Shared column properties */
export interface TableColumnBase<T, V> {
  header?: string | ((ctx: { column: { id: string } }) => ReactNode);
  cell?: (ctx: TableCellContext<T, V>) => ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableSorting?: boolean;
  enableResizing?: boolean;
  enableColumnPinning?: boolean;
  enableHiding?: boolean;
  meta?: TableColumnMeta;
}

/** Accessor column — maps to a data property */
export interface TableAccessorColumnDef<T, V = unknown> extends TableColumnBase<T, V> {
  accessorKey: keyof T & string;
  id?: string;
}

/** Display column — no data accessor, render-only */
export interface TableDisplayColumnDef<T> extends TableColumnBase<T, never> {
  id: string;
  accessorKey?: never;
}

/**
 * Union column def type.
 * `any` is required: V is invariant (contravariant callback params like `cell`),
 * so `unknown` would reject concrete types like `TableAccessorColumnDef<T, string>`.
 * This mirrors TanStack Table's own `ColumnDef<T, any>`.
 */
export type TableColumnDef<T> = TableAccessorColumnDef<T, any> | TableDisplayColumnDef<T>;

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface TableProps<T> {
  /** Data array for rows */
  data: T[];
  /** Column definitions */
  columns: TableColumnDef<T>[];
  /** Show skeleton rows */
  isLoading?: boolean;
  /** Number of skeleton rows to display when loading (default: 6) */
  skeletonCount?: number;
  /** Slot for TableActionBar, TableEmptyState, and other compound components */
  children?: ReactNode;
  /** Row id accessor for stable row identity */
  getRowId?: (row: T, index: number) => string;
  /** Accessible label for the table */
  'aria-label'?: string;
  /** Additional CSS class for the root container */
  className?: string;

  // --- Sorting ---
  sorting?: TableSortingState;
  onSortingChange?: TableOnChangeFn<TableSortingState>;

  // --- Row Selection ---
  rowSelection?: TableRowSelectionState;
  onRowSelectionChange?: TableOnChangeFn<TableRowSelectionState>;

  // --- Column Resizing ---
  columnSizing?: TableColumnSizingState;
  onColumnSizingChange?: TableOnChangeFn<TableColumnSizingState>;

  // --- Column Pinning ---
  columnPinning?: TableColumnPinningState;
  onColumnPinningChange?: TableOnChangeFn<TableColumnPinningState>;

  // --- Column Reordering (DnD) ---
  columnOrder?: string[];
  onColumnOrderChange?: TableOnChangeFn<string[]>;

  // --- Grouping ---
  grouping?: TableGroupingState;
  onGroupingChange?: TableOnChangeFn<TableGroupingState>;
  renderGroupRow?: (row: TableRow<T>) => ReactNode;
  /** Sub-row accessor for hierarchical/tree data (used with renderGroupRow) */
  getSubRows?: (row: T) => T[] | undefined;

  // --- Row Expanding ---
  expanded?: TableExpandedState;
  onExpandedChange?: TableOnChangeFn<TableExpandedState>;
  renderExpandedRow?: (row: TableRow<T>) => ReactNode;

  // --- Column Visibility ---
  columnVisibility?: TableVisibilityState;
  onColumnVisibilityChange?: TableOnChangeFn<TableVisibilityState>;
  defaultColumnVisibility?: TableVisibilityState;
  defaultColumnOrder?: string[];

  // --- Virtualization ---
  /** Enable row virtualization. `'container'` virtualizes within the scroll container; `'window'` virtualizes against the browser window. */
  virtualized?: TableVirtualized;
  estimateRowHeight?: (index: number) => number;
  overscan?: number;
}
