/**
 * Condition Model
 *
 * Converts between UI tree structure and Proton API format.
 * Handles condition tree transformations, factory functions, and validation.
 */

import type { Proton } from '@wallarm-org/rules-lib';
import { pointOf } from '../../../PointSelector/sdkBridge';
import type {
  ConditionType,
  PointSelectorValue,
  RuleContext,
  Segment,
} from '../../../PointSelector/types';
import type {
  AttackCondition,
  ConditionNode,
  FieldCondition,
  GroupCondition,
  GroupOperator,
  ProtonCheck,
  ProtonCondition,
  RawCondition,
  SampleCondition,
  SignalCondition,
  SignalType,
  TagCondition,
} from '../types';

/**
 * Sequential ID generator for condition nodes.
 */
let conditionSequence = 0;

/**
 * Generate a unique ID for a condition node.
 *
 * @returns Unique node ID
 */
export function nodeId(): string {
  return `c${++conditionSequence}`;
}

/**
 * Empty PointSelector value for new field conditions.
 */
export const EMPTY_FIELD_VALUE: PointSelectorValue = {
  segments: [],
  condition: null,
  value: '',
  ignoreCase: false,
  canonical: null,
  canonicalVersion: null,
};

/**
 * Create a new field condition with default values.
 *
 * @param context - Rule context (default: 'http_request')
 * @returns New FieldCondition
 */
export function newField(context: RuleContext = 'http_request'): FieldCondition {
  return {
    kind: 'field',
    id: nodeId(),
    context,
    value: EMPTY_FIELD_VALUE,
  };
}

/**
 * Create a new attack condition with default values.
 *
 * @param attackType - Attack type (default: '')
 * @param point - Point where attack is detected (default: 'flow')
 * @returns New AttackCondition
 */
export function newAttack(attackType = '', point = 'flow'): AttackCondition {
  return {
    kind: 'attack',
    id: nodeId(),
    attackType,
    point,
  };
}

/**
 * Create a new signal condition with default values.
 *
 * @param signalType - Signal type (default: '')
 * @param point - Point where signal is detected (default: '[http:header]')
 * @returns New SignalCondition
 */
export function newSignal(
  signalType: SignalType | '' = '',
  point = '[http:header]',
): SignalCondition {
  return {
    kind: 'signal',
    id: nodeId(),
    signalType,
    point,
    limit: '',
  };
}

/**
 * Create a new tag condition with default values.
 *
 * @param tagKey - Tag key (default: '')
 * @param tagValue - Tag value (default: '')
 * @param point - Point where tag is checked (default: 'flow')
 * @returns New TagCondition
 */
export function newTag(tagKey = '', tagValue = '', point = 'flow'): TagCondition {
  return {
    kind: 'tag',
    id: nodeId(),
    tagKey,
    tagValue,
    point,
  };
}

/**
 * Create a new sample condition with default values.
 *
 * @param percent - Percentage of flows to sample (default: 10)
 * @returns New SampleCondition
 */
export function newSample(percent = 10): SampleCondition {
  return {
    kind: 'sample',
    id: nodeId(),
    percent,
  };
}

/**
 * Create a new group condition with default values.
 *
 * @param operator - Group operator (default: 'and')
 * @returns New GroupCondition with one empty field
 */
export function newGroup(operator: GroupOperator = 'and'): GroupCondition {
  return {
    kind: 'group',
    id: nodeId(),
    operator,
    children: [newField()],
  };
}

/**
 * Check if a field condition is complete enough to serialize.
 *
 * @param condition - Field condition to check
 * @returns True if condition has segments, a condition type, and value if required
 */
export function fieldComplete(condition: FieldCondition): boolean {
  const { segments, condition: conditionType, value } = condition.value;

  // Must have at least one segment
  if (segments.length === 0) {
    return false;
  }

  // Must have a condition type
  if (conditionType === null) {
    return false;
  }

  // If condition type requires a value, it must not be empty
  const requiresValue = !['exists', 'absent'].includes(conditionType);
  if (requiresValue && value === '') {
    return false;
  }

  return true;
}

/**
 * Convert a FieldCondition to a Proton check object.
 *
 * @param condition - Field condition
 * @param proton - Optional Proton SDK instance for canonical rendering
 * @returns Proton check or null if incomplete
 */
