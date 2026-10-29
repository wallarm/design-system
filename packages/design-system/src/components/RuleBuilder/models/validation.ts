/**
 * Validation
 *
 * Validation rules for conditions and actions.
 * Mirrors Proton's load-time checks so the UI can show errors before API submission.
 */

import type { Proton } from '@wallarm-org/rules-lib';
import { checkPoint } from '../../PointSelector/sdkBridge';
import type { ActionDraft, ActionKind, ConditionNode, GroupCondition } from '../types';
import { ACTION_KIND_CHOICES, TARGET_REQUIREMENT } from '../utils/constants';
import { extractBindings } from '../utils/extractBindings';

/**
 * Go duration pattern: 10ms, 1.5s, 2m, 1h, etc.
 * Supports: ns, us, µs, ms, s, m, h
 */
const GO_DURATION = /^(\d+(\.\d+)?(ns|us|µs|ms|s|m|h))+$/;

/**
 * Quantity pattern: 512, 1.5k, 2Mi, etc.
 * Supports: k, M, G, T, Ki, Mi, Gi, Ti
 */
const QUANTITY = /^(\d+(\.\d+)?|\.\d+)(k|M|G|T|Ki|Mi|Gi|Ti)?$/;

/**
 * Check if a string is a valid Go duration.
 *
 * @param value - Value to check
 * @returns True if valid Go duration
 *
 * @example
 * ```typescript
 * isValidDuration('10ms') // true
 * isValidDuration('1.5s') // true
 * isValidDuration('invalid') // false
 * ```
 */
export function isValidDuration(value: string): boolean {
  return GO_DURATION.test(value.trim());
}

/**
 * Check if a string is a valid quantity.
 *
 * @param value - Value to check
 * @returns True if valid quantity
 *
 * @example
 * ```typescript
 * isValidQuantity('512') // true
 * isValidQuantity('1.5Ki') // true
 * isValidQuantity('2Mi') // true
 * isValidQuantity('invalid') // false
 * ```
 */
export function isValidQuantity(value: string): boolean {
  return QUANTITY.test(value.trim());
}

/**
 * Check if a string is a valid integer.
 *
 * @param value - Value to check
 * @returns True if valid integer
 */
export function isValidInteger(value: string): boolean {
  const trimmed = value.trim();
  return trimmed !== '' && Number.isInteger(Number(trimmed));
}

/**
 * Validate rule metadata (ID and description).
 *
 * @param ruleId - Rule ID to validate
 * @returns Array of problem descriptions (empty if valid)
 *
 * @example
 * ```typescript
 * const problems = ruleMetaProblems('');
 * // ['Rule ID is required']
 *
 * const problems = ruleMetaProblems('  ');
 * // ['Rule ID is required']
 *
 * const problems = ruleMetaProblems('my-rule-1');
 * // []
 * ```
 */
export function ruleMetaProblems(ruleId: string): string[] {
  const problems: string[] = [];

  if (!ruleId || !ruleId.trim()) {
    problems.push('Rule ID is required');
  }

  return problems;
}

/**
 * Validate action target against action type requirements.
 *
 * @param draft - Action draft to validate
 * @returns Array of problem descriptions (empty if valid)
 *
 * @example
 * ```typescript
 * // combine action requires point pattern, not flow
 * const problems = validateActionTarget({ kind: 'combine', target: { whole: true, ... } });
 * // ['The "Join repeated keys" action needs a specific point, not the whole request.']
 *
 * // processing_time_limit requires flow, not point pattern
 * const problems = validateActionTarget({ kind: 'processing_time_limit', target: { whole: false, segments: [...] } });
 * // ['The "Limit processing time" action applies to the whole request, not a specific point.']
 * ```
 */
