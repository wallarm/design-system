import type { FieldType, FilterOperator } from '../types';
import {
  MULTI_SELECT_OPERATORS,
  NO_VALUE_OPERATORS,
  OPERATOR_LABELS,
  OPERATOR_LABELS_BY_TYPE,
} from './constants';

/**
 * Helper to get operator label for specific field type
 */
export const getOperatorLabel = (operator: FilterOperator, fieldType: FieldType): string =>
  OPERATOR_LABELS_BY_TYPE[fieldType]?.[operator] ?? OPERATOR_LABELS[operator];

/**
 * Reverse lookup: get raw FilterOperator from its display label and field type
 */
export const getOperatorFromLabel = (
  label: string,
  fieldType: FieldType,
): FilterOperator | null => {
  // Check type-specific labels first (more specific)
  const typeLabels = OPERATOR_LABELS_BY_TYPE[fieldType];
  const typeMatch = Object.entries(typeLabels).find(([, lbl]) => lbl === label);
  if (typeMatch) return typeMatch[0] as FilterOperator;
  // Fall back to generic labels
  const genericMatch = Object.entries(OPERATOR_LABELS).find(([, lbl]) => lbl === label);
  return genericMatch ? (genericMatch[0] as FilterOperator) : null;
};

/** Check if operator supports multi-select */
export const isMultiSelectOperator = (op: FilterOperator | null): op is FilterOperator =>
  op !== null && (MULTI_SELECT_OPERATORS as readonly string[]).includes(op);

/** Check if operator requires no value (unary) */
export const isNoValueOperator = (op: FilterOperator): boolean =>
  (NO_VALUE_OPERATORS as readonly string[]).includes(op);

/** Check if operator is a between/range operator */
export const isBetweenOperator = (op: FilterOperator | null): boolean => op === 'between';
