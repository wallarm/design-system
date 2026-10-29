/**
 * Segment builder helpers for tests and stories
 *
 * These are lightweight helpers to construct Segment objects for use in
 * tests, stories, and examples. They provide a simplified API for creating
 * segments without depending on the full Proton SDK grammar.
 */

import type { Segment } from './proton';

/**
 * Create a native segment (e.g., [http:header], [http:body], [http:method])
 *
 * @param value - The native point name (e.g., 'header', 'body', 'method')
 * @param label - Human-readable label (e.g., 'Header', 'Body', 'Method')
 * @returns A native segment
 *
 * @example
 * nativeSeg('header', 'Header')
 * // => { kind: 'native', value: 'header', label: 'Header' }
 */
export const nativeSeg = (value: string, label: string): Segment => ({
  kind: 'native' as const,
  value,
  label,
  text: `[http:${value}]`,
});

/**
 * Create a key segment (e.g., ['authorization'], ['cookie'])
 *
 * @param value - The key name
 * @param kind - Optional kind override (defaults to 'key')
 * @returns A key segment
 *
 * @example
 * headerSeg('authorization')
 * // => { kind: 'key', value: 'authorization', label: 'authorization', text: "['authorization']" }
 */
export const headerSeg = (value: string, kind = 'key' as const): Segment => ({
  kind,
  value,
  label: value,
  text: `['${value}']`,
});

/**
 * Create a key segment (alias for headerSeg, used for general keys)
 *
 * @param value - The key name
 * @param kind - Optional kind override (defaults to 'key')
 * @returns A key segment
 *
 * @example
 * keySeg('email')
 * // => { kind: 'key', value: 'email', label: 'email', text: "['email']" }
 */
export const keySeg = (value: string, kind = 'key' as const): Segment => ({
  kind,
  value,
  label: value,
  text: `['${value}']`,
});

/**
 * Create a generic segment with custom properties
 *
 * @param text - The text representation of the segment
 * @param kind - The segment kind
 * @param label - Human-readable label
 * @param props - Additional segment properties
 * @returns A custom segment
 *
 * @example
 * seg('[format:json]', 'format', 'JSON', { name: 'json' })
 * // => { text: '[format:json]', kind: 'format', label: 'JSON', name: 'json' }
 */
export const seg = (
  text: string,
  kind: string,
  label: string,
  props: Record<string, unknown> = {},
): Segment =>
  ({
    text,
    kind,
    label,
    ...props,
  }) as Segment;

/**
 * Common format (parser) segments
 *
 * These represent content parsers like JSON, XML, JWT, etc.
 */
export const FORMATS = {
  json: { kind: 'content' as const, name: 'json', label: 'JSON', text: '[format:json]' },
  xml: { kind: 'content' as const, name: 'xml', label: 'XML', text: '[format:xml]' },
  form: { kind: 'content' as const, name: 'form', label: 'Form', text: '[format:form]' },
  multipart: {
    kind: 'content' as const,
    name: 'multipart',
    label: 'Multipart',
    text: '[format:multipart]',
  },
  cookie: { kind: 'content' as const, name: 'cookie', label: 'Cookie', text: '[format:cookie]' },
  auth: { kind: 'content' as const, name: 'auth', label: 'Auth', text: '[format:auth]' },
  jwt: { kind: 'content' as const, name: 'jwt', label: 'JWT', text: '[format:jwt]' },
  protobuf: {
    kind: 'content' as const,
    name: 'protobuf',
    label: 'Protobuf',
    text: '[format:protobuf]',
  },
  mcp: { kind: 'content' as const, name: 'mcp', label: 'MCP', text: '[format:mcp]' },
} as const;

/**
 * Common encoding (decoder) segments
 *
 * These represent encoders/decoders like Base64, gzip, etc.
 */
export const ENCODINGS = {
  base64: { kind: 'content' as const, name: 'base64', label: 'Base64', text: '[encoding:base64]' },
  percent: {
    kind: 'content' as const,
    name: 'percent',
    label: 'Percent',
    text: '[encoding:percent]',
  },
  gzip: { kind: 'content' as const, name: 'gzip', label: 'Gzip', text: '[encoding:gzip]' },
  deflate: {
    kind: 'content' as const,
    name: 'deflate',
    label: 'Deflate',
    text: '[encoding:deflate]',
  },
  brotli: { kind: 'content' as const, name: 'brotli', label: 'Brotli', text: '[encoding:brotli]' },
} as const;