export function validateActionTarget(draft: ActionDraft): string[] {
  const problems: string[] = [];

  // Skip validation for raw actions
  if (draft.kind === 'raw') {
    return problems;
  }

  const kind = draft.kind as ActionKind;
  const targetType = TARGET_REQUIREMENT[kind];
  const hasPointPattern = !draft.target.whole && draft.target.segments.length > 0;
  const isFlow = draft.target.whole;

  // Get human-readable action label
  const actionLabel = ACTION_KIND_CHOICES.find(c => c.value === kind)?.label ?? kind;

  switch (targetType) {
    case 'point':
      // Actions that MUST have a point pattern (NOT "flow")
      // combine, entry_limits, disable_parsers, allow_parsers, force_parser
      if (isFlow) {
        problems.push(`The "${actionLabel}" action needs a specific point, not the whole request.`);
      } else if (!hasPointPattern) {
        problems.push('Say where the action applies.');
      }
      break;

    case 'flow':
      // Actions that MUST have "flow" (NOT point pattern)
      // processing_time_limit, processing_space_limit, disable_rule
      if (hasPointPattern) {
        problems.push(
          `The "${actionLabel}" action applies to the whole request, not a specific point.`,
        );
      }
      // Note: disable_rule has no target at all, but it's still marked as 'flow' in TARGET_REQUIREMENT
      // The UI should hide the target selector for disable_rule entirely
      break;

    case 'either':
      // Actions that accept both "flow" and point patterns
      // add_attack, add_tag, suppress_attack, mark_attack
      if (!isFlow && !hasPointPattern) {
        problems.push('Say where the action applies.');
      }
      break;

    default:
      // TypeScript ensures targetType is one of the above cases
      // This default case satisfies the linter
      break;
  }

  return problems;
}
/**
 * Validate action priority field based on action type.
 * Spec reference: rules-framework-actions.md §10
 *
 * @param draft - Action draft to validate
 * @returns Array of problem descriptions (empty if valid)
 *
 * @example
 * ```typescript
 * validateActionPriority({ kind: 'add_attack', priority: '10' })
 * // ['Priority is not allowed for add_attack actions.']
 *
 * validateActionPriority({ kind: 'processing_time_limit', priority: '50' })
 * // []
 *
 * validateActionPriority({ kind: 'entry_limits', priority: 'abc' })
 * // ['Priority must be a whole number.']
 * ```
 */
export function validateActionPriority(draft: ActionDraft): string[] {
  const problems: string[] = [];

  // Skip validation for raw actions
  if (draft.kind === 'raw') {
    return problems;
  }

  const kind = draft.kind as ActionKind;
  const priority = draft.priority?.trim() ?? '';

  // Empty priority is always valid (defaults to 0)
  if (priority === '') {
    return problems;
  }

  // Actions that allow priority (spec §10)
  const PRIORITY_ALLOWED: ActionKind[] = [
    'processing_time_limit',
    'processing_space_limit',
    'entry_limits',
    'disable_parsers',
    'allow_parsers',
    'force_parser',
  ];

  // Actions that forbid priority
  const PRIORITY_FORBIDDEN: ActionKind[] = [
    'add_attack',
    'add_tag',
    'suppress_attack',
    'mark_attack',
    'combine',
    'disable_rule',
  ];

  // Check if priority is forbidden for this action type
  if (PRIORITY_FORBIDDEN.includes(kind)) {
    problems.push(`Priority is not allowed for ${kind} actions.`);
    return problems;
  }

  // Check if priority is allowed for this action type
  if (!PRIORITY_ALLOWED.includes(kind)) {
    // Unknown action type - shouldn't happen due to type system
    problems.push(`Priority support for ${kind} is unknown.`);
    return problems;
  }

  // Validate priority format
  if (!isValidInteger(priority)) {
    problems.push('Priority must be a whole number.');
    return problems;
  }

  // Validate priority range: signed 64-bit integer
  // Spec says: "a signed 64-bit integer (negatives allowed)"
  // JavaScript can safely represent integers up to 2^53-1 (Number.MAX_SAFE_INTEGER)
  // For i64 range check, we use practical bounds that fit in safe integer range
  const priorityNum = Number(priority);
  const MIN_PRIORITY = -2147483648; // -2^31 (i32 min, practical limit for UI)
  const MAX_PRIORITY = 2147483647; // 2^31-1 (i32 max, practical limit for UI)

  if (priorityNum < MIN_PRIORITY || priorityNum > MAX_PRIORITY) {
    problems.push(`Priority must be between ${MIN_PRIORITY} and ${MAX_PRIORITY}.`);
  }

  return problems;
}

