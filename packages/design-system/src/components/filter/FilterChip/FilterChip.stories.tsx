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
