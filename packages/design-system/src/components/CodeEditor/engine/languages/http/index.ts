import {
  ensureSyntaxTree,
  LanguageSupport,
  LRLanguage,
  language,
  syntaxTree,
} from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import { type Input, parseMixed, type SyntaxNode } from '@lezer/common';
import type { CodeEditorHttpContext } from '../../../types';
import { jsonEditorLanguage } from '../json';
import { parser } from './parser';
import { Body, Header, HeaderName, HeaderValue } from './parser.terms';

/** Same blank-line rule as CodeSnippet's getHttpFolds: empty or spaces/tabs only. */
const BLANK_LINE = /^[ \t]*$/;
/** Exact `type/json` or `type/<suffix>+json` (spec §7.4) — not x-ndjson, jsonl, json-seq, jsonp. */
const JSON_MEDIA_TYPE = /^[\w.+-]+\/(?:[\w.!#$&^-]+\+)?json$/i;
const JSON_START = /^\s*[[{]/;
const RESPONSE_START_LINE = /^HTTP\//;
/** Upper bound for the parse work findJsonBodyRange may force, in ms. */
const ENSURE_TREE_TIMEOUT = 200;

const readNode = (node: SyntaxNode | null, input: Input): string =>
  node ? input.read(node.from, node.to) : '';

/**
 * Decides whether a Body node holds JSON:
 * - the first `Content-Type` header wins; its media type (before `;`, trimmed) must have the
 *   subtype `json` or a `+json` suffix (`application/json`, `application/problem+json`,
 *   `...; charset=utf-8`); `application/x-ndjson`, `jsonl`, `json-seq` are not JSON documents;
 * - with no `Content-Type` header, the body is sniffed: first non-whitespace char `{` or `[`.
 */
const isJsonBody = (body: SyntaxNode, input: Input): boolean => {
  const message = body.parent;
  if (message) {
    for (const header of message.getChildren(Header)) {
      const name = readNode(header.getChild(HeaderName), input).trim().toLowerCase();
      if (name !== 'content-type') continue;
      const mediaType = readNode(header.getChild(HeaderValue), input).split(';')[0] ?? '';
      return JSON_MEDIA_TYPE.test(mediaType.trim());
    }
  }
  return JSON_START.test(input.read(body.from, body.to));
};

const mountJsonBody = parseMixed((node, input) => {
  if (node.type.id !== Body) return null;
  return isJsonBody(node.node, input) ? { parser: jsonEditorLanguage.parser } : null;
});

/** HTTP/1.x message language: start line, headers, body; JSON bodies get a nested JSON tree. */
export const httpLanguage: LRLanguage = LRLanguage.define({
  name: 'http',
  parser: parser.configure({ wrap: mountJsonBody }),
});

export const http = (): LanguageSupport => new LanguageSupport(httpLanguage);

const isHttpState = (state: EditorState): boolean => state.facet(language) === httpLanguage;

/**
 * Range of the HTTP body that is parsed as JSON (the mounted `JsonText` node), or `null`
 * when the state is not HTTP or the body is absent / not JSON.
 */
export const findJsonBodyRange = (state: EditorState): { from: number; to: number } | null => {
  if (!isHttpState(state)) return null;
  const tree = ensureSyntaxTree(state, state.doc.length, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  for (let child = tree.topNode.firstChild; child; child = child.nextSibling) {
    if (child.name === 'JsonText') return { from: child.from, to: child.to };
  }
  return null;
};

/**
 * Where `pos` sits in an HTTP message. Line-based, with the same rules as the grammar and
 * getHttpFolds, so it is exact even while the tree is still being parsed.
 * Returns `undefined` when the state's language is not HTTP.
 */
export const httpContextAt = (
  state: EditorState,
  pos: number,
): CodeEditorHttpContext | undefined => {
  if (!isHttpState(state)) return undefined;
  const { doc } = state;
  const messageKind = RESPONSE_START_LINE.test(doc.line(1).text) ? 'response' : 'request';
  const line = doc.lineAt(pos);
  if (line.number === 1) return { section: 'start-line', messageKind };
  for (let n = 2; n < line.number; n++) {
    if (BLANK_LINE.test(doc.line(n).text)) return { section: 'body', messageKind };
  }
  const colon = line.text.indexOf(':');
  if (colon < 0 || pos - line.from <= colon) return { section: 'header-name', messageKind };
  return {
    section: 'header-value',
    headerName: line.text.slice(0, colon).trim(),
    messageKind,
  };
};