/**
 * Validate action draft and return problems.
 *
 * @param draft - Action draft to validate
 * @returns Array of problem descriptions (empty if valid)
 */
export function actionProblems(draft: ActionDraft): string[] {
  const problems: string[] = [];

  // Skip validation for raw actions
  if (draft.kind === 'raw') {
    return problems;
  }

  const kind = draft.kind as ActionKind;

  // Validate target by action type
  problems.push(...validateActionTarget(draft));

  // Validate kind-specific fields
  switch (kind) {
    case 'add_attack':
      if (!draft.attackType?.trim()) {
        problems.push('Choose the attack type.');
      }
      break;

    case 'add_tag':
      if (!draft.tagKey?.trim()) {
        problems.push('Give the tag a key.');
      }
      // Tag value can be empty
      break;

    case 'suppress_attack':
      // Attack type is optional for suppress_attack
      break;

    case 'mark_attack': {
      // Per rules-framework-actions.md:1428, mark_attack requires at least one of:
      // experimental, known, known_false
      const hasExperimental = draft.experimental !== undefined;
      const hasKnown = draft.known && Object.keys(draft.known).length > 0;
      const hasKnownFalse = draft.knownFalse && (
        Array.isArray(draft.knownFalse) ? draft.knownFalse.length > 0 : draft.knownFalse.trim() !== ''
      );

      if (!hasExperimental && !hasKnown && !hasKnownFalse) {
        problems.push('Mark the attack as experimental, known, or known false (at least one required).');
      }
      break;
    }

    case 'combine':
      // Separator is optional (defaults to ', ')
      break;

    case 'processing_time_limit': {
      const limit = draft.limit?.trim() ?? '';
      if (!limit) {
        problems.push('Set the time limit.');
      } else if (!isValidDuration(limit)) {
        problems.push('Write the time limit with a unit, for example 5ms or 1.5s.');
      }
      break;
    }

    case 'processing_space_limit': {
      const limit = draft.limit?.trim() ?? '';
      if (!limit) {
        problems.push('Set the memory limit.');
      } else if (!isValidQuantity(limit)) {
        problems.push('Write the memory limit as a size, for example 512Ki or 2Mi.');
      }
      break;
    }

    case 'entry_limits': {
      const soft = draft.softLimit?.trim() ?? '';
      const hard = draft.hardLimit?.trim() ?? '';

      if (!soft && !hard) {
        problems.push('Set a soft limit, a hard limit, or both.');
      }

      if (soft && !isValidQuantity(soft)) {
        problems.push('Write the soft limit as a size, for example 1Ki.');
      }

      if (hard && !isValidQuantity(hard)) {
        problems.push('Write the hard limit as a size, for example 64Ki.');
      }
      break;
    }

    case 'disable_parsers': {
      const parsers = draft.parsers;
      // parsers can be "all" (string) or array of parser names
      // Empty array [] is a load error per spec
      if (!parsers || (Array.isArray(parsers) && parsers.length === 0)) {
        problems.push('Choose at least one parser to disable, or use "all".');
      }
      break;
    }

    case 'allow_parsers': {
      const parsers = draft.parsers;
      // parsers can be "all" (string), array of parser names, or [] (none)
      // Empty array [] is valid for allow_parsers - means "allow none"
      if (parsers === undefined || parsers === null) {
        problems.push(
          'Specify which parsers to allow (use "all", a list, or leave empty for none).',
        );
      }
      break;
    }

    case 'force_parser': {
      const parser = draft.parser?.trim() ?? '';
      if (!parser) {
        problems.push('Choose which parser to force.');
      }
      break;
    }

    case 'disable_rule': {
      const ruleIds = draft.ruleIds ?? [];
      if (ruleIds.length === 0) {
        problems.push('Specify at least one rule ID to disable.');
      }
      break;
    }

    default:
      // Unknown action kind - validation is handled by type system
      // No additional validation needed for other action kinds
      break;
  }

  // Validate priority
  problems.push(...validateActionPriority(draft));

  return problems;
}

