import { createRef, useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { FilterDropdown, type FilterDropdownProps } from './FilterDropdown';
import { FilterDropdownAllOption } from './FilterDropdownAllOption';
import { FilterDropdownClear } from './FilterDropdownClear';
import { FilterDropdownContent } from './FilterDropdownContent';
import { useFilterDropdown } from './FilterDropdownContext';
import { FilterDropdownEmpty } from './FilterDropdownEmpty';
import { FilterDropdownFooter } from './FilterDropdownFooter';
import { FilterDropdownFooterClear } from './FilterDropdownFooterClear';
import { FilterDropdownGroup } from './FilterDropdownGroup';
import { FilterDropdownGroupLabel } from './FilterDropdownGroupLabel';
import { FilterDropdownOption } from './FilterDropdownOption';
import { FilterDropdownSearch } from './FilterDropdownSearch';
import { FilterDropdownSelected } from './FilterDropdownSelected';
import { FilterDropdownTrigger } from './FilterDropdownTrigger';
import { ALL_VALUE, SELECTED_PREFIX } from './lib';

// FilterDropdown is a compound API; the analytics seams are the exported parts that render real
// targets — `FilterDropdownTrigger` (<button>), `FilterDropdownClear` (<button>),
// `FilterDropdownOption` / `FilterDropdownAllOption` (the Ark option node),
// `FilterDropdownSearch` (the <input>) and `FilterDropdownFooterClear` (<button>). The root and
// `FilterDropdownContent` are containers, not click targets. The search field's built-in clear
// button is a recorded closed-target gap (ANALYTICS_GAPS.md). See docs/metrics/contract.md.

interface Item {
  value: string;
  label: string;
  count?: number;
}

const few: Item[] = [
  { value: 'lua', label: 'Lua', count: 12 },
  { value: 'wasm', label: 'WASM', count: 4 },
  { value: 'plugin', label: 'Plugin', count: 7 },
];

const many: Item[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => ({
  value: letter.toLowerCase(),
  label: `Item ${letter}`,
}));

type HarnessProps = Omit<FilterDropdownProps<Item>, 'collection' | 'label'> & {
  items?: Item[];
  label?: string;
};

const Options = () => {
  const { groups } = useFilterDropdown<Item>();
  return (
    <>
      {groups.map(([group, groupItems]) => (
        <FilterDropdownGroup key={group}>
          {group && <FilterDropdownGroupLabel>{group}</FilterDropdownGroupLabel>}
          {groupItems.map(item => (
            <FilterDropdownOption
              key={item.value}
              item={item}
              hint={item.count}
              data-testid={`option-${item.value}`}
              data-analytics-id={`TYPE_${item.value.toUpperCase()}`}
            >
              {item.label}
            </FilterDropdownOption>
          ))}
        </FilterDropdownGroup>
      ))}
    </>
  );
};

const Harness = ({ items = few, label = 'Type', ...props }: HarnessProps) => {
  const collection = createListCollection({ items });
  return (
    <FilterDropdown collection={collection} label={label} data-testid='type-filter' {...props}>
      <FilterDropdownTrigger data-analytics-id='TYPE_FILTER' />
      <FilterDropdownContent>
        <FilterDropdownSearch data-analytics-id='TYPE_SEARCH' />
        <FilterDropdownAllOption data-analytics-id='TYPE_ALL' />
        <FilterDropdownSelected<Item>>
          {item => (
            <FilterDropdownOption item={item} hint={item.count}>
              {item.label}
            </FilterDropdownOption>
          )}
        </FilterDropdownSelected>
        <Options />
        <FilterDropdownEmpty />
        <FilterDropdownFooter />
      </FilterDropdownContent>
    </FilterDropdown>
  );
};

const Controlled = (props: HarnessProps & { initial?: string[]; spy?: (v: string[]) => void }) => {
  const { initial = [], spy, ...rest } = props;
  const [value, setValue] = useState<string[]>(initial);
  return (
    <Harness
      {...rest}
      value={value}
      onValueChange={details => {
        spy?.(details.value);
        setValue(details.value);
      }}
    />
  );
};

const trigger = () => screen.getByTestId('type-filter--trigger');

describe('Trigger label forms and aria-label', () => {
  it('single unset shows allLabel, dashed, with the attribute name as aria-label', () => {
    render(<Harness allLabel='All types' />);
    expect(trigger()).toHaveTextContent('All types');
    expect(trigger()).toHaveAccessibleName('Type');
    expect(screen.getByTestId('type-filter--control').className).toContain('border-dashed');
  });

  it('single set shows the value alone and "Label, value"', () => {
    render(<Harness allLabel='All types' defaultValue={['wasm']} />);
    expect(trigger()).toHaveTextContent('WASM');
    expect(trigger()).not.toHaveTextContent('Type');
    expect(trigger()).toHaveAccessibleName('Type, WASM');
    expect(screen.getByTestId('type-filter--control').className).toContain('border-solid');
  });

  it('multi unset shows the name with a chevron and no ✕', () => {
    render(<Harness multiple />);
    expect(trigger()).toHaveTextContent('Type');
    expect(screen.queryByTestId('type-filter--clear')).not.toBeInTheDocument();
  });

  it('multi with one value shows "Name • value"', () => {
    render(<Harness multiple defaultValue={['lua']} />);
    expect(trigger()).toHaveTextContent('Type•Lua');
    expect(trigger()).toHaveAccessibleName('Type, Lua');
    expect(screen.getByTestId('type-filter--clear')).toHaveAccessibleName('Clear Type');
  });

  it('multi with several values shows a count badge and lists them in aria-label', () => {
    render(<Harness multiple defaultValue={['lua', 'wasm', 'plugin']} />);
    expect(trigger()).toHaveTextContent('Type•3');
    expect(trigger()).toHaveAccessibleName('Type, 3 selected: Lua, WASM, Plugin');
  });

  it('a consumer aria-label wins over the composed one', () => {
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown collection={collection} label='Type' data-testid='type-filter'>
        <FilterDropdownTrigger aria-label='Custom' />
      </FilterDropdown>,
    );
    expect(trigger()).toHaveAccessibleName('Custom');
  });
});