function fieldToCheck(condition: FieldCondition, proton?: Proton | null): ProtonCheck | null {
  if (!fieldComplete(condition) || !condition.value.condition) {
    return null;
  }

  const { segments, condition: conditionType, value, ignoreCase } = condition.value;

  const check: ProtonCheck = {
    type: conditionType,
    context: condition.context,
    point: pointOf(segments, proton),
  };

  // Add value if the condition type requires it
  const requiresValue = !['exists', 'absent'].includes(conditionType);
  if (requiresValue) {
    check.value = value;
  }

  // Add case_sensitive flag only when false (non-default)
  // Default is true (case-sensitive), so omit it when ignoreCase is false
  if (ignoreCase) {
    check.case_sensitive = false;
  }

  // Add binding fields (format 0.10.1+)
  if (condition.bindPoint) {
    check.bind_point = condition.bindPoint;
  }

  if (condition.pointRef) {
    check.point_ref = condition.pointRef;
  }

  if (condition.pointRole) {
    check.point_role = condition.pointRole;
  }

  return check;
}

/**
 * Convert a single ConditionNode to Proton format.
 *
 * @param node - Condition node
 * @param proton - Optional Proton SDK instance for canonical rendering
 * @returns Proton condition/check or null if incomplete
 */
function nodeToProton(
  node: ConditionNode,
  proton?: Proton | null,
): ProtonCondition | Record<string, unknown> | null {
  switch (node.kind) {
    case 'field':
      return fieldToCheck(node, proton) as Record<string, unknown> | null;

    case 'raw':
      return node.check;

    case 'attack': {
      const check: Record<string, unknown> = {
        type: node.absent ? 'attack_absent' : 'attack_present',
        context: 'http_request',
        point: node.point || 'flow',
      };

      // Build attack filter object
      const attack: Record<string, unknown> = {};

      if (node.attackType) {
        attack.attack_type = node.attackType;
      }

      if (node.source) {
        attack.source = node.source;
      }

      if (node.stampIds && node.stampIds.length > 0) {
        attack.stamp_ids = node.stampIds.map(id => Number(id));
      }

      if (node.ruleIds) {
        attack.rule_ids = node.ruleIds;
      }

      if (node.property) {
        attack.property = node.property;
      }

      if (node.reference) {
        attack.reference = node.reference;
      }

      if (node.known) {
        attack.known = node.known;
      }

      if (node.knownFalse) {
        attack.known_false = node.knownFalse;
      }

      // Only add attack object if it has at least one field
      if (Object.keys(attack).length > 0) {
        check.attack = attack;
      }

      // Add bind_attack field (format 0.10.1+)
      if (node.bindAttack) {
        check.bind_attack = node.bindAttack;
      }

      return check;
    }

    case 'signal': {
      if (!node.signalType) {
        return null; // Incomplete signal condition
      }

      if (node.signalType === 'key_duplicate') {
        const signal: Record<string, unknown> = { signal_type: 'key_duplicate' };

        if (node.key) {
          signal.key = node.key;
        }

        const check: Record<string, unknown> = {
          type: node.absent ? 'signal_absent' : 'signal_present',
          context: 'http_request',
          point: node.point || '[http:header]',
          signal,
        };

        // Add bind_point field (format 0.10.1+)
        if (node.bindPoint) {
          check.bind_point = node.bindPoint;
        }

        return check;
      }

      if (node.signalType === 'resource_overlimit') {
        // Per spec: flow limits are on 'flow', entry limits are on the entry
        const isEntryLimit =
          node.limit === 'entry_size_soft_limit' || node.limit === 'entry_size_hard_limit';
        const point = isEntryLimit ? node.point || '[**]' : 'flow';

        const check: Record<string, unknown> = {
          type: node.absent ? 'signal_absent' : 'signal_present',
          context: 'http_request',
          point,
          signal: {
            signal_type: 'resource_overlimit',
          },
        };

        if (node.limit) {
          (check.signal as Record<string, unknown>).limit = node.limit;
        }

        // Add bind_point field (format 0.10.1+)
        if (node.bindPoint) {
          check.bind_point = node.bindPoint;
        }

        return check;
      }

      return null;
    }

    case 'tag': {
      if (!node.tagKey) {
        return null; // Incomplete tag condition
      }

      const check: Record<string, unknown> = {
        type: node.absent ? 'tag_absent' : 'tag_present',
        context: 'http_request',
        point: node.point || 'flow',
        tag: { key: node.tagKey },
      };

      if (node.tagValue) {
        (check.tag as Record<string, unknown>).value = node.tagValue;
      }

      return check;
    }

    case 'sample': {
      return {
        type: 'sample',
        percent: node.percent,
      };
    }

    case 'group': {
      const checks = node.children
        .map(child => nodeToProton(child, proton))
        .filter((c): c is ProtonCondition | Record<string, unknown> => c !== null);

      if (checks.length === 0) {
        return null;
      }

      // Proton's `not` takes exactly one child: "none of these" over several
      // conditions is not(or(...))
      if (node.operator === 'not' && checks.length > 1) {
        return {
          operator: 'not',
          checks: [{ operator: 'or', checks }],
        };
      }

      return {
        operator: node.operator,
        checks,
      };
    }

    default:
      // Exhaustive check: all ConditionNode kinds are handled above
      return null;
  }
}

