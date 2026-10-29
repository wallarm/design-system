/**
 * Condition types and builders for Point Selector
 */

import type { ConditionType, RuleContext } from './types';

/**
 * Available condition types with labels
 * [type, label, description]
 */
export const CONDITIONS: readonly (readonly [ConditionType, string, string])[] = [
  ['equal', 'equals', 'Exact match'],
  ['nequal', 'does not equal', 'Not this value'],
  ['contains', 'contains', 'Has this substring'],
  ['startswith', 'starts with', 'Begins with this prefix'],
  ['endswith', 'ends with', 'Ends with this suffix'],
  ['regexp', 'matches pattern', 'Regular expression match'],
  ['nregexp', 'does not match pattern', 'Regular expression non-match'],
  ['exists', 'exists', 'Point has a value'],
  ['absent', 'is absent', 'Point has no value'],
];

/**
 * Get human-readable label for condition type
 */
export function conditionLabel(type: ConditionType): string {
  const found = CONDITIONS.find(([t]) => t === type);
  return found ? found[1] : type;
}

/**
 * Check if condition type requires a value input
 */
export function takesValue(type: ConditionType): boolean {
  return type !== 'exists' && type !== 'absent';
}

/**
 * Build check object for proton ruleset
 */
export interface PointCheckResult {
  type: ConditionType;
  context: RuleContext;
  point: string;
  value?: string;
  case_sensitive?: boolean;
}

export function checkOf(
  type: ConditionType,
  value: string,
  caseSensitive: boolean,
  point: string,
  context: RuleContext,
): PointCheckResult {
  const check: PointCheckResult = {
    type,
    context,
    point,
  };

  if (takesValue(type)) {
    check.value = value;
    // Only include case_sensitive if false (true is default)
    if (!caseSensitive) {
      check.case_sensitive = false;
    }
  }

  return check;
}
