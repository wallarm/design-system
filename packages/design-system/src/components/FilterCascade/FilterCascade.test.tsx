import { useState } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FilterCascade, type FilterCascadeProps } from './FilterCascade';
import { FilterCascadeClear } from './FilterCascadeClear';
import { FilterCascadeContent } from './FilterCascadeContent';
import {
  FilterCascadeGroupLabel,
  FilterCascadeItems,
  FilterCascadeLevels,
  FilterCascadeParentItem,
} from './FilterCascadeLevel';
import { FilterCascadeSearch } from './FilterCascadeSearch';
import { FilterCascadeCheckboxItem, FilterCascadeSection } from './FilterCascadeSection';
import { FilterCascadeTrigger } from './FilterCascadeTrigger';
import { createFilterCascadeCollection } from './lib';

// Analytics seams: every click target is an exported part whose props land on the real node —
// `FilterCascadeTrigger` and `FilterCascadeClear` (<button>), `FilterCascadeItem` (the option),
// `FilterCascadeSearch` (<input>) and `FilterCascadeCheckboxItem` (<button>).

const regions = createFilterCascadeCollection([
  { value: 'sg', label: 'Singapore' },
  {
    value: 'eu',
    label: 'Europe',
    children: [
      { value: 'fra', label: 'Frankfurt' },
      { value: 'ams', label: 'Amsterdam' },
    ],
  },
]);

interface Scope {
  kind: 'deployment' | 'application';
  uid: string;
  name: string;
}

const deployments: Scope[] = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
].map(name => ({ kind: 'deployment', uid: name.toLowerCase(), name }));

const scopes = createFilterCascadeCollection<Scope>(deployments, {
  getValue: scope => scope.uid,
  getLabel: scope => scope.name,
  hasChildren: scope => scope.kind === 'deployment',
  getDescription: scope => (scope.kind === 'deployment' ? 'No policies' : undefined),
});

const appsOf = (deployment: Scope): Scope[] => [
  { kind: 'application', uid: 'api', name: `${deployment.name} api` },
  { kind: 'application', uid: 'checkout', name: `${deployment.name} checkout` },
];

const open = async (testId = 'scope') => {
  await userEvent.click(screen.getByTestId(`${testId}--trigger`));
};

describe('FilterCascade with plain items', () => {
  const Plain = (props: Partial<FilterCascadeProps<{ value: string; label: string }>>) => (
    <FilterCascade label='Region' collection={regions} data-testid='region' {...props}>
      <FilterCascadeTrigger data-analytics-id='REGION' />
      <FilterCascadeContent />
    </FilterCascade>
  );

  it('reads the label while unset and puts consumer props on the trigger button', () => {
    render(<Plain />);
    const trigger = screen.getByTestId('region--trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'REGION');
    expect(trigger).toHaveAccessibleName('Region');
  });

  it('opens a level on hover and picks a path', async () => {
    const onValueChange = rs.fn();
    render(<Plain onValueChange={onValueChange} />);
    await open('region');
    await userEvent.hover(await screen.findByText('Europe'));
    await userEvent.click(await screen.findByText('Amsterdam'));
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: ['eu', 'ams'] }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('region--trigger')).toHaveAccessibleName(
        'Region, Europe › Amsterdam',
      ),
    );
  });

  it('picks a row that opens a level when there is no parent option', async () => {
    const onValueChange = rs.fn();
    render(<Plain onValueChange={onValueChange} />);
    await open('region');
    await userEvent.click(await screen.findByText('Europe'));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: ['eu'] }));
  });

  it('clears the path with the ✕', async () => {
    const onValueChange = rs.fn();
    render(<Plain defaultValue={['eu', 'fra']} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear Region' }));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: [] }));
    expect(screen.getByTestId('region--trigger')).toHaveAccessibleName('Region');
  });
});

interface HarnessProps {
  loadChildren?: (item: Scope) => Promise<Scope[]>;
  onValueChange?: FilterCascadeProps<Scope>['onValueChange'];
  onToggle?: (on: boolean) => void;
  defaultValue?: string[];
  searchIn?: 'all' | 'top';
}

