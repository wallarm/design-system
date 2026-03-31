import type { FieldValueOption, FilterOperator } from '../types';
import { isMultiSelectOperator } from './operators';

/**
 * Derive the filter text for the value menu.
 *
 * For multi-select operators, extracts the last comma-separated token
 * (the one the user is currently typing) and uses it for filtering.
 * If that token already matches a known value, returns '' to show all options.
 */
export const getValueFilterText = (
  editingSegment: string | null,
  inputText: string,
  segmentMenuFilterText: string,
  selectedOperator: FilterOperator | null,
  fieldValues: FieldValueOption[],
): string => {
  if (editingSegment !== 'value') return inputText;
  if (!isMultiSelectOperator(selectedOperator)) return segmentMenuFilterText;

  const lastToken = segmentMenuFilterText.split(',').pop()?.trim() ?? '';
  if (!lastToken) return '';

  // If the last token matches a field value label/value, it's a completed selection — don't filter
  if (fieldValues.length > 0) {
    const isKnownValue = fieldValues.some(
      v =>
        v.label.toLowerCase() === lastToken.toLowerCase() ||
        String(v.value).toLowerCase() === lastToken.toLowerCase(),
    );
    if (isKnownValue) return '';
  }

  return lastToken;
};
