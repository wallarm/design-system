import { type ReactElement, useState } from 'react';
import { act, render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { useOverflowItems } from '../useOverflowItems';

// Guards the imperative measurement-layer display toggle. jsdom has no layout,
// so offsetWidth is stubbed: non-zero means "laid out" (the measurement lands
// and the layer hides), zero means "display:none ancestor" (the measurement is
// deferred and the layer must stay for the ResizeObserver to read later).

let mockOffsetWidth = 200;
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get: () => mockOffsetWidth,
});
afterAll(() => {
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  }
});
beforeEach(() => {
  mockOffsetWidth = 200;
});

const renderItem = (item: string): ReactElement => <span>{item}</span>;

const Harness = ({ items }: { items: string[] }) => {
  const { containerRef, MeasurementContainer } = useOverflowItems({ items, renderItem });
  return (
    <div data-testid='root' ref={containerRef}>
      <MeasurementContainer />
    </div>
  );
};

const getLayer = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('.absolute.invisible.pointer-events-none');

// The scheduler flushes in a queueMicrotask; await a macrotask so both the
// microtask and React's batched state update have settled.
const flushScheduler = () =>
  act(async () => {
    await new Promise(r => setTimeout(r, 0));
  });

describe('useOverflowItems measurement layer', () => {
  it('hides the measurement layer after the scheduled measurement lands', async () => {
    const { getByTestId } = render(<Harness items={['a', 'b', 'c']} />);
    const root = getByTestId('root');

    // Before the flush the layer is mounted and laid out (no display:none).
    expect(getLayer(root)?.style.display).not.toBe('none');

    await flushScheduler();

    // After measuring, the duplicate content is excluded from layout.
    expect(getLayer(root)?.style.display).toBe('none');
  });

  it('re-enables the layer to re-measure when items change to a new array', async () => {
    const { getByTestId, rerender } = render(<Harness items={['a', 'b']} />);
    const root = getByTestId('root');

    await flushScheduler();
    expect(getLayer(root)?.style.display).toBe('none');

    // New array identity -> the effect must re-show the layer, then re-hide it.
    rerender(<Harness items={['a', 'b', 'c', 'd']} />);
    // Synchronously after the commit (before the next flush) it is visible again.
    expect(getLayer(root)?.style.display).not.toBe('none');

    await flushScheduler();
    expect(getLayer(root)?.style.display).toBe('none');
  });

  it('reuses cached measurements on remount of the same array (layer skipped)', async () => {
    const items = ['x', 'y', 'z'];
    const Wrapper = () => {
      const [mounted, setMounted] = useState(true);
      return (
        <div data-testid='wrap'>
          <button type='button' onClick={() => setMounted(m => !m)}>
            toggle
          </button>
          {mounted && <Harness items={items} />}
        </div>
      );
    };
    const { getByTestId, getByRole } = render(<Wrapper />);
    const wrap = getByTestId('wrap');

    await flushScheduler();
    expect(getLayer(wrap)?.style.display).toBe('none');

    // Unmount then remount the SAME items array: the cross-mount cache holds
    // its widths, so the measurement layer is not rendered at all.
    await act(async () => {
      getByRole('button').click();
    });
    await act(async () => {
      getByRole('button').click();
    });
    await flushScheduler();

    expect(getLayer(wrap)).toBeNull();
  });

  it('keeps the layer when measured while hidden (deferred to the ResizeObserver)', async () => {
    // display:none ancestor: every offsetWidth read is 0.
    mockOffsetWidth = 0;
    const { getByTestId } = render(<Harness items={['a', 'b', 'c']} />);
    const root = getByTestId('root');

    await flushScheduler();

    // The measurement could not land — the layer must survive so the deferred
    // measurement (ResizeObserver on reveal) has something to read.
    expect(getLayer(root)?.style.display).not.toBe('none');
  });
});
