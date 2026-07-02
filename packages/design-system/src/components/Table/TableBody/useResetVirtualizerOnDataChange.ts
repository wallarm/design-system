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
  const modelRows = table.getRowModel().rows;
  const firstRowId = modelRows[0]?.id;
  const lastRowId = modelRows[modelRows.length - 1]?.id;
  const prevFirstRowIdRef = useRef(firstRowId);
  const prevLastRowIdRef = useRef(lastRowId);

  useEffect(() => {
    // An append moves only the tail — keep the baseline fresh so a later
    // first-row change diffs against the actual previous commit.
    if (prevFirstRowIdRef.current === firstRowId) {
      prevLastRowIdRef.current = lastRowId;
      return;
    }
    const rows = table.getRowModel().rows;
    const change = detectDataChange(prevFirstRowIdRef.current, rows, prevLastRowIdRef.current);
    prevFirstRowIdRef.current = firstRowId;
    prevLastRowIdRef.current = lastRowId;
    if (change === 'replace') virtualizer.measure();
  }, [firstRowId, lastRowId, table, virtualizer]);
};
