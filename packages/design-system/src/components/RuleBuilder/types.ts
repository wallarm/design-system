/**
 * RuleBuilder Types
 *
 * Type definitions for the Rule Builder component system.
 * Compatible with PointSelector and @wallarm-org/rules-lib.
 *
 * @example Basic usage
 * ```tsx
 * import { RuleBuilder, newGroup, newAction } from '@wallarm-org/design-system';
 *
 * const [condition, setCondition] = useState(newGroup('and'));
 * const [action, setAction] = useState(newAction('add_attack'));
 *
 * <RuleBuilder
 *   ruleId='sql-injection-rule'
 *   ruleDescription='Detect SQL injection attempts'
 *   condition={condition}
 *   action={action}
 *   onConditionChange={setCondition}
 *   onActionChange={setAction}
 *   attackTypes={[
 *     { value: 'sqli', label: 'SQL Injection' },
 *     { value: 'xss', label: 'Cross-Site Scripting' },
 *   ]}
 * />
 * ```
 */

import type { PointSelectorValue, RuleContext, Segment } from '../PointSelector/types';

/**
 * How a group of conditions combines.
 *
 * @example
 * ```tsx
 * // AND: all conditions must match
 * const andGroup: GroupCondition = {
 *   kind: 'group',
 *   id: '1',
 *   operator: 'and',
 *   children: [condition1, condition2]
 * };
 *
 * // OR: at least one condition must match
 * const orGroup: GroupCondition = {
 *   kind: 'group',
 *   id: '2',
 *   operator: 'or',
 *   children: [condition1, condition2]
 * };
 *
 * // NOT: no conditions should match (inverted)
 * const notGroup: GroupCondition = {
 *   kind: 'group',
 *   id: '3',
 *   operator: 'not',
 *   children: [condition1]
 * };
 * ```
 */
export type GroupOperator = 'and' | 'or' | 'not';

/**
 * A condition on a value in the request or response.
 * Uses PointSelector for value selection and condition definition.
 *
 * @example Check if header equals specific value
 * ```tsx
 * const condition: FieldCondition = {
 *   kind: 'field',
 *   id: 'cond-1',
 *   context: 'http_request',
 *   value: {
 *     segments: [
 *       { kind: 'native', value: 'header' },
 *       { kind: 'key', value: 'authorization' }
 *     ],
 *     canonical: '[http:header][\'authorization\']',
 *     condition: 'equal',
 *     value: 'Bearer admin-token',
 *     ignoreCase: false,
 *   },
 * };
 * ```
 *
 * @example With binding (for bind_point)
 * ```tsx
 * const condition: FieldCondition = {
 *   kind: 'field',
 *   id: 'cond-2',
 *   context: 'http_request',
 *   value: { ...pointValue },
 *   bindPoint: 'user_id',  // Action can reference this as target_ref: 'user_id'
 * };
 * ```
 */
export interface FieldCondition {
  kind: 'field';
  id: string;
  context: RuleContext;
  value: PointSelectorValue;
  /** Bind name for bind_point (format 0.10.1+). Allows actions to reference matched nodes. */
  bindPoint?: string;
  /** Point reference name for point_ref (format 0.10.1+). */
  pointRef?: string;
  /** Point role for point_role (format 0.10.1+). */
  pointRole?: string;
}

/**
 * A condition the wizard cannot open (a point it cannot build).
 * Kept as is, shown as code, never silently rewritten.
 */
export interface RawCondition {
  kind: 'raw';
  id: string;
  check: Record<string, unknown>;
}

/**
 * "An attack was detected" — proton's `attack_present`.
 * When `absent: true`, becomes `attack_absent` (attack is NOT present).
 */
