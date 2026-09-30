import type { ParserOptions } from '@babel/parser';
import type { Diagnostic } from '@codemirror/lint';

/** Languages whose syntax errors come from `@babel/parser` (spec §14 A5). */
export type BabelLanguage = 'javascript' | 'typescript';

type BabelParser = typeof import('@babel/parser');

let pending: Promise<BabelParser> | null = null;

/** Cached `import('@babel/parser')` — loaded only for javascript/typescript documents. A failed load is retried next time. */
export const loadBabelParser = (): Promise<BabelParser> => {
  if (!pending) {
    pending = import('@babel/parser').catch((error: unknown) => {
      pending = null;
      throw error;
    });
  }
  return pending;
};

const optionsFor = (language: BabelLanguage): ParserOptions => ({
  sourceType: 'module',
  errorRecovery: true,
  allowReturnOutsideFunction: true,
  plugins:
    language === 'typescript'
      ? ['typescript', 'explicitResourceManagement']
      : ['jsx', 'explicitResourceManagement'],
});

interface PositionedError {
  pos: number;
  message: string;
}

const isPositionedError = (value: unknown): value is PositionedError =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { pos?: unknown }).pos === 'number' &&
  typeof (value as { message?: unknown }).message === 'string';

/** Babel appends ` (line:column)` to every message; the underline already shows where. */
const stripLocation = (message: string): string => message.replace(/ \(\d+:\d+\)$/, '');

/**
 * Syntax diagnostics for `text` from an already loaded Babel parser: recovered `errors[]` plus
 * a thrown fatal error, each at `error.pos` covering one character (clamped to the text end),
 * sorted, one per position. `base` shifts offsets into the document.
 */
export const babelDiagnostics = (
  parser: BabelParser,
  text: string,
  language: BabelLanguage,
  base = 0,
): Diagnostic[] => {
  const errors: unknown[] = [];
  try {
    const result = parser.parse(text, optionsFor(language));
    errors.push(...(result.errors ?? []));
  } catch (error) {
    errors.push(error);
  }
  const seen = new Set<number>();
  const out: Diagnostic[] = [];
  for (const error of errors) {
    if (!isPositionedError(error)) continue;
    const from = Math.min(Math.max(error.pos, 0), text.length);
    if (seen.has(from)) continue;
    seen.add(from);
    out.push({
      from: base + from,
      to: base + Math.min(from + 1, text.length),
      severity: 'error',
      source: 'syntax',
      message: stripLocation(error.message),
    });
  }
  return out.sort((a, b) => a.from - b.from);
};

/** Loads Babel (cached) and returns the syntax diagnostics of `text`. */
export const babelSyntaxDiagnostics = async (
  text: string,
  language: BabelLanguage,
): Promise<Diagnostic[]> => babelDiagnostics(await loadBabelParser(), text, language);
