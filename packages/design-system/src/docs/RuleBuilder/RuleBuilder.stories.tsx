import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  type ActionDraft,
  ATTACK_TYPES,
  type AttackCondition,
  type FieldCondition,
  type GroupCondition,
  newAction,
  newField,
  newGroup,
  nodeId,
  RuleBuilder,
  type RuleBuilderProps,
  type SignalCondition,
} from '@wallarm-org/rules-lib';

const DESCRIPTION = [
  'Rule Builder is a comprehensive UI for creating and editing Wallarm security rules.',
  'It provides a visual interface for building complex condition trees, configuring actions, and previewing generated JSON.',
  'The builder supports field conditions with PointSelector integration, attack detection conditions, signal conditions,',
  'nested groups with AND/OR/NOT operators, and all 8 action types with validation.',
].join(' ');

const meta = {
  title: 'Rules/RuleBuilder',
  component: RuleBuilder,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    condition: {
      description: 'Current condition tree (GroupCondition)',
      control: false,
    },
    onConditionChange: {
      description: 'Callback when condition changes',
      action: 'condition-changed',
    },
    actionDraft: {
      description: 'Current action draft',
      control: false,
    },
    onActionChange: {
      description: 'Callback when action changes',
      action: 'action-changed',
    },
    attackTypes: {
      description: 'Available attack types for selection',
      control: false,
    },
    showProblems: {
      description: 'Show validation problems',
      control: 'boolean',
    },
    contexts: {
      description: 'Available contexts (http_request, http_response)',
      control: false,
    },
    disabled: {
      description: 'Disabled state',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof RuleBuilder>;

export default meta;

// Mock keys provider for PointSelector
const mockKeys = [
  'uri',
  'path',
  'method',
  'header',
  'query',
  'body',
  'cookie',
  'user-agent',
  'content-type',
  'referer',
];

/**
 * Empty rule - shows the initial state when creating a new rule.
 * Demonstrates an empty condition group and default add_attack action.
 */
export const EmptyRule: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));
  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => newAction('add_attack'));

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Field condition - demonstrates PointSelector integration.
 * Shows a single field condition with different condition types.
 */
export const FieldConditionStory: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => {
    const fieldCondition: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [
          { kind: 'key', text: "['header']", label: 'header', name: 'header' },
          { kind: 'key', text: "['user-agent']", label: 'user-agent', name: 'user-agent' },
        ],
        condition: 'equal',
        value: 'Mozilla/5.0',
        ignoreCase: false,
      },
    };

    return {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [fieldCondition],
    };
  });

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => newAction('add_attack'));

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Attack condition - demonstrates attack type selection.
 * Shows all 13 attack types available in the builder.
 */
export const AttackConditionStory: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => {
    const attackCondition: AttackCondition = {
      kind: 'attack',
      id: nodeId(),
      attackType: 'sqli',
      point: 'flow',
    };

    return {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [attackCondition],
    };
  });

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('suppress_attack');
    action.attackType = 'sqli';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Signal condition - demonstrates signal type selection.
 * Shows key_duplicate and resource_overlimit conditions.
 */
export const SignalConditionStory: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => {
    const signalCondition: SignalCondition = {
      kind: 'signal',
      id: nodeId(),
      signalType: 'key_duplicate',
      point: '[http:header]',
      limit: '',
    };

    return {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [signalCondition],
    };
  });

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => newAction('add_attack'));

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Nested groups - demonstrates AND/OR/NOT operators.
 * Shows multiple levels of nesting with complex logic.
 */
export const NestedGroups: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => {
    const field1: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [{ kind: 'key', text: "['path']", label: 'path', name: 'path' }],
        condition: 'equal',
        value: '/admin',
        ignoreCase: false,
      },
    };

    const field2: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [{ kind: 'key', text: "['method']", label: 'method', name: 'method' }],
        condition: 'equal',
        value: 'POST',
        ignoreCase: false,
      },
    };

    const field3: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [
          { kind: 'key', text: "['header']", label: 'header', name: 'header' },
          { kind: 'key', text: "['authorization']", label: 'authorization', name: 'authorization' },
        ],
        condition: 'absent',
        value: '',
        ignoreCase: false,
      },
    };

    const orGroup: GroupCondition = {
      kind: 'group',
      id: nodeId(),
      operator: 'or',
      children: [field1, field2],
    };

    return {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [orGroup, field3],
    };
  });

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => newAction('add_attack'));

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Add Attack Action - marks the request as an attack.
 * Demonstrates attack type selection, comment, and experimental mode.
 */
export const AddAttackAction: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('add_attack');
    action.attackType = 'xss';
    action.comment = 'Detected XSS attempt in user input';
    action.experimental = false;
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Add Tag Action - tags the request with custom metadata.
 * Demonstrates key-value tagging for request classification.
 */
export const AddTagAction: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('add_tag');
    action.tagKey = 'environment';
    action.tagValue = 'production';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Suppress Attack Action - ignores detected attacks.
 * Demonstrates filtering by specific attack type or all attacks.
 */
export const SuppressAttackAction: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('suppress_attack');
    action.attackType = 'scanner';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Mark Attack Action - reports attacks without blocking.
 * Always runs in experimental mode (monitoring only).
 */
