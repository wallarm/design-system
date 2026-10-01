import {
  type Completion,
  CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { JsonSchema } from '../../types';
import { findJsonBodyRange, http } from '../languages/http';
import { json } from '../languages/json';
import { schemaCompletionSource } from './complete';

const schema: JsonSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', description: 'Rule name' },
    mode: { enum: ['block', 'monitor'] },
    enabled: { type: 'boolean' },
    kind: { const: 'rule' },
    meta: { type: 'object', properties: { owner: { type: 'string' } } },
    tags: { type: 'array', items: { enum: ['a', 'b'] } },
  },
};

const wholeDoc = (state: EditorState) => ({ from: 0, to: state.doc.length });
const jsonSource = schemaCompletionSource(() => schema, wholeDoc);

/** `|` marks the cursor. */
const setup = (docWithCursor: string, extensions = [json()]) => {
  const pos = docWithCursor.indexOf('|');
  const doc = docWithCursor.replace('|', '');
  return { state: EditorState.create({ doc, extensions }), pos };
};

const complete = async (docWithCursor: string, explicit = false) => {
  const { state, pos } = setup(docWithCursor);
  return jsonSource(new CompletionContext(state, pos, explicit));
};

const labels = (result: CompletionResult | null) => result?.options.map(o => o.label) ?? null;

const views: EditorView[] = [];
afterEach(() => {
  for (const view of views.splice(0)) view.destroy();
});

/** Applies `option` the way the autocomplete UI does and returns the new document. */
const accept = (docWithCursor: string, result: CompletionResult | null, label: string) => {
  const { state, pos } = setup(docWithCursor);
  const view = new EditorView({ state: state.update({ selection: { anchor: pos } }).state });
  views.push(view);
  const option = result?.options.find(o => o.label === label) as Completion;
  const apply = option.apply ?? option.label;
  const from = result?.from ?? pos;
  if (typeof apply === 'string') {
    view.dispatch({ changes: { from, to: pos, insert: apply } });
  } else {
    apply(view, option, from, pos);
  }
  return view.state.doc.toString();
};

describe('schemaCompletionSource — property names', () => {
  it('suggests the properties that are not present yet', async () => {
    const result = await complete('{"name": "x", "|"}');
    expect(labels(result)).toEqual(['mode', 'enabled', 'kind', 'meta', 'tags']);
  });

  it('marks required properties and uses description as info', async () => {
    const result = await complete('{"|"}');
    const name = result?.options.find(o => o.label === 'name');
    expect(name).toMatchObject({
      detail: 'string (required)',
      info: 'Rule name',
      type: 'property',
    });
    expect(result?.options.find(o => o.label === 'mode')?.detail).toBe('enum');
  });

  it('inserts the quoted key and ": " inside an auto-closed string', async () => {
    const doc = '{"na|"}';
    const result = await complete(doc);
    expect(result?.from).toBe(2);
    expect(accept(doc, result, 'name')).toBe('{"name": }');
  });

  it('does not add a second colon', async () => {
    const doc = '{"mo|": "block"}';
    expect(accept(doc, await complete(doc), 'mode')).toBe('{"mode": "block"}');
  });

  it('completes an unquoted word into a quoted key', async () => {
    const doc = '{"name": "x", en|}';
    expect(accept(doc, await complete(doc), 'enabled')).toBe('{"name": "x", "enabled": }');
  });

  it('needs an explicit request when nothing is typed', async () => {
    expect(await complete('{|}')).toBeNull();
    expect(labels(await complete('{|}', true))).toContain('name');
  });

  it('completes nested objects from the nested schema', async () => {
    expect(labels(await complete('{"meta": {"|"}}'))).toEqual(['owner']);
  });
});

