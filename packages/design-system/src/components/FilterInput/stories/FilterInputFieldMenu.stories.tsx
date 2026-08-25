import { type FC, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown } from '../../../icons';
import { Button } from '../../Button';
import { FilterInputFieldMenu, type FilterInputFieldMenuProps } from '../FilterInputMenu';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from '../lib/statusCode';
import type { Condition, FieldMetadata } from '../types';

const DESCRIPTION = [
  'The field-picking menu `FilterInput` opens on focus, shown here on its own.',
  'It is internal — the pattern owns its open state and anchors it to the input or the chip being edited — so these stories stand it up behind a `Button` to give it something to hang off. Reach for `FilterInput`, not this.',
  'Click the trigger to open, click it again or press Escape to close.',
].join(' ');

const meta = {
  title: 'Patterns/FilterInput/FilterInputFieldMenu',
  component: FilterInputFieldMenu,
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
    fields: {
      description: 'Array of available fields to display',
    },
    onSelect: {
      description: 'Callback when a field is selected',
    },
    open: {
      control: 'boolean',
      description: 'Whether the menu is open',
    },
  },
} satisfies Meta<typeof FilterInputFieldMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The menu takes no trigger of its own: `FilterInput` owns `open` and hands it a
 * `positioning` object that anchors it to whatever is being edited. Without one
 * the Ark portal has nothing to measure against and lands in the page corner, so
 * every story below anchors it to a `Button` and drives `open` from local state.
 */
const FieldMenuHarness: FC<
  Omit<FilterInputFieldMenuProps, 'open' | 'onOpenChange' | 'positioning'> & {
    showSelection?: boolean;
  }
> = ({ showSelection = false, onSelect, ...menuProps }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FieldMetadata | null>(null);
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
        data-testid='field-menu-trigger'
        onClick={() => setOpen(isOpen => !isOpen)}
      >
        Add filter
        <ChevronDown />
      </Button>

      {showSelection && selected && (
        <span className='sb-annotation'>selected: {selected.label}</span>
      )}

      <FilterInputFieldMenu
        {...menuProps}
        open={open}
        onOpenChange={setOpen}
        onEscape={() => setOpen(false)}
        positioning={positioning}
        onSelect={field => {
          setSelected(field);
          setOpen(false);
          onSelect(field);
        }}
      />
    </div>
  );
};

const noop = () => {
  // Stories only need the menu to close; FilterInput does the real work.
};

// Sample field metadata for stories
const sampleFields: FieldMetadata[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    description: 'Request status',
  },
  {
    name: 'severity',
    label: 'Severity',
    type: 'enum',
    description: 'Attack severity level',
  },
  {
    name: 'location',
    label: 'Location',
    type: 'string',
    description: 'Geographic location',
  },
  {
    name: 'http_status_code',
    label: 'HTTP status code',
    type: 'integer',
    description: 'HTTP response status code',
    getSuggestions: createStatusCodeSuggestions(),
    validate: createStatusCodeValidator(),
    acceptChar: createStatusCodeInputFilter(),
    normalize: createStatusCodeNormalizer(),
  },
  {
    name: 'impact',
    label: 'Impact',
    type: 'string',
    description: 'Impact level',
  },
  {
    name: 'network',
    label: 'Network',
    type: 'string',
    description: 'Network identifier',
  },
  {
    name: 'endpoint',
    label: 'Endpoint',
    type: 'string',
    description: 'API endpoint path',
  },
  {
    name: 'hostname',
    label: 'Hostname',
    type: 'string',
    description: 'Server hostname',
  },
  {
    name: 'parameter',
    label: 'Parameter',
    type: 'string',
    description: 'Request parameter name',
  },
  {
    name: 'blocking_status',
    label: 'Blocking status',
    type: 'enum',
    description: 'Blocking/monitoring status',
  },
  {
    name: 'cwe',
    label: 'CWE',
    type: 'string',
    description: 'Common Weakness Enumeration ID',
  },
];

/** The plain list — every field in the config, label first, whatever its type. */
export const Default: Story = {
  render: () => <FieldMenuHarness fields={sampleFields} onSelect={noop} />,
};

/** A short config, to check the menu does not pad itself out. */
export const FewFields: Story = {
  render: () => <FieldMenuHarness fields={sampleFields.slice(0, 5)} onSelect={noop} />,
};

