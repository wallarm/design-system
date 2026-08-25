import * as React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { fn } from 'storybook/test';
import {
  FilterInputChip,
  type FilterInputChipProps,
  FilterInputConnectorChip,
} from '../FilterInputField';
import { MockFilterInputProvider } from './mockFilterInputContext';

const onRemove = fn().mockName('onRemove');
const onRemoveShouldNotFire = fn().mockName('onRemoveShouldNotFire');

const DESCRIPTION = [
  'The chip `FilterInput` renders for each committed condition — attribute, operator, value — exported for rare custom builds.',
  'The pattern creates, edits and removes these itself, so reach for `FilterInput` rather than assembling chips by hand; these stories exist to check the chip states.',
].join(' ');

const meta = {
  title: 'Patterns/FilterInput/FilterInputChip',
  component: FilterInputChip,
  parameters: {
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
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
} satisfies Meta<typeof FilterInputChip>;

export default meta;

const Template: StoryFn<typeof meta> = (args: FilterInputChipProps) => (
  <FilterInputChip {...args} />
);

/** The three segments a chip is made of; inside `FilterInput` each one is separately clickable, which is how a committed filter gets edited. */
export const Default = Template.bind({});
Default.args = {
  attribute: 'Attribute',
  operator: 'operator',
  value: 'Value',
  error: false,
};

/** `error` reddens the chip for a value that was rejected. It is presentational only — the expression underneath is unchanged. */
export const WithError = Template.bind({});
WithError.args = {
  attribute: 'Attribute',
  operator: 'operator',
  value: 'Value',
  error: true,
};

/** Long text in both segments against the chip's 320px cap. Only the value segment can shrink, so a long field label fills the chip and the value collapses to nothing — one reason to keep field labels short. */
export const WithLongText = Template.bind({});
WithLongText.args = {
  attribute: 'Very Long Attribute Name That Should Truncate',
  operator: 'is',
  value: 'Very Long Value That Should Also Truncate With Ellipsis',
  error: false,
};

/** The same chip carrying real content, which is where the segment widths actually get tested. */
export const RealisticExample = Template.bind({});
RealisticExample.args = {
  attribute: 'IP Address',
  operator: 'is',
  value: '192.168.1.1',
  error: false,
};

/** The AND connector is itself a chip, clickable to change the join. Standalone it reads `FilterInput` context, so the story wraps it in a no-op provider. */
export const AndOperator: StoryFn = () => (
  <MockFilterInputProvider>
    <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
  </MockFilterInputProvider>
);

/** The OR connector, same shape — which is why AND/OR needs no separate control. */
export const OrOperator: StoryFn = () => (
  <MockFilterInputProvider>
    <FilterInputConnectorChip variant='or' chipId='c-1' onChange={() => undefined} />
  </MockFilterInputProvider>
);

/** Two conditions and the connector between them: what the input assembles as each chip commits. */
export const CombinedWithAnd: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex items-center gap-4'>
      <FilterInputChip attribute='IP Address' operator='is' value='192.168.1.1' />
      <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
      <FilterInputChip attribute='Country' operator='is' value='US' />
    </div>
  </MockFilterInputProvider>
);

/** The same pair joined by OR, where the connector is the only difference between two very different queries. */
export const CombinedWithOr: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex items-center gap-4'>
      <FilterInputChip attribute='Status' operator='is' value='Active' />
      <FilterInputConnectorChip variant='or' chipId='c-1' onChange={() => undefined} />
      <FilterInputChip attribute='Status' operator='is' value='Pending' />
    </div>
  </MockFilterInputProvider>
);

/** `onRemove` reveals the remove button on hover, so a resting filter row stays quiet. */
export const WithDeleteButton = Template.bind({});
WithDeleteButton.args = {
  attribute: 'IP Address',
  operator: 'is',
  value: '192.168.1.1',
  error: false,
  onRemove,
};

/** Error plus remove — a rejected chip has to stay removable, since dropping it is usually the fastest fix. */
export const ErrorWithDelete = Template.bind({});
ErrorWithDelete.args = {
  attribute: 'Invalid Field',
  operator: 'is',
  value: 'Invalid Value',
  error: true,
  onRemove,
};

/** Removing chips one at a time, with the connectors closing up behind them. */
export const InteractiveDeleteExample: StoryFn = () => {
  const [chips, setChips] = React.useState([
    { id: 1, attribute: 'IP Address', operator: 'is', value: '192.168.1.1' },
    { id: 2, attribute: 'Country', operator: 'is', value: 'US' },
    { id: 3, attribute: 'Status', operator: 'is', value: 'Active' },
  ]);

  return (
    <MockFilterInputProvider>
      <div className='flex items-center gap-4 flex-wrap'>
        {chips.map((chip, index) => (
          <React.Fragment key={chip.id}>
            {index > 0 && (
              <FilterInputConnectorChip
                variant='and'
                chipId={`connector-${chip.id}`}
                onChange={() => undefined}
              />
            )}
            <FilterInputChip
              attribute={chip.attribute}
              operator={chip.operator}
              value={chip.value}
              onRemove={() => setChips(chips.filter(c => c.id !== chip.id))}
            />
          </React.Fragment>
        ))}
        {chips.length === 0 && <p className='text-text-secondary text-sm'>All filters removed</p>}
      </div>
    </MockFilterInputProvider>
  );
};

