import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { useControlled } from '../../hooks/useControlled';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { plainAdapter } from '../CodeSnippet/adapters/plain';
import type { SyntaxAdapter } from '../CodeSnippet/adapters/types';
import {
  CodeSnippetChromeContext,
  type CodeSnippetChromeContextValue,
} from '../CodeSnippet/CodeSnippetChromeContext';
import type { CodeSnippetSize, LineConfig } from '../CodeSnippet/CodeSnippetContext';
import { CodeSnippetShowMoreButton } from '../CodeSnippet/CodeSnippetShowMoreButton';
import { codeSnippetRootVariants } from '../CodeSnippet/classes';
import { useAdapter } from '../CodeSnippet/hooks';
import { ChromeFrame } from '../CodeSnippet/internal/ChromeFrame';
import {
  getHiddenLineCount,
  hasExplicitShowMoreButton,
  isClamped,
} from '../CodeSnippet/lib/showMore';
import { CodeEditorContext, type CodeEditorContextValue } from './CodeEditorContext';
import type { EditorHandle } from './engine/types';
import type {
  CodeEditorApi,
  CodeEditorCompletionSource,
  CodeEditorDiagnostic,
  CodeEditorFolds,
  CodeEditorLanguage,
  JsonSchema,
} from './types';

type CodeEditorRootNativeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'defaultValue' | 'onCopy'
>;

export interface CodeEditorRootProps
  extends CodeEditorRootNativeProps,
    TestableProps,
    VariantProps<typeof codeSnippetRootVariants> {
  /** Root element, including in fullscreen */
  ref?: Ref<HTMLDivElement>;
  /** Controlled document */
  value?: string;
  /** Uncontrolled initial document (controlled vs uncontrolled is locked on first render) */
  defaultValue?: string;
  /** Fired for user edits only, never for external `value` syncs */
  onChange?: (value: string) => void;
  /** Passed verbatim to the syntax adapter; selects the structural parser */
  language?: CodeEditorLanguage;
  /** Document identity: changing it swaps to that document's cached state (undo history, selection, folds) */
  documentId?: string;
  /** Focusable, selectable, searchable, copyable — but not editable by the user */
  readOnly?: boolean;
  /** Offsets gutter numbers; `lines`, `folds`, `diagnostics` use absolute numbers */
  startingLineNumber?: number;
  /**
   * Per-line configuration keyed by absolute line number (static, see spec D6).
   * Compared by identity: memoise it (or hoist it to a constant) — a new object
   * every render reconfigures the lines and gutters on every render.
   */
  lines?: Record<number, LineConfig>;
  /**
   * Fold regions, or a function re-run after edits; collapsed state is kept by `id`.
   * Compared by identity: memoise the array or pass a stable function (e.g. `getHttpFolds`) —
   * an inline array/arrow reconfigures folds on every render and bypasses the re-run debounce.
   */
  folds?: CodeEditorFolds;
  /** Controlled line wrapping */
  wrapLines?: boolean;
  /** Uncontrolled initial line wrapping */
  defaultWrapLines?: boolean;
  /** Fired when the wrap button toggles wrapping */
  onWrapLinesChange?: (wrap: boolean) => void;
  /** Height clamp in rows; auto-renders `CodeSnippetShowMoreButton` unless one is a direct child */
  maxLines?: number;
  /** Enables diff mode against this text */
  original?: string;
  /** JSON Schema for the document (`json`) or the JSON body (`http`) */
  schema?: JsonSchema;
  /** Consumer completion sources, added after the built-in ones */
  completions?: CodeEditorCompletionSource[];
  /** External diagnostics, merged with syntax and schema ones */
  diagnostics?: CodeEditorDiagnostic[];
  /** Fired when the merged diagnostics change */
  onDiagnosticsChange?: (diagnostics: CodeEditorDiagnostic[]) => void;
  /** Imperative handle */
  apiRef?: Ref<CodeEditorApi>;
  /** Nonce for the style tags the editor injects */
  cspNonce?: string;
  /** Fired by `CodeSnippetCopyButton` after a copy, with the current document */
  onCopy?: (value: string) => void;
  /** Chrome (header, floating actions, show more) and `CodeEditorContent` */
  children?: ReactNode;
}

const EMPTY_LINES: Record<number, LineConfig> = {};
const EMPTY_COMPLETIONS: CodeEditorCompletionSource[] = [];
const EMPTY_DIAGNOSTICS: CodeEditorDiagnostic[] = [];
const ROW_HEIGHT = 20;
const VERTICAL_PADDING = 16;

const countLines = (value: string): number => {
  let count = 1;
  for (let index = value.indexOf('\n'); index !== -1; index = value.indexOf('\n', index + 1)) {
    count += 1;
  }
  return count;
};

interface LatestProps {
  value: string;
  onChange: ((value: string) => void) | undefined;
  onDiagnosticsChange: ((diagnostics: CodeEditorDiagnostic[]) => void) | undefined;
  onWrapLinesChange: ((wrap: boolean) => void) | undefined;
  onCopy: ((value: string) => void) | undefined;
}

/**
 * Editable code surface (CodeMirror 6, lazy-loaded) that looks like CodeSnippet and reuses
 * its chrome: syntax-adapter colours, gutters, lines, folds, copy/wrap/fullscreen/show-more,
 * plus find/replace, diagnostics, JSON Schema, autocomplete and diff against an original.
 */
