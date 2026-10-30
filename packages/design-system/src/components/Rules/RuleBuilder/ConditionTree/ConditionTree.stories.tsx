/**
 * ConditionTree Stories
 *
 * Storybook documentation for ConditionTree component.
 */

import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { conditionProblems, newAttack, newField, newGroup, newSample, newSignal } from '../models';
import type { Choice, GroupCondition } from '../types';
import { ConditionTree, type ConditionTreeProps } from './ConditionTree';

const mockAttackTypes: Choice[] = [
  { value: 'sqli', label: 'SQL Injection', description: 'SQL injection attack' },
  { value: 'xss', label: 'Cross-Site Scripting', description: 'XSS attack' },
  { value: 'rce', label: 'Remote Code Execution', description: 'RCE attack' },
  { value: 'xxe', label: 'XML External Entity', description: 'XXE attack' },
  { value: 'ldapi', label: 'LDAP Injection', description: 'LDAP injection attack' },
];

const meta = {
  title: 'Rules/ConditionTree',
  component: ConditionTree,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Recursive condition tree editor. Allows building complex rule conditions with groups, field checks, attack detection, and anomaly detection.',
      },
    },
  },
  argTypes: {
    condition: {
      control: false,
      description: 'Root group condition',
    },
    onChange: {
      action: 'changed',
      description: 'Called when tree changes',
    },
    isRoot: {
      control: 'boolean',
      description: 'Whether this is the root node',
      defaultValue: true,
    },
    showProblems: {
      control: 'boolean',
      description: 'Show validation errors',
      defaultValue: false,
    },
    attackTypes: {
      control: false,
      description: 'Available attack types for selection',
    },
  },
} satisfies Meta<typeof ConditionTree>;

export default meta;

/**
 * Interactive wrapper for stories
 */
const InteractiveWrapper = ({ initialCondition }: { initialCondition: GroupCondition }) => {
  const [condition, setCondition] = useState<GroupCondition>(initialCondition);
  const [showProblems, setShowProblems] = useState(false);
  const problems = conditionProblems(condition);

  return (
    <div className='flex flex-col gap-16'>
      <div className='flex gap-8'>
        <label className='flex items-center gap-4'>
          <input
            type='checkbox'
            checked={showProblems}
            onChange={e => setShowProblems(e.target.checked)}
          />
          <span className='text-sm'>Show validation problems</span>
        </label>
        {problems.length > 0 && (
          <span className='text-sm text-text-danger'>
            {problems.length} {problems.length === 1 ? 'problem' : 'problems'} found
          </span>
        )}
      </div>
      <ConditionTree
        condition={condition}
        onChange={setCondition}
        attackTypes={mockAttackTypes}
        showProblems={showProblems}
        problems={problems}
      />
    </div>
  );
};

/**
 * Empty condition tree (applies to all requests)
 */
export const Empty: StoryFn<ConditionTreeProps> = () => {
  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Single field condition
 */
export const SingleField: StoryFn<ConditionTreeProps> = () => {
  const initialCondition = newGroup();

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Multiple field conditions
 */
export const MultipleFields: StoryFn<ConditionTreeProps> = () => {
  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [newField(), newField('http_response')],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Attack condition
 */
export const AttackDetection: StoryFn<ConditionTreeProps> = () => {
  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [newAttack('sqli', 'flow')],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Signal condition
 */
export const AnomalyDetection: StoryFn<ConditionTreeProps> = () => {
  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [newSignal('key_duplicate', '[http:header]')],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Nested group
 */
export const NestedGroup: StoryFn<ConditionTreeProps> = () => {
  const nestedGroup = newGroup('or');
  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [newField(), nestedGroup],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Complex tree with multiple types
 */
export const ComplexTree: StoryFn<ConditionTreeProps> = () => {
  const innerGroup: GroupCondition = {
    kind: 'group',
    id: 'inner',
    operator: 'or',
    children: [newField(), newField('http_response')],
  };

  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [newAttack('sqli', 'flow'), innerGroup, newSignal('key_duplicate', '[http:header]')],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * None operator (with validation error when attack/signal present)
 */
export const NoneOperator: StoryFn<ConditionTreeProps> = () => {
  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'not',
    children: [newField(), newAttack()], // Attack in 'not' should show error
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * All operators demo
 */
export const AllOperators: StoryFn<ConditionTreeProps> = () => {
  const anyGroup: GroupCondition = {
    kind: 'group',
    id: 'any',
    operator: 'or',
    children: [newField(), newField()],
  };

  const noneGroup: GroupCondition = {
    kind: 'group',
    id: 'none',
    operator: 'not',
    children: [newField()],
  };

  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [newField(), anyGroup, noneGroup],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Sample condition - picks a percentage of flows by flow ID hash
 */
export const SampleCondition: StoryFn<ConditionTreeProps> = () => {
  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [newSample(10)],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Key duplicate signal - detects repeated keys in containers
 */
export const KeyDuplicateSignal: StoryFn<ConditionTreeProps> = () => {
  const signal = newSignal('key_duplicate', '[http:query][format:form]');
  signal.key = "['q']";

  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [signal],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};

/**
 * Resource overlimit signal - detects when resource limits are exceeded
 */
export const ResourceOverlimitSignal: StoryFn<ConditionTreeProps> = () => {
  const signal = newSignal('resource_overlimit', 'flow');
  signal.limit = 'processing_time_limit';

  const initialCondition: GroupCondition = {
    kind: 'group',
    id: 'root',
    operator: 'and',
    children: [signal],
  };

  return <InteractiveWrapper initialCondition={initialCondition} />;
};
