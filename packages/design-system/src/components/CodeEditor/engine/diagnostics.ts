import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import { type Diagnostic, linter, setDiagnosticsEffect } from '@codemirror/lint';
import type { EditorState, Extension, Text } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { CodeEditorDiagnostic, CodeEditorLanguage, JsonSchema } from '../types';
import { findJsonBodyRange } from './languages';
import { offsetToPosition, positionToOffset } from './positions';

/** Absolute document range holding JSON (whole doc for `json`, the JSON body for `http`). */
export interface JsonRegion {
  from: number;
  to: number;
}

/**
 * Schema hook (spec §7.13). T13 passes a function that dynamically imports
 * `./schema/validate` and returns CM diagnostics with absolute offsets.
 * Called only when `schema` is set and the region is syntactically valid JSON.
 */
export type SchemaDiagnosticsSource = (
  state: EditorState,
  region: JsonRegion,
) => Promise<readonly Diagnostic[]>;

export interface DiagnosticsConfig {
  language: CodeEditorLanguage;
  schema: JsonSchema | undefined;
  external: readonly CodeEditorDiagnostic[];
  startingLineNumber: number;
  onChange: (diagnostics: CodeEditorDiagnostic[]) => void;
  schemaSource?: SchemaDiagnosticsSource;
}

/** Linter debounce after a change, in ms (spec §7.12). */
export const LINT_DELAY = 300;
export const SYNTAX_SOURCE = 'syntax';
export const SCHEMA_SOURCE = 'schema';

/** Upper bound for the parse work the Lezer fallback may force, in ms. */
const ENSURE_TREE_TIMEOUT = 200;

/**
 * Where the JSON lives in the document: the whole document for `json`, the mounted
 * `JsonText` body for `http` (null when the body is absent or not JSON), otherwise null.
 */
export const jsonRegion = (state: EditorState, language: CodeEditorLanguage): JsonRegion | null => {
  if (language === 'json') return { from: 0, to: state.doc.length };
  if (language === 'http') return findJsonBodyRange(state);
  return null;
};

export interface JsonSyntaxErrorLocation {
  /** Offset relative to the parsed text, or null when the message carries no position. */
  offset: number | null;
  /** Human-readable message without engine-specific position suffixes. */
  message: string;
}

const POSITION = /at position (\d+)/;
const LINE_COLUMN = /line (\d+) column (\d+)/;
const END_OF_INPUT = /end of (?:JSON )?(?:input|data)/i;

const offsetOfLineColumn = (text: string, line: number, column: number): number => {
  let offset = 0;
  for (let current = 1; current < line; current++) {
    const newline = text.indexOf('\n', offset);
    if (newline < 0) return text.length;
    offset = newline + 1;
  }
  return Math.min(offset + column - 1, text.length);
};

