import { HTTP_METHODS } from '../../HttpMethod/constants';

/**
 * Curated HTTP completion data for `httpCompletions` (spec §7.14).
 * Hand-maintained from RFC 9110/9111, MDN (`@mdn/browser-compat-data`, CC0) and
 * the IANA field-name registry — no runtime dependency on either source.
 */

/** Which message kinds a header is normally sent in. */
export type HttpHeaderDirection = 'request' | 'response' | 'both';

export interface HttpHeaderInfo {
  /** Canonical spelling, inserted as `Name: `. */
  name: string;
  direction: HttpHeaderDirection;
  /** May appear on several lines of one message (`Set-Cookie`), so it is offered even when present. */
  repeatable?: boolean;
  description: string;
}

export interface HttpHeaderValueInfo {
  label: string;
  /** Text to insert; defaults to `label`. */
  apply?: string;
  info?: string;
}

/** DS `HTTP_METHODS` plus the remaining RFC 9110 §9 methods. */
export const HTTP_COMPLETION_METHODS: readonly string[] = [...HTTP_METHODS, 'CONNECT', 'TRACE'];

export const HTTP_VERSIONS: readonly string[] = ['HTTP/1.1', 'HTTP/2'];

export const HTTP_HEADERS: readonly HttpHeaderInfo[] = [
  // ---- Request
  {
    name: 'Accept',
    direction: 'request',
    description: 'Media types the client can handle, in order of preference.',
  },
  {
    name: 'Accept-Encoding',
    direction: 'request',
    description: 'Content codings (compression) the client understands.',
  },
  {
    name: 'Accept-Language',
    direction: 'request',
    description: 'Natural languages the client prefers for the response.',
  },
  {
    name: 'Access-Control-Request-Headers',
    direction: 'request',
    description: 'CORS preflight: headers the actual request will send.',
  },
  {
    name: 'Access-Control-Request-Method',
    direction: 'request',
    description: 'CORS preflight: method the actual request will use.',
  },
  {
    name: 'Authorization',
    direction: 'request',
    description: 'Credentials that authenticate the client with the server.',
  },
  {
    name: 'Cookie',
    direction: 'request',
    description: 'Cookies previously sent by the server with Set-Cookie.',
  },
  {
    name: 'Expect',
    direction: 'request',
    description: 'Expectations the server must meet, such as 100-continue.',
  },
  {
    name: 'Forwarded',
    direction: 'request',
    repeatable: true,
    description: 'Client and proxy information lost when a proxy is involved (RFC 7239).',
  },
  {
    name: 'From',
    direction: 'request',
    description: 'Email address of the person controlling the user agent.',
  },
  {
    name: 'Host',
    direction: 'request',
    description: 'Host and port of the server the request is sent to.',
  },
  {
    name: 'If-Match',
    direction: 'request',
    description: 'Apply the method only if the resource matches one of the ETags.',
  },
  {
    name: 'If-Modified-Since',
    direction: 'request',
    description: 'Return the resource only if it changed after this date.',
  },
  {
    name: 'If-None-Match',
    direction: 'request',
    description: 'Return the resource only if it matches none of the ETags.',
  },
  {
    name: 'If-Range',
    direction: 'request',
    description: 'Send the requested range only if the ETag or date still matches.',
  },
  {
    name: 'If-Unmodified-Since',
    direction: 'request',
    description: 'Apply the method only if the resource has not changed since this date.',
  },
  {
    name: 'Max-Forwards',
    direction: 'request',
    description: 'Maximum number of proxies for TRACE and OPTIONS requests.',
  },
  {
    name: 'Origin',
    direction: 'request',
    description: 'Scheme, host and port the request originates from.',
  },
  {
    name: 'Priority',
    direction: 'request',
    description: 'Urgency and incremental delivery hints (RFC 9218).',
  },
  {
    name: 'Proxy-Authorization',
    direction: 'request',
    description: 'Credentials that authenticate the client with a proxy.',
  },
  {
    name: 'Range',
    direction: 'request',
    description: 'Parts of the resource to return, such as bytes=0-1023.',
  },
  {
    name: 'Referer',
    direction: 'request',
    description: 'Address of the page that linked to the requested resource.',
  },
  {
    name: 'Sec-Fetch-Dest',
    direction: 'request',
    description: 'Fetch metadata: how the response will be used (document, image, empty).',
  },
  {
    name: 'Sec-Fetch-Mode',
    direction: 'request',
    description: 'Fetch metadata: request mode (cors, navigate, no-cors, same-origin).',
  },
  {
    name: 'Sec-Fetch-Site',
    direction: 'request',
    description: 'Fetch metadata: relation between initiator and target origin.',
  },
  {
    name: 'Sec-Fetch-User',
    direction: 'request',
    description: 'Fetch metadata: the navigation was triggered by user activation.',
  },
  {
    name: 'TE',
    direction: 'request',
    description: 'Transfer codings the client accepts, such as trailers.',
  },
  {
    name: 'Upgrade-Insecure-Requests',
    direction: 'request',
    description: 'The client prefers an encrypted, authenticated response.',
  },
  {
    name: 'User-Agent',
    direction: 'request',
    description: 'Software that sends the request.',
  },
  {
    name: 'X-Api-Key',
    direction: 'request',
    description: 'API key used by many services to authenticate the client.',
  },
  {
    name: 'X-CSRF-Token',
    direction: 'request',
    description: 'Anti-CSRF token echoed back to the server.',
  },
  {
    name: 'X-Forwarded-For',
    direction: 'request',
    repeatable: true,
    description: 'Originating client IP address when behind proxies (de facto).',
  },
  {
    name: 'X-Forwarded-Host',
    direction: 'request',
    description: 'Original Host requested by the client (de facto).',
  },
  {
    name: 'X-Forwarded-Proto',
    direction: 'request',
    description: 'Protocol the client used to connect to the proxy (de facto).',
  },
  {
    name: 'X-Real-IP',
    direction: 'request',
    description: 'Client IP address set by a reverse proxy (de facto).',
  },
  {
    name: 'X-Requested-With',
    direction: 'request',
    description: 'Marks AJAX requests, usually XMLHttpRequest (de facto).',
  },
  // ---- Request and response
  {
    name: 'Cache-Control',
    direction: 'both',
    description: 'Caching directives for requests and responses.',
  },
  {
    name: 'Connection',
    direction: 'both',
    description: 'Whether the connection stays open after the current message.',
  },
  {
    name: 'Content-Encoding',
    direction: 'both',
    description: 'Content codings applied to the body, such as gzip.',
  },
  {
    name: 'Content-Language',
    direction: 'both',
    description: 'Natural language of the intended audience of the body.',
  },
  {
    name: 'Content-Length',
    direction: 'both',
    description: 'Size of the body in bytes.',
  },
  {
    name: 'Content-Type',
    direction: 'both',
    description: 'Media type of the body.',
  },
  {
    name: 'Date',
    direction: 'both',
    description: 'Date and time the message was created.',
  },
  {
    name: 'Keep-Alive',
    direction: 'both',
    description: 'Timeout and maximum requests for a persistent connection.',
  },
  {
    name: 'Pragma',
    direction: 'both',
    description: 'HTTP/1.0 caching directive, usually no-cache.',
  },
  {
    name: 'Trailer',
    direction: 'both',
    description: 'Header fields sent after a chunked body.',
  },
  {
    name: 'Transfer-Encoding',
    direction: 'both',
    description: 'Encoding used to transfer the body, such as chunked.',
  },
  {
    name: 'Upgrade',
    direction: 'both',
    description: 'Switch the connection to another protocol, such as websocket.',
  },
  {
    name: 'Via',
    direction: 'both',
    repeatable: true,
    description: 'Proxies the message passed through.',
  },
  {
    name: 'X-Correlation-ID',
    direction: 'both',
    description: 'Identifier that correlates related requests across services (de facto).',
  },
  {
    name: 'X-Request-ID',
    direction: 'both',
    description: 'Unique identifier of the request for tracing (de facto).',
  },
  // ---- Response
  {
    name: 'Accept-Patch',
    direction: 'response',
    description: 'Media types the server accepts in a PATCH request.',
  },
  {
    name: 'Accept-Ranges',
    direction: 'response',
    description: 'Whether the server supports range requests, usually bytes.',
  },
  {
    name: 'Access-Control-Allow-Credentials',
    direction: 'response',
    description: 'CORS: whether the response may be shared when credentials are sent.',
  },
  {
    name: 'Access-Control-Allow-Headers',
    direction: 'response',
    description: 'CORS: headers allowed in the actual request.',
  },
  {
    name: 'Access-Control-Allow-Methods',
    direction: 'response',
    description: 'CORS: methods allowed for the resource.',
  },
  {
    name: 'Access-Control-Allow-Origin',
    direction: 'response',
    description: 'CORS: origin allowed to read the response.',
  },
  {
    name: 'Access-Control-Expose-Headers',
    direction: 'response',
    description: 'CORS: response headers scripts are allowed to read.',
  },
  {
    name: 'Access-Control-Max-Age',
    direction: 'response',
    description: 'CORS: seconds a preflight result may be cached.',
  },
  {
    name: 'Age',
    direction: 'response',
    description: 'Seconds the response has been in a proxy cache.',
  },
  {
    name: 'Allow',
    direction: 'response',
    description: 'Methods supported by the target resource.',
  },
  {
    name: 'Alt-Svc',
    direction: 'response',
    description: 'Alternative services (protocol, host, port) for the origin.',
  },
  {
    name: 'Clear-Site-Data',
    direction: 'response',
    description: 'Clears browsing data (cookies, storage, cache) for the site.',
  },
  {
    name: 'Content-Disposition',
    direction: 'response',
    description: 'Show the body inline or download it as an attachment.',
  },
  {
    name: 'Content-Location',
    direction: 'response',
    description: 'Alternate location of the returned data.',
  },
  {
    name: 'Content-Range',
    direction: 'response',
    description: 'Position of a partial body in the full resource.',
  },
  {
    name: 'Content-Security-Policy',
    direction: 'response',
    description: 'Resources the user agent is allowed to load for the page.',
  },
  {
    name: 'Content-Security-Policy-Report-Only',
    direction: 'response',
    description: 'CSP that only reports violations without enforcing them.',
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    direction: 'response',
    description: 'Controls loading of cross-origin resources into the document.',
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    direction: 'response',
    description: 'Isolates the browsing context group from cross-origin documents.',
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    direction: 'response',
    description: 'Blocks no-cors cross-origin or cross-site loads of the resource.',
  },
  {
    name: 'ETag',
    direction: 'response',
    description: 'Identifier of a specific version of the resource.',
  },
  {
    name: 'Expires',
    direction: 'response',
    description: 'Date after which the response is considered stale.',
  },
  {
    name: 'Last-Modified',
    direction: 'response',
    description: 'Date the resource was last changed.',
  },
  {
    name: 'Link',
    direction: 'response',
    repeatable: true,
    description: 'Typed links to related resources (RFC 8288).',
  },
  {
    name: 'Location',
    direction: 'response',
    description: 'URL to redirect to, or of a newly created resource.',
  },
  {
    name: 'Permissions-Policy',
    direction: 'response',
    description: 'Browser features the document and its frames may use.',
  },
  {
    name: 'Proxy-Authenticate',
    direction: 'response',
    repeatable: true,
    description: 'Authentication scheme required to access a resource through a proxy.',
  },
  {
    name: 'Referrer-Policy',
    direction: 'response',
    description: 'How much referrer information requests should include.',
  },
  {
    name: 'Retry-After',
    direction: 'response',
    description: 'How long to wait before making a follow-up request.',
  },
  {
    name: 'Server',
    direction: 'response',
    description: 'Software used by the origin server.',
  },
  {
    name: 'Server-Timing',
    direction: 'response',
    repeatable: true,
    description: 'Server-side performance metrics for the request.',
  },
  {
    name: 'Set-Cookie',
    direction: 'response',
    repeatable: true,
    description: 'Sends a cookie from the server to the user agent.',
  },
  {
    name: 'Strict-Transport-Security',
    direction: 'response',
    description: 'Tells browsers to use HTTPS only for this host (HSTS).',
  },
  {
    name: 'Vary',
    direction: 'response',
    description: 'Request headers that affect which response is cached.',
  },
  {
    name: 'WWW-Authenticate',
    direction: 'response',
    repeatable: true,
    description: 'Authentication scheme required to access the resource.',
  },
  {
    name: 'X-Content-Type-Options',
    direction: 'response',
    description: 'nosniff disables MIME type sniffing.',
  },
  {
    name: 'X-Frame-Options',
    direction: 'response',
    description: 'Whether the page may be shown in a frame (DENY, SAMEORIGIN).',
  },
  {
    name: 'X-RateLimit-Limit',
    direction: 'response',
    description: 'Requests allowed in the current rate-limit window (de facto).',
  },
  {
    name: 'X-RateLimit-Remaining',
    direction: 'response',
    description: 'Requests left in the current rate-limit window (de facto).',
  },
  {
    name: 'X-RateLimit-Reset',
    direction: 'response',
    description: 'When the current rate-limit window resets (de facto).',
  },
];