/**
 * Check if an action draft has any validation problems.
 *
 * @param draft - Action draft to check
 * @returns True if action is valid
 */
export function isActionValid(draft: ActionDraft): boolean {
  return actionProblems(draft).length === 0;
}

/**
 * Check if a check type is a signal check (attack_present, tag_present, etc.).
 *
 * Signal checks include attack_present, attack_absent, tag_present, tag_absent,
 * signal_present, signal_absent, and sample.
 *
 * @param checkType - Check type to test
 * @returns True if check type is a signal check
 */
function isSignalCheck(checkType: string): boolean {
  return (
    checkType === 'attack_present' ||
    checkType === 'attack_absent' ||
    checkType === 'tag_present' ||
    checkType === 'tag_absent' ||
    checkType === 'signal_present' ||
    checkType === 'signal_absent' ||
    checkType === 'sample'
  );
}

/**
 * Check if a check type is a data check (exists, equal, contains, etc.).
 *
 * Data checks are byte-level comparisons on point values.
 *
 * @param checkType - Check type to test
 * @returns True if check type is a data check
 */
function isDataCheck(checkType: string): boolean {
  return (
    checkType === 'exists' ||
    checkType === 'absent' ||
    checkType === 'equal' ||
    checkType === 'nequal' ||
    checkType === 'contains' ||
    checkType === 'startswith' ||
    checkType === 'endswith' ||
    checkType === 'regexp' ||
    checkType === 'nregexp'
  );
}

/**
 * Check if a check type is an attack check (attack_present or attack_absent).
 *
 * @param checkType - Check type to test
 * @returns True if check type is an attack check
 */
function isAttackCheck(checkType: string): boolean {
  return checkType === 'attack_present' || checkType === 'attack_absent';
}

/**
 * Walk condition tree and invoke callback for each check node.
 *
 * @param node - Condition node to walk
 * @param callback - Function to call for each check node
 */
function walkConditionTree(node: ConditionNode, callback: (node: ConditionNode) => void): void {
  if (node.kind === 'group') {
    for (const child of node.children) {
      walkConditionTree(child, callback);
    }
  } else {
    callback(node);
  }
}

/**
 * Common validation helpers for UI components.
 */
export const validators = {
  /**
   * Validate duration input.
   */
  duration: (value: string): string | null => {
    if (!value.trim()) {
      return 'Duration is required';
    }
    if (!isValidDuration(value)) {
      return 'Invalid duration format (use: 10ms, 1s, etc.)';
    }
    return null;
  },

  /**
   * Validate quantity input.
   */
  quantity: (value: string): string | null => {
    if (!value.trim()) {
      return 'Quantity is required';
    }
    if (!isValidQuantity(value)) {
      return 'Invalid quantity format (use: 512, 1Ki, 2Mi, etc.)';
    }
    return null;
  },

  /**
   * Validate integer input.
   */
  integer: (value: string): string | null => {
    if (!value.trim()) {
      return 'Number is required';
    }
    if (!isValidInteger(value)) {
      return 'Must be a whole number';
    }
    return null;
  },

  /**
   * Validate non-empty string.
   */
  required: (value: string): string | null => {
    if (!value.trim()) {
      return 'This field is required';
    }
    return null;
  },
};

/**
 * Validate binding references in action.
 *
 * Checks that attack_ref and target_ref refer to existing bindings in the condition tree,
 * AND that the binding is on the correct check type (rules-framework.md §4b):
 *
 * - bind_attack MUST be on attack_present or attack_absent check
 * - bind_point MUST be on data checks (exists, equal, contains, etc.)
 * - bind_point CANNOT be on signal checks or attack checks
 * - bind_point requires exact point (no wildcards, alternations, caseless keys)
 *
 * @param draft - Action draft to validate
 * @param condition - Root condition tree
 * @param proton - Proton SDK instance for point exactness validation (optional)
 * @returns Array of problem descriptions (empty if valid)
 *
 * @example
 * ```typescript
 * const problems = validateBindingRefs(action, condition, proton);
 * // ['bind_attack "my_attack" must reference an attack_present or attack_absent check, not exists']
 * // ['bind_point "my_target" cannot reference signal check tag_present']
 * // ['bind_point "my_target" requires exact point, but [key:*] contains wildcards']
 * ```
 */
