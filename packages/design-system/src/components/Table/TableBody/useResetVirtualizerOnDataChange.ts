import { useEffect, useRef } from 'react';
import type { Table } from '@tanstack/react-table';
import type { Virtualizer } from '@tanstack/react-virtual';
import { detectDataChange } from '../lib';

/**
 * Reset cached measurements only on a full dataset replacement. On a prepend
 * (infinite scroll up) measurements are kept — usePrependScrollAnchor handles
 * the position — so the virtualizer does not re-measure and jump.
 */
export const useResetVirtualizerOnDataChange = (
  table: Table<unknown>,
  virtualizer:
    | Virtualizer<Element, Element>
    | Virtualizer<Window, Element>
    | Virtualizer<HTMLElement, Element>,
) => {
  const firstRowId = table.getRowModel().rows[0]?.id;
  const prevFirstRowIdRef = useRef(firstRowId);

  useEffect(() => {
    if (prevFirstRowIdRef.current === firstRowId) return;
    const rows = table.getRowModel().rows;
    const change = detectDataChange(prevFirstRowIdRef.current, rows);
    prevFirstRowIdRef.current = firstRowId;
    if (change === 'replace') virtualizer.measure();
  }, [firstRowId, table, virtualizer]);
};
