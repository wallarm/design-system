import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type ExpandedState,
  type GroupingState,
  type OnChangeFn,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { useControlled } from '../../../hooks';
import { useTableState } from '../hooks';
import {
  createExpandColumn,
  createSelectionColumn,
  type DSTableFeatures,
  dsTableFeatures,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_MIN_COLUMN_WIDTH,
  TABLE_SELECT_COLUMN_ID,
  TABLE_SKELETON_ROWS,
  TABLE_VIRTUALIZATION_OVERSCAN,
} from '../lib';
import type { TableColumnPinningState } from '../types';
import { TableContext } from './TableContext';
import type { TableContextValue, TableProviderProps, TableVirtualizerInstance } from './types';

/**
 * Snapshots the DS's public {left, right} pinning state into TanStack's real
 * {start, end} shape, enforcing always-pinned columns at the front of `start`.
 * Shared by `handleColumnPinningChange`'s `prevTanStackShape` and the
 * `state.columnPinning` passed to `useTable()` — both must read the exact same
 * "current pinning state" snapshot, or `prev` inside an updater function stops
 * matching what was actually rendered and pinning silently desyncs.
 */
const toTanStackPinning = (
  p: TableColumnPinningState | undefined,
  pinnedLeft: string[],
): ColumnPinningState => ({
  start: [...pinnedLeft, ...(p?.left ?? []).filter(id => !pinnedLeft.includes(id))],
  end: p?.right ?? [],
});

