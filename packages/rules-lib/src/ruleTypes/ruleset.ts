/**
 * Ruleset Types
 *
 * Top-level ruleset format definitions.
 * From b.rules-framework.md §2
 */

import type { Rule } from './rule';

/**
 * Ruleset format version
 *
 * What each format adds (b.rules-framework.md §2):
 * - 0.10.0: Base format. Checks use bind_target (not bind_point).
 * - 0.10.1: Adds point_ref/point_role for pairing checks. Renames bind_target → bind_point.
 * - 0.10.2: Adds sample check and parser control actions (disable_parsers, allow_parsers, force_parser).
 * - 0.10.3: Adds attack filter's property/reference fields and zip source.
 */
export type RulesetFormatVersion = '0.10.0' | '0.10.1' | '0.10.2' | '0.10.3';

/**
 * Ruleset metadata
 */
export interface RulesetMeta {
  /** Schema version - must be "0.10.0", "0.10.1", "0.10.2", or "0.10.3" */
  format: RulesetFormatVersion;
  /** Arbitrary label for the ruleset version */
  revision?: string;
}

/**
 * Complete ruleset document
 */
export interface Ruleset {
  /** Ruleset-level metadata */
  meta: RulesetMeta;
  /** Array of rule objects (may be empty) */
  rules: Rule[];
}
