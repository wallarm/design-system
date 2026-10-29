import {
  CONDITIONS,
  type ConditionType,
  checkOf,
  type ProtonCheck,
  type RuleContext,
  type Segment,
  takesValue,
} from '../ui';
import type { PointSelectorValue } from './types';

/**
 * DEPRECATED: Legacy stub for backward compatibility.
 * Use design-system models instead.
 */
function pointOf(segments: Segment[]): string {
  return segments.map(s => s.text).join('');
}

/**
 * DEPRECATED: Legacy stub for backward compatibility.
 * Use design-system models instead.
 */
function segmentsOfPoint(point: string, _context: RuleContext): Segment[] | null {
  if (!point) return null;
  return [{ text: point, kind: 'native' as const, label: point }];
}

/** How a group of conditions combines: every one, at least one, or none. */
export type GroupOperator = 'and' | 'or' | 'not';

/** A condition on a value in the request or response — the wizard's output. */
export interface FieldCondition {
  kind: 'field';
  id: string;
  context: RuleContext;
  value: PointSelectorValue;
}

/** A condition the wizard cannot open (a point it cannot build): kept as is,
 *  shown as code, never silently rewritten. */
export interface RawCondition {
  kind: 'raw';
  id: string;
  check: Record<string, unknown>;
}

/** "An attack was detected" — proton's `attack_present`. */
export interface AttackCondition {
  kind: 'attack';
  id: string;
  /** Empty: any attack. */
  attackType: string;
  /** `flow` (anywhere in the request) or a point. */
  point: string;
}

/** The engine's own findings a rule can react to (0.10.1 `signal_present`). */
export type SignalType = 'key_duplicate' | 'resource_overlimit';

/** "A request anomaly was detected" — proton's `signal_present`. */
export interface SignalCondition {
  kind: 'signal';
  id: string;
  signalType: SignalType | '';
  /** `key_duplicate`: the container whose keys repeat (`[http:header]`, …). */
  point: string;
  /** `resource_overlimit`: which limit was exceeded. */
  limit: string;
}

/** "No attack was detected" — proton's `attack_absent`. */
export interface AttackAbsentCondition {
  kind: 'attack_absent';
  id: string;
  /** Empty: no attacks. Filter by type if specified. */
  attackType: string;
  /** `flow` (anywhere in request) or a point. */
  point: string;
}

/** "A tag is present" — proton's `tag_present`. */
export interface TagPresentCondition {
  kind: 'tag_present';
  id: string;
  /** Tag key (required) */
  tagKey: string;
  /** Tag value (optional - if empty, checks key only) */
  tagValue: string;
  /** Point where tag should be found */
  point: string;
}

/** "A tag is absent" — proton's `tag_absent`. */
export interface TagAbsentCondition {
  kind: 'tag_absent';
  id: string;
  /** Tag key (required) */
  tagKey: string;
  /** Tag value (optional - if empty, checks key only) */
  tagValue: string;
  /** Point where tag should be absent */
  point: string;
}

/** "A request anomaly is absent" — proton's `signal_absent`. */
export interface SignalAbsentCondition {
  kind: 'signal_absent';
  id: string;
  signalType: SignalType | '';
  /** Point to check */
  point: string;
  /** For resource_overlimit: which limit */
  limit: string;
}

/** "Sample this flow" — proton's `sample` (format 0.10.2+). */
export interface SampleCondition {
  kind: 'sample';
  id: string;
  /** Percentage of flows to sample (0, 100] */
  percent: number;
}

export interface GroupCondition {
  kind: 'group';
  id: string;
  operator: GroupOperator;
  children: ConditionNode[];
}

export type ConditionNode =
  | FieldCondition
  | RawCondition
  | AttackCondition
  | AttackAbsentCondition
  | TagPresentCondition
  | TagAbsentCondition
  | SignalCondition
  | SignalAbsentCondition
  | SampleCondition
  | GroupCondition;

let seq = 0;
export const nodeId = (): string => `c${++seq}`;

export const EMPTY_FIELD_VALUE: PointSelectorValue = {
  segments: [],
  condition: null,
  value: '',
  ignoreCase: false,
};

export const newField = (context: RuleContext = 'http_request'): FieldCondition => ({
  kind: 'field',
  id: nodeId(),
  context,
  value: EMPTY_FIELD_VALUE,
});

