/**
 * Rule Validation
 *
 * Validate rules against format version and structural requirements.
 * From b.rules-framework.md and b.rules-framework-actions.md
 */

import type { Rule, RulesetMeta } from '../ruleTypes';

/**
 * Validation error
 */
export interface ValidationError {
  /** JSON path to error (e.g., "rules[0].condition.checks[1]") */
  path: string;
  /** Error description */
  message: string;
  /** Error severity */
  severity: 'error' | 'warning';
}

/**
 * Validate rule against format version and structural requirements
 *
 * Validates:
 * - Meta validation (id must be non-empty)
 * - Action validation (at least one action required)
 * - Condition validation (if present)
 * - Check validation (context, point, value requirements)
 * - Action validation (type-specific fields)
 * - Cross-rule validation (bindings, references)
 * - Format version feature gates
 *
 * @param rule - Rule to validate
 * @param format - Ruleset format version
 * @returns Array of validation errors (empty if valid)
 *
 * TODO (Phase 1, Task 1.2): Implement full validation logic
 * See RULES_UI_IMPLEMENTATION_PLAN.md Task 3.4 for complete validation rules
 */
export function validateRule(rule: Rule, format: RulesetMeta['format']): ValidationError[] {
  const errors: ValidationError[] = [];

  // TODO: Implement full validation
  // For now, just basic checks as placeholder

  // Meta validation
  if (!rule.meta.id || rule.meta.id.trim() === '') {
    errors.push({
      path: 'meta.id',
      message: 'Rule id must be non-empty',
      severity: 'error',
    });
  }

  // Action validation
  if (!rule.action || rule.action.length === 0) {
    errors.push({
      path: 'action',
      message: 'Rule must have at least one action',
      severity: 'error',
    });
  }

  return errors;
}
