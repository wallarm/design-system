import * as React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import type { FilterChipProps } from './FilterChip';
import { FilterChip } from './FilterChip';

const meta = {
  title: 'Components/Filter/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['chip', 'and', 'or', '(', ')'],
      description: 'The variant of the filter chip',
    },
    attribute: {
      control: 'text',
      description: 'The attribute name (for chip variant)',
    },
    operator: {
      control: 'text',
      description: 'The operator (for chip variant)',
    },
    value: {
      control: 'text',
      description: 'The value (for chip variant)',
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
  variant: 'chip',
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
  variant: 'chip',
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
  variant: 'chip',
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
  variant: 'chip',
  attribute: 'IP Address',
  operator: 'is',
  value: '192.168.1.1',
  error: false,
};

/**
 * AND logical operator variant
 */
export const AndOperator = Template.bind({});
AndOperator.args = {
  variant: 'and',
};

/**
 * OR logical operator variant
 */
export const OrOperator = Template.bind({});
OrOperator.args = {
  variant: 'or',
};

/**
 * Combined example showing chip + AND + chip
 */
export const CombinedWithAnd: StoryFn<typeof meta> = () => (
  <div className='flex items-center gap-1'>
    <FilterChip variant='chip' attribute='IP Address' operator='is' value='192.168.1.1' />
    <FilterChip variant='and' />
    <FilterChip variant='chip' attribute='Country' operator='is' value='US' />
  </div>
);

/**
 * Combined example showing chip + OR + chip
 */
export const CombinedWithOr: StoryFn<typeof meta> = () => (
  <div className='flex items-center gap-1'>
    <FilterChip variant='chip' attribute='Status' operator='is' value='Active' />
    <FilterChip variant='or' />
    <FilterChip variant='chip' attribute='Status' operator='is' value='Pending' />
  </div>
);

/**
 * Opening parenthesis variant
 */
export const OpeningParenthesis = Template.bind({});
OpeningParenthesis.args = {
  variant: '(',
};

/**
 * Closing parenthesis variant
 */
export const ClosingParenthesis = Template.bind({});
ClosingParenthesis.args = {
  variant: ')',
};

/**
 * Combined example showing grouped conditions with parentheses
 * Example: (IP is 192.168.1.1 OR IP is 10.0.0.1) AND Country is US
 */
export const CombinedWithParentheses: StoryFn<typeof meta> = () => (
  <div className='flex items-center gap-1'>
    <FilterChip variant='(' />
    <FilterChip variant='chip' attribute='IP Address' operator='is' value='192.168.1.1' />
    <FilterChip variant='or' />
    <FilterChip variant='chip' attribute='IP Address' operator='is' value='10.0.0.1' />
    <FilterChip variant=')' />
    <FilterChip variant='and' />
    <FilterChip variant='chip' attribute='Country' operator='is' value='US' />
  </div>
);

/**
 * Chip with delete button (hover to see delete button)
 */
export const WithDeleteButton = Template.bind({});
WithDeleteButton.args = {
  variant: 'chip',
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
  variant: 'chip',
  attribute: 'Invalid Field',
  operator: 'is',
  value: 'Invalid Value',
  error: true,
  onRemove: () => alert('Filter removed'),
};

/**
 * Interactive example showing multiple chips with delete functionality
 */
