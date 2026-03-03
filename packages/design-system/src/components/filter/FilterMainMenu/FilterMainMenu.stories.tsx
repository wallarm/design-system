import type { Meta, StoryObj } from '@storybook/react';
import type { FieldMetadata } from '../types';
import { FilterMainMenu } from './FilterMainMenu';

const meta = {
  title: 'Components/Filter/FilterMainMenu',
  component: FilterMainMenu,
  parameters: {
    layout: 'centered',
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
} satisfies Meta<typeof FilterMainMenu>;

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

/**
 * Default FilterMainMenu with field list
 */
export const Default: Story = {
  args: {
    fields: sampleFields,
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
};

/**
 * FilterMainMenu with fewer fields
 */
export const FewFields: Story = {
  args: {
    fields: sampleFields.slice(0, 5),
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
};

/**
 * Closed FilterMainMenu (should not render)
 */
export const Closed: Story = {
  args: {
    fields: sampleFields,
    open: false,
    onSelect: () => {
      // Field selection handler
    },
  },
};

/**
 * Interactive example with state management
 */
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
          <FilterMainMenu
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

/**
 * Example demonstrating search functionality
 * Try typing "status", "HTTP", or "CWE" in the search field
 */
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

/**
 * FilterMainMenu with recent fields section
 * Shows up to 3 recently used fields at the top
 */
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

/**
 * FilterMainMenu with suggestions section
 * Shows commonly used fields
 */
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

/**
 * FilterMainMenu with both recent and suggestions
 * Shows the full menu with all sections
 */
export const WithRecentAndSuggestions: Story = {
  args: {
    fields: sampleFields,
    recentFields: [
      {
        name: 'http_status_code',
        label: 'HTTP status code',
        type: 'integer',
        description: 'HTTP response status code',
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
