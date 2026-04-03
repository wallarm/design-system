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
  type ExpandedState,
  type GroupingState,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useControlled } from '../../../hooks';
import { useTableState } from '../hooks';
import {
  createExpandColumn,
  createSelectionColumn,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_MIN_COLUMN_WIDTH,
  TABLE_SELECT_COLUMN_ID,
  TABLE_SKELETON_ROWS,
  TABLE_VIRTUALIZATION_OVERSCAN,
} from '../lib';
import { TableContext } from './TableContext';
import type { TableContextValue, TableProviderProps } from './types';

export const TableProvider = <T,>(props: TableProviderProps<T>) => {
  const {
    data,
    columns,
    isLoading = false,
    skeletonCount = TABLE_SKELETON_ROWS,
    children,
    getRowId,

    sorting: sortingProp,
    onSortingChange,
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
    preview,
  } = props;

  const renderPreviewHeader = preview?.renderHeader;
  const renderPreviewContent = preview?.renderContent;
  const previewTrigger = preview?.trigger ?? 'master';
  const previewTooltipText = preview?.tooltipText ?? 'Open preview';
  const previewRowIdProp = preview?.rowId;
  const onPreviewRowChange = preview?.onRowChange;

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
  const mergedColumns = useMemo<ColumnDef<T, any>[]>(() => {
    const cols = columns as ColumnDef<T, any>[];
    const prefix: ColumnDef<T, any>[] = [];

    if (expandingEnabled && !subRowGroupingEnabled) {
      prefix.push(createExpandColumn<T>());
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

    return [...prefix, ...userCols] as ColumnDef<T, any>[];
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
    rowSelectionProp,
    {},
    onRowSelectionChange,
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
  const [columnVisibility, handleColumnVisibilityChange] = useTableState<VisibilityState>(
    columnVisibilityProp,
    defaultColumnVisibility ?? {},
    onColumnVisibilityChange,
  );

  // Pinning needs useControlled separately — custom logic enforces always-pinned columns
  const [columnPinning, setColumnPinningInternal] = useControlled<ColumnPinningState>({
    controlled: columnPinningProp,
    default: {},
  });

  const handleColumnPinningChange = useCallback(
    (updater: ColumnPinningState | ((prev: ColumnPinningState) => ColumnPinningState)) => {
      const newValue = typeof updater === 'function' ? updater(columnPinning ?? {}) : updater;
      const enforcedLeft = [
        ...alwaysPinnedLeft,
        ...(newValue.left ?? []).filter(id => !alwaysPinnedLeft.includes(id)),
      ];
      const enforced = { ...newValue, left: enforcedLeft };
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
  const table = useReactTable<T>({
    data,
    columns: mergedColumns,
    getRowId,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    ...(sortingEnabled && { getSortedRowModel: getSortedRowModel() }),
    ...(groupingEnabled && { getGroupedRowModel: getGroupedRowModel() }),
    ...(groupingEnabled || expandingEnabled ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    state: {
      sorting: sorting ?? [],
      rowSelection: rowSelection ?? {},
      columnSizing: columnSizing ?? {},
      columnPinning: {
        ...(columnPinning ?? {}),
        left: [
          ...alwaysPinnedLeft,
          ...((columnPinning ?? {}).left ?? []).filter(id => !alwaysPinnedLeft.includes(id)),
        ],
      },
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
  const theadRef = useRef<HTMLTableSectionElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Preview drawer state (controlled/uncontrolled)
  const [previewRowId = null, setPreviewRowIdInternal] = useControlled<string | null>({
    controlled: previewRowIdProp,
    default: null,
  });
  const setPreviewRowId = useCallback(
    (id: string | null) => {
      setPreviewRowIdInternal(id);
      onPreviewRowChange?.(id);
    },
    [setPreviewRowIdInternal, onPreviewRowChange],
  );

  // Context value
  const contextValue: TableContextValue<T> = useMemo(
    () => ({
      table,
      isLoading,
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
      renderExpandedRow: renderExpandedRow as ((row: Row<T>) => ReactNode) | undefined,
      estimateRowHeight,
      overscan,
      allLeafColumns,
      defaultColumnVisibility,
      defaultColumnOrder,
      setColumnOrder,
      alwaysPinnedLeft,
      masterColumnId,
      lastSelectedRowIndexRef,
      theadRef,
      containerRef,
      onEndReached,
      onEndReachedThreshold,
      previewRowId,
      setPreviewRowId,
      renderPreviewHeader: renderPreviewHeader as ((row: Row<T>) => ReactNode) | undefined,
      renderPreviewContent: renderPreviewContent as ((row: Row<T>) => ReactNode) | undefined,
      previewTrigger,
      previewTooltipText,
    }),
    [
      table,
      isLoading,
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
      previewRowId,
      renderPreviewHeader,
      renderPreviewContent,
      previewTrigger,
      previewTooltipText,
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

      const currentOrder = table.getState().columnOrder.length
        ? table.getState().columnOrder
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
