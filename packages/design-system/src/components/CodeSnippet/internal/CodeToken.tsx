import type { FC } from 'react';

import type { Token, TokenType } from '../adapters/types';

// Token type to Tailwind class mapping
const TOKEN_CLASSES: Record<TokenType, string> = {
    plain: 'text-text-primary',
    keyword: 'text-purple-600',
    string: 'text-green-600',
    comment: 'text-text-secondary italic',
    function: 'text-blue-600',
    number: 'text-amber-600',
    operator: 'text-text-primary',
    punctuation: 'text-text-secondary',
    'class-name': 'text-cyan-600',
    property: 'text-blue-500',
    tag: 'text-red-600',
    'attr-name': 'text-amber-600',
    'attr-value': 'text-green-600',
    boolean: 'text-purple-600',
    builtin: 'text-cyan-600',
    constant: 'text-amber-600',
    regex: 'text-red-500',
    variable: 'text-text-primary',
};

export type CodeTokenProps = {
    token: Token;
    colorClass?: string;
};

/** Renders a single syntax-highlighted token */
export const CodeToken: FC<CodeTokenProps> = ({ token, colorClass }) => (
    <span className={colorClass ?? token.className ?? TOKEN_CLASSES[token.type]}>
        {token.content}
    </span>
);
