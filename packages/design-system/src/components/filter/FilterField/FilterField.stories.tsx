import type { Meta, StoryFn } from '@storybook/react';
import { Search } from '../../../icons/Search';
import { FilterChip } from '../FilterChip';
import type { FilterFieldProps } from './FilterField';
import { FilterField } from './FilterField';

const meta = {
  title: 'Components/Filter/FilterField',
  component: FilterField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'FilterField is the main entry point for filter UI. It displays an input field with optional filter chips, icons, and keyboard hints.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    chips: {
      control: 'object',
      description: 'Array of filter chip data to display',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text to display when field is empty',
    },
    error: {
      control: 'boolean',
      description: 'Whether the field has a validation error',
    },
    leftIcon: {
      control: false,
      description: 'Optional icon to display on the left side',
    },
    showKeyboardHint: {
      control: 'boolean',
      description: 'Whether to show the keyboard hint (⌘K or Ctrl+K)',
    },
    onChipRemove: {
      action: 'onChipRemove',
      description: 'Callback when a chip is removed',
    },
    onClear: {
      action: 'onClear',
      description: 'Callback when the clear button is clicked',
    },
    onFocus: {
      action: 'onFocus',
      description: 'Callback when the field receives focus',
    },
    onBlur: {
      action: 'onBlur',
      description: 'Callback when the field loses focus',
    },
  },
} satisfies Meta<typeof FilterField>;

export default meta;

type Story = StoryFn<typeof meta>;

/**
 * Default empty state with placeholder text.
 */
export const Default: Story = {
  args: {
    placeholder: 'Search [object]...',
  },
};

/**
 * Empty state with left icon.
 */
export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search attacks...',
    leftIcon: <Search className='size-6 text-text-secondary' />,
  },
};

/**
 * Empty state with keyboard hint.
 */
export const WithKeyboardHint: Story = {
  args: {
    placeholder: 'Search [object]...',
    showKeyboardHint: true,
  },
};

/**
 * Field with a single chip.
 */
export const WithSingleChip: Story = {
  args: {
    placeholder: 'Search [object]...',
    chips: [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />,
      },
    ],
  },
};

/**
 * Field with multiple chips.
 */
export const WithMultipleChips: Story = {
  args: {
    placeholder: 'Search [object]...',
    chips: [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />,
      },
      {
        id: '2',
        content: <FilterChip variant='and' />,
      },
      {
        id: '3',
        content: <FilterChip variant='chip' attribute='Country' operator='is' value='US' />,
      },
    ],
  },
};

/**
 * Field with three chips (max visible before showing placeholder hint).
 */
export const WithThreeChips: Story = {
  args: {
    placeholder: 'Search [object]...',
    leftIcon: <Search className='size-6 text-text-secondary' />,
    chips: [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />,
      },
      {
        id: '2',
        content: <FilterChip variant='and' />,
      },
      {
        id: '3',
        content: <FilterChip variant='chip' attribute='Country' operator='is' value='US' />,
      },
      {
        id: '4',
        content: <FilterChip variant='and' />,
      },
      {
        id: '5',
        content: <FilterChip variant='chip' attribute='Status' operator='is' value='Active' />,
      },
    ],
  },
};

/**
 * Error state - empty field.
 */
export const ErrorEmpty: Story = {
  args: {
    placeholder: 'Search [object]...',
    error: true,
  },
};

/**
 * Error state - with chips.
 */
export const ErrorWithChips: Story = {
  args: {
    placeholder: 'Search [object]...',
    error: true,
    chips: [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='invalid' error />,
      },
    ],
  },
};

/**
 * Interactive example with all features.
 */
export const Interactive: Story = {
  render: (args: FilterFieldProps) => {
    return (
      <div className='space-y-4'>
        <FilterField
          {...args}
          placeholder='Search attacks...'
          leftIcon={<Search className='size-6 text-text-secondary' />}
          showKeyboardHint
          chips={[
            {
              id: '1',
              content: (
                <FilterChip
                  variant='chip'
                  attribute='IP'
                  operator='is'
                  value='192.168.1.1'
                  onRemove={() => console.log('Remove chip 1')}
                />
              ),
            },
            {
              id: '2',
              content: <FilterChip variant='and' />,
            },
            {
              id: '3',
              content: (
                <FilterChip
                  variant='chip'
                  attribute='Country'
                  operator='is not'
                  value='US'
                  onRemove={() => console.log('Remove chip 3')}
                />
              ),
            },
          ]}
          onChipRemove={chipId => console.log('Remove chip:', chipId)}
          onClear={() => console.log('Clear all')}
        />
      </div>
    );
  },
};
