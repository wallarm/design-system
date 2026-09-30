import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  activeDiagnostics,
  destroyLintedViews,
  flushLint,
  mountLinted,
} from '../../../testUtils/codeEditorDiagnostics';
import type { CodeEditorLanguage } from '../types';
import {
  jsonRegion,
  jsonSyntaxDiagnostics,
  LINT_DELAY,
  syntaxErrorDiagnostics,
} from './diagnostics';
import { languageExtension, loadLanguageExtension } from './languages';

const HTTP_JSON = 'POST /users HTTP/1.1\nContent-Type: application/json\n\n{"a": 1,}';
const HTTP_TEXT = 'POST /users HTTP/1.1\nContent-Type: text/plain\n\n{"a": 1,}';

const stateOf = (doc: string, language: 'json' | 'http' | 'yaml' | 'text') =>
  EditorState.create({ doc, extensions: languageExtension(language) });

afterEach(() => {
  destroyLintedViews();
});

describe('jsonRegion', () => {
  it('is the whole document for json', () => {
    expect(jsonRegion(stateOf('{"a": 1}', 'json'), 'json')).toEqual({ from: 0, to: 8 });
  });

  it('is the JSON body for http', () => {
    const state = stateOf(HTTP_JSON, 'http');
    const region = jsonRegion(state, 'http');
    expect(region).not.toBeNull();
    expect(state.sliceDoc(region?.from, region?.to)).toBe('{"a": 1,}');
  });

  it('is null for an http body that is not JSON and for other languages', () => {
    expect(jsonRegion(stateOf(HTTP_TEXT, 'http'), 'http')).toBeNull();
    expect(jsonRegion(stateOf('a: 1', 'yaml'), 'yaml')).toBeNull();
    expect(jsonRegion(stateOf('{', 'text'), 'text')).toBeNull();
  });
});

describe('jsonSyntaxDiagnostics', () => {
  it('returns nothing for valid, empty and whitespace-only JSON', () => {
    for (const doc of ['{"a": [1, true, null]}', '', '  \n ']) {
      const state = stateOf(doc, 'json');
      expect(jsonSyntaxDiagnostics(state, { from: 0, to: state.doc.length })).toEqual([]);
    }
  });

  it('underlines the character at the reported position', () => {
    const doc = '{\n  "a": 1\n  "b": 2\n}';
    const state = stateOf(doc, 'json');
    const at = doc.indexOf('"b"');

    expect(jsonSyntaxDiagnostics(state, { from: 0, to: doc.length })).toEqual([
      {
        from: at,
        to: at + 1,
        severity: 'error',
        message: "Expected ',' or '}' after property value",
        source: 'syntax',
      },
    ]);
  });

  it('underlines the last non-whitespace character on unexpected end of input', () => {
    const doc = '{"a": \n';
    const state = stateOf(doc, 'json');
    const [diagnostic] = jsonSyntaxDiagnostics(state, { from: 0, to: doc.length });

    expect(diagnostic).toMatchObject({ from: 4, to: 5, message: 'Unexpected end of JSON input' });
  });

  it('falls back to the Lezer error node when the message has no position', () => {
    const doc = '{"a": tru}';
    const state = stateOf(doc, 'json');
    const [diagnostic] = jsonSyntaxDiagnostics(state, { from: 0, to: doc.length });

    expect(diagnostic?.message).toBe("Unexpected token '}'");
    expect(diagnostic?.from).toBeGreaterThanOrEqual(doc.indexOf('tru'));
    expect(diagnostic?.to).toBeLessThanOrEqual(doc.length);
    expect(diagnostic?.to).toBeGreaterThan(diagnostic?.from ?? Number.POSITIVE_INFINITY);
  });
});

describe('diagnosticsExtension — JSON syntax', () => {
  it('reports one syntax error at the right offset for invalid json', async () => {
    const doc = '{"name" "x"}';
    const { view } = mountLinted(doc, { language: 'json' });
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([
      {
        from: doc.indexOf('"x"'),
        to: doc.indexOf('"x"') + 1,
        severity: 'error',
        message: "Expected ':' after property name",
        source: 'syntax',
      },
    ]);
  });

  it('shifts http JSON body errors to absolute document offsets', async () => {
    const { view } = mountLinted(HTTP_JSON, { language: 'http' });
    await flushLint(view);

    const at = HTTP_JSON.lastIndexOf('}');
    expect(activeDiagnostics(view.state)).toEqual([
      {
        from: at,
        to: at + 1,
        severity: 'error',
        message: 'Expected double-quoted property name',
        source: 'syntax',
      },
    ]);
  });

  it('does not lint an http body that is not JSON, nor text/bash documents', async () => {
    for (const [doc, language] of [
      [HTTP_TEXT, 'http'],
      ['{', 'text'],
      ['if [ ; then', 'bash'],
    ] as const) {
      const { view } = mountLinted(doc, { language });
      await flushLint(view);
      expect(activeDiagnostics(view.state)).toEqual([]);
    }
  });

  it('clears the error once the JSON is fixed', async () => {
    const { view } = mountLinted('{"a": 1,}', { language: 'json' });
    await flushLint(view);
    expect(activeDiagnostics(view.state)).toHaveLength(1);

    view.dispatch({ changes: { from: 7, to: 8 } });
    await flushLint(view);
    expect(view.state.doc.toString()).toBe('{"a": 1}');
    expect(activeDiagnostics(view.state)).toEqual([]);
  });
});