export const newGroup = (operator: GroupOperator = 'and'): GroupCondition => ({
  kind: 'group',
  id: nodeId(),
  operator,
  children: [newField()],
});

export const newAttackAbsent = (): AttackAbsentCondition => ({
  kind: 'attack_absent',
  id: nodeId(),
  attackType: '',
  point: 'flow',
});

export const newTagPresent = (): TagPresentCondition => ({
  kind: 'tag_present',
  id: nodeId(),
  tagKey: '',
  tagValue: '',
  point: 'flow',
});

export const newTagAbsent = (): TagAbsentCondition => ({
  kind: 'tag_absent',
  id: nodeId(),
  tagKey: '',
  tagValue: '',
  point: 'flow',
});

export const newSignalAbsent = (): SignalAbsentCondition => ({
  kind: 'signal_absent',
  id: nodeId(),
  signalType: '',
  point: 'flow',
  limit: '',
});

export const newSample = (): SampleCondition => ({
  kind: 'sample',
  id: nodeId(),
  percent: 10,
});

/** A proton condition tree: `{ operator, checks: [...] }`, checks nested. */
export interface ProtonCondition {
  operator: GroupOperator;
  checks: (ProtonCondition | Record<string, unknown>)[];
}

const isGroup = (x: unknown): x is ProtonCondition =>
  typeof x === 'object' && x !== null && 'operator' in x && 'checks' in x;

/** Is the field condition complete enough to become a check? */
export const fieldComplete = (c: FieldCondition): boolean =>
  c.value.segments.length > 0 &&
  c.value.condition !== null &&
  (!takesValue(c.value.condition) || c.value.value !== '');

const fieldToCheck = (c: FieldCondition): ProtonCheck | null => {
  if (!fieldComplete(c) || !c.value.condition) return null;
  return checkOf(
    c.value.condition,
    c.value.value,
    c.value.ignoreCase,
    pointOf(c.value.segments),
    c.context,
  );
};

const nodeToProton = (node: ConditionNode): ProtonCondition | Record<string, unknown> | null => {
  switch (node.kind) {
    case 'field':
      return fieldToCheck(node) as Record<string, unknown> | null;
    case 'raw':
      return node.check;
    case 'attack':
      return {
        type: 'attack_present',
        context: 'http_request',
        point: node.point || 'flow',
        ...(node.attackType ? { attack: { attack_type: node.attackType } } : {}),
      };
    case 'attack_absent':
      return {
        type: 'attack_absent',
        context: 'http_request',
        point: node.point || 'flow',
        ...(node.attackType ? { attack: { attack_type: node.attackType } } : {}),
      };
    case 'tag_present':
      return {
        type: 'tag_present',
        context: 'http_request',
        point: node.point || 'flow',
        tag: {
          key: node.tagKey,
          ...(node.tagValue ? { value: node.tagValue } : {}),
        },
      };
    case 'tag_absent':
      return {
        type: 'tag_absent',
        context: 'http_request',
        point: node.point || 'flow',
        tag: {
          key: node.tagKey,
          ...(node.tagValue ? { value: node.tagValue } : {}),
        },
      };
    case 'signal':
      if (node.signalType === 'key_duplicate') {
        return {
          type: 'signal_present',
          context: 'http_request',
          point: node.point || '[http:header]',
          signal: { signal_type: 'key_duplicate' },
        };
      }
      if (node.signalType === 'resource_overlimit') {
        return {
          type: 'signal_present',
          context: 'http_request',
          point: 'flow',
          signal: {
            signal_type: 'resource_overlimit',
            ...(node.limit ? { limit: node.limit } : {}),
          },
        };
      }
      return null;
    case 'signal_absent':
      if (node.signalType === 'key_duplicate') {
        return {
          type: 'signal_absent',
          context: 'http_request',
          point: node.point || '[http:header]',
          signal: { signal_type: 'key_duplicate' },
        };
      }
      if (node.signalType === 'resource_overlimit') {
        return {
          type: 'signal_absent',
          context: 'http_request',
          point: 'flow',
          signal: {
            signal_type: 'resource_overlimit',
            ...(node.limit ? { limit: node.limit } : {}),
          },
        };
      }
      return null;
    case 'sample':
      return {
        type: 'sample',
        percent: node.percent,
      };
    case 'group': {
      const checks = node.children.map(nodeToProton).filter(c => c !== null);
      if (!checks.length) return null;
      // proton's `not` takes exactly one child: "none of these" over several
      // conditions is not(or(…)).
      if (node.operator === 'not' && checks.length > 1) {
        return { operator: 'not', checks: [{ operator: 'or', checks }] };
      }
      return { operator: node.operator, checks };
    }
    default:
      return null;
  }
};

