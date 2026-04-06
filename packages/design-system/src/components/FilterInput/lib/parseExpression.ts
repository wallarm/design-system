import type { Condition, ExprNode, FieldMetadata, FilterOperator } from '../types';

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export interface FilterParseError {
  readonly _tag: 'FilterParseError';
  readonly message: string;
}

export const FilterParseError = (message: string): FilterParseError => ({
  _tag: 'FilterParseError',
  message,
});

export const isFilterParseError = (value: unknown): value is FilterParseError =>
  typeof value === 'object' &&
  value !== null &&
  '_tag' in value &&
  value._tag === 'FilterParseError';

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

type TokenType =
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'COMMA'
  | 'AND'
  | 'OR'
  | 'OPERATOR'
  | 'IDENT';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const OPERATORS: ReadonlySet<string> = new Set([
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  'in',
  'not_in',
  'like',
  'not_like',
  'is_null',
  'is_not_null',
  'between',
]);

const TWO_CHAR_OPS: ReadonlySet<string> = new Set(['!=', '>=', '<=']);

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

const isWhitespace = (ch: string) => ' \t\n\r'.includes(ch);

const isIdentChar = (ch: string) => ch !== '' && !isWhitespace(ch) && !'()[],!><='.includes(ch);

const tokenize = (input: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  const push = (type: TokenType, value: string, pos: number, len = 1) => {
    tokens.push({ type, value, pos });
    i += len;
  };

  while (i < input.length) {
    const ch = input[i]!;

    // Skip whitespace
    if (isWhitespace(ch)) {
      i++;
      continue;
    }

    // Single-char punctuation
    if (ch === '(') {
      push('LPAREN', '(', i);
      continue;
    }
    if (ch === ')') {
      push('RPAREN', ')', i);
      continue;
    }
    if (ch === '[') {
      push('LBRACKET', '[', i);
      continue;
    }
    if (ch === ']') {
      push('RBRACKET', ']', i);
      continue;
    }
    if (ch === ',') {
      push('COMMA', ',', i);
      continue;
    }

    // Two-char operators: !=, >=, <=
    const two = input.slice(i, i + 2);
    if (TWO_CHAR_OPS.has(two)) {
      push('OPERATOR', two, i, 2);
      continue;
    }

    // Single-char operators: =, >, <
    if ('=><'.includes(ch)) {
      push('OPERATOR', ch, i);
      continue;
    }

    // Words: identifiers, keywords, word-operators
    if (isIdentChar(ch)) {
      const start = i;
      while (i < input.length && isIdentChar(input[i]!)) i++;
      const word = input.slice(start, i);
      const upper = word.toUpperCase();

      if (upper === 'AND') tokens.push({ type: 'AND', value: 'AND', pos: start });
      else if (upper === 'OR') tokens.push({ type: 'OR', value: 'OR', pos: start });
      else if (OPERATORS.has(word)) tokens.push({ type: 'OPERATOR', value: word, pos: start });
      else tokens.push({ type: 'IDENT', value: word, pos: start });
      continue;
    }

    throw FilterParseError(`Unexpected character '${ch}' at position ${i}`);
  }

  return tokens;
};

// ---------------------------------------------------------------------------
// Parser helpers
// ---------------------------------------------------------------------------

interface ParserState {
  tokens: Token[];
  pos: number;
  fields: FieldMetadata[];
}

const peek = (s: ParserState): Token | undefined => s.tokens[s.pos];

const advance = (s: ParserState): Token => {
  const token = s.tokens[s.pos];
  if (!token) throw FilterParseError('Unexpected end of input');
  s.pos++;
  return token;
};

const expect = (s: ParserState, type: TokenType): Token => {
  const token = peek(s);
  if (!token || token.type !== type) {
    const found = token ? `'${token.value}' at position ${token.pos}` : 'end of input';
    throw FilterParseError(`Expected ${type}, found ${found}`);
  }
  return advance(s);
};

const validateField = (s: ParserState, name: string): void => {
  if (!s.fields.some(f => f.name === name)) {
    throw FilterParseError(`Unknown field: ${name}`);
  }
};

const validateOperator = (s: ParserState, op: string, fieldName: string): FilterOperator => {
  if (!OPERATORS.has(op)) {
    throw FilterParseError(`Unknown operator: ${op}`);
  }
  const field = s.fields.find(f => f.name === fieldName);
  if (field?.operators && !field.operators.includes(op as FilterOperator)) {
    throw FilterParseError(`Operator '${op}' is not allowed for field '${fieldName}'`);
  }
  return op as FilterOperator;
};

// ---------------------------------------------------------------------------
// Parsing rules
// ---------------------------------------------------------------------------

