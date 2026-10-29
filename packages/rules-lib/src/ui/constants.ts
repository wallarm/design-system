/**
 * UI Constants for Point Selector
 *
 * Display labels, common values, and UI-specific vocabularies.
 * NOT grammar rules - those come from SDK.
 */

/**
 * Human-readable labels for content format/encoding pickers
 * [short label, long description]
 */
export const PICK_LABELS: Record<string, [string, string]> = {
  json: ['JSON', 'JavaScript Object Notation'],
  xml: ['XML', 'Extensible Markup Language'],
  form: ['Form', 'URL-encoded form data (application/x-www-form-urlencoded)'],
  multipart: ['Multipart', 'Multipart form data (multipart/form-data)'],
  cookie: ['Cookie', 'Cookie header value'],
  auth: ['Auth', 'Authorization header value (Bearer, Basic, etc.)'],
  jwt: ['JWT', 'JSON Web Token'],
  protobuf: ['Protobuf', 'Protocol Buffers'],
  zip: ['ZIP', 'ZIP archive'],
  base64: ['Base64', 'Base64 encoding'],
  percent: ['URL', 'Percent-encoding (URL encoding)'],
  gzip: ['Gzip', 'Gzip compression'],
  deflate: ['Deflate', 'Deflate compression'],
  brotli: ['Brotli', 'Brotli compression'],
  any: ['Any format', 'Try every supported format in order'],
};

/**
 * Common HTTP header names for autocomplete suggestions
 */
export const COMMON_HEADERS = [
  'authorization',
  'content-type',
  'cookie',
  'user-agent',
  'accept',
  'accept-encoding',
  'accept-language',
  'cache-control',
  'connection',
  'host',
  'origin',
  'referer',
  'x-forwarded-for',
  'x-real-ip',
  'x-requested-with',
];

/**
 * Common cookie names for autocomplete suggestions
 */
export const COMMON_COOKIES = [
  'session',
  'sessionid',
  'token',
  'access_token',
  'refresh_token',
  'csrf',
  'xsrf',
  '_ga',
  '_gid',
];

/**
 * Common JWT claim names for autocomplete suggestions
 */
export const JWT_CLAIMS = [
  'sub',
  'iss',
  'aud',
  'exp',
  'nbf',
  'iat',
  'jti',
  'name',
  'email',
  'role',
  'scope',
  'permissions',
];

/**
 * Multipart form part header names
 */
export const PART_HEADERS = ['content-type', 'content-disposition', 'content-transfer-encoding'];

/**
 * Native point names (for reference, actual list comes from SDK vocabulary)
 */
export const NATIVES = {
  http_request: [
    'method',
    'proto',
    'scheme',
    'host',
    'port',
    'path',
    'query',
    'url',
    'header',
    'body',
  ],
  http_response: ['status', 'header', 'body'],
  grpc_request: ['service', 'method', 'body'],
  grpc_response: ['status', 'body'],
};

/**
 * Human-readable descriptions for name step types
 */
export const NAME_DESCRIPTIONS: Record<string, string> = {
  header: 'HTTP header name',
  cookie: 'Cookie name',
  claim: 'JWT claim name',
  key: 'JSON/XML key',
  parameter: 'Query parameter or form field',
  attribute: 'XML attribute',
  file: 'Multipart file field',
  part: 'Multipart part name',
};

/**
 * Re-export parser vocabulary from point/staticKeys for convenience
 * This allows UI code to access parser keys without importing from point/
 *
 * Note: The SDK's completion API is the primary source of all completions.
 * These vocabularies are fallbacks for when SDK is unavailable or for documentation.
 */
export { PARSER_VOCABULARY } from '../point/staticKeys';
