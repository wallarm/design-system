import type { ReactNode, Ref } from 'react';
import type { Row, RowData, TableFeatures } from '@tanstack/react-table';
import type { TestableProps } from '../../utils/testId';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue> {
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
    /** Cell text alignment. Defaults to 'right' for number/score/size sortType, 'left' otherwise */
    align?: 'left' | 'center' | 'right';
    /** Optional description — shown as text below the title or as a tooltip on hover. Title gets dashed underline. */
    description?: { type: 'text' | 'tooltip'; content: string };
    /** Resize behavior: 'resize' adapts content to fit (default), 'cut' truncates content */
    resizeType?: 'cut' | 'resize';
    /** Render the three-dots contextual menu shown on hover */
    renderMenuAction?: (row: Row<TFeatures, TData>) => ReactNode;
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

/**
 * Labeled grouping for the column-settings menu. When `columnGroups` is passed
 * to the Table, the settings menu renders these labeled sections (in the given
 * order) instead of the default pinned/unpinned + drag-reorder list — the same
 * flat, non-reorderable pattern the FilterInput field menu uses. `columns` are
 * column ids; ids absent from every group fall into a trailing headerless
 * section, and empty groups (or groups whose columns are all filtered out by
 * search) render nothing.
 */
export interface TableColumnGroup {
  label: string;
  columns: string[];
}

/** Event fired when a row is dragged to a new position */
export interface TableRowReorderEvent {
  activeRowId: string;
  overRowId: string;
}

/** State updater — value or functional update */
export type TableUpdater<T> = T | ((prev: T) => T);

/** Options for the imperative `scrollToRow` method */
export interface TableScrollToRowOptions {
  /** Alignment within the viewport. Default: 'auto'. */
  align?: 'start' | 'center' | 'end' | 'auto';
  /** Scroll behavior. Default: 'auto'. */
  behavior?: 'auto' | 'smooth';
}

/**
 * Imperative handle exposed via `ref` on `<Table>`. The only supported way
 * to programmatically scroll the table to a row that may be outside the
 * currently rendered virtual window.
 */
export interface TableHandle {
  /**
   * Scrolls to the row with the given id.
   *
   * Returns `true` if the row was found in the current row model and a
   * scroll was initiated. Returns `false` if the id is not in the current
   * rows or the virtualizer has not yet mounted — the caller decides
   * whether to load more pages or retry on the next frame.
   */
  scrollToRow(id: string, opts?: TableScrollToRowOptions): boolean;
}

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
export interface TableColumnMeta<T = unknown> {
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
  /** Cell text alignment. Defaults to 'right' for number/score/size sortType, 'left' otherwise */
  align?: 'left' | 'center' | 'right';
  /** Optional description — shown as text below the title or as a tooltip on hover. Title gets dashed underline. */
  description?: { type: 'text' | 'tooltip'; content: string };
  /** Resize behavior: 'resize' adapts content to fit (default), 'cut' truncates content */
  resizeType?: 'cut' | 'resize';
  /** Render the three-dots contextual menu shown on hover */
  renderMenuAction?: (row: TableRow<T>) => ReactNode;
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
  meta?: TableColumnMeta<T>;
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

export interface TableProps<T> extends TestableProps {
  /** Data array for rows */
  data: T[];
  /** Column definitions */
  columns: TableColumnDef<T>[];
  /** Show skeleton rows */
  isLoading?: boolean;
  /**
   * Show skeleton rows above the first row while a previous page is being
   * fetched (bidirectional infinite scroll — the start-edge counterpart of
   * `isLoading`). Pair with `onStartReached`.
   */
  isLoadingPrevious?: boolean;
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
  /**
   * When `true`, disables TanStack's client-side sort. The table renders rows
   * in the order they appear in `data` and only fires `onSortingChange` on
   * header clicks. Use this when sorting is performed server-side and the
   * server returns pre-sorted rows.
   *
   * Default: `false` (client-side sort via TanStack's `getSortedRowModel`).
   */
  manualSorting?: boolean;

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
  /**
   * Labeled sections for the column-settings menu. When set, the menu renders
   * these groups (flat, non-reorderable — like the FilterInput field menu)
   * instead of the default pinned/unpinned drag-reorder list. See
   * {@link TableColumnGroup}.
   */
  columnGroups?: TableColumnGroup[];
  /**
   * Fired when the built-in column-settings menu opens (`true`) or closes
   * (`false`). The menu's open state otherwise lives inside the DS and is not
   * observable, so consumers that want to defer expensive work — e.g. refetch
   * once with the final column selection instead of on every toggle — can hook
   * the close edge here.
   */
  onSettingsOpenChange?: (open: boolean) => void;

  // --- Virtualization ---
  /** Enable row virtualization. `'container'` virtualizes within the scroll container; `'window'` virtualizes against the browser window. */
  virtualized?: TableVirtualized;
  estimateRowHeight?: (index: number) => number;
  overscan?: number;

  // --- Infinite scroll (bidirectional) ---
  /** Callback fired when the user scrolls near the end (bottom) of the table */
  onEndReached?: () => void;
  /** Distance from the bottom (in px) to trigger onEndReached (default: 200) */
  onEndReachedThreshold?: number;
  /** Callback fired when the user scrolls near the start (top) of the table */
  onStartReached?: () => void;
  /** Distance from the top (in px) to trigger onStartReached (default: 200) */
  onStartReachedThreshold?: number;
  /**
   * Row id to anchor the initial scroll position to. The table scrolls this row
   * into view on mount and arms the edge detectors only after that initial
   * scroll settles. Use for deep-linking into the middle of a dataset.
   */
  initialScrollToRowId?: string;

  // --- Row Reordering (DnD) ---
  /**
   * Callback fired when a row is dragged to a new position. When provided,
   * a drag-handle column is auto-injected and row DnD is enabled.
   * Disabled when `getSubRows` grouping is active.
   */
  onRowReorder?: (event: TableRowReorderEvent) => void;

  // --- Master cell click ---
  /** Callback fired when the master cell is clicked. Receives the row ID. */
  onMasterCellClick?: (rowId: string) => void;
  /** ID of the currently active (highlighted) row, or null. Controls row highlighting via data-preview-active attribute. */
  activeRowId?: string | null;

  /** Imperative handle — exposes `scrollToRow(id, opts)`. See {@link TableHandle}. */
  ref?: Ref<TableHandle>;
}
