import * as React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import {
  FilterInputChip,
  type FilterInputChipProps,
  FilterInputConnectorChip,
} from '../FilterInputField';
import { MockFilterInputProvider } from './mockFilterInputContext';

const meta = {
  title: 'Patterns/FilterInput/FilterInputChip',
  component: FilterInputChip,
  tags: ['autodocs'],
  argTypes: {
    attribute: {
      control: 'text',
      description: 'The attribute name',
    },
    operator: {
      control: 'text',
      description: 'The operator',
    },
    value: {
      control: 'text',
      description: 'The value',
    },
    error: {
      control: 'boolean',
      description: 'Whether the chip has a validation error',
    },
  },
} satisfies Meta<typeof FilterInputChip>;

export default meta;

const Template: StoryFn<typeof meta> = (args: FilterInputChipProps) => (
  <FilterInputChip {...args} />
);

/**
 * Default chip variant showing attribute-operator-value
 */
export const Default = Template.bind({});
Default.args = {
  attribute: 'Attribute',
  operator: 'operator',
  value: 'Value',
  error: false,
};

/**
 * Chip with error state
 */
export const WithError = Template.bind({});
WithError.args = {
  attribute: 'Attribute',
  operator: 'operator',
  value: 'Value',
  error: true,
};

/**
 * Chip with long text to demonstrate truncation
 */
export const WithLongText = Template.bind({});
WithLongText.args = {
  attribute: 'Very Long Attribute Name That Should Truncate',
  operator: 'is',
  value: 'Very Long Value That Should Also Truncate With Ellipsis',
  error: false,
};

/**
 * Example chip showing realistic filter condition
 */
export const RealisticExample = Template.bind({});
RealisticExample.args = {
  attribute: 'IP Address',
  operator: 'is',
  value: '192.168.1.1',
  error: false,
};

/**
 * AND logical operator variant. Connector chips read FilterInput context, so
 * standalone stories wrap them in a no-op provider.
 */
export const AndOperator: StoryFn = () => (
  <MockFilterInputProvider>
    <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
  </MockFilterInputProvider>
);

/**
 * OR logical operator variant
 */
export const OrOperator: StoryFn = () => (
  <MockFilterInputProvider>
    <FilterInputConnectorChip variant='or' chipId='c-1' onChange={() => undefined} />
  </MockFilterInputProvider>
);

/**
 * Combined example showing chip + AND + chip
 */
export const CombinedWithAnd: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex items-center gap-4'>
      <FilterInputChip attribute='IP Address' operator='is' value='192.168.1.1' />
      <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
      <FilterInputChip attribute='Country' operator='is' value='US' />
    </div>
  </MockFilterInputProvider>
);

/**
 * Combined example showing chip + OR + chip
 */
export const CombinedWithOr: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex items-center gap-4'>
      <FilterInputChip attribute='Status' operator='is' value='Active' />
      <FilterInputConnectorChip variant='or' chipId='c-1' onChange={() => undefined} />
      <FilterInputChip attribute='Status' operator='is' value='Pending' />
    </div>
  </MockFilterInputProvider>
);

/**
 * Chip with delete button (hover to see delete button)
 */
export const WithDeleteButton = Template.bind({});
WithDeleteButton.args = {
  attribute: 'IP Address',
  operator: 'is',
  value: '192.168.1.1',
  error: false,
  onRemove: () => alert('Filter removed'),
};

/**
 * Error state with delete button (hover to see delete button)
 */
export const ErrorWithDelete = Template.bind({});
ErrorWithDelete.args = {
  attribute: 'Invalid Field',
  operator: 'is',
  value: 'Invalid Value',
  error: true,
  onRemove: () => alert('Filter removed'),
};

/**
 * Interactive example showing multiple chips with delete functionality
 */
export const InteractiveDeleteExample: StoryFn = () => {
  const [chips, setChips] = React.useState([
    { id: 1, attribute: 'IP Address', operator: 'is', value: '192.168.1.1' },
    { id: 2, attribute: 'Country', operator: 'is', value: 'US' },
    { id: 3, attribute: 'Status', operator: 'is', value: 'Active' },
  ]);

  return (
    <MockFilterInputProvider>
      <div className='flex items-center gap-4 flex-wrap'>
        {chips.map((chip, index) => (
          <React.Fragment key={chip.id}>
            {index > 0 && (
              <FilterInputConnectorChip
                variant='and'
                chipId={`connector-${chip.id}`}
                onChange={() => undefined}
              />
            )}
            <FilterInputChip
              attribute={chip.attribute}
              operator={chip.operator}
              value={chip.value}
              onRemove={() => setChips(chips.filter(c => c.id !== chip.id))}
            />
          </React.Fragment>
        ))}
        {chips.length === 0 && <p className='text-text-secondary text-sm'>All filters removed</p>}
      </div>
    </MockFilterInputProvider>
  );
};

// ============================================================================
// Disabled Chip Variants
// ============================================================================

