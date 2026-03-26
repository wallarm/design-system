import { useEffect, useRef } from 'react';
import type { Table } from '@tanstack/react-table';
import type { Virtualizer } from '@tanstack/react-virtual';

/**
 * Reset cached measurements when the data set changes so the virtualizer
 * does not retain stale heights from a previous data set.
 * Tracks first row ID to distinguish "new data" from "appended rows" (infinite scroll).
 */
export function useResetVirtualizerOnDataChange(
  table: Table<unknown>,
  virtualizer:
    | Virtualizer<Element, Element>
    | Virtualizer<Window, Element>
    | Virtualizer<HTMLElement, Element>,
) {
  const rows = table.getRowModel().rows;
  const firstRowId = rows[0]?.id;
  const prevFirstRowIdRef = useRef(firstRowId);

  useEffect(() => {
    if (prevFirstRowIdRef.current !== firstRowId) {
      prevFirstRowIdRef.current = firstRowId;
      virtualizer.measure();
    }
  }, [firstRowId, virtualizer]);
}
