import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { VariantProps } from 'class-variance-authority';
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
import { codeSnippetRootVariants } from './classes';
import { useAdapter } from './hooks';
import { ChromeFrame } from './internal/ChromeFrame';
import { buildDisplayItems, type FoldRegion, validateFolds } from './lib/foldUtils';
import { getHiddenLineCount, hasExplicitShowMoreButton, isClamped } from './lib/showMore';

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
 *
 * Layout: the root renders inside a `display: contents` wrapper (`data-slot='code-snippet-frame'`,
 * the persistent fullscreen portal host), so a parent's `space-*` / `divide-*` utilities and child
 * selectors (`first:`, `last:`, `[&>*]:`) reach the wrapper, not the snippet. Put spacing on the
 * snippet's own `className` (e.g. `mt-16`) or use `gap` on the parent.
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
  ref,
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
    <ChromeFrame
      data-slot='code-snippet'
      data-testid={testId}
      {...props}
      ref={ref}
      className={cn(codeSnippetRootVariants({ size }), className)}
      isFullscreen={isFullscreen}
      setIsFullscreen={setIsFullscreen}
    >
      {children}
      {maxLines > 0 && !hasExplicitShowMore && <CodeSnippetShowMoreButton />}
    </ChromeFrame>
  );

  return (
    <TestIdProvider value={testId}>
      <CodeSnippetChromeContext.Provider value={chromeValue}>
        <CodeSnippetContext.Provider value={contextValue as unknown as CodeSnippetContextValue}>
          {snippet}
        </CodeSnippetContext.Provider>
      </CodeSnippetChromeContext.Provider>
    </TestIdProvider>
  );
};

CodeSnippetRoot.displayName = 'CodeSnippetRoot';
