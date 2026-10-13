import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import type { Row, RowData } from '@tanstack/react-table';
import { useTableContext } from '../TableContext/useTableContext';
import type { DSTableFeatures } from './dsTableFeatures';
import { isGroupRow } from './isGroupRow';
import { useTableValue } from './tableReactivity';

type UseSortableReturn = ReturnType<typeof useSortable>;

export interface UseRowDndResult {
  canDnd: boolean;
  isDragging: boolean;
  setNodeRef: UseSortableReturn['setNodeRef'];
  style: CSSProperties;
  attributes: UseSortableReturn['attributes'];
  listeners: UseSortableReturn['listeners'];
}

/** Whether the row can be dragged: never a group row, and only if `getRowCanDrag` allows it. */
export const useRowCanDrag = <T extends RowData>(row: Row<DSTableFeatures, T>): boolean => {
  const { rowDndEnabled, showEmptyGroups, getRowCanDrag } = useTableContext<T>();
  const canDrag = useTableValue(
    () => !isGroupRow(row, showEmptyGroups) && (getRowCanDrag?.(row) ?? true),
  );
  return rowDndEnabled && canDrag;
};

export const useRowDnd = <T extends RowData>(row: Row<DSTableFeatures, T>): UseRowDndResult => {
  const canDnd = useRowCanDrag(row);

  // `disabled` also takes the row out of collision detection: it is no drop target.
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: row.id,
    disabled: !canDnd,
  });

  // Rows stay in place during drag — no transforms or transitions.
  // The DragOverlay provides the floating ghost, and an orange drop indicator
  // line shows the target position.
  const style: CSSProperties = canDnd && isDragging ? { opacity: 0.4 } : {};

  return { canDnd, isDragging, setNodeRef, style, attributes, listeners };
};
