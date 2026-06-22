import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  BulkBarSummary,
  BulkBarSummaryClear,
  BulkBarSummaryCount,
  BulkBarSummarySelectAll,
  BulkBarSummarySeparator,
} from '../../BulkBar';
import { Button } from '../../Button';
import { HStack } from '../../Stack';
import { Selection } from '../Selection';
import { SelectionItem } from '../SelectionItem';
import { useSelectionContext } from '../useSelectionContext';
import { SelectionBulkBar } from './SelectionBulkBar';

const items = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
];

const Harness = ({
  children,
  initial = ['a'],
}: {
  children: React.ReactNode;
  initial?: string[];
}) => {
  const [value, setValue] = useState(initial);
  return (
    <Selection items={items} getItemId={i => i.id} value={value} onChange={setValue}>
      {items.map(item => (
        <SelectionItem key={item.id} itemId={item.id}>
          {item.label}
        </SelectionItem>
      ))}
      {children}
    </Selection>
  );
};

/** Connects BulkBar primitives to Selection context — typical consumer pattern. */
const AnalyticsToolbar = () => {
  const { selectedIds, isAllSelected, selectAll, clear } = useSelectionContext();

  return (
    <SelectionBulkBar placement='absolute'>
      <BulkBarSummary>
        <BulkBarSummaryCount count={selectedIds.size} />
        <HStack gap={6}>
          <BulkBarSummarySelectAll
            data-testid='bulk-select-all'
            data-analytics-id='BULK_SELECT_ALL'
            onClick={selectAll}
            disabled={isAllSelected}
          />
          <BulkBarSummarySeparator />
          <BulkBarSummaryClear
            data-testid='bulk-clear'
            data-analytics-id='BULK_CLEAR'
            onClick={clear}
          />
        </HStack>
      </BulkBarSummary>
      <Button data-testid='bulk-delete' data-analytics-id='BULK_DELETE'>
        Delete
      </Button>
    </SelectionBulkBar>
  );
};

describe('Backward compatibility', () => {
  it('renders the default Selection-wired summary when no <BulkBarSummary> is passed', () => {
    render(
      <Harness>
        <SelectionBulkBar placement='absolute'>
          <Button>Delete</Button>
        </SelectionBulkBar>
      </Harness>,
    );

    // Default summary: count + Select all + · + Clear
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByText('Select all')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('default Select all clicks select all items', async () => {
    render(
      <Harness>
        <SelectionBulkBar placement='absolute'>
          <Button>Delete</Button>
        </SelectionBulkBar>
      </Harness>,
    );

    expect(screen.getByText('1 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Select all'));
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('default Clear empties the selection', async () => {
    render(
      <Harness initial={['a', 'b']}>
        <SelectionBulkBar placement='absolute'>
          <Button>Delete</Button>
        </SelectionBulkBar>
      </Harness>,
    );

    expect(screen.getByText('2 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Clear'));
    expect(screen.getByText('0 selected')).toBeInTheDocument();
  });
});

describe('Analytics composition', () => {
  it('forwards data-analytics-id to BulkBarSummarySelectAll <button>', () => {
    render(
      <Harness>
        <AnalyticsToolbar />
      </Harness>,
    );

    const btn = screen.getByTestId('bulk-select-all');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('data-analytics-id', 'BULK_SELECT_ALL');
  });

  it('forwards data-analytics-id to BulkBarSummaryClear and consumer action button', () => {
    render(
      <Harness>
        <AnalyticsToolbar />
      </Harness>,
    );

    expect(screen.getByTestId('bulk-clear')).toHaveAttribute('data-analytics-id', 'BULK_CLEAR');
    expect(screen.getByTestId('bulk-delete')).toHaveAttribute('data-analytics-id', 'BULK_DELETE');
  });

  it('hoists the consumer <BulkBarSummary> into the summary slot, not the actions HStack', () => {
    render(
      <Harness>
        <AnalyticsToolbar />
      </Harness>,
    );

    const selectAll = screen.getByTestId('bulk-select-all');
    const action = screen.getByTestId('bulk-delete');

    const summary = selectAll.closest('[data-slot="bulk-bar-summary"]');
    expect(summary).not.toBeNull();
    expect(summary).not.toContainElement(action);
  });

  it('consumer-wired SelectAll click selects all items', async () => {
    render(
      <Harness>
        <AnalyticsToolbar />
      </Harness>,
    );

    expect(screen.getByText('1 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('bulk-select-all'));
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('consumer-wired Clear empties the selection', async () => {
    render(
      <Harness initial={['a', 'b']}>
        <AnalyticsToolbar />
      </Harness>,
    );

    expect(screen.getByText('2 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('bulk-clear'));
    expect(screen.getByText('0 selected')).toBeInTheDocument();
  });
});
