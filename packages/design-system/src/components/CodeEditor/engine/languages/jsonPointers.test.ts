import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { findJsonBodyRange, http } from './http';
import { json } from './json';
import { getJsonPointers, pointerAt } from './jsonPointers';

const jsonState = (doc: string) => EditorState.create({ doc, extensions: [json()] });
const httpState = (doc: string) => EditorState.create({ doc, extensions: [http()] });
const whole = (state: EditorState) => ({ from: 0, to: state.doc.length });
const text = (state: EditorState, from: number | undefined, to: number | undefined) =>
  state.sliceDoc(from, to);

describe('getJsonPointers', () => {
  it('builds pointers for nested objects and arrays', () => {
    const state = jsonState('{"a": {"b": [1, {"c": true}]}, "d": null}');
    const pointers = getJsonPointers(state, whole(state));

    expect([...pointers.keys()]).toEqual(['', '/a', '/a/b', '/a/b/0', '/a/b/1', '/a/b/1/c', '/d']);
    const c = pointers.get('/a/b/1/c');
    expect(text(state, c?.keyFrom, c?.keyTo)).toBe('"c"');
    expect(text(state, c?.valueFrom, c?.valueTo)).toBe('true');
    const item = pointers.get('/a/b/0');
    expect(item?.keyFrom).toBeUndefined();
    expect(text(state, item?.valueFrom, item?.valueTo)).toBe('1');
    const root = pointers.get('');
    expect(root).toEqual({ pointer: '', valueFrom: 0, valueTo: state.doc.length });
  });

  it('escapes "~" and "/" in keys (RFC 6901)', () => {
    const state = jsonState('{"a/b": 1, "m~n": 2, "\\u0041": 3}');
    expect([...getJsonPointers(state, whole(state)).keys()]).toEqual(['', '/a~1b', '/m~0n', '/A']);
  });

  it('skips members that have no value yet', () => {
    const state = jsonState('{"a": 1, "b": }');
    expect([...getJsonPointers(state, whole(state)).keys()]).toEqual(['', '/a']);
  });

  it('returns an empty map for a region without JSON', () => {
    const state = jsonState('');
    expect(getJsonPointers(state, whole(state)).size).toBe(0);
  });

  it('uses absolute offsets inside an HTTP JSON body', () => {
    const head = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n';
    const state = httpState(`${head}{"name": 1, "tags": ["x"]}`);
    const region = findJsonBodyRange(state);
    expect(region).toEqual({ from: head.length, to: state.doc.length });
    if (!region) return;

    const pointers = getJsonPointers(state, region);
    expect([...pointers.keys()]).toEqual(['', '/name', '/tags', '/tags/0']);
    const name = pointers.get('/name');
    expect(name?.keyFrom).toBe(head.length + 1);
    expect(text(state, name?.keyFrom, name?.keyTo)).toBe('"name"');
    expect(text(state, name?.valueFrom, name?.valueTo)).toBe('1');
    const tag = pointers.get('/tags/0');
    expect(text(state, tag?.valueFrom, tag?.valueTo)).toBe('"x"');
  });
});

describe('pointerAt', () => {
  const doc = '{"a": {"b": [10, 20]}, "c": "x"}';
  const state = jsonState(doc);

  it('returns the innermost value under the position', () => {
    expect(pointerAt(state, doc.indexOf('20') + 1, whole(state))).toBe('/a/b/1');
    expect(pointerAt(state, doc.indexOf('"x"') + 1, whole(state))).toBe('/c');
  });

  it('maps a key to its member', () => {
    expect(pointerAt(state, doc.indexOf('"b"') + 1, whole(state))).toBe('/a/b');
  });

  it('returns the enclosing container between members', () => {
    expect(pointerAt(state, doc.indexOf(', "c"') + 1, whole(state))).toBe('');
  });

  it('is undefined outside the JSON value', () => {
    const padded = jsonState('  {"a": 1}');
    expect(pointerAt(padded, 0, whole(padded))).toBeUndefined();
  });
});