/**
 * Disabled chip — dimmed, not clickable, no remove button.
 * Used for locked filter conditions (e.g. drill-down context).
 */
export const Disabled = Template.bind({});
Disabled.args = {
  attribute: 'IP Address',
  operator: 'is',
  value: '34.74.73.20',
  disabled: true,
};

/**
 * Disabled chip with onRemove — remove button is still hidden.
 */
export const DisabledWithOnRemove = Template.bind({});
DisabledWithOnRemove.args = {
  attribute: 'Host',
  operator: 'is',
  value: 'api.example.com',
  disabled: true,
  onRemove: () => alert('This should never fire'),
};

/**
 * Mix of disabled and interactive chips.
 */
export const DisabledAndInteractiveMix: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex items-center gap-4'>
      <FilterInputChip
        attribute='IP Address'
        operator='is'
        value='34.74.73.20'
        disabled
        onRemove={() => undefined}
      />
      <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
      <FilterInputChip
        attribute='Country'
        operator='is'
        value='US'
        onRemove={() => alert('Removed Country filter')}
      />
    </div>
  </MockFilterInputProvider>
);

// ============================================================================
// Connector Variants
// ============================================================================

// ============================================================================
// Building Chip Variants
// ============================================================================

/**
 * Building chip — only attribute selected
 */
export const BuildingAttributeOnly: StoryFn = () => (
  <FilterInputChip building attribute='IP Address' />
);

/**
 * Building chip — attribute + operator selected
 */
export const BuildingWithOperator: StoryFn = () => (
  <FilterInputChip building attribute='IP Address' operator='is' />
);

/**
 * Building chip — attribute + operator + value (about to commit)
 */
export const BuildingComplete: StoryFn = () => (
  <FilterInputChip building attribute='IP Address' operator='is' value='192.168.1.1' />
);

// ============================================================================
// All States Showcase
// ============================================================================

/**
 * Showcase of all FilterInputChip variants and states
 */
export const AllStatesShowcase: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex flex-col gap-4'>
      {/* Chip variants */}
      <div>
        <h3 className='text-sm font-medium text-text-primary mb-2'>FilterInput Chip</h3>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputChip attribute='Attribute' operator='operator' value='Value' />
          <FilterInputChip attribute='Attribute' operator='operator' value='Value' error />
          <FilterInputChip
            attribute='Attribute'
            operator='operator'
            value='Value'
            onRemove={() => undefined}
          />
          <FilterInputChip
            attribute='Attribute'
            operator='operator'
            value='Value'
            error
            onRemove={() => undefined}
          />
        </div>
      </div>

      {/* Disabled chip variants */}
      <div>
        <h3 className='text-sm font-medium text-text-primary mb-2'>Disabled Chip</h3>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputChip attribute='IP Address' operator='is' value='34.74.73.20' disabled />
          <FilterInputChip
            attribute='Host'
            operator='is'
            value='api.example.com'
            disabled
            onRemove={() => undefined}
          />
        </div>
      </div>

      {/* Building chip variants */}
      <div>
        <h3 className='text-sm font-medium text-text-primary mb-2'>Building Chip</h3>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputChip building attribute='IP Address' />
          <FilterInputChip building attribute='IP Address' operator='is' />
          <FilterInputChip building attribute='IP Address' operator='is' value='192.168.1.1' />
        </div>
      </div>

      {/* Connector variants */}
      <div>
        <h3 className='text-sm font-medium text-text-primary mb-2'>Connectors</h3>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
          <FilterInputConnectorChip variant='or' chipId='c-2' onChange={() => undefined} />
        </div>
      </div>
    </div>
  </MockFilterInputProvider>
);

/**
 * Paired (two-value) chip — two attribute/operator/value triplets joined by `;`.
 * The second attribute is fixed by field config; both operators and values render.
 */
export const Paired: StoryFn<typeof meta> = () => (
  <FilterInputChip
    attribute='Context Param'
    operator='is'
    value='xxx'
    pair={{ attribute: 'Value', operator: 'is', value: 'yyy' }}
    onRemove={() => undefined}
  />
);

/**
 * Paired chip with an error on the required second value.
 */
export const PairedWithError: StoryFn<typeof meta> = () => (
  <FilterInputChip
    attribute='Context Param'
    operator='is'
    value='xxx'
    pair={{ attribute: 'Value', operator: 'is', value: 'yyy', error: 'value' }}
    onRemove={() => undefined}
  />
);

/**
 * Paired chip with long text to demonstrate truncation across both triplets.
 */
export const PairedWithLongText: StoryFn<typeof meta> = () => (
  <FilterInputChip
    attribute='Context Param With A Long Name'
    operator='is'
    value='a-very-long-first-value-that-truncates'
    pair={{ attribute: 'Value', operator: 'is', value: 'a-very-long-second-value-that-truncates' }}
    onRemove={() => undefined}
  />
);