/**
 * `open={false}` renders nothing at all — no collapsed shell, no placeholder — so
 * this frame is deliberately empty. It is the one story with no trigger.
 */
export const Closed: Story = {
  args: {
    fields: sampleFields,
    open: false,
    onSelect: noop,
  },
};

/** Selection wired up, so you can watch which field the menu hands back. */
export const Interactive: Story = {
  render: () => <FieldMenuHarness fields={sampleFields} onSelect={noop} showSelection />,
};

/** Typing filters the list by label and name, case-insensitively — try “status” or “CWE”. */
export const WithSearch: Story = {
  render: () => <FieldMenuHarness fields={sampleFields} onSelect={noop} />,
};

const recentConditions: Condition[] = [
  { type: 'condition', field: 'status', operator: '=', value: 'Blocked' },
  { type: 'condition', field: 'http_status_code', operator: '>', value: 400 },
  { type: 'condition', field: 'location', operator: '=', value: 'US' },
];

/**
 * `recentConditions` puts the last few filters back at the top, capped at three —
 * what keeps a fifty-field menu usable day to day. Each row replays the whole
 * condition, not just the field.
 */
export const WithRecentFields: Story = {
  render: () => (
    <FieldMenuHarness fields={sampleFields} recentConditions={recentConditions} onSelect={noop} />
  ),
};

/** A curated suggestions section, for the handful of fields most people reach for first. */
export const WithSuggestions: Story = {
  render: () => (
    <FieldMenuHarness
      fields={sampleFields}
      suggestedFields={sampleFields.slice(0, 3)}
      onSelect={noop}
    />
  ),
};

/**
 * Fields under labelled group headers, in array order, with anything left out of
 * every group falling into a trailing headerless section — here, `CWE`.
 */
export const WithGroups: Story = {
  render: () => (
    <FieldMenuHarness
      fields={sampleFields}
      fieldGroups={[
        { label: 'Threat classification', fields: ['status', 'severity', 'blocking_status'] },
        {
          label: 'Request features',
          fields: ['http_status_code', 'endpoint', 'hostname', 'parameter'],
        },
        { label: 'Source and identity', fields: ['location', 'network', 'impact'] },
      ]}
      onSelect={noop}
    />
  ),
};

const describedFields: FieldMetadata[] = [
  {
    name: 'attack_type',
    label: 'Attack type',
    type: 'enum',
    description: 'Filter by the high-level category of the detected attack (e.g. SQLi, XSS, BOLA).',
  },
  {
    name: 'parameter',
    label: 'Parameter',
    type: 'string',
    description: 'Filter by the request parameter where the malicious payload was detected.',
    example: 'header.user-agent\npost.user[*].name',
  },
  {
    name: 'status_code',
    label: 'Status code',
    type: 'string',
    description: 'Filter by the HTTP response status code returned to the attacker.',
    example: '200, 4XX, 5XX',
  },
  {
    name: 'no_desc',
    label: 'No description field',
    type: 'string',
  },
];

/** Hovering or keyboard-focusing a row opens a popover beside the menu with the description and, where the value format is not obvious, an example. A row with no description opens nothing, and group headers are inert. */
export const WithDescriptions: Story = {
  render: () => (
    <FieldMenuHarness
      fields={describedFields}
      fieldGroups={[
        {
          label: 'Threat classification',
          fields: ['attack_type', 'parameter', 'status_code', 'no_desc'],
        },
      ]}
      onSelect={noop}
    />
  ),
};

const manyDescribedFields: FieldMetadata[] = Array.from({ length: 20 }, (_, i) => ({
  name: `field_${i}`,
  label: `Field ${i}`,
  type: 'string',
  description: `Filter by field ${i}.`,
}));

/** A described list long enough to scroll, for checking the popover keeps up with the cursor and the keyboard. */
export const WithScrollableDescriptions: Story = {
  render: () => <FieldMenuHarness fields={manyDescribedFields} onSelect={noop} />,
};

/**
 * Both props set, and only Recent renders — the two shortcut sections are
 * mutually exclusive, so suggestions are the fallback for someone with no
 * history rather than a second row of shortcuts.
 */
export const WithRecentAndSuggestions: Story = {
  render: () => (
    <FieldMenuHarness
      fields={sampleFields}
      recentConditions={recentConditions.slice(0, 2)}
      suggestedFields={sampleFields.slice(0, 2)}
      onSelect={noop}
    />
  ),
};
