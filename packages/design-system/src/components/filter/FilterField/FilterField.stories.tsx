import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Search } from '../../../icons/Search';
import { FilterChip } from '../FilterChip';
import { FilterMainMenu } from '../FilterMainMenu/FilterMainMenu';
import { FilterOperatorMenu } from '../FilterOperatorMenu/FilterOperatorMenu';
import type { FieldMetadata, FieldType, FilterOperator } from '../types';
import { getOperatorLabel } from '../types';
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
 * Field with exactly three chips (max visible).
 */
export const WithExactlyThreeChips: Story = {
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
    ],
  },
};

/**
 * Field with more than three chips - shows first 3 + placeholder hint.
 */
export const WithMoreThanThreeChips: Story = {
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
 * Error state - with chips. Error automatically propagates to chips.
 */
export const ErrorWithChips: Story = {
  args: {
    placeholder: 'Search [object]...',
    error: true,
    chips: [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='invalid' />,
      },
    ],
  },
};

/**
 * Interactive example with chip removal.
 */
export const InteractiveWithRemoval: Story = {
  render: () => {
    const [chips, setChips] = React.useState([
      { id: '1', variant: 'chip' as const, attribute: 'IP', operator: 'is', value: '192.168.1.1' },
      { id: '2', variant: 'and' as const },
      { id: '3', variant: 'chip' as const, attribute: 'Country', operator: 'is', value: 'US' },
      { id: '4', variant: 'and' as const },
      { id: '5', variant: 'chip' as const, attribute: 'Status', operator: 'is', value: 'Active' },
    ]);

    const handleChipRemove = (chipId: string) => {
      setChips(chips.filter(c => c.id !== chipId));
    };

    const handleClear = () => {
      setChips([]);
    };

    return (
      <div className='space-y-4'>
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
                onRemove={chip.variant === 'chip' ? () => handleChipRemove(chip.id) : undefined}
              />
            ),
          }))}
          onChipRemove={handleChipRemove}
          onClear={handleClear}
        />
        <p className='text-sm text-text-secondary'>
          Total chips: {chips.length}, Visible: {Math.min(chips.length, 3)}
        </p>
      </div>
    );
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
                  onRemove={() => {}}
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
                  onRemove={() => {}}
                />
              ),
            },
          ]}
          onChipRemove={_chipId => {}}
          onClear={() => {}}
        />
      </div>
    );
  },
};

/**
 * Interactive example with menu integration.
 *
 * Features:
 * - Click on **attribute** (field name) to open FilterMainMenu and change the field
 * - Click on **operator** (is, is not, etc.) to open FilterOperatorMenu and change the operator
 * - Each chip can be removed using the hover delete button
 * - All chips can be cleared using the X button in the field
 *
 * This demonstrates the full integration pattern for building an interactive filter UI.
 */
export const WithMenuIntegration: Story = {
  render: () => {
    const [chips, setChips] = React.useState<
      Array<{
        id: string;
        variant: 'chip' | 'and' | 'or';
        field?: string;
        fieldType?: FieldType;
        operator?: FilterOperator;
        value?: string;
      }>
    >([
      { id: '1', variant: 'chip', field: 'Status', fieldType: 'enum', operator: '=', value: 'Active' },
      { id: '2', variant: 'and' },
      {
        id: '3',
        variant: 'chip',
        field: 'HTTP status code',
        fieldType: 'integer',
        operator: '=',
        value: '200',
      },
    ]);

    const [openMenu, setOpenMenu] = React.useState<{
      type: 'main' | 'operator' | null;
      chipId: string | null;
      position?: { x: number; y: number };
    }>({ type: null, chipId: null });

    // Sample fields for FilterMainMenu
    const sampleFields: FieldMetadata[] = [
      { name: 'status', label: 'Status', type: 'enum' },
      { name: 'severity', label: 'Severity', type: 'enum' },
      { name: 'location', label: 'Location', type: 'string' },
      { name: 'http_status_code', label: 'HTTP status code', type: 'integer' },
      { name: 'endpoint', label: 'Endpoint', type: 'string' },
    ];

    const handleChipClick = (chipId: string, event: React.MouseEvent) => {
      const chip = chips.find(c => c.id === chipId);
      if (!chip || chip.variant !== 'chip') return;

      const target = event.target as HTMLElement;
      const segmentSlot = target.closest('[data-slot]')?.getAttribute('data-slot');

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

      if (segmentSlot === 'segment-attribute') {
        setOpenMenu({
          type: 'main',
          chipId,
          position: { x: rect.left, y: rect.bottom + 4 },
        });
      } else if (segmentSlot === 'segment-operator') {
        setOpenMenu({
          type: 'operator',
          chipId,
          position: { x: rect.left, y: rect.bottom + 4 },
        });
      }
    };

    const handleFieldSelect = (field: FieldMetadata) => {
      if (openMenu.chipId) {
        setChips(prevChips =>
          prevChips.map(chip =>
            chip.id === openMenu.chipId
              ? { ...chip, field: field.label, fieldType: field.type }
              : chip,
          ),
        );
      }
      setOpenMenu({ type: null, chipId: null });
    };

    const handleOperatorSelect = (operator: FilterOperator) => {
      if (openMenu.chipId) {
        setChips(prevChips =>
          prevChips.map(chip =>
            chip.id === openMenu.chipId ? { ...chip, operator } : chip,
          ),
        );
      }
      setOpenMenu({ type: null, chipId: null });
    };

    const handleChipRemove = (chipId: string) => {
      setChips(chips.filter(c => c.id !== chipId));
    };

    const handleClear = () => {
      setChips([]);
    };

    return (
      <div className='relative space-y-4'>
        <FilterField
          placeholder='Search attacks...'
          leftIcon={<Search className='size-6 text-text-secondary' />}
          showKeyboardHint
          chips={chips.map(chip => ({
            id: chip.id,
            content:
              chip.variant === 'chip' ? (
                <div onClick={(e: React.MouseEvent) => handleChipClick(chip.id, e)}>
                  <FilterChip
                    variant='chip'
                    attribute={chip.field}
                    operator={
                      chip.operator && chip.fieldType
                        ? getOperatorLabel(chip.operator, chip.fieldType)
                        : chip.operator
                    }
                    value={chip.value}
                    onRemove={() => handleChipRemove(chip.id)}
                  />
                </div>
              ) : (
                <FilterChip variant={chip.variant} />
              ),
          }))}
          onChipRemove={handleChipRemove}
          onClear={handleClear}
        />

        <p className='text-sm text-text-secondary'>
          Click on attribute or operator segments to edit. Total chips: {chips.length}
        </p>

        {/* FilterMainMenu */}
        {openMenu.type === 'main' && openMenu.position && (
          <div
            style={{
              position: 'fixed',
              top: openMenu.position.y,
              left: openMenu.position.x,
              zIndex: 1000,
            }}
          >
            <FilterMainMenu
              fields={sampleFields}
              open={true}
              onOpenChange={() => setOpenMenu({ type: null, chipId: null })}
              onSelect={handleFieldSelect}
            />
          </div>
        )}

        {/* FilterOperatorMenu */}
        {openMenu.type === 'operator' && openMenu.position && openMenu.chipId && (
          <div
            style={{
              position: 'fixed',
              top: openMenu.position.y,
              left: openMenu.position.x,
              zIndex: 1000,
            }}
          >
            <FilterOperatorMenu
              fieldType={chips.find(c => c.id === openMenu.chipId)?.fieldType || 'string'}
              open={true}
              onOpenChange={() => setOpenMenu({ type: null, chipId: null })}
              onSelect={handleOperatorSelect}
            />
          </div>
        )}
      </div>
    );
  },
};

