import type { FieldMetadata, FilterOperator } from '../../types';
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

/** Get allowed values for a field, or null if freeform */
const getAllowedValues = (field: FieldMetadata): Set<string> | null => {
  if (field.values && field.values.length > 0) {
    return new Set(field.values.map(v => String(v.value)));
  }
  if (field.options && field.options.length > 0) {
    return new Set(field.options);
  }
  return null;
};

export const validateValues = (
  s: ParserState,
  fieldName: string,
  values: Array<string | number>,
): void => {
  const field = s.fields.find(f => f.name === fieldName);
  if (!field) return;

  const allowed = getAllowedValues(field);
  if (!allowed) return;

  const invalid = values.filter(v => !allowed.has(String(v)));
  if (invalid.length > 0) {
    const formatted = invalid.map(v => `"${v}"`).join(', ');
    throw FilterParseError(`Invalid value ${formatted} for field '${fieldName}'`);
  }
};