/** The draft's tree as proton's condition; incomplete conditions are left
 *  out, and a tree with nothing in it is `null` (the rule applies to every
 *  request). */
export const toProtonCondition = (root: GroupCondition): ProtonCondition | null =>
  nodeToProton(root) as ProtonCondition | null;

const onlyKeys = (o: unknown, allowed: string[]): boolean =>
  typeof o === 'object' && o !== null && Object.keys(o).every(k => allowed.includes(k));

const checkToNode = (check: Record<string, unknown>): ConditionNode => {
  const type = String(check.type ?? '');
  // Signal checks the builder can show; binds, sources, ids and keys stay as code.
  if (
    type === 'attack_present' &&
    onlyKeys(check, ['type', 'context', 'point', 'attack']) &&
    typeof check.point === 'string' &&
    (check.attack === undefined || onlyKeys(check.attack, ['attack_type'])) &&
    typeof ((check.attack as { attack_type?: unknown } | undefined)?.attack_type ?? '') === 'string'
  ) {
    const attack = check.attack as { attack_type?: string } | undefined;
    return {
      kind: 'attack',
      id: nodeId(),
      attackType: attack?.attack_type ?? '',
      point: check.point,
    };
  }
  if (
    type === 'signal_present' &&
    onlyKeys(check, ['type', 'context', 'point', 'signal']) &&
    typeof check.point === 'string' &&
    onlyKeys(check.signal, ['signal_type', 'limit'])
  ) {
    const signal = check.signal as { signal_type?: string; limit?: unknown };
    if (signal.signal_type === 'key_duplicate' && signal.limit === undefined) {
      return {
        kind: 'signal',
        id: nodeId(),
        signalType: 'key_duplicate',
        point: check.point,
        limit: '',
      };
    }
    if (
      signal.signal_type === 'resource_overlimit' &&
      check.point === 'flow' &&
      (signal.limit === undefined || typeof signal.limit === 'string')
    ) {
      return {
        kind: 'signal',
        id: nodeId(),
        signalType: 'resource_overlimit',
        point: 'flow',
        limit: (signal.limit as string | undefined) ?? '',
      };
    }
  }
  // attack_absent
  if (
    type === 'attack_absent' &&
    onlyKeys(check, ['type', 'context', 'point', 'attack']) &&
    typeof check.point === 'string' &&
    (check.attack === undefined || onlyKeys(check.attack, ['attack_type'])) &&
    typeof ((check.attack as { attack_type?: unknown } | undefined)?.attack_type ?? '') === 'string'
  ) {
    const attack = check.attack as { attack_type?: string } | undefined;
    return {
      kind: 'attack_absent',
      id: nodeId(),
      attackType: attack?.attack_type ?? '',
      point: check.point,
    };
  }
  // tag_present
  if (
    type === 'tag_present' &&
    onlyKeys(check, ['type', 'context', 'point', 'tag']) &&
    typeof check.point === 'string' &&
    onlyKeys(check.tag, ['key', 'value']) &&
    typeof (check.tag as { key?: unknown }).key === 'string'
  ) {
    const tag = check.tag as { key: string; value?: string };
    return {
      kind: 'tag_present',
      id: nodeId(),
      tagKey: tag.key,
      tagValue: tag.value ?? '',
      point: check.point,
    };
  }
  // tag_absent
  if (
    type === 'tag_absent' &&
    onlyKeys(check, ['type', 'context', 'point', 'tag']) &&
    typeof check.point === 'string' &&
    onlyKeys(check.tag, ['key', 'value']) &&
    typeof (check.tag as { key?: unknown }).key === 'string'
  ) {
    const tag = check.tag as { key: string; value?: string };
    return {
      kind: 'tag_absent',
      id: nodeId(),
      tagKey: tag.key,
      tagValue: tag.value ?? '',
      point: check.point,
    };
  }
  // signal_absent
  if (
    type === 'signal_absent' &&
    onlyKeys(check, ['type', 'context', 'point', 'signal']) &&
    typeof check.point === 'string' &&
    onlyKeys(check.signal, ['signal_type', 'limit'])
  ) {
    const signal = check.signal as { signal_type?: string; limit?: unknown };
    if (signal.signal_type === 'key_duplicate' && signal.limit === undefined) {
      return {
        kind: 'signal_absent',
        id: nodeId(),
        signalType: 'key_duplicate',
        point: check.point,
        limit: '',
      };
    }
    if (
      signal.signal_type === 'resource_overlimit' &&
      check.point === 'flow' &&
      (signal.limit === undefined || typeof signal.limit === 'string')
    ) {
      return {
        kind: 'signal_absent',
        id: nodeId(),
        signalType: 'resource_overlimit',
        point: 'flow',
        limit: (signal.limit as string | undefined) ?? '',
      };
    }
  }
  // sample (format 0.10.2+)
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
  const point = check.point;
  const value = check.value;
  const isValueCheck = CONDITIONS.some(([t]) => t === type);
  const context = (check.context as RuleContext | undefined) ?? 'http_request';
  // One point, one plain-text value: the wizard can hold it. Lists of points
  // or values and base64 values stay as code.
  if (
    isValueCheck &&
    typeof point === 'string' &&
    (value === undefined || typeof value === 'string') &&
    onlyKeys(check, ['type', 'context', 'point', 'value', 'case_sensitive'])
  ) {
    const segments = segmentsOfPoint(point, context);
    if (segments) {
      return {
        kind: 'field',
        id: nodeId(),
        context,
        value: {
          segments,
          condition: type as ConditionType,
          value: (value as string | undefined) ?? '',
          ignoreCase: check.case_sensitive === false,
          canonical: null,
          canonicalVersion: null,
        },
      };
    }
  }
  return { kind: 'raw', id: nodeId(), check };
};

