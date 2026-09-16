import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import type { Row, RowData } from '@tanstack/react-table';
import { useTableContext } from '../TableContext/useTableContext';
import type { DSTableFeatures } from './dsTableFeatures';

type UseSortableReturn = ReturnType<typeof useSortable>;

export interface UseRowDndResult {
  canDnd: boolean;
  isDragging: boolean;
  setNodeRef: UseSortableReturn['setNodeRef'];
  style: CSSProperties;
  attributes: UseSortableReturn['attributes'];
  listeners: UseSortableReturn['listeners'];
}

export const useRowDnd = <T extends RowData>(row: Row<DSTableFeatures, T>): UseRowDndResult => {
  const { rowDndEnabled } = useTableContext<T>();
  const canDnd = rowDndEnabled && row.subRows.length === 0;

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
