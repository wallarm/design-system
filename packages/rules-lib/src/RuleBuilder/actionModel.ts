import type { RuleContext, Segment } from '../ui';
import type { Choice } from './signalChoices';

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

/**
 * What a rule does when its condition holds — the actions a rule author
 * writes in proton format 0.10.1 (`rules-framework-actions.md`). The parser
 * settings (0.10.2) and `disable_rule` are not offered; a stored action the
 * builder cannot show is kept as written.
 */
export type ActionKind =
  | 'add_attack'
  | 'add_tag'
  | 'suppress_attack'
  | 'mark_attack'
  | 'combine'
  | 'processing_time_limit'
  | 'processing_space_limit'
  | 'entry_limits'
  | 'disable_parsers'
  | 'allow_parsers'
  | 'force_parser'
  | 'disable_rule';

/** Each action in plain words, in menu order. */
export const ACTION_KINDS: Choice[] = [
  { value: 'add_attack', label: 'Mark the request as an attack' },
  { value: 'add_tag', label: 'Tag the request' },
  { value: 'suppress_attack', label: 'Ignore detected attacks' },
  { value: 'mark_attack', label: 'Report detected attacks without blocking' },
  { value: 'combine', label: 'Join repeated keys into one value' },
  { value: 'processing_time_limit', label: 'Limit processing time' },
  { value: 'processing_space_limit', label: 'Limit processing memory' },
  { value: 'entry_limits', label: 'Limit the size of values' },
  { value: 'disable_parsers', label: 'Disable automatic parsers' },
  { value: 'allow_parsers', label: 'Allow only specific parsers' },
  { value: 'force_parser', label: 'Force a specific parser' },
  { value: 'disable_rule', label: 'Disable other rules conditionally' },
];

/** Where an action lands: the whole request (`flow`) or a point. */
export interface ActionTarget {
  whole: boolean;
  context: RuleContext;
  segments: Segment[];
  /** SDK canonical form (stored after validation) */
  canonical?: string;
  /** SDK canonical version when point was canonicalized */
  canonicalVersion?: number;
}

export interface ActionDraft {
  kind: ActionKind | 'raw';
  /** add_attack, suppress_attack, mark_attack: the attack type (empty = any, filters only). */
  attackType: string;
  /** add_attack: a note shown with the attack. */
  comment: string;
  /** add_attack, add_tag, mark_attack: report without enforcing. */
  experimental: boolean;
  tagKey: string;
  tagValue: string;
  /** combine: what joins the repeated values. */
  separator: string;
  /** processing_time_limit (Go duration) / processing_space_limit (quantity). */
  limit: string;
  /** entry_limits (quantities). */
  softLimit: string;
  hardLimit: string;
  /** processing limits, entry_limits: higher wins when rules disagree. */
  priority: string;
  target: ActionTarget;
  /** disable_parsers, allow_parsers: parser names (comma-separated) or "all" */
  parsers: string;
  /** force_parser: single parser name */
  parser: string;
  /** disable_rule: comma-separated rule IDs */
  ruleIds: string;
  /** kind `raw`: the stored action as it is. */
  raw?: Record<string, unknown>;
}

const WHOLE_REQUEST: ActionTarget = { whole: true, context: 'http_request', segments: [] };

export const newAction = (kind: ActionKind = 'add_attack'): ActionDraft => ({
  kind,
  attackType: '',
  comment: '',
  experimental: false,
  tagKey: '',
  tagValue: '',
  separator: ', ',
  limit: '',
  softLimit: '',
  hardLimit: '',
  priority: '',
  parsers: '',
  parser: '',
  ruleIds: '',
  target: TARGET_FOR[kind] === 'point' ? { ...WHOLE_REQUEST, whole: false } : WHOLE_REQUEST,
});

/** Which destinations each action accepts. */
export const TARGET_FOR: Record<ActionKind, 'flow' | 'point' | 'either'> = {
  add_attack: 'either',
  add_tag: 'either',
  suppress_attack: 'either',
  mark_attack: 'either',
  combine: 'point',
  processing_time_limit: 'flow',
  processing_space_limit: 'flow',
  entry_limits: 'point',
  disable_parsers: 'point',
  allow_parsers: 'point',
  force_parser: 'point',
  disable_rule: 'flow', // disable_rule targets no node (rule-level)
};

const targetJson = (t: ActionTarget) => [
  { context: t.context, point: t.whole ? 'flow' : pointOf(t.segments) },
];

const priorityOf = (d: ActionDraft) =>
  d.priority.trim() !== '' && Number.isInteger(Number(d.priority))
    ? { priority: Number(d.priority) }
    : {};

