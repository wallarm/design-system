import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The hook checks `isClipboardSupported` at module scope, so we must set up
// the clipboard mock before importing the module.
const writeTextMock = vi.fn(() => Promise.resolve());

// Set up clipboard before any module evaluation
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  writable: true,
  configurable: true,
});

describe('useCopyTooltip', () => {
  let useCopyTooltip: typeof import('../useCopyTooltip').useCopyTooltip;

  beforeEach(async () => {
    vi.useFakeTimers();
    writeTextMock.mockClear();
    // Re-import to pick up the clipboard mock for `isClipboardSupported`
    vi.resetModules();
    const mod = await import('../useCopyTooltip');
    useCopyTooltip = mod.useCopyTooltip;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockEvent = { stopPropagation: vi.fn() };

  it('returns initial state', () => {
    const { result } = renderHook(() => useCopyTooltip({ text: 'hello' }));

    expect(result.current.copied).toBe(false);
    expect(result.current.tooltipOpen).toBe(false);
    expect(result.current.isSupported).toBe(true);
  });

  it('sets copied and tooltipOpen after handleCopy', () => {
    const { result } = renderHook(() => useCopyTooltip({ text: 'hello' }));

    act(() => {
      result.current.handleCopy(mockEvent);
    });

    expect(result.current.copied).toBe(true);
    expect(result.current.tooltipOpen).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('hello');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('auto-dismisses tooltipOpen after 2s timeout', () => {
    const { result } = renderHook(() => useCopyTooltip({ text: 'hello' }));

    act(() => {
      result.current.handleCopy(mockEvent);
    });

    expect(result.current.tooltipOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // keepOpen is false after timeout, hovering is false → tooltipOpen false
    expect(result.current.tooltipOpen).toBe(false);
    // copied remains true until hover resets it
    expect(result.current.copied).toBe(true);
  });

  it('resets copied when onTooltipOpenChange is called with true after copy', () => {
    const { result } = renderHook(() => useCopyTooltip({ text: 'hello' }));

    // Copy first
    act(() => {
      result.current.handleCopy(mockEvent);
    });
    expect(result.current.copied).toBe(true);

    // Dismiss tooltip via timeout
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Hover again — should reset copied
    act(() => {
      result.current.onTooltipOpenChange(true);
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.tooltipOpen).toBe(true);
  });

  it('sets tooltipOpen via onTooltipOpenChange for hover', () => {
    const { result } = renderHook(() => useCopyTooltip({ text: 'hello' }));

    act(() => {
      result.current.onTooltipOpenChange(true);
    });
    expect(result.current.tooltipOpen).toBe(true);

    act(() => {
      result.current.onTooltipOpenChange(false);
    });
    expect(result.current.tooltipOpen).toBe(false);
  });

  it('does not copy when enabled is false', () => {
    const { result } = renderHook(() => useCopyTooltip({ text: 'hello', enabled: false }));

    act(() => {
      result.current.handleCopy(mockEvent);
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.tooltipOpen).toBe(false);
    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it('dismisses on pointerdown outside after copy', () => {
    // Need real timers for requestAnimationFrame, but fake for setTimeout
    vi.useRealTimers();

    const { result } = renderHook(() => useCopyTooltip({ text: 'hello' }));

    act(() => {
      result.current.handleCopy(mockEvent);
    });
    expect(result.current.tooltipOpen).toBe(true);

    // Wait for requestAnimationFrame to register the listener
    return new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Simulate pointerdown outside
          act(() => {
            document.dispatchEvent(new Event('pointerdown'));
          });

          expect(result.current.tooltipOpen).toBe(false);
          resolve();
        });
      });
    });
  });

  it('copies updated text when text prop changes', () => {
    const { result, rerender } = renderHook(({ text }) => useCopyTooltip({ text }), {
      initialProps: { text: 'first' },
    });

    rerender({ text: 'second' });

    act(() => {
      result.current.handleCopy(mockEvent);
    });

    expect(writeTextMock).toHaveBeenCalledWith('second');
  });
});
