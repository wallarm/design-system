import { CompletionContext } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from '@rstest/core';
import type { CodeEditorLanguage } from '../types';
import { buildCompletionContext } from './completion';
import { languageExtension } from './languages';

/** `|` marks the cursor. */
const contextFor = (
  docWithCursor: string,
  language: CodeEditorLanguage,
  { explicit = false, startingLineNumber = 1 } = {},
) => {
  const pos = docWithCursor.indexOf('|');
  const state = EditorState.create({
    doc: docWithCursor.replace('|', ''),
    extensions: languageExtension(language),
  });
  return buildCompletionContext(
    new CompletionContext(state, pos, explicit),
    language,
    startingLineNumber,
  );
};

describe('buildCompletionContext', () => {
  it('reports value, absolute position, line text, word and explicit', () => {
    const ctx = contextFor('first\nsecond wo|rd', 'text', {
      explicit: true,
      startingLineNumber: 10,
    });
    expect(ctx).toEqual({
      value: 'first\nsecond word',
      position: { line: 11, column: 10 },
      lineText: 'second word',
      word: { text: 'wo', from: { line: 11, column: 8 } },
      explicit: true,
    });
  });

  it('includes dashes, slashes, dots and colons in the word', () => {
    expect(contextFor('Content-Type: application/js|', 'text').word).toEqual({
      text: 'application/js',
      from: { line: 1, column: 15 },
    });
    expect(contextFor('GET /api HTTP/1.|', 'text').word.text).toBe('HTTP/1.');
  });

  it('returns an empty word at the cursor after whitespace', () => {
    expect(contextFor('a |', 'text').word).toEqual({ text: '', from: { line: 1, column: 3 } });
  });

  it('adds the http context only for http', () => {
    const doc = 'POST /api HTTP/1.1\nContent-Type: app|';
    expect(contextFor(doc, 'http').http).toEqual({
      section: 'header-value',
      headerName: 'Content-Type',
      messageKind: 'request',
    });
    expect(contextFor(doc, 'text')).not.toHaveProperty('http');
    expect(contextFor('HTTP/1.1 200 OK\nSe|', 'http').http).toEqual({
      section: 'header-name',
      messageKind: 'response',
    });
  });

  it('adds the JSON pointer in a JSON document', () => {
    expect(contextFor('{"a": {"b": 1|}}', 'json').jsonPointer).toBe('/a/b');
    expect(contextFor('{"a": 1|}', 'yaml')).not.toHaveProperty('jsonPointer');
  });

  it('adds the JSON pointer in an HTTP JSON body only', () => {
    const doc = 'POST /api HTTP/1.1\nContent-Type: application/json\n\n{"user": {"name": "x|"}}';
    const ctx = contextFor(doc, 'http');
    expect(ctx.http?.section).toBe('body');
    expect(ctx.jsonPointer).toBe('/user/name');
    expect(contextFor('POST /api HTTP/1.1\nHo|', 'http')).not.toHaveProperty('jsonPointer');
  });
});
