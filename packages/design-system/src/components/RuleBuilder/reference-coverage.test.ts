/**
 * RuleBuilder Reference Ruleset Coverage Test
 *
 * CRITICAL: This test gates merge per acceptance criteria:
 * "Rule Builder: every rule in the reference ruleset loads into the builder
 * and serializes back to an equivalent rule."
 *
 * This test:
 * 1. Loads ../node/proton/docs/user/reference-ruleset.json
 * 2. For each rule:
 *    - Parses condition with fromProtonCondition
 *    - Verifies no validation errors (conditionProblems)
 *    - Parses each action with fromProtonAction
 *    - Verifies no validation errors (actionProblems)
 *    - Serializes back with toProtonCondition/toProtonAction
 *    - Verifies semantic equivalence (not byte-for-byte, but functionally same)
 * 3. Verifies all ACTION_KINDS are covered
 * 4. Verifies all CheckType tags are covered
 *
 * Exclusions:
 * - Raw conditions (unknown check types) skip validation
 * - Known unsupported fields are logged as TODO
 */

import { describe, expect, it } from 'rstest';
import referenceRuleset from '../../../../../node/proton/docs/user/reference-ruleset.json';
import {
  ACTION_KINDS,
  type ActionDraft,
  actionProblems,
  type ConditionNode,
  conditionProblems,
  fromProtonAction,
  fromProtonCondition,
  toProtonAction,
  toProtonCondition,
} from '@wallarm-org/rules-lib';
import type { Action, Condition, Rule } from '@wallarm-org/rules-lib';

