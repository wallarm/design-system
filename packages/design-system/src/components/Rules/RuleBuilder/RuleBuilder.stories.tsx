import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { RuleBuilder } from './RuleBuilder';
import type { RuleBuilderProps } from './RuleBuilder';
import type { ActionDraft, Choice, GroupCondition } from './types';
import { newAction } from './models/actionModel';
import { newField, newGroup } from './models/conditionModel';

const meta = {
  title: 'Rules/RuleBuilder',
  component: RuleBuilder,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RuleBuilder>;

export default meta;

const attackTypes: Choice[] = [
  { value: 'sqli', label: 'SQL Injection', description: 'Database query manipulation' },
  { value: 'xss', label: 'Cross-Site Scripting', description: 'JavaScript injection' },
  { value: 'rce', label: 'Remote Code Execution', description: 'Arbitrary code execution' },
  { value: 'xxe', label: 'XML External Entity', description: 'XML parser exploitation' },
  { value: 'path_traversal', label: 'Path Traversal', description: 'Directory traversal attack' },
];

/**
 * Interactive rule builder component for creating/editing rules.
 */
const InteractiveRuleBuilder: StoryFn<RuleBuilderProps> = args => {
  const [condition, setCondition] = useState(args.condition);
  const [action, setAction] = useState(args.action);

  return (
    <div className='w-[900px]'>
      <RuleBuilder
        {...args}
        condition={condition}
        action={action}
        onConditionChange={setCondition}
        onActionChange={setAction}
      />
    </div>
  );
};

/**
 * Empty rule
 *
 * Starting point with empty condition and action.
 */
export const EmptyRule: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
EmptyRule.args = {
  ruleId: 'new-rule',
  ruleDescription: '',
  condition: newGroup('and'),
  action: newAction('add_attack'),
  attackTypes,
  showProblems: false,
};

/**
 * Simple field condition
 *
 * Basic rule with a single field check condition.
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
          segments: [
            { text: '[http:header:user-agent]', kind: 'native', label: 'User-Agent', value: 'header' },
          ] as any,
          condition: 'contains',
          value: 'bot',
          ignoreCase: true,
          canonical: '[http:header:user-agent]',
          canonicalVersion: null,
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
 *
 * Rule with nested AND/OR groups and multiple conditions.
 */
export const ComplexNestedConditions: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
ComplexNestedConditions.args = {
  ruleId: 'admin-access',
  ruleDescription: 'Detect unauthorized admin access attempts',
  condition: {
    ...newGroup('and'),
    children: [
      {
        ...newField('http_request'),
        value: {
          segments: [{ text: '[http:uri]', kind: 'native', label: 'URI', value: 'uri' }] as any,
          condition: 'contains',
          value: 'admin',
          ignoreCase: false,
          canonical: '[http:uri]',
          canonicalVersion: null,
        },
      },
      {
        ...newGroup('or'),
        children: [
          {
            ...newField('http_request'),
            value: {
              segments: [{ text: '[http:method]', kind: 'native', label: 'Method', value: 'method' }] as any,
              condition: 'equal',
              value: 'POST',
              ignoreCase: false,
              canonical: '[http:method]',
              canonicalVersion: null,
            },
          },
          {
            ...newField('http_request'),
            value: {
              segments: [{ text: '[http:method]', kind: 'native', label: 'Method', value: 'method' }] as any,
              condition: 'equal',
              value: 'PUT',
              ignoreCase: false,
              canonical: '[http:method]',
              canonicalVersion: null,
            },
          },
        ],
      },
    ],
  },
  action: {
    ...newAction('add_attack'),
    attackType: 'admin_abuse',
  },
  attackTypes,
  showProblems: false,
};

/**
 * Attack detection
 *
 * Rule that detects specific attack types in request data.
 */
export const AttackDetection: StoryFn<RuleBuilderProps> = InteractiveRuleBuilder.bind({});
AttackDetection.args = {
  ruleId: 'sqli-detection',
  ruleDescription: 'Detect SQL injection in query parameters',
  condition: {
    ...newGroup('and'),
    children: [
      {
        kind: 'attack',
        id: 'atk-1',
        attackType: 'sqli',
        point: '[http:query][format:form]',
      },
    ],
  },
  action: newAction('add_attack'),
  attackTypes,
  showProblems: false,
};

/**
 * With validation problems
 *
 * Shows validation errors when required fields are missing.
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
          segments: [] as any,
          condition: null,
          value: '',
          ignoreCase: false,
          canonical: null,
          canonicalVersion: null,
        },
      },
    ],
  },
  action: newAction('add_attack'),
  attackTypes,
  showProblems: true, // Enable validation display
};
