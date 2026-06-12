import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import type { Condition } from '../../types';

/**
 * Display-only overlay for backend-rejected fields: marks matching conditions
 * with a value error before chips are built. Synced conditions are left
 * untouched, so the flag never leaks into `onChange` round-trips and
 * `parseFilterInputErrors` does not produce a duplicate message — the consumer
 * owns the error text (e.g. an alert with the backend response).
 */
export const applyExternalErrors = (
  conditions: Condition[],
  externalErrors: string[] | undefined,
): Condition[] => {
  if (!externalErrors?.length) return conditions;
  const errored = new Set(externalErrors);
  return conditions.map(c =>
    !c.disabled && !c.error && errored.has(c.field) ? { ...c, error: SEGMENT_VARIANT.value } : c,
  );
};
