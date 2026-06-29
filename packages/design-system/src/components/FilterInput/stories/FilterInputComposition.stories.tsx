import type React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterInput } from '../FilterInput';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from '../lib/statusCode';
import type { ExprNode, FieldMetadata, FieldType, FilterOperator } from '../types';

const meta = {
  title: 'Patterns/FilterInput/Composition',
  component: FilterInput,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 960 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof FilterInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Real backend where_fields from sessions-api metadata with sample values
const attackFields: FieldMetadata[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    description: 'Attack status',
    operators: ['=', '!=', 'in'],
    values: [
      { value: 'registered', label: 'Registered' },
      { value: 'blocked', label: 'Blocked' },
    ],
  },
  {
    name: 'last_seen',
    label: 'Last seen',
    type: 'date',
    description: 'Last time the attack was seen',
    operators: ['>', '>=', '<', '<=', '=', '!=', 'between'],
  },
  {
    name: 'application_id',
    label: 'Application ID',
    type: 'integer',
    description: 'Application identifier (freeform — any value accepted)',
    operators: ['=', '!=', '>', '<', '>=', '<=', 'in'],
    options: [],
  },
  {
    name: 'country',
    label: 'Country',
    type: 'string',
    description: 'Country code of the request origin (e.g., US, UK)',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'US', label: 'US' },
      { value: 'CN', label: 'CN' },
      { value: 'RU', label: 'RU' },
      { value: 'DE', label: 'DE' },
      { value: 'BR', label: 'BR' },
      { value: 'IN', label: 'IN' },
      { value: 'GB', label: 'GB' },
      { value: 'FR', label: 'FR' },
      { value: 'JP', label: 'JP' },
      { value: 'KR', label: 'KR' },
    ],
  },
  {
    name: 'method',
    label: 'HTTP Method',
    type: 'string',
    description: 'HTTP method (GET, POST, PUT, DELETE, etc.)',
    operators: ['=', '!=', 'in', 'like'],
    options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  },
  {
    name: 'status_code',
    label: 'Status Code',
    type: 'integer',
    description: 'HTTP response status code (200, 404, 500, etc.)',
    operators: ['=', '!=', '>', '<', '>=', '<=', 'in'],
    values: [
      { value: 200, label: '200 OK' },
      { value: 301, label: '301 Moved Permanently' },
      { value: 400, label: '400 Bad Request' },
      { value: 401, label: '401 Unauthorized' },
      { value: 403, label: '403 Forbidden' },
      { value: 404, label: '404 Not Found' },
      { value: 429, label: '429 Too Many Requests' },
      { value: 500, label: '500 Internal Server Error' },
      { value: 502, label: '502 Bad Gateway' },
      { value: 503, label: '503 Service Unavailable' },
    ],
    getSuggestions: createStatusCodeSuggestions(),
    validate: createStatusCodeValidator(),
    acceptChar: createStatusCodeInputFilter(),
    normalize: createStatusCodeNormalizer(),
  },
  {
    name: 'protocol',
    label: 'Protocol',
    type: 'string',
    description: 'Request protocol (http, https, grpc, etc.)',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'https', label: 'https' },
      { value: 'http', label: 'http' },
      { value: 'grpc', label: 'grpc' },
      { value: 'ws', label: 'ws' },
      { value: 'wss', label: 'wss' },
    ],
  },
  {
    name: 'ip',
    label: 'IP Address',
    type: 'string',
    description: 'IP address of the client',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: '192.168.1.1', label: '192.168.1.1' },
      { value: '10.0.0.1', label: '10.0.0.1' },
      { value: '172.16.0.100', label: '172.16.0.100' },
      { value: '203.0.113.50', label: '203.0.113.50' },
      { value: '198.51.100.23', label: '198.51.100.23' },
    ],
  },
  {
    name: 'host',
    label: 'Host',
    type: 'string',
    description: 'Host name from the request',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'api.example.com', label: 'api.example.com' },
      { value: 'app.example.com', label: 'app.example.com' },
      { value: 'admin.example.com', label: 'admin.example.com' },
      { value: 'cdn.example.com', label: 'cdn.example.com' },
    ],
  },
  {
    name: 'path',
    label: 'Path',
    type: 'string',
    description: 'Request path/URI',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: '/api/v1/users', label: '/api/v1/users' },
      { value: '/api/v1/auth/login', label: '/api/v1/auth/login' },
      { value: '/api/v1/payments', label: '/api/v1/payments' },
      { value: '/api/v1/search', label: '/api/v1/search' },
      { value: '/admin/settings', label: '/admin/settings' },
    ],
  },
  {
    name: 'user_id',
    label: 'User ID',
    type: 'string',
    description: 'User identifier (may be empty if not authenticated)',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'usr_8f3k2m', label: 'usr_8f3k2m' },
      { value: 'usr_a1b2c3', label: 'usr_a1b2c3' },
      { value: 'usr_x9y8z7', label: 'usr_x9y8z7' },
    ],
  },
  {
    name: 'session_id',
    label: 'Session ID',
    type: 'string',
    description: 'Session identifier',
    operators: ['=', '!=', 'in'],
    values: [
      {
        value: 'sess_a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        label: 'sess_a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
      {
        value: 'sess_f8e7d6c5-b4a3-2109-8765-432109abcdef',
        label: 'sess_f8e7d6c5-b4a3-2109-8765-432109abcdef',
      },
    ],
  },
  {
    name: 'user_role',
    label: 'User Role',
    type: 'string',
    description: 'User role (admin, user, guest, etc.)',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'admin', label: 'admin' },
      { value: 'user', label: 'user' },
      { value: 'guest', label: 'guest' },
      { value: 'moderator', label: 'moderator' },
      { value: 'api_key', label: 'api_key' },
    ],
  },
  {
    name: 'attack_type',
    label: 'Attack Type',
    type: 'string',
    description: 'Type of attack (sqli, xss, rce, etc.)',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'sqli', label: 'sqli' },
      { value: 'xss', label: 'xss' },
      { value: 'rce', label: 'rce' },
      { value: 'lfi', label: 'lfi' },
      { value: 'xxe', label: 'xxe' },
      { value: 'ssrf', label: 'ssrf' },
      { value: 'path_traversal', label: 'path_traversal' },
      { value: 'crlf', label: 'crlf' },
      { value: 'nosqli', label: 'nosqli' },
      { value: 'ldapi', label: 'ldapi' },
    ],
  },
  {
    name: 'attack_location',
    label: 'Attack Location',
    type: 'string',
    description: 'Location where the attack was detected in the request',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'query', label: 'query' },
      { value: 'body', label: 'body' },
      { value: 'header', label: 'header' },
      { value: 'cookie', label: 'cookie' },
      { value: 'path', label: 'path' },
      { value: 'uri', label: 'uri' },
    ],
  },
  {
    name: 'payload_location',
    label: 'Payload Location',
    type: 'string',
    description: 'Location of the attack payload (query, body, header, etc.)',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'query', label: 'query' },
      { value: 'body', label: 'body' },
      { value: 'header', label: 'header' },
      { value: 'cookie', label: 'cookie' },
      { value: 'path', label: 'path' },
    ],
  },
  {
    name: 'parameter_name',
    label: 'Parameter Name',
    type: 'string',
    description: 'Name of the parameter containing the attack',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'id', label: 'id' },
      { value: 'q', label: 'q' },
      { value: 'search', label: 'search' },
      { value: 'username', label: 'username' },
      { value: 'redirect_url', label: 'redirect_url' },
      { value: 'file', label: 'file' },
      { value: 'callback', label: 'callback' },
    ],
  },
  {
    name: 'cve_id',
    label: 'CVE ID',
    type: 'string',
    description: 'CVE identifier if applicable (may be empty)',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'CVE-2021-44228', label: 'CVE-2021-44228 (Log4Shell)' },
      { value: 'CVE-2023-34362', label: 'CVE-2023-34362 (MOVEit)' },
      { value: 'CVE-2024-3094', label: 'CVE-2024-3094 (XZ Utils)' },
      { value: 'CVE-2023-44487', label: 'CVE-2023-44487 (HTTP/2 Rapid Reset)' },
    ],
  },
  {
    name: 'cwe_id',
    label: 'CWE ID',
    type: 'string',
    description: 'CWE identifier for the attack type',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'CWE-89', label: 'CWE-89 (SQL Injection)' },
      { value: 'CWE-79', label: 'CWE-79 (XSS)' },
      { value: 'CWE-78', label: 'CWE-78 (OS Command Injection)' },
      { value: 'CWE-22', label: 'CWE-22 (Path Traversal)' },
      { value: 'CWE-611', label: 'CWE-611 (XXE)' },
      { value: 'CWE-918', label: 'CWE-918 (SSRF)' },
    ],
  },
  {
    name: 'owasp_category',
    label: 'OWASP Category',
    type: 'string',
    description: 'OWASP category classification',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'A01:2021', label: 'A01:2021 Broken Access Control' },
      { value: 'A02:2021', label: 'A02:2021 Cryptographic Failures' },
      { value: 'A03:2021', label: 'A03:2021 Injection' },
      { value: 'A04:2021', label: 'A04:2021 Insecure Design' },
      { value: 'A05:2021', label: 'A05:2021 Security Misconfiguration' },
      { value: 'A06:2021', label: 'A06:2021 Vulnerable Components' },
      { value: 'A07:2021', label: 'A07:2021 Auth Failures' },
      { value: 'A08:2021', label: 'A08:2021 Data Integrity Failures' },
      { value: 'A09:2021', label: 'A09:2021 Logging Failures' },
      { value: 'A10:2021', label: 'A10:2021 SSRF' },
    ],
  },
  {
    name: 'mitigation_control_id',
    label: 'Mitigation Control ID',
    type: 'string',
    description: 'Identifier of the mitigation control applied',
    operators: ['=', '!=', 'in', 'like'],
    values: [
      { value: 'waf_rule_001', label: 'waf_rule_001' },
      { value: 'rate_limit_002', label: 'rate_limit_002' },
      { value: 'ip_block_003', label: 'ip_block_003' },
      { value: 'geo_block_004', label: 'geo_block_004' },
      { value: 'bot_detect_005', label: 'bot_detect_005' },
    ],
  },
  {
    name: 'request_id',
    label: 'Request ID',
    type: 'string',
    description: 'Unique request identifier',
    operators: ['=', '!=', 'in'],
    values: [
      { value: 'req_a1b2c3d4e5f6', label: 'req_a1b2c3d4e5f6' },
      { value: 'req_g7h8i9j0k1l2', label: 'req_g7h8i9j0k1l2' },
    ],
  },
  {
    name: 'requests_count',
    label: 'Requests Count',
    type: 'integer',
    description: 'Total number of requests',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 100, label: '100' },
      { value: 500, label: '500' },
      { value: 1000, label: '1000' },
      { value: 5000, label: '5000' },
      { value: 10000, label: '10000' },
    ],
  },
  {
    name: 'blocked_count',
    label: 'Blocked Count',
    type: 'integer',
    description: 'Number of blocked requests',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 0, label: '0' },
      { value: 10, label: '10' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
      { value: 500, label: '500' },
    ],
  },
  {
    name: 'success_count',
    label: 'Success Count',
    type: 'integer',
    description: 'Number of successful requests (2xx status codes)',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 100, label: '100' },
      { value: 500, label: '500' },
      { value: 1000, label: '1000' },
      { value: 5000, label: '5000' },
    ],
  },
  {
    name: 'client_error_count',
    label: 'Client Error Count',
    type: 'integer',
    description: 'Number of client error requests (4xx status codes)',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 0, label: '0' },
      { value: 10, label: '10' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ],
  },
  {
    name: 'server_error_count',
    label: 'Server Error Count',
    type: 'integer',
    description: 'Number of server error requests (5xx status codes)',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 0, label: '0' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 50, label: '50' },
    ],
  },
  {
    name: 'request_size_sum',
    label: 'Request Size Sum',
    type: 'integer',
    description: 'Total sum of request sizes in bytes',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1024, label: '1 KB' },
      { value: 10240, label: '10 KB' },
      { value: 102400, label: '100 KB' },
      { value: 1048576, label: '1 MB' },
      { value: 10485760, label: '10 MB' },
    ],
  },
  {
    name: 'response_size_sum',
    label: 'Response Size Sum',
    type: 'integer',
    description: 'Total sum of response sizes in bytes',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1024, label: '1 KB' },
      { value: 10240, label: '10 KB' },
      { value: 102400, label: '100 KB' },
      { value: 1048576, label: '1 MB' },
      { value: 10485760, label: '10 MB' },
    ],
  },
  {
    name: 'unique_sessions',
    label: 'Unique Sessions',
    type: 'integer',
    description: 'Number of unique sessions',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1, label: '1' },
      { value: 10, label: '10' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ],
  },
  {
    name: 'unique_ips',
    label: 'Unique IPs',
    type: 'integer',
    description: 'Number of unique IP addresses',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1, label: '1' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ],
  },
  {
    name: 'unique_paths',
    label: 'Unique Paths',
    type: 'integer',
    description: 'Number of unique request paths',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1, label: '1' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 50, label: '50' },
    ],
  },
  {
    name: 'unique_users',
    label: 'Unique Users',
    type: 'integer',
    description: 'Number of unique users',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1, label: '1' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 50, label: '50' },
    ],
  },
  {
    name: 'unique_request_ids',
    label: 'Unique Request IDs',
    type: 'integer',
    description: 'Number of unique request IDs',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1, label: '1' },
      { value: 10, label: '10' },
      { value: 100, label: '100' },
      { value: 1000, label: '1000' },
    ],
  },
  {
    name: 'unique_endpoints',
    label: 'Unique Endpoints',
    type: 'integer',
    description: 'Number of unique endpoints',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1, label: '1' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 25, label: '25' },
    ],
  },
  {
    name: 'unique_parameters',
    label: 'Unique Parameters',
    type: 'integer',
    description: 'Number of unique parameters',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 1, label: '1' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 25, label: '25' },
    ],
  },
  {
    name: 'max_risk_score',
    label: 'Max Risk Score',
    type: 'float',
    description: 'Maximum risk score',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 0.0, label: '0.0' },
      { value: 0.25, label: '0.25' },
      { value: 0.5, label: '0.5' },
      { value: 0.75, label: '0.75' },
      { value: 1.0, label: '1.0' },
    ],
  },
  {
    name: 'min_risk_score',
    label: 'Min Risk Score',
    type: 'float',
    description: 'Minimum risk score',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 0.0, label: '0.0' },
      { value: 0.25, label: '0.25' },
      { value: 0.5, label: '0.5' },
      { value: 0.75, label: '0.75' },
      { value: 1.0, label: '1.0' },
    ],
  },
  {
    name: 'response_time_avg',
    label: 'Avg Response Time',
    type: 'float',
    description: 'Average response time in milliseconds',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 50, label: '50ms' },
      { value: 100, label: '100ms' },
      { value: 250, label: '250ms' },
      { value: 500, label: '500ms' },
      { value: 1000, label: '1s' },
      { value: 5000, label: '5s' },
    ],
  },
  {
    name: 'response_time_max',
    label: 'Max Response Time',
    type: 'float',
    description: 'Maximum response time in milliseconds',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    values: [
      { value: 100, label: '100ms' },
      { value: 500, label: '500ms' },
      { value: 1000, label: '1s' },
      { value: 5000, label: '5s' },
      { value: 10000, label: '10s' },
      { value: 30000, label: '30s' },
    ],
  },
];

