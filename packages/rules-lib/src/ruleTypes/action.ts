/**
 * Action Types
 *
 * All action types and their field-by-field definitions.
 * From b.rules-framework-actions.md
 */

import type { AttackFilter, Target } from './check';

/**
 * All action types (12 total)
 *
 * Signal actions (4): add_attack, add_tag, suppress_attack, mark_attack
 * Data processing (4): combine, processing_time_limit, processing_space_limit, entry_limits
 * Parser control (3, format 0.10.2+): disable_parsers, allow_parsers, force_parser
 * Rule control (1): disable_rule
 */
export type ActionType =
  // Signal creation
  | 'add_attack'
  | 'add_tag'
  // Signal modification
  | 'suppress_attack'
  | 'mark_attack'
  // Data processing
  | 'combine'
  | 'processing_time_limit'
  | 'processing_space_limit'
  | 'entry_limits'
  // Parser control (format 0.10.2+)
  | 'disable_parsers'
  | 'allow_parsers'
  | 'force_parser'
  // Rule control
  | 'disable_rule';

/**
 * Attack payload for add_attack action
 */
export interface AttackPayload {
  attack_type: string;
  comment?: string;
}

/**
 * Tag payload for add_tag action
 */
export interface TagPayload {
  key: string;
  value: string;
}

/**
 * Known labels for add_attack and mark_attack
 */
export interface KnownLabels {
  cve?: string | string[];
  vuln?: string | string[];
  technique?: string | string[];
  payload?: string | string[];
}

/**
 * Action definition
 *
 * Each action is discriminated by its action_type.
 * See b.rules-framework-actions.md for field-by-field reference.
 */
export interface Action {
  action_type: ActionType;

  // Targeting (all actions EXCEPT disable_rule)
  // Exactly one of: target, target_ref, or (for suppress/mark only) attack_ref
  target?: Target[];
  target_ref?: string;
  attack_ref?: string; // suppress_attack, mark_attack only
  target_role?: 'value' | 'name'; // Only with target_ref (except parser actions)

  // Signal creation
  attack?: AttackPayload; // add_attack
  tag?: TagPayload; // add_tag

  // Labels (add_attack, mark_attack)
  known?: KnownLabels;
  known_false?: string | string[];
  experimental?: boolean; // add_attack, add_tag, mark_attack

  // Filters
  attack_filter?: AttackFilter; // suppress_attack, mark_attack (alias: attack)

  // Processing limits
  // IMPORTANT: In JSON, limit/soft_limit_bytes/hard_limit_bytes are k8s-style quantity STRINGS
  // (e.g., "1Mi", "512Ki", "1048576"). The TypeScript type here uses string for accuracy.
  // limit_us is a plain number (microseconds).
  limit_us?: number; // processing_time_limit (microseconds, plain number)
  limit?: string; // processing_space_limit (k8s-style quantity string, e.g., "1Mi")
  soft_limit_bytes?: string; // entry_limits (k8s-style quantity string)
  hard_limit_bytes?: string; // entry_limits (k8s-style quantity string)

  // Combine action
  key?: string; // combine (single-key field)
  separator?: string; // combine

  // Parser control (format 0.10.2+)
  parsers?: string | string[]; // disable_parsers, allow_parsers ("all" or list of parser names)
  parser?: string; // force_parser (single parser name)

  // Rule control
  rule_ids?: string[]; // disable_rule (list of rule meta.id values)

  // Execution control (priority field from b.rules-framework-actions.md §10)
  // CRITICAL: This field controls execution order for certain actions.
  // Used by: processing_time_limit, processing_space_limit, entry_limits,
  //          disable_parsers, allow_parsers, force_parser
  // Range: signed 64-bit integer in JSON (TypeScript number is safe for ±2^53)
  // Default: 0 (when omitted)
  // Higher priority actions execute before lower priority ones.
  priority?: number;
}
