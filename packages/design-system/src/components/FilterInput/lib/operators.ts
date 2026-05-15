import type { FieldMetadata, FieldType, FilterOperator, MenuState } from '../types';
import {
  MULTI_SELECT_OPERATORS,
  NO_VALUE_OPERATORS,
  OPERATOR_LABELS,
  OPERATOR_LABELS_BY_TYPE,
  OPERATORS_BY_TYPE,
} from './constants';

/**
 * Filler text shown in the value slot of no-value operator chips so every
 * chip visually has three segments. Kept here next to `isNoValueOperator`
 * so committed (buildChips) and building-preview (deriveAutocompleteValues)
 * paths can never drift.
 */
export const NO_VALUE_PLACEHOLDER = '—';

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

/** Get the list of operators a field allows (custom override or full type list) */
export const getFieldOperators = (field: FieldMetadata): FilterOperator[] =>
  field.operators ?? OPERATORS_BY_TYPE[field.type].flat();

/** Check whether an operator is supported by a field's type/override list */
export const isOperatorAllowedForField = (
  field: FieldMetadata,
  operator: FilterOperator,
): boolean => getFieldOperators(field).includes(operator);

/**
 * The menu that should open to continue building a chip from its current
 * state. Returns null when the chip is fully built and nothing should open.
 * Reused by the refocus path (useFocusManagement) and the main-input click
 * path (useInputHandlers) so both stay in sync.
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
 * Decide whether the in-progress (field, operator, value) triple is fully
 * built — i.e. has all the segments the chip needs. No-value operators
 * (is_null / is_not_null) are complete without a value: the chip renders a
 * value-placeholder in that slot so it still visually has three segments.
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
 * Check whether two operators handle values in compatible shapes
 * (multi-select / between / no-value categories match), meaning a value
 * preview built for `a` can be reused as-is for `b`.
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