const cleanMessage = (message: string): string => {
  const cleaned = message
    .replace(/^JSON\.parse: /, '')
    .replace(/^JSON Parse error: /, '')
    .replace(/ in JSON at position \d+(?: \(line \d+ column \d+\))?$/, '')
    .replace(/ at line \d+ column \d+ of the JSON data$/, '')
    .replace(/, ".*" is not valid JSON$/s, '')
    .trim();
  if (cleaned === '') return 'Invalid JSON';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/**
 * Reads the error position out of a `JSON.parse` SyntaxError message.
 * V8: `... in JSON at position N (line L column C)`; Firefox: `... at line L column C of the JSON data`;
 * `Unexpected end of JSON input` / `unexpected end of data` → end of the content.
 */
export const locateJsonSyntaxError = (message: string, text: string): JsonSyntaxErrorLocation => {
  const clean = cleanMessage(message);
  const position = POSITION.exec(message);
  if (position) return { offset: Number(position[1]), message: clean };
  const lineColumn = LINE_COLUMN.exec(message);
  if (lineColumn) {
    return {
      offset: offsetOfLineColumn(text, Number(lineColumn[1]), Number(lineColumn[2])),
      message: clean,
    };
  }
  if (END_OF_INPUT.test(message)) return { offset: text.trimEnd().length, message: clean };
  return { offset: null, message: clean };
};

/**
 * One-character range at `relative` inside `text`, shifted by `base`. Past the last
 * non-whitespace character it underlines that character; on a line break it is a point.
 */
const rangeAt = (text: string, relative: number, base: number): JsonRegion => {
  const contentEnd = text.trimEnd().length;
  if (relative >= contentEnd) return { from: base + contentEnd - 1, to: base + contentEnd };
  const from = Math.max(relative, 0);
  return text.charAt(from) === '\n'
    ? { from: base + from, to: base + from }
    : { from: base + from, to: base + from + 1 };
};

/** First Lezer error (⚠) node inside the region — used when the message has no position. */
const firstErrorNode = (state: EditorState, region: JsonRegion): JsonRegion | null => {
  const tree = ensureSyntaxTree(state, region.to, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  let found: JsonRegion | null = null;
  tree.iterate({
    from: region.from,
    to: region.to,
    enter: node => {
      if (found) return false;
      if (!node.type.isError || node.from < region.from) return true;
      found = { from: node.from, to: node.to };
      return false;
    },
  });
  return found;
};

/**
 * Syntax errors from the Lezer tree (spec §14 A3): every error (⚠) node of the fully parsed
 * tree — or only those inside `region` — becomes an `error` diagnostic; error nodes that touch
 * are collapsed into one. Empty for a state without a parser.
 */
export const syntaxErrorDiagnostics = (state: EditorState, region?: JsonRegion): Diagnostic[] => {
  const length = state.doc.length;
  const tree = ensureSyntaxTree(state, length, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  const out: Diagnostic[] = [];
  tree.iterate({
    from: region?.from ?? 0,
    to: region?.to ?? length,
    enter: node => {
      if (!node.type.isError) return true;
      if (region && (node.from < region.from || node.from > region.to)) return false;
      const from = node.from;
      const to = Math.min(Math.max(node.to, from + 1), length);
      const last = out.at(-1);
      if (last && from <= last.to) {
        last.to = Math.max(last.to, to);
        return false;
      }
      out.push({
        from,
        to,
        severity: 'error',
        source: SYNTAX_SOURCE,
        message:
          from < length
            ? `Unexpected "${state.doc.sliceString(from, from + 1)}"`
            : 'Unexpected end of input',
      });
      return false;
    },
  });
  return out;
};

/** Languages whose syntax errors come from Lezer error nodes (JSON regions use `JSON.parse`). */
const ERROR_NODE_LANGUAGES: ReadonlySet<CodeEditorLanguage> = new Set([
  'yaml',
  'javascript',
  'typescript',
  'python',
]);

/** JSON syntax error of the region (at most one — `JSON.parse` stops at the first). */
export const jsonSyntaxDiagnostics = (state: EditorState, region: JsonRegion): Diagnostic[] => {
  const text = state.sliceDoc(region.from, region.to);
  if (text.trim() === '') return [];
  try {
    JSON.parse(text);
    return [];
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const located = locateJsonSyntaxError(raw, text);
    let range: JsonRegion;
    if (located.offset !== null) {
      range = rangeAt(text, located.offset, region.from);
    } else {
      const node = firstErrorNode(state, region);
      if (node && node.to > node.from) range = node;
      else if (node) range = rangeAt(text, node.from - region.from, region.from);
      else range = rangeAt(text, text.length - text.trimStart().length, region.from);
    }
    return [
      {
        from: range.from,
        to: range.to,
        severity: 'error',
        message: located.message,
        source: SYNTAX_SOURCE,
      },
    ];
  }
};

/** Without `to`: one character, or a point at the end of the line. */
const defaultEnd = (doc: Text, from: number): number =>
  from < doc.lineAt(from).to ? from + 1 : from;

/**
 * Consumer diagnostic → CM diagnostic. `null` when `from.line` is outside the document;
 * a `to` line outside the document is clamped to the document end.
 */
export const toCmDiagnostic = (
  doc: Text,
  diagnostic: CodeEditorDiagnostic,
  startingLineNumber: number,
): Diagnostic | null => {
  const from = positionToOffset(doc, diagnostic.from, startingLineNumber);
  if (from === null) return null;
  const to = diagnostic.to
    ? Math.max(from, positionToOffset(doc, diagnostic.to, startingLineNumber) ?? doc.length)
    : defaultEnd(doc, from);
  return {
    from,
    to,
    severity: diagnostic.severity,
    message: diagnostic.message,
    ...(diagnostic.source === undefined ? {} : { source: diagnostic.source }),
  };
};

/** CM diagnostic → public form (absolute lines, 1-based columns). `hint` reads as `info`. */
export const toPublicDiagnostic = (
  doc: Text,
  diagnostic: Diagnostic,
  startingLineNumber: number,
): CodeEditorDiagnostic => ({
  from: offsetToPosition(doc, diagnostic.from, startingLineNumber),
  to: offsetToPosition(doc, diagnostic.to, startingLineNumber),
  severity: diagnostic.severity === 'hint' ? 'info' : diagnostic.severity,
  message: diagnostic.message,
  ...(diagnostic.source === undefined ? {} : { source: diagnostic.source }),
});

const externalDiagnostics = (
  doc: Text,
  external: readonly CodeEditorDiagnostic[],
  startingLineNumber: number,
): Diagnostic[] =>
  external.flatMap(diagnostic => {
    const converted = toCmDiagnostic(doc, diagnostic, startingLineNumber);
    return converted ? [converted] : [];
  });

const lintSource =
  (config: DiagnosticsConfig) =>
  (view: EditorView): readonly Diagnostic[] | Promise<readonly Diagnostic[]> => {
    const { state } = view;
    const region = jsonRegion(state, config.language);
    // JSON regions (json, http body): the precise JSON.parse message only — error nodes inside
    // the region would duplicate it. Other parsed languages: Lezer error nodes. bash/text: none.
    const syntax = region
      ? jsonSyntaxDiagnostics(state, region)
      : ERROR_NODE_LANGUAGES.has(config.language)
        ? syntaxErrorDiagnostics(state)
        : [];
    const external = externalDiagnostics(state.doc, config.external, config.startingLineNumber);
    const { schemaSource, schema } = config;
    if (
      !region ||
      syntax.length > 0 ||
      schema === undefined ||
      !schemaSource ||
      state.sliceDoc(region.from, region.to).trim() === ''
    ) {
      return [...syntax, ...external];
    }
    return schemaSource(state, region).then(
      schemaDiagnostics => [
        ...schemaDiagnostics.map(d => ({ ...d, source: d.source ?? SCHEMA_SOURCE })),
        ...external,
      ],
      (error: unknown) => {
        // biome-ignore lint/suspicious/noConsole: a failing schema must not hide syntax/consumer diagnostics
        console.error('[CodeEditor] JSON Schema validation failed', error);
        return external;
      },
    );
  };

/** Last list reported per view, as JSON — survives compartment reconfigures and documentId swaps. */
const reported = new WeakMap<EditorView, string>();
const EMPTY_LIST = '[]';

const reportChanges = (config: DiagnosticsConfig): Extension =>
  EditorView.updateListener.of(update => {
    for (const tr of update.transactions) {
      for (const effect of tr.effects) {
        if (!effect.is(setDiagnosticsEffect)) continue;
        const list = effect.value.map(d =>
          toPublicDiagnostic(tr.state.doc, d, config.startingLineNumber),
        );
        const key = JSON.stringify(list);
        if ((reported.get(update.view) ?? EMPTY_LIST) === key) continue;
        reported.set(update.view, key);
        config.onChange(list);
      }
    }
  });

const wavyUnderline = (token: string) => ({
  backgroundImage: 'none',
  textDecorationLine: 'underline',
  textDecorationStyle: 'wavy',
  textDecorationColor: `var(${token})`,
  textDecorationSkipInk: 'none',
  textUnderlineOffset: '3px',
});

const ERROR_INDICATOR = '--color-syntax-highlight-error-indicator';
const WARNING_INDICATOR = '--color-syntax-highlight-warning-indicator';
const INFO_INDICATOR = '--color-syntax-highlight-info-indicator';

/**
 * Underlines per spec §7.10 (existing indicator tokens only) and the lint tooltip on the
 * DS Tooltip surface (`TooltipContent`: `bg-component-tooltip-bg text-text-primary-alt
 * text-xs font-medium rounded-8 py-4 px-8`, z-index `--tooltip-z-index`). The surface rule
 * targets every hover tooltip so schema hover (T13) matches.
 */
export const diagnosticsTheme: Extension = EditorView.theme({
  '.cm-lintRange': { paddingBottom: '0' },
  '.cm-lintRange-error': wavyUnderline(ERROR_INDICATOR),
  '.cm-lintRange-warning': wavyUnderline(WARNING_INDICATOR),
  '.cm-lintRange-info': wavyUnderline(INFO_INDICATOR),
  '.cm-lintRange-hint': wavyUnderline(INFO_INDICATOR),
  '.cm-lintRange-active': { backgroundColor: 'transparent' },
  '.cm-lintPoint:after': { borderBottomColor: `var(${ERROR_INDICATOR})` },
  '.cm-lintPoint-warning:after': { borderBottomColor: `var(${WARNING_INDICATOR})` },
  '.cm-lintPoint-info:after': { borderBottomColor: `var(${INFO_INDICATOR})` },
  '.cm-lintPoint-hint:after': { borderBottomColor: `var(${INFO_INDICATOR})` },
  '.cm-tooltip.cm-tooltip-hover': {
    border: 'none',
    borderRadius: 'var(--radius-8)',
    backgroundColor: 'var(--color-component-tooltip-bg)',
    color: 'var(--color-text-primary-alt)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    overflow: 'hidden',
    zIndex: 'var(--tooltip-z-index)',
  },
  '.cm-tooltip-lint': { padding: '4px 0' },
  '.cm-diagnostic': {
    padding: '0 8px 0 6px',
    marginLeft: '0',
    borderLeft: `2px solid var(${ERROR_INDICATOR})`,
  },
  '.cm-diagnostic-warning': { borderLeft: `2px solid var(${WARNING_INDICATOR})` },
  '.cm-diagnostic-info': { borderLeft: `2px solid var(${INFO_INDICATOR})` },
  '.cm-diagnostic-hint': { borderLeft: `2px solid var(${INFO_INDICATOR})` },
  '.cm-diagnosticSource': { fontSize: 'var(--text-xs)', opacity: '0.7' },
});

/**
 * Diagnostics (spec §7.12, §14 A3): one debounced linter merging syntax errors (JSON.parse for
 * json / the http JSON body, Lezer error nodes for yaml / javascript / typescript / python), schema errors (via `schemaSource`, T13) and the consumer `diagnostics` prop.
 * Underlines + hover tooltip only — no lint gutter, panel or lint keymap.
 */
export const diagnosticsExtension = (config: DiagnosticsConfig): Extension => [
  linter(lintSource(config), {
    delay: LINT_DELAY,
    autoPanel: false,
    // Lazy parsers (JS/TS/Python) arrive through a language-compartment reconfigure.
    needsRefresh: update => update.transactions.some(tr => tr.reconfigured),
  }),
  reportChanges(config),
  diagnosticsTheme,
];
