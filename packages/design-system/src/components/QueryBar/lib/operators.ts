import type { FieldType, FilterOperator } from '../types';
import { OPERATOR_LABELS, OPERATOR_LABELS_BY_TYPE } from './constants';

/**
 * Helper to get operator label for specific field type
 */
export const getOperatorLabel = (operator: FilterOperator, fieldType: FieldType): string =>
  OPERATOR_LABELS_BY_TYPE[fieldType]?.[operator] ?? OPERATOR_LABELS[operator];

/**
 * Reverse lookup: get raw FilterOperator from its display label and field type
 */
export const getOperatorFromLabel = (label: string, fieldType: FieldType): FilterOperator | null => {
  // Check type-specific labels first (more specific)
  const typeLabels = OPERATOR_LABELS_BY_TYPE[fieldType];
  for (const [op, lbl] of Object.entries(typeLabels)) {
    if (lbl === label) return op as FilterOperator;
  }
  // Fall back to generic labels
  for (const [op, lbl] of Object.entries(OPERATOR_LABELS)) {
    if (lbl === label) return op as FilterOperator;
  }
  return null;
};
