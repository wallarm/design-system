import type { FieldType, FilterOperator, QueryBarChipVariant } from '../types';

/**
 * Operators that require no value (unary)
 */
export const NO_VALUE_OPERATORS: readonly FilterOperator[] = ['is_null', 'is_not_null'] as const;

/**
 * Operators that support multi-select values
 */
export const MULTI_SELECT_OPERATORS: readonly FilterOperator[] = ['in', 'not_in'] as const;

/**
 * Pattern to extract condition index from chip ID (e.g. "chip-2" → 2)
 */
export const CHIP_ID_PATTERN = /^chip-(\d+)$/;

/**
 * Labels for non-chip filter chip variants (connectors, brackets)
 */
export const VARIANT_LABELS: Partial<Record<QueryBarChipVariant, string>> = {
  and: 'AND',
  or: 'OR',
  '(': '(',
  ')': ')',
};

/**
 * Operator Symbol Mapping
 * Maps operators to their raw symbol displayed on the right side of menus
 */
export const OPERATOR_SYMBOLS: Record<FilterOperator, string> = {
  '=': '=',
  '!=': '!=',
  '>': '>',
  '<': '<',
  '>=': '>=',
  '<=': '<=',
  like: '~',
  not_like: '!~',
  in: 'IN',
  not_in: 'NOT IN',
  is_null: '= null',
  is_not_null: '!= null',
  between: '<>',
};

/**
 * Operator Label Mapping
 * Maps operator symbols to human-readable labels
 */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  '=': 'is',
  '!=': 'is not',
  '>': 'greater',
  '<': 'less',
  '>=': 'greater or equal',
  '<=': 'less or equal',
  like: 'like',
  not_like: 'not like',
  in: 'is any of',
  not_in: 'is not any of',
  // Note: "is set" means the field has a value (IS NOT NULL), matching Wallarm API semantics
  is_null: 'is set',
  is_not_null: 'is not set',
  between: 'between',
};

/**
 * Field type-specific operator labels
 * Some operators have different labels depending on field type
 */
export const OPERATOR_LABELS_BY_TYPE: Record<FieldType, Partial<Record<FilterOperator, string>>> = {
  string: {
    is_null: 'is set',
    is_not_null: 'is not set',
  },
  integer: {},
  float: {},
  date: {
    '>': 'after',
    '>=': 'on or after',
    '<': 'before',
    '<=': 'on or before',
    '=': 'on',
    '!=': 'not on',
    between: 'between',
  },
  boolean: {
    '=': 'is true',
    '!=': 'is false',
    is_null: 'is set',
    is_not_null: 'is not set',
  },
  enum: {
    in: 'is any of',
    not_in: 'is not any of',
    is_null: 'is set',
    is_not_null: 'is not set',
  },
};

/**
 * Operators by Field Type Mapping (with groups for separators)
 * Maps field types to their available operators, grouped logically
 */
export const OPERATORS_BY_TYPE: Record<FieldType, FilterOperator[][]> = {
  string: [
    ['=', '!=', 'in', 'like', 'not_like'],
    ['is_null', 'is_not_null'],
  ],
  integer: [
    ['=', '!=', '>', '<', '>=', '<='],
    ['in'],
  ],
  float: [['=', '!=', '>', '<', '>=', '<=']],
  date: [['>', '>=', '<', '<=', '=', '!=', 'between']],
  boolean: [['=', '!=', 'is_null', 'is_not_null']],
  enum: [
    ['=', '!=', 'in', 'not_in'],
    ['is_null', 'is_not_null'],
  ],
};
