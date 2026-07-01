import { SEGMENT_VARIANT } from '../FilterInputField/FilterInputChip/segmentVariant';
import type { ChipErrorSegment, Condition, FilterInputChipData, FilterOperator } from '../types';
import { CHIP_ID_PATTERN } from './constants';
import { isNoValueOperator } from './operators';

/** Map a chip ID (e.g. "chip-2") back to condition index */
export const chipIdToConditionIndex = (chipId: string): number | null => {
  const match = chipId.match(CHIP_ID_PATTERN);
  return match ? Number(match[1]) : null;
};

/** A filter value is empty when null/undefined, '', or an empty array. */
export const isEmptyFilterValue = (value: Condition['value'] | undefined): boolean =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Error segment for an incomplete triplet, or `undefined` when complete:
 * missing operator → whole triplet (`true`); value-bearing operator with an
 * empty value → the value segment; no-value operator ("is set") → complete.
 */
export const incompleteTripletError = (
  operator: FilterOperator | null | undefined,
  value: Condition['value'] | undefined,
): ChipErrorSegment | undefined =>
  !operator
    ? true
    : isNoValueOperator(operator)
      ? undefined
      : isEmptyFilterValue(value)
        ? SEGMENT_VARIANT.value
        : undefined;

/**
 * Convert a condition-level insert index to a position in the chips array.
 * When `afterConnector` is true, split AFTER the connector preceding the target chip.
 * When false, split BEFORE the connector.
 */
export const findChipSplitIndex = (
  chips: FilterInputChipData[],
  conditionInsertIndex: number,
  afterConnector = false,
): number => {
  let conditionCount = 0;
  for (let i = 0; i < chips.length; i++) {
    if (chips[i]!.variant === 'chip') {
      if (conditionCount === conditionInsertIndex) {
        if (afterConnector) {
          // Split at the condition chip (after its connector).
          return i;
        }
        // Split before the preceding connector.
        if (
          i > 0 &&
          chips[i - 1]!.variant !== 'chip' &&
          chips[i - 1]!.variant !== '(' &&
          chips[i - 1]!.variant !== ')'
        ) {
          return i - 1;
        }
        return i;
      }
      conditionCount++;
    }
  }
  return chips.length;
};
