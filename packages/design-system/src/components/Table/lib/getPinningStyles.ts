import type { CSSProperties } from 'react';
import type { Column, RowData } from '@tanstack/react-table';
import type { DSTableFeatures } from './dsTableFeatures';

/**
 * Gets pinning-related CSS properties for a cell/header.
 */
export const getPinningStyles = <T extends RowData>(
  column: Column<DSTableFeatures, T>,
): CSSProperties => {
  const isPinned = column.getIsPinned();

  if (!isPinned) return {};

  if (isPinned !== 'start') return {};

  return {
    left: `${column.getStart('start')}px`,
    position: 'sticky',
  };
};
