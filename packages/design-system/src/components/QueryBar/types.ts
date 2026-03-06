import type { ReactNode } from 'react';

/**
 * QueryBar Chip Variant Types
 */
export type QueryBarChipVariant = 'chip' | 'and' | 'or' | '(' | ')';

/**
 * QueryBar Chip Data Interface
 */
export interface QueryBarChipData {
  id: string;
  variant: QueryBarChipVariant;
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
  value: string | number | boolean | null | Array<string | number | boolean>;
  /** Per-condition validation error (e.g. value not in allowed list) */
  error?: boolean;
  /** For date fields: tracks whether the value originated as relative preset or absolute date */
  dateOrigin?: 'relative' | 'absolute';
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
 * Autocomplete menu state
 */
export type MenuState = 'closed' | 'field' | 'operator' | 'value';

/**
 * Item in a dropdown menu
 */
export interface QueryBarDropdownItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Value to return on selection */
  value: any;
  /** Optional icon to display */
  icon?: ReactNode;
  /** Optional badge with color and text */
  badge?: {
    color: string;
    text: string;
  };
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item shows a submenu arrow */
  hasSubmenu?: boolean;
  /** Custom renderer for item content */
  renderContent?: (item: QueryBarDropdownItem) => ReactNode;
}

/**
 * Section in a dropdown menu (group of items)
 */
export interface QueryBarDropdownSection {
  /** Unique identifier */
  id: string;
  /** Optional section title/header */
  title?: string;
  /** Items in this section */
  items: QueryBarDropdownItem[];
  /** Whether to show separator after this section */
  showSeparator?: boolean;
}
