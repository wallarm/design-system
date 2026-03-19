import type React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterInput } from '../FilterInput';
import type { ExprNode, FieldMetadata } from '../types';

const meta = {
  title: 'Patterns/FilterInput Props',
  component: FilterInput,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'FilterInput is the main entry point for filter UI. Pass `fields` config and it handles autocomplete, chip creation, and expression management automatically.',
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 960 }}>
          <Story />
        </div>
      </div>
    ),
  ],
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
} satisfies Meta<typeof FilterInput>;

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
      <>
        <FilterInput
          fields={sampleFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter...'
        />
        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
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
      <>
        <FilterInput
          fields={sampleFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter...'
        />
        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
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
      <FilterInput
        fields={sampleFields}
        value={expression}
        onChange={setExpression}
        placeholder='Type to filter...'
        error
      />
    );
  },
};
