import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: !canDnd,
  });

  // Zero out horizontal transform — rows only move vertically.
  // Non-dragging rows receive the "make room" transform from verticalListSortingStrategy
  // which serves as the visual drop-position indicator.
  const style: CSSProperties = canDnd
    ? {
        transform: CSS.Translate.toString(transform ? { ...transform, x: 0 } : null),
        transition,
        ...(isDragging && { opacity: 0.5, position: 'relative' as const, zIndex: 100 }),
      }
    : {};

  return { canDnd, isDragging, setNodeRef, style, attributes, listeners };
};
