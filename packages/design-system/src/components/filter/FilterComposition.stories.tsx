import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Search } from '../../icons/Search';
import { FilterChip } from './FilterChip';
import { FilterField } from './FilterField';
import { FilterMainMenu } from './FilterMainMenu';
import { FilterOperatorMenu } from './FilterOperatorMenu';
import type { FieldMetadata, FilterChipData, FilterOperator } from './types';
import { OPERATOR_LABELS } from './types';

const meta = {
  title: 'Components/Filter/Composition',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Complete filter composition example showing how all filter components work together to build complex attack filter queries with attribute-operator-value conditions and AND/OR logic.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

// Sample field metadata
const sampleFields: FieldMetadata[] = [
  {
    name: 'ip_address',
    label: 'IP Address',
    type: 'string',
    description: 'Source IP address',
  },
  {
    name: 'country',
    label: 'Country',
    type: 'enum',
    description: 'Geographic country code',
  },
  {
    name: 'http_status',
    label: 'HTTP Status',
    type: 'integer',
    description: 'HTTP response status code',
  },
  {
    name: 'attack_type',
    label: 'Attack Type',
    type: 'enum',
    description: 'Type of attack detected',
  },
  {
    name: 'severity',
    label: 'Severity',
    type: 'enum',
    description: 'Attack severity level',
  },
  {
    name: 'timestamp',
    label: 'Timestamp',
    type: 'date',
    description: 'Event timestamp',
  },
  {
    name: 'response_time',
    label: 'Response Time',
    type: 'float',
    description: 'Request response time in ms',
  },
  {
    name: 'blocked',
    label: 'Blocked',
    type: 'boolean',
    description: 'Whether request was blocked',
  },
];

const recentFields = sampleFields.slice(0, 3);
const suggestedFields = sampleFields.slice(0, 4);

/**
 * Complete interactive filter composition example.
 *
 * This story demonstrates the full filter workflow:
 * 1. Click the FilterField to open the field selection menu
 * 2. Select a field from FilterMainMenu (with search, recent, and suggestions)
 * 3. Choose an operator from FilterOperatorMenu (with keyboard navigation)
 * 4. Enter a value and add the filter chip
 * 5. Build complex queries with AND/OR logic and parentheses
 * 6. Remove chips by hovering and clicking the delete button
 * 7. Clear all filters with the clear button
 */
export const CompleteFilterWorkflow: StoryFn = () => {
  const [chips, setChips] = React.useState<FilterChipData[]>([
    {
      id: '1',
      variant: 'chip',
      attribute: 'IP Address',
      operator: 'is',
      value: '192.168.1.1',
      error: false,
    },
    {
      id: '2',
      variant: 'and',
    },
    {
      id: '3',
      variant: 'chip',
      attribute: 'Country',
      operator: 'is',
      value: 'US',
      error: false,
    },
  ]);

  const [fieldMenuOpen, setFieldMenuOpen] = React.useState(false);
  const [operatorMenuOpen, setOperatorMenuOpen] = React.useState(false);
  const [selectedField, setSelectedField] = React.useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = React.useState<FilterOperator | undefined>(
    undefined,
  );
  const [inputValue, setInputValue] = React.useState('');

  const handleFieldSelect = (field: FieldMetadata) => {
    setSelectedField(field);
    setFieldMenuOpen(false);
    setOperatorMenuOpen(true);
  };

  const handleOperatorSelect = (operator: FilterOperator) => {
    setSelectedOperator(operator);
    setOperatorMenuOpen(false);
  };

  const handleAddChip = () => {
    if (selectedField && selectedOperator && inputValue.trim()) {
      const newChip: FilterChipData = {
        id: String(Date.now()),
        variant: 'chip',
        attribute: selectedField.label,
        operator: OPERATOR_LABELS[selectedOperator],
        value: inputValue,
        error: false,
      };
      setChips([...chips, newChip]);
      setSelectedField(null);
      setSelectedOperator(undefined);
      setInputValue('');
    }
  };

  const handleAddLogicalOperator = (variant: 'and' | 'or') => {
    const newChip: FilterChipData = {
      id: String(Date.now()),
      variant,
    };
    setChips([...chips, newChip]);
  };

  const handleAddParenthesis = (variant: '(' | ')') => {
    const newChip: FilterChipData = {
      id: String(Date.now()),
      variant,
    };
    setChips([...chips, newChip]);
  };

  const handleChipRemove = (chipId: string) => {
    setChips(chips.filter(c => c.id !== chipId));
  };

  const handleClear = () => {
    setChips([]);
  };

  return (
    <div className='w-full max-w-4xl space-y-6'>
      {/* Main Filter Field */}
      <div className='relative'>
        <FilterField
          placeholder='Search attacks...'
          leftIcon={<Search className='size-6 text-text-secondary' />}
          showKeyboardHint
          chips={chips.map(chip => ({
            id: chip.id,
            content: (
              <FilterChip
                variant={chip.variant}
                attribute={chip.attribute}
                operator={chip.operator}
                value={chip.value}
                error={chip.error}
                onRemove={chip.variant === 'chip' ? () => handleChipRemove(chip.id) : undefined}
              />
            ),
          }))}
          onFocus={() => setFieldMenuOpen(true)}
          onChipRemove={handleChipRemove}
          onClear={handleClear}
        />

        {/* Field Selection Menu */}
        <div className='relative mt-2'>
          <FilterMainMenu
            fields={sampleFields}
            recentFields={recentFields}
            suggestedFields={suggestedFields}
            open={fieldMenuOpen}
            onOpenChange={setFieldMenuOpen}
            onSelect={handleFieldSelect}
          />
        </div>

        {/* Operator Selection Menu */}
        {selectedField && (
          <div className='relative mt-2'>
            <FilterOperatorMenu
              fieldType={selectedField.type}
              selectedOperator={selectedOperator}
              open={operatorMenuOpen}
              onOpenChange={setOperatorMenuOpen}
              onSelect={handleOperatorSelect}
            />
          </div>
        )}
      </div>

      {/* Value Input and Add Button */}
      {selectedField && selectedOperator && (
        <div className='flex items-center gap-2 p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
          <div className='flex items-center gap-2 flex-1'>
            <span className='text-sm font-medium text-text-secondary'>
              {selectedField.label} {OPERATOR_LABELS[selectedOperator]}
            </span>
            <input
              type='text'
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder='Enter value...'
              className='flex-1 px-3 py-2 border border-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleAddChip();
                }
              }}
            />
          </div>
          <button
            type='button'
            onClick={handleAddChip}
            disabled={!inputValue.trim()}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium'
          >
            Add Filter
          </button>
        </div>
      )}

      {/* Logical Operators and Parentheses Controls */}
      <div className='flex items-center gap-2 p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
        <span className='text-sm font-medium text-text-secondary mr-2'>Add:</span>
        <button
          type='button'
          onClick={() => handleAddLogicalOperator('and')}
          className='px-3 py-1.5 bg-white border border-border-primary rounded-md hover:bg-gray-50 text-sm font-medium'
        >
          AND
        </button>
        <button
          type='button'
          onClick={() => handleAddLogicalOperator('or')}
          className='px-3 py-1.5 bg-white border border-border-primary rounded-md hover:bg-gray-50 text-sm font-medium'
        >
          OR
        </button>
        <div className='w-px h-6 bg-border-primary mx-2' />
        <button
          type='button'
          onClick={() => handleAddParenthesis('(')}
          className='px-3 py-1.5 bg-white border border-border-primary rounded-md hover:bg-gray-50 text-sm font-medium'
        >
          (
        </button>
        <button
          type='button'
          onClick={() => handleAddParenthesis(')')}
          className='px-3 py-1.5 bg-white border border-border-primary rounded-md hover:bg-gray-50 text-sm font-medium'
        >
          )
        </button>
      </div>

      {/* Current Filter Preview */}
      <div className='p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
        <h3 className='text-sm font-semibold mb-3 text-text-primary'>Current Filter Expression:</h3>
        <div className='flex items-center gap-1 flex-wrap'>
          {chips.length > 0 ? (
            chips.map(chip => (
              <FilterChip
                key={chip.id}
                variant={chip.variant}
                attribute={chip.attribute}
                operator={chip.operator}
                value={chip.value}
                error={chip.error}
                onRemove={chip.variant === 'chip' ? () => handleChipRemove(chip.id) : undefined}
              />
            ))
          ) : (
            <p className='text-sm text-text-secondary'>No filters applied</p>
          )}
        </div>
        <div className='mt-3 pt-3 border-t border-border-primary'>
          <p className='text-xs text-text-secondary'>Total filters: {chips.length}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
        <h3 className='text-sm font-semibold mb-2 text-blue-900'>How to use:</h3>
        <ol className='list-decimal list-inside text-sm text-blue-800 space-y-1'>
          <li>Click the filter field to open the field selection menu</li>
          <li>Search or select a field (Recent/Suggestions sections available)</li>
          <li>Choose an operator (use arrow keys for keyboard navigation)</li>
          <li>Enter a value and click "Add Filter" or press Enter</li>
          <li>Use AND/OR buttons to add logical operators</li>
          <li>Use parentheses buttons to group conditions</li>
          <li>Hover over chips to see and click the delete button</li>
          <li>Click the clear button (×) on the right to remove all filters</li>
        </ol>
      </div>
    </div>
  );
};

