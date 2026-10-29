/**
 * Rule Builder Data Models
 *
 * Pure data models for rule conditions and actions. No UI components - use
 * @wallarm-org/design-system/RuleBuilder for UI.
 *
 * This package provides SDK integration, types, and serialization/deserialization
 * logic for Proton rules. All React components have been moved to @wallarm-org/design-system
 * to avoid cyclic dependencies.
 */

// Action model
export {
  ACTION_KINDS,
  type ActionDraft,
  type ActionKind,
  type ActionTarget,
  actionProblems,
  fromProtonAction,
  newAction,
  TARGET_FOR,
  toProtonAction,
} from './actionModel';
// Attack types
export { ATTACK_TYPES } from './attackTypes';
// Condition model
export {
  type AttackCondition,
  type ConditionNode,
  conditionProblems,
  EMPTY_FIELD_VALUE,
  type FieldCondition,
  fieldComplete,
  fromProtonCondition,
  type GroupCondition,
  type GroupOperator,
  newField,
  newGroup,
  nodeId,
  type ProtonCondition,
  type RawCondition,
  type SignalCondition,
  type SignalType,
  toProtonCondition,
} from './conditionModel';
// Signal choices and types
export { type Choice, DUPLICATE_CONTAINERS, LIMITS, labelOf, SIGNAL_TYPES } from './signalChoices';
// Types
export type { PointSelectorStage, PointSelectorValue } from './types';