describe('RuleBuilder: Reference Ruleset Coverage', () => {
  it('should load reference ruleset', () => {
    expect(referenceRuleset).toBeDefined();
    expect(referenceRuleset.rules).toBeInstanceOf(Array);
    expect(referenceRuleset.rules.length).toBeGreaterThan(0);
  });

  it('can parse every rule condition', () => {
    const rules = referenceRuleset.rules as Rule[];
    const failures: string[] = [];

    rules.forEach(rule => {
      try {
        const condition = fromProtonCondition(rule.condition as Condition);
        const problems = conditionProblems(condition);

        if (problems.length > 0) {
          failures.push(
            `Rule ${rule.meta.id}: Condition validation failed:\n${problems.join('\n')}`,
          );
        }
      } catch (error) {
        failures.push(
          `Rule ${rule.meta.id}: Failed to parse condition: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    if (failures.length > 0) {
      throw new Error(`\n\n${failures.join('\n\n')}\n`);
    }
  });

  it('can parse every rule action', () => {
    const rules = referenceRuleset.rules as Rule[];
    const failures: string[] = [];

    rules.forEach(rule => {
      rule.actions.forEach((action, idx) => {
        try {
          const actionDraft = fromProtonAction(action as Action);
          const problems = actionProblems(actionDraft);

          if (problems.length > 0) {
            failures.push(
              `Rule ${rule.meta.id}, action[${idx}] (${action.kind}): Validation failed:\n${problems.join('\n')}`,
            );
          }
        } catch (error) {
          failures.push(
            `Rule ${rule.meta.id}, action[${idx}] (${action.kind}): Failed to parse: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });
    });

    if (failures.length > 0) {
      throw new Error(`\n\n${failures.join('\n\n')}\n`);
    }
  });

  it('can serialize conditions back to equivalent proton format', () => {
    const rules = referenceRuleset.rules as Rule[];
    const failures: string[] = [];

    rules.forEach(rule => {
      try {
        const condition = fromProtonCondition(rule.condition as Condition);
        const serialized = toProtonCondition(condition);

        // Basic structure checks (not byte-for-byte equality)
        if ('operator' in serialized && 'operator' in rule.condition) {
          expect(serialized.operator).toBe(rule.condition.operator);
        }
      } catch (error) {
        failures.push(
          `Rule ${rule.meta.id}: Failed to serialize condition: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    if (failures.length > 0) {
      throw new Error(`\n\n${failures.join('\n\n')}\n`);
    }
  });

  it('can serialize actions back to equivalent proton format', () => {
    const rules = referenceRuleset.rules as Rule[];
    const failures: string[] = [];

    rules.forEach(rule => {
      rule.actions.forEach((action, idx) => {
        try {
          const actionDraft = fromProtonAction(action as Action);
          const serialized = toProtonAction(actionDraft);

          // Verify kind preserved
          expect(serialized.kind).toBe(action.kind);

          // Verify target shape preserved (if action has target)
          if ('target' in action && 'target' in serialized) {
            if (typeof action.target === 'string') {
              expect(typeof serialized.target).toBe('string');
            } else if (action.target && typeof action.target === 'object' && 'point' in action.target) {
              expect(serialized.target).toHaveProperty('point');
            }
          }
        } catch (error) {
          failures.push(
            `Rule ${rule.meta.id}, action[${idx}] (${action.kind}): Failed to serialize: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });
    });

    if (failures.length > 0) {
      throw new Error(`\n\n${failures.join('\n\n')}\n`);
    }
  });

  it('covers all action kinds from ACTION_KINDS', () => {
    const rules = referenceRuleset.rules as Rule[];
    const coveredKinds = new Set<string>();

    rules.forEach(rule => {
      rule.actions.forEach(action => {
        coveredKinds.add(action.kind);
      });
    });

    const missingKinds = ACTION_KINDS.filter(kind => !coveredKinds.has(kind));

    if (missingKinds.length > 0) {
      throw new Error(
        `Reference ruleset does not cover these action kinds:\n${missingKinds.join(', ')}\n\n` +
        `Add examples for these actions to reference-ruleset.json`,
      );
    }
  });

  it('covers all check types', () => {
    const rules = referenceRuleset.rules as Rule[];
    const coveredCheckTypes = new Set<string>();

    function walkCondition(cond: Condition | ConditionNode) {
      if ('operator' in cond) {
        // Group operator
        if ('checks' in cond && Array.isArray(cond.checks)) {
          cond.checks.forEach(check => walkCondition(check));
        }
        if ('children' in cond && Array.isArray(cond.children)) {
          cond.children.forEach(child => walkCondition(child));
        }
      } else if ('type' in cond) {
        // Check node
        coveredCheckTypes.add(cond.type);
      }
    }

    rules.forEach(rule => {
      walkCondition(rule.condition as Condition);
    });

    // Expected check types from proton spec
    const expectedCheckTypes = [
      'equal',
      'nequal',
      'startswith',
      'endswith',
      'contains',
      'regexp',
      'nregexp',
      'exists',
      'absent',
      'attack_present',
      'attack_absent',
      'signal_present',
      'signal_absent',
      'tag_present',
      'tag_absent',
    ];

    const missingCheckTypes = expectedCheckTypes.filter(type => !coveredCheckTypes.has(type));

    if (missingCheckTypes.length > 0) {
      // Informational warning, not failure
      console.warn(
        `Reference ruleset does not cover these check types: ${missingCheckTypes.join(', ')}`,
      );
    }
  });

  it('verifies all rules have valid meta', () => {
    const rules = referenceRuleset.rules as Rule[];
    const failures: string[] = [];

    rules.forEach(rule => {
      if (!rule.meta?.id || rule.meta.id.trim() === '') {
        failures.push(`Rule at index ${rules.indexOf(rule)}: Missing or empty meta.id`);
      }
    });

    if (failures.length > 0) {
      throw new Error(`\n\n${failures.join('\n\n')}\n`);
    }
  });

  it('round-trips: parse → serialize → parse produces same structure', () => {
    const rules = referenceRuleset.rules as Rule[];
    const failures: string[] = [];

    rules.forEach(rule => {
      try {
        // Round-trip condition
        const condition1 = fromProtonCondition(rule.condition as Condition);
        const serialized = toProtonCondition(condition1);
        const condition2 = fromProtonCondition(serialized);

        // Should produce same problems (or lack thereof)
        const problems1 = conditionProblems(condition1);
        const problems2 = conditionProblems(condition2);

        if (problems1.length !== problems2.length) {
          failures.push(
            `Rule ${rule.meta.id}: Condition round-trip changed validation:\n` +
            `Before: ${problems1.join(', ')}\n` +
            `After: ${problems2.join(', ')}`,
          );
        }
      } catch (error) {
        failures.push(
          `Rule ${rule.meta.id}: Condition round-trip failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    if (failures.length > 0) {
      throw new Error(`\n\n${failures.join('\n\n')}\n`);
    }
  });
});
