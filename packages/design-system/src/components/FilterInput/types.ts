import type { ReactNode } from 'react';
import type { BadgeColor } from '../Badge';

/**
 * FilterInput Chip Variant Types
 */
export type FilterInputChipVariant = 'chip' | 'and' | 'or' | '(' | ')';

/**
 * FilterInput Chip Data Interface
 */
/** Which segment of a chip has an error: attribute or value (true = whole chip) */
export type ChipErrorSegment = boolean | 'attribute' | 'value';

/**
 * Shared signature of the upsertCondition callback owned by useFilterInputExpression.
 * Re-declared in several option interfaces — exported here to keep the source of
 * truth single-rooted (changes to the signature reach all consumers).
 */
export type UpsertCondition = (
  field: FieldMetadata,
  operator: FilterOperator | undefined,
  val: string | number | boolean | null | Array<string | number | boolean>,
  editingChipId?: string | null,
  atIndex?: number,
  error?: ChipErrorSegment,
  dateOrigin?: 'relative' | 'absolute',
  /** When 1, write the paired (second) triplet onto the target condition instead
   *  of replacing the base triplet. Defaults to 0 (base triplet). */
  side?: 0 | 1,
) => void;

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
  /** When true, the chip cannot be edited or removed */
  disabled?: boolean;
  /** Second paired triplet (display) for two-step fields. */
  pair?: {
    attribute: string;
    operator?: string;
    value?: string;
    error?: ChipErrorSegment;
  };
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
  badge?: { color: BadgeColor; text: string };
  /**
   * Optional secondary text rendered as a muted line beneath the bold `label`
   * in the value dropdown (e.g. a backend path that explains or disambiguates
   * the option). Display-only — never committed as a filter value. Because the
   * bold `label` need not be unique, this line is what distinguishes rows that
   * share a label (two `request-id` rows with different paths).
   */
  description?: string;
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
  /**
   * When `false`, `values`/`options` are suggestions rather than an exhaustive
   * allowlist: the dropdown still offers them, but any typed value commits
   * without an allowlist error. Data-type validation (`isValueOfType`) still
   * applies. Defaults to `true` (options are a strict allowlist).
   */
  strictValues?: boolean;
  /**
   * Optional callback to compute value suggestions dynamically from the current
   * input text. When provided, takes precedence over `values` and `options`.
   * The returned list is still post-filtered by `filterAndSort`, so prefix/includes
   * matching still applies — return items that contain the input text.
   *
   * The optional `context.selectedValues` carries any values already committed
   * to the chip (in single- or multi-select form) so the helper can include
   * them in its output with their canonical presentation (e.g. a badge color)
   * even when they fall outside the current input-driven suggestions.
   */
  getSuggestions?: (
    inputText: string,
    context?: { selectedValues?: Array<string | number | boolean> },
  ) => FieldValueOption[];
  /**
   * Optional freeform-value validator. When provided, it runs in place of the
   * static-allowlist check — return `true` to mark the value invalid. Useful
   * for fields that accept arbitrary input but still have format rules
   * (e.g. HTTP status code must be 3 chars, first digit in [1..5]).
   */
  validate?: (value: string | number | boolean) => boolean;
  /**
   * Optional per-character input filter. When the user is entering a value
   * for this field (building or inline-editing the value segment), any
   * character for which this returns `false` is stripped from the input
   * on change. Separators that the filter should preserve (comma, space)
   * are allowed through unconditionally.
   */
  acceptChar?: (char: string) => boolean;
  /**
   * Optional value normalizer. Runs on commit (after Enter / blur) before
   * `validate`, so consumers can auto-complete partial input — e.g. a status
   * code helper can turn "2" into "2XX" or "22" into "22X". Multi-select
   * commits apply this per token.
   */
  normalize?: (value: string | number | boolean) => string | number | boolean;
  /**
   * Optional backend-value transformer. The UI stores whatever
   * `normalize` produced (e.g. `"2XX"`), but some backends want a
   * stripped form (e.g. `"2"`). Pass the expression tree through
   * `applyFieldValueTransforms(expr, fields)` — or a string through
   * `serializeExpression(expr, fields)` — to apply this hook when
   * emitting the query. Display in the chip is unaffected.
   */
  serializeValue?: (value: string | number | boolean) => string | number | boolean;
  /**
   * When set, this field is a two-step paired field: the chip holds a second
   * attribute/operator/value triplet. The paired segment is a full field
   * definition (label, type, operators, values, validate, …). Nesting is one
   * level only — a pairedField's own `pairedField` is ignored.
   */
  pairedField?: FieldMetadata;
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
  /** Operator may be absent when the chip was committed incomplete (blur during building) */
  operator?: FilterOperator;
  value: string | number | boolean | null | Array<string | number | boolean>;
  /** Per-condition validation error: true = whole chip, 'attribute'/'value' = specific segment */
  error?: ChipErrorSegment;
  /** For date fields: tracks whether the value originated as relative preset or absolute date */
  dateOrigin?: 'relative' | 'absolute';
  /** When true, the condition cannot be edited or removed */
  disabled?: boolean;
  /** Second paired triplet. Present only for fields with `pairedField`. */
  pair?: {
    operator?: FilterOperator;
    value: string | number | boolean | null | Array<string | number | boolean>;
    error?: ChipErrorSegment;
    dateOrigin?: 'relative' | 'absolute';
  };
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
