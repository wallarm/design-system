/**
 * RuleBuilder Stories
 */

import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { newAction } from './models/actionModel';
import { newAttack, newField, newGroup, newSignal } from './models/conditionModel';
import { RuleBuilder, type RuleBuilderProps } from './RuleBuilder';
import { ActionSummary } from './Summary/ActionSummary';
import { ConditionSummary } from './Summary/ConditionSummary';
import type { ActionDraft, Choice, GroupCondition } from './types';

const meta = {
  title: 'Rules/RuleBuilder',
  component: RuleBuilder,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive rule authoring component for Wallarm WAF rules. Combines condition tree editing, action configuration, and JSON code generation.',
      },
    },
  },
  argTypes: {
    condition: { control: false },
    action: { control: false },
    onConditionChange: { action: 'onConditionChange' },
    onActionChange: { action: 'onActionChange' },
    attackTypes: { control: false },
    showProblems: { control: 'boolean' },
    sections: { control: 'check', options: ['conditions', 'action', 'code'] },
    afterConditions: { control: false },
  },
} satisfies Meta<typeof RuleBuilder>;

export default meta;

// Sample attack types
const attackTypes: Choice[] = [
  { value: 'sqli', label: 'SQL Injection' },
  { value: 'xss', label: 'Cross-Site Scripting' },
  { value: 'rce', label: 'Remote Code Execution' },
  { value: 'ptrav', label: 'Path Traversal' },
  { value: 'ldapi', label: 'LDAP Injection' },
];

/**
 * Interactive wrapper for stories
 */
const InteractiveRuleBuilder: StoryFn<RuleBuilderProps> = args => {
  const [condition, setCondition] = useState(args.condition);
  const [action, setAction] = useState(args.action);

  return (
    <RuleBuilder
      {...args}
      condition={condition}
      action={action}
      onConditionChange={setCondition}
      onActionChange={setAction}
    />
  );
};

/**
 * Empty rule - unconditional with default action
 */
export const EmptyRule: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
EmptyRule.args = {
  ruleId: 'empty-rule-1',
  ruleDescription: 'Empty rule for testing',
  condition: newGroup('and'),
  action: newAction('add_attack'),
  attackTypes,
  showProblems: false,
};

/**
 * Simple field condition
 */
export const SimpleFieldCondition: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
SimpleFieldCondition.args = {
  ruleId: 'bot-detection',
  ruleDescription: 'Detect bot traffic by User-Agent',
  condition: {
    ...newGroup('and'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [{ text: '[http:header:user-agent]', kind: 'native', label: 'User-Agent' }],
          condition: 'contains',
          value: 'bot',
          ignoreCase: true,
        },
      },
    ],
  },
  action: {
    ...newAction('add_attack'),
    attackType: 'bot',
  },
  attackTypes,
  showProblems: false,
};

/**
 * Complex nested conditions
 */
export const ComplexNestedConditions: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
ComplexNestedConditions.args = {
  ruleId: 'complex-sql-check',
  ruleDescription: 'Complex SQL injection detection with multiple conditions',
  condition: {
    ...newGroup('or'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [{ text: '[http:uri]', kind: 'native', label: 'URI' }],
          condition: 'contains',
          value: 'admin',
          ignoreCase: false,
        },
      },
      {
        ...newGroup('and'),
        children: [
          {
            ...newField('http_request'),
            value: {
              segments: [{ text: '[http:method]', kind: 'native', label: 'Method' }],
              condition: 'equal',
              value: 'POST',
              ignoreCase: false,
            },
          },
          {
            ...newAttack('sqli', 'flow'),
          },
        ],
      },
    ],
  },
  action: {
    ...newAction('add_tag'),
    tagKey: 'suspicious',
    tagValue: 'true',
  },
  attackTypes,
  showProblems: false,
};

/**
 * Attack detection condition
 */
export const AttackDetection: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
AttackDetection.args = {
  ruleId: 'suppress-xss',
  ruleDescription: 'Suppress XSS false positives',
  condition: {
    ...newGroup('and'),
    children: [newAttack('xss', 'flow')],
  },
  action: {
    ...newAction('suppress_attack'),
    attackType: 'xss',
  },
  attackTypes,
  showProblems: false,
};

/**
 * Signal (anomaly) detection
 */
export const SignalDetection: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
SignalDetection.args = {
  ruleId: 'detect-duplicate-headers',
  ruleDescription: 'Tag requests with duplicate headers',
  condition: {
    ...newGroup('and'),
    children: [newSignal('key_duplicate', '[http:header]')],
  },
  action: {
    ...newAction('add_tag'),
    tagKey: 'anomaly',
    tagValue: 'duplicate_headers',
  },
  attackTypes,
  showProblems: false,
};

/**
 * With validation problems shown
 */
