import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { copyText } from '../../utils/copyText';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { plainAdapter } from './adapters/plain';
import type { SyntaxAdapter, Token } from './adapters/types';
import {
  CodeSnippetChromeContext,
  type CodeSnippetChromeContextValue,
} from './CodeSnippetChromeContext';
import {
  CodeSnippetContext,
  type CodeSnippetContextValue,
  type CodeSnippetSize,
  type LineConfig,
} from './CodeSnippetContext';
import { CodeSnippetShowMoreButton } from './CodeSnippetShowMoreButton';
import { useAdapter } from './hooks';
import { buildDisplayItems, type FoldRegion, validateFolds } from './lib/foldUtils';
import { getHiddenLineCount, hasExplicitShowMoreButton, isClamped } from './lib/showMore';

const codeSnippetRootVariants = cva(
  [
    'relative',
    'code-snippet-bg',
    'rounded-6',
    'font-mono',
    'text-syntax-no-syntax',
    'overflow-hidden',
    'flex flex-col',
    '[&::selection]:bg-[var(--color-syntax-highlight-selected-highlight)]',
    '[&::selection]:text-[var(--color-syntax-highlight-selected-code)]',
    '[&_*::selection]:bg-[var(--color-syntax-highlight-selected-highlight)]',
    '[&_*::selection]:text-[var(--color-syntax-highlight-selected-code)]',
    '[&>[data-slot=code-snippet-actions]]:absolute [&>[data-slot=code-snippet-actions]]:right-0 [&>[data-slot=code-snippet-actions]]:top-0 [&>[data-slot=code-snippet-actions]]:z-30 [&>[data-slot=code-snippet-actions]]:p-6 [&>[data-slot=code-snippet-actions]]:rounded-br-6 [&>[data-slot=code-snippet-actions]]:rounded-tl-6',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs leading-sm',
        md: 'text-sm',
        lg: 'text-base leading-sm',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

type CodeSnippetRootVariantProps = VariantProps<typeof codeSnippetRootVariants>;

type CodeSnippetRootNativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export type CodeSnippetRootProps<TLanguage extends string = string> = CodeSnippetRootNativeProps &
  CodeSnippetRootVariantProps &
  TestableProps & {
    ref?: Ref<HTMLDivElement>;
    /** The code string to display */
    code: string;
    /** Programming language for syntax highlighting */
    language?: TLanguage;
    /** Per-line configuration (color, prefix) keyed by line number */
    lines?: Record<number, LineConfig>;
    /** Starting line number (default: 1) */
    startingLineNumber?: number;
    /** Enable line wrapping */
    wrapLines?: boolean;
    /**
     * Max lines before collapsing.
     * Root auto-renders the default show-more button unless a direct
     * `CodeSnippetShowMoreButton` child is provided for button-level props.
     */
    maxLines?: number;
    /** Foldable regions that can be collapsed/expanded */
    folds?: FoldRegion[];
    /** Callback when code is copied */
    onCopy?: (code: string) => void;
    /** Child components */
    children?: ReactNode;
  };

const EMPTY_LINES: Record<number, LineConfig> = {};

/**
 * Code block with syntax highlighting, actions, line numbers, folding, and maxLines collapse.
 */
export const CodeSnippetRoot = <TLanguage extends string = string>({
  code,
  language = 'text' as TLanguage,
  size = 'sm',
  lines = EMPTY_LINES,
  startingLineNumber = 1,
  wrapLines: initialWrapLines = false,
  maxLines = 0,
  folds: foldsProp,
  onCopy,
  className,
  children,
  'data-testid': testId,
  ...props
}: CodeSnippetRootProps<TLanguage>) => {
  const adapterContext = useAdapter<TLanguage>();
  const [wrapLines, setWrapLines] = useState(initialWrapLines);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tokens, setTokens] = useState<Token[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use adapter from context or fall back to plain adapter
  const adapter = (adapterContext?.adapter ?? plainAdapter) as SyntaxAdapter<TLanguage>;

  // Normalize line endings once before any adapter or fallback sees the code
  const normalizedCode = useMemo(() => code.replace(/\r\n?/g, '\n'), [code]);

  // Highlight code when code or language changes
  useEffect(() => {
    let cancelled = false;

    const highlight = async () => {
      setIsLoading(true);
      try {
        const result = await adapter.highlight(normalizedCode, language);
        if (!cancelled) {
          setTokens(result.tokens);
        }
      } catch {
        // On error, fall back to plain tokens
        if (!cancelled) {
          const plainTokens = normalizedCode
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
  }, [normalizedCode, language, adapter]);

  // Close fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const copyToClipboard = useCallback(async () => {
    await copyText(code);
    onCopy?.(code);
  }, [code, onCopy]);

  const getCode = useCallback(() => code, [code]);

  const notifyCopied = useCallback(() => {
    onCopy?.(code);
  }, [code, onCopy]);

  const totalLines = tokens?.length ?? code.split('\n').length;

  const validatedFolds = useMemo(
    () => (foldsProp ? validateFolds(foldsProp, totalLines, startingLineNumber) : []),
    [foldsProp, totalLines, startingLineNumber],
  );

  const computeCollapsedFolds = useCallback((folds: FoldRegion[] | undefined) => {
    if (!folds) return new Set<string>();
    return new Set(folds.filter(f => f.defaultCollapsed === true).map(f => f.id));
  }, []);

  const [collapsedFolds, setCollapsedFolds] = useState(() => computeCollapsedFolds(foldsProp));

  // Re-initialize when folds prop identity changes (e.g. tab switch)
  useEffect(() => {
    setCollapsedFolds(computeCollapsedFolds(foldsProp));
  }, [foldsProp, computeCollapsedFolds]);

  const toggleFold = useCallback((foldId: string) => {
    setCollapsedFolds(prev => {
      const next = new Set(prev);
      if (next.has(foldId)) {
        next.delete(foldId);
      } else {
        next.add(foldId);
      }
      return next;
    });
  }, []);

  const foldByStartLine = useMemo(
    () => new Map(validatedFolds.map(f => [f.startLine, f])),
    [validatedFolds],
  );

  const displayItems = useMemo(
    () => buildDisplayItems(totalLines, validatedFolds, collapsedFolds, startingLineNumber),
    [totalLines, validatedFolds, collapsedFolds, startingLineNumber],
  );

  const hasExplicitShowMore = hasExplicitShowMoreButton(children);

  const hiddenLineCount = getHiddenLineCount(displayItems.length, maxLines);

  const visibleDisplayItems = useMemo(
    () => (isClamped(hiddenLineCount, isExpanded) ? displayItems.slice(0, maxLines) : displayItems),
    [displayItems, hiddenLineCount, maxLines, isExpanded],
  );

  const contextValue = useMemo<CodeSnippetContextValue<TLanguage>>(
    () => ({
      code,
      language,
      tokens,
      isLoading,
      size: (size ?? 'sm') as CodeSnippetSize,
      wrapLines,
      startingLineNumber,
      inlineGutter: false,
      showLineNumbers: false,
      lines: new Map(Object.entries(lines).map(([k, v]) => [Number(k), v])),
      totalLines,
      displayItems,
      visibleDisplayItems,
      folds: validatedFolds,
      foldByStartLine,
      collapsedFolds,
      toggleFold,
      isExpanded,
      maxLines,
      isFullscreen,
      copyToClipboard,
      setWrapLines,
      setIsExpanded,
      setIsFullscreen,
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
      totalLines,
      displayItems,
      visibleDisplayItems,
      validatedFolds,
      foldByStartLine,
      collapsedFolds,
      toggleFold,
      isExpanded,
      maxLines,
      isFullscreen,
      copyToClipboard,
      adapter,
    ],
  );

  const chromeValue = useMemo<CodeSnippetChromeContextValue>(
    () => ({
      size: (size ?? 'sm') as CodeSnippetSize,
      getCode,
      notifyCopied,
      wrapLines,
      setWrapLines,
      isFullscreen,
      setIsFullscreen,
      maxLines,
      isExpanded,
      setIsExpanded,
      hiddenLineCount,
    }),
    [size, getCode, notifyCopied, wrapLines, isFullscreen, maxLines, isExpanded, hiddenLineCount],
  );

  const snippet = (
    <div
      data-slot='code-snippet'
      data-testid={testId}
      className={cn(
        codeSnippetRootVariants({ size }),
        isFullscreen ? 'fixed inset-16 z-50' : className,
      )}
      {...(!isFullscreen ? props : {})}
    >
      {children}
      {maxLines > 0 && !hasExplicitShowMore && <CodeSnippetShowMoreButton />}
    </div>
  );

  return (
    <TestIdProvider value={testId}>
      <CodeSnippetChromeContext.Provider value={chromeValue}>
        <CodeSnippetContext.Provider value={contextValue as unknown as CodeSnippetContextValue}>
          {isFullscreen
            ? createPortal(
                <>
                  <div
                    className='fixed inset-0 z-40 backdrop-blur-xs bg-component-dialog-overlay'
                    onClick={() => setIsFullscreen(false)}
                  />
                  {snippet}
                </>,
                document.body,
              )
            : snippet}
        </CodeSnippetContext.Provider>
      </CodeSnippetChromeContext.Provider>
    </TestIdProvider>
  );
};

CodeSnippetRoot.displayName = 'CodeSnippetRoot';
