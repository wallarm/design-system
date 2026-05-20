import type { FieldMetadata, FieldType, FilterOperator, MenuState } from '../types';
import {
  MULTI_SELECT_OPERATORS,
  NO_VALUE_OPERATORS,
  OPERATOR_LABELS,
  OPERATOR_LABELS_BY_TYPE,
  OPERATORS_BY_TYPE,
} from './constants';

/**
 * Placeholder in no-value operator chips so every chip visually has 3
 * segments. Co-located with isNoValueOperator so committed and
 * building-preview paths can't drift.
 */
export const NO_VALUE_PLACEHOLDER = '—';

/** Get operator label for a specific field type. */
export const getOperatorLabel = (operator: FilterOperator, fieldType: FieldType): string =>
  OPERATOR_LABELS_BY_TYPE[fieldType]?.[operator] ?? OPERATOR_LABELS[operator];

/** Reverse lookup: FilterOperator from display label and field type. */
export const getOperatorFromLabel = (
  label: string,
  fieldType: FieldType,
): FilterOperator | null => {
  const typeLabels = OPERATOR_LABELS_BY_TYPE[fieldType];
  const typeMatch = Object.entries(typeLabels).find(([, lbl]) => lbl === label);
  if (typeMatch) return typeMatch[0] as FilterOperator;
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

/** Get the list of operators a field allows (custom override or full type list) */
export const getFieldOperators = (field: FieldMetadata): FilterOperator[] =>
  field.operators ?? OPERATORS_BY_TYPE[field.type].flat();

/** Check whether an operator is supported by a field's type/override list */
export const isOperatorAllowedForField = (
  field: FieldMetadata,
  operator: FilterOperator,
): boolean => getFieldOperators(field).includes(operator);

/**
 * Next menu to open to continue building a chip; null when fully built.
 * Shared by useFocusManagement (refocus) and useInputHandlers (click).
 */
export const nextBuildingMenu = (
  field: FieldMetadata | null,
  operator: FilterOperator | null,
): MenuState | null => {
  if (!field) return 'field';
  if (!operator) return 'operator';
  return 'value';
};

/**
 * True if the in-progress (field, operator, value) triple has all segments.
 * No-value operators (is_null/is_not_null) are complete without a value.
 */
export const isBuildingComplete = (
  field: FieldMetadata | null,
  operator: FilterOperator | null,
  value: string | number | boolean | Array<string | number | boolean> | null | undefined,
): boolean => {
  if (!field || !operator) return false;
  if (isNoValueOperator(operator)) return true;
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value !== '';
};

/**
 * True when two operators share value shape (multi-select/between/no-value
 * categories match) — a value preview built for `a` is reusable for `b`.
 */
export const isValueShapeCompatible = (
  a: FilterOperator | null,
  b: FilterOperator | null,
): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (isMultiSelectOperator(a) !== isMultiSelectOperator(b)) return false;
  if (isBetweenOperator(a) !== isBetweenOperator(b)) return false;
  if (isNoValueOperator(a) !== isNoValueOperator(b)) return false;
  return true;
};
