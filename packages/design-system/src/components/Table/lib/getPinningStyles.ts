import type { CSSProperties } from 'react';
import type { Column } from '@tanstack/react-table';

/**
 * Gets pinning-related CSS properties for a cell/header.
 */
export function getPinningStyles<T>(column: Column<T>): CSSProperties {
  const isPinned = column.getIsPinned();

  if (!isPinned) return {};

  if (isPinned !== 'left') return {};

  return {
    left: `${column.getStart('left')}px`,
    position: 'sticky',
  };
}
