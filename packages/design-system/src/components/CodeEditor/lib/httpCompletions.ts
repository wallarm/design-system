import type {
  CodeEditorCompletion,
  CodeEditorCompletionContext,
  CodeEditorCompletionSource,
  CodeEditorHttpContext,
} from '../types';
import {
  HTTP_COMPLETION_METHODS,
  HTTP_HEADER_VALUES,
  HTTP_HEADERS,
  HTTP_MEDIA_TYPE_PARAMETERS,
  HTTP_VERSIONS,
  type HttpHeaderDirection,
  type HttpHeaderValueInfo,
} from './httpCompletionsData';

/** Same blank-line rule as the HTTP grammar and getHttpFolds: empty or spaces/tabs only. */
const BLANK_LINE = /^[ \t]*$/;
const WHITESPACE = /[ \t]+/;
/** Headers whose values are media types and accept `; charset=utf-8`. */
const MEDIA_TYPE_HEADERS: ReadonlySet<string> = new Set(['content-type', 'accept']);

const DIRECTION_DETAIL: Record<HttpHeaderDirection, string> = {
  request: 'request header',
  response: 'response header',
  both: 'header',
};

/** Text of the current line before the cursor. */
const textBeforeCursor = (ctx: CodeEditorCompletionContext): string =>
  ctx.lineText.slice(0, Math.max(0, ctx.position.column - 1));

/** Lowercased header name of a header line (text before `:`, or the whole line). */
const headerNameOf = (line: string): string => {
  const colon = line.indexOf(':');
  return (colon < 0 ? line : line.slice(0, colon)).trim().toLowerCase();
};

/** Lowercased header name → number of header lines using it (line 2 up to the first blank line). */
const countHeaderNames = (value: string): Map<string, number> => {
  const counts = new Map<string, number>();
  const lines = value.split('\n');
  for (let index = 1; index < lines.length; index++) {
    const line = lines[index] ?? '';
    if (BLANK_LINE.test(line)) break;
    const name = headerNameOf(line);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
};

const methodCompletions = (): CodeEditorCompletion[] =>
  HTTP_COMPLETION_METHODS.map(method => ({ label: method, apply: `${method} `, kind: 'method' }));

const versionCompletions = (suffix: string): CodeEditorCompletion[] =>
  HTTP_VERSIONS.map(version => ({ label: version, apply: `${version}${suffix}`, kind: 'keyword' }));

const valueCompletions = (values: readonly HttpHeaderValueInfo[]): CodeEditorCompletion[] =>
  values.map(({ label, apply, info }) => ({
    label,
    ...(apply === undefined ? {} : { apply }),
    ...(info === undefined ? {} : { info }),
    kind: 'value',
  }));

/**
 * Line 1. First token: methods (and versions, to start a response status line), once
 * something is typed or on Ctrl-Space. Third token of a request line (after method and
 * target): versions. The target and anything after the version: none.
 */
const startLineCompletions = (
  ctx: CodeEditorCompletionContext,
  http: CodeEditorHttpContext,
): CodeEditorCompletion[] | null => {
  const before = textBeforeCursor(ctx);
  if (WHITESPACE.test(before.charAt(0))) return null;
  const tokenIndex = before.split(WHITESPACE).length - 1;
  if (tokenIndex === 0) {
    if (!ctx.explicit && ctx.word.text === '') return null;
    return [...methodCompletions(), ...versionCompletions(' ')];
  }
  // Shown unprompted right after the space that follows the target.
  if (tokenIndex === 2 && http.messageKind === 'request') return versionCompletions('');
  return null;
};

/** Header lines: names for this message kind; present non-repeatable headers are skipped. */
const headerNameCompletions = (
  ctx: CodeEditorCompletionContext,
  http: CodeEditorHttpContext,
): CodeEditorCompletion[] | null => {
  if (textBeforeCursor(ctx) !== ctx.word.text) return null;
  if (!ctx.explicit && ctx.word.text === '') return null;
  const present = countHeaderNames(ctx.value);
  // The line being typed is not "already present".
  const current = headerNameOf(ctx.lineText);
  const currentCount = present.get(current);
  if (currentCount !== undefined) present.set(current, currentCount - 1);

  return HTTP_HEADERS.filter(
    header =>
      (header.direction === 'both' || header.direction === http.messageKind) &&
      (header.repeatable === true || (present.get(header.name.toLowerCase()) ?? 0) === 0),
  ).map(header => ({
    label: header.name,
    apply: `${header.name}: `,
    detail: DIRECTION_DETAIL[header.direction],
    info: header.description,
    kind: 'header',
  }));
};

/** Header values keyed on the lowercased header name. Shown unprompted at the start of a value. */
const headerValueCompletions = (
  ctx: CodeEditorCompletionContext,
  http: CodeEditorHttpContext,
): CodeEditorCompletion[] | null => {
  // `Name:value` without a space: the completion word swallowed the colon.
  if (ctx.word.text.includes(':')) return null;
  const name = http.headerName?.trim().toLowerCase() ?? '';
  const values = HTTP_HEADER_VALUES[name];
  if (!values) return null;
  const before = textBeforeCursor(ctx);
  const valueSoFar = before.slice(before.indexOf(':') + 1);
  const typedBeforeWord = valueSoFar.slice(0, valueSoFar.length - ctx.word.text.length);

  if (MEDIA_TYPE_HEADERS.has(name) && typedBeforeWord.includes(';')) {
    return valueCompletions(HTTP_MEDIA_TYPE_PARAMETERS);
  }
  if (typedBeforeWord.trim() !== '') {
    // Past the first token (`gzip, |`): only on Ctrl-Space.
    return ctx.explicit ? valueCompletions(values) : null;
  }
  return valueCompletions(values);
};

/**
 * Built-in HTTP completion source (spec §7.14): methods and versions on the start line,
 * header names on header lines, common values for well-known headers. Pure — reads only
 * the `CodeEditorCompletionContext`, so consumers can wrap or filter it.
 */
export const httpCompletions: CodeEditorCompletionSource = ctx => {
  const { http } = ctx;
  if (!http) return null;
  if (http.section === 'start-line') return startLineCompletions(ctx, http);
  if (http.section === 'header-name') return headerNameCompletions(ctx, http);
  if (http.section === 'header-value') return headerValueCompletions(ctx, http);
  return null;
};