export const InteractiveDeleteExample: StoryFn<typeof meta> = () => {
  const [chips, setChips] = React.useState([
    { id: 1, attribute: 'IP Address', operator: 'is', value: '192.168.1.1' },
    { id: 2, attribute: 'Country', operator: 'is', value: 'US' },
    { id: 3, attribute: 'Status', operator: 'is', value: 'Active' },
  ]);

  return (
    <div className='flex items-center gap-1 flex-wrap'>
      {chips.map((chip, index) => (
        <React.Fragment key={chip.id}>
          {index > 0 && <FilterChip variant='and' />}
          <FilterChip
            variant='chip'
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
// AND Operator Variants - All States
// ============================================================================

/**
 * AND operator with error state
 */
export const AndOperatorError = Template.bind({});
AndOperatorError.args = {
  variant: 'and',
  error: true,
};

/**
 * AND operator with hover state (hover to see delete button)
 */
export const AndOperatorHover = Template.bind({});
AndOperatorHover.args = {
  variant: 'and',
  onRemove: () => alert('AND removed'),
};

/**
 * AND operator with error and hover state (hover to see delete button)
 */
export const AndOperatorErrorHover = Template.bind({});
AndOperatorErrorHover.args = {
  variant: 'and',
  error: true,
  onRemove: () => alert('AND removed'),
};

// ============================================================================
// OR Operator Variants - All States
// ============================================================================

/**
 * OR operator with error state
 */
export const OrOperatorError = Template.bind({});
OrOperatorError.args = {
  variant: 'or',
  error: true,
};

/**
 * OR operator with hover state (hover to see delete button)
 */
export const OrOperatorHover = Template.bind({});
OrOperatorHover.args = {
  variant: 'or',
  onRemove: () => alert('OR removed'),
};

/**
 * OR operator with error and hover state (hover to see delete button)
 */
export const OrOperatorErrorHover = Template.bind({});
OrOperatorErrorHover.args = {
  variant: 'or',
  error: true,
  onRemove: () => alert('OR removed'),
};

// ============================================================================
// Opening Parenthesis Variants - All States
// ============================================================================

/**
 * Opening parenthesis with error state
 */
export const OpeningParenthesisError = Template.bind({});
OpeningParenthesisError.args = {
  variant: '(',
  error: true,
};

/**
 * Opening parenthesis with hover state (hover to see delete button)
 */
export const OpeningParenthesisHover = Template.bind({});
OpeningParenthesisHover.args = {
  variant: '(',
  onRemove: () => alert('( removed'),
};

/**
 * Opening parenthesis with error and hover state (hover to see delete button)
 */
export const OpeningParenthesisErrorHover = Template.bind({});
OpeningParenthesisErrorHover.args = {
  variant: '(',
  error: true,
  onRemove: () => alert('( removed'),
};

// ============================================================================
// Closing Parenthesis Variants - All States
// ============================================================================

/**
 * Closing parenthesis with error state
 */
export const ClosingParenthesisError = Template.bind({});
ClosingParenthesisError.args = {
  variant: ')',
  error: true,
};

/**
 * Closing parenthesis with hover state (hover to see delete button)
 */
export const ClosingParenthesisHover = Template.bind({});
ClosingParenthesisHover.args = {
  variant: ')',
  onRemove: () => alert(') removed'),
};

/**
 * Closing parenthesis with error and hover state (hover to see delete button)
 */
export const ClosingParenthesisErrorHover = Template.bind({});
ClosingParenthesisErrorHover.args = {
  variant: ')',
  error: true,
  onRemove: () => alert(') removed'),
};

// ============================================================================
// All States Showcase
// ============================================================================

/**
 * Showcase of all FilterChip variants and states
 */
export const AllStatesShowcase: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-4'>
    {/* Chip variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>Chip Variant</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <FilterChip variant='chip' attribute='Attribute' operator='operator' value='Value' />
        <FilterChip variant='chip' attribute='Attribute' operator='operator' value='Value' error />
        <FilterChip
          variant='chip'
          attribute='Attribute'
          operator='operator'
          value='Value'
          onRemove={() => {}}
        />
        <FilterChip
          variant='chip'
          attribute='Attribute'
          operator='operator'
          value='Value'
          error
          onRemove={() => {}}
        />
      </div>
    </div>

    {/* AND variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>AND Operator</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <FilterChip variant='and' />
        <FilterChip variant='and' error />
        <FilterChip variant='and' onRemove={() => {}} />
        <FilterChip variant='and' error onRemove={() => {}} />
      </div>
    </div>

    {/* OR variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>OR Operator</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <FilterChip variant='or' />
        <FilterChip variant='or' error />
        <FilterChip variant='or' onRemove={() => {}} />
        <FilterChip variant='or' error onRemove={() => {}} />
      </div>
    </div>

    {/* Parenthesis variants */}
    <div>
      <h3 className='text-sm font-medium text-text-primary mb-2'>Parentheses</h3>
      <div className='flex items-center gap-2 flex-wrap'>
        <FilterChip variant='(' />
        <FilterChip variant='(' error />
        <FilterChip variant='(' onRemove={() => {}} />
        <FilterChip variant='(' error onRemove={() => {}} />
        <FilterChip variant=')' />
        <FilterChip variant=')' error />
        <FilterChip variant=')' onRemove={() => {}} />
        <FilterChip variant=')' error onRemove={() => {}} />
      </div>
    </div>
  </div>
);
