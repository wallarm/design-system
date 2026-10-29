/**
 * RuleBuilder Constants
 *
 * Choice lists and constant values for RuleBuilder UI.
 */

import type { ActionKind, Choice } from '../types';

/**
 * Operator choices for condition groups.
 */
export const OPERATOR_CHOICES: Choice[] = [
  { value: 'and', label: 'All of', description: 'Every condition must be true' },
  { value: 'or', label: 'Any of', description: 'At least one condition must be true' },
  { value: 'not', label: 'None of', description: 'No condition must be true' },
];

/**
 * Action type choices in menu order.
 */
export const ACTION_KIND_CHOICES: Choice[] = [
  { value: 'add_attack', label: 'Mark the request as an attack' },
  { value: 'add_tag', label: 'Tag the request' },
  { value: 'suppress_attack', label: 'Ignore detected attacks' },
  { value: 'mark_attack', label: 'Report detected attacks without blocking' },
  { value: 'combine', label: 'Join repeated keys into one value' },
  { value: 'processing_time_limit', label: 'Limit processing time' },
  { value: 'processing_space_limit', label: 'Limit processing memory' },
  { value: 'entry_limits', label: 'Limit the size of values' },
  { value: 'disable_parsers', label: 'Disable specific parsers' },
  { value: 'allow_parsers', label: 'Allow only specific parsers' },
  { value: 'force_parser', label: 'Force a specific parser' },
  { value: 'disable_rule', label: 'Disable other rules' },
];

/**
 * Signal type choices.
 */
export const SIGNAL_TYPE_CHOICES: Choice[] = [
  {
    value: 'key_duplicate',
    label: 'Duplicate keys',
    description: 'Same key appears multiple times',
  },
  {
    value: 'resource_overlimit',
    label: 'Resource limit exceeded',
    description: 'Processing limits exceeded',
  },
];

/**
 * Check type choices (for FieldCondition).
 * These map to PointSelector's condition types.
 */
export const CHECK_TYPE_CHOICES: Choice[] = [
  { value: 'equal', label: 'equals' },
  { value: 'nequal', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'startswith', label: 'starts with' },
  { value: 'endswith', label: 'ends with' },
  { value: 'regexp', label: 'matches regex' },
  { value: 'nregexp', label: 'does not match regex' },
  { value: 'exists', label: 'exists' },
  { value: 'absent', label: 'is absent' },
];

/**
 * Context choices (request/response).
 */
export const CONTEXT_CHOICES: Choice[] = [
  { value: 'http_request', label: 'Request' },
  { value: 'http_response', label: 'Response' },
  { value: 'grpc_request', label: 'gRPC Request' },
  { value: 'grpc_response', label: 'gRPC Response' },
];

/**
 * Duplicate container choices for signal conditions.
 */
export const DUPLICATE_CONTAINERS: Choice[] = [
  { value: '[http:header]', label: 'HTTP headers' },
  { value: '[http:query]', label: 'Query parameters' },
  { value: '[http:form]', label: 'Form data' },
  { value: '[http:cookie]', label: 'Cookies' },
];

/**
 * Resource limit choices for signal conditions.
 * Per spec: rules-framework.md:481-486
 */
export const RESOURCE_LIMITS: Choice[] = [
  {
    value: 'processing_time_limit',
    label: 'Processing time limit',
    description: 'Microseconds allowed for processing',
  },
  {
    value: 'processing_space_limit',
    label: 'Processing space limit',
    description: 'Bytes allowed for retention',
  },
  {
    value: 'entry_size_soft_limit',
    label: 'Entry size soft limit',
    description: 'Soft size limit per entry (data keeps flowing)',
  },
  {
    value: 'entry_size_hard_limit',
    label: 'Entry size hard limit',
    description: 'Hard size limit per entry (entry cut)',
  },
];

/**
 * Which action kinds require a target specification.
 * Maps action kind to: 'flow' (whole request only), 'point' (specific point only), or 'either'.
 */
