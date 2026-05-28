import { type ReactElement, useState } from 'react';
import { act, render, screen } from '@testing-library/react';
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

  it('does not re-fire onOverflow when the hidden set is unchanged but the array identity is fresh', () => {
    // finalHiddenItems is derived via items.slice(visibleCount), so its identity
    // changes every render. Without the shallow-equality guard, a parent that
    // sets state in onOverflow would cause an infinite render loop.
    mockHook(['a'], ['b', 'c', 'd']);
    const onOverflow = vi.fn();

    // OverflowList is memoized; force re-render via parent state and pass a new
    // `items` array each time so the memo's shallow-equality check on `items` is
    // bypassed and the inner hook runs again with a freshly-built hidden array.
    let trigger: (() => void) | null = null;
    const Harness = () => {
      const [tick, setTick] = useState(0);
      trigger = () => setTick(t => t + 1);
      return (
        <OverflowList
          items={[...items, `tick-${tick}` as never].slice(0, items.length)}
          itemRenderer={itemRenderer}
          overflowRenderer={overflowRenderer}
          onOverflow={onOverflow}
        />
      );
    };

    render(<Harness />);
    expect(onOverflow).toHaveBeenCalledTimes(1);

    act(() => {
      mockHook(['a'], ['b', 'c', 'd']);
      trigger?.();
    });

    expect(onOverflow).toHaveBeenCalledTimes(1);
  });

  it('fires onOverflow again when the hidden set actually changes', () => {
    mockHook(['a'], ['b', 'c', 'd']);
    const onOverflow = vi.fn();

    let trigger: (() => void) | null = null;
    const Harness = () => {
      const [tick, setTick] = useState(0);
      trigger = () => setTick(t => t + 1);
      return (
        <OverflowList
          items={[...items, `tick-${tick}` as never].slice(0, items.length)}
          itemRenderer={itemRenderer}
          overflowRenderer={overflowRenderer}
          onOverflow={onOverflow}
        />
      );
    };

    render(<Harness />);
    expect(onOverflow).toHaveBeenNthCalledWith(1, ['b', 'c', 'd']);

    act(() => {
      mockHook(['a', 'b'], ['c', 'd']);
      trigger?.();
    });

    expect(onOverflow).toHaveBeenCalledTimes(2);
    expect(onOverflow).toHaveBeenNthCalledWith(2, ['c', 'd']);
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
