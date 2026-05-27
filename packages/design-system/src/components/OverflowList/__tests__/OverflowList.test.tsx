import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../hooks', () => ({
  useOverflowItems: vi.fn(),
}));

import { useOverflowItems } from '../../../hooks';
import { OverflowList } from '../OverflowList';

type HookReturn = ReturnType<typeof useOverflowItems<string>>;

const mockHook = (visibleItems: string[], hiddenItems: string[]) => {
  const value: HookReturn = {
    containerRef: { current: null },
    visibleItems,
    hiddenItems,
    visibleCount: visibleItems.length,
    hiddenCount: hiddenItems.length,
    MeasurementContainer: () => null as unknown as ReactElement,
  };
  vi.mocked(useOverflowItems).mockReturnValue(value as never);
};

const items = ['a', 'b', 'c', 'd'];
const itemRenderer = (item: string) => <span key={item}>{item}</span>;
const overflowRenderer = (hidden: string[]) => <span>+{hidden.length}</span>;

describe('OverflowList', () => {
  beforeEach(() => {
    vi.mocked(useOverflowItems).mockReset();
  });

  it('renders visible items and the overflow indicator for hidden items', () => {
    mockHook(['a', 'b'], ['c', 'd']);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
      />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not render the overflow indicator when nothing is hidden', () => {
    mockHook(items, []);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
      />,
    );
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('renders the overflow indicator when alwaysRenderOverflow is set even with 0 hidden', () => {
    mockHook(items, []);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        alwaysRenderOverflow
      />,
    );
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  it('passes the correct source index to itemRenderer', () => {
    mockHook(['c', 'd'], []);
    const indices: number[] = [];
    render(
      <OverflowList
        items={items}
        itemRenderer={(item, index) => {
          indices.push(index);
          return <span key={item}>{item}</span>;
        }}
        overflowRenderer={overflowRenderer}
      />,
    );
    // 'c' and 'd' are at indices 2 and 3 in the source array.
    expect(indices).toEqual([2, 3]);
  });

  it('calls onOverflow with hidden items', () => {
    mockHook(['a'], ['b', 'c', 'd']);
    const onOverflow = vi.fn();
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        onOverflow={onOverflow}
      />,
    );
    expect(onOverflow).toHaveBeenCalledWith(['b', 'c', 'd']);
  });

  it('expands visible items up to minVisibleItems', () => {
    // Hook returned only 1 visible item, but minVisibleItems=3 → expect first 3.
    mockHook(['a'], ['b', 'c', 'd']);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        minVisibleItems={3}
      />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
  });
});