export const CodeEditorRoot = ({
  ref,
  value: valueProp,
  defaultValue = '',
  onChange,
  language = 'text',
  documentId,
  size = 'sm',
  readOnly = false,
  startingLineNumber = 1,
  lines = EMPTY_LINES,
  folds,
  wrapLines: wrapLinesProp,
  defaultWrapLines = false,
  onWrapLinesChange,
  maxLines = 0,
  original,
  schema,
  completions = EMPTY_COMPLETIONS,
  diagnostics = EMPTY_DIAGNOSTICS,
  onDiagnosticsChange,
  apiRef,
  cspNonce,
  onCopy,
  className,
  children,
  'data-testid': testId,
  ...props
}: CodeEditorRootProps) => {
  const adapterContext = useAdapter();
  // plainAdapter ignores the language, so widening its language parameter is safe (same as CodeSnippetRoot).
  const adapter = (adapterContext?.adapter ?? plainAdapter) as SyntaxAdapter<string>;

  const [valueState, setValue] = useControlled<string>({
    controlled: valueProp,
    default: defaultValue,
  });
  const value = valueState ?? '';

  const [wrapState, setWrapState] = useControlled<boolean>({
    controlled: wrapLinesProp,
    default: defaultWrapLines,
  });
  const wrapLines = wrapState ?? false;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [engineRows, setEngineRows] = useState<number | null>(null);

  const latest = useRef<LatestProps>({
    value,
    onChange,
    onDiagnosticsChange,
    onWrapLinesChange,
    onCopy,
  });
  useEffect(() => {
    latest.current = { value, onChange, onDiagnosticsChange, onWrapLinesChange, onCopy };
  });

  const handleRef = useRef<EditorHandle | null>(null);

  const [api] = useState<CodeEditorApi>(() => ({
    focus: () => handleRef.current?.api.focus(),
    getValue: () => handleRef.current?.api.getValue() ?? latest.current.value,
    insertText: text => handleRef.current?.api.insertText(text),
    openSearch: () => handleRef.current?.api.openSearch(),
    foldAll: () => handleRef.current?.api.foldAll(),
    unfoldAll: () => handleRef.current?.api.unfoldAll(),
  }));

  useImperativeHandle(apiRef, () => api, [api]);

  const [callbacks] = useState<CodeEditorContextValue['callbacks']>(() => ({
    onChange: next => {
      setValue(next);
      latest.current.onChange?.(next);
    },
    onDiagnosticsChange: next => latest.current.onDiagnosticsChange?.(next),
    onVisibleRowCountChange: rows => setEngineRows(rows),
  }));

  const setHandle = useCallback((handle: EditorHandle | null) => {
    handleRef.current = handle;
    if (handle === null) setEngineRows(null);
  }, []);

  const setWrapLines = useCallback(
    (wrap: boolean) => {
      setWrapState(wrap);
      latest.current.onWrapLinesChange?.(wrap);
    },
    [setWrapState],
  );

  const getCode = useCallback(() => api.getValue(), [api]);
  const notifyCopied = useCallback(() => latest.current.onCopy?.(api.getValue()), [api]);

  const lineCount = useMemo(() => countLines(value), [value]);
  const hiddenLineCount = getHiddenLineCount(engineRows ?? lineCount, maxLines);
  const maxHeight = isClamped(hiddenLineCount, isExpanded)
    ? maxLines * ROW_HEIGHT + VERTICAL_PADDING
    : null;
  const resolvedSize: CodeSnippetSize = size ?? 'sm';

  const chromeValue = useMemo<CodeSnippetChromeContextValue>(
    () => ({
      size: resolvedSize,
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
    [
      resolvedSize,
      getCode,
      notifyCopied,
      wrapLines,
      setWrapLines,
      isFullscreen,
      maxLines,
      isExpanded,
      hiddenLineCount,
    ],
  );

  const options = useMemo<CodeEditorContextValue['options']>(
    () => ({
      value,
      documentId,
      language,
      readOnly,
      wrapLines,
      startingLineNumber,
      lines,
      folds,
      adapter,
      original,
      schema,
      completions,
      diagnostics,
      testId,
      cspNonce,
      maxHeight,
    }),
    [
      value,
      documentId,
      language,
      readOnly,
      wrapLines,
      startingLineNumber,
      lines,
      folds,
      adapter,
      original,
      schema,
      completions,
      diagnostics,
      testId,
      cspNonce,
      maxHeight,
    ],
  );

  const editorContext = useMemo<CodeEditorContextValue>(
    () => ({ options, callbacks, setHandle, api }),
    [options, callbacks, setHandle, api],
  );

  return (
    <TestIdProvider value={testId}>
      <CodeSnippetChromeContext.Provider value={chromeValue}>
        <CodeEditorContext.Provider value={editorContext}>
          <ChromeFrame
            {...props}
            ref={ref}
            data-slot='code-editor'
            data-testid={testId}
            className={cn(
              codeSnippetRootVariants({ size }),
              'focus-within:ring-focus-primary focus-within:ring-2',
              className,
            )}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
          >
            {children}
            {maxLines > 0 && !hasExplicitShowMoreButton(children) && <CodeSnippetShowMoreButton />}
          </ChromeFrame>
        </CodeEditorContext.Provider>
      </CodeSnippetChromeContext.Provider>
    </TestIdProvider>
  );
};

CodeEditorRoot.displayName = 'CodeEditorRoot';
