import type { ReactNode } from 'react';

/**
 * FilterInput Chip Variant Types
 */
export type FilterInputChipVariant = 'chip' | 'and' | 'or' | '(' | ')';

/**
 * FilterInput Chip Data Interface
 */
/** Which segment of a chip has an error: attribute or value (true = whole chip) */
export type ChipErrorSegment = boolean | 'attribute' | 'value';

export interface FilterInputChipData {
  id: string;
  variant: FilterInputChipVariant;
  attribute?: string;
  operator?: string;
  value?: string;
  error?: ChipErrorSegment;
  /** Individual display parts for multi-value chips (avoids comma-split issues) */
  valueParts?: string[];
  /** Separator between valueParts (default: ", ") */
  valueSeparator?: string;
  /** Indices of invalid values in a multi-value chip (e.g. "in" operator) */
  errorValueIndices?: number[];
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
  /**
   * Shorthand for simple string values (e.g. `["GET", "POST", "PUT"]`).
   * Automatically converted to `FieldValueOption[]` where `value === label`.
   * Empty array `[]` means freeform input — no dropdown, user types any value.
   */
  options?: string[];
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
  /** Per-condition validation error: true = whole chip, 'attribute'/'value' = specific segment */
  error?: ChipErrorSegment;
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
export interface FilterInputDropdownItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Value to return on selection */
  value: unknown;
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
  renderContent?: (item: FilterInputDropdownItem) => ReactNode;
}

/**
 * Section in a dropdown menu (group of items)
 */
export interface FilterInputDropdownSection {
  /** Unique identifier */
  id: string;
  /** Optional section title/header */
  title?: string;
  /** Items in this section */
  items: FilterInputDropdownItem[];
  /** Whether to show separator after this section */
  showSeparator?: boolean;
}