/**
 * Static example showing a complex filter expression.
 *
 * Example query: (IP is 192.168.1.1 OR IP is 10.0.0.1) AND Country is US AND Severity is High
 */
export const StaticComplexExample: StoryFn = () => {
  const complexChips: FilterChipData[] = [
    { id: '1', variant: '(' },
    { id: '2', variant: 'chip', attribute: 'IP Address', operator: 'is', value: '192.168.1.1' },
    { id: '3', variant: 'or' },
    { id: '4', variant: 'chip', attribute: 'IP Address', operator: 'is', value: '10.0.0.1' },
    { id: '5', variant: ')' },
    { id: '6', variant: 'and' },
    { id: '7', variant: 'chip', attribute: 'Country', operator: 'is', value: 'US' },
    { id: '8', variant: 'and' },
    { id: '9', variant: 'chip', attribute: 'Severity', operator: 'is', value: 'High' },
  ];

  return (
    <div className='w-full max-w-4xl space-y-4'>
      <FilterField
        placeholder='Search attacks...'
        leftIcon={<Search className='size-6 text-text-secondary' />}
        showKeyboardHint
        chips={complexChips.map(chip => ({
          id: chip.id,
          content: (
            <FilterChip
              variant={chip.variant}
              attribute={chip.attribute}
              operator={chip.operator}
              value={chip.value}
            />
          ),
        }))}
        onClear={() => {}}
      />
      <div className='p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
        <p className='text-sm text-text-secondary'>
          Query:{' '}
          <strong>
            (IP is 192.168.1.1 OR IP is 10.0.0.1) AND Country is US AND Severity is High
          </strong>
        </p>
      </div>
    </div>
  );
};