// ============================================================================
// Disabled Chip Variants
// ============================================================================

/** `disabled` locks a chip: dimmed, no click, no remove, for a condition the surrounding page owns. */
export const Disabled = Template.bind({});
Disabled.args = {
  attribute: 'IP Address',
  operator: 'is',
  value: '34.74.73.20',
  disabled: true,
};

/** `disabled` wins over `onRemove` — no remove button appears, so a locked chip cannot be dropped by accident. */
export const DisabledWithOnRemove = Template.bind({});
DisabledWithOnRemove.args = {
  attribute: 'Host',
  operator: 'is',
  value: 'api.example.com',
  disabled: true,
  onRemove: onRemoveShouldNotFire,
};

/** Locked and editable chips in one row, which is what a drill-down actually looks like. */
export const DisabledAndInteractiveMix: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex items-center gap-4'>
      <FilterInputChip
        attribute='IP Address'
        operator='is'
        value='34.74.73.20'
        disabled
        onRemove={() => undefined}
      />
      <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
      <FilterInputChip attribute='Country' operator='is' value='US' onRemove={onRemove} />
    </div>
  </MockFilterInputProvider>
);

// ============================================================================
// Connector Variants
// ============================================================================

// ============================================================================
// Building Chip Variants
// ============================================================================

/** `building` is the half-made chip shown while a condition is being composed — attribute chosen, operator next. */
export const BuildingAttributeOnly: StoryFn = () => (
  <FilterInputChip building attribute='IP Address' />
);

/** One step on, waiting for a value. */
export const BuildingWithOperator: StoryFn = () => (
  <FilterInputChip building attribute='IP Address' operator='is' />
);

/** All three segments filled, at the point where the chip commits and stops building. */
export const BuildingComplete: StoryFn = () => (
  <FilterInputChip building attribute='IP Address' operator='is' value='192.168.1.1' />
);

// ============================================================================
// All States Showcase
// ============================================================================

/** Every chip state in one frame — the quickest way to check a visual change has not shifted one of them. */
export const AllStatesShowcase: StoryFn = () => (
  <MockFilterInputProvider>
    <div className='flex flex-col gap-4'>
      {/* Chip variants */}
      <div>
        <p className='sb-annotation mb-2'>default</p>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputChip attribute='Attribute' operator='operator' value='Value' />
          <FilterInputChip attribute='Attribute' operator='operator' value='Value' error />
          <FilterInputChip
            attribute='Attribute'
            operator='operator'
            value='Value'
            onRemove={() => undefined}
          />
          <FilterInputChip
            attribute='Attribute'
            operator='operator'
            value='Value'
            error
            onRemove={() => undefined}
          />
        </div>
      </div>

      {/* Disabled chip variants */}
      <div>
        <p className='sb-annotation mb-2'>disabled</p>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputChip attribute='IP Address' operator='is' value='34.74.73.20' disabled />
          <FilterInputChip
            attribute='Host'
            operator='is'
            value='api.example.com'
            disabled
            onRemove={() => undefined}
          />
        </div>
      </div>

      {/* Building chip variants */}
      <div>
        <p className='sb-annotation mb-2'>building</p>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputChip building attribute='IP Address' />
          <FilterInputChip building attribute='IP Address' operator='is' />
          <FilterInputChip building attribute='IP Address' operator='is' value='192.168.1.1' />
        </div>
      </div>

      {/* Connector variants */}
      <div>
        <p className='sb-annotation mb-2'>connectors</p>
        <div className='flex items-center gap-2 flex-wrap'>
          <FilterInputConnectorChip variant='and' chipId='c-1' onChange={() => undefined} />
          <FilterInputConnectorChip variant='or' chipId='c-2' onChange={() => undefined} />
        </div>
      </div>
    </div>
  </MockFilterInputProvider>
);

/** A paired chip carries two triplets separated by a semicolon, for a field whose value means nothing without its key. */
export const Paired: StoryFn<typeof meta> = () => (
  <FilterInputChip
    attribute='Context Param'
    operator='is'
    value='xxx'
    pair={{ attribute: 'Value', operator: 'is', value: 'yyy' }}
    onRemove={() => undefined}
  />
);

/** The error lands on the half that is wrong — here the required second value — rather than reddening the whole chip. */
export const PairedWithError: StoryFn<typeof meta> = () => (
  <FilterInputChip
    attribute='Context Param'
    operator='is'
    value='xxx'
    pair={{ attribute: 'Value', operator: 'is', value: 'yyy', error: 'value' }}
    onRemove={() => undefined}
  />
);

/** The same cap, 380px across two triplets. The base value is held to 90px so it cannot hide its partner, but every other segment keeps its full width, so the second value is the one that gives way. */
export const PairedWithLongText: StoryFn<typeof meta> = () => (
  <FilterInputChip
    attribute='Context Param With A Long Name'
    operator='is'
    value='a-very-long-first-value-that-truncates'
    pair={{ attribute: 'Value', operator: 'is', value: 'a-very-long-second-value-that-truncates' }}
    onRemove={() => undefined}
  />
);
