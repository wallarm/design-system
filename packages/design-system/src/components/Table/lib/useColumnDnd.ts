import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import type { Column } from '@tanstack/react-table';
import { useTableContext } from '../TableContext';
import { getDndStyles } from './getDndStyles';

type UseSortableReturn = ReturnType<typeof useSortable>;

interface UseColumnDndResult {
  canDnd: boolean;
  isDragging: boolean;
  setNodeRef: UseSortableReturn['setNodeRef'];
  dndStyle: CSSProperties;
  attributes: UseSortableReturn['attributes'];
  listeners: UseSortableReturn['listeners'];
}

export const useColumnDnd = <T>(column: Column<T, unknown>): UseColumnDndResult => {
  const { columnDndEnabled, alwaysPinnedLeft } = useTableContext<T>();
  const isPinned = column.getIsPinned();

  const canDnd =
    columnDndEnabled &&
    !isPinned &&
    !alwaysPinnedLeft.includes(column.id) &&
    !column.getIsResizing();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled: !canDnd,
  });

  const dndStyle = getDndStyles({ canDnd, isDragging, transform, transition });

  return { canDnd, isDragging, setNodeRef, dndStyle, attributes, listeners };
};
