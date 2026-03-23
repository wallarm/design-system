import type { FC } from 'react';
import type { Token, TokenType } from '../adapters/types';

// Token type to Tailwind class mapping
const TOKEN_CLASSES: Record<TokenType, string> = {
  plain: 'text-syntax-no-syntax',
  keyword: 'text-syntax-keyword',
  string: 'text-syntax-string',
  comment: 'text-syntax-comment italic',
  function: 'text-syntax-function',
  number: 'text-syntax-number',
  operator: 'text-syntax-operator',
  punctuation: 'text-syntax-punctuation',
  'class-name': 'text-syntax-class-name',
  property: 'text-syntax-property',
  tag: 'text-syntax-tag',
  'attr-name': 'text-syntax-attr-name',
  'attr-value': 'text-syntax-attr-value',
  boolean: 'text-syntax-boolean',
  builtin: 'text-syntax-builtin',
  constant: 'text-syntax-constant',
  regex: 'text-syntax-regex',
  variable: 'text-syntax-variable',
};

export type CodeTokenProps = {
  token: Token;
  colorClass?: string;
  /** Color class from a range highlight — takes highest priority */
  rangeColorClass?: string;
};

/** Renders a single syntax-highlighted token */
export const CodeToken: FC<CodeTokenProps> = ({ token, colorClass, rangeColorClass }) => (
  <span className={rangeColorClass ?? colorClass ?? token.className ?? TOKEN_CLASSES[token.type]}>
    {token.content}
  </span>
);
