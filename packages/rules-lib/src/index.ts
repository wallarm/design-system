// Proton SDK wrapper

// Point utilities (keys providers)
export { PARSER_VOCABULARY, STATIC_KEYS, staticKeysProvider } from './point';
export type {
  CheckError,
  CheckOptions,
  CheckResult,
  CheckResultError,
  CheckResultSuccess,
  CompleteOptions,
  Completion,
  CompletionItem,
  Fix,
  Profile,
  Proton,
  ProtonPoint,
  RuleContext,
  SegmentConstructors,
  Step,
  VersionInfo,
  Vocabulary,
} from './proton';
export { initProton, useProton } from './proton';
// Rule Builder models and types (components removed to avoid cyclic dependency)
// Use @wallarm-org/design-system/RuleBuilder for components
export {
  // Action model
  ACTION_KINDS,
  type ActionDraft,
  type ActionKind,
  type ActionTarget,
  // Attack types
  ATTACK_TYPES,
  type AttackCondition,
  actionProblems,
  // Signal choices and types
  type Choice,
  // Condition model
  type ConditionNode,
  conditionProblems,
  DUPLICATE_CONTAINERS,
  EMPTY_FIELD_VALUE,
  type FieldCondition,
  fieldComplete,
  fromProtonAction,
  fromProtonCondition,
  type GroupCondition,
  type GroupOperator,
  LIMITS,
  labelOf,
  newAction,
  newField,
  newGroup,
  nodeId,
  // Types
  type PointSelectorStage,
  type PointSelectorValue,
  type ProtonCondition,
  type RawCondition,
  SIGNAL_TYPES,
  type SignalCondition,
  type SignalType,
  TARGET_FOR,
  toProtonAction,
  toProtonCondition,
} from './RuleBuilder';
// Components (ActionEditor, RuleBuilder, ConditionTree, etc.) removed
// - They import from @wallarm-org/design-system, creating cyclic dependency
// - Use @wallarm-org/design-system instead for all RuleBuilder components
// Rule types
export type {
  Action,
  ActionType,
  AttackPayload,
  KnownLabels,
  TagPayload,
} from './ruleTypes/action';
export type {
  AttackFilter,
  CheckNode,
  CheckType,
  PairingCheck,
  PointCheck,
  SampleCheck,
  SignalFilter,
  TagFilter,
  Target,
} from './ruleTypes/check';
export { isPairingCheck, isPointCheck, isSampleCheck } from './ruleTypes/check';
export type { Condition, OperatorNode } from './ruleTypes/condition';
export type { Rule, RuleMeta, RuleScope } from './ruleTypes/rule';
// Rule types
export type { Ruleset, RulesetMeta } from './ruleTypes/ruleset';
// Sample message generation
export type { SampleToken, SampleTokenRole, SampleValue } from './sample';
export { sampleMessage } from './sample';
// Segment builder helpers for tests and stories
export { ENCODINGS, FORMATS, headerSeg, keySeg, nativeSeg, seg } from './segmentHelpers';
// UI helpers (presentation logic, not grammar)
// Use these + SDK API for all point operations
export * from './ui';
// Point validation helpers
export {
  canonicalizePoint,
  isExactPoint,
  validatePoint,
} from './validation/pointValidator';
// Validation
export type { ValidationError } from './validation/ruleValidator';
export { validateRule } from './validation/ruleValidator';