/**
 * Mirrors the MY console **new Attacks** page: the full attack-vectors filter
 * schema served by sessions-api (`where_fields`), rendered straight from the
 * raw backend payload via `backendFieldsToMetadata` (see below). Every field is
 * `strictValues: false`, so backend option lists act as suggestions and any
 * typed value commits — exactly how the Attacks page treats the schema, letting
 * the backend reject truly invalid input.
 *
 * Exercises the real-world breadth the component must handle: ~50 fields, a
 * ~115-entry `application_id` option list, large `attack_type` /
 * `attack_subtype` / `cwe_id` / `capec_id` enumerations, freeform
 * integer/date/float fields, and the `context_param` key/value field (rendered
 * as a paired Parameter → Value chip).
 */
export const Default: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>(null);

    const fields = realBackendFields.map(backendFieldsToMetadata);

    return (
      <>
        <FilterInput
          fields={fields}
          value={expression}
          onChange={setExpression}
          placeholder='Filter attacks...'
          showKeyboardHint
        />

        {/* Debug output */}
        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
    );
  },
};

/**
 * Same fields as `Default`, but every field sets `strictValues: false`, so its
 * `values`/`options` act as *suggestions* rather than a strict allowlist: the
 * dropdown still offers them, but any typed value commits without an
 * "Invalid value" error and changing a chip's field never reddens the carried
 * value. Data-type checks (a non-date in a `date` field) and explicit `validate`
 * callbacks (e.g. `status_code` format) still apply.
 *
 * This mirrors the Attacks page, which treats backend schema options as samples
 * and lets the backend reject truly invalid values.
 */
