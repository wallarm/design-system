import { FilterParseError } from './error';

export type TokenType =
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'COMMA'
  | 'AND'
  | 'OR'
  | 'OPERATOR'
  | 'IDENT';

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

export const OPERATORS: ReadonlySet<string> = new Set([
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

const isWhitespace = (ch: string) => ' \t\n\r'.includes(ch);
const isIdentChar = (ch: string) => ch !== '' && !isWhitespace(ch) && !'()[],!><='.includes(ch);

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  const push = (type: TokenType, value: string, pos: number, len = 1) => {
    tokens.push({ type, value, pos });
    i += len;
  };

  while (i < input.length) {
    const ch = input[i]!;

    if (isWhitespace(ch)) {
      i++;
      continue;
    }
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

    const two = input.slice(i, i + 2);
    if (TWO_CHAR_OPS.has(two)) {
      push('OPERATOR', two, i, 2);
      continue;
    }

    if ('=><'.includes(ch)) {
      push('OPERATOR', ch, i);
      continue;
    }

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