export const TARGET_REQUIREMENT: Record<ActionKind, 'flow' | 'point' | 'either'> = {
  add_attack: 'either',
  add_tag: 'either',
  suppress_attack: 'either',
  mark_attack: 'either',
  combine: 'point',
  processing_time_limit: 'flow',
  processing_space_limit: 'flow',
  entry_limits: 'point',
  disable_parsers: 'point',
  allow_parsers: 'point',
  force_parser: 'point',
  disable_rule: 'flow',
};

/**
 * Condition node kinds that can be added.
 */
export const ADDABLE_NODE_KINDS = ['field', 'attack', 'signal', 'tag', 'sample', 'group'] as const;

/**
 * Default separator for combine action.
 */
export const DEFAULT_SEPARATOR = ', ';

/**
 * Default priority value.
 */
export const DEFAULT_PRIORITY = '0';

/**
 * Parser choices for disable_parsers, allow_parsers, and force_parser actions.
 */
export const PARSER_CHOICES: Choice[] = [
  { value: 'json', label: 'JSON', description: 'JSON format parser' },
  { value: 'xml', label: 'XML', description: 'XML format parser' },
  { value: 'form', label: 'Form', description: 'URL-encoded form parser' },
  { value: 'multipart', label: 'Multipart', description: 'Multipart form data parser' },
  { value: 'cookie', label: 'Cookie', description: 'Cookie parser' },
  { value: 'auth', label: 'Auth', description: 'Authorization header parser' },
  { value: 'jwt', label: 'JWT', description: 'JWT token parser' },
  { value: 'zip', label: 'ZIP', description: 'ZIP archive parser' },
  { value: 'base64', label: 'Base64', description: 'Base64 encoding' },
  { value: 'percent', label: 'Percent', description: 'Percent encoding' },
  { value: 'utf16', label: 'UTF-16', description: 'UTF-16 encoding (format 0.10.7+)' },
  { value: 'gzip', label: 'Gzip', description: 'Gzip compression' },
  { value: 'deflate', label: 'Deflate', description: 'Deflate compression' },
  { value: 'brotli', label: 'Brotli', description: 'Brotli compression' },
];

/**
 * Attack source choices for attack condition filters.
 */
export const ATTACK_SOURCE_CHOICES: Choice[] = [
  { value: 'rule', label: 'Rule', description: 'Attack detected by a rule' },
  { value: 'stamp', label: 'Stamp', description: 'Attack detected by a stamp' },
  { value: 'xml', label: 'XML', description: 'XML parser-detected attack' },
  { value: 'gzip', label: 'Gzip', description: 'Gzip decoder-detected attack' },
  { value: 'deflate', label: 'Deflate', description: 'Deflate decoder-detected attack' },
  { value: 'brotli', label: 'Brotli', description: 'Brotli decoder-detected attack' },
  { value: 'zip', label: 'ZIP', description: 'ZIP decoder-detected attack' },
  { value: 'json', label: 'JSON', description: 'JSON parser-detected attack' },
];

/**
 * XML property choices for XML attack source filters.
 */
export const XML_PROPERTY_CHOICES: Choice[] = [
  { value: 'dtd', label: 'DTD', description: 'Document Type Definition' },
  { value: 'xinclude', label: 'XInclude', description: 'XML Inclusions' },
  { value: 'stylesheet', label: 'Stylesheet', description: 'XSLT stylesheet' },
  { value: 'xslt', label: 'XSLT', description: 'XSLT transformation' },
  { value: 'schema', label: 'Schema', description: 'XML Schema' },
  { value: 'xml_base', label: 'XML Base', description: 'xml:base attribute' },
  { value: 'parameter_entity', label: 'Parameter Entity', description: 'Parameter entity (format 0.10.4+)' },
  { value: 'entity_markup', label: 'Entity Markup', description: 'Entity markup (format 0.10.4+)' },
];
