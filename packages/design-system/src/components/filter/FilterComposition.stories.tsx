import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterField } from './FilterField';
import type { ExprNode, FieldMetadata } from './types';

const meta = {
  title: 'Components/Filter/Composition',
  component: FilterField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Realistic attack filtering configuration
const attackFields: FieldMetadata[] = [
  {
    name: 'attack_type',
    label: 'Attack Type',
    type: 'enum',
    description: 'Type of attack detected',
    values: [
      { value: 'sqli', label: 'SQL Injection', badge: { color: 'red', text: 'Critical' } },
      { value: 'xss', label: 'Cross-Site Scripting', badge: { color: 'orange', text: 'High' } },
      { value: 'rce', label: 'Remote Code Execution', badge: { color: 'red', text: 'Critical' } },
      { value: 'lfi', label: 'Local File Inclusion', badge: { color: 'orange', text: 'High' } },
      { value: 'xxe', label: 'XML External Entity', badge: { color: 'yellow', text: 'Medium' } },
    ],
  },
  {
    name: 'severity',
    label: 'Severity',
    type: 'enum',
    description: 'Attack severity level',
    values: [
      { value: 'critical', label: 'Critical', badge: { color: 'red', text: 'Critical' } },
      { value: 'high', label: 'High', badge: { color: 'orange', text: 'High' } },
      { value: 'medium', label: 'Medium', badge: { color: 'yellow', text: 'Medium' } },
      { value: 'low', label: 'Low', badge: { color: 'blue', text: 'Low' } },
    ],
  },
  {
    name: 'ip_address',
    label: 'IP Address',
    type: 'string',
    description: 'Source IP address',
    values: [
      { value: '192.168.1.1', label: '192.168.1.1' },
      { value: '10.0.0.1', label: '10.0.0.1' },
      { value: '172.16.0.1', label: '172.16.0.1' },
    ],
  },
  {
    name: 'country',
    label: 'Country',
    type: 'enum',
    description: 'Geographic country code',
    values: [
      { value: 'US', label: 'United States' },
      { value: 'RU', label: 'Russia' },
      { value: 'CN', label: 'China' },
      { value: 'BR', label: 'Brazil' },
      { value: 'IN', label: 'India' },
    ],
  },
  {
    name: 'http_status',
    label: 'HTTP Status',
    type: 'integer',
    description: 'HTTP response status code',
    values: [
      { value: 200, label: '200 OK' },
      { value: 403, label: '403 Forbidden' },
      { value: 404, label: '404 Not Found' },
      { value: 500, label: '500 Internal Server Error' },
    ],
  },
  {
    name: 'blocked',
    label: 'Blocked',
    type: 'boolean',
    description: 'Whether request was blocked',
    values: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
];

/**
 * Complete working filter component with autocomplete, parsing, and chip creation.
 * Just pass fields config and it works automatically!
 * Click to see field menu, select field → operator → value to create chips.
 */
export const Default: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>(null);

    return (
      <div className='w-[800px] space-y-4'>
        <FilterField
          fields={attackFields}
          value={expression}
          onChange={(expr) => {
            console.log('Expression changed:', expr);
            setExpression(expr);
          }}
          placeholder='Type to filter attacks...'
          showKeyboardHint
        />

        {/* Debug output */}
        {expression && (
          <div className='p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Minimal example with fewer fields
 * Shows simple config-driven usage
 */
export const Simple: Story = {
  render: () => {
    const simpleFields: FieldMetadata[] = [
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        values: [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
          { value: 'archived', label: 'Archived' },
        ],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'integer',
        values: [
          { value: 1, label: 'Low' },
          { value: 5, label: 'Medium' },
          { value: 10, label: 'High' },
        ],
      },
    ];

    return (
      <div className='w-[600px]'>
        <FilterField
          fields={simpleFields}
          placeholder='Filter items...'
          onChange={(expr) => console.log('Filter:', expr)}
        />
      </div>
    );
  },
};

/**
 * Backend integration example
 * Shows how to use with API config (like from sessions-api metadata.go)
 */
export const BackendIntegration: Story = {
  render: () => {
    const [metadata, setMetadata] = useState<FieldMetadata[] | null>(null);
    const [expression, setExpression] = useState<ExprNode | null>(null);

    // Simulate fetching metadata from backend
    useState(() => {
      // In real app: fetch('/api/security/query-metadata')
      setTimeout(() => {
        setMetadata(attackFields);
      }, 100);
    });

    if (!metadata) {
      return <div className='w-[800px] h-10 bg-gray-100 rounded-lg animate-pulse' />;
    }

    return (
      <div className='w-[800px]'>
        <FilterField
          fields={metadata}
          value={expression}
          onChange={setExpression}
          placeholder='Loading metadata from backend...'
        />
      </div>
    );
  },
};
