/**
 * Condition Types
 *
 * Condition tree structure (operators and checks).
 * From b.rules-framework.md §3
 */

import type { CheckNode } from './check';

/**
 * Operator type
 */
export type OperatorType = 'and' | 'or' | 'not';

/**
 * Operator node - combines child conditions
 *
 * Rules:
 * - 'and' and 'or': can have multiple children
 * - 'not': must have exactly one child
 */
export interface OperatorNode {
  /** Operator type (defaults to 'and' if omitted) */
  operator?: OperatorType;
  /** Non-empty array of child conditions */
  checks: Condition[];
}

/**
 * Condition - either an operator node or a check node
 *
 * Discriminated by presence of 'type' field:
 * - Has 'type': CheckNode
 * - No 'type' (but has 'checks'): OperatorNode
 */
export type Condition = OperatorNode | CheckNode;