/** value_list → `[` IDENT ( `,` IDENT )* `]` */
const parseValueList = (s: ParserState): Array<string | number> => {
  expect(s, 'LBRACKET');
  const values: Array<string | number> = [];

  if (peek(s)?.type !== 'RBRACKET') {
    values.push(expect(s, 'IDENT').value);
    while (peek(s)?.type === 'COMMA') {
      advance(s);
      values.push(expect(s, 'IDENT').value);
    }
  }

  expect(s, 'RBRACKET');
  return values;
};

/** condition → IDENT OPERATOR ( value_list | IDENT )? */
const parseCondition = (s: ParserState): Condition => {
  const fieldToken = expect(s, 'IDENT');
  validateField(s, fieldToken.value);

  const opToken = peek(s);
  if (!opToken || opToken.type !== 'OPERATOR') {
    throw FilterParseError(`Expected operator after field '${fieldToken.value}'`);
  }
  advance(s);

  const operator = validateOperator(s, opToken.value, fieldToken.value);

  // Unary operators — no value
  if (operator === 'is_null' || operator === 'is_not_null') {
    return { type: 'condition', field: fieldToken.value, operator, value: null };
  }

  // Multi-value list
  if (peek(s)?.type === 'LBRACKET') {
    return { type: 'condition', field: fieldToken.value, operator, value: parseValueList(s) };
  }

  // Single value
  const valueToken = expect(s, 'IDENT');
  return { type: 'condition', field: fieldToken.value, operator, value: valueToken.value };
};

/** factor → `(` expression `)` | `(` condition `)` | condition */
const parseFactor = (s: ParserState): ExprNode => {
  if (peek(s)?.type === 'LPAREN') {
    advance(s); // consume (

    // Nested group: ( ( ... ) ... )
    if (peek(s)?.type === 'LPAREN') {
      const expr = parseExpr(s);
      expect(s, 'RPAREN');
      return expr;
    }

    // Condition inside parens, possibly followed by connectors
    const condition = parseCondition(s);
    const next = peek(s);

    // Simple: (condition)
    if (next?.type === 'RPAREN') {
      advance(s);
      return condition;
    }

    // Grouped expression: (cond AND cond ...)
    if (next?.type === 'AND' || next?.type === 'OR') {
      const children: ExprNode[] = [condition];
      const groupOp: 'and' | 'or' = next.type === 'AND' ? 'and' : 'or';

      while (peek(s)?.type === 'AND' || peek(s)?.type === 'OR') {
        advance(s);
        children.push(parseFactor(s));
      }

      expect(s, 'RPAREN');
      return { type: 'group', operator: groupOp, children };
    }

    const found = next ? `'${next.value}' at position ${next.pos}` : 'end of input';
    throw FilterParseError(`Expected ')' or connector after condition, found ${found}`);
  }

  // Bare condition without parens
  if (peek(s)?.type === 'IDENT') {
    return parseCondition(s);
  }

  const token = peek(s);
  throw FilterParseError(
    token
      ? `Unexpected token '${token.value}' at position ${token.pos}`
      : 'Unexpected end of input',
  );
};

/** term → factor ( AND factor )* */
const parseTerm = (s: ParserState): ExprNode => {
  let left = parseFactor(s);

  while (peek(s)?.type === 'AND') {
    advance(s);
    const right = parseFactor(s);
    left =
      left.type === 'group' && left.operator === 'and'
        ? { ...left, children: [...left.children, right] }
        : { type: 'group', operator: 'and', children: [left, right] };
  }

  return left;
};

/** expression → term ( OR term )* */
const parseExpr = (s: ParserState): ExprNode => {
  let left = parseTerm(s);

  while (peek(s)?.type === 'OR') {
    advance(s);
    const right = parseTerm(s);
    left =
      left.type === 'group' && left.operator === 'or'
        ? { ...left, children: [...left.children, right] }
        : { type: 'group', operator: 'or', children: [left, right] };
  }

  return left;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a filter text string into an expression tree.
 * Validates field names and operators against the provided field metadata.
 *
 * @throws {FilterParseError} on invalid input
 */
export const parseExpression = (text: string, fields: FieldMetadata[]): ExprNode => {
  const trimmed = text.trim();
  if (!trimmed) throw FilterParseError('Empty filter text');

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) throw FilterParseError('Empty filter text');

  const state: ParserState = { tokens, pos: 0, fields };
  const expr = parseExpr(state);

  if (state.pos < tokens.length) {
    const remaining = tokens[state.pos]!;
    throw FilterParseError(`Unexpected token '${remaining.value}' at position ${remaining.pos}`);
  }

  return expr;
};