describe('Single mode «All» sentinel', () => {
  it('shows «All» picked while unset and never reports the sentinel', async () => {
    const spy = rs.fn();
    render(<Controlled allLabel='All types' initial={['lua']} spy={spy} />);
    await userEvent.click(trigger());
    const all = await screen.findByTestId('type-filter--all-option');
    expect(all).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(all);
    expect(spy).toHaveBeenLastCalledWith([]);
    expect(trigger()).toHaveTextContent('All types');

    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--all-option')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(screen.getByTestId('option-wasm'));
    expect(spy).toHaveBeenLastCalledWith(['wasm']);
    for (const [call] of spy.mock.calls) expect(call).not.toContain(ALL_VALUE);
  });

  it('closes on pick in single mode', async () => {
    render(<Harness />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByTestId('option-lua'));
    await waitFor(() => expect(trigger()).toHaveAttribute('aria-expanded', 'false'));
  });
});

describe('Clearing a multi filter', () => {
  it('✕ clears and returns focus to the trigger', async () => {
    const spy = rs.fn();
    render(<Controlled multiple initial={['lua', 'wasm']} spy={spy} />);
    await userEvent.click(screen.getByTestId('type-filter--clear'));
    expect(spy).toHaveBeenLastCalledWith([]);
    expect(screen.queryByTestId('type-filter--clear')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('Backspace and Delete on the focused trigger clear', async () => {
    const spy = rs.fn();
    render(<Controlled multiple initial={['lua']} spy={spy} />);
    trigger().focus();
    await userEvent.keyboard('{Backspace}');
    expect(spy).toHaveBeenLastCalledWith([]);

    spy.mockClear();
    render(<Controlled multiple initial={['wasm']} spy={spy} data-testid='other' />);
    const other = screen.getByTestId('other--trigger');
    other.focus();
    await userEvent.keyboard('{Delete}');
    expect(spy).toHaveBeenLastCalledWith([]);
  });

  it('Backspace does nothing in single mode', async () => {
    const spy = rs.fn();
    render(<Controlled initial={['lua']} spy={spy} />);
    trigger().focus();
    await userEvent.keyboard('{Backspace}');
    expect(spy).not.toHaveBeenCalled();
  });

  it('footer Clear shows only while something is picked, clears and keeps the menu open', async () => {
    const spy = rs.fn();
    render(<Controlled multiple initial={[]} spy={spy} />);
    await userEvent.click(trigger());
    await screen.findByTestId('option-lua');
    expect(screen.queryByTestId('type-filter--footer')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('option-lua'));
    expect(spy).toHaveBeenLastCalledWith(['lua']);
    await userEvent.click(await screen.findByTestId('type-filter--footer-clear'));
    expect(spy).toHaveBeenLastCalledWith([]);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByTestId('type-filter--footer')).not.toBeInTheDocument();
  });

  it('a replacement ✕ passed as the trigger child is used instead of the default', async () => {
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple
        defaultValue={['lua']}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger>
          <FilterDropdownClear data-testid='my-clear' data-analytics-id='TYPE_CLEAR' />
        </FilterDropdownTrigger>
      </FilterDropdown>,
    );
    expect(screen.getByTestId('my-clear')).toHaveAttribute('data-analytics-id', 'TYPE_CLEAR');
    expect(screen.queryByTestId('type-filter--clear')).not.toBeInTheDocument();
  });
});

describe('Search', () => {
  it('is absent under the threshold and present from it (base items only)', async () => {
    const { unmount } = render(<Harness items={many.slice(0, 7)} />);
    await userEvent.click(trigger());
    await screen.findByTestId('option-a');
    expect(screen.queryByTestId('type-filter--search')).not.toBeInTheDocument();
    unmount();

    render(<Harness items={many} />);
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--search')).toBeInTheDocument();
  });

  it('respects a custom searchThreshold', async () => {
    render(<Harness items={few} searchThreshold={3} />);
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--search')).toBeInTheDocument();
  });

  it('filters, types a space instead of picking, and shows the empty state', async () => {
    const spy = rs.fn();
    render(<Controlled items={many} spy={spy} />);
    await userEvent.click(trigger());
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());

    await userEvent.type(input, 'item b');
    expect(input).toHaveValue('item b');
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByTestId('option-b')).toBeInTheDocument();
    expect(screen.queryByTestId('option-a')).not.toBeInTheDocument();
    // «All» is not a match for any query.
    expect(screen.queryByTestId('type-filter--all-option')).not.toBeInTheDocument();

    await userEvent.type(input, 'zzz');
    expect(screen.getByTestId('type-filter--empty')).toHaveTextContent('Nothing matches');
  });

  it('highlights the first match after a query change so Enter picks it', async () => {
    const spy = rs.fn();
    render(<Controlled items={many} spy={spy} />);
    await userEvent.click(trigger());
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    await userEvent.type(input, 'item c');
    await waitFor(() =>
      expect(screen.getByTestId('option-c')).toHaveAttribute('data-highlighted', ''),
    );
    await userEvent.keyboard('{Enter}');
    expect(spy).toHaveBeenLastCalledWith(['c']);
  });

  it('starts every session with an empty query', async () => {
    render(<Harness items={many} />);
    await userEvent.click(trigger());
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    // The menu takes focus (and starts listening for Escape) on the frame after it opens.
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.type(input, 'item b');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger()).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(trigger()).toHaveFocus());

    await userEvent.click(trigger());
    const again = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    expect(again).toHaveValue('');
    expect(screen.getByTestId('option-a')).toBeInTheDocument();
  });
});

