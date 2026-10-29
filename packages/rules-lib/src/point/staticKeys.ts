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
 * Static keys provider function
 *
 * Returns hardcoded list of common keys for a given parent point.
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
  return STATIC_KEYS[parent] || [];
}
