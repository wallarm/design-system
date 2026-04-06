import type { ExprNode, FieldMetadata } from '../../types';
import { FilterParseError } from './error';
import { parseExpr } from './parser';
import { tokenize } from './tokenizer';
import type { ParserState } from './types';

/**
 * Parse a filter text string into an expression tree.
 * Validates field names, operators, and values against the provided field metadata.
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
