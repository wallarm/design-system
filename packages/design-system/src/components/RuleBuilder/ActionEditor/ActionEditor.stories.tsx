/**
 * ActionEditor Stories
 *
 * Interactive examples for all 12 action types.
 */

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { newAction } from '../models/actionModel';
import { newAttack, newField, newGroup } from '../models/conditionModel';
import type { Choice } from '../types';
import { ActionEditor, type ActionEditorProps } from './ActionEditor';

const ATTACK_TYPES: Choice[] = [
  { value: 'sqli', label: 'SQL Injection' },
  { value: 'xss', label: 'Cross-Site Scripting' },
  { value: 'rce', label: 'Remote Code Execution' },
  { value: 'path_traversal', label: 'Path Traversal' },
];

// Sample condition tree with bindings for testing reference fields
const CONDITION_WITH_BINDINGS = newGroup('and');
CONDITION_WITH_BINDINGS.children = [
  { ...newAttack('sqli', 'flow'), bindAttack: 'a' },
  { ...newField(), bindPoint: 'n' },
];

// Empty condition tree for basic testing
const EMPTY_CONDITION = newGroup('and');

const meta = {
  title: 'Actions/ActionEditor',
  component: ActionEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Action configuration editor for RuleBuilder. Supports all 12 action types with conditional field rendering.',
      },
    },
  },
  argTypes: {
    value: { control: false },
    onChange: { action: 'changed' },
    attackTypes: { control: false },
    problems: { control: 'object' },
    showProblems: { control: 'boolean' },
  },
} satisfies Meta<typeof ActionEditor>;

export default meta;

export const AddAttack: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('add_attack')} attackTypes={ATTACK_TYPES} condition={EMPTY_CONDITION} />
);

AddAttack.storyName = 'Add Attack';

export const AddTag: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('add_tag')} attackTypes={ATTACK_TYPES} condition={EMPTY_CONDITION} />
);

AddTag.storyName = 'Add Tag';

export const SuppressAttack: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('suppress_attack')} attackTypes={ATTACK_TYPES} condition={CONDITION_WITH_BINDINGS} />
);

SuppressAttack.storyName = 'Suppress Attack';

export const MarkAttack: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('mark_attack')} attackTypes={ATTACK_TYPES} condition={CONDITION_WITH_BINDINGS} />
);

MarkAttack.storyName = 'Mark Attack';

export const Combine: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('combine')} attackTypes={ATTACK_TYPES} condition={CONDITION_WITH_BINDINGS} />
);

Combine.storyName = 'Combine';

export const ProcessingTimeLimit: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('processing_time_limit')} attackTypes={ATTACK_TYPES} condition={EMPTY_CONDITION} />
);

ProcessingTimeLimit.storyName = 'Processing Time Limit';

export const ProcessingSpaceLimit: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('processing_space_limit')} attackTypes={ATTACK_TYPES} condition={EMPTY_CONDITION} />
);

ProcessingSpaceLimit.storyName = 'Processing Space Limit';

export const EntryLimits: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('entry_limits')} attackTypes={ATTACK_TYPES} condition={CONDITION_WITH_BINDINGS} />
);

EntryLimits.storyName = 'Entry Limits';

export const DisableParsers: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('disable_parsers')} attackTypes={ATTACK_TYPES} condition={CONDITION_WITH_BINDINGS} />
);

DisableParsers.storyName = 'Disable Parsers';

export const AllowParsers: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('allow_parsers')} attackTypes={ATTACK_TYPES} condition={CONDITION_WITH_BINDINGS} />
);

AllowParsers.storyName = 'Allow Parsers';

export const ForceParser: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('force_parser')} attackTypes={ATTACK_TYPES} condition={CONDITION_WITH_BINDINGS} />
);

ForceParser.storyName = 'Force Parser';

export const DisableRule: StoryFn<ActionEditorProps> = args => (
  <ActionEditor {...args} value={newAction('disable_rule')} attackTypes={ATTACK_TYPES} condition={EMPTY_CONDITION} />
);

DisableRule.storyName = 'Disable Rule';

export const WithValidationProblems: StoryFn<ActionEditorProps> = args => (
  <ActionEditor
    {...args}
    value={newAction('add_attack')}
    attackTypes={ATTACK_TYPES}
    condition={EMPTY_CONDITION}
    problems={['Attack type is required', 'Comment should not be empty']}
    showProblems={true}
  />
);

WithValidationProblems.storyName = 'With Validation Problems';

export const RawAction: StoryFn<ActionEditorProps> = args => (
  <ActionEditor
    {...args}
    value={{
      kind: 'raw',
      raw: { action_type: 'unknown_action', custom_field: 'value' },
      target: { whole: true, context: 'http_request', segments: [] },
    }}
    attackTypes={ATTACK_TYPES}
    condition={EMPTY_CONDITION}
  />
);

RawAction.storyName = 'Raw Action (Uneditable)';