describe('Multi "Selected" section', () => {
  it('is absent under the threshold', async () => {
    render(<Harness multiple defaultValue={['lua']} />);
    await userEvent.click(trigger());
    await screen.findByTestId('option-lua');
    expect(screen.queryByTestId('type-filter--selected')).not.toBeInTheDocument();
  });

  it('snapshots on open: ticking does not add rows, unticking a copy unticks the original', async () => {
    const spy = rs.fn();
    render(<Controlled items={many} multiple initial={['f', 'c']} spy={spy} />);
    await userEvent.click(trigger());
    const selected = await screen.findByTestId('type-filter--selected');
    const copies = within(selected).getAllByRole('option');
    expect(copies.map(c => c.textContent)).toEqual(['Item F', 'Item C']);

    // Tick another value: the snapshot does not change while open.
    await userEvent.click(screen.getByTestId('option-a'));
    expect(spy).toHaveBeenLastCalledWith(['f', 'c', 'a']);
    expect(within(selected).getAllByRole('option')).toHaveLength(2);

    // Untick the copy of F: F goes, its original is unticked, the copy row stays.
    await userEvent.click(within(selected).getAllByRole('option')[0] as HTMLElement);
    expect(spy).toHaveBeenLastCalledWith(['c', 'a']);
    expect(screen.getByTestId('option-f')).toHaveAttribute('aria-selected', 'false');
    expect(within(selected).getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'false');

    // Re-tick the original: its copy ticks with it.
    await userEvent.click(screen.getByTestId('option-f'));
    expect(within(selected).getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

    for (const [call] of spy.mock.calls) {
      for (const v of call as string[]) expect(v.startsWith(SELECTED_PREFIX)).toBe(false);
    }
  });

  it('hides while a query is active and re-snapshots when the query is cleared', async () => {
    render(<Controlled items={many} multiple initial={['b']} />);
    await userEvent.click(trigger());
    await screen.findByTestId('type-filter--selected');
    const input = within(screen.getByTestId('type-filter--search')).getByRole('combobox');

    await userEvent.type(input, 'item');
    expect(screen.queryByTestId('type-filter--selected')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('option-d'));

    await userEvent.clear(input);
    const selected = await screen.findByTestId('type-filter--selected');
    expect(
      within(selected)
        .getAllByRole('option')
        .map(o => o.textContent),
    ).toEqual(['Item B', 'Item D']);
  });
});

describe('Attribute pass-through (compound seams)', () => {
  it('forwards data-analytics-id to the trigger <button>, not the pill', () => {
    render(<Harness />);
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger()).toHaveAttribute('data-analytics-id', 'TYPE_FILTER');
    expect(screen.getByTestId('type-filter--control')).not.toHaveAttribute('data-analytics-id');
  });

  it('forwards data-analytics-props verbatim on the trigger', () => {
    const payload = '{"filter":"type","place":"toolbar"}';
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown collection={collection} label='Type' data-testid='type-filter'>
        <FilterDropdownTrigger data-analytics-props={payload} />
      </FilterDropdown>,
    );
    expect(trigger()).toHaveAttribute('data-analytics-props', payload);
  });

  it('forwards attributes to options, the All option and the search <input>', async () => {
    render(<Harness items={many.map(i => ({ ...i }))} />);
    await userEvent.click(trigger());
    expect(await screen.findByTestId('option-a')).toHaveAttribute('data-analytics-id', 'TYPE_A');
    expect(screen.getByTestId('type-filter--all-option')).toHaveAttribute(
      'data-analytics-id',
      'TYPE_ALL',
    );
    const search = screen.getByTestId('type-filter--search');
    expect(search).not.toHaveAttribute('data-analytics-id');
    expect(within(search).getByRole('combobox')).toHaveAttribute(
      'data-analytics-id',
      'TYPE_SEARCH',
    );
  });

  it('forwards attributes to the footer Clear <button>', async () => {
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple
        defaultValue={['lua']}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownFooter>
            <FilterDropdownFooterClear data-analytics-id='TYPE_FOOTER_CLEAR' />
          </FilterDropdownFooter>
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    const button = await screen.findByTestId('type-filter--footer-clear');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'TYPE_FOOTER_CLEAR');
  });

  it('keeps the trigger attributes across open/close and value changes', async () => {
    render(<Controlled multiple />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByTestId('option-lua'));
    await userEvent.keyboard('{Escape}');
    expect(trigger()).toHaveAttribute('data-analytics-id', 'TYPE_FILTER');
  });

  it('consumer handlers still run on the trigger and ✕', async () => {
    const onKeyDown = rs.fn();
    const onClick = rs.fn();
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple
        defaultValue={['lua']}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger onKeyDown={onKeyDown}>
          <FilterDropdownClear onClick={onClick} />
        </FilterDropdownTrigger>
      </FilterDropdown>,
    );
    await userEvent.click(screen.getByTestId('type-filter--clear'));
    expect(onClick).toHaveBeenCalledOnce();

    trigger().focus();
    await userEvent.keyboard('{Enter}');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('a consumer preventDefault on the ✕ keeps the value', async () => {
    const spy = rs.fn();
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple
        defaultValue={['lua']}
        onValueChange={d => spy(d.value)}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger>
          <FilterDropdownClear onClick={e => e.preventDefault()} />
        </FilterDropdownTrigger>
      </FilterDropdown>,
    );
    await userEvent.click(screen.getByTestId('type-filter--clear'));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('Click resolution', () => {
  it('resolves clicks on the trigger, an option and the ✕ to their analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple
        defaultValue={['lua']}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger data-analytics-id='TYPE_FILTER'>
          <FilterDropdownClear data-analytics-id='TYPE_CLEAR' />
        </FilterDropdownTrigger>
        <FilterDropdownContent>
          <Options />
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    expect(captured).toHaveBeenCalledWith('TYPE_FILTER');
    await userEvent.click(await screen.findByTestId('option-wasm'));
    expect(captured).toHaveBeenCalledWith('TYPE_WASM');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByTestId('type-filter--clear'));
    expect(captured).toHaveBeenCalledWith('TYPE_CLEAR');
  });
});