const ScopeHarness = ({
  loadChildren = async item => appsOf(item),
  onValueChange,
  onToggle,
  defaultValue,
  searchIn,
}: HarnessProps) => {
  const [on, setOn] = useState(false);
  return (
    <FilterCascade
      label='Scope'
      collection={scopes}
      loadChildren={loadChildren}
      parentLabel='Deployment level'
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      searchIn={searchIn}
      data-testid='scope'
    >
      <FilterCascadeTrigger>
        <FilterCascadeClear data-analytics-id='SCOPE_CLEAR' />
      </FilterCascadeTrigger>
      <FilterCascadeContent>
        <FilterCascadeSearch data-analytics-id='SCOPE_SEARCH' />
        <FilterCascadeLevels>
          {level =>
            level.depth === 0 ? (
              <>
                <FilterCascadeGroupLabel>Deployments</FilterCascadeGroupLabel>
                <FilterCascadeItems />
              </>
            ) : (
              <>
                <FilterCascadeParentItem />
                <FilterCascadeGroupLabel>Applications</FilterCascadeGroupLabel>
                <FilterCascadeItems />
              </>
            )
          }
        </FilterCascadeLevels>
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

describe('FilterCascade with typed, lazy items', () => {
  it('loads a level when its item is first highlighted, then lists it', async () => {
    let resolve: () => void = () => undefined;
    const loadChildren = rs.fn(
      (item: Scope) =>
        new Promise<Scope[]>(done => {
          resolve = () => done(appsOf(item));
        }),
    );
    render(<ScopeHarness loadChildren={loadChildren} />);
    await open();
    await userEvent.hover(await screen.findByText('Bravo'));

    expect(loadChildren).toHaveBeenCalledWith(expect.objectContaining({ uid: 'bravo' }), ['bravo']);
    expect(document.querySelector('[data-slot=filter-cascade-level-loading]')).not.toBeNull();
    resolve();
    expect(await screen.findByText('Bravo checkout')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it('picks the deployment through its parent option, and an application as a path', async () => {
    const onValueChange = rs.fn();
    render(<ScopeHarness onValueChange={onValueChange} />);
    await open();
    await userEvent.hover(await screen.findByText('Bravo'));
    await userEvent.click(await screen.findByText('Deployment level'));
    expect(onValueChange).toHaveBeenLastCalledWith({
      value: ['bravo'],
      items: [expect.objectContaining({ uid: 'bravo' })],
    });

    await open();
    await userEvent.hover(await screen.findByText('Charlie'));
    await userEvent.click(await screen.findByText('Charlie api'));
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: ['charlie', 'api'] }),
    );
  });

  it('loads the levels of a picked path to name it in the trigger', async () => {
    render(<ScopeHarness defaultValue={['delta', 'checkout']} />);
    await waitFor(() =>
      expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName(
        'Scope, Delta › Delta checkout',
      ),
    );
  });

  it('offers a retry when a level fails to load', async () => {
    const loadChildren = rs
      .fn<(item: Scope) => Promise<Scope[]>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockImplementation(async item => appsOf(item));
    render(<ScopeHarness loadChildren={loadChildren} />);
    await open();
    await userEvent.hover(await screen.findByText('Echo'));
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Echo api')).toBeInTheDocument();
  });

  it('puts consumer props on the clear and the search', async () => {
    render(<ScopeHarness defaultValue={['alpha']} />);
    expect(screen.getByTestId('scope--clear')).toHaveAttribute('data-analytics-id', 'SCOPE_CLEAR');
    await open();
    expect(await screen.findByRole('textbox', { name: 'Search Scope' })).toHaveAttribute(
      'data-analytics-id',
      'SCOPE_SEARCH',
    );
  });
});

describe('FilterCascade search', () => {
  it('finds items at every depth and lists them with their path', async () => {
    const onValueChange = rs.fn();
    render(<ScopeHarness defaultValue={['golf', 'api']} onValueChange={onValueChange} />);
    await waitFor(() =>
      expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName('Scope, Golf › Golf api'),
    );
    await open();
    await userEvent.type(await screen.findByRole('textbox', { name: 'Search Scope' }), 'golf');

    const match = screen.getByText('Golf checkout').closest('[data-slot=filter-cascade-item]');
    // The second line is where the match sits; the search list has no groups.
    expect(match).toHaveTextContent('Golf checkoutGolf');
    expect(screen.queryByText('Deployments')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Golf checkout'));
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: ['golf', 'checkout'] }),
    );
  });

  it('narrows the top level only when asked, and says when nothing matches', async () => {
    render(<ScopeHarness searchIn='top' />);
    await open();
    const search = await screen.findByRole('textbox', { name: 'Search Scope' });
    await userEvent.type(search, 'cha');
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
    expect(screen.getByText('Deployments')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('hands the keyboard from the search to the list', async () => {
    render(<ScopeHarness searchIn='top' />);
    await open();
    await userEvent.type(await screen.findByRole('textbox', { name: 'Search Scope' }), 'cha');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByText('Charlie').closest('[data-slot=filter-cascade-item]')).toHaveAttribute(
      'data-highlighted',
    );
  });
});

describe('FilterCascade sections', () => {
  it('toggles a row without picking or closing', async () => {
    const onToggle = rs.fn();
    render(<ScopeHarness defaultValue={['alpha']} onToggle={onToggle} />);
    await open();
    const row = await screen.findByRole('menuitemcheckbox', {
      name: 'Show organization policies',
    });
    await userEvent.click(row);
    expect(onToggle).toHaveBeenLastCalledWith(true);
    expect(row).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('scope--trigger')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName('Scope, Alpha');
  });
});
