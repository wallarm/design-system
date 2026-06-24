import type { FieldType, FilterInputChipVariant, FilterOperator } from '../types';

/** Operators that require no value (unary). */
export const NO_VALUE_OPERATORS: readonly FilterOperator[] = ['is_null', 'is_not_null'] as const;

/** Operators that support multi-select values. */
export const MULTI_SELECT_OPERATORS: readonly FilterOperator[] = ['in', 'not_in'] as const;

/** Extract condition index from chip ID (e.g. "chip-2" → 2). */
export const CHIP_ID_PATTERN = /^chip-(\d+)$/;

/** Extract condition index from connector ID. */
export const CONNECTOR_ID_PATTERN = /^connector-(\d+)$/;

/** DOM selector for the FilterInput root element. */
export const QUERY_BAR_SELECTOR = '[data-slot="filter-input"]';

/** Gap between the dropdown and the field border in the empty/initial state. */
export const MENU_BASE_GUTTER = 4;

/** Extra vertical offset added to the anchor's bottom when the dropdown is
 *  anchored to a chip / input — total visual gap becomes
 *  MENU_BASE_GUTTER + MENU_CHIP_GUTTER_OFFSET (12). */
export const MENU_CHIP_GUTTER_OFFSET = 8;

/** Labels for non-chip filter chip variants (connectors, brackets). */
export const VARIANT_LABELS: Partial<Record<FilterInputChipVariant, string>> = {
  and: 'AND',
  or: 'OR',
  '(': '(',
  ')': ')',
};

/** Raw operator symbols shown on the right side of menus. */
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
  // Wallarm API inverts SQL semantics: is_null = "is set" (value != null),
  // is_not_null = "is not set" (value == null). The symbol hints follow the
  // meaning, not the operator key.
  is_null: '!= null',
  is_not_null: '= null',
  between: '<>',
};

/** Human-readable labels for operator symbols. */
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
  is_null: 'is not set',
  is_not_null: 'is set',
  between: 'between',
};

/** Field-type-specific operator labels (some override the generic ones). */
export const OPERATOR_LABELS_BY_TYPE: Record<FieldType, Partial<Record<FilterOperator, string>>> = {
  string: {
    '=': 'is',
    '!=': 'is not',
    in: 'in',
    like: 'like',
    not_like: 'not like',
    is_null: 'is set',
    is_not_null: 'is not set',
  },
  integer: {
    '=': 'is',
    '!=': 'is not',
    '>': 'greater',
    '<': 'less',
    '>=': 'greater or equal',
    '<=': 'less or equal',
    in: 'in',
  },
  float: {
    '=': 'is',
    '!=': 'is not',
    '>': 'greater',
    '<': 'less',
    '>=': 'greater or equal',
    '<=': 'less or equal',
  },
  date: {
    '=': 'is',
    '!=': 'is not',
    '>': 'after',
    '<': 'before',
    '>=': 'on or after',
    '<=': 'on or before',
    between: 'in between',
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

/** Operators per field type, grouped for menu separators. */
export const OPERATORS_BY_TYPE: Record<FieldType, FilterOperator[][]> = {
  string: [
    ['=', '!=', 'in', 'like', 'not_like'],
    ['is_null', 'is_not_null'],
  ],
  integer: [['=', '!=', '>', '<', '>=', '<='], ['in']],
  float: [['=', '!=', '>', '<', '>=', '<=']],
  date: [['>', '>=', '<', '<=', '=', '!=', 'between']],
  boolean: [['=', '!=', 'is_null', 'is_not_null']],
  enum: [
    ['=', '!=', 'in', 'not_in'],
    ['is_null', 'is_not_null'],
  ],
};
