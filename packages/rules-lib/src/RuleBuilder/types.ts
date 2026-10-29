import type { ConditionType, RuleContext, Segment } from '../ui';

/**
 * What the selector produces: the point, and how its value is matched.
 *
 * Stores both custom UI segments (for presentation) and SDK canonical form (for validation).
 * This hybrid approach allows SDK integration without breaking existing UI code.
 */
export interface PointSelectorValue {
  /** Custom UI segments with labels, nouns, etc. for presentation */
  segments: Segment[];
  /**
   * SDK canonical form (stored after validation, used for rules)
   * REQUIRED when point is valid. Must be stored with canonicalVersion.
   * See point-sdk.md "Version" section (lines 341-349)
   */
  canonical: string | null;
  /**
   * SDK canonical version when point was canonicalized
   * REQUIRED when canonical is set - these form an inseparable pair.
   * Re-canonicalize when SDK version changes to maintain correctness.
   * See point-sdk.md "Version" section (lines 341-349)
   */
  canonicalVersion: number | null;
  condition: ConditionType | null;
  value: string;
  ignoreCase: boolean;
}

export type PointSelectorStage = 'point' | 'condition' | 'value';