describe('Test id cascade', () => {
  it('derives part test ids from the root', async () => {
    render(<Harness multiple items={many} defaultValue={['a']} />);
    expect(screen.getByTestId('type-filter')).toHaveAttribute('data-slot', 'filter-dropdown');
    expect(screen.getByTestId('type-filter--control')).toBeInTheDocument();
    expect(screen.getByTestId('type-filter--clear')).toBeInTheDocument();
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--content')).toHaveAttribute(
      'data-slot',
      'filter-dropdown-content',
    );
    expect(screen.getByTestId('type-filter--list')).toBeInTheDocument();
    expect(screen.getByTestId('type-filter--search')).toBeInTheDocument();
    expect(screen.getByTestId('type-filter--selected')).toBeInTheDocument();
    expect(screen.getAllByTestId('type-filter--selected-option')).toHaveLength(1);
    expect(screen.getByTestId('type-filter--footer')).toBeInTheDocument();
  });
});

describe('Keyboard and focus', () => {
  it('opens with Enter, ArrowDown and Space on the trigger', async () => {
    for (const key of ['{Enter}', '{ArrowDown}', ' ']) {
      const { unmount } = render(<Harness />);
      trigger().focus();
      await userEvent.keyboard(key);
      await waitFor(() => expect(trigger()).toHaveAttribute('aria-expanded', 'true'));
      unmount();
    }
  });

  it('Escape closes the menu and returns focus to the trigger', async () => {
    render(<Harness items={many} />);
    await userEvent.click(trigger());
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger()).toHaveAttribute('aria-expanded', 'false'));
    // aria-expanded flips with the state change; zag moves focus back on the next animation frame.
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it('focuses the list when there is no search', async () => {
    render(<Harness />);
    await userEvent.click(trigger());
    const list = await screen.findByTestId('type-filter--content');
    await waitFor(() => expect(list).toHaveFocus());
  });

  it('keeps the menu open on pick in multi mode', async () => {
    const spy = rs.fn();
    render(<Controlled multiple spy={spy} />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByTestId('option-lua'));
    await userEvent.click(screen.getByTestId('option-wasm'));
    expect(spy).toHaveBeenLastCalledWith(['lua', 'wasm']);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('type-filter--content')).toHaveAttribute(
      'aria-multiselectable',
      'true',
    );
  });

  it('footer Clear moves focus into the search before the footer goes away', async () => {
    render(<Controlled items={many} multiple initial={['a']} />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByTestId('type-filter--footer-clear'));
    const input = within(screen.getByTestId('type-filter--search')).getByRole('combobox');
    expect(input).toHaveFocus();
  });

  it('Home and End in the search move the caret instead of the highlight', async () => {
    render(<Harness items={many} />);
    await userEvent.click(trigger());
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    await userEvent.type(input, 'item');
    await waitFor(() =>
      expect(screen.getByTestId('option-a')).toHaveAttribute('data-highlighted', ''),
    );
    await userEvent.keyboard('{End}');
    expect(screen.getByTestId('option-a')).toHaveAttribute('data-highlighted', '');
    expect(screen.getByTestId('option-h')).not.toHaveAttribute('data-highlighted');
  });
});

