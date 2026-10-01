import type { FoldRegion } from '../CodeSnippet/lib/foldUtils';

/** Language of the document. Passed verbatim to the syntax adapter and selects the structural parser. */
export type CodeEditorLanguage =
  | 'http'
  | 'json'
  | 'yaml'
  | 'bash'
  | 'text'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'lua';

/** Imperative handle exposed through `apiRef` and `useCodeEditor()`. */
export interface CodeEditorApi {
  focus(): void;
  getValue(): string;
  /** Replaces the selection, or inserts at the cursor. Undoable. */
  insertText(text: string): void;
  openSearch(): void;
  foldAll(): void;
  unfoldAll(): void;
}

export interface CodeEditorPosition {
  /** Absolute line number (startingLineNumber-based) */
  line: number;
  /** 1-based column */
  column: number;
}

export interface CodeEditorDiagnostic {
  from: CodeEditorPosition;
  /**
   * Defaults to one character after `from` (a point when `from` is at the end of its line).
   * A line past the document end is clamped to the document end; never before `from`.
   */
  to?: CodeEditorPosition;
  severity: 'error' | 'warning' | 'info';
  message: string;
  /** 'syntax' | 'schema' for built-ins; free text for consumer diagnostics */
  source?: string;
}

export interface CodeEditorCompletion {
  label: string;
  /** Text to insert; defaults to label */
  apply?: string;
  detail?: string;
  info?: string;
  kind?: 'keyword' | 'property' | 'value' | 'method' | 'header' | 'snippet' | 'text';
}

/** HTTP-specific location of the cursor, present when `language === 'http'`. */
export interface CodeEditorHttpContext {
  section: 'start-line' | 'header-name' | 'header-value' | 'body';
  headerName?: string;
  messageKind: 'request' | 'response';
}

export interface CodeEditorCompletionContext {
  value: string;
  position: CodeEditorPosition;
  lineText: string;
  /** Word being typed before the cursor and where it starts */
  word: { text: string; from: CodeEditorPosition };
  /** true when opened with Ctrl-Space */
  explicit: boolean;
  /** Present when language === 'http' */
  http?: CodeEditorHttpContext;
  /** Present in a JSON document or JSON body: JSON pointer of the cursor location */
  jsonPointer?: string;
}

export type CodeEditorCompletionSource = (
  ctx: CodeEditorCompletionContext,
) => CodeEditorCompletion[] | null | Promise<CodeEditorCompletion[] | null>;

/** Static fold regions, or a function re-run (debounced) after edits. */
export type CodeEditorFolds =
  | FoldRegion[]
  | ((value: string, ctx: { startingLineNumber: number }) => FoldRegion[]);

/**
 * JSON Schema document (any draft supported by json-schema-library).
 * Structural on purpose: the engine casts it to json-schema-library's own type,
 * so the public API never depends on that module statically.
 */
export type JsonSchema = Record<string, unknown> | boolean;
