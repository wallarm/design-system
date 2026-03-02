import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { ExprNode, FieldMetadata, FilterChipData } from '../types';
import { FilterComponent } from './FilterComponent';

const meta = {
  title: 'Components/Filter/FilterComponent',
  component: FilterComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockFields: FieldMetadata[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    operators: ['=', '!=', 'in', 'not_in'],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'integer',
    operators: ['=', '!=', '>', '<', '>=', '<='],
  },
  {
    name: 'title',
    label: 'Title',
    type: 'string',
    operators: ['=', '!=', 'like', 'not_like'],
  },
  {
    name: 'created_at',
    label: 'Created At',
    type: 'date',
    operators: ['>', '>=', '<', '<=', '=', '!='],
  },
  {
    name: 'active',
    label: 'Active',
    type: 'boolean',
    operators: ['=', '!='],
  },
];

export const Default: Story = {
  args: {
    fields: mockFields,
    placeholder: 'Type to filter...',
    showKeyboardHint: true,
  },
};

export const WithInitialValue: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>(null);
    const [chips, setChips] = useState<FilterChipData[]>([]);

    const handleChange = (expr: ExprNode | null, newChips: FilterChipData[]) => {
      setExpression(expr);
      setChips(newChips);
    };

    return (
      <div className='w-[600px] space-y-4'>
        <FilterComponent
          fields={mockFields}
          value={expression}
          onChange={handleChange}
          placeholder='Type to filter... (try: status = active)'
        />
        <div className='text-xs space-y-2'>
          <div>
            <strong>Expression:</strong>
            <pre className='mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto'>
              {expression ? JSON.stringify(expression, null, 2) : 'null'}
            </pre>
          </div>
          <div>
            <strong>Chips ({chips.length}):</strong>
            <pre className='mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto'>
              {chips.length > 0 ? JSON.stringify(chips, null, 2) : '[]'}
            </pre>
          </div>
        </div>
      </div>
    );
  },
};

export const DemoConditions: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>(null);

    return (
      <div className='w-[600px] space-y-4'>
        <FilterComponent
          fields={mockFields}
          value={expression}
          onChange={expr => setExpression(expr)}
          placeholder='Try typing conditions...'
        />
        <div className='text-xs space-y-2'>
          <p className='font-semibold'>Example conditions to try:</p>
          <ul className='list-disc list-inside space-y-1 text-gray-600'>
            <li>
              <code>status = active</code>
            </li>
            <li>
              <code>priority &gt; 5</code>
            </li>
            <li>
              <code>title like "test"</code>
            </li>
            <li>
              <code>active = true</code>
            </li>
            <li>
              <code>priority &lt;= 10</code>
            </li>
          </ul>
        </div>
      </div>
    );
  },
};
