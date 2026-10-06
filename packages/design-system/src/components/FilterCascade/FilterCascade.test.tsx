import { useState } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FilterCascade, type FilterCascadeProps } from './FilterCascade';
import { FilterCascadeClear } from './FilterCascadeClear';
import { FilterCascadeContent } from './FilterCascadeContent';
import { useFilterCascade } from './FilterCascadeContext';
import { FilterCascadeItem } from './FilterCascadeItem';
import {
  FilterCascadeEmpty,
  FilterCascadeGroupLabel,
  FilterCascadeLevel,
} from './FilterCascadeLevel';
import { FilterCascadeSearch } from './FilterCascadeSearch';
import { FilterCascadeCheckboxItem, FilterCascadeSection } from './FilterCascadeSection';
import { FilterCascadeTrigger } from './FilterCascadeTrigger';
import { createFilterCascadeCollection } from './lib';

// Analytics seams: every click target is an exported part whose props land on the real node —
// `FilterCascadeTrigger` and `FilterCascadeClear` (<button>), `FilterCascadeItem` (the option),
// `FilterCascadeSearch` (<input>) and `FilterCascadeCheckboxItem` (<button>).

const collection = createFilterCascadeCollection([
  { value: 'org', label: 'Organization only' },
  {
    value: 'prod',
    label: 'Production US',
    description: '4 policies',
    children: [
      { value: 'api', label: 'api' },
      { value: 'checkout', label: 'checkout' },
    ],
  },
]);

const Harness = (props: Partial<FilterCascadeProps>) => (
  <FilterCascade label='Scope' collection={collection} data-testid='scope' {...props}>
    <FilterCascadeTrigger data-analytics-id='SCOPE' />
    <FilterCascadeContent />
  </FilterCascade>
);

describe('FilterCascade', () => {
  it('reads the label while unset and puts consumer props on the trigger button', () => {
    render(<Harness />);
    const trigger = screen.getByTestId('scope--trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'SCOPE');
    expect(trigger).toHaveAccessibleName('Scope');
    expect(screen.queryByRole('button', { name: 'Clear Scope' })).not.toBeInTheDocument();
  });

  it('opens the next level on hover and picks a leaf as a path', async () => {
    const onValueChange = rs.fn();
    render(<Harness onValueChange={onValueChange} />);
    await userEvent.click(screen.getByTestId('scope--trigger'));

    expect(await screen.findByText('Production US')).toBeInTheDocument();
    expect(screen.getByText('4 policies')).toBeInTheDocument();
    await userEvent.hover(screen.getByText('Production US'));
    await userEvent.click(await screen.findByText('checkout'));

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: ['prod', 'checkout'] }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName(
        'Scope, Production US › checkout',
      ),
    );
  });

  it('lets a node that opens a level be picked itself', async () => {
    const onValueChange = rs.fn();
    render(<Harness onValueChange={onValueChange} />);
    await userEvent.click(screen.getByTestId('scope--trigger'));
    await userEvent.click(await screen.findByText('Production US'));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: ['prod'] }));
  });

  it('clears the path with the ✕', async () => {
    const onValueChange = rs.fn();
    render(<Harness defaultValue={['prod', 'api']} onValueChange={onValueChange} />);
    expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName('Scope, Production US › api');
    await userEvent.click(screen.getByRole('button', { name: 'Clear Scope' }));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: [] }));
    expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName('Scope');
  });
});

const many = createFilterCascadeCollection(
  ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'].map(name => ({
    value: name.toLowerCase(),
    label: name,
    children: [{ value: `${name.toLowerCase()}-api`, label: `${name} api` }],
  })),
);

const Levels = () => {
  const { levels } = useFilterCascade();
  return levels.map(level => (
    <FilterCascadeLevel key={level.depth} level={level}>
      <FilterCascadeGroupLabel>
        {level.depth === 0 ? 'Deployments' : 'Applications'}
      </FilterCascadeGroupLabel>
      {level.items.map(item => (
        <FilterCascadeItem
          key={item.node.value}
          item={item}
          data-analytics-id={`ITEM_${item.node.value}`}
        />
      ))}
    </FilterCascadeLevel>
  ));
};

const Composed = ({ onToggle }: { onToggle?: (on: boolean) => void }) => {
  const [on, setOn] = useState(false);
  return (
    <FilterCascade label='Scope' collection={many} defaultValue={['alpha']} data-testid='scope'>
      <FilterCascadeTrigger>
        <FilterCascadeClear data-analytics-id='SCOPE_CLEAR' />
      </FilterCascadeTrigger>
      <FilterCascadeContent>
        <FilterCascadeSearch data-analytics-id='SCOPE_SEARCH' />
        <Levels />
        <FilterCascadeEmpty />
        <FilterCascadeSection>
          <FilterCascadeCheckboxItem
            checked={on}
            onCheckedChange={next => {
              setOn(next);
              onToggle?.(next);
            }}
          >
            Show organization policies
          </FilterCascadeCheckboxItem>
        </FilterCascadeSection>
      </FilterCascadeContent>
    </FilterCascade>
  );
};

describe('FilterCascade composed', () => {
  it('renders the parts in place, with consumer props on their nodes', async () => {
    render(<Composed />);
    expect(screen.getByTestId('scope--clear')).toHaveAttribute('data-analytics-id', 'SCOPE_CLEAR');
    await userEvent.click(screen.getByTestId('scope--trigger'));

    expect(await screen.findByText('Deployments')).toBeInTheDocument();
    expect(screen.getByText('Bravo').closest('[data-slot=filter-cascade-item]')).toHaveAttribute(
      'data-analytics-id',
      'ITEM_bravo',
    );
    expect(screen.getByRole('textbox', { name: 'Search Scope' })).toHaveAttribute(
      'data-analytics-id',
      'SCOPE_SEARCH',
    );
  });

  it('narrows the top level by search and says when nothing matches', async () => {
    render(<Composed />);
    await userEvent.click(screen.getByTestId('scope--trigger'));
    const search = await screen.findByRole('textbox', { name: 'Search Scope' });

    await userEvent.type(search, 'cha');
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('hands the keyboard from the search to the list', async () => {
    render(<Composed />);
    await userEvent.click(screen.getByTestId('scope--trigger'));
    const search = await screen.findByRole('textbox', { name: 'Search Scope' });
    await userEvent.type(search, 'cha');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByText('Charlie').closest('[data-slot=filter-cascade-item]')).toHaveAttribute(
      'data-highlighted',
    );
  });

  it('toggles a section row without picking or closing', async () => {
    const onToggle = rs.fn();
    render(<Composed onToggle={onToggle} />);
    await userEvent.click(screen.getByTestId('scope--trigger'));
    const row = await screen.findByRole('menuitemcheckbox', { name: 'Show organization policies' });

    await userEvent.click(row);
    expect(onToggle).toHaveBeenLastCalledWith(true);
    expect(row).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('scope--trigger')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName('Scope, Alpha');
  });
});
