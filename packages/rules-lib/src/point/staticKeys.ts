/**
 * Static keys dictionary for autocomplete
 *
 * Provides common HTTP headers, query params, and gRPC metadata
 * for Point Selector autocomplete when no backend API is available.
 */

export const STATIC_KEYS: Record<string, string[]> = {
  '[http:header]': [
    'accept',
    'accept-encoding',
    'accept-language',
    'authorization',
    'cache-control',
    'connection',
    'content-length',
    'content-type',
    'cookie',
    'host',
    'origin',
    'referer',
    'user-agent',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-real-ip',
    'x-requested-with',
  ],
  '[http:query]': ['id', 'page', 'limit', 'offset', 'sort', 'order', 'filter', 'search', 'q'],
  '[grpc:metadata]': [
    'authorization',
    'content-type',
    'grpc-accept-encoding',
    'grpc-encoding',
    'grpc-message',
    'grpc-status',
    'grpc-timeout',
    'user-agent',
  ],
};

/**
 * Parser-specific vocabulary
 *
 * These keys are PLANTED BY PARSERS, not from wire data.
 * They appear in completions even if the keys provider doesn't list them,
 * because they are proton's own structural words, identical in every request.
 *
 * References:
 * - /packages/docs/parsers/*.md (source of truth for each parser)
 * - /packages/docs/point-format.md:90-96 (explains parser vocabulary concept)
 *
 * Note: These keys carry NO [role:name] - they are parser vocabulary, not wire data.
 * See point-format.md "Keys, names, and the root" section.
 */
export const PARSER_VOCABULARY: Record<string, string[]> = {
  // JWT decomposition ([format:jwt])
  // Source: parsers/jwt-parser.md
  jwt: [
    'prefix', // Stripped scheme prefix (bearer, lsapi2, mobapp2)
    'header', // Raw base64url 1st segment (use [encoding:base64][format:json] for decoded claims)
    'payload', // Raw base64url 2nd segment (use [encoding:base64][format:json] for decoded claims)
    'signature', // Raw 3rd segment (not decoded by JWT parser)
  ],

  // Authorization decomposition ([format:auth])
  // Source: parsers/auth-parser.md
  auth: [
    // Scheme keys (lower-cased)
    'bearer', // Bearer token (composes with [format:jwt] for JWT tokens)
    'basic', // Basic credentials (use ['user']/['pass'] for decoded parts)
    'digest', // Digest credentials (contains param keys like 'username', 'realm', 'uri', 'response')

    // Basic auth parts
    'user', // Username from decoded Basic credentials
    'pass', // Password from decoded Basic credentials (only when ':' present)

    // Digest params (example common ones - actual params come from wire)
    // Note: Digest parameter names ARE scanned (they arrived on wire)
    // These are common examples, not exhaustive
  ],

  // Multipart parsing ([format:multipart])
  // Source: parsers/multipart-parser.md
  // Note: Most multipart keys come from Content-Disposition 'name' parameter (wire data)
  // Multipart attributes are accessed via [attr:'...'] syntax
  // SDK provides these through tree completion
  multipart: [],

  // XML parsing ([format:xml])
  // Source: parsers/xml-parser.md
  // XML special nodes are accessed via [attr:'#...'] syntax, not direct keys
  // SDK provides these through tree completion, not static vocabulary
  xml: [],

  // Cookie parsing ([format:cookie])
  // Source: parsers/cookie-parser.md
  // Cookie names come from wire data - no parser-planted keys

  // JSON parsing ([format:json])
  // Source: parsers/json-parser.md
  // JSON keys come from document - no parser-planted keys

  // Form parsing ([format:form])
  // Source: parsers/form-percent-parsers.md
  // Form field names come from wire data - no parser-planted keys

  // Protobuf parsing ([format:protobuf])
  // Source: parsers/protobuf-parser.md
  // Field numbers are array positions [N], readings are parser words:
  protobuf: ['varint', 'i32', 'i64'],

  // ZIP parsing ([format:zip])
  // Source: parsers/zip-decoder.md
  // ZIP member filenames come from archive - no parser-planted structural keys
};

/**
 * Static keys provider function
 *
 * Returns hardcoded list of common keys for a given parent point.
 * Includes both wire data keys (headers, params) and parser vocabulary.
 * Use this when no backend API is available for dynamic keys.
 *
 * @example
 * ```typescript
 * <PointSelector
 *   context="http_request"
 *   keys={staticKeysProvider}
 * />
 * ```
 */
export function staticKeysProvider(parent: string): string[] {
  // Check static keys first (headers, query params, etc.)
  const staticKeys = STATIC_KEYS[parent];
  if (staticKeys) {
    return staticKeys;
  }

  // Check for parser vocabulary based on the last format/encoding marker
  // Examples:
  // - "[http:body][format:jwt]" -> jwt vocabulary
  // - "[http:header]['authorization'][format:auth]" -> auth vocabulary
  // - "[http:body][format:protobuf][3][format:protobuf]" -> protobuf vocabulary
  // - "[http:body][format:protobuf][3][format:protobuf][1]" -> protobuf vocabulary

  // Extract the last format/encoding marker
  // Match pattern: [format:xxx] or [encoding:xxx], then optionally followed by any segments
  const formatMatch = parent.match(/\[(?:format|encoding):([^\]]+)\]/g);
  if (formatMatch && formatMatch.length > 0) {
    // Get the last format/encoding marker
    const lastMarker = formatMatch[formatMatch.length - 1];
    if (lastMarker) {
      const format = lastMarker.match(/\[(?:format|encoding):([^\]]+)\]/)?.[1];
      if (format) {
        const parserKeys = PARSER_VOCABULARY[format];
        if (parserKeys) {
          return parserKeys;
        }
      }
    }
  }

  return [];
}