export interface AttackCondition {
  kind: 'attack';
  id: string;
  /** Empty string: any attack. */
  attackType: string;
  /** `flow` (anywhere in the request) or a specific point. */
  point: string;
  /** SDK canonical version when point was canonicalized */
  canonicalVersion?: number;
  /** When true, checks that attack is NOT present (attack_absent). */
  absent?: boolean;
  /** Attack source filter: 'rule', 'stamp', 'xml', 'gzip', 'deflate', 'brotli', 'zip', 'json'. */
  source?: string;
  /** Stamp IDs filter (requires source: 'stamp'). */
  stampIds?: string[];
  /** Rule IDs filter (requires source: 'rule'). */
  ruleIds?: string | string[];
  /** XML property filter: 'dtd', 'xinclude', 'stylesheet', 'xslt', 'schema', 'xml_base' (requires source: 'xml'). */
  property?: string | string[];
  /** XML reference filter (requires source: 'xml'). Format 0.10.3+. */
  reference?: {
    operator: 'equal' | 'startswith' | 'regex';
    value: string | string[];
  };
  /** Known attack labels (CVE, vuln, technique, payload, tool). Format 0.10.4+ adds tool. */
  known?: { cve?: string[]; vuln?: string[]; technique?: string[]; payload?: string[]; tool?: string[] };
  /** Known false positive reasons. */
  knownFalse?: string | string[];
  /** Bind name for bind_attack (format 0.10.1+). Allows actions to reference matched attacks. */
  bindAttack?: string;
}

/** The engine's own findings a rule can react to. */
export type SignalType = 'key_duplicate' | 'resource_overlimit';

/**
 * "A request anomaly was detected" — proton's `signal_present`.
 * When `absent: true`, becomes `signal_absent` (signal is NOT present).
 */
export interface SignalCondition {
  kind: 'signal';
  id: string;
  signalType: SignalType | '';
  /** `key_duplicate`: the container whose keys repeat (`[http:header]`, etc). */
  point: string;
  /** SDK canonical version when point was canonicalized */
  canonicalVersion?: number;
  /** `resource_overlimit`: which limit was exceeded. */
  limit: string;
  /** When true, checks that signal is NOT present (signal_absent). */
  absent?: boolean;
  /** `key_duplicate`: the duplicated key as a star key segment (e.g., "['q']"). */
  key?: string;
  /** Bind name for bind_point (format 0.10.1+). Allows actions to reference matched nodes. */
  bindPoint?: string;
}

/**
 * "A tag is present" — proton's `tag_present`.
 * When `absent: true`, becomes `tag_absent` (tag is NOT present).
 */
export interface TagCondition {
  kind: 'tag';
  id: string;
  /** Tag key to check for. */
  tagKey: string;
  /** Optional tag value to check. Empty string means any value. */
  tagValue: string;
  /** `flow` (anywhere in the request) or a specific point. */
  point: string;
  /** SDK canonical version when point was canonicalized */
  canonicalVersion?: number;
  /** When true, checks that tag is NOT present (tag_absent). */
  absent?: boolean;
}

/**
 * "Sample a percentage of flows" — proton's `sample`.
 * No context, no point, just a percent value (0-100).
 */
export interface SampleCondition {
  kind: 'sample';
  id: string;
  /** Percent of flows to sample (0-100). */
  percent: number;
}

/**
 * A group of conditions combined with an operator.
 * Forms the tree structure of conditions.
 */
export interface GroupCondition {
  kind: 'group';
  id: string;
  operator: GroupOperator;
  children: ConditionNode[];
}

/**
 * Union of all condition node types.
 * Forms a recursive tree structure via GroupCondition.
 */
export type ConditionNode =
  | FieldCondition
  | RawCondition
  | AttackCondition
  | SignalCondition
  | TagCondition
  | SampleCondition
  | GroupCondition;

/**
 * Proton condition tree: `{ operator, checks: [...] }`, checks can be nested.
 */
export interface ProtonCondition {
  operator: GroupOperator;
  checks: (ProtonCondition | Record<string, unknown>)[];
}

/**
 * Proton check object (leaf node in condition tree).
 */
