import { CHIP_ID_PATTERN } from './constants';
import type { QueryBarChipData } from '../types';

/** Map a chip ID (e.g. "chip-2") back to condition index */
export const chipIdToConditionIndex = (chipId: string): number | null => {
  const match = chipId.match(CHIP_ID_PATTERN);
  return match ? Number(match[1]) : null;
};

/**
 * Convert a condition-level insert index to a position in the chips array.
 * When `afterConnector` is true, split AFTER the connector preceding the target chip.
 * When false, split BEFORE the connector.
 */
export const findChipSplitIndex = (
  chips: QueryBarChipData[],
  conditionInsertIndex: number,
  afterConnector = false,
): number => {
  let conditionCount = 0;
  for (let i = 0; i < chips.length; i++) {
    if (chips[i].variant === 'chip') {
      if (conditionCount === conditionInsertIndex) {
        if (afterConnector) {
          // Split right at the condition chip (after its connector)
          return i;
        }
        // Split before the connector that precedes this chip
        if (i > 0 && chips[i - 1].variant !== 'chip' && chips[i - 1].variant !== '(' && chips[i - 1].variant !== ')') {
          return i - 1;
        }
        return i;
      }
      conditionCount++;
    }
  }
  return chips.length;
};
