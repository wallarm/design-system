import { syntaxTree } from '@codemirror/language';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  activeDiagnostics,
  destroyLintedViews,
  flushLint,
  mountLinted,
} from '../../../testUtils/codeEditorDiagnostics';
import type { CodeEditorLanguage } from '../types';
import { loadBabelParser } from './babelSyntax';
import {
  jsonRegion,
  jsonSyntaxDiagnostics,
  LINT_DELAY,
  syntaxErrorDiagnostics,
} from './diagnostics';
import { languageExtension, loadLanguageExtension } from './languages';
import { loadLuaParser } from './luaSyntax';

const HTTP_JSON = 'POST /users HTTP/1.1\nContent-Type: application/json\n\n{"a": 1,}';
const HTTP_TEXT = 'POST /users HTTP/1.1\nContent-Type: text/plain\n\n{"a": 1,}';

const stateOf = (doc: string, language: 'json' | 'http' | 'yaml' | 'text') =>
  EditorState.create({ doc, extensions: languageExtension(language) });

// JS/TS lint results wait on the Babel chunk; load it once so `flushLint`'s single tick suffices.
beforeAll(async () => {
  await loadBabelParser();
  await loadLuaParser();
});

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

// Exact copies of the `Languages` story samples (CodeEditor.stories.tsx) — they must lint clean.
const STORY_PYTHON = `from dataclasses import dataclass


@dataclass
class Rule:
    action: str
    point: list[str]
    enabled: bool = True


def active(rules: list[Rule]) -> list[Rule]:
    return [r for r in rules if r.enabled]
`;
const STORY_JSON = `{
  "action": "block",
  "point": ["header", "X-Forwarded-For"],
  "enabled": true,
  "threshold": 42
}
`;
const STORY_JAVASCRIPT = `export async function fetchRules(client, { limit = 50 } = {}) {
  const res = await client.get('/api/v2/rules', { params: { limit } });
  return res.data.filter(rule => rule.enabled);
}
`;
const STORY_TYPESCRIPT = `interface Rule {
  action: 'block' | 'monitor';
  point: string[];
  enabled: boolean;
}

export const activeRules = (rules: readonly Rule[]): Rule[] =>
  rules.filter((rule): rule is Rule => rule.enabled);
`;
const STORY_YAML = `rules:
  - action: block
    point: [header, X-Forwarded-For]
    enabled: true
  - action: monitor
    point: [query, id]
    enabled: false
`;

const STORY_LUA = `local cjson = require("cjson")

local BLOCKED = { "10.0.0.1", "10.0.0.2" }

local function check(ctx)
  local ip = ngx.var.remote_addr
  for _, blocked in pairs(BLOCKED) do
    if ip ~= blocked then goto continue end
    ngx.log(ngx.WARN, "blocked ", ip)
    ngx.exit(403)
    ::continue::
  end
  ngx.say(cjson.encode({ ok = true, count = #BLOCKED }))
end

return { check = check }
`;

const BROKEN: readonly { language: CodeEditorLanguage; doc: string; near: number }[] = [
  { language: 'json', doc: '{"a": 1 "b": 2}', near: 8 },
  { language: 'yaml', doc: 'a: [1, 2', near: 3 },
  { language: 'javascript', doc: 'function f( {', near: 11 },
  { language: 'typescript', doc: 'let a: = 1;', near: 6 },
  { language: 'python', doc: 'def f(:\n  pass', near: 6 },
  { language: 'lua', doc: 'local x = = 1', near: 10 },
];

