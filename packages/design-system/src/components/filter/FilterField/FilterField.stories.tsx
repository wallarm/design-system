import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterField } from './FilterField';
import type { ExprNode, FieldMetadata } from '../types';

const meta = {
  title: 'Components/Filter/FilterField',
  component: FilterField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'FilterField is the main entry point for filter UI. Pass `fields` config and it handles autocomplete, chip creation, and expression management automatically.',
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
} satisfies Meta<typeof FilterField>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFields: FieldMetadata[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    values: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'archived', label: 'Archived' },
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
        <FilterField
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
        <FilterField
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
        <FilterField
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
