import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import type { Condition, FilterInputChipData } from '../../types';

/**
 * Display-only overlay for backend-rejected fields: marks built chips whose
 * condition's field is listed, leaving conditions untouched. Working on chips
 * (not conditions) keeps `condition.error` clear, so the flag never leaks into
 * `onChange` round-trips, `parseFilterInputErrors` produces no duplicate
 * message, and `buildChips`' cross-field label resolution (which keys off
 * `condition.error`) is not falsely activated for raw freeform values.
 * The consumer owns the error text (e.g. an alert with the backend response).
 */
export const applyExternalErrors = (
  chips: FilterInputChipData[],
  conditions: Condition[],
  externalErrors: string[] | undefined,
): FilterInputChipData[] => {
  if (!externalErrors?.length) return chips;
  const errored = new Set(externalErrors);
  let conditionIdx = -1;
  return chips.map(chip => {
    if (chip.variant !== 'chip') return chip;
    conditionIdx += 1;
    const condition = conditions[conditionIdx];
    return condition && !chip.disabled && !chip.error && errored.has(condition.field)
      ? { ...chip, error: SEGMENT_VARIANT.value }
      : chip;
  });
};
