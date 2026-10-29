/**
 * UI Helpers for Point Selector
 *
 * Presentation logic and constants, separate from SDK grammar.
 * Use these + SDK API instead of pointGrammar.
 */

export type { PointCheckResult } from './conditions';
// Conditions
export { CONDITIONS, checkOf, conditionLabel, takesValue } from './conditions';
// Constants and vocabularies
export {
  COMMON_COOKIES,
  COMMON_HEADERS,
  JWT_CLAIMS,
  NAME_DESCRIPTIONS,
  NATIVES,
  PART_HEADERS,
  PICK_LABELS,
} from './constants';
// Description and display
export { describe, listTitle } from './describe';
// Name steps
export {
  isCaseFixed,
  isKeyStep,
  isPositionStep,
  nameRows,
  nounOf,
  segsFor,
} from './nameSteps';
// Search and filtering
export { fuzzyScore, pickByNumber } from './search';
// Types
export type {
  ConditionType,
  FixedRow,
  NameRow,
  NameStep,
  NextOption,
  PickKind,
  PickStep,
  ProtonCheck,
  RuleContext,
  Segment,
  SegmentKind,
} from './types';
