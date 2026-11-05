/**
 * Check Types
 *
 * All check types and their discriminated union.
 * From b.rules-framework.md §4
 */

import type { RuleContext } from '../ui';

/**
 * All check types (16 total)
 *
 * Byte checks (9): exists, absent, equal, nequal, startswith, endswith, contains, regexp, nregexp
 * Signal checks (6): attack_present, attack_absent, tag_present, tag_absent, signal_present, signal_absent
 * Sampling check (1): sample (format 0.10.2+)
 */
export type CheckType =
  // Point existence
  | 'exists'
  | 'absent'
  // Value matching
  | 'equal'
  | 'nequal'
  | 'startswith'
  | 'endswith'
  | 'contains'
  | 'regexp'
  | 'nregexp'
  // Signal checks
  | 'attack_present'
  | 'attack_absent'
  | 'tag_present'
  | 'tag_absent'
  | 'signal_present'
  | 'signal_absent'
  // Sampling (format 0.10.2+)
  | 'sample';

/**
 * Target for action
 */
export interface Target {
  context: RuleContext;
  /** Either "flow" or a point pattern */
  point: string;
}

/**
 * Attack filter for attack_present/absent checks and suppress/mark actions
 *
 * From b.rules-framework.md §4b "What an attack carries":
 * Every attack has attack_type and source, with source-specific data.
 */
export interface AttackFilter {
  attack_type?: string | string[];
  source?: 'rule' | 'stamp' | 'xml' | 'json' | 'gzip' | 'deflate' | 'brotli' | 'zip';
  stamp_ids?: number[];
  rule_ids?: string | string[];

  // Format 0.10.3+ (requires "source": "xml")
  // XML parser attack properties
  property?: string | string[]; // 'dtd' | 'xinclude' | 'stylesheet' | 'xslt' | 'schema' | 'xml_base'
  reference?: {
    operator: 'equal' | 'startswith' | 'regex';
    value: string | string[];
  };

  // Labels (for filtering attacks that have these labels)
  known?: {
    cve?: string | string[];
    vuln?: string | string[];
    technique?: string | string[];
    payload?: string | string[];
  };
  known_false?: string | string[];
}

/**
 * Tag filter for tag_present/absent checks
 */
export interface TagFilter {
  key?: string;
  value?: string;
}

/**
 * Signal filter for signal_present/absent checks
 */
export interface SignalFilter {
  signal_type: 'key_duplicate' | 'resource_overlimit';
  key?: string; // Needs "signal_type": "key_duplicate" - single star key segment
  limit?: string | string[]; // Needs "signal_type": "resource_overlimit"
}

/**
 * Point-based check (most check types)
 * Has context and point
 *
 * IMPORTANT: Format 0.10.0 uses bind_target; format 0.10.1+ uses bind_point
 * The TypeScript type here uses bind_point as the canonical field name.
 * Validation and serialization logic must handle the format-specific naming.
 */
export interface PointCheck {
  type: Exclude<CheckType, 'sample'>;
  context: RuleContext;
  point: string | string[];

  // Value matching (for value-based checks)
  value?: string | string[];
  value_encoded_b64?: string | string[];
  value_decoded_ref?: string;
  case_sensitive?: boolean;

  // Signal filters (for signal checks)
  attack?: AttackFilter;
  tag?: TagFilter;
  signal?: SignalFilter;

  // Binding
  // Format 0.10.1+: bind_point
  // Format 0.10.0: bind_target (handle in migration/validation)
  bind_point?: string;
  bind_attack?: string;
}

/**
 * Pairing check (format 0.10.1+)
 * Uses point_ref to reference a bound point instead of context+point
 *
 * From b.rules-framework.md §4b:
 * A pairing check takes point_ref in place of both context and point.
 * It operates on nodes matched by a check with bind_point.
 */
export interface PairingCheck {
  type: 'exists' | 'equal' | 'startswith' | 'endswith' | 'contains' | 'regexp';

  // Reference to bound point (NO context, NO point)
  point_ref: string;
  point_role?: 'name' | 'value';

  // Value matching (same as point checks)
  value?: string | string[];
  value_encoded_b64?: string | string[];
  value_decoded_ref?: string;
  case_sensitive?: boolean;

  // Binding (pairing checks can also bind)
  bind_point?: string;
}

/**
 * Sample check (format 0.10.2+)
 * NO context, NO point, NO value, NO filter, NO bind
 *
 * From b.rules-framework.md §4:
 * Samples a percentage of flows (probabilistic execution).
 */
export interface SampleCheck {
  type: 'sample';
  /** Percentage (0, 100] */
  percent: number;
}

/**
 * Discriminated union of all check types
 *
 * Example point check:
 * {
 *   "type": "contains",
 *   "context": "http_request",
 *   "point": "[http:body][format:json]['email']",
 *   "value": "@example.com"
 * }
 *
 * Example pairing check (0.10.1+):
 * {
 *   "type": "equal",
 *   "point_ref": "uid",
 *   "point_role": "value",
 *   "value": "admin"
 * }
 *
 * Example sample check (0.10.2+):
 * {
 *   "type": "sample",
 *   "percent": 10
 * }
 */
export type CheckNode = PointCheck | PairingCheck | SampleCheck;

// Type guards

/**
 * Check if node is a point check (has context and point)
 */
export function isPointCheck(check: CheckNode): check is PointCheck {
  return 'context' in check && 'point' in check;
}

/**
 * Check if node is a pairing check (has point_ref)
 */
export function isPairingCheck(check: CheckNode): check is PairingCheck {
  return 'point_ref' in check;
}

/**
 * Check if node is a sample check
 */
export function isSampleCheck(check: CheckNode): check is SampleCheck {
  return check.type === 'sample';
}
