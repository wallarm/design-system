import * as React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { BuildingFilterChip } from '../BuildingFilterChip';
import { ConnectorChip } from '../ConnectorChip';
import { FilterChip } from '../FilterChip';
import type { FilterChipProps } from '../FilterChip';

const meta = {
  title: 'Components/Filter/FilterChip',
  component: FilterChip,
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
} satisfies Meta<typeof FilterChip>;

export default meta;

const Template: StoryFn<typeof meta> = (args: FilterChipProps) => <FilterChip {...args} />;

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
 * AND logical operator variant
 */
export const AndOperator: StoryFn = () => <ConnectorChip variant='and' />;

/**
 * OR logical operator variant
 */
export const OrOperator: StoryFn = () => <ConnectorChip variant='or' />;

/**
 * Combined example showing chip + AND + chip
 */
export const CombinedWithAnd: StoryFn = () => (
  <div className='flex items-center gap-4'>
    <FilterChip attribute='IP Address' operator='is' value='192.168.1.1' />
    <ConnectorChip variant='and' />
    <FilterChip attribute='Country' operator='is' value='US' />
  </div>
);

/**
 * Combined example showing chip + OR + chip
 */
export const CombinedWithOr: StoryFn = () => (
  <div className='flex items-center gap-4'>
    <FilterChip attribute='Status' operator='is' value='Active' />
    <ConnectorChip variant='or' />
    <FilterChip attribute='Status' operator='is' value='Pending' />
  </div>
);

/**
 * Opening parenthesis variant
 */
export const OpeningParenthesis: StoryFn = () => <ConnectorChip variant='(' />;

/**
 * Closing parenthesis variant
 */
export const ClosingParenthesis: StoryFn = () => <ConnectorChip variant=')' />;

/**
 * Combined example showing grouped conditions with parentheses
 * Example: (IP is 192.168.1.1 OR IP is 10.0.0.1) AND Country is US
 */
export const CombinedWithParentheses: StoryFn = () => (
  <div className='flex items-center gap-4'>
    <ConnectorChip variant='(' />
    <FilterChip attribute='IP Address' operator='is' value='192.168.1.1' />
    <ConnectorChip variant='or' />
    <FilterChip attribute='IP Address' operator='is' value='10.0.0.1' />
    <ConnectorChip variant=')' />
    <ConnectorChip variant='and' />
    <FilterChip attribute='Country' operator='is' value='US' />
  </div>
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
    <div className='flex items-center gap-4 flex-wrap'>
      {chips.map((chip, index) => (
        <React.Fragment key={chip.id}>
          {index > 0 && <ConnectorChip variant='and' />}
          <FilterChip
            attribute={chip.attribute}
            operator={chip.operator}
            value={chip.value}
            onRemove={() => setChips(chips.filter(c => c.id !== chip.id))}
          />
        </React.Fragment>
      ))}
      {chips.length === 0 && <p className='text-text-secondary text-sm'>All filters removed</p>}
    </div>
  );
};

// ============================================================================
// Connector Variants - All States
// ============================================================================

/**
 * AND operator with error state
 */
export const AndOperatorError: StoryFn = () => <ConnectorChip variant='and' error />;

/**
 * OR operator with error state
 */
export const OrOperatorError: StoryFn = () => <ConnectorChip variant='or' error />;

/**
 * Opening parenthesis with error state
 */
export const OpeningParenthesisError: StoryFn = () => <ConnectorChip variant='(' error />;

/**
 * Closing parenthesis with error state
 */
export const ClosingParenthesisError: StoryFn = () => <ConnectorChip variant=')' error />;

// ============================================================================
// Building Chip Variants
// ============================================================================

/**
 * Building chip — only attribute selected
 */
export const BuildingAttributeOnly: StoryFn = () => (
  <BuildingFilterChip attribute='IP Address' />
);

/**
 * Building chip — attribute + operator selected
 */
export const BuildingWithOperator: StoryFn = () => (
  <BuildingFilterChip attribute='IP Address' operator='is' />
);

/**
 * Building chip — attribute + operator + value (about to commit)
 */
export const BuildingComplete: StoryFn = () => (
  <BuildingFilterChip attribute='IP Address' operator='is' value='192.168.1.1' />
);

// ============================================================================
// All States Showcase
// ============================================================================

/**
 * Showcase of all FilterChip variants and states
 */
export const AllStatesShowcase: StoryFn = () => (
  <div className='flex flex-col gap-4'>
    {/* Chip variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>Filter Chip</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <FilterChip attribute='Attribute' operator='operator' value='Value' />
        <FilterChip attribute='Attribute' operator='operator' value='Value' error />
        <FilterChip attribute='Attribute' operator='operator' value='Value' onRemove={() => {}} />
        <FilterChip attribute='Attribute' operator='operator' value='Value' error onRemove={() => {}} />
      </div>
    </div>

    {/* Building chip variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>Building Chip</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <BuildingFilterChip attribute='IP Address' />
        <BuildingFilterChip attribute='IP Address' operator='is' />
        <BuildingFilterChip attribute='IP Address' operator='is' value='192.168.1.1' />
      </div>
    </div>

    {/* Connector variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>Connectors</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <ConnectorChip variant='and' />
        <ConnectorChip variant='and' error />
        <ConnectorChip variant='or' />
        <ConnectorChip variant='or' error />
      </div>
    </div>

    {/* Parenthesis variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>Parentheses</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <ConnectorChip variant='(' />
        <ConnectorChip variant='(' error />
        <ConnectorChip variant=')' />
        <ConnectorChip variant=')' error />
      </div>
    </div>
  </div>
);
