import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
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

// ---------------------------------------------------------------------------
// Drop indicator context — communicates drag state to TableRow for rendering
// the orange placement line.
// ---------------------------------------------------------------------------

interface RowDndIndicatorState {
  activeId: string | null;
  overId: string | null;
}

const ROW_DND_INDICATOR_DEFAULT: RowDndIndicatorState = { activeId: null, overId: null };
const RowDndIndicatorContext = createContext<RowDndIndicatorState>(ROW_DND_INDICATOR_DEFAULT);

export const useRowDndIndicator = () => useContext(RowDndIndicatorContext);

// ---------------------------------------------------------------------------
// Cursor override helpers — inject a <style> tag to force cursor:grabbing
// everywhere during drag.
// ---------------------------------------------------------------------------

const CURSOR_STYLE_ATTR = 'data-table-row-drag';

function setCursorGrabbing() {
  const style = document.createElement('style');
  style.setAttribute(CURSOR_STYLE_ATTR, '');
  style.textContent = '* { cursor: grabbing !important; }';
  document.head.appendChild(style);
}

function resetCursor() {
  document.head.querySelector(`style[${CURSOR_STYLE_ATTR}]`)?.remove();
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const indicatorState = useMemo<RowDndIndicatorState>(
    () => ({ activeId, overId }),
    [activeId, overId],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      const row = rows.find(r => r.id === id);
      setActiveRow(row ?? null);
      setActiveId(id);
      setCursorGrabbing();
    },
    [rows],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveRow(null);
      setActiveId(null);
      setOverId(null);
      resetCursor();
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onRowReorder?.({ activeRowId: String(active.id), overRowId: String(over.id) });
    },
    [onRowReorder],
  );

  const handleDragCancel = useCallback(() => {
    setActiveRow(null);
    setActiveId(null);
    setOverId(null);
    resetCursor();
  }, []);

  return (
    <RowDndIndicatorContext.Provider value={indicatorState}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
        <DragOverlay style={{ cursor: 'grabbing' }}>
          {activeRow ? <TableRowOverlay row={activeRow} /> : null}
        </DragOverlay>
      </DndContext>
    </RowDndIndicatorContext.Provider>
  );
};

TableBodyRowDndContext.displayName = 'TableBodyRowDndContext';
