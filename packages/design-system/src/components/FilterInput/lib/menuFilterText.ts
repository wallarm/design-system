import { SEGMENT_VARIANT } from '../FilterInputField/FilterInputChip';
import type { FieldValueOption, FilterOperator } from '../types';
import { isMultiSelectOperator } from './operators';

/**
 * Derive the "current value token" — the substring the user is actively typing.
 *
 * For multi-select operators (like `in` / `any of`), the field input may contain
 * a comma-separated list such as `"2XX, 3XX, 4"`. Only the last token (`"4"`)
 * represents the value currently being composed; prior tokens are already
 * committed as checked items. Callers use this to feed both `getSuggestions`
 * and the dropdown's filter/sort so the active token drives the menu.
 *
 * For single-value operators the raw input is returned unchanged.
 */
export const getCurrentValueTokenText = (
  editingSegment: string | null,
  inputText: string,
  segmentMenuFilterText: string,
  selectedOperator: FilterOperator | null,
): string => {
  const raw = editingSegment === SEGMENT_VARIANT.value ? segmentMenuFilterText : inputText;
  if (!isMultiSelectOperator(selectedOperator)) return raw;
  return raw.split(',').pop()?.trim() ?? '';
};

/**
 * Derive the filter text for the value menu.
 *
 * For multi-select operators, uses the current value token (the one the user
 * is actively typing). If that token already matches a known value, returns
 * `''` so the dropdown shows all options — the user just finished a selection
 * and is about to start the next one.
 *
 * For single-value operators, returns the token as-is.
 */
export const getValueFilterText = (
  currentTokenText: string,
  selectedOperator: FilterOperator | null,
  fieldValues: FieldValueOption[],
): string => {
  if (!isMultiSelectOperator(selectedOperator)) return currentTokenText;
  if (!currentTokenText) return '';

  // If the last token matches a field value label/value, it's a completed selection — don't filter
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
