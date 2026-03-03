/**
 * Filter Chip Variant Types
 */
export type FilterChipVariant = 'chip' | 'and' | 'or' | '(' | ')';

/**
 * Filter Chip Data Interface
 */
export interface FilterChipData {
  id: string;
  variant: FilterChipVariant;
  attribute?: string;
  operator?: string;
  value?: string;
  error?: boolean;
}

/**
 * Field Type for filter attributes
 */
export type FieldType = 'string' | 'integer' | 'date' | 'float' | 'boolean' | 'enum';

/**
 * Filter Operator Type
 */
export type FilterOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'like'
  | 'not_like'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'between';

/**
 * Value option for enum/select fields
 */
export interface FieldValueOption {
  value: string | number | boolean;
  label: string;
  badge?: { color: string; text: string };
}

/**
 * Field Metadata Interface
 * Matches backend structure for field definitions
 */
export interface FieldMetadata {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  operators?: FilterOperator[];
  default?: string | number | boolean;
  values?: FieldValueOption[];
}

/**
 * Expression Tree Types
 */

/**
 * Condition Node - Represents a single filter condition
 */
export interface Condition {
  type: 'condition';
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | null;
}

/**
 * Group Node - Represents a grouped expression with AND/OR logic
 */
export interface Group {
  type: 'group';
  operator: 'and' | 'or';
  children: ExprNode[];
}

/**
 * Expression Node - Can be either a Condition or a Group
 */
export type ExprNode = Condition | Group;

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
    '<=': 'is on or before',
  },
  boolean: {
    '=': 'is true',
    '!=': 'is false',
    is_null: 'is set',
    is_not_null: 'is not set',
  },
  enum: {
    in: 'is any of 🤔 wip',
    not_in: 'is not any of 🤔 wip',
    is_null: 'is set',
    is_not_null: 'is not set',
  },
};

/**
 * Helper to get operator label for specific field type
 */
export function getOperatorLabel(operator: FilterOperator, fieldType: FieldType): string {
  return OPERATOR_LABELS_BY_TYPE[fieldType]?.[operator] ?? OPERATOR_LABELS[operator];
}

/**
 * Reverse lookup: get raw FilterOperator from its display label and field type
 */
export function getOperatorFromLabel(label: string, fieldType: FieldType): FilterOperator | null {
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
}

/**
 * Operators by Field Type Mapping (with groups for separators)
 * Maps field types to their available operators, grouped logically
 */
export const OPERATORS_BY_TYPE: Record<FieldType, FilterOperator[][]> = {
  string: [
    ['=', '!=', 'like', 'not_like'],
    ['is_null', 'is_not_null'],
  ],
  integer: [['=', '!=', '>', '<', '>=', '<=']],
  float: [['=', '!=', '>', '<', '>=', '<=']],
  date: [['>', '>=', '<', '<=', '=', '!=', 'between']],
  boolean: [['=', '!=', 'is_null', 'is_not_null']],
  enum: [
    ['=', '!=', 'in', 'not_in'],
    ['is_null', 'is_not_null'],
  ],
};
