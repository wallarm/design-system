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
