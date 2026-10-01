import type { Diagnostic } from '@codemirror/lint';

type LuaParser = typeof import('luaparse');

let pending: Promise<LuaParser> | null = null;

/** Cached `import('luaparse')` — loaded only for lua documents. A failed load is retried next time. */
export const loadLuaParser = (): Promise<LuaParser> => {
  if (!pending) {
    pending = import('luaparse').catch((error: unknown) => {
      pending = null;
      throw error;
    });
  }
  return pending;
};

interface LuaParseError {
  index: number;
  message: string;
}

const isLuaParseError = (value: unknown): value is LuaParseError =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { index?: unknown }).index === 'number' &&
  typeof (value as { message?: unknown }).message === 'string';

/** luaparse prefixes every message with `[line:column] `; the underline already shows where. */
const stripLocation = (message: string): string => message.replace(/^\[\d+:\d+\]\s*/, '');

/**
 * Syntax diagnostics for `text` from an already loaded luaparse: at most one (luaparse stops at the
 * first error), at `error.index` covering one character (clamped to the text end). `base` shifts
 * offsets into the document. `luaVersion: '5.3'` is the most permissive grammar (goto, `//`,
 * bitwise operators), which also covers OpenResty/LuaJIT code.
 */
export const luaDiagnostics = (parser: LuaParser, text: string, base = 0): Diagnostic[] => {
  try {
    parser.parse(text, {
      luaVersion: '5.3',
      comments: false,
      locations: false,
      ranges: false,
      scope: false,
    });
    return [];
  } catch (error) {
    if (!isLuaParseError(error)) return [];
    const from = Math.min(Math.max(error.index, 0), text.length);
    return [
      {
        from: base + from,
        to: base + Math.min(from + 1, text.length),
        severity: 'error',
        source: 'syntax',
        message: stripLocation(error.message),
      },
    ];
  }
};

/** Loads luaparse (cached) and returns the syntax diagnostics of `text`. */
export const luaSyntaxDiagnostics = async (text: string): Promise<Diagnostic[]> =>
  luaDiagnostics(await loadLuaParser(), text);