const protonToNode = (x: ProtonCondition | Record<string, unknown>): ConditionNode => {
  if (!isGroup(x)) return checkToNode(x);
  const operator: GroupOperator = x.operator ?? 'and';
  // not(or(a, b)) reads back as "none of a, b".
  const only = x.checks[0];
  if (
    operator === 'not' &&
    x.checks.length === 1 &&
    only &&
    isGroup(only) &&
    only.operator === 'or'
  ) {
    return {
      kind: 'group',
      id: nodeId(),
      operator: 'not',
      children: only.checks.map(protonToNode),
    };
  }
  return { kind: 'group', id: nodeId(), operator, children: x.checks.map(protonToNode) };
};

/** A stored condition as the builder's tree; the root is always a group. */
export const fromProtonCondition = (condition: unknown): GroupCondition => {
  if (!condition || typeof condition !== 'object') return { ...newGroup('and'), children: [] };
  const node = protonToNode(condition as ProtonCondition);
  return node.kind === 'group'
    ? node
    : { kind: 'group', id: nodeId(), operator: 'and', children: [node] };
};

const signalIn = (node: ConditionNode): boolean =>
  node.kind === 'attack' ||
  node.kind === 'signal' ||
  (node.kind === 'group' && node.children.some(signalIn));

/** What keeps the condition from being saved, in words. */
export const conditionProblems = (root: GroupCondition): string[] => {
  const problems = new Set<string>();
  const walk = (node: ConditionNode, underNone: boolean) => {
    if (node.kind === 'field' && !fieldComplete(node)) {
      problems.add('Finish every condition: say where the value is, the condition and the value.');
    }
    if (node.kind === 'signal' && !node.signalType) problems.add('Choose which request anomaly.');
    if (node.kind === 'group') {
      if (node !== root && node.children.length === 0) problems.add('Remove empty groups.');
      const none = underNone || node.operator === 'not';
      if (none && node.children.some(signalIn)) {
        problems.add('"None of" cannot contain attack or anomaly conditions.');
      }
      for (const c of node.children) walk(c, none);
    }
  };
  walk(root, false);
  return [...problems];
};
