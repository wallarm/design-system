import type React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterInput } from '../FilterInput';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from '../lib/statusCode';
import type { ExprNode, FieldMetadata } from '../types';

const meta = {
  title: 'Patterns/FilterInput/FilterInput',
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

/**
 * Disabled chips cannot be edited or removed.
 * They appear dimmed and do not react to clicks.
 * Useful for locked filter conditions (e.g. drill-down context in investigation flows).
 */
export const WithDisabledChips: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'country', operator: '=', value: 'US', disabled: true },
        { type: 'condition', field: 'status', operator: '=', value: 'blocked', disabled: true },
        { type: 'condition', field: 'priority', operator: '>', value: 5 },
      ],
    });

    return (
      <>
        <FilterInput
          fields={sampleFields}
          value={expression}
          onChange={setExpression}
          placeholder='Add more filters...'
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
 * All chips disabled — clear button removes nothing, input still allows adding new chips.
 */
export const AllChipsDisabled: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'status', operator: '=', value: 'registered', disabled: true },
        {
          type: 'condition',
          field: 'country',
          operator: 'in',
          value: ['US', 'DE'],
          disabled: true,
        },
      ],
    });

    return (
      <FilterInput
        fields={sampleFields}
        value={expression}
        onChange={setExpression}
        placeholder='Add more filters...'
      />
    );
  },
};

/**
 * HTTP status code field using createStatusCodeSuggestions for mask-only
 * suggestions. Empty input shows all masks available in the data; typing a
 * digit narrows the suggestion (e.g. "4" → 4XX, "40" → 40X). See AS-877.
 */
export const HTTPStatusCodeSuggestions: Story = {
  args: {
    fields: [
      {
        name: 'response_code',
        label: 'Status code',
        type: 'integer',
        // Mask values are strings ("4XX", "40X"), so numeric comparison
        // operators would be meaningless — restrict to equality/containment.
        operators: ['=', '!=', 'in'],
        getSuggestions: createStatusCodeSuggestions(),
        validate: createStatusCodeValidator(),
        acceptChar: createStatusCodeInputFilter(),
        normalize: createStatusCodeNormalizer(),
      },
    ],
    placeholder: 'Type to filter by status code...',
  },
};

/**
 * Same HTTP status code field, but relying on FilterInput's built-in
 * name-based auto-wiring: a field named `status_code` automatically gets
 * `acceptChar` / `normalize` / `getSuggestions` / `validate` filled in by
 * the DS. Any explicit callback on the field still wins. See AS-877.
 */
export const HTTPStatusCodeByName: Story = {
  args: {
    fields: [
      {
        name: 'status_code',
        label: 'Status code',
        type: 'integer',
        operators: ['=', '!=', 'in'],
      },
    ],
    placeholder: 'Type to filter by status code...',
  },
};

/**
 * Two-step "paired" field (AS-1160). `Context Param` takes a single `is`
 * operator plus a key, after which the second part (`Value`) **always** appears
 * with its own operator and value — captured in one chip (`Context Param is
 * header ; Value is yyy`).
 *
 * The `Value` part adds `like` / `not like` (substring match) plus `is set` /
 * `is not set` operators. The last two take no value:
 *
 * - **Value is set** — the key's value is present (`!= null`).
 * - **Value is not set** — the key's value is absent (`== null`).
 *
 * In those two cases the second value is not required; otherwise it is.
 */
const pairedFields: FieldMetadata[] = [
  {
    name: 'context_param',
    label: 'Context Param',
    type: 'enum',
    options: ['header', 'cookie', 'query', 'body'],
    // The param key is always "is <key>" — there is no "is not"/"is not set" on
    // the first part; the second part (Value) carries the real comparison.
    operators: ['='],
    pairedField: {
      name: 'context_value',
      label: 'Value',
      type: 'string',
      options: [],
      // "like"/"not like" match substrings; "is set"/"is not set" complete the
      // chip without a second value.
      operators: ['=', '!=', 'like', 'not_like', 'is_null', 'is_not_null'],
    },
  },
  { name: 'method', label: 'Method', type: 'enum', options: ['GET', 'POST', 'PUT', 'DELETE'] },
];

export const PairedField: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>(null);
      return <FilterInput fields={pairedFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};

/**
 * Paired field whose `Value` uses the no-value `is set` operator — the chip
 * reads `Context Param is header ; Value is set` with no second value.
 */
export const PairedFieldValueIsSet: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>({
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'context_param', operator: '=', value: 'header' },
          { type: 'condition', field: 'context_value', operator: 'is_null', value: null },
        ],
      });
      return <FilterInput fields={pairedFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};

/**
 * Paired field whose `Context Param` value list shows a muted secondary line
 * (the backend path) beneath each bold key name. The bold name is **not
 * unique** — two `request-id` rows appear under different paths, and the
 * description line is what tells them apart. Selecting a row commits its unique
 * path value, not the shared label.
 */
const describedParamFields: FieldMetadata[] = [
  {
    name: 'context_param',
    label: 'Context Param',
    type: 'enum',
    operators: ['='],
    values: [
      {
        value: 'requests->headers->request-id',
        label: 'request-id',
        description: 'requests->headers->request-id',
      },
      {
        value: 'requests->headers->cookie->JSESSION-ID',
        label: 'JSESSION-ID',
        description: 'requests->headers->cookie->JSESSION-ID',
      },
      {
        // Same bold label as the first row — distinguished only by its path.
        value: 'requests->body->request-id',
        label: 'request-id',
        description: 'requests->body->request-id',
      },
    ],
    pairedField: {
      name: 'context_value',
      label: 'Value',
      type: 'string',
      options: [],
      operators: ['=', '!=', 'like', 'not_like', 'is_null', 'is_not_null'],
    },
  },
  { name: 'method', label: 'Method', type: 'enum', options: ['GET', 'POST', 'PUT', 'DELETE'] },
];

export const PairedFieldValueDescriptions: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>(null);
      return <FilterInput fields={describedParamFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};

/**
 * Paired field pre-populated with both values, rendered as one chip.
 */
export const PairedFieldPreset: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>({
        type: 'condition',
        field: 'context_param',
        operator: '=',
        value: 'header',
        pair: { operator: '=', value: 'authorization' },
      });
      return <FilterInput fields={pairedFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};