/** Language support for any language, lazy parsers included. */
const supportFor = async (language: CodeEditorLanguage): Promise<Extension> => [
  languageExtension(language),
  await loadLanguageExtension(language),
];

const BROKEN: readonly { language: CodeEditorLanguage; doc: string; near: number }[] = [
  { language: 'json', doc: '{"a": 1 "b": 2}', near: 8 },
  { language: 'yaml', doc: 'a: [1, 2', near: 3 },
  { language: 'javascript', doc: 'function f( {', near: 11 },
  { language: 'typescript', doc: 'let a: = 1;', near: 6 },
  { language: 'python', doc: 'def f(:\n  pass', near: 6 },
];

const VALID: readonly { language: CodeEditorLanguage; doc: string }[] = [
  { language: 'json', doc: '{"a": 1, "b": [true, null]}' },
  { language: 'yaml', doc: 'a: [1, 2]\nb:\n  - c\n' },
  // Not `{ b = 1 }`: @lezer/javascript 1.5.5 flags shorthand defaults in object patterns.
  { language: 'javascript', doc: 'function f(a, { b } = {}) {\n  return a + b ?? 1;\n}\n' },
  { language: 'typescript', doc: 'let a: number = 1;\nconst f = (x: string): string => x;\n' },
  { language: 'python', doc: 'def f(x):\n    return x\n' },
];

describe('syntaxErrorDiagnostics', () => {
  it('reports Lezer error nodes as "Unexpected" syntax errors', async () => {
    const doc = 'a: [1, 2';
    const state = EditorState.create({ doc, extensions: await supportFor('yaml') });
    const diagnostics = syntaxErrorDiagnostics(state);

    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    for (const d of diagnostics) {
      expect(d).toMatchObject({ severity: 'error', source: 'syntax' });
      expect(d.message).toMatch(/^Unexpected (".*"|end of input)$/s);
      expect(d.to).toBeGreaterThanOrEqual(d.from);
      expect(d.to).toBeLessThanOrEqual(doc.length);
    }
  });

  it('collapses touching error nodes and only looks inside the region when given', async () => {
    const doc = 'let a: = 1;\nlet b: = 2;';
    const state = EditorState.create({ doc, extensions: await supportFor('typescript') });
    const all = syntaxErrorDiagnostics(state);
    expect(all.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < all.length; i++) {
      expect(all[i]?.from).toBeGreaterThan(all[i - 1]?.to ?? Number.POSITIVE_INFINITY);
    }

    const secondLine = doc.indexOf('\n') + 1;
    const inRegion = syntaxErrorDiagnostics(state, { from: secondLine, to: doc.length });
    expect(inRegion.length).toBeGreaterThanOrEqual(1);
    for (const d of inRegion) expect(d.from).toBeGreaterThanOrEqual(secondLine);
  });

  it('returns nothing without a parser', () => {
    const state = EditorState.create({ doc: '{', extensions: languageExtension('text') });
    expect(syntaxErrorDiagnostics(state)).toEqual([]);
  });
});

describe('diagnosticsExtension — syntax errors for every parsed language', () => {
  it.each(BROKEN)(
    'reports a syntax error for broken $language',
    async ({ language, doc, near }) => {
      const { view } = mountLinted(doc, { language }, await loadLanguageExtension(language));
      await flushLint(view);

      const diagnostics = activeDiagnostics(view.state);
      expect(diagnostics.length).toBeGreaterThanOrEqual(1);
      expect(diagnostics.every(d => d.source === 'syntax' && d.severity === 'error')).toBe(true);
      // Plausible offset: the first error sits at (or just after) the broken token.
      expect(diagnostics[0]?.from).toBeGreaterThanOrEqual(near - 2);
      expect(diagnostics[0]?.from).toBeLessThanOrEqual(doc.length);
    },
  );

  it.each(VALID)('reports nothing for valid $language', async ({ language, doc }) => {
    const { view, onChange } = mountLinted(
      doc,
      { language },
      await loadLanguageExtension(language),
    );
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports exactly one JSON syntax error (the JSON.parse one, no error-node duplicates)', async () => {
    const doc = '{"a": 1 "b": 2}';
    const { view } = mountLinted(doc, { language: 'json' });
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([
      {
        from: doc.indexOf('"b"'),
        to: doc.indexOf('"b"') + 1,
        severity: 'error',
        message: "Expected ',' or '}' after property value",
        source: 'syntax',
      },
    ]);
  });

  it('reports one JSON.parse error for a broken http JSON body and no error nodes', async () => {
    const doc = 'POST /users HTTP/1.1\nContent-Type: application/json\n\n{"a": 1 "b": [1, }';
    const { view } = mountLinted(doc, { language: 'http' });
    await flushLint(view);

    const diagnostics = activeDiagnostics(view.state);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({ source: 'syntax', from: doc.indexOf('"b"') });
  });

  it('re-lints when a lazily loaded parser is reconfigured in', async () => {
    const language = new Compartment();
    const { view } = mountLinted('function f( {', { language: 'javascript' }, language.of([]));
    await flushLint(view);
    expect(activeDiagnostics(view.state)).toEqual([]);

    // No forceLinting: the reconfigure alone must schedule a lint run (needsRefresh).
    view.dispatch({ effects: language.reconfigure(await loadLanguageExtension('javascript')) });
    await vi.waitFor(() => expect(activeDiagnostics(view.state).length).toBeGreaterThan(0), {
      timeout: LINT_DELAY * 5,
    });
  });
});
