import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryBar } from '../QueryBar';
import type { ExprNode, FieldMetadata } from '../types';

const meta = {
  title: 'Components/QueryBar/QueryBar',
  component: QueryBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'QueryBar is the main entry point for filter UI. Pass `fields` config and it handles autocomplete, chip creation, and expression management automatically.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text to display when field is empty',
    },
    error: {
      control: 'boolean',
      description: 'Whether the field has a validation error',
    },
    showKeyboardHint: {
      control: 'boolean',
      description: 'Whether to show the keyboard hint',
    },
  },
} satisfies Meta<typeof QueryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFields: FieldMetadata[] = [
  {
    name: 'last_seen',
    label: 'Last seen',
    type: 'date',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    values: [
      { value: 'registered', label: 'Registered' },
      { value: 'blocked', label: 'Blocked' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'integer',
    values: [
      { value: 1, label: 'Low' },
      { value: 5, label: 'Medium' },
      { value: 10, label: 'High' },
    ],
  },
  {
    name: 'country',
    label: 'Country',
    type: 'string',
    values: [
      { value: 'US', label: 'US' },
      { value: 'DE', label: 'DE' },
      { value: 'JP', label: 'JP' },
    ],
  },
];

/**
 * Default empty state with placeholder text.
 */
export const Default: Story = {
  args: {
    fields: sampleFields,
    placeholder: 'Type to filter...',
  },
};

/**
 * Empty state with keyboard hint.
 */
export const WithKeyboardHint: Story = {
  args: {
    fields: sampleFields,
    placeholder: 'Type to filter...',
    showKeyboardHint: true,
  },
};

/**
 * Error state - empty field.
 */
export const ErrorEmpty: Story = {
  args: {
    fields: sampleFields,
    placeholder: 'Type to filter...',
    error: true,
  },
};

/**
 * Controlled mode with pre-set single condition value.
 */
export const WithPresetValue: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'condition',
      field: 'status',
      operator: '=',
      value: 'active',
    });

    return (
      <div className='w-[600px] space-y-4'>
        <QueryBar
          fields={sampleFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter...'
        />
        {expression && (
          <div className='p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Controlled mode with pre-set multi-condition Group value.
 */
export const WithMultiConditionPreset: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'status', operator: '=', value: 'active' },
        { type: 'condition', field: 'priority', operator: '>', value: 5 },
      ],
    });

    return (
      <div className='w-[600px] space-y-4'>
        <QueryBar
          fields={sampleFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter...'
        />
        {expression && (
          <div className='p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Error state with a pre-set condition.
 */
export const ErrorWithValue: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'condition',
      field: 'status',
      operator: '=',
      value: 'active',
    });

    return (
      <div className='w-[600px]'>
        <QueryBar
          fields={sampleFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter...'
          error
        />
      </div>
    );
  },
};
