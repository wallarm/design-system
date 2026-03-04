import type { Condition, ExprNode, FilterOperator } from '../types';

export interface ParseResult {
  expression: ExprNode | null;
  remainingText: string;
  isComplete: boolean;
}

/**
 * Parse a simple condition: field operator value
 * Examples: "status = active", "priority > 5", "name like test"
 */
export const parseCondition = (input: string): ParseResult => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { expression: null, remainingText: '', isComplete: false };
  }

  // Operators ordered by length (longest first for correct matching)
  const operators: FilterOperator[] = [
    'is_not_null',
    'is_null',
    'not_like',
    'not_in',
    'between',
    '>=',
    '<=',
    '!=',
    'like',
    'in',
    '=',
    '>',
    '<',
  ];

  // Find operator in input
  let operatorMatch: FilterOperator | null = null;
  let operatorIndex = -1;

  for (const op of operators) {
    const index = trimmed.indexOf(op);
    if (index > 0) {
      operatorMatch = op;
      operatorIndex = index;
      break;
    }
  }

  // No operator found - incomplete
  if (!operatorMatch || operatorIndex === -1) {
    return { expression: null, remainingText: trimmed, isComplete: false };
  }

  // Extract field name (before operator)
  const field = trimmed.substring(0, operatorIndex).trim();

  if (!field) {
    return { expression: null, remainingText: trimmed, isComplete: false };
  }

  // Extract value part (after operator)
  const afterOperator = trimmed.substring(operatorIndex + operatorMatch.length).trim();

  // Operators that don't need values
  const noValueOps: FilterOperator[] = ['is_null', 'is_not_null'];
  if (noValueOps.includes(operatorMatch)) {
    const condition: Condition = {
      type: 'condition',
      field,
      operator: operatorMatch,
      value: null,
    };
    return { expression: condition, remainingText: '', isComplete: true };
  }

  // Need value for other operators
  if (!afterOperator) {
    return { expression: null, remainingText: trimmed, isComplete: false };
  }

  // Parse value - handle quoted strings
  let value: string | number | boolean | null = null;
  const valueStr = afterOperator;

  // Handle quoted strings (both single and double quotes)
  if ((valueStr.startsWith('"') && valueStr.endsWith('"')) ||
      (valueStr.startsWith("'") && valueStr.endsWith("'"))) {
    value = valueStr.slice(1, -1);
  } else {
    // Auto-detect value type
    if (valueStr === 'null') {
      value = null;
    } else if (valueStr === 'true') {
      value = true;
    } else if (valueStr === 'false') {
      value = false;
    } else if (!isNaN(Number(valueStr))) {
      value = Number(valueStr);
    } else {
      value = valueStr;
    }
  }

  const condition: Condition = {
    type: 'condition',
    field,
    operator: operatorMatch,
    value,
  };

  return { expression: condition, remainingText: '', isComplete: true };
};

/**
 * Parse a filter expression (currently only single conditions)
 * Future: will support AND/OR logic
 */
export const parse = (input: string): ParseResult => parseCondition(input);