const MEDIA_TYPES: readonly string[] = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'text/html',
  'application/xml',
  'application/octet-stream',
];

/** Media types whose `; charset=utf-8` form is also offered. */
const TEXTUAL_MEDIA_TYPES: readonly string[] = [
  'application/json',
  'text/plain',
  'text/html',
  'application/xml',
];

const mediaTypeValues = (withWildcard: boolean): HttpHeaderValueInfo[] => [
  ...(withWildcard ? [{ label: '*/*', info: 'Any media type' }] : []),
  ...MEDIA_TYPES.map(label => ({ label })),
  ...TEXTUAL_MEDIA_TYPES.map(type => ({ label: `${type}; charset=utf-8` })),
];

const AUTH_SCHEMES: readonly HttpHeaderValueInfo[] = [
  { label: 'Bearer', apply: 'Bearer ', info: 'OAuth 2.0 / JWT access token (RFC 6750)' },
  { label: 'Basic', apply: 'Basic ', info: 'base64(user:password) (RFC 7617)' },
  { label: 'Digest', apply: 'Digest ', info: 'Digest access authentication (RFC 7616)' },
  { label: 'Negotiate', apply: 'Negotiate ', info: 'SPNEGO / Kerberos (RFC 4559)' },
  {
    label: 'AWS4-HMAC-SHA256',
    apply: 'AWS4-HMAC-SHA256 ',
    info: 'AWS Signature Version 4',
  },
];