export interface ProtonCheck {
  type: string;
  context?: RuleContext;
  point?: string | string[];
  value?: string | string[];
  case_sensitive?: boolean;
  attack?: {
    attack_type?: string | string[];
  };
  signal?: {
    signal_type?: string;
    limit?: string;
  };
  tag?: {
    key?: string;
    value?: string;
  };
  percent?: number;
  [key: string]: unknown;
}

/**
 * Action types that a rule can perform.
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

/**
 * Where an action applies: the whole request (`flow`) or a specific point.
 */
export interface ActionTarget {
  whole: boolean;
  context: RuleContext;
  segments: Segment[];
  /** SDK canonical form (stored after validation) */
  canonical?: string;
  /** SDK canonical version when point was canonicalized */
  canonicalVersion?: number;
}

/**
 * UI model for action configuration.
 * Different from API format — use toProtonAction/fromProtonAction for conversion.
 *
 * @example Add attack tag
 * ```tsx
 * const action: ActionDraft = {
 *   kind: 'add_attack',
 *   target: { whole: true, context: 'http_request', segments: [] },
 *   attackType: 'sqli',
 *   comment: 'SQL injection detected in user input',
 * };
 * ```
 *
 * @example Suppress specific attack using binding
 * ```tsx
 * const action: ActionDraft = {
 *   kind: 'suppress_attack',
 *   target: { whole: true, context: 'http_request', segments: [] },
 *   attackRef: 'detected_attack',  // References bind_attack from condition
 * };
 * ```
 *
 * @example Combine duplicate headers
 * ```tsx
 * const action: ActionDraft = {
 *   kind: 'combine',
 *   target: {
 *     whole: false,
 *     context: 'http_request',
 *     segments: [
 *       { kind: 'native', value: 'header' },
 *       { kind: 'key', value: 'cookie' }
 *     ],
 *     canonical: '[http:header][\'cookie\']',
 *   },
 *   separator: ', ',
 * };
 * ```
 */
export interface ActionDraft {
  kind: ActionKind | 'raw';

  // Common fields
  target: ActionTarget;
  experimental?: boolean;
  priority?: string;

  // Binding fields (reference what checks matched)
  /** Reference to bound attacks (for suppress_attack, mark_attack). */
  attackRef?: string;
  /** Reference to bound nodes (for actions with point destination). */
  targetRef?: string;
  /** Landing beside bound nodes. Per rules-framework-actions.md:193-197 */
  targetRole?: 'value' | 'name';

  // add_attack, mark_attack fields
  attackType?: string;
  comment?: string;
  /** Known attack labels (CVE, vuln, technique, payload, tool) - for add_attack and mark_attack. Format 0.10.4+ adds tool. */
  known?: { cve?: string[]; vuln?: string[]; technique?: string[]; payload?: string[]; tool?: string[] };
  /** Known false positive reasons - for add_attack and mark_attack. */
  knownFalse?: string | string[];

  // add_tag fields
  tagKey?: string;
  tagValue?: string;

  // combine fields
  separator?: string;

  // limit fields
  limit?: string;
  softLimit?: string;
  hardLimit?: string;

  // disable_parsers, allow_parsers fields
  parsers?: string | string[];

  // force_parser field
  parser?: string;

  // disable_rule field
  ruleIds?: string[];

  // Raw fallback
  raw?: Record<string, unknown>;
}

/**
 * Proton action object (API format).
 */
export interface ProtonAction {
  action_type: string;
  target?: Array<{ context: RuleContext; point: string }>;
  experimental?: boolean;
  priority?: number;
  attack?: {
    attack_type?: string | string[];
    comment?: string;
    known?: { cve?: string[]; vuln?: string[]; technique?: string[]; payload?: string[] };
    known_false?: string | string[];
  };
  tag?: {
    key?: string;
    value?: string;
  };
  separator?: string;
  limit?: string;
  entry_size_soft_limit?: string;
  entry_size_hard_limit?: string;
  parsers?: string | string[];
  parser?: string;
  rule_ids?: string[];
  [key: string]: unknown;
}

/**
 * Choice option for selects/dropdowns.
 */
export interface Choice {
  value: string;
  label: string;
  description?: string;
}
