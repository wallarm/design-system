import type React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterInput } from '../FilterInput';
import type { ExprNode, FieldMetadata } from '../types';

const meta = {
  title: 'Patterns/FilterInput',
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
      { value: 'sess_abc123def456', label: 'sess_abc123def456' },
      { value: 'sess_789ghi012jkl', label: 'sess_789ghi012jkl' },
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
 * Complete working filter component with autocomplete, parsing, and chip creation.
 * Just pass fields config and it works automatically!
 * Click to see field menu, select field → operator → value to create chips.
 */
export const Default: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>(null);

    return (
      <>
        <FilterInput
          fields={attackFields}
          value={expression}
          onChange={expr => {
            console.log('Expression changed:', expr);
            setExpression(expr);
          }}
          placeholder='Type to filter attacks...'
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