export const SuggestionsOnly: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>(null);

    const suggestionFields: FieldMetadata[] = attackFields.map(field => ({
      ...field,
      strictValues: false,
    }));

    return (
      <>
        <FilterInput
          fields={suggestionFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter — options are suggestions, free text allowed...'
          showKeyboardHint
        />

        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
    );
  },
};

/**
 * Minimal example with fewer fields.
 * Supports multiple conditions with AND/OR — create several filters in a row.
 */
export const Simple: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>(null);

    const simpleFields: FieldMetadata[] = [
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        values: [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
          { value: 'archived', label: 'Archived' },
        ],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'integer',
        values: [
          { value: 1, label: 'Low' },
          { value: 5, label: 'Medium' },
          { value: 10, label: 'High' },
        ],
      },
    ];

    return (
      <>
        <FilterInput
          fields={simpleFields}
          value={expression}
          onChange={expr => {
            console.log('Filter:', expr);
            setExpression(expr);
          }}
          placeholder='Filter items...'
        />

        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre data-testid='expression-debug'>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
    );
  },
};

/**
 * Backend integration example
 * Shows how to use with API config (like from sessions-api metadata.go)
 */
export const BackendIntegration: Story = {
  render: () => {
    const [metadata, setMetadata] = useState<FieldMetadata[] | null>(null);
    const [expression, setExpression] = useState<ExprNode | null>(null);

    // Simulate fetching metadata from backend
    useState(() => {
      // In real app: fetch('/api/security/query-metadata')
      setTimeout(() => {
        setMetadata(attackFields);
      }, 100);
    });

    if (!metadata) {
      return <div className='h-40 bg-gray-100 rounded-8 animate-pulse' />;
    }

    return (
      <FilterInput
        fields={metadata}
        value={expression}
        onChange={setExpression}
        placeholder='Loading metadata from backend...'
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Real attack-vectors metadata, served verbatim by the backend
// (sessions-api `where_fields`). Kept in the raw backend shape — `options` is
// an array of `{ value, label }`, `type`/`operators` are plain strings, and a
// `key_value` field carries `key_options` — then normalized to FieldMetadata
// by `backendFieldsToMetadata` below, exactly as a real consumer would.
// ---------------------------------------------------------------------------

interface RawBackendOption {
  value: string;
  label: string;
}

interface RawBackendField {
  name: string;
  label: string;
  type: string;
  description?: string;
  operators: string[];
  options?: RawBackendOption[];
  /** Backend "show in default view" flag — not a filter default value, so dropped. */
  default?: boolean;
  key_value?: {
    key_label: string;
    value_label: string;
    key_options: RawBackendOption[];
  };
}

const SUPPORTED_OPERATORS = new Set<FilterOperator>([
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  'like',
  'not_like',
  'in',
  'not_in',
  'is_null',
  'is_not_null',
  'between',
]);

/** Backend presence operators map onto the DS no-value operators. */
const OPERATOR_ALIASES: Record<string, FilterOperator> = {
  is_empty: 'is_null',
  is_not_empty: 'is_not_null',
};

const SUPPORTED_TYPES = new Set<FieldType>([
  'string',
  'integer',
  'date',
  'float',
  'boolean',
  'enum',
]);

const toOperators = (ops: string[]): FilterOperator[] =>
  ops
    .map(op => OPERATOR_ALIASES[op] ?? (op as FilterOperator))
    .filter(op => SUPPORTED_OPERATORS.has(op));

/**
 * Normalize one raw backend field to `FieldMetadata`:
 * - `options: [{ value, label }]` → `values`; `options: []` → freeform input.
 * - `key_value` → a paired field: the key (parameter name) is an enum, the
 *   value rides on `pairedField` with the field's own comparison operators.
 * - `strictValues: false` everywhere — backend option lists are samples, so
 *   typed-but-unlisted values must commit (mirrors the Attacks page).
 */
const backendFieldsToMetadata = (raw: RawBackendField): FieldMetadata => {
  if (raw.type === 'key_value' && raw.key_value) {
    return {
      name: raw.name,
      label: raw.label,
      type: 'enum',
      description: raw.description,
      operators: ['='],
      strictValues: false,
      values: raw.key_value.key_options.map(o => ({ value: o.value, label: o.label })),
      pairedField: {
        name: `${raw.name}_value`,
        label: raw.key_value.value_label,
        type: 'string',
        options: [],
        strictValues: false,
        operators: toOperators(raw.operators),
      },
    };
  }

  const type: FieldType = SUPPORTED_TYPES.has(raw.type as FieldType)
    ? (raw.type as FieldType)
    : 'string';

  const field: FieldMetadata = {
    name: raw.name,
    label: raw.label,
    type,
    description: raw.description,
    operators: toOperators(raw.operators),
    strictValues: false,
  };

  if (raw.options && raw.options.length > 0) {
    field.values = raw.options.map(o => ({ value: o.value, label: o.label }));
  } else {
    field.options = [];
  }

  return field;
};

const realBackendFields: RawBackendField[] = [
  {
    name: 'application_id',
    label: 'Application ID',
    type: 'integer',
    description: 'Application identifier',
    operators: ['=', '!=', 'in'],
    options: [
      { value: '3', label: 'API Console' },
      { value: '2', label: 'API Wallarm' },
      { value: '6', label: 'API: /v2/registration' },
      { value: '1', label: 'Application #11111111111' },
      { value: '55', label: 'Application #55' },
      { value: '4', label: 'audit-beta.my.wallarm.com' },
      { value: '-1', label: 'default' },
      { value: '42', label: 'GraphQL Demo' },
      { value: '57', label: 'metalpriceapi.com' },
      { value: '7', label: 'oob-ebpf' },
      { value: '897', label: 'qwe' },
      { value: '56', label: 'staff' },
      { value: '772', label: 'Test_119' },
      { value: '98', label: 'Test_120' },
      { value: '20', label: 'Test_121' },
      { value: '972', label: 'Test_122' },
      { value: '672', label: 'Test_134' },
      { value: '592', label: 'Test_138' },
      { value: '292', label: 'Test_158' },
      { value: '584', label: 'Test_184' },
      { value: '82', label: 'Test_194' },
      { value: '715', label: 'Test_198' },
      { value: '472', label: 'Test_203' },
      { value: '366', label: 'Test_222' },
      { value: '830', label: 'Test_231' },
      { value: '420', label: 'Test_236' },
      { value: '441', label: 'Test_245' },
      { value: '864', label: 'Test_245' },
      { value: '87', label: 'Test_249' },
      { value: '979', label: 'Test_259' },
      { value: '818', label: 'Test_263' },
      { value: '393', label: 'Test_267' },
      { value: '32', label: 'Test_279' },
      { value: '514', label: 'Test_289' },
      { value: '117', label: 'Test_291' },
      { value: '240', label: 'Test_292' },
      { value: '896', label: 'Test_305' },
      { value: '614', label: 'Test_334' },
      { value: '720', label: 'Test_340' },
      { value: '566', label: 'Test_351' },
      { value: '143', label: 'Test_395' },
      { value: '799', label: 'Test_397' },
      { value: '209', label: 'Test_4' },
      { value: '369', label: 'Test_424' },
      { value: '865', label: 'Test_424' },
      { value: '329', label: 'Test_438' },
      { value: '190', label: 'Test_44' },
      { value: '58', label: 'Test_442' },
      { value: '705', label: 'Test_444' },
      { value: '50', label: 'Test_445' },
      { value: '47', label: 'Test_459' },
      { value: '412', label: 'Test_46' },
      { value: '142', label: 'Test_463' },
      { value: '577', label: 'Test_464' },
      { value: '407', label: 'Test_470' },
      { value: '900', label: 'Test_481' },
      { value: '732', label: 'Test_492' },
      { value: '356', label: 'Test_496' },
      { value: '532', label: 'Test_505' },
      { value: '469', label: 'Test_519' },
      { value: '479', label: 'Test_525' },
      { value: '601', label: 'Test_525' },
      { value: '640', label: 'Test_55' },
      { value: '557', label: 'Test_594' },
      { value: '841', label: 'Test_601' },
      { value: '800', label: 'Test_61' },
      { value: '845', label: 'Test_615' },
      { value: '697', label: 'Test_618' },
      { value: '819', label: 'Test_632' },
      { value: '730', label: 'Test_642' },
      { value: '647', label: 'Test_646' },
      { value: '944', label: 'Test_661' },
      { value: '837', label: 'Test_669' },
      { value: '23', label: 'Test_676' },
      { value: '817', label: 'Test_692' },
      { value: '248', label: 'Test_70' },
      { value: '936', label: 'Test_725' },
      { value: '942', label: 'Test_729' },
      { value: '903', label: 'Test_73' },
      { value: '96', label: 'Test_735' },
      { value: '436', label: 'Test_738' },
      { value: '316', label: 'Test_75' },
      { value: '698', label: 'Test_753' },
      { value: '63', label: 'Test_765' },
      { value: '611', label: 'Test_793' },
      { value: '168', label: 'Test_816' },
      { value: '722', label: 'Test_825' },
      { value: '881', label: 'Test_84' },
      { value: '976', label: 'Test_840' },
      { value: '642', label: 'Test_850' },
      { value: '832', label: 'Test_850' },
      { value: '294', label: 'Test_855' },
      { value: '487', label: 'Test_855' },
      { value: '315', label: 'Test_860' },
      { value: '758', label: 'Test_866' },
      { value: '808', label: 'Test_876' },
      { value: '659', label: 'Test_885' },
      { value: '229', label: 'Test_89' },
      { value: '650', label: 'Test_89' },
      { value: '759', label: 'Test_90' },
      { value: '136', label: 'Test_917' },
      { value: '623', label: 'Test_919' },
      { value: '512', label: 'Test_92' },
      { value: '789', label: 'Test_925' },
      { value: '593', label: 'Test_926' },
      { value: '135', label: 'Test_931' },
      { value: '477', label: 'Test_931' },
      { value: '539', label: 'Test_934' },
      { value: '224', label: 'Test_941' },
      { value: '9999', label: 'TestApp' },
      { value: '980', label: 'timq-docker' },
      { value: '981', label: 'timq-sec-edge-inline' },
    ],
    default: true,
  },
  {
    name: 'host',
    label: 'Host',
    type: 'string',
    description: 'Host name from the request',
    operators: ['=', '!=', 'in'],
    options: [{ value: '__none__', label: 'None' }],
    default: true,
  },
  {
    name: 'normalized_path',
    label: 'Path',
    type: 'string',
    description: 'Request path (normalized, e.g. /api/users/{parameter_1})',
    operators: ['=', '!=', 'in'],
    options: [{ value: '__none__', label: 'None' }],
    default: false,
  },
  {
    name: 'attack_type',
    label: 'Attack Type',
    type: 'string',
    description: 'Type of attack (sqli, xss, rce, etc.)',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'sqli', label: 'SQL Injection' },
      { value: 'nosqli', label: 'NoSQL Injection' },
      { value: 'rce', label: 'Remote Code Execution' },
      { value: 'ssi', label: 'Server-Side Include' },
      { value: 'ssti', label: 'Template Injection' },
      { value: 'ldapi', label: 'LDAP Injection' },
      { value: 'mail_injection', label: 'Email injection' },
      { value: 'ssrf', label: 'Server-Side Request Forgery' },
      { value: 'ptrav', label: 'Path traversal' },
      { value: 'xxe', label: 'XML External Entity' },
      { value: 'scanner', label: 'Scanner' },
      { value: 'xss', label: 'Cross-site Scripting' },
      { value: 'redir', label: 'Open redirect' },
      { value: 'crlf', label: 'CRLF Injection' },
      { value: 'brute', label: 'Brute force' },
      { value: 'dirbust', label: 'Forced browsing' },
      { value: 'credential_stuffing', label: 'Credential stuffing' },
      { value: 'rate_limit', label: 'Rate limit' },
      { value: 'enum', label: 'Enumeration' },
      { value: 'bola', label: 'Broken Object Level Authorization' },
      { value: 'mass_assignment', label: 'Mass assignment' },
      { value: 'api_abuse', label: 'Suspicious API activity' },
      { value: 'account_takeover', label: 'Account takeover' },
      { value: 'security_crawlers', label: 'Security crawlers' },
      { value: 'scraping', label: 'Scraping' },
      { value: 'session_anomaly', label: 'Custom logic abuse' },
      { value: 'resource_consumption', label: 'Unrestricted resource consumption' },
      { value: 'gql_doc_size', label: 'GraphQL query size' },
      { value: 'gql_value_size', label: 'GraphQL value size' },
      { value: 'gql_depth', label: 'GraphQL query depth' },
      { value: 'gql_aliases', label: 'GraphQL aliases' },
      { value: 'gql_docs_per_batch', label: 'GraphQL batching' },
      { value: 'gql_introspection', label: 'GraphQL introspection' },
      { value: 'gql_debug', label: 'GraphQL debug' },
      { value: 'undefined_endpoint', label: 'Undefined endpoint' },
      { value: 'undefined_parameter', label: 'Undefined parameter' },
      { value: 'invalid_parameter_value', label: 'Invalid parameter' },
      { value: 'missing_parameter', label: 'Missing parameter' },
      { value: 'missing_auth', label: 'Missing authentication' },
      { value: 'invalid_request', label: 'Invalid request' },
      { value: 'data_bomb', label: 'Data bomb' },
      { value: 'invalid_xml', label: 'Invalid XML' },
      { value: 'processing_overlimit', label: 'Processing overlimit' },
      { value: 'overlimit_res', label: 'Resource overlimit' },
      { value: 'file_upload_violation', label: 'File upload violation' },
      { value: 'blocked_source', label: 'Blocked source' },
      { value: 'vpatch', label: 'Virtual patch' },
      { value: 'ai_attack', label: 'AI attack' },
      { value: 'ai_prompt_retrieval', label: 'System prompt retrieval' },
      { value: 'ai_prompt_injection', label: 'Prompt injection' },
      { value: 'query_anomaly', label: 'Custom AI payload inspection' },
      { value: 'mcp_parameter_violation', label: 'MCP request verification failure' },
    ],
    default: true,
  },
  {
    name: 'attack_subtype',
    label: 'Attack Subtype',
    type: 'string',
    description:
      'Fine-grained classification within an attack type, resolved from detection stamps via the classification taxonomy (e.g., sqli_union_based). Empty for non-stamp-based detections or when no stamp matches.',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'crlf_header_injection', label: 'Header Injection' },
      { value: 'crlf_http_response_splitting', label: 'HTTP Response Splitting' },
      { value: 'crlf_session_fixation', label: 'Session Fixation via CRLF' },
      { value: 'ldapi_filter_manipulation', label: 'Filter Manipulation' },
      { value: 'mail_injection_header', label: 'Header Injection' },
      { value: 'mail_injection_smtp_command', label: 'SMTP Command Injection' },
      { value: 'mass_assignment_privilege_escalation', label: 'Privilege Escalation' },
      { value: 'nosqli_auth_bypass', label: 'NoSQLi Auth Bypass' },
      { value: 'nosqli_generic', label: 'Generic NoSQLi' },
      { value: 'nosqli_introspection', label: 'NoSQLi Introspection' },
      { value: 'ptrav_config_access', label: 'Config Files Access PTRAV' },
      { value: 'ptrav_credentials_access', label: 'Credentials Access PTRAV' },
      { value: 'ptrav_generic', label: 'Generic PTRAV' },
      { value: 'ptrav_linux', label: 'Linux Filesystem PTRAV' },
      { value: 'ptrav_log_file_access', label: 'Log File Access' },
      { value: 'ptrav_php', label: 'PHP File Inclusion/Traversal PTRAV' },
      { value: 'ptrav_source_code_access', label: 'Source Code Access PTRAV' },
      { value: 'ptrav_web_files_access', label: 'Web Artifacts Access PTRAV' },
      { value: 'ptrav_windows', label: 'Windows Filesystem PTRAV' },
      { value: 'rce_code_injection', label: 'Code Injection' },
      { value: 'rce_command_inject', label: 'rce_command_inject' },
      { value: 'rce_command_injection', label: 'Command Injection' },
      { value: 'rce_command_injectionion', label: 'rce_command_injectionion' },
      { value: 'rce_dotnet_code_injection', label: '.NET Code Injection' },
      { value: 'rce_generic', label: 'RCE Generic' },
      { value: 'rce_java_code_injection', label: 'Java Code Injection' },
      { value: 'rce_jndi_injection', label: 'JNDI injection' },
      { value: 'rce_php_code_injection', label: 'PHP Code Injection' },
      { value: 'rce_web_shell_access', label: 'Web Shell access' },
      { value: 'rce_web_shell_upload', label: 'Web Shell Upload' },
      { value: 'rce_xslt_injection', label: 'XSLT Injection' },
      { value: 'scanner_malicious_domains', label: 'Malicious domains' },
      { value: 'scanner_oob_domains', label: 'OOB domains' },
      { value: 'scanner_scanning_tool', label: 'Scanning tool' },
      { value: 'sqli_boolean_based_blind', label: 'Boolean-Based Blind SQLi' },
      { value: 'sqli_code_execution', label: 'Code Execution via SQLi' },
      { value: 'sqli_generic', label: 'Generic SQLi' },
      { value: 'sqli_obfuscated_union_based', label: 'Obfuscated Union-Based SQLi' },
      { value: 'sqli_recon', label: 'SQLi Recon' },
      { value: 'sqli_stacked_queries', label: 'Stacked Queries' },
      { value: 'sqli_time_based_blind', label: 'Time-Based Blind SQLi' },
      { value: 'sqli_union_based', label: 'Union-Based SQLi' },
      { value: 'ssi_generic', label: 'Generic SSI' },
      { value: 'ssrf_cloud', label: 'Cloud SSRF' },
      { value: 'ssrf_generic', label: 'Generic SSRF' },
      { value: 'ssrf_internal_network_scanning', label: 'Internal Network Scanning' },
      { value: 'ssti_code_execution', label: 'SSTI Code Execution' },
      { value: 'ssti_file_read', label: 'SSTI File Read' },
      { value: 'ssti_generic', label: 'Generic SSTI' },
      { value: 'ssti_recon', label: 'SSTI Reconnaissance' },
      { value: 'xss_dom_based', label: 'DOM-Based XSS' },
      { value: 'xss_generic', label: 'Generic XSS' },
    ],
    default: false,
  },
  {
    name: 'point',
    label: 'Attacked Param Location',
    type: 'string',
    description: 'Wallarm Proton Point - location in the request where the attack was detected',
    operators: ['=', '!=', 'in'],
    options: [],
    default: false,
  },
  {
    name: 'min_request_time',
    label: 'Started',
    type: 'date',
    description: 'Datetime of the first request in the attack',
    operators: ['=', '!=', '>', '<', '>=', '<=', 'in'],
    options: [],
    default: true,
  },
  {
    name: 'max_request_time',
    label: 'Last Seen',
    type: 'date',
    description: 'Datetime of the most recent request in the attack',
    operators: ['=', '!=', '>', '<', '>=', '<=', 'in'],
    options: [],
    default: false,
  },
  {
    name: 'ip',
    label: 'IP Address',
    type: 'string',
    description: 'IP address of the client',
    operators: ['=', '!=', 'in'],
    options: [],
    default: true,
  },
  {
    name: 'location_type',
    label: 'IP Location Type',
    type: 'string',
    description:
      'IP location type — tor, datacenter name (aws, gcp, etc.), or empty for residential/unknown',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'alibaba', label: 'Alibaba' },
      { value: 'aws', label: 'AWS' },
      { value: 'azure', label: 'Azure' },
      { value: 'docean', label: 'Digital Ocean' },
      { value: 'gce', label: 'GCP' },
      { value: 'hetzner', label: 'Hetzner' },
      { value: 'huawei', label: 'Huawei' },
      { value: 'ibm', label: 'IBM' },
      { value: 'linode', label: 'Linode' },
      { value: 'oracle', label: 'Oracle' },
      { value: 'ovh', label: 'OVH' },
      { value: 'plusserver', label: 'plusserver' },
      { value: 'rackspace', label: 'RackSpace' },
      { value: 'tencent', label: 'Tencent' },
      { value: 'tor', label: 'TOR' },
      { value: '__other__', label: 'Other' },
    ],
    default: false,
  },
  {
    name: 'country',
    label: 'Country',
    type: 'string',
    description: 'Country code of the request origin (e.g., US, UK)',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'US', label: 'United States' },
      { value: 'SG', label: 'Singapore' },
      { value: 'GB', label: 'United Kingdom' },
      { value: 'IN', label: 'India' },
      { value: 'NL', label: 'Netherlands' },
      { value: 'DE', label: 'Germany' },
      { value: 'FR', label: 'France' },
      { value: 'JP', label: 'Japan' },
      { value: 'PT', label: 'Portugal' },
      { value: 'AR', label: 'Argentina' },
      { value: 'PL', label: 'Poland' },
      { value: 'ES', label: 'Spain' },
      { value: 'KZ', label: 'Kazakhstan' },
      { value: 'RS', label: 'Serbia' },
      { value: 'BD', label: 'Bangladesh' },
      { value: 'CA', label: 'Canada' },
      { value: 'TH', label: 'Thailand' },
      { value: 'GE', label: 'Georgia' },
      { value: 'IT', label: 'Italy' },
      { value: 'AD', label: 'Andorra' },
      { value: 'IE', label: 'Ireland' },
      { value: 'BR', label: 'Brazil' },
      { value: 'AZ', label: 'Azerbaijan' },
      { value: 'AM', label: 'Armenia' },
      { value: 'MA', label: 'Morocco' },
      { value: 'RO', label: 'Romania' },
      { value: 'SE', label: 'Sweden' },
      { value: 'PK', label: 'Pakistan' },
      { value: 'BZ', label: 'Belize' },
      { value: 'IL', label: 'Israel' },
      { value: 'EE', label: 'Estonia' },
      { value: 'BG', label: 'Bulgaria' },
      { value: 'AU', label: 'Australia' },
      { value: 'DZ', label: 'Algeria' },
      { value: 'EG', label: 'Egypt' },
      { value: 'HK', label: 'Hong Kong' },
      { value: 'NG', label: 'Nigeria' },
      { value: 'ID', label: 'Indonesia' },
      { value: 'KR', label: 'Korea, Republic of' },
      { value: 'CZ', label: 'Czechia' },
      { value: 'CN', label: 'China' },
      { value: 'DK', label: 'Denmark' },
      { value: 'TR', label: 'Türkiye' },
      { value: 'LU', label: 'Luxembourg' },
      { value: 'PS', label: 'Palestine, State of' },
      { value: 'AE', label: 'United Arab Emirates' },
      { value: 'CH', label: 'Switzerland' },
      { value: 'RU', label: 'Russian Federation' },
    ],
    default: false,
  },
  {
    name: 'method',
    label: 'HTTP Method',
    type: 'string',
    description: 'HTTP method (GET, POST, PUT, DELETE, etc.)',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'GET', label: 'GET' },
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      { value: 'DELETE', label: 'DELETE' },
      { value: 'PATCH', label: 'PATCH' },
      { value: 'OPTIONS', label: 'OPTIONS' },
      { value: 'HEAD', label: 'HEAD' },
    ],
    default: true,
  },
  {
    name: 'status_code',
    label: 'Status Code',
    type: 'integer',
    description: 'HTTP response status code (200, 404, 500, etc.)',
    operators: ['=', '!=', '>', '<', '>=', '<=', 'in'],
    options: [
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
      { value: '200', label: '200' },
      { value: '201', label: '201' },
      { value: '301', label: '301' },
      { value: '302', label: '302' },
      { value: '400', label: '400' },
      { value: '401', label: '401' },
      { value: '403', label: '403' },
      { value: '404', label: '404' },
      { value: '500', label: '500' },
      { value: '502', label: '502' },
      { value: '503', label: '503' },
    ],
    default: false,
  },
  {
    name: 'protocol',
    label: 'L7 Protocol',
    type: 'string',
    description:
      'L7 protocol used to make requests (HTTP/1.0, HTTP/1.1, HTTP/2.0, WebSocket, etc.)',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'HTTP1.0', label: 'HTTP/1.0' },
      { value: 'HTTP1.1', label: 'HTTP/1.1' },
      { value: 'HTTP2', label: 'HTTP/2' },
      { value: 'Any HTTP', label: 'Any HTTP' },
      { value: 'Websocket', label: 'Websocket' },
      { value: '__other__', label: 'Other' },
    ],
    default: false,
  },
  {
    name: 'scheme',
    label: 'URI Scheme',
    type: 'string',
    description: 'URI scheme (http, https, ws, wss, grpc, grpcs)',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'http', label: 'HTTP' },
      { value: 'https', label: 'HTTPS' },
      { value: 'ws', label: 'Websocket' },
      { value: 'wss', label: 'Websocket Secure' },
      { value: 'grpc', label: 'gRPC' },
      { value: 'grpcs', label: 'gRPC Secure' },
      { value: '__other__', label: 'Other' },
    ],
    default: false,
  },
  {
    name: 'api_protocol',
    label: 'API Protocol',
    type: 'string',
    description:
      'API protocol classified by the matcher chain — rest, graphql, grpc, soap, websocket, web-form, json-rpc, webdav, xml-rpc',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'web-form', label: 'Web Form' },
      { value: 'graphql', label: 'GraphQL' },
      { value: 'json-rpc', label: 'JSON-RPC' },
      { value: 'rest', label: 'REST' },
      { value: 'grpc', label: 'gRPC' },
      { value: 'websocket', label: 'WebSocket' },
      { value: 'webdav', label: 'WebDAV' },
      { value: 'soap', label: 'SOAP' },
      { value: 'xml-rpc', label: 'XML-RPC' },
      { value: '__other__', label: 'Other' },
    ],
    default: false,
  },
  {
    name: 'auth_protocol',
    label: 'Authentication',
    type: 'string',
    description:
      "Authentication protocol detected in the request. AWS variants (awsv2/awsv4) collapse to the 'aws' bucket on the rollup endpoints (/query, /stats); use attack_vectors-direct endpoints for variant-specific queries.",
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'api-key', label: 'API Key' },
      { value: 'aws', label: 'AWS signature' },
      { value: 'basic', label: 'Basic authentication' },
      { value: 'bearer', label: 'Bearer token' },
      { value: 'cookie', label: 'Cookie authentication' },
      { value: 'hawk', label: 'Hawk' },
      { value: 'jwt', label: 'JWT authentication' },
      { value: 'oauth1', label: 'OAuth 1.0' },
      { value: 'oauth2', label: 'OAuth 2.0' },
      { value: 'digest', label: 'Digest authentication' },
      { value: 'ntlm', label: 'NTLM authentication' },
      { value: 'scram', label: 'SCRAM authentication' },
      { value: 'spnego', label: 'SPNEGO' },
      { value: '__other__', label: 'Other' },
      { value: 'none', label: 'None' },
    ],
    default: false,
  },
  {
    name: 'request_id',
    label: 'Request ID',
    type: 'string',
    description: 'Unique request identifier',
    operators: ['=', '!=', 'in'],
    options: [],
    default: false,
  },
  {
    name: 'user',
    label: 'User',
    type: 'string',
    description: 'User identifier (may be empty if not authenticated)',
    operators: ['=', '!=', 'in'],
    options: [{ value: '__none__', label: 'None' }],
    default: false,
  },
  {
    name: 'user_role',
    label: 'User Role',
    type: 'string',
    description: 'User role (admin, user, guest, etc.)',
    operators: ['=', '!=', 'in'],
    options: [{ value: '__none__', label: 'None' }],
    default: false,
  },
  {
    name: 'orig_session_id',
    label: 'Session ID',
    type: 'string',
    description: 'Original (non-hashed) session identifier',
    operators: ['=', '!=', 'in'],
    options: [],
    default: false,
  },
  {
    name: 'cve_id',
    label: 'CVE ID',
    type: 'string',
    description: 'CVE identifier if applicable (may be empty)',
    operators: ['=', '!=', 'in'],
    options: [{ value: '__none__', label: 'None' }],
    default: false,
  },
  {
    name: 'cwe_id',
    label: 'CWE ID',
    type: 'string',
    description:
      "CWE identifier from the classification taxonomy [AS-790]. One row per CWE when an attack has multiple. Empty when the taxonomy has no match for the attack's type/subtype.",
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'CWE-112', label: 'CWE-112' },
      { value: 'CWE-113', label: 'CWE-113' },
      { value: 'CWE-1336', label: 'CWE-1336' },
      { value: 'CWE-20', label: 'CWE-20' },
      { value: 'CWE-200', label: 'CWE-200' },
      { value: 'CWE-215', label: 'CWE-215' },
      { value: 'CWE-22', label: 'CWE-22' },
      { value: 'CWE-235', label: 'CWE-235' },
      { value: 'CWE-284', label: 'CWE-284' },
      { value: 'CWE-306', label: 'CWE-306' },
      { value: 'CWE-307', label: 'CWE-307' },
      { value: 'CWE-384', label: 'CWE-384' },
      { value: 'CWE-400', label: 'CWE-400' },
      { value: 'CWE-405', label: 'CWE-405' },
      { value: 'CWE-409', label: 'CWE-409' },
      { value: 'CWE-425', label: 'CWE-425' },
      { value: 'CWE-434', label: 'CWE-434' },
      { value: 'CWE-502', label: 'CWE-502' },
      { value: 'CWE-611', label: 'CWE-611' },
      { value: 'CWE-639', label: 'CWE-639' },
      { value: 'CWE-644', label: 'CWE-644' },
      { value: 'CWE-674', label: 'CWE-674' },
      { value: 'CWE-77', label: 'CWE-77' },
      { value: 'CWE-770', label: 'CWE-770' },
      { value: 'CWE-78', label: 'CWE-78' },
      { value: 'CWE-79', label: 'CWE-79' },
      { value: 'CWE-799', label: 'CWE-799' },
      { value: 'CWE-829', label: 'CWE-829' },
      { value: 'CWE-89', label: 'CWE-89' },
      { value: 'CWE-90', label: 'CWE-90' },
      { value: 'CWE-91', label: 'CWE-91' },
      { value: 'CWE-915', label: 'CWE-915' },
      { value: 'CWE-918', label: 'CWE-918' },
      { value: 'CWE-93', label: 'CWE-93' },
      { value: 'CWE-94', label: 'CWE-94' },
      { value: 'CWE-943', label: 'CWE-943' },
      { value: 'CWE-97', label: 'CWE-97' },
      { value: 'CWE-98', label: 'CWE-98' },
      { value: '__none__', label: 'None' },
    ],
    default: false,
  },
  {
    name: 'capec_id',
    label: 'CAPEC ID',
    type: 'string',
    description:
      'CAPEC identifier from the classification taxonomy. One row per CAPEC when an attack has multiple. Empty when the taxonomy has no match.',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'CAPEC-101', label: 'CAPEC-101' },
      { value: 'CAPEC-105', label: 'CAPEC-105' },
      { value: 'CAPEC-108', label: 'CAPEC-108' },
      { value: 'CAPEC-111', label: 'CAPEC-111' },
      { value: 'CAPEC-113', label: 'CAPEC-113' },
      { value: 'CAPEC-115', label: 'CAPEC-115' },
      { value: 'CAPEC-126', label: 'CAPEC-126' },
      { value: 'CAPEC-130', label: 'CAPEC-130' },
      { value: 'CAPEC-136', label: 'CAPEC-136' },
      { value: 'CAPEC-153', label: 'CAPEC-153' },
      { value: 'CAPEC-167', label: 'CAPEC-167' },
      { value: 'CAPEC-169', label: 'CAPEC-169' },
      { value: 'CAPEC-183', label: 'CAPEC-183' },
      { value: 'CAPEC-197', label: 'CAPEC-197' },
      { value: 'CAPEC-215', label: 'CAPEC-215' },
      { value: 'CAPEC-221', label: 'CAPEC-221' },
      { value: 'CAPEC-227', label: 'CAPEC-227' },
      { value: 'CAPEC-230', label: 'CAPEC-230' },
      { value: 'CAPEC-231', label: 'CAPEC-231' },
      { value: 'CAPEC-233', label: 'CAPEC-233' },
      { value: 'CAPEC-242', label: 'CAPEC-242' },
      { value: 'CAPEC-253', label: 'CAPEC-253' },
      { value: 'CAPEC-268', label: 'CAPEC-268' },
      { value: 'CAPEC-28', label: 'CAPEC-28' },
      { value: 'CAPEC-460', label: 'CAPEC-460' },
      { value: 'CAPEC-469', label: 'CAPEC-469' },
      { value: 'CAPEC-49', label: 'CAPEC-49' },
      { value: 'CAPEC-588', label: 'CAPEC-588' },
      { value: 'CAPEC-591', label: 'CAPEC-591' },
      { value: 'CAPEC-592', label: 'CAPEC-592' },
      { value: 'CAPEC-600', label: 'CAPEC-600' },
      { value: 'CAPEC-61', label: 'CAPEC-61' },
      { value: 'CAPEC-650', label: 'CAPEC-650' },
      { value: 'CAPEC-66', label: 'CAPEC-66' },
      { value: 'CAPEC-664', label: 'CAPEC-664' },
      { value: 'CAPEC-676', label: 'CAPEC-676' },
      { value: 'CAPEC-86', label: 'CAPEC-86' },
      { value: 'CAPEC-87', label: 'CAPEC-87' },
      { value: 'CAPEC-88', label: 'CAPEC-88' },
      { value: '__none__', label: 'None' },
    ],
    default: false,
  },
  {
    name: 'owasp_category',
    label: 'OWASP API Top 10 2021',
    type: 'string',
    description:
      'OWASP category from the classification taxonomy in external format (e.g., A03:2021). One row per category when an attack has multiple. Empty when the taxonomy has no match.',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'A01:2021', label: 'A01:2021' },
      { value: 'A03:2021', label: 'A03:2021' },
      { value: 'A04:2021', label: 'A04:2021' },
      { value: 'A05:2021', label: 'A05:2021' },
      { value: 'A07:2021', label: 'A07:2021' },
      { value: 'A08:2021', label: 'A08:2021' },
      { value: 'A10:2021', label: 'A10:2021' },
    ],
    default: false,
  },
  {
    name: 'mark',
    label: 'Verification Status',
    type: 'string',
    description:
      'Attack vector mark — tp (true positive), fp (false positive), or empty (unmarked)',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'tp', label: 'True Positive' },
      { value: 'fp', label: 'False Positive' },
      { value: '', label: 'Unmarked' },
    ],
    default: false,
  },
  {
    name: 'security_issue_id',
    label: 'Security Issue',
    type: 'string',
    description:
      'Security issue binding — filter by specific issue ID, or use default to hide bound vectors',
    operators: ['=', '!=', 'in'],
    options: [],
    default: true,
  },
  {
    name: 'status',
    label: 'Blocking Status',
    type: 'string',
    description: 'Blocking status: Monitoring, Blocked, or Partially Blocked',
    operators: ['=', '!=', 'in'],
    options: [
      { value: 'Monitoring', label: 'Monitoring' },
      { value: 'Blocked', label: 'Blocked' },
      { value: 'Partially Blocked', label: 'Partially Blocked' },
    ],
    default: true,
  },
  {
    name: 'aasm_event',
    label: 'AASM Event',
    type: 'string',
    description: "Whether the attack vector originated from Wallarm's AASM scanner",
    operators: ['=', '!='],
    options: [
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ],
    default: false,
  },
  {
    name: 'wallarm_scanner',
    label: 'Wallarm Scanner',
    type: 'string',
    description:
      'Whether the attack vector originated from Wallarm scanner traffic (X-WALLARM-SCANNER-INFO header or nil-client whitelist IP)',
    operators: ['=', '!='],
    options: [
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ],
    default: false,
  },
  {
    name: 'experimental',
    label: 'Experimental',
    type: 'string',
    description:
      'Show requests whose vectors came from experimental detection rules (true) or only production rules (false)',
    operators: ['=', '!='],
    options: [
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ],
    default: false,
  },
  {
    name: 'stamp_id',
    label: 'Stamp ID',
    type: 'integer',
    description:
      "Filter by the numeric ID of a specific detection stamp present in the group's vectors",
    operators: ['=', '!=', 'in'],
    options: [],
    default: false,
  },
  {
    name: 'known',
    label: 'Known Attack',
    type: 'string',
    description:
      'Filter requests whose vectors match a known-attack rule (CVE or generic). Use false to exclude all known-attack matches',
    operators: ['=', '!='],
    options: [
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ],
    default: false,
  },
  {
    name: 'known_false',
    label: 'Known False',
    type: 'string',
    description:
      "Filter requests whose vectors carry a known-false classification (excluding the 'NOT FILLED' sentinel)",
    operators: ['=', '!='],
    options: [
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ],
    default: false,
  },
  {
    name: 'mitigation_control_id',
    label: 'Mitigation Control ID',
    type: 'string',
    description: 'Identifier of the mitigation control applied',
    operators: ['=', '!=', 'in'],
    options: [],
    default: false,
  },
  {
    name: 'payload_search',
    label: 'Attack Payload Content',
    type: 'string',
    description:
      'Case-insensitive full-text search across the request and response body, URL query string, and request and response header values (glob masks supported: * and ?)',
    operators: ['=', '!='],
    options: [],
    default: false,
  },
  {
    name: 'parameter_search',
    label: 'Parameter Search',
    type: 'string',
    description:
      'Case-insensitive full-text search across attack parameters (glob masks supported: * and ?)',
    operators: ['=', '!='],
    options: [],
    default: false,
  },
  {
    name: 'context_param',
    label: 'Context Parameter',
    type: 'key_value',
    description:
      'Filter attacks by a session context parameter — pick the parameter by name, then match its value (= / != / in, glob masks supported) or filter by name presence (is_empty / is_not_empty)',
    operators: ['in', '=', '!=', 'is_empty', 'is_not_empty'],
    options: [],
    key_value: {
      key_label: 'Parameter',
      value_label: 'Value',
      key_options: [
        { value: 'USER-AGENT', label: 'USER-AGENT' },
        { value: 'X-WALLARMAPI-UUID', label: 'X-WALLARMAPI-UUID' },
        { value: 'REFERER', label: 'REFERER' },
        { value: 'X-FORWARDED-HOST', label: 'X-FORWARDED-HOST' },
        { value: 'ORIGIN', label: 'ORIGIN' },
        { value: 'X-WALLARMAPI-TOKEN', label: 'X-WALLARMAPI-TOKEN' },
        { value: 'COOKIE', label: 'COOKIE' },
        { value: 'wsess', label: 'wsess' },
        { value: 'X-ORIGINAL-URL', label: 'X-ORIGINAL-URL' },
        { value: 'X-REWRITE-URL', label: 'X-REWRITE-URL' },
        { value: 'password', label: 'password' },
        { value: 'username', label: 'username' },
        { value: 'method', label: 'method' },
        { value: 'id', label: 'id' },
        { value: 'jsonrpc', label: 'jsonrpc' },
        { value: 'MCP-SESSION-ID', label: 'MCP-SESSION-ID' },
        { value: 'url', label: 'url' },
        { value: 'pass', label: 'pass' },
        { value: 'login', label: 'login' },
        { value: 'email', label: 'email' },
        { value: 'user', label: 'user' },
        { value: 'PHPSESSID', label: 'PHPSESSID' },
        { value: 'filename', label: 'filename' },
        { value: 'JSESSIONID', label: 'JSESSIONID' },
        { value: 'pwd', label: 'pwd' },
        { value: 'userid', label: 'userid' },
        { value: 'sessionid', label: 'sessionid' },
        { value: 'location', label: 'location' },
        { value: 'passwd', label: 'passwd' },
      ],
    },
    default: false,
  },
  {
    name: 'unique_ips',
    label: 'Unique IPs',
    type: 'integer',
    description: 'Number of unique IP addresses',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: true,
  },
  {
    name: 'unique_users',
    label: 'Unique Users',
    type: 'integer',
    description: 'Number of unique users',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: true,
  },
  {
    name: 'unique_user_roles',
    label: 'Unique User Roles',
    type: 'integer',
    description: 'Number of unique user roles',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'unique_paths',
    label: 'Unique URI Paths',
    type: 'integer',
    description: 'Number of unique request paths',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'unique_orig_sessions',
    label: 'Unique Sessions',
    type: 'integer',
    description: 'Number of unique original sessions',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'unique_endpoints',
    label: 'Unique API Entries',
    type: 'integer',
    description: 'Number of unique endpoints',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: true,
  },
  {
    name: 'unique_status_codes',
    label: 'Unique Status Codes',
    type: 'integer',
    description: 'Number of unique status codes',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'unique_parameters',
    label: 'Unique Attacked Parameters',
    type: 'integer',
    description: 'Number of unique parameters (length of parameter_values array)',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'requests_count',
    label: 'Total Requests',
    type: 'integer',
    description: 'Number of unique HTTP requests in the group',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: true,
  },
  {
    name: 'blocked_count',
    label: 'Blocked Requests',
    type: 'integer',
    description: 'Number of blocked requests',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: true,
  },
  {
    name: 'success_count',
    label: 'Successful Requests',
    type: 'integer',
    description: 'Number of unique requests with a 2xx response (per request_id)',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'attack_vectors_count',
    label: 'Number of Attack Vectors',
    type: 'integer',
    description: 'Total attack vectors detected (one row per attack signature × hit)',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'response_size_sum',
    label: 'Total Response Payload Bytes',
    type: 'integer',
    description: 'Total sum of response sizes in bytes',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'request_size_sum',
    label: 'Total Request Body Bytes',
    type: 'integer',
    description: 'Total sum of request sizes in bytes',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'response_time_avg',
    label: 'Avg Response Time',
    type: 'float',
    description: 'Average response time in milliseconds',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'response_time_max',
    label: 'Max Response Time',
    type: 'float',
    description: 'Maximum response time in milliseconds',
    operators: ['=', '!=', '>', '<', '>=', '<='],
    options: [],
    default: false,
  },
  {
    name: 'uri_length',
    label: 'URI Length',
    type: 'integer',
    description: 'Length of the request path in characters',
    operators: ['=', '!=', '>', '<', '>=', '<=', 'in'],
    options: [],
    default: false,
  },
];
