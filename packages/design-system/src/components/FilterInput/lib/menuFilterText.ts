import { type ChipSegment, SEGMENT_VARIANT } from '../FilterInputField/FilterInputChip';
import type { FieldValueOption, FilterOperator } from '../types';
import { isMultiSelectOperator } from './operators';

/**
 * The substring the user is actively typing. For multi-select operators with
 * comma-separated input ("2XX, 3XX, 4"), returns only the last token ("4").
 * Single-value operators get the raw input.
 */
export const getCurrentValueTokenText = (
  editingSegment: ChipSegment | null,
  inputText: string,
  segmentMenuFilterText: string,
  selectedOperator: FilterOperator | null,
): string => {
  const raw = editingSegment === SEGMENT_VARIANT.value ? segmentMenuFilterText : inputText;
  if (!isMultiSelectOperator(selectedOperator)) return raw;
  return raw.split(',').pop()?.trim() ?? '';
};

/**
 * Filter text for the value menu. Multi-select: returns the current token, or
 * '' when it already matches a known value (just-completed selection).
 * Single-value: returns token as-is.
 */
export const getValueFilterText = (
  currentTokenText: string,
  selectedOperator: FilterOperator | null,
  fieldValues: FieldValueOption[],
): string => {
  if (!isMultiSelectOperator(selectedOperator)) return currentTokenText;
  if (!currentTokenText) return '';

  // Completed selection — don't filter.
  if (fieldValues.length > 0) {
    const isKnownValue = fieldValues.some(
      v =>
        v.label.toLowerCase() === currentTokenText.toLowerCase() ||
        String(v.value).toLowerCase() === currentTokenText.toLowerCase(),
    );
    if (isKnownValue) return '';
  }

  return currentTokenText;
};