/** The draft as one proton action object — what rules-api stores. */
export const toProtonAction = (d: ActionDraft): Record<string, unknown> => {
  const target = targetJson(d.target);
  switch (d.kind) {
    case 'raw':
      return d.raw ?? {};
    case 'add_attack':
      return {
        action_type: 'add_attack',
        target,
        attack: {
          attack_type: d.attackType,
          ...(d.comment.trim() ? { comment: d.comment.trim() } : {}),
        },
        ...(d.experimental ? { experimental: true } : {}),
      };
    case 'add_tag':
      return {
        action_type: 'add_tag',
        target,
        tag: { key: d.tagKey, value: d.tagValue },
        ...(d.experimental ? { experimental: true } : {}),
      };
    case 'suppress_attack':
      return {
        action_type: 'suppress_attack',
        target,
        ...(d.attackType ? { attack: { attack_type: d.attackType } } : {}),
      };
    case 'mark_attack':
      return {
        action_type: 'mark_attack',
        target,
        ...(d.attackType ? { attack: { attack_type: d.attackType } } : {}),
        experimental: true,
      };
    case 'combine':
      return { action_type: 'combine', target, separator: d.separator };
    case 'processing_time_limit':
    case 'processing_space_limit':
      return {
        action_type: d.kind,
        target: targetJson(WHOLE_REQUEST),
        limit: d.limit.trim(),
        ...priorityOf(d),
      };
    case 'entry_limits':
      return {
        action_type: 'entry_limits',
        target,
        ...(d.softLimit.trim() ? { entry_size_soft_limit: d.softLimit.trim() } : {}),
        ...(d.hardLimit.trim() ? { entry_size_hard_limit: d.hardLimit.trim() } : {}),
        ...priorityOf(d),
      };
    case 'disable_parsers':
      return {
        action_type: 'disable_parsers',
        target,
        parsers:
          d.parsers.trim() === 'all'
            ? 'all'
            : d.parsers
                .split(',')
                .map(p => p.trim())
                .filter(Boolean),
        ...priorityOf(d),
      };
    case 'allow_parsers':
      return {
        action_type: 'allow_parsers',
        target,
        parsers:
          d.parsers.trim() === 'all'
            ? 'all'
            : d.parsers
                .split(',')
                .map(p => p.trim())
                .filter(Boolean),
        ...priorityOf(d),
      };
    case 'force_parser':
      return {
        action_type: 'force_parser',
        target,
        parser: d.parser.trim(),
        ...priorityOf(d),
      };
    case 'disable_rule':
      return {
        action_type: 'disable_rule',
        rule_ids: d.ruleIds
          .split(',')
          .map(id => id.trim())
          .filter(Boolean),
      };
    default:
      return {};
  }
};

const GO_DURATION = /^(\d+(\.\d+)?(ns|us|µs|ms|s|m|h))+$/;
const QUANTITY = /^(\d+(\.\d+)?|\.\d+)(k|M|G|T|Ki|Mi|Gi|Ti)?$/;

/** What is missing or malformed, in words; empty when the action can be saved.
 *  Mirrors proton's load-time checks so the form says it before the API does. */
export const actionProblems = (d: ActionDraft): string[] => {
  const problems: string[] = [];
  if (d.kind === 'raw') return problems;
  if (TARGET_FOR[d.kind] !== 'flow' && !d.target.whole && d.target.segments.length === 0) {
    problems.push('Say where the action applies.');
  }
  if (d.kind === 'add_attack' && !d.attackType.trim()) problems.push('Choose the attack type.');
  if (d.kind === 'add_tag' && !d.tagKey.trim()) problems.push('Give the tag a key.');
  if (d.kind === 'processing_time_limit' && !GO_DURATION.test(d.limit.trim())) {
    problems.push('Write the time limit with a unit, for example 5ms or 1.5s.');
  }
  if (d.kind === 'processing_space_limit' && !QUANTITY.test(d.limit.trim())) {
    problems.push('Write the memory limit as a size, for example 512Ki or 2Mi.');
  }
  if (d.kind === 'entry_limits') {
    const soft = d.softLimit.trim();
    const hard = d.hardLimit.trim();
    if (!soft && !hard) problems.push('Set a soft limit, a hard limit, or both.');
    if (soft && !QUANTITY.test(soft))
      problems.push('Write the soft limit as a size, for example 1Ki.');
    if (hard && !QUANTITY.test(hard))
      problems.push('Write the hard limit as a size, for example 64Ki.');
  }
  if (d.priority.trim() !== '' && !Number.isInteger(Number(d.priority))) {
    problems.push('Priority is a whole number.');
  }
  return problems;
};

const KINDS: ActionKind[] = [
  'add_attack',
  'add_tag',
  'suppress_attack',
  'mark_attack',
  'combine',
  'processing_time_limit',
  'processing_space_limit',
  'entry_limits',
];

/** A stored action as a draft; one the builder cannot show stays `raw`. */
export const fromProtonAction = (action: unknown): ActionDraft => {
  const a = (Array.isArray(action) ? action[0] : action) as Record<string, unknown> | undefined;
  const kind = a?.action_type as ActionKind | undefined;
  const raw = (): ActionDraft => ({ ...newAction(), kind: 'raw', raw: a ?? {} });
  if (!a || !kind || !KINDS.includes(kind) || !Array.isArray(a.target) || a.target.length !== 1)
    return raw();
  const t = a.target[0] as { context?: string; point?: string };
  const context = (t.context as RuleContext) ?? 'http_request';
  let target: ActionTarget = WHOLE_REQUEST;
  if (t.point !== 'flow') {
    const segments = typeof t.point === 'string' ? segmentsOfPoint(t.point, context) : null;
    if (!segments) return raw();
    target = { whole: false, context, segments };
  }
  const attack = (a.attack ?? {}) as { attack_type?: string; comment?: string };
  const tag = (a.tag ?? {}) as { key?: string; value?: string };
  return {
    ...newAction(kind),
    attackType: attack.attack_type ?? '',
    comment: attack.comment ?? '',
    experimental: a.experimental === true,
    tagKey: tag.key ?? '',
    tagValue: tag.value ?? '',
    separator: typeof a.separator === 'string' ? a.separator : ', ',
    limit: typeof a.limit === 'string' ? a.limit : '',
    softLimit: typeof a.entry_size_soft_limit === 'string' ? a.entry_size_soft_limit : '',
    hardLimit: typeof a.entry_size_hard_limit === 'string' ? a.entry_size_hard_limit : '',
    priority: typeof a.priority === 'number' ? String(a.priority) : '',
    target,
  };
};