/**
 * Field with chips and clear button - hover to see clear button.
 */
export const WithClearButton: Story = {
  args: {
    placeholder: 'Search attacks...',
    leftIcon: <Search className='size-6 text-text-secondary' />,
    showKeyboardHint: true,
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
    onClear: () => alert('Clear clicked!'),
  },
};

/**
 * Hover state demonstration - border changes to #90a1b9.
 */
export const HoverStateDemo: Story = {
  render: () => {
    return (
      <div className='space-y-4'>
        <div>
          <p className='mb-2 text-sm text-text-secondary'>
            Hover over the field to see border color change:
          </p>
          <FilterField
            placeholder='Search attacks...'
            leftIcon={<Search className='size-6 text-text-secondary' />}
          />
        </div>
        <div>
          <p className='mb-2 text-sm text-text-secondary'>Hover with chips:</p>
          <FilterField
            placeholder='Search attacks...'
            chips={[
              {
                id: '1',
                content: (
                  <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />
                ),
              },
            ]}
            onClear={() => {}}
          />
        </div>
      </div>
    );
  },
};

/**
 * Focus state demonstration - focus ring appears with 3px spread.
 */
export const FocusStateDemo: Story = {
  render: () => {
    return (
      <div className='space-y-4'>
        <div>
          <p className='mb-2 text-sm text-text-secondary'>
            Click the field to see focus ring (blue, 3px spread):
          </p>
          <FilterField
            placeholder='Search attacks...'
            leftIcon={<Search className='size-6 text-text-secondary' />}
          />
        </div>
        <div>
          <p className='mb-2 text-sm text-text-secondary'>Focus state with chips:</p>
          <FilterField
            placeholder='Search attacks...'
            chips={[
              {
                id: '1',
                content: (
                  <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />
                ),
              },
            ]}
            onClear={() => {}}
          />
        </div>
      </div>
    );
  },
};

/**
 * Error hover and focus states - red focus ring. Error propagates to chips automatically.
 */
export const ErrorStatesDemo: Story = {
  render: () => {
    return (
      <div className='space-y-4'>
        <div>
          <p className='mb-2 text-sm text-text-secondary'>
            Hover: red focus ring with rgba(231,0,11,0.3)
          </p>
          <FilterField placeholder='Search attacks...' error />
        </div>
        <div>
          <p className='mb-2 text-sm text-text-secondary'>
            Focus: red focus ring with rgba(231,0,11,0.2)
          </p>
          <FilterField placeholder='Search attacks...' error />
        </div>
        <div>
          <p className='mb-2 text-sm text-text-secondary'>
            Error with chips (error propagates automatically):
          </p>
          <FilterField
            placeholder='Search attacks...'
            error
            chips={[
              {
                id: '1',
                content: <FilterChip variant='chip' attribute='IP' operator='is' value='invalid' />,
              },
              {
                id: '2',
                content: <FilterChip variant='and' />,
              },
              {
                id: '3',
                content: (
                  <FilterChip variant='chip' attribute='Country' operator='is' value='Unknown' />
                ),
              },
            ]}
            onClear={() => {}}
          />
        </div>
      </div>
    );
  },
};
