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

// Capture ResizeObserver instances so tests can simulate the resize a real
// browser fires when a `display:none` ancestor is shown again — the setup-file
// mock is a no-op, so the reveal path needs manual firing.
const resizeObservers = new Set<CapturingResizeObserver>();
class CapturingResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {
    resizeObservers.add(this);
  }
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  disconnect() {
    resizeObservers.delete(this);
  }
  fire() {
    this.callback([], this as unknown as ResizeObserver);
  }
}
global.ResizeObserver = CapturingResizeObserver as unknown as typeof ResizeObserver;

// The observer coalesces into requestAnimationFrame; jsdom has no frames, so
// emulate one with a macrotask that flushScheduler() awaits.
global.requestAnimationFrame = (cb: FrameRequestCallback) =>
  setTimeout(() => cb(0), 0) as unknown as number;
global.cancelAnimationFrame = (id: number) => clearTimeout(id);

const fireResize = () =>
  act(async () => {
    for (const observer of resizeObservers) observer.fire();
  });

const renderItem = (item: string): ReactElement => <span>{item}</span>;

const Harness = ({ items }: { items: string[] }) => {
  const { containerRef, visibleCount, MeasurementContainer } = useOverflowItems({
    items,
    renderItem,
  });
  return (
    <div data-testid='root' ref={containerRef}>
      <span data-testid='visible-count'>{visibleCount}</span>
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

  it('recovers the collapsed split after hide → re-measure while hidden → reveal', async () => {
    // Container 200, three 200px items, 60px indicator fallback: only 1 fits.
    const { getByTestId, rerender } = render(<Harness items={['a', 'b', 'c']} />);
    await flushScheduler();
    expect(getByTestId('visible-count').textContent).toBe('1');

    // Hide via a display:none ancestor: every offsetWidth read is 0. A re-render
    // with a fresh items identity forces a re-measure in that state — the exact
    // condition that used to poison the width cache with zeros (AS-1071).
    mockOffsetWidth = 0;
    rerender(<Harness items={['a', 'b', 'c'].slice()} />);
    await flushScheduler();
    // Deferred: the split is untouched, the layer awaits the real measurement.
    expect(getByTestId('visible-count').textContent).toBe('1');

    // Reveal: only the ResizeObserver fires (no React render). The deferred
    // measurement must land and keep the collapsed split — not expand to all 3.
    mockOffsetWidth = 200;
    await fireResize();
    await flushScheduler();

    expect(getByTestId('visible-count').textContent).toBe('1');
    expect(getLayer(getByTestId('root'))?.style.display).toBe('none');
  });
});
