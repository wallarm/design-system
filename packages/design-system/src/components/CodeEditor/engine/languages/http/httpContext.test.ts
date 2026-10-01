import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { json } from '../json';
import { http, httpContextAt } from './index';

const REQUEST = [
  'POST /api HTTP/1.1',
  'Host: example.com',
  'Content-Type: application/json',
  '',
  '{',
  '',
  '  "a": 1',
  '}',
].join('\n');

const RESPONSE = 'HTTP/1.1 200 OK\nContent-Type: text/plain\n\nok';

const createState = (doc: string): EditorState => EditorState.create({ doc, extensions: [http()] });

/** Offset of `needle` in `doc` plus `delta`. */
const at = (doc: string, needle: string, delta = 0): number => doc.indexOf(needle) + delta;

describe('httpContextAt', () => {
  const state = createState(REQUEST);

  it('reports the start line anywhere on line 1', () => {
    expect(httpContextAt(state, 0)).toEqual({ section: 'start-line', messageKind: 'request' });
    expect(httpContextAt(state, at(REQUEST, 'HTTP/1.1'))).toEqual({
      section: 'start-line',
      messageKind: 'request',
    });
  });

  it('reports header-name up to and including the colon position', () => {
    expect(httpContextAt(state, at(REQUEST, 'Host'))).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, 'Host:', 4))).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
  });

  it('reports header-value with the trimmed header name after the colon', () => {
    expect(httpContextAt(state, at(REQUEST, 'Host:', 5))).toEqual({
      section: 'header-value',
      headerName: 'Host',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, 'application/json', 3))).toEqual({
      section: 'header-value',
      headerName: 'Content-Type',
      messageKind: 'request',
    });
  });

  it('treats a header line without a colon, and the blank separator, as header-name', () => {
    const doc = 'GET / HTTP/1.1\nAcc';
    expect(httpContextAt(createState(doc), doc.length)).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, '\n\n{', 1))).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
  });

  it('reports body after the separator, including blank lines inside the body', () => {
    expect(httpContextAt(state, at(REQUEST, '{'))).toEqual({
      section: 'body',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, '{\n', 2))).toEqual({
      section: 'body',
      messageKind: 'request',
    });
    expect(httpContextAt(state, REQUEST.length)).toEqual({
      section: 'body',
      messageKind: 'request',
    });
  });

  it('uses a spaces/tabs-only line as the separator', () => {
    const doc = 'GET /\nA: b\n \t\nx: y';
    expect(httpContextAt(createState(doc), doc.length)).toEqual({
      section: 'body',
      messageKind: 'request',
    });
  });

  it('reports messageKind response for a status line', () => {
    const response = createState(RESPONSE);
    expect(httpContextAt(response, 0)).toEqual({ section: 'start-line', messageKind: 'response' });
    expect(httpContextAt(response, at(RESPONSE, 'text/plain'))).toEqual({
      section: 'header-value',
      headerName: 'Content-Type',
      messageKind: 'response',
    });
    expect(httpContextAt(response, RESPONSE.length)).toEqual({
      section: 'body',
      messageKind: 'response',
    });
  });

  it('returns undefined for a non-HTTP state', () => {
    const jsonState = EditorState.create({ doc: '{"a": 1}', extensions: [json()] });
    expect(httpContextAt(jsonState, 1)).toBeUndefined();
    expect(httpContextAt(EditorState.create({ doc: 'GET /' }), 0)).toBeUndefined();
  });
});
