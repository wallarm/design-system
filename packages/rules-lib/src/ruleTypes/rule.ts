/**
 * Rule Types
 *
 * Individual rule structure.
 * From b.rules-framework.md §2
 */

import type { Action } from './action';
import type { Condition } from './condition';

/**
 * Rule metadata
 */
export interface RuleMeta {
  /**
   * The producing platform's rule identity.
   * Any non-empty JSON string, carried verbatim.
   * Used by disable_rule to resolve victims by id.
   */
  id: string;
  /** Human-readable description */
  desc?: string;
}

/**
 * Rule scope - limits rule to specific traffic
 *
 * From b.rule-scope.md:
 * A rule's scope limits it to part of the traffic before any data arrives.
 * Omit scope to apply rule to every flow.
 */
export interface RuleScope {
  /**
   * Application identifier (opaque string).
   * Proton compares its bytes case-sensitively with no normalization.
   */
  application_id: string;
}

/**
 * Complete rule definition
 */
export interface Rule {
  /** Rule metadata (id is required, desc is optional) */
  meta: RuleMeta;
  /** Which flows the rule applies to (omit for all flows) */
  scope?: RuleScope;
  /** Condition tree (omit for unconditional rule) */
  condition?: Condition;
  /** Non-empty array of action objects */
  action: Action[];
}
