/**
 * Action Model
 *
 * Converts between UI action draft and Proton API format.
 * Handles action transformations, factory functions, and validation.
 */

import type { Proton } from '@wallarm-org/rules-lib';
import { pointOf } from '../../../PointSelector/sdkBridge';
import type { RuleContext, Segment } from '../../../PointSelector/types';
import type { ActionDraft, ActionKind, ActionTarget, ProtonAction } from '../types';
import { DEFAULT_SEPARATOR, TARGET_REQUIREMENT } from '../utils/constants';

/**
 * Whole request target (flow).
 */
const WHOLE_REQUEST: ActionTarget = {
  whole: true,
  context: 'http_request',
  segments: [],
};

/**
 * Create a new action draft with default values.
 *
 * @param kind - Action kind (default: 'add_attack')
 * @returns New ActionDraft
 */
export function newAction(kind: ActionKind = 'add_attack'): ActionDraft {
  const targetType = TARGET_REQUIREMENT[kind];
  const needsPoint = targetType === 'point';

  return {
    kind,
    attackType: '',
    comment: '',
    experimental: false,
    tagKey: '',
    tagValue: '',
    separator: DEFAULT_SEPARATOR,
    limit: '',
    softLimit: '',
    hardLimit: '',
    priority: '',
    parsers: [],
    parser: '',
    ruleIds: [],
    target: needsPoint ? { ...WHOLE_REQUEST, whole: false } : WHOLE_REQUEST,
  };
}

/**
 * Convert ActionTarget to Proton target array.
 *
 * @param target - Action target
 * @param proton - Optional Proton SDK instance for canonical rendering
 * @returns Proton target array
 */
function targetToProton(
  target: ActionTarget,
  proton?: Proton | null,
): Array<{ context: RuleContext; point: string }> {
  return [
    {
      context: target.context,
      point: target.whole ? 'flow' : pointOf(target.segments, proton),
    },
  ];
}

/**
 * Convert priority string to Proton priority object.
 *
 * @param draft - Action draft
 * @returns Priority object if valid, empty object otherwise
 */
function priorityOf(draft: ActionDraft): { priority?: number } {
  const trimmed = draft.priority?.trim() ?? '';
  if (trimmed !== '' && Number.isInteger(Number(trimmed))) {
    return { priority: Number(trimmed) };
  }
  return {};
}

/**
 * Extract binding fields from action draft.
 *
 * @param draft - Action draft
 * @returns Object with binding fields if present
 */
function bindingFields(draft: ActionDraft): {
  attack_ref?: string;
  target_ref?: string;
  target_role?: string;
} {
  const result: { attack_ref?: string; target_ref?: string; target_role?: string } = {};

  if (draft.attackRef) {
    result.attack_ref = draft.attackRef;
  }

  if (draft.targetRef) {
    result.target_ref = draft.targetRef;
  }

  if (draft.targetRole) {
    result.target_role = draft.targetRole;
  }

  return result;
}

/**
 * Convert UI action draft to Proton API format.
 *
 * @param draft - Action draft
 * @param proton - Optional Proton SDK instance for canonical point rendering
 * @returns Proton action object
 */
