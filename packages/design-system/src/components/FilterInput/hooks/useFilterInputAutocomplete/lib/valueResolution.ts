import { MIN_DATE_STRING_LENGTH } from '../../../FilterInputMenu/FilterInputDateValueMenu/constants';
import {
  chipIdToConditionIndex,
  findMatchingFieldValue,
  getFieldValues,
  getInvalidValueIndices,
  hasStaticAllowlist,
  isDatePreset,
} from '../../../lib';
import type { Condition, FieldMetadata, FilterOperator } from '../../../types';

/** Resolve a text input to the actual field value (e.g. label "Active" → value "active") */
export const resolveFieldValue = (
  field: FieldMetadata,
  text: string,
): string | number | boolean => {
  const match = findMatchingFieldValue(getFieldValues(field), text);
  return match ? match.value : text;
};

/** Resolve and validate a single-select value from text */
export const resolveSingleValue = (
  field: FieldMetadata,
  trimmed: string,
): { resolved: string | number | boolean; error: boolean | undefined } => {
  const fv = getFieldValues(field);
  const match = findMatchingFieldValue(fv, trimmed);
  const raw = match ? match.value : trimmed;
  // Normalize before validation — normalized form is what ends up in the chip.
  const resolved = field.normalize ? field.normalize(raw) : raw;
  // Custom validator trumps static-allowlist check.
  if (field.validate) {
    return { resolved, error: field.validate(resolved) ? true : undefined };
  }
  return {
    resolved,
    error: hasStaticAllowlist(field) && fv.length > 0 && !match ? true : undefined,
  };
};

/** Resolve and validate multi-select values from comma-separated text */
export const resolveMultiValues = (
  field: FieldMetadata,
  trimmed: string,
): { resolved: Array<string | number | boolean>; error: boolean | undefined } => {
  const parts = trimmed
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const raw = parts.map(part => resolveFieldValue(field, part));
  // Normalize per token (e.g. "2, 3" → "2XX, 3XX").
  const resolved = field.normalize ? raw.map(v => field.normalize!(v)) : raw;
  const error = getInvalidValueIndices(field, resolved).length > 0 ? true : undefined;
  return { resolved, error };
};

/**
 * Convert a display date string (e.g. "Mar 5, 2026") to ISO format ("2026-03-05").
 * Uses local date components to avoid timezone shifts.
 */
export const displayDateToIso = (display: string): string | null => {
  if (!display || display.length < MIN_DATE_STRING_LENGTH) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(display)) return display;
  const date = new Date(display);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Resolve a "between" date range text (e.g. "Mar 5, 2026 – Mar 15, 2026")
 * into an [from, to] ISO string array. Returns null if parsing fails.
 */
export const resolveDateRangeValue = (trimmed: string): [string, string] | null => {
  const parts = trimmed.split(' – ');
  if (parts.length !== 2) return null;
  const from = displayDateToIso(parts[0]!.trim());
  const to = displayDateToIso(parts[1]!.trim());
  if (!from || !to) return null;
  return [from, to];
};

/** Validate and resolve a date value from text */
export const resolveDateValue = (
  trimmed: string,
  editingChipId: string | null,
  conditions: Condition[],
): { error: boolean | undefined; dateOrigin: 'relative' | 'absolute' | undefined } => {
  let error: boolean | undefined;
  let dateOrigin: 'relative' | 'absolute' | undefined;

  if (editingChipId) {
    const idx = chipIdToConditionIndex(editingChipId);
    const oldCondition = idx !== null ? conditions[idx] : null;
    if (oldCondition) {
      const oldVal = String(oldCondition.value ?? '');
      dateOrigin = oldCondition.dateOrigin ?? (isDatePreset(oldVal) ? 'relative' : 'absolute');
    }
  }
  const isValidPreset = isDatePreset(trimmed);
  // Reject short strings Date() parses loosely (e.g. '2' → 2001-02-01).
  const isValidDate =
    !isValidPreset &&
    trimmed.length >= MIN_DATE_STRING_LENGTH &&
    !Number.isNaN(new Date(trimmed).getTime());
  if (!isValidPreset && !isValidDate) error = true;

  return { error, dateOrigin };
};