/**
 * Convert UI condition tree to Proton API format.
 *
 * @param root - Root group condition
 * @param proton - Optional Proton SDK instance for canonical point rendering
 * @returns Proton condition or null if empty/incomplete
 */
export function toProtonCondition(
  root: GroupCondition,
  proton?: Proton | null,
): ProtonCondition | null {
  return nodeToProton(root, proton) as ProtonCondition | null;
}

/**
 * Parse canonical point string into segments for UI.
 *
 * Uses SDK parse() when available. If SDK not loaded, returns empty segments array
 * and relies on canonical form stored in PointSelectorValue.
 *
 * @param point - Canonical point string
 * @param context - Rule context (unused but kept for signature compatibility)
 * @param proton - SDK instance for parsing
 * @returns Array of segments (empty if SDK unavailable)
 */
function segmentsOfPoint(point: string, context: RuleContext, proton: Proton | null): Segment[] {
  if (!point) {
    return [];
  }

  // No SDK - return empty segments, canonical form is stored separately
  if (!proton) {
    return [];
  }

  try {
    // Parse using SDK - returns Segment[] directly
    const result = proton.point.parse(point);
    // Cast to UI Segment - SDK segments are compatible, missing only UI metadata
    // which gets added by PointSelector when editing
    return result as Segment[];
  } catch (error) {
    // Parse failed - log and return empty
    console.warn('Failed to parse canonical point string with SDK', {
      point,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Check if an object is a Proton group (has operator and checks).
 *
 * @param obj - Object to check
 * @returns True if object is a ProtonCondition
 */
function isGroup(obj: unknown): obj is ProtonCondition {
  return typeof obj === 'object' && obj !== null && 'operator' in obj && 'checks' in obj;
}

/**
 * Check if an object has only the specified keys.
 *
 * @param obj - Object to check
 * @param allowed - Allowed keys
 * @returns True if object only has allowed keys
 */
function onlyKeys(obj: unknown, allowed: string[]): boolean {
  return (
    typeof obj === 'object' && obj !== null && Object.keys(obj).every(k => allowed.includes(k))
  );
}

/**
 * List of supported condition types for field conditions.
 */
const CONDITIONS: ConditionType[] = [
  'equal',
  'nequal',
  'contains',
  'startswith',
  'endswith',
  'regexp',
  'nregexp',
  'exists',
  'absent',
];

/**
 * Convert a Proton check to a ConditionNode.
 *
 * @param check - Proton check object
 * @param proton - SDK instance for parsing point strings (optional)
 * @returns Condition node (may be RawCondition if unrecognized)
 */
function checkToNode(check: Record<string, unknown>, proton: Proton | null): ConditionNode {
  const type = String(check.type ?? '');

  // Attack check (attack_present or attack_absent)
  if (
    (type === 'attack_present' || type === 'attack_absent') &&
    onlyKeys(check, ['type', 'context', 'point', 'attack', 'bind_attack']) &&
    typeof check.point === 'string'
  ) {
    const attack = (check.attack ?? {}) as Record<string, unknown>;

    const node: AttackCondition = {
      kind: 'attack',
      id: nodeId(),
      attackType: typeof attack.attack_type === 'string' ? attack.attack_type : '',
      point: check.point as string,
      absent: type === 'attack_absent' ? true : undefined,
    };

    // Extract filter fields
    if (typeof attack.source === 'string') {
      node.source = attack.source;
    }

    if (Array.isArray(attack.stamp_ids)) {
      node.stampIds = attack.stamp_ids.map(id => String(id));
    }

    if (attack.rule_ids !== undefined) {
      node.ruleIds = attack.rule_ids as string | string[];
    }

    if (attack.property !== undefined) {
      node.property = attack.property as string | string[];
    }

    if (attack.reference && typeof attack.reference === 'object') {
      const ref = attack.reference as Record<string, unknown>;
      if (
        typeof ref.operator === 'string' &&
        ['equal', 'startswith', 'regex'].includes(ref.operator) &&
        (typeof ref.value === 'string' || Array.isArray(ref.value))
      ) {
        node.reference = {
          operator: ref.operator as 'equal' | 'startswith' | 'regex',
          value: ref.value as string | string[],
        };
      }
    }

    if (attack.known && typeof attack.known === 'object') {
      node.known = attack.known as {
        cve?: string[];
        vuln?: string[];
        technique?: string[];
        payload?: string[];
      };
    }

    if (attack.known_false !== undefined) {
      node.knownFalse = attack.known_false as string | string[];
    }

    if (typeof check.bind_attack === 'string') {
      node.bindAttack = check.bind_attack;
    }

    return node;
  }

  // Signal check (signal_present or signal_absent)
  if (
    (type === 'signal_present' || type === 'signal_absent') &&
    onlyKeys(check, ['type', 'context', 'point', 'signal', 'bind_point']) &&
    typeof check.point === 'string'
  ) {
    const signal = (check.signal ?? {}) as Record<string, unknown>;
    const absent = type === 'signal_absent' ? true : undefined;

    if (signal.signal_type === 'key_duplicate' && signal.limit === undefined) {
      const node: SignalCondition = {
        kind: 'signal',
        id: nodeId(),
        signalType: 'key_duplicate',
        point: check.point as string,
        limit: '',
        absent,
      };

      if (typeof signal.key === 'string') {
        node.key = signal.key;
      }

      if (typeof check.bind_point === 'string') {
        node.bindPoint = check.bind_point;
      }

      return node;
    }

    if (
      signal.signal_type === 'resource_overlimit' &&
      (signal.limit === undefined || typeof signal.limit === 'string')
    ) {
      // Flow limits use 'flow', entry limits use an entry point pattern
      const point = typeof check.point === 'string' ? check.point : 'flow';
      const node: SignalCondition = {
        kind: 'signal',
        id: nodeId(),
        signalType: 'resource_overlimit',
        point,
        limit: (signal.limit as string | undefined) ?? '',
        absent,
      };

      if (typeof check.bind_point === 'string') {
        node.bindPoint = check.bind_point;
      }

      return node;
    }
  }

  // Tag check (tag_present or tag_absent)
  if (
    (type === 'tag_present' || type === 'tag_absent') &&
    onlyKeys(check, ['type', 'context', 'point', 'tag']) &&
    typeof check.point === 'string' &&
    onlyKeys(check.tag, ['key', 'value'])
  ) {
    const tag = check.tag as { key?: string; value?: unknown };

    if (tag.key && (tag.value === undefined || typeof tag.value === 'string')) {
      return {
        kind: 'tag',
        id: nodeId(),
        tagKey: tag.key,
        tagValue: (tag.value as string | undefined) ?? '',
        point: check.point,
        absent: type === 'tag_absent' ? true : undefined,
      };
    }
  }

  // Sample check
  if (
    type === 'sample' &&
    onlyKeys(check, ['type', 'percent']) &&
    typeof check.percent === 'number'
  ) {
    return {
      kind: 'sample',
      id: nodeId(),
      percent: check.percent,
    };
  }

  // Field check (value-based condition)
  const point = check.point;
  const value = check.value;
  const isValueCheck = CONDITIONS.some(t => t === type);
  const context = (check.context as RuleContext | undefined) ?? 'http_request';

  // Literal `*` in equal/nequal would be interpreted as wildcard on save
  const literalStar =
    (type === 'equal' || type === 'nequal') && typeof value === 'string' && value.includes('*');

  if (
    isValueCheck &&
    !literalStar &&
    typeof point === 'string' &&
    (value === undefined || typeof value === 'string') &&
    onlyKeys(check, ['type', 'context', 'point', 'value', 'case_sensitive'])
  ) {
    const segments = segmentsOfPoint(point, context, proton);
    const currentVersion = proton ? parseInt(proton.version().canonical) : undefined;

    return {
      kind: 'field',
      id: nodeId(),
      context,
      value: {
        segments,
        canonical: point, // Store canonical form from API
        canonicalVersion: currentVersion ?? null,
        condition: type as ConditionType,
        value: (value as string | undefined) ?? '',
        ignoreCase: check.case_sensitive === false,
      },
    };
  }

  // Fallback to raw condition
  return { kind: 'raw', id: nodeId(), check };
}

/**
 * Convert a Proton condition/check to a ConditionNode.
 *
 * @param obj - Proton condition or check
 * @returns Condition node
 */
function protonToNode(
  obj: ProtonCondition | Record<string, unknown>,
  proton: Proton | null,
): ConditionNode {
  if (!isGroup(obj)) {
    return checkToNode(obj, proton);
  }

  const operator: GroupOperator = obj.operator ?? 'and';

  // Unwrap not(or(...)) back to 'not' with children
  const only = obj.checks[0];
  if (
    operator === 'not' &&
    obj.checks.length === 1 &&
    only &&
    isGroup(only) &&
    only.operator === 'or'
  ) {
    return {
      kind: 'group',
      id: nodeId(),
      operator: 'not',
      children: only.checks.map(c => protonToNode(c, proton)),
    };
  }

  return {
    kind: 'group',
    id: nodeId(),
    operator,
    children: obj.checks.map(c => protonToNode(c, proton)),
  };
}

/**
 * Convert Proton API format to UI condition tree.
 *
 * @param condition - Proton condition (null/undefined = empty tree)
 * @param proton - SDK instance for parsing point strings (optional)
 * @returns Group condition (always returns a group, even if empty)
 */
export function fromProtonCondition(
  condition: unknown,
  proton: Proton | null = null,
): GroupCondition {
  if (!condition || typeof condition !== 'object') {
    return { ...newGroup('and'), children: [] };
  }

  const node = protonToNode(condition as ProtonCondition, proton);

  return node.kind === 'group'
    ? node
    : { kind: 'group', id: nodeId(), operator: 'and', children: [node] };
}

/**
 * Check if a node or its descendants contain attack, signal, tag, or sample checks.
 *
 * @param node - Node to check
 * @returns True if node or descendants are attack/signal/tag/sample checks
 */
function hasSignalChecks(node: ConditionNode): boolean {
  return (
    node.kind === 'attack' ||
    node.kind === 'signal' ||
    node.kind === 'tag' ||
    node.kind === 'sample' ||
    (node.kind === 'group' && node.children.some(hasSignalChecks))
  );
}

/**
 * Validate a condition tree and return problems.
 *
 * @param root - Root group condition
 * @returns Array of problem descriptions (empty if valid)
 */
export function conditionProblems(root: GroupCondition): string[] {
  const problems = new Set<string>();

  function walk(node: ConditionNode, underNone: boolean) {
    if (node.kind === 'field' && !fieldComplete(node)) {
      problems.add('Finish every condition: say where the value is, the condition and the value.');
    }

    if (node.kind === 'signal' && !node.signalType) {
      problems.add('Choose which request anomaly.');
    }

    if (node.kind === 'tag' && !node.tagKey) {
      problems.add('Specify the tag key.');
    }

    if (node.kind === 'sample') {
      if (node.percent <= 0 || node.percent > 100) {
        problems.add('Sample percent must be between 0 and 100.');
      }
    }

    if (node.kind === 'group') {
      // Empty groups (except root) are not allowed
      if (node !== root && node.children.length === 0) {
        problems.add('Remove empty groups.');
      }

      const none = underNone || node.operator === 'not';

      // Cannot have attack/signal/tag/sample checks inside 'not'
      if (none && node.children.some(hasSignalChecks)) {
        problems.add('"None of" cannot contain attack, anomaly, tag, or sample conditions.');
      }

      for (const child of node.children) {
        walk(child, none);
      }
    }
  }

  walk(root, false);
  return [...problems];
}
