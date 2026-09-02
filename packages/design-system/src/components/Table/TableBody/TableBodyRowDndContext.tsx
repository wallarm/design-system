import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Row, RowData } from '@tanstack/react-table';
import type { DSTableFeatures } from '../lib';
import { useTableContext } from '../TableContext';
import type { TableRowReorderEvent } from '../types';
import { TableRowOverlay } from './TableRowOverlay';

interface TableBodyRowDndContextProps {
  children: ReactNode;
}

export const TableBodyRowDndContext: FC<TableBodyRowDndContextProps> = ({ children }) => {
  const { rowDndEnabled, onRowReorder } = useTableContext();

  if (!rowDndEnabled) return children;

  return (
    <TableBodyRowDndContextInner onRowReorder={onRowReorder}>
      {children}
    </TableBodyRowDndContextInner>
  );
};

interface TableBodyRowDndContextInnerProps {
  children: ReactNode;
  onRowReorder?: (event: TableRowReorderEvent) => void;
}

const TableBodyRowDndContextInner: FC<TableBodyRowDndContextInnerProps> = ({
  children,
  onRowReorder,
}) => {
  const { table } = useTableContext();
  const rows = table.getRowModel().rows;
  // Memoize row IDs to avoid SortableContext re-initialization on every render.
  // The array reference only changes when the actual row IDs change.
  const rowIds = useMemo(() => rows.map(r => r.id), [rows]);

  const [activeRow, setActiveRow] = useState<Row<DSTableFeatures, RowData> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const row = rows.find(r => r.id === String(event.active.id));
      setActiveRow(row ?? null);
    },
    [rows],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveRow(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onRowReorder?.({ activeRowId: String(active.id), overRowId: String(over.id) });
    },
    [onRowReorder],
  );

  const handleDragCancel = useCallback(() => {
    setActiveRow(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay>{activeRow ? <TableRowOverlay row={activeRow} /> : null}</DragOverlay>
    </DndContext>
  );
};

TableBodyRowDndContext.displayName = 'TableBodyRowDndContext';
