import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

import { plainAdapter } from './adapters/plain';
import type { SyntaxAdapter, Token } from './adapters/types';
import {
    CodeSnippetContext,
    type CodeSnippetContextValue,
    type CodeSnippetSize,
    type LineConfig,
} from './CodeSnippetContext';
import { useAdapter } from './hooks';

const codeSnippetRootVariants = cva(
    [
        'relative',
        'bg-component-code-snippet-bg',
        'rounded-6',
        'font-mono',
        'text-text-primary',
        'overflow-hidden',
        'flex flex-col',
        '[&::selection]:bg-[var(--color-syntax-highlight-selected-bg)]',
        '[&::selection]:text-[var(--color-syntax-highlight-selected-code)]',
        '[&_*::selection]:bg-[var(--color-syntax-highlight-selected-bg)]',
        '[&_*::selection]:text-[var(--color-syntax-highlight-selected-code)]',
    ].join(' '),
    {
        variants: {
            size: {
                sm: 'text-xs',
                md: 'text-sm',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    },
);

type CodeSnippetRootVariantProps = VariantProps<typeof codeSnippetRootVariants>;

type CodeSnippetRootNativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export type CodeSnippetRootProps<TLanguage extends string = string> = CodeSnippetRootNativeProps &
    CodeSnippetRootVariantProps & {
        ref?: Ref<HTMLDivElement>;
        /** The code string to display */
        code: string;
        /** Programming language for syntax highlighting */
        language: TLanguage;
        /** Per-line configuration (color, prefix) keyed by line number */
        lines?: Record<number, LineConfig>;
        /** Starting line number (default: 1) */
        startingLineNumber?: number;
        /** Enable line wrapping */
        wrapLines?: boolean;
        /** Max lines before collapsing (for ShowMore) */
        maxLines?: number;
        /** Callback when code is copied */
        onCopy?: (code: string) => void;
        /** Child components */
        children?: ReactNode;
    };

export const CodeSnippetRoot = <TLanguage extends string = string>({
    code,
    language,
    size = 'md',
    lines = {},
    startingLineNumber = 1,
    wrapLines: initialWrapLines = false,
    maxLines = 0,
    onCopy,
    className,
    children,
    ...props
}: CodeSnippetRootProps<TLanguage>) => {
    const adapterContext = useAdapter<TLanguage>();
    const [wrapLines, setWrapLines] = useState(initialWrapLines);
    const [isExpanded, setIsExpanded] = useState(false);
    const [tokens, setTokens] = useState<Token[][] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Use adapter from context or fall back to plain adapter
    const adapter = (adapterContext?.adapter ?? plainAdapter) as SyntaxAdapter<TLanguage>;

    // Highlight code when code or language changes
    useEffect(() => {
        let cancelled = false;

        const highlight = async () => {
            setIsLoading(true);
            try {
                const result = await adapter.highlight(code, language);
                if (!cancelled) {
                    setTokens(result.tokens);
                }
            } catch {
                // On error, fall back to plain tokens
                if (!cancelled) {
                    const plainTokens = code
                        .split('\n')
                        .map(line => [{ content: line, type: 'plain' as const }]);
                    setTokens(plainTokens);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        highlight();

        return () => {
            cancelled = true;
        };
    }, [code, language, adapter]);

    const copyToClipboard = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        onCopy?.(code);
    }, [code, onCopy]);

    const contextValue = useMemo<CodeSnippetContextValue<TLanguage>>(
        () => ({
            code,
            language,
            tokens,
            isLoading,
            size: (size ?? 'md') as CodeSnippetSize,
            wrapLines,
            startingLineNumber,
            inlineGutter: false,
            showLineNumbers: false,
            lines: new Map(Object.entries(lines).map(([k, v]) => [Number(k), v])),
            isExpanded,
            maxLines,
            copyToClipboard,
            setWrapLines,
            setIsExpanded,
            adapter,
        }),
        [
            code,
            language,
            tokens,
            isLoading,
            size,
            wrapLines,
            startingLineNumber,
            lines,
            isExpanded,
            maxLines,
            copyToClipboard,
            adapter,
        ],
    );

    return (
        <CodeSnippetContext.Provider value={contextValue as unknown as CodeSnippetContextValue}>
            <div
                data-slot='code-snippet'
                className={cn(codeSnippetRootVariants({ size }), className)}
                {...props}
            >
                {children}
            </div>
        </CodeSnippetContext.Provider>
    );
};

CodeSnippetRoot.displayName = 'CodeSnippetRoot';