describe('schemaCompletionSource — values', () => {
  it('suggests enum values', async () => {
    const doc = '{"mode": "|"}';
    const result = await complete(doc);
    expect(labels(result)).toEqual(['"block"', '"monitor"']);
    expect(accept(doc, result, '"monitor"')).toBe('{"mode": "monitor"}');
  });

  it('suggests booleans and const values', async () => {
    expect(labels(await complete('{"enabled": t|}'))).toEqual(['true', 'false']);
    expect(labels(await complete('{"kind": |}', true))).toEqual(['"rule"']);
  });

  it('suggests enum values for array items', async () => {
    expect(labels(await complete('{"tags": ["a", "|"]}'))).toEqual(['"a"', '"b"']);
  });

  it('returns null where the schema has nothing to offer', async () => {
    expect(await complete('{"name": "|"}')).toBeNull();
    expect(await complete('{"unknown": {"|"}}')).toBeNull();
  });
});

describe('schemaCompletionSource — scope', () => {
  it('works inside an HTTP JSON body', async () => {
    const doc = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n{"name": "x", "|"}';
    const { state, pos } = setup(doc, [http()]);
    const source = schemaCompletionSource(() => schema, findJsonBodyRange);
    const result = await source(new CompletionContext(state, pos, false));
    expect(labels(result)).toEqual(['mode', 'enabled', 'kind', 'meta', 'tags']);
  });

  it('stays silent outside the region and without a schema', async () => {
    const doc = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n{}';
    const { state } = setup(doc, [http()]);
    const source = schemaCompletionSource(() => schema, findJsonBodyRange);
    expect(await source(new CompletionContext(state, 5, true))).toBeNull();

    const noSchema = schemaCompletionSource(() => undefined, wholeDoc);
    const { state: jsonDoc, pos } = setup('{"|"}');
    expect(await noSchema(new CompletionContext(jsonDoc, pos, true))).toBeNull();
  });
});

describe('schemaCompletionSource — combinators', () => {
  const run = async (s: JsonSchema, docWithCursor: string, explicit = false) => {
    const { state, pos } = setup(docWithCursor);
    return schemaCompletionSource(() => s, wholeDoc)(new CompletionContext(state, pos, explicit));
  };

  it('offers properties from every allOf branch', async () => {
    const s: JsonSchema = {
      type: 'object',
      allOf: [
        { properties: { a: { type: 'string' } } },
        { required: ['b'], properties: { b: { type: 'number' } } },
      ],
    };
    const result = await run(s, '{"|"}');
    expect(labels(result)).toEqual(['a', 'b']);
    expect(result?.options.find(o => o.label === 'b')?.detail).toBe('number (required)');
  });

  it('offers the keys of the oneOf branch the typed data selects', async () => {
    const s: JsonSchema = {
      type: 'object',
      oneOf: [
        { required: ['k'], properties: { k: { const: 'x' }, a: { type: 'string' } } },
        { required: ['k'], properties: { k: { const: 'y' }, b: { type: 'string' } } },
      ],
    };
    expect(labels(await run(s, '{"k": "y", "|"}'))).toEqual(['b']);
    expect(labels(await run(s, '{"k": "x", "|"}'))).toEqual(['a']);
  });

  it('reduces nested objects against the partially typed document', async () => {
    const s: JsonSchema = {
      type: 'object',
      properties: {
        meta: {
          allOf: [{ properties: { owner: { type: 'string' } } }, { properties: { team: {} } }],
        },
      },
    };
    expect(labels(await run(s, '{"meta": {"owner": "me", "|"}, "x": '))).toEqual(['team']);
  });

  it('still resolves $ref', async () => {
    const s: JsonSchema = {
      $defs: { rule: { type: 'object', properties: { r: { type: 'string' } } } },
      $ref: '#/$defs/rule',
    };
    expect(labels(await run(s, '{"|"}'))).toEqual(['r']);
  });

  it('resolves to null instead of rejecting for a broken schema', async () => {
    const s: JsonSchema = { type: 'object', properties: { a: { $ref: '#/nope' } } };
    await expect(run(s, '{"a": |}', true)).resolves.toBeNull();
  });
});
