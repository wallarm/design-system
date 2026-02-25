import type { ReactNode, RefObject } from 'react';
import type { Column, Row, Table as TanStackTable, VisibilityState } from '@tanstack/react-table';
import type { TableProps, TableVirtualized } from '../types';

export interface TableContextValue<T> {
  table: TanStackTable<T>;
  isLoading: boolean;
  skeletonCount: number;

  // Feature flags (derived from props)
  sortingEnabled: boolean;
  selectionEnabled: boolean;
  resizingEnabled: boolean;
  pinningEnabled: boolean;
  columnDndEnabled: boolean;
  groupingEnabled: boolean;
  expandingEnabled: boolean;
  visibilityEnabled: boolean;
  virtualized: TableVirtualized | undefined;

  // Rendering helpers
  renderExpandedRow?: (row: Row<T>) => ReactNode;
  estimateRowHeight?: (index: number) => number;
  overscan: number;

  // Pre-computed columns to avoid per-cell getAllLeafColumns() calls
  allLeafColumns: Column<T, unknown>[];

  // Settings menu support
  defaultColumnVisibility?: VisibilityState;
  defaultColumnOrder?: string[];

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

  // Infinite scroll
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

export interface TableProviderProps<T> extends Omit<TableProps<T>, 'children' | 'aria-label'> {
  children: ReactNode;
}
