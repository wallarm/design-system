import type { Condition, ExprNode } from '../../types';
import { FilterParseError } from './error';
import type { Token, TokenType } from './tokenizer';
import type { ParserState } from './types';
import { validateField, validateOperator, validateValues } from './validators';

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Grammar rules
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
    const values = parseValueList(s);
    validateValues(s, fieldToken.value, values);
    return { type: 'condition', field: fieldToken.value, operator, value: values };
  }

  // Single value
  const valueToken = expect(s, 'IDENT');
  validateValues(s, fieldToken.value, [valueToken.value]);
  return { type: 'condition', field: fieldToken.value, operator, value: valueToken.value };
};

/** factor → `(` expression `)` | `(` condition `)` | condition */
const parseFactor = (s: ParserState): ExprNode => {
  if (peek(s)?.type === 'LPAREN') {
    advance(s);

    if (peek(s)?.type === 'LPAREN') {
      const expr = parseExpr(s);
      expect(s, 'RPAREN');
      return expr;
    }

    const condition = parseCondition(s);
    const next = peek(s);

    if (next?.type === 'RPAREN') {
      advance(s);
      return condition;
    }

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
export const parseExpr = (s: ParserState): ExprNode => {
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
