import { type RefObject, useEffect, useRef, useState } from 'react';
import type { TableVirtualizerInstance } from '../../TableContext/types';

interface UseInitialAnchorOptions {
  initialScrollToRowId?: string;
  rows: { id: string }[];
  virtualizerRef: RefObject<TableVirtualizerInstance | null>;
}

/**
 * Scrolls to the anchor row once on mount and returns `ready`, which gates the
 * edge detectors until the initial scroll has settled. Without this, a table
 * mounted at scrollTop 0 would fire `onStartReached` immediately.
 */
export const useInitialAnchor = ({
  initialScrollToRowId,
  rows,
  virtualizerRef,
}: UseInitialAnchorOptions): boolean => {
  const [ready, setReady] = useState(!initialScrollToRowId);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current || !initialScrollToRowId) return;

    const virtualizer = virtualizerRef.current;
    if (!virtualizer) {
      // Non-virtualized — no virtualizer to scroll; arm immediately. Consumers
      // needing an initial scroll in this mode should use the imperative
      // scrollToRow handle.
      doneRef.current = true;
      setReady(true);
      return;
    }

    const index = rows.findIndex(r => r.id === initialScrollToRowId);
    if (index < 0) return; // anchor not loaded yet — retry on next data change

    virtualizer.scrollToIndex(index, { align: 'center' });
    doneRef.current = true;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [initialScrollToRowId, rows, virtualizerRef]);

  return ready;
};