export const TableProvider = <T extends RowData>(props: TableProviderProps<T>) => {
  const {
    data,
    columns,
    isLoading = false,
    isLoadingPrevious = false,
    skeletonCount = TABLE_SKELETON_ROWS,
    children,
    getRowId,

    sorting: sortingProp,
    onSortingChange,
    manualSorting = false,
    rowSelection: rowSelectionProp,
    onRowSelectionChange,
    columnSizing: columnSizingProp,
    onColumnSizingChange,
    columnPinning: columnPinningProp,
    onColumnPinningChange,
    columnOrder: columnOrderProp,
    onColumnOrderChange,
    grouping: groupingProp,
    onGroupingChange,
    expanded: expandedProp,
    onExpandedChange,
    renderGroupRow,
    getSubRows,
    renderExpandedRow,
    columnVisibility: columnVisibilityProp,
    onColumnVisibilityChange,
    defaultColumnVisibility,
    defaultColumnOrder,
    virtualized,
    estimateRowHeight,
    overscan = TABLE_VIRTUALIZATION_OVERSCAN,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
    onMasterCellClick,
    activeRowId: activeRowIdProp,
    onSettingsOpenChange,
  } = props;

  const masterCellActiveRowId = activeRowIdProp ?? null;

  // Feature detection
  const sortingEnabled = !!onSortingChange;
  const selectionEnabled = !!onRowSelectionChange;
  const resizingEnabled = !!onColumnSizingChange;
  const pinningEnabled = !!columnPinningProp || !!onColumnPinningChange;
  const columnDndEnabled = !!onColumnOrderChange;
  const groupingEnabled = !!groupingProp || !!onGroupingChange;
  const subRowGroupingEnabled = !!renderGroupRow && !!getSubRows;
  const expandingEnabled = !!renderExpandedRow || !!onExpandedChange || subRowGroupingEnabled;
  const visibilityEnabled = !!onColumnVisibilityChange;

  // Auto-inject selection / expand columns based on enabled features
  // Also mark first user column as master column: non-pinnable, non-hideable
  // Auto-detect sortType from data when not explicitly set
  const mergedColumns = useMemo<ColumnDef<DSTableFeatures, T, any>[]>(() => {
    const cols = columns as ColumnDef<DSTableFeatures, T, any>[];
    const prefix: ColumnDef<DSTableFeatures, T, any>[] = [];

    if (expandingEnabled && !subRowGroupingEnabled) {
      // TODO(table-v9): drop this cast once createExpandColumn.tsx is migrated
      // (Task 3) to return ColumnDef<DSTableFeatures, T, unknown> natively.
      prefix.push(createExpandColumn<T>() as ColumnDef<DSTableFeatures, T, any>);
    }

    if (selectionEnabled) {
      prefix.push(createSelectionColumn<T>());
    }

    // Auto-detect sortType from data values for accessor columns
    const firstRow = data[0] as Record<string, unknown> | undefined;
    const withAutoMeta = cols.map(col => {
      if (!firstRow || !('accessorKey' in col) || col.meta?.sortType) return col;
      const value = firstRow[col.accessorKey as string];
      if (typeof value === 'number') {
        return { ...col, meta: { ...col.meta, sortType: 'number' as const } };
      }
      return col;
    });

    const masterOverrides = { enableColumnPinning: false, enableHiding: false };

    if (prefix.length === 0) {
      // Mark only the first user column as master
      if (withAutoMeta.length > 0) {
        return [{ ...withAutoMeta[0], ...masterOverrides }, ...withAutoMeta.slice(1)] as ColumnDef<
          DSTableFeatures,
          T,
          any
        >[];
      }
      return withAutoMeta;
    }

    // Mark first user column as master column
    const userCols =
      withAutoMeta.length > 0
        ? withAutoMeta.map((col, index) => (index === 0 ? { ...col, ...masterOverrides } : col))
        : withAutoMeta;

    return [...prefix, ...userCols] as ColumnDef<DSTableFeatures, T, any>[];
  }, [columns, data, selectionEnabled, expandingEnabled, subRowGroupingEnabled]);

  // Master column ID — first data column (not _selection or _expand)
  const masterColumnId = useMemo<string | null>(() => {
    if (columns.length === 0) return null;
    const firstCol = columns[0];
    if (!firstCol) return null;
    return ('accessorKey' in firstCol ? String(firstCol.accessorKey) : firstCol.id) ?? null;
  }, [columns]);

  // IDs of columns that must always stay pinned left
  const alwaysPinnedLeft = useMemo(() => {
    const ids: string[] = [];
    if (expandingEnabled && !subRowGroupingEnabled) ids.push(TABLE_EXPAND_COLUMN_ID);
    if (selectionEnabled) ids.push(TABLE_SELECT_COLUMN_ID);
    if (masterColumnId) ids.push(masterColumnId);
    return ids;
  }, [masterColumnId, expandingEnabled, selectionEnabled, subRowGroupingEnabled]);

  // Combined controlled/uncontrolled state + TanStack updater handlers
  const [sorting, handleSortingChange] = useTableState<SortingState>(
    sortingProp,
    [],
    onSortingChange,
  );
  const [rowSelection, handleRowSelectionChange] = useTableState<RowSelectionState>(
    // v9's RowSelectionState is Record<string, true> (selection is tracked by key
    // presence); the DS's public prop/callback stay the looser Record<string,
    // boolean> shape for backwards compatibility. A stray `false` entry behaves
    // identically to an absent one downstream, so this narrowing is safe.
    rowSelectionProp as RowSelectionState | undefined,
    {},
    onRowSelectionChange as OnChangeFn<RowSelectionState> | undefined,
  );
  const [columnSizing, handleColumnSizingChange] = useTableState<ColumnSizingState>(
    columnSizingProp,
    {},
    onColumnSizingChange,
  );
  const [columnOrder, handleColumnOrderChange] = useTableState<ColumnOrderState>(
    columnOrderProp,
    defaultColumnOrder ?? [],
    onColumnOrderChange,
  );
  const [grouping, handleGroupingChange] = useTableState<GroupingState>(
    groupingProp,
    [],
    onGroupingChange,
  );
  const [expanded, handleExpandedChange] = useTableState<ExpandedState>(
    expandedProp,
    {},
    onExpandedChange,
  );
  const [columnVisibility, handleColumnVisibilityChange] = useTableState<ColumnVisibilityState>(
    columnVisibilityProp,
    defaultColumnVisibility ?? {},
    onColumnVisibilityChange,
  );

  // Pinning needs useControlled separately — custom logic enforces always-pinned columns.
  // Internal storage stays in the DS's public {left, right} shape; only the
  // value passed to useTable() and the updater TanStack calls back with use
  // TanStack's real {start, end} shape (see handleColumnPinningChange below).
  const [columnPinning, setColumnPinningInternal] = useControlled<TableColumnPinningState>({
    controlled: columnPinningProp,
    default: {},
  });

  const handleColumnPinningChange = useCallback(
    (updater: ColumnPinningState | ((prev: ColumnPinningState) => ColumnPinningState)) => {
      const prevTanStackShape = toTanStackPinning(columnPinning, alwaysPinnedLeft);
      const newValue = typeof updater === 'function' ? updater(prevTanStackShape) : updater;
      const enforcedStart = [
        ...alwaysPinnedLeft,
        ...newValue.start.filter(id => !alwaysPinnedLeft.includes(id)),
      ];
      const enforced: TableColumnPinningState = { left: enforcedStart, right: newValue.end };
      setColumnPinningInternal(enforced);
      onColumnPinningChange?.(enforced);
    },
    [columnPinning, setColumnPinningInternal, onColumnPinningChange, alwaysPinnedLeft],
  );

  // Direct column order setter for DnD and settings menu.
  // Enforces always-pinned columns stay at the beginning in their original order.
  const setColumnOrder = useCallback(
    (newOrder: string[]) => {
      const rest = newOrder.filter(id => !alwaysPinnedLeft.includes(id));
      handleColumnOrderChange([...alwaysPinnedLeft, ...rest]);
    },
    [handleColumnOrderChange, alwaysPinnedLeft],
  );

  // TanStack Table instance
  const table = useTable<DSTableFeatures, T>({
    features: dsTableFeatures,
    data,
    columns: mergedColumns,
    getRowId,
    getSubRows,
    manualSorting,
    state: {
      sorting: sorting ?? [],
      rowSelection: rowSelection ?? {},
      columnSizing: columnSizing ?? {},
      columnPinning: toTanStackPinning(columnPinning, alwaysPinnedLeft),
      columnOrder: columnOrder ?? [],
      grouping: grouping ?? [],
      expanded: expanded ?? {},
      columnVisibility: columnVisibility ?? {},
    },
    onSortingChange: sortingEnabled ? handleSortingChange : undefined,
    onRowSelectionChange: selectionEnabled ? handleRowSelectionChange : undefined,
    onColumnSizingChange: resizingEnabled ? handleColumnSizingChange : undefined,
    onColumnPinningChange: pinningEnabled ? handleColumnPinningChange : undefined,
    onColumnOrderChange: columnDndEnabled ? handleColumnOrderChange : undefined,
    onGroupingChange: groupingEnabled ? handleGroupingChange : undefined,
    onExpandedChange: expandingEnabled ? handleExpandedChange : undefined,
    onColumnVisibilityChange: visibilityEnabled ? handleColumnVisibilityChange : undefined,
    enableSorting: sortingEnabled,
    enableRowSelection: selectionEnabled,
    enableColumnResizing: resizingEnabled,
    enableColumnPinning: true, // Always true — auto-pinned columns require it
    enableGrouping: groupingEnabled,
    enableExpanding: expandingEnabled,
    ...(expandingEnabled && (renderExpandedRow || subRowGroupingEnabled)
      ? { getRowCanExpand: () => true }
      : {}),
    enableHiding: visibilityEnabled,
    columnResizeMode: 'onChange',
    defaultColumn: {
      minSize: TABLE_MIN_COLUMN_WIDTH,
    },
  });

  // Pre-computed leaf columns — avoids per-cell getAllLeafColumns() calls
  const allLeafColumns = table.getAllLeafColumns();

  // Refs (stable across renders)
  const lastSelectedRowIndexRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const virtualizerRef = useRef<TableVirtualizerInstance | null>(null);

  // Context value
  const contextValue: TableContextValue<T> = useMemo(
    () => ({
      table,
      isLoading,
      isLoadingPrevious,
      skeletonCount,
      sortingEnabled,
      selectionEnabled,
      resizingEnabled,
      pinningEnabled,
      columnDndEnabled,
      groupingEnabled,
      expandingEnabled,
      visibilityEnabled,
      virtualized,
      renderExpandedRow: renderExpandedRow as
        | ((row: Row<DSTableFeatures, T>) => ReactNode)
        | undefined,
      estimateRowHeight,
      overscan,
      allLeafColumns,
      defaultColumnVisibility,
      defaultColumnOrder,
      setColumnOrder,
      alwaysPinnedLeft,
      masterColumnId,
      lastSelectedRowIndexRef,
      containerRef,
      tbodyRef,
      virtualizerRef,
      onEndReached,
      onEndReachedThreshold,
      onStartReached,
      onStartReachedThreshold,
      initialScrollToRowId,
      onMasterCellClick,
      activeRowId: masterCellActiveRowId,
      onSettingsOpenChange,
    }),
    [
      table,
      isLoading,
      isLoadingPrevious,
      skeletonCount,
      sortingEnabled,
      selectionEnabled,
      resizingEnabled,
      pinningEnabled,
      columnDndEnabled,
      groupingEnabled,
      expandingEnabled,
      visibilityEnabled,
      virtualized,
      renderExpandedRow,
      estimateRowHeight,
      overscan,
      allLeafColumns,
      defaultColumnVisibility,
      defaultColumnOrder,
      setColumnOrder,
      alwaysPinnedLeft,
      masterColumnId,
      onEndReached,
      onEndReachedThreshold,
      onStartReached,
      onStartReachedThreshold,
      initialScrollToRowId,
      masterCellActiveRowId,
      onMasterCellClick,
      onSettingsOpenChange,
    ],
  );

  // Escape handler — deselect all (scoped to table container)
  useEffect(() => {
    if (!selectionEnabled) return;
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        table.resetRowSelection();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [selectionEnabled, table]);

  // DnD setup for column reordering
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentOrder = table.store.state.columnOrder.length
        ? table.store.state.columnOrder
        : allLeafColumns.map(c => c.id);

      const oldIndex = currentOrder.indexOf(String(active.id));
      const newIndex = currentOrder.indexOf(String(over.id));
      const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
      setColumnOrder(newOrder);
    },
    [table, allLeafColumns, setColumnOrder],
  );

  // Column IDs for DnD — exclude always-pinned so they don't shift visually
  const columnIds = columnDndEnabled
    ? allLeafColumns.filter(c => !alwaysPinnedLeft.includes(c.id)).map(c => c.id)
    : [];

  return (
    <TableContext.Provider value={contextValue}>
      <DndContext
        sensors={columnDndEnabled ? sensors : undefined}
        collisionDetection={columnDndEnabled ? closestCenter : undefined}
        onDragEnd={columnDndEnabled ? handleDragEnd : undefined}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </TableContext.Provider>
  );
};
