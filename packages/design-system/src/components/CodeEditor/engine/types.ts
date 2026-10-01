import type { EditorView } from '@codemirror/view';
import type { SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import type { PortalRegistry } from '../lib/portalRegistry';
import type {
  CodeEditorApi,
  CodeEditorCompletionSource,
  CodeEditorDiagnostic,
  CodeEditorFolds,
  CodeEditorLanguage,
  JsonSchema,
} from '../types';

/** Everything the engine needs to build or reconfigure an editor. Plain data, no CM types. */
export interface EngineOptions {
  value: string;
  documentId: string | undefined;
  language: CodeEditorLanguage;
  readOnly: boolean;
  wrapLines: boolean;
  startingLineNumber: number;
  lineNumbers: boolean;
  lines: Record<number, LineConfig>;
  folds: CodeEditorFolds | undefined;
  adapter: SyntaxAdapter<string>;
  original: string | undefined;
  schema: JsonSchema | undefined;
  completions: readonly CodeEditorCompletionSource[];
  diagnostics: readonly CodeEditorDiagnostic[];
  contentAttributes: Record<string, string>;
  /** Root data-testid base; engine derives `${testId}--editor`, `--gutter`, `--search`, `--fold-toggle`, `--fold-summary` */
  testId: string | undefined;
  cspNonce: string | undefined;
  /** px, null = no clamp */
  maxHeight: number | null;
}

/** Callbacks from the engine back into React. */
export interface EngineCallbacks {
  onChange: (value: string) => void;
  onDiagnosticsChange: (diagnostics: CodeEditorDiagnostic[]) => void;
  onVisibleRowCountChange: (rows: number) => void;
  portals: PortalRegistry;
}

/** Returned by `createEditor()`. */
export interface EditorHandle {
  /** Compares with previous options, reconfigures changed compartments, syncs value/documentId */
  update: (options: EngineOptions) => void;
  api: CodeEditorApi;
  /** For tests only */
  view: EditorView;
  destroy: () => void;
}
