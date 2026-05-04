import type { CopyFormatData } from './types';

/**
 * Wraps a value in quotes for a FilterInput-compatible expression.
 *
 * The grammar (see `FilterInput/lib/parseExpression/tokenizer.ts`) accepts
 * either `"…"` or `'…'` as string delimiters and does **not** support
 * escape sequences inside the string. To round-trip safely we pick the
 * quote that is not present in the value. If the value contains both
 * kinds of quotes — which never happens for HTTP method/parameter/encoding
 * names in practice — fall back to double-quotes with the embedded `"`
 * dropped, since silently truncating beats producing an unterminated
 * string the parser would reject.
 */
const quoteValue = (raw: string): string => {
  if (!raw.includes('"')) return `"${raw}"`;
  if (!raw.includes("'")) return `'${raw}'`;
  return `"${raw.replace(/"/g, '')}"`;
};

/**
 * Default Cmd+C serializer. Produces a FilterInput-compatible expression:
 * `method = "POST" AND parameter = "a.b" AND encoding = "BASE64"`.
 *
 * Override via `copyFormat` prop if the consuming platform uses different field names.
 */
export const formatAsFilter = ({ method, segments, encoding }: CopyFormatData): string => {
  const parts: string[] = [];
  if (method) parts.push(`method = ${quoteValue(method)}`);
  if (segments.length > 0) parts.push(`parameter = ${quoteValue(segments.join('.'))}`);
  if (encoding) parts.push(`encoding = ${quoteValue(encoding)}`);
  return parts.join(' AND ');
};