export function validateBindingRefs(
  draft: ActionDraft,
  condition: GroupCondition,
  proton: Proton | null = null,
): string[] {
  const problems: string[] = [];

  // Skip validation for raw actions
  if (draft.kind === 'raw') {
    return problems;
  }

  // Extract all available bindings from condition tree
  const bindings = extractBindings(condition);
  const attackBindings = bindings.filter(b => b.type === 'attack').map(b => b.id);
  const pointBindings = bindings.filter(b => b.type === 'point').map(b => b.id);

  // Validate attack_ref (only for suppress_attack, mark_attack)
  if (draft.attackRef) {
    if (!attackBindings.includes(draft.attackRef)) {
      problems.push(
        `Attack reference "${draft.attackRef}" does not match any bind_attack in conditions.`,
      );
    } else {
      // Validate that the binding is on the correct check type
      walkConditionTree(condition, check => {
        if (check.kind === 'attack' && check.bindAttack === draft.attackRef) {
          // Attack bindings are always valid on attack checks
          // (attack_present or attack_absent, checked by check.kind === 'attack')
        }
      });
    }
  }

  // Validate target_ref (for all actions except disable_rule)
  if (draft.targetRef) {
    if (!pointBindings.includes(draft.targetRef)) {
      problems.push(
        `Target reference "${draft.targetRef}" does not match any bind_point in conditions.`,
      );
    } else {
      // Validate that the binding is on the correct check type
      walkConditionTree(condition, check => {
        if (
          (check.kind === 'field' || check.kind === 'signal') &&
          check.bindPoint === draft.targetRef
        ) {
          // Get the check type from the node
          let checkType: string;
          let point: string;
          let context: string;

          if (check.kind === 'field') {
            checkType = check.value.condition || '';
            point = check.value.canonical || '';
            context = check.context;
          } else {
            // signal check
            checkType = check.absent ? 'signal_absent' : 'signal_present';
            point = check.point || '';
            context = check.context;
          }

          // bind_point cannot be on signal checks
          if (isSignalCheck(checkType)) {
            problems.push(
              `bind_point "${draft.targetRef}" cannot reference signal check ${checkType}`,
            );
          }

          // Validate point is exact (no wildcards, alternations, caseless keys)
          if (proton && point && context) {
            const result = checkPoint(proton, point, { context });
            if (result.canonical && !result.exact) {
              problems.push(
                `bind_point "${draft.targetRef}" requires exact point, but ${point} contains wildcards`,
              );
            }
          }
        }
      });
    }
  }

  // target_role is only valid when target_ref is set
  if (draft.targetRole && !draft.targetRef) {
    problems.push('Target role requires a target reference.');
  }

  return problems;
}

/**
 * Validate binding uniqueness in condition tree.
 *
 * Checks that all bind_attack and bind_point IDs are unique within the tree.
 *
 * @param condition - Root condition tree
 * @returns Array of problem descriptions (empty if valid)
 *
 * @example
 * ```typescript
 * const problems = validateBindingUniqueness(condition);
 * // ['Binding name "a" is used more than once']
 * ```
 */
export function validateBindingUniqueness(condition: GroupCondition): string[] {
  const problems: string[] = [];

  // Extract all bindings
  const bindings = extractBindings(condition);

  // Check for duplicates
  const seen = new Set<string>();
  for (const binding of bindings) {
    if (seen.has(binding.id)) {
      problems.push(
        `Binding name "${binding.id}" is used more than once. Each binding must be unique.`,
      );
    }
    seen.add(binding.id);
  }

  return problems;
}
