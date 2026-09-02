import type { ReactNode, RefObject } from 'react';
import type {
  Column,
  ColumnVisibilityState,
  ReactTable,
  Row,
  RowData,
} from '@tanstack/react-table';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { DSTableFeatures } from '../lib';
import type {
  TableColumnGroup,
  TableProps,
  TableRowReorderEvent,
  TableVirtualized,
} from '../types';

/**
 * Union covers both virtualizer flavors used by the Table (`useVirtualizer`
 * with HTMLElement scroll container and `useWindowVirtualizer` with Window).
 * Lives behind `TableHandle` — consumers never touch this directly.
 */
export type TableVirtualizerInstance =
  | Virtualizer<Window, Element>
  | Virtualizer<HTMLElement, Element>
  | Virtualizer<Element, Element>;

export interface TableContextValue<T extends RowData> {
  table: ReactTable<DSTableFeatures, T>;
  isLoading: boolean;
  isLoadingPrevious: boolean;
  skeletonCount: number;

  // Feature flags (derived from props)
  sortingEnabled: boolean;
  selectionEnabled: boolean;
  resizingEnabled: boolean;
  pinningEnabled: boolean;
  columnDndEnabled: boolean;
  rowDndEnabled: boolean;
  groupingEnabled: boolean;
  expandingEnabled: boolean;
  visibilityEnabled: boolean;
  virtualized: TableVirtualized | undefined;

  // Rendering helpers
  renderExpandedRow?: (row: Row<DSTableFeatures, T>) => ReactNode;
  estimateRowHeight?: (index: number) => number;
  overscan: number;

  // Pre-computed columns to avoid per-cell getAllLeafColumns() calls
  allLeafColumns: Column<DSTableFeatures, T, unknown>[];

  // Settings menu support
  defaultColumnVisibility?: ColumnVisibilityState;
  defaultColumnOrder?: string[];

  // Labeled sections for the settings menu. When set, the menu renders these
  // groups (flat, non-reorderable) instead of the pinned/unpinned DnD list.
  columnGroups?: TableColumnGroup[];

  // Column order setter for DnD
  setColumnOrder: (order: string[]) => void;

  // Shift-click range selection (ref to avoid unnecessary re-renders)
  lastSelectedRowIndexRef: RefObject<number | null>;

  // IDs of columns that are always pinned left and cannot be unpinned/moved
  alwaysPinnedLeft: string[];

  // ID of the master column — first data column (not _selection or _expand).
  // Cannot be hidden, reordered, or unpinned.
  masterColumnId: string | null;

  // Container ref for scoping keyboard handlers
  containerRef: RefObject<HTMLDivElement | null>;

  // Ref to the <tbody> element — populated by whichever body component
  // mounts (virtualized window, virtualized container, or non-virt).
  // Used by `TableHandle.scrollToRow` to resolve a row element by
  // `data-row-id` in non-virtualized mode.
  tbodyRef: RefObject<HTMLTableSectionElement | null>;

  // Ref to the active virtualizer instance, or null when the non-virt body
  // is mounted. Used by `TableHandle.scrollToRow` to call `scrollToIndex`.
  // Body components assign this during render, never inside an effect, so
  // the ref is current on first commit.
  virtualizerRef: RefObject<TableVirtualizerInstance | null>;

  // Infinite scroll (bidirectional)
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onStartReached?: () => void;
  onStartReachedThreshold?: number;
  initialScrollToRowId?: string;

  // Row reorder callback
  onRowReorder?: (event: TableRowReorderEvent) => void;

  // Master cell click
  onMasterCellClick?: (rowId: string) => void;
  activeRowId: string | null;

  // Fired when the built-in column-settings menu opens/closes
  onSettingsOpenChange?: (open: boolean) => void;
}

export interface TableProviderProps<T extends RowData>
  extends Omit<TableProps<T>, 'children' | 'aria-label'> {
  children: ReactNode;
}
