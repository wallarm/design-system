import { type FC, useMemo, useRef, useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { ChevronDown } from '../../../icons';
import { Button } from '../../Button';
import { FilterInputOperatorMenu } from '../FilterInputMenu';
import type { FieldType, FilterOperator } from '../types';

const DESCRIPTION = [
  'The operator menu, shown on its own — `FilterInput` opens it once a field is chosen, and that field’s `type` decides the list.',
  'The wording is house-fixed: you pass tokens like `is_null` and the menu renders the words, so operator labels stay the same everywhere.',
  'Click the trigger to open, click it again or press Escape to close.',
].join(' ');

const meta = {
  title: 'Patterns/FilterInput/FilterInputOperatorMenu',
  component: FilterInputOperatorMenu,
  parameters: {
    layout: 'padded',
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

/**
 * Like the field menu, this one carries no trigger: `FilterInput` owns `open` and
 * anchors it to the chip segment being edited. Standalone it needs both, so every
 * story hangs it off a `Button` and drives `open` from local state.
 */
const OperatorMenuHarness: FC<{ fieldType: FieldType }> = ({ fieldType }) => {
  const [open, setOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const positioning = useMemo(
    () => ({
      placement: 'bottom-start' as const,
      gutter: 4,
      getAnchorRect: () => triggerRef.current?.getBoundingClientRect() ?? null,
    }),
    [],
  );

  return (
    <div className='flex items-center gap-16'>
      <Button
        ref={triggerRef}
        variant='outline'
        color='neutral'
        data-testid='operator-menu-trigger'
        onClick={() => setOpen(isOpen => !isOpen)}
      >
        {fieldType} field
        <ChevronDown />
      </Button>

      {selectedOperator && <span className='sb-annotation'>selected: {selectedOperator}</span>}

      <FilterInputOperatorMenu
        fieldType={fieldType}
        selectedOperator={selectedOperator}
        onSelect={operator => {
          setSelectedOperator(operator);
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
        onEscape={() => setOpen(false)}
        positioning={positioning}
      />
    </div>
  );
};

/** A string field: equality, substring matching, set membership, and the two presence checks. */
export const StringType: StoryFn = () => <OperatorMenuHarness fieldType='string' />;

/** Numbers add the comparison operators, which is the usual reason to reach for a query builder at all, with `in` below the rule as its own group. `between` is not here — it is date-only. */
export const IntegerType: StoryFn = () => <OperatorMenuHarness fieldType='integer' />;

/** Same comparisons as integer, minus `in`: picking an exact float out of a list is not a real query. */
export const FloatType: StoryFn = () => <OperatorMenuHarness fieldType='float' />;

/** Dates are the only type that offers `between`, so a time window is one condition rather than two, and the comparisons read as before and after. */
export const DateType: StoryFn = () => <OperatorMenuHarness fieldType='date' />;

/** A boolean offers is / is not and the presence checks, and nothing else is worth asking. */
export const BooleanType: StoryFn = () => <OperatorMenuHarness fieldType='boolean' />;

/** An enum trades comparison for set membership: is one of / is not one of is the operator that earns its place here. */
export const EnumType: StoryFn = () => <OperatorMenuHarness fieldType='enum' />;

/** Selection wired up, with the chosen operator echoed beside the trigger. */
export const Interactive: StoryFn = () => <OperatorMenuHarness fieldType='string' />;

/** Arrow keys move, Enter selects, Escape closes — the menu is fully operable without a pointer once the trigger has opened it. */
export const KeyboardNavigation: StoryFn = () => (
  <div className='flex flex-col gap-8'>
    <p className='sb-annotation'>↑ ↓ navigate · Enter selects · Esc closes</p>
    <OperatorMenuHarness fieldType='string' />
  </div>
);
