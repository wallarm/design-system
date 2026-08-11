import type { FilterOperator } from '../../types';
import { getInvalidValueIndices } from '../validation';
import { FilterParseError } from './error';
import { OPERATORS } from './tokenizer';
import type { ParserState } from './types';

export const validateField = (s: ParserState, name: string): void => {
  if (!s.fields.some(f => f.name === name)) {
    throw FilterParseError(`Unknown field: ${name}`);
  }
};

export const validateOperator = (s: ParserState, op: string, fieldName: string): FilterOperator => {
  if (!OPERATORS.has(op)) {
    throw FilterParseError(`Unknown operator: ${op}`);
  }
  const field = s.fields.find(f => f.name === fieldName);
  if (field?.operators && !field.operators.includes(op as FilterOperator)) {
    throw FilterParseError(`Operator '${op}' is not allowed for field '${fieldName}'`);
  }
  return op as FilterOperator;
};

/**
 * Validate pasted values through the *same* rules as inline typing
 * (`getInvalidValueIndices`): a custom `validate`, `getSuggestions` fields, and
 * `strictValues: false` all mean "the value list is a hint, not an allowlist",
 * and grouped value options are flattened to their committable leaves. Reusing
 * that one path keeps paste and typing in agreement — a value accepted when
 * typed must not be rejected when pasted (AS-1377).
 */
export const validateValues = (
  s: ParserState,
  fieldName: string,
  values: Array<string | number>,
): void => {
  const field = s.fields.find(f => f.name === fieldName);
  if (!field) return;

  const invalid = getInvalidValueIndices(field, values).map(i => values[i]);
  if (invalid.length > 0) {
    const formatted = invalid.map(v => `"${v}"`).join(', ');
    throw FilterParseError(`Invalid value ${formatted} for field '${fieldName}'`);
  }
};
