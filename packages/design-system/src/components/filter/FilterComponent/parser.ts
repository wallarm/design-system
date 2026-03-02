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
const OPERATORS: FilterOperator[] = ['>=', '<=', '!=', '=', '>', '<', 'like', 'not_like'];

/**
 * Parse a quoted string value (supports escape sequences)
 *
 * @param input - Input text starting with a quote
 * @returns Object with parsed value and remaining text, or null if incomplete
 */
function parseQuotedString(input: string): { value: string; remaining: string } | null {
  if (!input || (input[0] !== '"' && input[0] !== "'")) {
    return null;
  }

  const quote = input[0];
  let result = '';
  let i = 1;
  let escaped = false;

  while (i < input.length) {
    const char = input[i];

    if (escaped) {
      // Handle escape sequences
      if (char === quote || char === '\\') {
        result += char;
      } else {
        // For other chars, keep the backslash (could extend for \n, \t, etc.)
        result += `\\${char}`;
      }
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === quote) {
      // Found closing quote
      return {
        value: result,
        remaining: input.slice(i + 1),
      };
    } else {
      result += char;
    }

    i++;
  }

  // Quote not closed - incomplete
  return null;
}

/**
 * Parse a simple condition: "field operator value"
 *
 * Examples:
 * - "status = active" → { field: 'status', operator: '=', value: 'active' }
 * - "count > 10" → { field: 'count', operator: '>', value: '10' }
 * - "name like test" → { field: 'name', operator: 'like', value: 'test' }
 * - "title = \"hello world\"" → { field: 'title', operator: '=', value: 'hello world' }
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
      const beforeOp = index === 0 ? ' ' : (trimmed[index - 1] ?? ' ');
      const afterOp =
        index + op.length >= trimmed.length ? ' ' : (trimmed[index + op.length] ?? ' ');

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
  const valueText = trimmed.slice(valueStart).trim();

  // Check if we have all three parts
  if (!field) {
    return {
      expression: null,
      remainingText: trimmed,
      isComplete: false,
    };
  }

  if (!valueText) {
    // Field and operator present, waiting for value
    return {
      expression: null,
      remainingText: trimmed,
      isComplete: false,
    };
  }

  // Parse value to appropriate type
  let parsedValue: string | number | boolean | null;
  let remainingAfterValue = '';

  // Try to parse as quoted string first
  if (valueText[0] === '"' || valueText[0] === "'") {
    const quotedResult = parseQuotedString(valueText);
    if (!quotedResult) {
      // Quote not closed - incomplete input
      return {
        expression: null,
        remainingText: trimmed,
        isComplete: false,
      };
    }
    parsedValue = quotedResult.value;
    remainingAfterValue = quotedResult.remaining.trim();
  } else {
    // Try to parse as unquoted value (existing logic)
    // Extract first word/token as the value
    const valueMatch = valueText.match(/^(\S+)/);
    const value = valueMatch ? valueMatch[1] : valueText;

    if (!value) {
      return {
        expression: null,
        remainingText: trimmed,
        isComplete: false,
      };
    }

    remainingAfterValue = valueText.slice(value.length).trim();

    // Try to parse as number
    const numValue = Number(value);
    if (!Number.isNaN(numValue) && value === String(numValue)) {
      parsedValue = numValue;
    }
    // Try to parse as boolean
    else if (value === 'true' || value === 'false') {
      parsedValue = value === 'true';
    }
    // Try to parse as null
    else if (value === 'null') {
      parsedValue = null;
    } else {
      parsedValue = value;
    }
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
    remainingText: remainingAfterValue,
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