/**
 * Example showing error state with validation.
 *
 * Demonstrates how error state propagates from FilterField to FilterChip components.
 */
export const WithValidationErrors: StoryFn = () => {
  const [hasError, setHasError] = React.useState(true);

  const errorChips: FilterChipData[] = [
    {
      id: '1',
      variant: 'chip',
      attribute: 'IP Address',
      operator: 'is',
      value: 'invalid-ip',
      error: true,
    },
    { id: '2', variant: 'and' },
    { id: '3', variant: 'chip', attribute: 'Country', operator: 'is', value: '', error: true },
  ];

  return (
    <div className='w-full max-w-4xl space-y-4'>
      <FilterField
        placeholder='Search attacks...'
        leftIcon={<Search className='size-6 text-text-secondary' />}
        error={hasError}
        chips={errorChips.map(chip => ({
          id: chip.id,
          content: (
            <FilterChip
              variant={chip.variant}
              attribute={chip.attribute}
              operator={chip.operator}
              value={chip.value}
              error={chip.error}
            />
          ),
        }))}
        onClear={() => {}}
      />
      <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
        <div className='flex items-start gap-2'>
          <svg className='w-5 h-5 text-red-500 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
            <title>Error icon</title>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
          <div className='flex-1'>
            <p className='text-sm font-medium text-red-900 mb-1'>Validation Errors:</p>
            <ul className='list-disc list-inside text-sm text-red-800 space-y-1'>
              <li>Invalid IP address format: "invalid-ip"</li>
              <li>Country value is required</li>
            </ul>
          </div>
        </div>
        <button
          type='button'
          onClick={() => setHasError(!hasError)}
          className='mt-3 px-3 py-1.5 bg-red-100 text-red-900 rounded-md hover:bg-red-200 text-sm font-medium'
        >
          {hasError ? 'Clear Errors' : 'Show Errors'}
        </button>
      </div>
    </div>
  );
};

/**
 * All components showcase - individual component examples.
 *
 * Displays each filter component in isolation for reference.
 */
export const AllComponentsShowcase: StoryFn = () => {
  return (
    <div className='w-full max-w-4xl space-y-8'>
      {/* FilterChip variants */}
      <div>
        <h3 className='text-sm font-semibold mb-3 text-text-primary'>FilterChip Variants:</h3>
        <div className='flex items-center gap-2 flex-wrap p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
          <FilterChip variant='chip' attribute='IP Address' operator='is' value='192.168.1.1' />
          <FilterChip variant='and' />
          <FilterChip variant='or' />
          <FilterChip variant='(' />
          <FilterChip variant=')' />
          <FilterChip
            variant='chip'
            attribute='Invalid'
            operator='is'
            value='error'
            error
            onRemove={() => {}}
          />
        </div>
      </div>

      {/* FilterMainMenu */}
      <div>
        <h3 className='text-sm font-semibold mb-3 text-text-primary'>FilterMainMenu:</h3>
        <div className='p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
          <FilterMainMenu
            fields={sampleFields}
            recentFields={recentFields}
            suggestedFields={suggestedFields}
            open
            onOpenChange={() => {}}
            onSelect={() => {}}
          />
        </div>
      </div>

      {/* FilterOperatorMenu */}
      <div>
        <h3 className='text-sm font-semibold mb-3 text-text-primary'>
          FilterOperatorMenu (String Type):
        </h3>
        <div className='p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
          <FilterOperatorMenu fieldType='string' open onOpenChange={() => {}} onSelect={() => {}} />
        </div>
      </div>

      {/* FilterField states */}
      <div>
        <h3 className='text-sm font-semibold mb-3 text-text-primary'>FilterField States:</h3>
        <div className='space-y-3'>
          <FilterField placeholder='Empty state' />
          <FilterField
            placeholder='With chips'
            chips={[
              {
                id: '1',
                content: (
                  <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />
                ),
              },
            ]}
          />
          <FilterField placeholder='Error state' error />
        </div>
      </div>
    </div>
  );
};
