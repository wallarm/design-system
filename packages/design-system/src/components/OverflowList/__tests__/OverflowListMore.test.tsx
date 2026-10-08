import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

rs.mock('../../../hooks', () => ({
  useOverflowItems: rs.fn(),
}));

import { useOverflowItems } from '../../../hooks';
import { Tag } from '../../Tag';
import { OverflowList } from '../OverflowList';
import { OverflowListProvider } from '../OverflowListContext';
import { OverflowListMore } from '../OverflowListMore';
import { OverflowListMoreContent } from '../OverflowListMoreContent';
import { OverflowListMoreCount } from '../OverflowListMoreCount';
import { OverflowListMoreHeader } from '../OverflowListMoreHeader';
import { OverflowListMoreItems } from '../OverflowListMoreItems';
import { OverflowListMoreTrigger } from '../OverflowListMoreTrigger';

const mockHook = (visibleItems: string[], hiddenItems: string[]) => {
  rs.mocked(useOverflowItems).mockReturnValue({
    containerRef: { current: null },
    visibleItems,
    hiddenItems,
    visibleCount: visibleItems.length,
    hiddenCount: hiddenItems.length,
    MeasurementContainer: () => null as unknown as ReactElement,
  } as never);
};

const items = ['a', 'b', 'c', 'd'];
const itemRenderer = (item: string) => <Tag key={item}>{item}</Tag>;

describe('OverflowListMore', () => {
  beforeEach(() => {
    rs.mocked(useOverflowItems).mockReset();
    mockHook(['a', 'b'], ['c', 'd']);
  });

  it('renders a "+N more" button by default and opens a popover with every item', async () => {
    const user = userEvent.setup();
    render(<OverflowList data-testid='tags' items={items} itemRenderer={itemRenderer} />);

    const trigger = screen.getByRole('button', { name: '+2 more' });
    await user.click(trigger);

    const listed = screen.getAllByTestId('tags--more--items--item');
    expect(listed.map(el => el.getAttribute('data-state'))).toEqual([
      'visible',
      'visible',
      'hidden',
      'hidden',
    ]);
    expect(listed[0]?.className).toContain('opacity-60');
    expect(listed[2]?.className).not.toContain('opacity-60');
  });

  it('opens from the keyboard', async () => {
    const user = userEvent.setup();
    render(<OverflowList data-testid='tags' items={items} itemRenderer={itemRenderer} />);

    screen.getByRole('button', { name: '+2 more' }).focus();
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('tags--more--items')).toBeInTheDocument();
  });

  it('renders nothing when no item is hidden, even with alwaysRenderOverflow', () => {
    mockHook(items, []);
    render(<OverflowList items={items} itemRenderer={itemRenderer} alwaysRenderOverflow />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('composes header and counts from parts, and lists only hidden items with show="hidden"', async () => {
    const user = userEvent.setup();
    render(
      <OverflowList
        data-testid='tags'
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={() => (
          <OverflowListMore>
            <OverflowListMoreTrigger>
              +<OverflowListMoreCount />
            </OverflowListMoreTrigger>
            <OverflowListMoreContent>
              <OverflowListMoreHeader>
                <OverflowListMoreCount of='total' /> tags
              </OverflowListMoreHeader>
              <OverflowListMoreItems show='hidden' />
            </OverflowListMoreContent>
          </OverflowListMore>
        )}
      />,
    );

    await user.click(screen.getByRole('button', { name: '+2' }));

    expect(screen.getByTestId('tags--more--header').textContent).toBe('4 tags');
    const list = screen.getByTestId('tags--more--items');
    expect(
      within(list)
        .getAllByText(/^[a-d]$/)
        .map(el => el.textContent),
    ).toEqual(['c', 'd']);
  });

  it('cascades test ids to the parts but not to the row items', async () => {
    const user = userEvent.setup();
    render(<OverflowList data-testid='tags' items={items} itemRenderer={itemRenderer} />);

    expect(screen.getByText('a').closest('[data-testid]')?.getAttribute('data-testid')).toBe(
      'tags',
    );
    const trigger = screen.getByTestId('tags--more--trigger');
    expect(trigger.tagName).toBe('BUTTON');

    await user.click(trigger);
    expect(screen.getByTestId('tags--more--content')).toBeInTheDocument();
    expect(screen.getByTestId('tags--more--items')).toBeInTheDocument();
    // Item tags inside the popover don't inherit the cascade either.
    const popoverTag = within(screen.getByTestId('tags--more--items')).getByText('c');
    expect(popoverTag.getAttribute('data-testid')).toBeNull();
  });

  it('forwards analytics attributes and handlers to the trigger button', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={() => (
          <OverflowListMore>
            <OverflowListMoreTrigger data-analytics-id='tags-more' onClick={onClick} />
            <OverflowListMoreContent />
          </OverflowListMore>
        )}
      />,
    );

    const trigger = screen.getByRole('button', { name: '+2 more' });
    expect(trigger.getAttribute('data-analytics-id')).toBe('tags-more');
    await user.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders only the bare chip in the measurement layer', () => {
    render(
      <OverflowListProvider
        value={{
          allItems: items,
          visibleItems: [],
          hiddenItems: items,
          itemRenderer: itemRenderer as never,
          containerRef: { current: null },
          measuring: true,
          testId: undefined,
        }}
      >
        <OverflowListMore data-testid='m' />
      </OverflowListProvider>,
    );

    const chip = screen.getByRole('button', { name: '+4 more' });
    expect(chip.getAttribute('aria-expanded')).toBeNull();
    expect(chip.getAttribute('data-testid')).toBeNull();
  });

  it('classifies duplicate items by position, not value', async () => {
    const user = userEvent.setup();
    mockHook(['x', 'y'], ['x']);
    render(<OverflowList data-testid='d' items={['x', 'y', 'x']} itemRenderer={itemRenderer} />);

    await user.click(screen.getByTestId('d--more--trigger'));
    const states = screen
      .getAllByTestId('d--more--items--item')
      .map(el => el.getAttribute('data-state'));
    expect(states).toEqual(['visible', 'visible', 'hidden']);
  });

  it('does not leak the list test id into a custom renderer', () => {
    render(
      <OverflowList
        data-testid='tags'
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={hidden => <Tag>+{hidden.length}</Tag>}
      />,
    );
    expect(screen.getAllByTestId('tags')).toHaveLength(1);
  });

  it('applies className to the trigger button', () => {
    render(
      <OverflowList
        data-testid='tags'
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={() => (
          <OverflowListMore>
            <OverflowListMoreTrigger className='px-16' />
          </OverflowListMore>
        )}
      />,
    );
    expect(screen.getByTestId('tags--more--trigger').className).toContain('px-16');
  });

  it('throws when a part is rendered outside OverflowList', () => {
    const spy = rs.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<OverflowListMoreCount />)).toThrow(/inside an OverflowList/);
    spy.mockRestore();
  });
});
