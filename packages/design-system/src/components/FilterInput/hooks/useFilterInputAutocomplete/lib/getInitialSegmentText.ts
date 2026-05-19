import { type ChipSegment, SEGMENT_VARIANT } from '../../../FilterInputField/FilterInputChip';
import { getOperatorLabel } from '../../../lib';
import type { FieldMetadata, FilterOperator } from '../../../types';

/**
 * Initial text shown in a building chip's inline-edit input for the given
 * segment. Mirrors what the chip is currently displaying so the user can
 * backspace through it (segment-click reopen + Backspace cascade share this
 * derivation, hence the standalone helper).
 */
export const getInitialSegmentText = (
  segment: ChipSegment,
  selectedField: FieldMetadata,
  selectedOperator: FilterOperator | null,
  buildingMultiValue: string | undefined,
): string => {
  if (segment === SEGMENT_VARIANT.attribute) return selectedField.label;
  if (segment === SEGMENT_VARIANT.operator) {
    return selectedOperator ? getOperatorLabel(selectedOperator, selectedField.type) : '';
  }
  return buildingMultiValue ?? '';
};