const VALID: readonly { name: string; language: CodeEditorLanguage; doc: string }[] = [
  { name: 'json', language: 'json', doc: '{"a": 1, "b": [true, null]}' },
  { name: 'yaml', language: 'yaml', doc: 'a: [1, 2]\nb:\n  - c\n' },
  { name: 'Languages story lua', language: 'lua', doc: STORY_LUA },
  {
    name: 'javascript',
    language: 'javascript',
    doc: 'function f(a, { b = 1 } = {}) {\n  return a + b;\n}\n',
  },
  {
    name: 'typescript',
    language: 'typescript',
    doc: 'let a: number = 1;\nconst f = (x: string): string => x;\n',
  },
  { name: 'python', language: 'python', doc: 'def f(x):\n    return x\n' },
  { name: 'Languages story python', language: 'python', doc: STORY_PYTHON },
  { name: 'Languages story json', language: 'json', doc: STORY_JSON },
  { name: 'Languages story javascript', language: 'javascript', doc: STORY_JAVASCRIPT },
  { name: 'Languages story typescript', language: 'typescript', doc: STORY_TYPESCRIPT },
  { name: 'Languages story yaml', language: 'yaml', doc: STORY_YAML },
  {
    name: 'ts arrow type predicate',
    language: 'typescript',
    doc: 'const isRule = (x: unknown): x is Rule => true;\n',
  },
  {
    name: 'ts declare module',
    language: 'typescript',
    doc: 'declare module "m" {\n  export const x: number;\n}\n',
  },
  {
    name: 'nested / non-literal pattern defaults',
    language: 'javascript',
    doc: 'const { a = f(1, 2), b: { c = 2 } = {}, ...rest } = o;\n',
  },
  {
    name: 'ts nested / non-literal pattern defaults',
    language: 'typescript',
    doc: 'const { a = f(1, 2), b: { c = 2 } = {} }: Options = o;\n',
  },
  {
    name: 'jsx in javascript',
    language: 'javascript',
    doc: 'const el = <div className="x">{a}</div>;\n',
  },
  {
    name: 'optional chaining + nullish',
    language: 'javascript',
    doc: 'const n = user?.profile?.name ?? "anon";\nconst m = obj?.[key]?.(1);\n',
  },
  {
    name: 'ts satisfies',
    language: 'typescript',
    doc: 'const config = { retries: 3 } satisfies Partial<Options>;\n',
  },
  { name: 'explicit resource management', language: 'typescript', doc: 'using r = g();\n' },
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
    const doc = 'def f(:\n  pass\ndef g(:\n  pass\n';
    const state = EditorState.create({ doc, extensions: await supportFor('python') });
    const all = syntaxErrorDiagnostics(state);
    expect(all.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < all.length; i++) {
      expect(all[i]?.from).toBeGreaterThan(all[i - 1]?.to ?? Number.POSITIVE_INFINITY);
    }

    const secondDef = doc.indexOf('def g');
    const inRegion = syntaxErrorDiagnostics(state, { from: secondDef, to: doc.length });
    expect(inRegion.length).toBeGreaterThanOrEqual(1);
    for (const d of inRegion) expect(d.from).toBeGreaterThanOrEqual(secondDef);
  });

  it('returns nothing without a parser', () => {
    const state = EditorState.create({ doc: '{', extensions: languageExtension('text') });
    expect(syntaxErrorDiagnostics(state)).toEqual([]);
  });
});

describe('syntax diagnostics on a partially parsed tree (parse timeout)', () => {
  // Large enough that a 0 ms budget cannot parse it to the end.
  const LARGE_YAML = Array.from({ length: 20000 }, (_, i) => `key${i}: [${i}, ${i + 1}]`).join(
    '\n',
  );

  it('ignores error nodes at or past the parsed extent, including "end of input"', () => {
    const state = EditorState.create({ doc: LARGE_YAML, extensions: languageExtension('yaml') });
    expect(syntaxErrorDiagnostics(state, undefined, 0)).toEqual([]);
  });

  it('still reports real errors inside the parsed extent', () => {
    const doc = `a: [1, 2\n${LARGE_YAML}`;
    const state = EditorState.create({ doc, extensions: languageExtension('yaml') });
    const diagnostics = syntaxErrorDiagnostics(state, undefined, 0);
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(diagnostics.every(d => d.from < doc.length)).toBe(true);
  });

  it('keeps the JSON fallback away from cut-off error nodes', () => {
    // No position in the message → the Lezer fallback; an incomplete tree must not
    // point at its artificial end.
    const doc = `[${Array.from({ length: 20000 }, (_, i) => i).join(', ')}, tru]`;
    const state = EditorState.create({ doc, extensions: languageExtension('json') });
    const [diagnostic] = jsonSyntaxDiagnostics(state, { from: 0, to: doc.length }, 0);
    const parsedTo = syntaxTree(state).length;
    expect(parsedTo).toBeLessThan(doc.length);
    // The real error ("tru") lies past the parsed extent → the fallback is the content start,
    // never the cut-off artefact at `parsedTo`.
    expect(diagnostic).toMatchObject({ from: 0, to: 1, message: "Unexpected token ']'" });
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

  it.each(VALID)('reports nothing for valid $name', async ({ language, doc }) => {
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

  it('re-lints when the lazily loaded Python parser is reconfigured in', async () => {
    const language = new Compartment();
    const { view } = mountLinted('def f(:\n  pass', { language: 'python' }, language.of([]));
    await flushLint(view);
    expect(activeDiagnostics(view.state)).toEqual([]);

    // No forceLinting: the reconfigure alone must schedule a lint run (needsRefresh).
    view.dispatch({ effects: language.reconfigure(await loadLanguageExtension('python')) });
    await vi.waitFor(() => expect(activeDiagnostics(view.state).length).toBeGreaterThan(0), {
      timeout: LINT_DELAY * 5,
    });
  });
});

describe('known limitation — @lezer/python 1.1.19 misreports valid code (not filtered)', () => {
  const pythonSyntaxCount = async (doc: string) => {
    const state = EditorState.create({ doc, extensions: await supportFor('python') });
    return syntaxErrorDiagnostics(state).length;
  };

  it.fails('positional-only lambda parameters', async () => {
    expect(await pythonSyntaxCount('f = lambda a, /, b=1: a + b\n')).toBe(0);
  });

  it.fails('parenthesised context managers', async () => {
    expect(await pythonSyntaxCount('with (open(a) as f, open(b) as g):\n    pass\n')).toBe(0);
  });
});