const CODINGS: readonly HttpHeaderValueInfo[] = [
  { label: 'gzip' },
  { label: 'deflate' },
  { label: 'br' },
  { label: 'zstd' },
];

/** Parameter values offered after `;` in a Content-Type / Accept value. */
export const HTTP_MEDIA_TYPE_PARAMETERS: readonly HttpHeaderValueInfo[] = [
  { label: 'charset=utf-8' },
];

/** Header values keyed by lowercased header name. */
export const HTTP_HEADER_VALUES: Readonly<Record<string, readonly HttpHeaderValueInfo[]>> = {
  accept: mediaTypeValues(true),
  'accept-encoding': [{ label: 'gzip, deflate, br, zstd' }, ...CODINGS, { label: 'identity' }],
  'access-control-allow-credentials': [{ label: 'true' }],
  'access-control-allow-origin': [
    { label: '*', info: 'Any origin (not allowed with credentials)' },
  ],
  authorization: AUTH_SCHEMES,
  'cache-control': [
    { label: 'no-cache' },
    { label: 'no-store' },
    { label: 'max-age=', info: 'Seconds the response stays fresh' },
    { label: 'private' },
    { label: 'public' },
    { label: 'must-revalidate' },
    { label: 'no-transform' },
    { label: 'immutable' },
  ],
  connection: [{ label: 'keep-alive' }, { label: 'close' }],
  'content-encoding': CODINGS,
  'content-type': mediaTypeValues(false),
  pragma: [{ label: 'no-cache' }],
  'proxy-authorization': AUTH_SCHEMES,
  'transfer-encoding': [{ label: 'chunked' }, ...CODINGS],
  upgrade: [{ label: 'websocket' }, { label: 'h2c' }],
  'x-content-type-options': [{ label: 'nosniff' }],
  'x-frame-options': [{ label: 'DENY' }, { label: 'SAMEORIGIN' }],
  'x-requested-with': [{ label: 'XMLHttpRequest' }],
};
