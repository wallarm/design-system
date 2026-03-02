import type { Condition, ExprNode, FilterOperator } from '../types';

/**
 * Parse Result
 * Contains the parsed expression and any incomplete text
 */
export interface ParseResult {
  /** Parsed expression tree (null if parsing incomplete/failed) */
  expression: ExprNode | null;
  /** Unparsed/incomplete text remaining */
  remainingText: string;
  /** Whether the current input is complete */
  isComplete: boolean;
}

/**
 * Supported operators for basic parsing
 * Ordered by length (longest first) to match correctly
 */
const OPERATORS: FilterOperator[] = [
  '>=',
  '<=',
  '!=',
  '=',
  '>',
  '<',
  'like',
  'not_like',
];

/**
 * Parse a simple condition: "field operator value"
 *
 * Examples:
 * - "status = active" → { field: 'status', operator: '=', value: 'active' }
 * - "count > 10" → { field: 'count', operator: '>', value: '10' }
 * - "name like test" → { field: 'name', operator: 'like', value: 'test' }
 *
 * @param input - Input text to parse
 * @returns ParseResult with expression or remaining text
 */
export function parseCondition(input: string): ParseResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      expression: null,
      remainingText: '',
      isComplete: false,
    };
  }

  // Find operator in the input
  let foundOperator: FilterOperator | null = null;
  let operatorIndex = -1;

  for (const op of OPERATORS) {
    const index = trimmed.indexOf(op);
    if (index !== -1) {
      // Make sure it's a complete operator match (word boundaries)
      const beforeOp = index === 0 ? ' ' : trimmed[index - 1];
      const afterOp = index + op.length >= trimmed.length ? ' ' : trimmed[index + op.length];

      // For word operators (like, not_like), check word boundaries
      if (op.match(/[a-z]/)) {
        if (beforeOp.match(/\s/) && afterOp.match(/\s/)) {
          foundOperator = op;
          operatorIndex = index;
          break;
        }
      } else {
        // For symbol operators, just use them
        foundOperator = op;
        operatorIndex = index;
        break;
      }
    }
  }

  // If no operator found, input is incomplete
  if (!foundOperator || operatorIndex === -1) {
    return {
      expression: null,
      remainingText: trimmed,
      isComplete: false,
    };
  }

  // Extract field, operator, and value
  const field = trimmed.slice(0, operatorIndex).trim();
  const valueStart = operatorIndex + foundOperator.length;
  const value = trimmed.slice(valueStart).trim();

  // Check if we have all three parts
  if (!field) {
    return {
      expression: null,
      remainingText: trimmed,
      isComplete: false,
    };
  }

  if (!value) {
    // Field and operator present, waiting for value
    return {
      expression: null,
      remainingText: trimmed,
      isComplete: false,
    };
  }

  // Parse value to appropriate type
  let parsedValue: string | number | boolean | null = value;

  // Try to parse as number
  const numValue = Number(value);
  if (!isNaN(numValue) && value === String(numValue)) {
    parsedValue = numValue;
  }
  // Try to parse as boolean
  else if (value === 'true' || value === 'false') {
    parsedValue = value === 'true';
  }
  // Try to parse as null
  else if (value === 'null') {
    parsedValue = null;
  }

  // Create Condition object
  const condition: Condition = {
    type: 'condition',
    field,
    operator: foundOperator,
    value: parsedValue,
  };

  return {
    expression: condition,
    remainingText: '',
    isComplete: true,
  };
}

/**
 * Main parse function
 * Currently only handles single conditions (US-002)
 * Will be extended in US-009 and US-010 for AND/OR and parentheses
 *
 * @param input - Input text to parse
 * @returns ParseResult
 */
export function parse(input: string): ParseResult {
  // For now, just parse a single condition
  // This will be extended in future user stories
  return parseCondition(input);
}
