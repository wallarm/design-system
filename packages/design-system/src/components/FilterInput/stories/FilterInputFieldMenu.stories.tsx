import type { Meta, StoryObj } from '@storybook/react';
import { FilterInputFieldMenu } from '../FilterInputMenu';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from '../lib/statusCode';
import type { FieldMetadata } from '../types';

const DESCRIPTION = [
  'The field-picking menu `FilterInput` opens on focus, shown here on its own.',
  'It is internal — the pattern opens, filters and closes it for you — so these stories are for checking the menu’s sections, search and popovers, not for composing it yourself.',
].join(' ');

const meta = {
  title: 'Patterns/FilterInput/FilterInputFieldMenu',
  component: FilterInputFieldMenu,
  parameters: {
    layout: 'centered',
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
  args: {
    fields: sampleFields,
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
};

/** A short config, to check the menu does not pad itself out. */
export const FewFields: Story = {
  args: {
    fields: sampleFields.slice(0, 5),
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
};

/** `open={false}` renders nothing: the menu has no closed appearance of its own. */
export const Closed: Story = {
  args: {
    fields: sampleFields,
    open: false,
    onSelect: () => {
      // Field selection handler
    },
  },
};

/** Selection wired up, so you can watch which field the menu hands back. */
export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    const [selectedField, setSelectedField] = React.useState<FieldMetadata | null>(null);

    return (
      <div className='flex flex-col gap-4'>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => setOpen(!open)}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            {open ? 'Close' : 'Open'} Menu
          </button>
          {selectedField && (
            <div className='px-4 py-2 bg-gray-100 rounded'>
              Selected: {selectedField.label} ({selectedField.type})
            </div>
          )}
        </div>
        {/* Absolute positioned wrapper prevents layout shift */}
        <div className='relative'>
          <FilterInputFieldMenu
            fields={sampleFields}
            open={open}
            onOpenChange={setOpen}
            onSelect={field => {
              setSelectedField(field);
              setOpen(false);
            }}
          />
        </div>
      </div>
    );
  },
};

/** Typing filters the list by label — try “status” or “CWE”. */
export const WithSearch: Story = {
  args: {
    fields: sampleFields,
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'The search input filters fields by label and name (case-insensitive). Try searching for "status" to see fields with "status" in their name or label.',
      },
    },
  },
};

/** Up to three recently used fields sit at the top, which is what keeps a fifty-field menu usable day to day. */
export const WithRecentFields: Story = {
  args: {
    fields: sampleFields,
    recentFields: [
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        description: 'Request status',
      },
      {
        name: 'http_status_code',
        label: 'HTTP status code',
        type: 'integer',
        description: 'HTTP response status code',
        getSuggestions: createStatusCodeSuggestions(),
        validate: createStatusCodeValidator(),
      },
      {
        name: 'location',
        label: 'Location',
        type: 'string',
        description: 'Geographic location',
      },
    ],
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Recent fields are displayed at the top of the menu (max 3) with a "Recent" section header.',
      },
    },
  },
};

/** A curated suggestions section, for the handful of fields most people reach for first. */
export const WithSuggestions: Story = {
  args: {
    fields: sampleFields,
    suggestedFields: [
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
    ],
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Suggested fields are displayed with a "Suggestions" section header.',
      },
    },
  },
};

/** Fields under labelled group headers, with anything left out of every group falling into a trailing headerless section. */
export const WithGroups: Story = {
  args: {
    fields: sampleFields,
    fieldGroups: [
      { label: 'Threat classification', fields: ['status', 'severity', 'blocking_status'] },
      {
        label: 'Request features',
        fields: ['http_status_code', 'endpoint', 'hostname', 'parameter'],
      },
      { label: 'Source and identity', fields: ['location', 'network', 'impact'] },
    ],
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Fields grouped under section headers. Groups render in array order; the ungrouped "CWE" field appears in a trailing headerless section.',
      },
    },
  },
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
  args: {
    fields: describedFields,
    fieldGroups: [
      {
        label: 'Threat classification',
        fields: ['attack_type', 'parameter', 'status_code', 'no_desc'],
      },
    ],
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hover or keyboard-focus a field to see its description popover; "Parameter" and "Status code" also show an example block.',
      },
    },
  },
};

const manyDescribedFields: FieldMetadata[] = Array.from({ length: 20 }, (_, i) => ({
  name: `field_${i}`,
  label: `Field ${i}`,
  type: 'string',
  description: `Filter by field ${i}.`,
}));

/** A described list long enough to scroll, for checking the popover keeps up with the cursor and the keyboard. */
export const WithScrollableDescriptions: Story = {
  args: {
    fields: manyDescribedFields,
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
};

/** Both sections at once — the full menu, and the order it puts them in. */
export const WithRecentAndSuggestions: Story = {
  args: {
    fields: sampleFields,
    recentFields: [
      {
        name: 'http_status_code',
        label: 'HTTP status code',
        type: 'integer',
        description: 'HTTP response status code',
        getSuggestions: createStatusCodeSuggestions(),
        validate: createStatusCodeValidator(),
      },
      {
        name: 'endpoint',
        label: 'Endpoint',
        type: 'string',
        description: 'API endpoint path',
      },
    ],
    suggestedFields: [
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
    ],
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Full menu with Recent section at top, Suggestions section in the middle, and all fields below. Each section is visually separated. Keyboard hints are shown at the bottom.',
      },
    },
  },
};

// Import React for the Interactive story
import React from 'react';
