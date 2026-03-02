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
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater than or equal to',
  '<=': 'less than or equal to',
  like: 'contains',
  not_like: 'does not contain',
  in: 'is one of',
  not_in: 'is not one of',
  is_null: 'is empty',
  is_not_null: 'is not empty',
  between: 'is between',
};

/**
 * Operators by Field Type Mapping
 * Maps field types to their available operators
 */
export const OPERATORS_BY_TYPE: Record<FieldType, FilterOperator[]> = {
  string: ['=', '!=', 'like', 'not_like', 'in', 'not_in', 'is_null', 'is_not_null'],
  integer: ['=', '!=', '>', '<', '>=', '<=', 'between', 'in', 'not_in', 'is_null', 'is_not_null'],
  float: ['=', '!=', '>', '<', '>=', '<=', 'between', 'is_null', 'is_not_null'],
  date: ['=', '!=', '>', '<', '>=', '<=', 'between', 'is_null', 'is_not_null'],
  boolean: ['=', '!=', 'is_null', 'is_not_null'],
  enum: ['=', '!=', 'in', 'not_in', 'is_null', 'is_not_null'],
};
