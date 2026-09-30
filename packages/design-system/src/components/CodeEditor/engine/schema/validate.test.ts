import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { findJsonBodyRange, http } from '../languages/http';
import { json } from '../languages/json';
import { validateAgainstSchema } from './validate';

const schema = {
  type: 'object',
  required: ['name', 'mode'],
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    mode: { enum: ['block', 'monitor'] },
    tags: { type: 'array', items: { type: 'string' } },
    'a/b': { type: 'number' },
  },
};

const jsonState = (doc: string) => EditorState.create({ doc, extensions: [json()] });
const whole = (state: EditorState) => ({ from: 0, to: state.doc.length });
const marked = (state: EditorState, d: { from: number; to: number }) =>
  state.sliceDoc(d.from, d.to);

describe('validateAgainstSchema', () => {
  it('maps a wrong type to the value range', async () => {
    const state = jsonState('{"name": 5, "mode": "block"}');
    const diagnostics = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({ severity: 'error', source: 'schema' });
    expect(diagnostics[0]?.message).toContain('string');
    expect(marked(state, diagnostics[0] ?? { from: 0, to: 0 })).toBe('5');
  });

  it('maps a missing required property to the object start', async () => {
    const state = jsonState('  {"name": "x"}');
    const [diagnostic] = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostic).toMatchObject({ from: 2, to: 3, source: 'schema' });
    expect(diagnostic?.message).toContain('mode');
  });

  it('maps nested errors and keys with "/" to their values', async () => {
    const state = jsonState('{"name": "x", "mode": "block", "tags": ["ok", 7], "a/b": "no"}');
    const diagnostics = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostics.map(d => marked(state, d))).toEqual(['7', '"no"']);
  });

  it('marks the key of a property the schema does not allow', async () => {
    const state = jsonState('{"name": "x", "mode": "block", "extra": 1}');
    const diagnostics = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostics.map(d => marked(state, d))).toEqual(['"extra"']);
  });

  it('maps a root type error to the whole value', async () => {
    const state = jsonState('[1]');
    const [diagnostic] = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostic).toMatchObject({ from: 0, to: 3 });
  });

  it('returns nothing for valid data', async () => {
    const state = jsonState('{"name": "x", "mode": "monitor"}');
    expect(await validateAgainstSchema(state, whole(state), schema)).toEqual([]);
  });

  it('skips syntactically invalid JSON (syntax errors come from the syntax source)', async () => {
    const state = jsonState('{"name": 5,');
    expect(await validateAgainstSchema(state, whole(state), schema)).toEqual([]);
  });

  it('validates an HTTP JSON body with absolute offsets', async () => {
    const head = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n';
    const state = EditorState.create({
      doc: `${head}{"name": 5, "mode": "block"}`,
      extensions: [http()],
    });
    const region = findJsonBodyRange(state);
    expect(region).not.toBeNull();
    if (!region) return;

    const [diagnostic] = await validateAgainstSchema(state, region, schema);
    expect(diagnostic?.from).toBe(head.length + '{"name": '.length);
    expect(diagnostic && marked(state, diagnostic)).toBe('5');
  });
});