export function toProtonAction(draft: ActionDraft, proton?: Proton | null): ProtonAction {
  const target = targetToProton(draft.target, proton);

  switch (draft.kind) {
    case 'raw':
      return (draft.raw ?? {}) as ProtonAction;

    case 'add_attack': {
      const action: ProtonAction = {
        action_type: 'add_attack',
        target,
        attack: {
          attack_type: draft.attackType ?? '',
        },
        ...bindingFields(draft),
      };

      if (draft.comment?.trim()) {
        action.attack!.comment = draft.comment.trim();
      }

      if (draft.known) {
        action.attack!.known = draft.known;
      }

      if (draft.knownFalse) {
        action.attack!.known_false = draft.knownFalse;
      }

      if (draft.experimental) {
        action.experimental = true;
      }

      return action;
    }

    case 'add_tag': {
      const action: ProtonAction = {
        action_type: 'add_tag',
        target,
        tag: {
          key: draft.tagKey ?? '',
          value: draft.tagValue ?? '',
        },
        ...bindingFields(draft),
      };

      if (draft.experimental) {
        action.experimental = true;
      }

      return action;
    }

    case 'suppress_attack': {
      const action: ProtonAction = {
        action_type: 'suppress_attack',
        target,
        ...bindingFields(draft),
      };

      if (draft.attackType?.trim()) {
        action.attack = { attack_type: draft.attackType.trim() };
      }

      return action;
    }

    case 'mark_attack': {
      const action: ProtonAction = {
        action_type: 'mark_attack',
        target,
        ...bindingFields(draft),
      };

      // Per rules-framework-actions.md:460-462, experimental is optional.
      // At least one of: experimental, known, known_false must be present.
      if (draft.experimental !== undefined) {
        action.experimental = draft.experimental;
      }

      if (draft.attackType?.trim() || draft.known || draft.knownFalse) {
        action.attack = {};

        if (draft.attackType?.trim()) {
          action.attack.attack_type = draft.attackType.trim();
        }

        if (draft.known) {
          action.attack.known = draft.known;
        }

        if (draft.knownFalse) {
          action.attack.known_false = draft.knownFalse;
        }
      }

      return action;
    }

    case 'combine':
      return {
        action_type: 'combine',
        target,
        separator: draft.separator ?? DEFAULT_SEPARATOR,
        ...bindingFields(draft),
      };

    case 'processing_time_limit':
      return {
        action_type: 'processing_time_limit',
        target: targetToProton(WHOLE_REQUEST, proton),
        limit: draft.limit?.trim() ?? '',
        ...priorityOf(draft),
      };

    case 'processing_space_limit':
      return {
        action_type: 'processing_space_limit',
        target: targetToProton(WHOLE_REQUEST, proton),
        limit: draft.limit?.trim() ?? '',
        ...priorityOf(draft),
      };

    case 'entry_limits': {
      const action: ProtonAction = {
        action_type: 'entry_limits',
        target,
        ...priorityOf(draft),
        ...bindingFields(draft),
      };

      if (draft.softLimit?.trim()) {
        action.entry_size_soft_limit = draft.softLimit.trim();
      }

      if (draft.hardLimit?.trim()) {
        action.entry_size_hard_limit = draft.hardLimit.trim();
      }

      return action;
    }

    case 'disable_parsers':
      return {
        action_type: 'disable_parsers',
        target,
        parsers: draft.parsers ?? [],
        ...priorityOf(draft),
        ...bindingFields(draft),
      };

    case 'allow_parsers':
      return {
        action_type: 'allow_parsers',
        target,
        parsers: draft.parsers ?? [],
        ...priorityOf(draft),
        ...bindingFields(draft),
      };

    case 'force_parser':
      return {
        action_type: 'force_parser',
        target,
        parser: draft.parser ?? '',
        ...priorityOf(draft),
        ...bindingFields(draft),
      };

    case 'disable_rule':
      return {
        action_type: 'disable_rule',
        rule_ids: draft.ruleIds ?? [],
      };

    default:
      // Exhaustive check: all ActionKind values are handled above
      // This should never be reached at runtime
      return { action_type: 'unknown', target } as ProtonAction;
  }
}

/**
 * Parse canonical point string into segments for UI.
 *
 * Uses SDK parse() when available. If SDK not loaded, returns empty segments array
 * and relies on canonical form stored in ActionTarget.
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
 * Parse Proton target to ActionTarget.
 *
 * @param target - Proton target object
 * @param proton - SDK instance for parsing point strings
 * @returns ActionTarget
 */
function parseTarget(
  target: { context?: string; point?: string } | undefined,
  proton: Proton | null,
): ActionTarget {
  const context = (target?.context as RuleContext) ?? 'http_request';
  const point = target?.point ?? 'flow';

  if (point === 'flow') {
    return WHOLE_REQUEST;
  }

  const segments = segmentsOfPoint(point, context, proton);
  const currentVersion = proton ? parseInt(proton.version().canonical) : undefined;

  return {
    whole: false,
    context,
    segments,
    canonical: point, // Store canonical form from API
    canonicalVersion: currentVersion,
  };
}

