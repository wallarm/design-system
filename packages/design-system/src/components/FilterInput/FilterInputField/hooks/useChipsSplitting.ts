import { useMemo } from 'react';
import { findChipSplitIndex } from '../../lib';
import type { FilterInputChipData } from '../../types';

/**
 * Splits the chip array into "before" and "after" groups around the insert cursor.
 * Also computes gap visibility flags based on whether adjacent chips are connectors.
 */
export const useChipsSplitting = (
  chips: FilterInputChipData[],
  insertIndex: number,
  insertAfterConnector: boolean,
) => {
  const chipSplitIndex = useMemo(
    () => findChipSplitIndex(chips, insertIndex, insertAfterConnector),
    [chips, insertIndex, insertAfterConnector],
  );

  const chipsBefore = useMemo(() => chips.slice(0, chipSplitIndex), [chips, chipSplitIndex]);
  const chipsAfter = useMemo(() => chips.slice(chipSplitIndex), [chips, chipSplitIndex]);

  const lastBefore = chipsBefore[chipsBefore.length - 1];
  const firstAfter = chipsAfter[0];
  const hideTrailingGap = lastBefore?.variant === 'and' || lastBefore?.variant === 'or';
  const hideLeadingGap = firstAfter?.variant === 'and' || firstAfter?.variant === 'or';

  return { chipsBefore, chipsAfter, hideTrailingGap, hideLeadingGap };
};
