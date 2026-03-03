import { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Search } from '../../icons/Search';
import { FilterComponent } from './FilterComponent';
import type { ExprNode, FieldMetadata, FilterChipData } from './types';

const meta = {
  title: 'Components/Filter/Composition',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Complete filter component that accepts config and works out of the box. Type expressions, use autocomplete, combine with AND/OR, click to edit chips - everything just works!',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

/**
 * Complete working filter component - just pass config!
 *
 * This demonstrates a realistic use case with attack filtering:
 * - Config-driven field definitions with values
 * - Autocomplete for fields, operators, and values
 * - AND/OR logic support
 * - Click chips to edit
 * - Keyboard navigation
 * - All functionality working together
 */
export const AttackFilterWorkflow: StoryFn = () => {
  const [expression, setExpression] = useState<ExprNode | null>(null);
  const [chips, setChips] = useState<FilterChipData[]>([]);

  // Real-world configuration for attack filtering
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
    {
      name: 'response_time',
      label: 'Response Time',
      type: 'float',
      description: 'Request response time in milliseconds',
      values: [
        { value: 100, label: '< 100ms' },
        { value: 500, label: '< 500ms' },
        { value: 1000, label: '< 1s' },
      ],
    },
    {
      name: 'timestamp',
      label: 'Timestamp',
      type: 'date',
      description: 'When the attack occurred',
      values: [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
      ],
    },
  ];

  const handleChange = (expr: ExprNode | null, newChips: FilterChipData[]) => {
    setExpression(expr);
    setChips(newChips);
    console.log('Filter changed:', { expression: expr, chips: newChips });
  };

  return (
    <div className='w-[900px] space-y-6'>
      {/* Main Filter Component - Everything in one! */}
      <div className='space-y-2'>
        <h2 className='text-lg font-semibold text-text-primary'>Attack Filter</h2>
        <FilterComponent
          fields={attackFields}
          value={expression}
          onChange={handleChange}
          placeholder='Type to filter attacks... (try: attack_type = sqli AND severity = critical)'
          showKeyboardHint
        />
      </div>

      {/* Quick Examples */}
      <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
        <h3 className='text-sm font-semibold mb-2 text-blue-900'>Try these examples:</h3>
        <ul className='list-disc list-inside text-sm text-blue-800 space-y-1'>
          <li>
            <code className='bg-white px-1 py-0.5 rounded'>attack_type = sqli</code> - Single condition
          </li>
          <li>
            <code className='bg-white px-1 py-0.5 rounded'>severity = critical AND blocked = true</code> - AND logic
          </li>
          <li>
            <code className='bg-white px-1 py-0.5 rounded'>country = US OR country = CN</code> - OR logic
          </li>
          <li>
            <code className='bg-white px-1 py-0.5 rounded'>http_status &gt; 400 AND response_time &gt; 500</code> - Comparison operators
          </li>
          <li>
            Click any chip to edit it!
          </li>
        </ul>
      </div>

      {/* How it works */}
      <div className='p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
        <h3 className='text-sm font-semibold mb-2 text-text-primary'>How to use:</h3>
        <ol className='list-decimal list-inside text-sm text-text-secondary space-y-1'>
          <li>Start typing or click empty input → see field suggestions</li>
          <li>Select a field → operator menu appears automatically</li>
          <li>Select operator → value menu appears with configured values</li>
          <li>Select value → chip created, ready for next condition</li>
          <li>Type AND or OR to combine multiple conditions</li>
          <li>Click any chip to edit it</li>
          <li>Use keyboard: ↑↓ to navigate, Enter to select, Esc to close</li>
        </ol>
      </div>

      {/* Debug Output */}
      <div className='p-4 bg-bg-neutral-subtle rounded-lg border border-border-primary'>
        <h3 className='text-sm font-semibold mb-3 text-text-primary'>Current State:</h3>
        <div className='space-y-3'>
          <div>
            <p className='text-xs font-medium text-text-secondary mb-1'>Chips ({chips.length}):</p>
            <pre className='text-xs bg-white p-2 rounded border border-border-primary overflow-auto max-h-[150px]'>
              {chips.length > 0 ? JSON.stringify(chips, null, 2) : 'No chips yet'}
            </pre>
          </div>
          <div>
            <p className='text-xs font-medium text-text-secondary mb-1'>Expression Tree:</p>
            <pre className='text-xs bg-white p-2 rounded border border-border-primary overflow-auto max-h-[150px]'>
              {expression ? JSON.stringify(expression, null, 2) : 'No expression yet'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Simple API filtering example - minimal config, just works
 */
export const ApiFilterSimple: StoryFn = () => {
  const [expression, setExpression] = useState<ExprNode | null>(null);

  const apiFields: FieldMetadata[] = [
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
    {
      name: 'assignee',
      label: 'Assignee',
      type: 'string',
      values: [
        { value: 'john', label: 'John Doe' },
        { value: 'jane', label: 'Jane Smith' },
        { value: 'bob', label: 'Bob Johnson' },
      ],
    },
  ];

  return (
    <div className='w-[700px] space-y-4'>
      <FilterComponent
        fields={apiFields}
        value={expression}
        onChange={(expr) => setExpression(expr)}
        placeholder='Filter items...'
      />

      <div className='text-xs text-text-secondary'>
        <p>Simple example with just 3 fields. Try:</p>
        <code className='block mt-1 bg-bg-neutral-subtle p-2 rounded'>
          status = active AND priority &gt; 5
        </code>
      </div>
    </div>
  );
};

/**
 * With custom icon and styling
 */
export const WithCustomIcon: StoryFn = () => {
  const fields: FieldMetadata[] = [
    {
      name: 'search',
      label: 'Search Query',
      type: 'string',
      values: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'angular', label: 'Angular' },
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'enum',
      values: [
        { value: 'frontend', label: 'Frontend' },
        { value: 'backend', label: 'Backend' },
        { value: 'devops', label: 'DevOps' },
      ],
    },
  ];

  return (
    <div className='w-[700px]'>
      <div className='space-y-2'>
        <label className='text-sm font-medium text-text-primary'>Search Projects</label>
        <div className='relative'>
          <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10'>
            <Search className='size-5 text-text-secondary' />
          </div>
          <div className='pl-10'>
            <FilterComponent
              fields={fields}
              placeholder='Search projects...'
              showKeyboardHint={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
