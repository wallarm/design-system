import { jsonLanguage } from '@codemirror/lang-json';
import { ensureSyntaxTree, foldable, syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { getHttpFolds } from '../../../../CodeSnippet/lib/httpFolds';
import { json } from '../json';
import { findJsonBodyRange, http } from './index';

const createState = (doc: string): EditorState => {
  const state = EditorState.create({ doc, extensions: [http()] });
  ensureSyntaxTree(state, state.doc.length, 5000);
  return state;
};

const shape = (state: EditorState): string =>
  (ensureSyntaxTree(state, state.doc.length, 5000) ?? syntaxTree(state)).toString();

const JSON_REQUEST = [
  'POST /api/users HTTP/1.1',
  'Host: api.example.com',
  'Content-Type: application/json; charset=utf-8',
  '',
  '{',
  '  "name": "Ann",',
  '',
  '  "tags": [true, null]',
  '}',
].join('\n');

describe('http language', () => {
  it('builds the message tree through the CodeMirror language', () => {
    const state = createState('HTTP/1.1 200 OK\nContent-Type: text/plain\n\nhello');
    expect(shape(state)).toBe(
      'Message(StartLine(StatusLine(Version,StatusCode,ReasonPhrase)),' +
        'Header(HeaderName,HeaderValue),Body)',
    );
  });

  it('mounts JSON on the body for a json Content-Type with parameters', () => {
    const tree = shape(createState(JSON_REQUEST));
    expect(tree).toContain('JsonText(Object(');
    expect(tree).not.toContain('Body');
  });

  it('keeps blank lines inside a JSON body inside the JSON tree', () => {
    const state = createState(JSON_REQUEST);
    const range = findJsonBodyRange(state);
    expect(range).toEqual({ from: JSON_REQUEST.indexOf('{'), to: JSON_REQUEST.length });
    expect(shape(state)).toContain('Property(PropertyName,":",Array(');
    expect(shape(state)).not.toContain('⚠');
  });

  it('mounts JSON for +json media types', () => {
    const doc =
      'HTTP/1.1 400 Bad Request\nContent-Type: application/problem+json\n\n{"title": "x"}';
    expect(findJsonBodyRange(createState(doc))).toEqual({
      from: doc.indexOf('{'),
      to: doc.length,
    });
  });

  it('sniffs a JSON body when there is no Content-Type header', () => {
    const doc = 'POST /x HTTP/1.1\nHost: a\n\n\n  [1, 2]';
    expect(findJsonBodyRange(createState(doc))).toEqual({
      from: doc.indexOf('\n  ['),
      to: doc.length,
    });
  });

  it('does not mount JSON for text/plain even if the body looks like JSON', () => {
    const state = createState('POST /x HTTP/1.1\nContent-Type: text/plain\n\n{"a": 1}');
    expect(shape(state)).toContain('Body');
    expect(shape(state)).not.toContain('JsonText');
    expect(findJsonBodyRange(state)).toBeNull();
  });

  it('does not mount JSON for a non-JSON body without Content-Type', () => {
    expect(findJsonBodyRange(createState('POST /x HTTP/1.1\n\nname=Ann'))).toBeNull();
  });

  it('returns null without a body and for non-HTTP states', () => {
    expect(findJsonBodyRange(createState('GET / HTTP/1.1\nAccept: application/json'))).toBeNull();
    const jsonState = EditorState.create({ doc: '{"a": 1}', extensions: [json()] });
    expect(findJsonBodyRange(jsonState)).toBeNull();
  });

  it('re-evaluates the mount when the Content-Type header changes', () => {
    const doc = 'POST /x HTTP/1.1\nContent-Type: text/plain\n\n{"a": 1}';
    const plain = createState(doc);
    expect(findJsonBodyRange(plain)).toBeNull();
    const from = doc.indexOf('text/plain');
    const toJson = plain.update({
      changes: { from, to: from + 'text/plain'.length, insert: 'application/json' },
    }).state;
    expect(findJsonBodyRange(toJson)).not.toBeNull();
    const backFrom = toJson.doc.toString().indexOf('application/json');
    const back = toJson.update({
      changes: { from: backFrom, to: backFrom + 'application/json'.length, insert: 'text/html' },
    }).state;
    expect(findJsonBodyRange(back)).toBeNull();
  });

  it('follows edits inside the JSON body', () => {
    const state = createState(JSON_REQUEST);
    const next = state.update({ changes: { from: state.doc.length, insert: '\n' } }).state;
    expect(findJsonBodyRange(next)).toEqual({
      from: JSON_REQUEST.indexOf('{'),
      to: JSON_REQUEST.length + 1,
    });
  });

  it('exposes JSON language data inside the body only', () => {
    const state = createState(JSON_REQUEST);
    expect(jsonLanguage.isActiveAt(state, JSON_REQUEST.indexOf('"name"'))).toBe(true);
    expect(jsonLanguage.isActiveAt(state, JSON_REQUEST.indexOf('Host'))).toBe(false);
  });

  it('offers no syntax folds for the JSON body', () => {
    const state = createState(JSON_REQUEST);
    const line = state.doc.line(5); // "{"
    expect(foldable(state, line.from, line.to)).toBeNull();
  });

  it('handles a pasted CRLF message: normalised lines, JSON body mounted, folds intact', () => {
    const state = EditorState.create({
      doc: 'POST /x HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"a":1}',
      extensions: [http()],
    });
    const text = state.doc.toString();
    expect(state.doc.lines).toBe(4);
    expect(text).not.toContain('\r');
    expect(findJsonBodyRange(state)).toEqual({
      from: text.indexOf('{"a":1}'),
      to: text.indexOf('{"a":1}') + '{"a":1}'.length,
    });
    const folds = getHttpFolds(text);
    expect(folds.map(fold => fold.id)).toEqual(
      expect.arrayContaining(['http-headers', 'http-body']),
    );
  });
});