export const MarkAttackAction: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('mark_attack');
    action.attackType = 'rce';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Combine Action - joins repeated keys into one value.
 * Demonstrates separator configuration for value combination.
 */
export const CombineAction: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('combine');
    action.separator = ', ';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Processing Limits - demonstrates time and memory limits.
 * Shows priority configuration when rules conflict.
 */
export const ProcessingLimits: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('processing_time_limit');
    action.limit = '5ms';
    action.priority = '10';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Entry Limits - limits the size of values.
 * Demonstrates soft and hard limits with priority.
 */
export const EntryLimits: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => ({
    ...newGroup('and'),
    children: [],
  }));

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('entry_limits');
    action.softLimit = '1Ki';
    action.hardLimit = '64Ki';
    action.priority = '5';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Validation Errors - shows validation feedback.
 * Demonstrates missing required fields and invalid values.
 */
export const ValidationErrors: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => {
    // Incomplete field condition
    const incompleteField: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [],
        condition: null,
        value: '',
        ignoreCase: false,
      },
    };

    // Incomplete signal condition
    const incompleteSignal: SignalCondition = {
      kind: 'signal',
      id: nodeId(),
      signalType: '',
      point: '',
      limit: '',
    };

    return {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [incompleteField, incompleteSignal],
    };
  });

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    // add_attack without attack type
    const action = newAction('add_attack');
    action.attackType = '';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={true}
      keys={mockKeys}
    />
  );
};

/**
 * Complete Complex Rule - demonstrates a full production-ready rule.
 * Shows complex nested conditions, complete action configuration, and generated JSON.
 */
export const CompleteRule: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => {
    // Path condition
    const pathCondition: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [{ kind: 'key', text: "['path']", label: 'path', name: 'path' }],
        condition: 'regex',
        value: '^/api/(users|admin)',
        ignoreCase: false,
      },
    };

    // Method condition
    const methodCondition: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [{ kind: 'key', text: "['method']", label: 'method', name: 'method' }],
        condition: 'equal',
        value: 'POST',
        ignoreCase: false,
      },
    };

    // Auth header absent
    const authCondition: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [
          { kind: 'key', text: "['header']", label: 'header', name: 'header' },
          { kind: 'key', text: "['authorization']", label: 'authorization', name: 'authorization' },
        ],
        condition: 'absent',
        value: '',
        ignoreCase: false,
      },
    };

    // SQL injection detected
    const attackCondition: AttackCondition = {
      kind: 'attack',
      id: nodeId(),
      attackType: 'sqli',
      point: 'flow',
    };

    // AND group for path + method
    const pathMethodGroup: GroupCondition = {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [pathCondition, methodCondition],
    };

    // OR group for auth missing or attack detected
    const securityGroup: GroupCondition = {
      kind: 'group',
      id: nodeId(),
      operator: 'or',
      children: [authCondition, attackCondition],
    };

    // Root AND: (path + method) AND (no auth OR attack)
    return {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [pathMethodGroup, securityGroup],
    };
  });

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('add_attack');
    action.attackType = 'auth_bypass';
    action.comment = 'Unauthorized API access attempt detected';
    action.experimental = false;
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
    />
  );
};

/**
 * Disabled State - shows the builder in read-only mode.
 * All inputs and controls are disabled.
 */
export const Disabled: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => {
    const field: FieldCondition = {
      kind: 'field',
      id: nodeId(),
      context: 'http_request',
      value: {
        segments: [{ kind: 'key', text: "['path']", label: 'path', name: 'path' }],
        condition: 'equal',
        value: '/protected',
        ignoreCase: false,
      },
    };

    return {
      kind: 'group',
      id: nodeId(),
      operator: 'and',
      children: [field],
    };
  });

  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => {
    const action = newAction('add_attack');
    action.attackType = 'sqli';
    return action;
  });

  return (
    <RuleBuilder
      condition={condition}
      onConditionChange={setCondition}
      actionDraft={actionDraft}
      onActionChange={setActionDraft}
      attackTypes={ATTACK_TYPES}
      showProblems={false}
      keys={mockKeys}
      disabled={true}
    />
  );
};

/**
 * Interactive Playground - fully interactive builder.
 * Edit conditions and actions to see live JSON updates.
 */
export const Playground: StoryFn<RuleBuilderProps> = () => {
  const [condition, setCondition] = useState<GroupCondition>(() => newGroup('and'));
  const [actionDraft, setActionDraft] = useState<ActionDraft>(() => newAction('add_attack'));
  const [showProblems, setShowProblems] = useState(false);

  return (
    <div className='flex flex-col gap-16'>
      <div className='flex items-center gap-8'>
        <label className='flex items-center gap-4 cursor-pointer'>
          <input
            type='checkbox'
            checked={showProblems}
            onChange={e => setShowProblems(e.target.checked)}
            className='cursor-pointer'
          />
          <span className='text-body-sm'>Show validation problems</span>
        </label>
      </div>

      <RuleBuilder
        condition={condition}
        onConditionChange={setCondition}
        actionDraft={actionDraft}
        onActionChange={setActionDraft}
        attackTypes={ATTACK_TYPES}
        showProblems={showProblems}
        keys={mockKeys}
      />
    </div>
  );
};