export const WithValidationProblems: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
WithValidationProblems.args = {
  ruleId: 'invalid-rule',
  condition: {
    ...newGroup('and'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [],
          condition: null,
          value: '',
          ignoreCase: false,
        },
      },
    ],
  },
  action: {
    ...newAction('add_attack'),
    attackType: '', // Missing required field
  },
  attackTypes,
  showProblems: true,
};

/**
 * Conditions only (no action section)
 */
export const ConditionsOnly: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
ConditionsOnly.args = {
  ruleId: 'conditions-only',
  condition: newGroup('and'),
  action: newAction('add_attack'),
  attackTypes,
  showProblems: false,
  sections: ['conditions'],
};

/**
 * Action only (no conditions section)
 */
export const ActionOnly: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
ActionOnly.args = {
  ruleId: 'action-only',
  condition: newGroup('and'),
  action: newAction('add_attack'),
  attackTypes,
  showProblems: false,
  sections: ['action'],
};

/**
 * Code output only
 */
export const CodeOutputOnly: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
CodeOutputOnly.args = {
  ruleId: 'code-output-example',
  ruleDescription: 'Example rule showing generated JSON output',
  condition: {
    ...newGroup('and'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [{ text: '[http:uri]', kind: 'native', label: 'URI' }],
          condition: 'contains',
          value: 'admin',
          ignoreCase: false,
        },
      },
    ],
  },
  action: {
    ...newAction('add_attack'),
    attackType: 'sqli',
  },
  attackTypes,
  showProblems: false,
  sections: ['code'],
};

/**
 * All action types showcase
 */
export const AllActionTypes: StoryFn = () => {
  const baseCondition = {
    ...newGroup('and'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [{ text: '[http:uri]', kind: 'native', label: 'URI' }],
          condition: 'contains',
          value: 'test',
          ignoreCase: false,
        },
      },
    ],
  };

  const actions: ActionDraft[] = [
    { ...newAction('add_attack'), attackType: 'sqli' },
    { ...newAction('add_tag'), tagKey: 'env', tagValue: 'prod' },
    { ...newAction('suppress_attack'), attackType: 'xss' },
    { ...newAction('mark_attack'), attackType: 'rce' },
    { ...newAction('combine'), separator: ',' },
    { ...newAction('processing_time_limit'), limit: '1s' },
    { ...newAction('processing_space_limit'), limit: '10MB' },
    { ...newAction('entry_limits'), softLimit: '1KB', hardLimit: '10KB' },
  ];

  return (
    <div className='flex flex-col gap-32'>
      {actions.map((action, i) => {
        const [currentAction, setAction] = useState(action);
        return (
          <div key={i} className='rounded-8 border border-border-primary-light p-16'>
            <RuleBuilder
              ruleId={`action-example-${i}`}
              condition={baseCondition}
              action={currentAction}
              onConditionChange={() => {}}
              onActionChange={setAction}
              attackTypes={attackTypes}
              showProblems={false}
              sections={['action']}
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * ConditionSummary component (read-only)
 */
export const ConditionSummaryExample: StoryFn = () => {
  const condition: GroupCondition = {
    ...newGroup('and'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [{ text: '[http:header:user-agent]', kind: 'native', label: 'User-Agent' }],
          condition: 'contains',
          value: 'bot',
          ignoreCase: true,
        },
      },
      {
        ...newAttack('xss', 'flow'),
      },
    ],
  };

  return <ConditionSummary condition={condition} />;
};

/**
 * ActionSummary component (read-only)
 */
export const ActionSummaryExample: StoryFn = () => {
  const action: ActionDraft = {
    ...newAction('add_attack'),
    attackType: 'sqli',
    comment: 'Detected SQL injection attempt',
    experimental: true,
  };

  return <ActionSummary action={action} attackTypes={attackTypes} />;
};

/**
 * Full example with after conditions content
 */
export const WithAfterConditionsContent: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind(
  {},
);
WithAfterConditionsContent.args = {
  ruleId: 'with-tips',
  condition: newGroup('and'),
  action: newAction('add_attack'),
  attackTypes,
  showProblems: false,
  afterConditions: (
    <div className='rounded-8 bg-bg-surface-2 p-12'>
      <p className='text-sm text-text-secondary'>
        💡 Tip: Add conditions to control when this rule applies
      </p>
    </div>
  ),
};

/**
 * With application scope (restricts rule to specific application)
 */
export const WithApplicationScope: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
WithApplicationScope.args = {
  ruleId: 'app-scoped-rule',
  ruleDescription: 'Rule that only applies to a specific application',
  scope: { application_id: 'app-123' },
  condition: {
    ...newGroup('and'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [{ text: '[http:uri]', kind: 'native', label: 'URI' }],
          condition: 'contains',
          value: 'admin',
          ignoreCase: false,
        },
      },
    ],
  },
  action: {
    ...newAction('add_attack'),
    attackType: 'sqli',
  },
  attackTypes,
  showProblems: false,
};
