import * as React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import type { FilterOperator } from '../types';
import type { FilterOperatorMenuProps } from './FilterOperatorMenu';
import { FilterOperatorMenu } from './FilterOperatorMenu';

const meta = {
  title: 'Components/Filter/FilterOperatorMenu',
  component: FilterOperatorMenu,
  tags: ['autodocs'],
  argTypes: {
    fieldType: {
      control: 'select',
      options: ['string', 'integer', 'float', 'date', 'boolean', 'enum'],
      description: 'The field type to determine which operators to show',
    },
    selectedOperator: {
      control: 'select',
      options: [
        '=',
        '!=',
        '>',
        '<',
        '>=',
        '<=',
        'like',
        'not_like',
        'in',
        'not_in',
        'is_null',
        'is_not_null',
        'between',
      ],
      description: 'The currently selected operator',
    },
    open: {
      control: 'boolean',
      description: 'Whether the menu is open',
    },
  },
} satisfies Meta<typeof FilterOperatorMenu>;

export default meta;

const Template: StoryFn<typeof meta> = (args: FilterOperatorMenuProps) => {
  const [selectedOperator, setSelectedOperator] = React.useState<FilterOperator | undefined>(
    args.selectedOperator,
  );
  const [open, setOpen] = React.useState(args.open ?? false);

  return (
    <div className='p-4'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='px-4 py-2 bg-blue-500 text-white rounded-md mb-2'
      >
        {open ? 'Close Menu' : 'Open Menu'}
      </button>
      {selectedOperator && (
        <div className='mb-2 text-sm text-gray-600'>
          Selected: <strong>{selectedOperator}</strong>
        </div>
      )}
      <FilterOperatorMenu
        {...args}
        selectedOperator={selectedOperator}
        onSelect={setSelectedOperator}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
};

/**
 * String field type operators: is, is not, contains, does not contain, is one of, is not one of, is empty, is not empty
 */
export const StringType = Template.bind({});
StringType.args = {
  fieldType: 'string',
  open: true,
};

/**
 * Integer field type operators: is, is not, greater than, less than, greater than or equal to, less than or equal to, is between, is one of, is not one of, is empty, is not empty
 */
export const IntegerType = Template.bind({});
IntegerType.args = {
  fieldType: 'integer',
  open: true,
};

/**
 * Float field type operators: is, is not, greater than, less than, greater than or equal to, less than or equal to, is between, is empty, is not empty
 */
export const FloatType = Template.bind({});
FloatType.args = {
  fieldType: 'float',
  open: true,
};

/**
 * Date field type operators: is, is not, greater than, less than, greater than or equal to, less than or equal to, is between, is empty, is not empty
 */
export const DateType = Template.bind({});
DateType.args = {
  fieldType: 'date',
  open: true,
};

/**
 * Boolean field type operators: is, is not, is empty, is not empty
 */
export const BooleanType = Template.bind({});
BooleanType.args = {
  fieldType: 'boolean',
  open: true,
};

/**
 * Enum field type operators: is, is not, is one of, is not one of, is empty, is not empty
 */
export const EnumType = Template.bind({});
EnumType.args = {
  fieldType: 'enum',
  open: true,
};

/**
 * Interactive example showing operator selection
 */
export const Interactive = Template.bind({});
Interactive.args = {
  fieldType: 'string',
  open: true,
};

/**
 * Keyboard navigation example - demonstrates arrow keys, Enter, and Esc
 * Use Arrow Up/Down to navigate, Enter to select, Esc to close
 */
export const KeyboardNavigation: StoryFn<typeof meta> = (args: FilterOperatorMenuProps) => {
  const [selectedOperator, setSelectedOperator] = React.useState<FilterOperator | undefined>(
    undefined,
  );
  const [open, setOpen] = React.useState(true);

  return (
    <div className='p-4'>
      <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='font-semibold mb-2'>Keyboard Navigation Instructions:</h3>
        <ul className='list-disc list-inside text-sm space-y-1'>
          <li>
            <kbd className='px-2 py-1 bg-white border rounded text-xs'>↑</kbd> /{' '}
            <kbd className='px-2 py-1 bg-white border rounded text-xs'>↓</kbd> - Navigate between
            items
          </li>
          <li>
            <kbd className='px-2 py-1 bg-white border rounded text-xs'>Enter</kbd> - Select
            highlighted item
          </li>
          <li>
            <kbd className='px-2 py-1 bg-white border rounded text-xs'>Esc</kbd> - Close menu
          </li>
        </ul>
      </div>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='px-4 py-2 bg-blue-500 text-white rounded-md mb-2'
      >
        {open ? 'Close Menu' : 'Open Menu'}
      </button>
      {selectedOperator && (
        <div className='mb-2 text-sm text-gray-600'>
          Selected: <strong>{selectedOperator}</strong>
        </div>
      )}
      <FilterOperatorMenu
        {...args}
        fieldType='string'
        selectedOperator={selectedOperator}
        onSelect={setSelectedOperator}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
};