/**
 * List of known action kinds.
 */
const KNOWN_KINDS: ActionKind[] = [
  'add_attack',
  'add_tag',
  'suppress_attack',
  'mark_attack',
  'combine',
  'processing_time_limit',
  'processing_space_limit',
  'entry_limits',
  'disable_parsers',
  'allow_parsers',
  'force_parser',
  'disable_rule',
];

/**
 * Convert Proton API format to UI action draft.
 *
 * @param action - Proton action (may be array or object)
 * @param proton - SDK instance for parsing point strings (optional)
 * @returns ActionDraft
 */
export function fromProtonAction(action: unknown, proton: Proton | null = null): ActionDraft {
  // Handle array format (take first action)
  const obj = (Array.isArray(action) ? action[0] : action) as Record<string, unknown> | undefined;

  // Fallback for invalid/unknown actions
  const raw = (): ActionDraft => ({ ...newAction(), kind: 'raw', raw: obj ?? {} });

  if (!obj || typeof obj !== 'object') {
    return raw();
  }

  const kind = obj.action_type as ActionKind | undefined;

  // Unknown action kind
  if (!kind || !KNOWN_KINDS.includes(kind)) {
    return raw();
  }

  // disable_rule has no target - it's the only action without one
  if (kind === 'disable_rule') {
    const ruleIds = Array.isArray(obj.rule_ids) ? obj.rule_ids : [];
    return {
      ...newAction(kind),
      ruleIds: ruleIds.map(id => String(id)),
    };
  }

  // All other actions require a target
  if (!Array.isArray(obj.target) || obj.target.length !== 1) {
    return raw();
  }

  const target = parseTarget(obj.target[0] as { context?: string; point?: string }, proton);
  const attack = (obj.attack ?? {}) as Record<string, unknown>;
  const tag = (obj.tag ?? {}) as { key?: string; value?: string };

  // Base action draft
  const draft: ActionDraft = {
    ...newAction(kind),
    attackType: typeof attack.attack_type === 'string' ? attack.attack_type : '',
    comment: typeof attack.comment === 'string' ? attack.comment : '',
    experimental: obj.experimental === true,
    tagKey: tag.key ?? '',
    tagValue: tag.value ?? '',
    separator: typeof obj.separator === 'string' ? obj.separator : DEFAULT_SEPARATOR,
    limit: typeof obj.limit === 'string' ? obj.limit : '',
    softLimit: typeof obj.entry_size_soft_limit === 'string' ? obj.entry_size_soft_limit : '',
    hardLimit: typeof obj.entry_size_hard_limit === 'string' ? obj.entry_size_hard_limit : '',
    priority: typeof obj.priority === 'number' ? String(obj.priority) : '',
    target,
  };

  // Extract known and known_false labels from attack object
  if (attack.known && typeof attack.known === 'object') {
    draft.known = attack.known as {
      cve?: string[];
      vuln?: string[];
      technique?: string[];
      payload?: string[];
      tool?: string[];
    };
  }

  if (attack.known_false !== undefined) {
    draft.knownFalse = attack.known_false as string | string[];
  }

  // Extract binding fields
  if (typeof obj.attack_ref === 'string') {
    draft.attackRef = obj.attack_ref;
  }

  if (typeof obj.target_ref === 'string') {
    draft.targetRef = obj.target_ref;
  }

  if (typeof obj.target_role === 'string') {
    draft.targetRole = obj.target_role as 'value' | 'name';
  }

  // Handle parser action fields
  if (kind === 'disable_parsers' || kind === 'allow_parsers') {
    // parsers can be "all" (string) or array of parser names
    if (typeof obj.parsers === 'string') {
      draft.parsers = obj.parsers;
    } else if (Array.isArray(obj.parsers)) {
      draft.parsers = obj.parsers.map(p => String(p));
    } else {
      draft.parsers = [];
    }
  }

  if (kind === 'force_parser') {
    draft.parser = typeof obj.parser === 'string' ? obj.parser : '';
  }

  return draft;
}
