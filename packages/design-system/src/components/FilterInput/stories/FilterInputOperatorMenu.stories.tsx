import * as React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import type { FilterInputOperatorMenuProps } from '../FilterInputMenu';
import { FilterInputOperatorMenu } from '../FilterInputMenu';
import type { FilterOperator } from '../types';

const DESCRIPTION = [
  'The operator menu, shown on its own — `FilterInput` opens it once a field is chosen, and that field’s `type` decides the list.',
  'The wording is house-fixed: you pass tokens like `is_null` and the menu renders the words, so operator labels stay the same everywhere.',
].join(' ');

const meta = {
  title: 'Patterns/FilterInput/FilterInputOperatorMenu',
  component: FilterInputOperatorMenu,
  parameters: {
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
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
} satisfies Meta<typeof FilterInputOperatorMenu>;

export default meta;

const Template: StoryFn<typeof meta> = (args: FilterInputOperatorMenuProps) => {
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
      {selectedOperator && <p className='sb-annotation mb-2'>selected: {selectedOperator}</p>}
      <FilterInputOperatorMenu
        {...args}
        selectedOperator={selectedOperator}
        onSelect={setSelectedOperator}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
};

/** A string field: equality, substring matching, set membership, and the two presence checks. */
export const StringType = Template.bind({});
StringType.args = {
  fieldType: 'string',
  open: true,
};

/** Numbers add the comparisons and `between` — the operators a row of dropdowns cannot express, and the usual reason to reach for this pattern at all. */
export const IntegerType = Template.bind({});
IntegerType.args = {
  fieldType: 'integer',
  open: true,
};

/** Same as integer, minus set membership: picking an exact float out of a list is not a real query. */
export const FloatType = Template.bind({});
FloatType.args = {
  fieldType: 'float',
  open: true,
};

/** Dates behave like numbers — before, after, between — so a time window is one condition rather than two. */
export const DateType = Template.bind({});
DateType.args = {
  fieldType: 'date',
  open: true,
};

/** A boolean offers is / is not and the presence checks, and nothing else is worth asking. */
export const BooleanType = Template.bind({});
BooleanType.args = {
  fieldType: 'boolean',
  open: true,
};

/** An enum trades comparison for set membership: is one of / is not one of is the operator that earns its place here. */
export const EnumType = Template.bind({});
EnumType.args = {
  fieldType: 'enum',
  open: true,
};

/** Selection wired up, with the chosen operator echoed above the menu. */
export const Interactive = Template.bind({});
Interactive.args = {
  fieldType: 'string',
  open: true,
};

/** Arrow keys move, Enter selects, Escape closes — the menu is fully operable without a pointer. */
export const KeyboardNavigation: StoryFn<typeof meta> = (args: FilterInputOperatorMenuProps) => {
  const [selectedOperator, setSelectedOperator] = React.useState<FilterOperator | undefined>(
    undefined,
  );
  const [open, setOpen] = React.useState(true);

  return (
    <div className='p-4'>
      <p className='sb-annotation mb-4'>↑ ↓ navigate · Enter selects · Esc closes</p>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='px-4 py-2 bg-blue-500 text-white rounded-md mb-2'
      >
        {open ? 'Close Menu' : 'Open Menu'}
      </button>
      {selectedOperator && <p className='sb-annotation mb-2'>selected: {selectedOperator}</p>}
      <FilterInputOperatorMenu
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
