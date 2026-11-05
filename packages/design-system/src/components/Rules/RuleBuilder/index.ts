/**
 * RuleBuilder - Rule authoring component for Wallarm WAF rules
 *
 * A compound component system for building and editing Wallarm WAF rules.
 * Integrates with PointSelector for point selection and provides full CRUD
 * operations for condition trees and action configuration.
 *
 * ## Foundational Layer (Phase 1)
 *
 * This file exports the foundational types, models, and utilities.
 * UI components (RuleBuilder, ConditionTree, ActionEditor, etc.) will be
 * added in Phase 2.
 *
 * ## Usage
 *
 * ```typescript
 * import {
 *   type GroupCondition,
 *   type ActionDraft,
 *   newGroup,
 *   newAction,
 *   toProtonCondition,
 *   toProtonAction,
 *   fromProtonCondition,
 *   fromProtonAction,
 *   conditionProblems,
 *   actionProblems,
 * } from '@wallarm-org/design-system';
 *
 * // Create new condition tree
 * const condition = newGroup('and');
 *
 * // Create new action
 * const action = newAction('add_attack');
 *
 * // Validate
 * const errors = conditionProblems(condition);
 *
 * // Convert to API format
 * const protonCondition = toProtonCondition(condition);
 * const protonAction = toProtonAction(action);
 * ```
 */

// UI Components - ActionEditor
// UI Components - ActionEditor CVA Classes
export {
  ActionEditor,
  type ActionEditorProps,
  ActionFields,
  type ActionFieldsProps,
  ActionTargetPicker,
  type ActionTargetPickerProps,
  ActionTypeSelect,
  type ActionTypeSelectProps,
  AttackTypeField,
  type AttackTypeFieldProps,
  actionEditorVariants,
  actionFieldsVariants,
  actionTargetPickerVariants,
} from './ActionEditor';
// UI Components - ConditionTree
// UI Components - CVA Classes
export {
  AddConditionMenu,
  type AddConditionMenuProps,
  AttackCondition as AttackConditionComponent,
  type AttackConditionProps,
  addConditionButtonVariants,
  ConditionCard,
  type ConditionCardProps,
  ConditionTree,
  type ConditionTreeProps,
  conditionCardVariants,
  conditionTreeVariants,
  FieldCondition as FieldConditionComponent,
  type FieldConditionProps,
  GroupCondition as GroupConditionComponent,
  type GroupConditionProps,
  groupBorderVariants,
  operatorSelectVariants,
  SampleCondition as SampleConditionComponent,
  type SampleConditionProps,
  SignalCondition as SignalConditionComponent,
  type SignalConditionProps,
  TagCondition as TagConditionComponent,
  type TagConditionProps,
} from './ConditionTree';
// UI Components - RuleBuilder CVA Classes
export {
  ruleBuilderVariants,
  summaryCardVariants,
  summaryNestedVariants,
  summaryVariants,
} from './classes';
// Models - Action
export {
  fromProtonAction,
  newAction,
  toProtonAction,
} from './models/actionModel';
// Models - Condition
export {
  conditionProblems,
  EMPTY_FIELD_VALUE,
  fieldComplete,
  fromProtonCondition,
  newAttack,
  newField,
  newGroup,
  newSample,
  newSignal,
  newTag,
  nodeId,
  toProtonCondition,
} from './models/conditionModel';
// Models - Validation
export {
  actionProblems,
  isActionValid,
  isValidDuration,
  isValidInteger,
  isValidQuantity,
  validators,
} from './models/validation';
// UI Components - RuleBuilder (Main Orchestrator)
export { RuleBuilder, type RuleBuilderProps, type RuleBuilderSection } from './RuleBuilder';
// UI Components - Summary (Read-only views)
export {
  ActionSummary,
  type ActionSummaryProps,
  ConditionSummary,
  type ConditionSummaryProps,
} from './Summary';
// Shared Components
export { ChoiceSelect, type ChoiceSelectProps } from './shared';
// Types
export type {
  ActionDraft,
  ActionKind,
  ActionTarget,
  AttackCondition,
  Choice,
  ConditionNode,
  FieldCondition,
  GroupCondition,
  GroupOperator,
  ProtonAction,
  ProtonCheck,
  ProtonCondition,
  RawCondition,
  SampleCondition,
  SignalCondition,
  SignalType,
  TagCondition,
} from './types';
// Utilities - Constants
export {
  ACTION_KIND_CHOICES,
  ADDABLE_NODE_KINDS,
  CHECK_TYPE_CHOICES,
  CONTEXT_CHOICES,
  DEFAULT_PRIORITY,
  DEFAULT_SEPARATOR,
  DUPLICATE_CONTAINERS,
  OPERATOR_CHOICES,
  RESOURCE_LIMITS,
  SIGNAL_TYPE_CHOICES,
  TARGET_REQUIREMENT,
} from './utils/constants';
// Utilities - Helpers
export {
  countChecks,
  countNodesOfKind,
  findNodeById,
  getLeafNodes,
  hasDescendantOfKind,
  isLeafNode,
  mapNode,
  maxDepth,
  removeNode,
} from './utils/helpers';