describe('Disabled', () => {
  it('disables the trigger and the ✕ and does not open', async () => {
    render(<Harness multiple disabled defaultValue={['lua', 'wasm']} />);
    expect(trigger()).toBeDisabled();
    expect(screen.getByTestId('type-filter--clear')).toBeDisabled();
    expect(trigger()).toHaveTextContent('Type•2');
    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Callbacks only see consumer values', () => {
  it('onOpenChange reports [] for an unset single filter', async () => {
    const onOpenChange = rs.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: true, value: [] });
  });

  it('onValueChange passes the picked items alongside the values', async () => {
    const onValueChange = rs.fn();
    render(<Harness multiple onValueChange={onValueChange} />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByTestId('option-wasm'));
    expect(onValueChange).toHaveBeenLastCalledWith({
      value: ['wasm'],
      items: [few[1]],
    });
  });

  it('works uncontrolled with defaultValue', async () => {
    render(<Harness multiple defaultValue={['lua']} />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByTestId('option-plugin'));
    expect(trigger()).toHaveAccessibleName('Type, 2 selected: Lua, Plugin');
  });
});

describe('Groups, hint and width', () => {
  interface GroupedItem extends Item {
    category: string;
  }
  const grouped: GroupedItem[] = many.map((item, index) => ({
    ...item,
    category: index < 4 ? 'First' : 'Second',
  }));

  it('drops groups with no match from useFilterDropdown().groups', async () => {
    const collection = createListCollection({ items: grouped, groupBy: item => item.category });
    render(
      <FilterDropdown collection={collection} label='Scope' data-testid='type-filter'>
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownSearch />
          <Options />
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    await screen.findByText('First');
    expect(screen.getByText('Second')).toBeInTheDocument();

    const input = within(screen.getByTestId('type-filter--search')).getByRole('combobox');
    await userEvent.type(input, 'item g');
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('renders the hint as right-side text inside the option', async () => {
    render(<Harness />);
    await userEvent.click(trigger());
    const option = await screen.findByTestId('option-lua');
    const hint = option.querySelector('[data-slot="select-option-hint"]');
    expect(hint).toHaveTextContent('12');
  });

  it('pins the menu width while a query is active and releases it when cleared', async () => {
    const offsetWidth = rs.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(214);
    try {
      render(<Harness items={many} />);
      await userEvent.click(trigger());
      const content = await screen.findByTestId('type-filter--content');
      const input = within(screen.getByTestId('type-filter--search')).getByRole('combobox');
      expect(content.style.width).toBe('');

      await userEvent.type(input, 'item a');
      expect(content.style.width).toBe('214px');

      await userEvent.clear(input);
      expect(content.style.width).toBe('');
    } finally {
      offsetWidth.mockRestore();
    }
  });

  it('caps the menu at 360px wide and min(340px, available height) tall', async () => {
    render(<Harness />);
    await userEvent.click(trigger());
    const content = await screen.findByTestId('type-filter--content');
    expect(content.className).toContain('max-w-360');
    expect(content.className).not.toContain('min-w-240');
  });
});

describe('Attribute pass-through — negative and persistence', () => {
  it('does not put the trigger or option analytics id on the hidden native <select>', async () => {
    const { container } = render(<Harness />);
    const hidden = container.querySelector('select');
    expect(hidden).not.toBeNull();
    expect(hidden).not.toHaveAttribute('data-analytics-id');
    for (const option of Array.from(hidden?.querySelectorAll('option') ?? [])) {
      expect(option).not.toHaveAttribute('data-analytics-id');
    }
  });

  it('keeps the option analytics id after the option is ticked', async () => {
    render(<Controlled multiple />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByTestId('option-lua'));
    expect(screen.getByTestId('option-lua')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('option-lua')).toHaveAttribute('data-analytics-id', 'TYPE_LUA');
  });

  it('forwards consumer attributes to the "Selected" copy row', async () => {
    const collection = createListCollection({ items: many });
    render(
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple
        defaultValue={['c']}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownSelected<Item>>
            {item => (
              <FilterDropdownOption item={item} data-analytics-id={`SELECTED_${item.value}`}>
                {item.label}
              </FilterDropdownOption>
            )}
          </FilterDropdownSelected>
          <Options />
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    const copy = await screen.findByTestId('type-filter--selected-option');
    expect(copy).toHaveAttribute('role', 'option');
    expect(copy).toHaveAttribute('data-analytics-id', 'SELECTED_c');
    // The original row keeps its own id.
    expect(screen.getByTestId('option-c')).toHaveAttribute('data-analytics-id', 'TYPE_C');
  });

  it('forwards data-analytics-props verbatim on an option', async () => {
    const payload = '{"value":"lua","place":"menu"}';
    const collection = createListCollection({ items: few });
    render(
      <FilterDropdown collection={collection} label='Type' data-testid='type-filter'>
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownOption item={few[0] as Item} data-analytics-props={payload}>
            Lua
          </FilterDropdownOption>
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--option')).toHaveAttribute(
      'data-analytics-props',
      payload,
    );
  });
});

describe('Test id cascade — every part', () => {
  const Parts = ({ multiple = false, value = [] as string[] }) => {
    const collection = createListCollection({ items: many });
    return (
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple={multiple}
        defaultValue={value}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownSearch />
          <FilterDropdownAllOption />
          <FilterDropdownSelected />
          <FilterDropdownOption item={many[0] as Item}>Item A</FilterDropdownOption>
          <FilterDropdownEmpty />
          <FilterDropdownFooter />
        </FilterDropdownContent>
      </FilterDropdown>
    );
  };

  it('gives the trigger its id once (the truncation tooltip is kept out of the cascade)', () => {
    render(<Parts />);
    expect(screen.getAllByTestId('type-filter--trigger')).toHaveLength(1);
    expect(trigger().tagName).toBe('BUTTON');
  });

  it('names single-mode parts from the root, not from the scrolling list', async () => {
    render(<Parts />);
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--all-option')).toBeInTheDocument();
    expect(screen.getByTestId('type-filter--option')).toHaveTextContent('Item A');
    expect(screen.queryByTestId('type-filter--list--option')).not.toBeInTheDocument();

    const input = within(screen.getByTestId('type-filter--search')).getByRole('combobox');
    await userEvent.type(input, 'zzz');
    expect(screen.getByTestId('type-filter--empty')).toBeInTheDocument();
  });

  it('names multi-mode parts from the root', async () => {
    render(<Parts multiple value={['a']} />);
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--selected-option')).toBeInTheDocument();
    expect(screen.getByTestId('type-filter--footer-clear').tagName).toBe('BUTTON');
  });

  it('leaves the DOM clean when no data-testid is passed', async () => {
    const collection = createListCollection({ items: few });
    const { baseElement } = render(
      <FilterDropdown collection={collection} label='Type' multiple defaultValue={['lua']}>
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <Options />
          <FilterDropdownFooter />
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findAllByRole('option');
    const ids = Array.from(baseElement.querySelectorAll('[data-testid]')).map(el =>
      el.getAttribute('data-testid'),
    );
    // Only the consumer's own option ids remain.
    expect(ids.every(id => id?.startsWith('option-'))).toBe(true);
  });
});

describe('Trigger truncation', () => {
  it('ellipsises both the name and the value of a one-value multi trigger', () => {
    render(<Harness multiple label='Deployment region' defaultValue={['lua']} />);
    const [name, value] = Array.from(
      trigger().querySelectorAll<HTMLElement>('span.truncate'),
    ) as HTMLElement[];
    expect(name).toHaveTextContent('Deployment region');
    expect(value).toHaveTextContent('Lua');
    // The value keeps a few characters next to a long name; nothing paints over the ✕.
    expect(value?.className).toContain('min-w-24');
    expect(name?.parentElement?.className).toContain('overflow-hidden');
  });
});

describe('Menu layout', () => {
  it('fits the no-results state to the menu width instead of a fixed 240px', async () => {
    render(<Harness items={many} />);
    await userEvent.click(trigger());
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    await userEvent.type(input, 'zzz');
    const emptyState = screen
      .getByTestId('type-filter--empty')
      .querySelector('[data-slot="empty-state"]');
    expect(emptyState?.className).toContain('w-full');
    expect(emptyState?.className).toContain('max-w-240');
    expect(emptyState?.className).not.toContain('w-[240px]');
  });

  it('tightens the gap under the search to Figma’s 4px + row gap', async () => {
    render(<Harness items={many} />);
    await userEvent.click(trigger());
    const search = await screen.findByTestId('type-filter--search');
    expect(search.closest('[data-slot="filter-dropdown-search"]')?.className).toContain('-mb-3');
  });
});

describe('selectedOnTop', () => {
  it('keeps aliases out of the list and keyboard navigation when turned off', async () => {
    const collection = createListCollection({ items: many });
    render(
      <FilterDropdown
        collection={collection}
        label='Type'
        multiple
        selectedOnTop={false}
        defaultValue={['c']}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownSelected />
          <Options />
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    await screen.findByTestId('type-filter--content');
    expect(screen.queryByTestId('type-filter--selected')).not.toBeInTheDocument();
    expect(document.querySelector(`[data-value^="${SELECTED_PREFIX}"]`)).toBeNull();
  });

  it('works when the content is rendered by a wrapper component', async () => {
    const Menu = () => (
      <FilterDropdownContent>
        <FilterDropdownAllOption />
        <Options />
      </FilterDropdownContent>
    );
    render(
      <FilterDropdown
        collection={createListCollection({ items: few })}
        label='Type'
        data-testid='type-filter'
      >
        <FilterDropdownTrigger />
        <Menu />
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--all-option')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

describe('Controlled open starts a fresh session', () => {
  it('takes the "Selected" snapshot from the current value when opened programmatically', async () => {
    const { rerender } = render(<Harness items={many} multiple open={false} value={[]} />);
    rerender(<Harness items={many} multiple open={false} value={['c']} />);
    rerender(<Harness items={many} multiple open value={['c']} />);
    const selected = await screen.findByTestId('type-filter--selected');
    expect(
      within(selected)
        .getAllByRole('option')
        .map(o => o.textContent),
    ).toEqual(['Item C']);
  });

  it('clears the query and brings «All» back when reopened programmatically', async () => {
    const { rerender } = render(<Harness items={many} open />);
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    await userEvent.type(input, 'item b');
    expect(screen.queryByTestId('type-filter--all-option')).not.toBeInTheDocument();

    rerender(<Harness items={many} open={false} />);
    rerender(<Harness items={many} open />);
    const again = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    expect(again).toHaveValue('');
    expect(screen.getByTestId('type-filter--all-option')).toBeInTheDocument();
  });
});

describe('Footer Clear from the keyboard', () => {
  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('%s clears instead of toggling the highlighted option', async (_name, key) => {
    const spy = rs.fn();
    render(<Controlled multiple initial={['lua', 'wasm']} spy={spy} />);
    await userEvent.click(trigger());
    await waitFor(() =>
      expect(screen.getByTestId('option-lua')).toHaveAttribute('data-highlighted', ''),
    );
    // The highlight is set with the state change, but the menu's initial focus lands on the next
    // animation frame; move to Clear only after it, as Tab would, so that frame cannot pull focus
    // back to the list between the key's keydown and keyup.
    await waitFor(() => expect(screen.getByTestId('type-filter--content')).toHaveFocus());
    const clearButton = screen.getByTestId('type-filter--footer-clear');
    clearButton.focus();
    await userEvent.keyboard(key);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith([]);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Search combobox wiring', () => {
  it('points aria-activedescendant at the highlighted option', async () => {
    render(<Harness items={many} />);
    await userEvent.click(trigger());
    const input = within(await screen.findByTestId('type-filter--search')).getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');

    await waitFor(() => {
      const active = document.querySelector('[role="option"][data-highlighted]');
      expect(active).not.toBeNull();
      expect(input.getAttribute('aria-activedescendant')).toBe(active?.id);
    });
    expect(input).toHaveAttribute('aria-controls', screen.getByTestId('type-filter--content').id);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('reports a click on the built-in clear button through onClear', async () => {
    const onClear = rs.fn();
    const collection = createListCollection({ items: many });
    render(
      <FilterDropdown collection={collection} label='Type' data-testid='type-filter'>
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownSearch onClear={onClear} />
          <Options />
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    const search = await screen.findByTestId('type-filter--search');
    await userEvent.type(within(search).getByRole('combobox'), 'item');
    await userEvent.click(within(search).getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe('Initial focus candidates', () => {
  it('keeps the list and the footer Clear out of the initial focus', async () => {
    render(<Harness multiple defaultValue={['lua']} />);
    await userEvent.click(trigger());
    const list = await screen.findByTestId('type-filter--list');
    expect(list).toHaveAttribute('tabindex', '-1');
    expect(list).toHaveAttribute('data-no-autofocus');
    expect(screen.getByTestId('type-filter--footer-clear')).toHaveAttribute('data-no-autofocus');
    await waitFor(() => expect(screen.getByTestId('type-filter--content')).toHaveFocus());
  });

  // In a browser the ScrollArea viewport is tabbable until it measures no overflow and drops its
  // tabindex; if Zag picks it as the initial focus, focus falls to <body> and the keyboard dies.
  it('keeps the scroll viewport out of the initial focus', async () => {
    render(<Harness />);
    await userEvent.click(trigger());
    expect(await screen.findByTestId('type-filter--list--viewport')).toHaveAttribute(
      'data-no-autofocus',
    );
  });
});

describe('Refs on the group parts', () => {
  it('forwards refs to FilterDropdownGroup, FilterDropdownGroupLabel and FilterDropdownSelected', async () => {
    const groupRef = createRef<HTMLDivElement>();
    const labelRef = createRef<HTMLDivElement>();
    const selectedRef = createRef<HTMLDivElement>();
    render(
      <FilterDropdown
        collection={createListCollection({ items: many })}
        label='Type'
        multiple
        defaultValue={['a']}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger />
        <FilterDropdownContent>
          <FilterDropdownSelected ref={selectedRef} />
          <FilterDropdownGroup ref={groupRef}>
            <FilterDropdownGroupLabel ref={labelRef}>Letters</FilterDropdownGroupLabel>
            {many.map(item => (
              <FilterDropdownOption key={item.value} item={item}>
                {item.label}
              </FilterDropdownOption>
            ))}
          </FilterDropdownGroup>
        </FilterDropdownContent>
      </FilterDropdown>,
    );
    await userEvent.click(trigger());
    await screen.findByText('Letters');
    expect(groupRef.current).toHaveAttribute('data-slot', 'filter-dropdown-group');
    expect(labelRef.current).toHaveAttribute('data-slot', 'filter-dropdown-group-label');
    expect(selectedRef.current).toHaveAttribute('data-slot', 'filter-dropdown-selected');
  });
});

describe('Disabled root and a replacement ✕', () => {
  it('keeps the ✕ disabled even when it passes disabled={false}', async () => {
    const spy = rs.fn();
    render(
      <FilterDropdown
        collection={createListCollection({ items: few })}
        label='Type'
        multiple
        disabled
        value={['lua']}
        onValueChange={details => spy(details.value)}
        data-testid='type-filter'
      >
        <FilterDropdownTrigger>
          <FilterDropdownClear disabled={false} />
        </FilterDropdownTrigger>
      </FilterDropdown>,
    );
    const clearButton = screen.getByTestId('type-filter--clear');
    expect(clearButton).toBeDisabled();
    await userEvent.click(clearButton);
    expect(spy).not.toHaveBeenCalled();
  });
});
