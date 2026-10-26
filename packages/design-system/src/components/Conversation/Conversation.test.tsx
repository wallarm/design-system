import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chat } from '../Chat/Chat';
import { Conversation, type ConversationProps } from './Conversation';
import { ConversationContent } from './ConversationContent';
import { ConversationEmptyState } from './ConversationEmptyState';
import { ConversationScrollButton } from './ConversationScrollButton';

// Layout jsdom lacks: one shared geometry for every element (only the log reads it).
const geo = { scrollHeight: 1000, clientHeight: 200, scrollTop: 0 };
const maxTop = () => Math.max(0, geo.scrollHeight - geo.clientHeight);
const originals = new Map<string, PropertyDescriptor | undefined>();

// A capturing ResizeObserver: the global one from rstest.setup.ts is a no-op.
let resizeCallbacks: ResizeObserverCallback[] = [];
class CapturingResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallbacks.push(callback);
  }
  // test double
  observe() {}
  // test double
  unobserve() {}
  disconnect() {
    resizeCallbacks = [];
  }
}
const originalResizeObserver = global.ResizeObserver;

// A fake rAF clock: frames run only when a test steps them, 60fps.
const FRAME_MS = 1000 / 60;
let frameQueue = new Map<number, FrameRequestCallback>();
let frameId = 0;
let clock = 0;
const originalRaf = global.requestAnimationFrame;
const originalCaf = global.cancelAnimationFrame;

/** Runs one animation frame; returns the log's scrollTop after it. */
const frame = () => {
  clock += FRAME_MS;
  const callbacks = [...frameQueue.values()];
  frameQueue = new Map();
  act(() => {
    for (const callback of callbacks) callback(clock);
  });
  return geo.scrollTop;
};
/** Runs frames until the animator idles. */
const settle = () => {
  for (let i = 0; i < 1000 && frameQueue.size; i++) frame();
};

const notify = () => {
  for (const callback of resizeCallbacks) {
    callback([], {} as ResizeObserver);
  }
};
/** Content or viewport changed; the animator runs to the end. */
const resize = (next: Partial<typeof geo>) => {
  act(() => {
    Object.assign(geo, next);
    notify();
  });
  settle();
};

const log = () => screen.getByTestId('chat--body');
const button = () => screen.queryByTestId('chat--scroll-button');

/** The reader scrolls to `top` (jsdom never fires scroll on its own). */
const scrollTo = (top: number) => {
  geo.scrollTop = top;
  fireEvent.scroll(log());
};

beforeEach(() => {
  Object.assign(geo, { scrollHeight: 1000, clientHeight: 200, scrollTop: 0 });
  resizeCallbacks = [];
  frameQueue = new Map();
  clock = 0;
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    frameQueue.set(++frameId, callback);
    return frameId;
  };
  global.cancelAnimationFrame = (id: number) => {
    frameQueue.delete(id);
  };
  global.ResizeObserver = CapturingResizeObserver as unknown as typeof ResizeObserver;
  for (const key of ['scrollHeight', 'clientHeight', 'scrollTop']) {
    originals.set(key, Object.getOwnPropertyDescriptor(Element.prototype, key));
  }
  Object.defineProperty(Element.prototype, 'scrollHeight', {
    configurable: true,
    get: () => geo.scrollHeight,
  });
  Object.defineProperty(Element.prototype, 'clientHeight', {
    configurable: true,
    get: () => geo.clientHeight,
  });
  Object.defineProperty(Element.prototype, 'scrollTop', {
    configurable: true,
    get: () => geo.scrollTop,
    // Like a browser: a position change fires scroll.
    set(this: Element, value: number) {
      const next = Math.min(Math.max(0, value), maxTop());
      if (next === geo.scrollTop) return;
      geo.scrollTop = next;
      this.dispatchEvent(new Event('scroll'));
    },
  });
});

afterEach(() => {
  global.ResizeObserver = originalResizeObserver;
  global.requestAnimationFrame = originalRaf;
  global.cancelAnimationFrame = originalCaf;
  for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(Element.prototype, key, descriptor);
    else delete (Element.prototype as unknown as Record<string, unknown>)[key];
  }
  rs.restoreAllMocks();
});

const Harness = ({ children, ...props }: ConversationProps & { children?: ReactNode }) => (
  <Chat data-testid='chat'>
    <Conversation {...props}>
      <ConversationContent>
        <p>History</p>
        <input data-testid='inline-input' aria-label='Inline' />
        {children}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  </Chat>
);

describe('Conversation — pinning', () => {
  it('pins the log to the bottom on mount and hides the button', () => {
    render(<Harness />);
    expect(geo.scrollTop).toBe(800);
    expect(button()).not.toBeInTheDocument();
  });

  it('re-pins when the content grows while stuck', () => {
    render(<Harness />);
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
    expect(button()).not.toBeInTheDocument();
  });

  it('re-pins when the scroll element shrinks while stuck (the footer grew)', () => {
    render(<Harness />);
    resize({ clientHeight: 100 });
    expect(geo.scrollTop).toBe(900);
  });
});

describe('Conversation — unsticking', () => {
  it('stops following after a wheel-up and shows the named button', () => {
    render(<Harness />);
    fireEvent.wheel(log(), { deltaY: -50 });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(800);
    expect(screen.getByRole('button', { name: 'Scroll to latest message' })).toBe(button());
  });

  it('stops following after any decrease in scrollTop', () => {
    render(<Harness />);
    scrollTo(790);
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(790);
    expect(button()).toBeInTheDocument();
  });

  it('ignores a sub-pixel decrease in scrollTop (a smooth scroll landing short)', () => {
    render(<Harness />);
    scrollTo(799.5);
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });

  it('does not unstick on a touch drag that scrolls down at the bottom', () => {
    render(<Harness />);
    fireEvent.touchStart(log(), { touches: [{ clientY: 300 }] });
    fireEvent.touchMove(log(), { touches: [{ clientY: 200 }] });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });

  it('unsticks on a touch drag that scrolls up', () => {
    render(<Harness />);
    fireEvent.touchStart(log(), { touches: [{ clientY: 200 }] });
    fireEvent.touchMove(log(), { touches: [{ clientY: 300 }] });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(800);
  });

  it('re-sticks when the reader scrolls back to within the threshold', () => {
    render(<Harness />);
    scrollTo(300);
    expect(button()).toBeInTheDocument();
    scrollTo(750); // 1000 - 750 - 200 = 50 ≤ 70
    expect(button()).not.toBeInTheDocument();
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });

  it('does not unstick when a content shrink clamps scrollTop', () => {
    render(<Harness />);
    geo.scrollHeight = 600;
    scrollTo(400); // the clamp after a fold
    resize({ scrollHeight: 900 });
    expect(geo.scrollTop).toBe(700);
  });

  it('does not unstick when a taller viewport clamps scrollTop to the end', () => {
    render(<Harness />);
    geo.clientHeight = 300; // the docked card shrank; the scroll event beats the resize callback
    scrollTo(700);
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1100);
  });

  it('ignores a wheel-up inside a nested scroller that can still scroll up', () => {
    render(<Harness />);
    const code = screen.getByText('History');
    Object.defineProperty(code, 'scrollTop', { configurable: true, value: 40 });
    fireEvent.wheel(code, { deltaY: -50 });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });

  it('ignores a mostly horizontal wheel', () => {
    render(<Harness />);
    fireEvent.wheel(log(), { deltaX: -80, deltaY: -5 });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });

  it('ignores a scroll-up key a widget in the log handled', () => {
    render(
      <Harness>
        <button type='button' data-testid='menu-trigger' onKeyDown={e => e.preventDefault()}>
          Menu
        </button>
      </Harness>,
    );
    fireEvent.keyDown(screen.getByTestId('menu-trigger'), { key: 'ArrowUp' });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });

  it('ignores ArrowUp pressed inside an input in the log', () => {
    render(<Harness />);
    fireEvent.keyDown(screen.getByTestId('inline-input'), { key: 'ArrowUp' });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });

  it('unsticks on ArrowUp pressed on the log itself', () => {
    render(<Harness />);
    fireEvent.keyDown(log(), { key: 'ArrowUp' });
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(800);
  });

  it('does not pin while text inside the log is selected', () => {
    render(<Harness />);
    const selection = document.getSelection();
    selection?.selectAllChildren(screen.getByText('History'));
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(800);
    selection?.removeAllRanges();
  });

  it('does not animate for autoScrollKey on mount', () => {
    render(<Harness autoScrollKey='u1' />);
    expect(geo.scrollTop).toBe(800);
    expect(frameQueue.size).toBe(0);
  });

  it('re-sticks and glides to the end when autoScrollKey changes', () => {
    const { rerender } = render(<Harness autoScrollKey='u1' />);
    scrollTo(300);
    rerender(<Harness autoScrollKey='u2' />);
    expect(frame()).toBeGreaterThan(300);
    settle();
    expect(geo.scrollTop).toBe(800);
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(1200);
  });
});

describe('ConversationScrollButton', () => {
  it('floats via a wrapper, never positions the Button itself (hover overlay sets position: relative)', () => {
    render(<Harness />);
    scrollTo(300);
    const btn = button() as HTMLElement;
    expect(btn.className).not.toMatch(/\babsolute\b/);
    expect(btn.parentElement).toHaveAttribute('data-slot', 'conversation-scroll-button-anchor');
    expect(btn.parentElement?.className).toMatch(/\babsolute\b/);
  });

  it('glides to the bottom and moves focus to the end of the log', async () => {
    render(<Harness />);
    scrollTo(300);
    await userEvent.click(button() as HTMLElement);
    expect(screen.getByTestId('chat--end')).toHaveFocus();
    expect(geo.scrollTop).toBe(300); // nothing jumps on click
    settle();
    expect(geo.scrollTop).toBe(800);
    expect(button()).not.toBeInTheDocument();
  });

  it('sends the next Tab past the thread, not back to its first message', async () => {
    render(
      <Chat data-testid='chat'>
        <Conversation>
          <ConversationContent>
            <button type='button'>Copy oldest</button>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <textarea aria-label='Message' />
      </Chat>,
    );
    scrollTo(300);
    await userEvent.click(button() as HTMLElement);
    settle(); // the glide lands; the button unmounts
    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus();
  });

  it("runs the consumer's onClick first; preventDefault cancels the scroll", async () => {
    const onClick = rs.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Chat data-testid='chat'>
        <Conversation>
          <ConversationContent />
          <ConversationScrollButton onClick={onClick} />
        </Conversation>
      </Chat>,
    );
    scrollTo(300);
    await userEvent.click(button() as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);
    settle();
    expect(geo.scrollTop).toBe(300);
  });

  it('jumps instantly under prefers-reduced-motion', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
    })) as unknown as typeof window.matchMedia;
    try {
      render(<Harness />);
      scrollTo(300);
      await userEvent.click(button() as HTMLElement);
      expect(geo.scrollTop).toBe(800);
      act(() => {
        geo.scrollHeight = 1400;
        notify();
      });
      expect(geo.scrollTop).toBe(1200); // streaming follow jumps too
      expect(frameQueue.size).toBe(0);
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('Conversation — smooth follow (one rAF animator)', () => {
  /** Runs frames until idle, growing the content by `step`px every `every` frames `times` times. */
  const sample = (step: number, every: number, times: number) => {
    const tops = [geo.scrollTop];
    for (let i = 0; i < 1000 && (frameQueue.size || i < every * times); i++) {
      if (i % every === 0 && i < every * times) {
        act(() => {
          geo.scrollHeight += step;
          notify();
        });
      }
      tops.push(frame());
    }
    return tops;
  };
  const deltas = (tops: number[]) => tops.slice(1).map((top, i) => top - (tops[i] ?? 0));
  const MAX_FRAME_JUMP = 50; // 3px/ms at 60fps

  it('spreads a streamed line over several frames instead of one jump', () => {
    render(<Harness />);
    act(() => {
      geo.scrollHeight += 20;
      notify();
    });
    expect(geo.scrollTop).toBe(800); // nothing moves before the next frame
    const first = frame();
    expect(first).toBeGreaterThan(800);
    expect(first).toBeLessThan(820);
    settle();
    expect(geo.scrollTop).toBe(820);
  });

  it('follows a growing answer monotonically, without big jumps, and lands exactly', () => {
    render(<Harness />);
    const tops = sample(20, 3, 40);
    expect(deltas(tops).every(delta => delta >= 0)).toBe(true);
    expect(Math.max(...deltas(tops))).toBeLessThanOrEqual(MAX_FRAME_JUMP);
    expect(geo.scrollTop).toBe(maxTop());
  });

  it('glides from far up via the button while the answer keeps growing, with no end snap', async () => {
    render(<Harness />);
    act(() => {
      geo.scrollHeight = 4000;
      notify();
    });
    scrollTo(0);
    settle();
    await userEvent.click(button() as HTMLElement);
    const tops = sample(20, 4, 30);
    expect(deltas(tops).every(delta => delta >= 0)).toBe(true);
    expect(Math.max(...deltas(tops))).toBeLessThanOrEqual(MAX_FRAME_JUMP);
    expect(geo.scrollTop).toBe(maxTop());
    expect(button()).not.toBeInTheDocument();
  });

  it('never shows the button while following a chunk taller than the threshold', () => {
    render(<Harness />);
    act(() => {
      geo.scrollHeight += 400;
      notify();
    });
    expect(button()).not.toBeInTheDocument();
    for (let i = 0; i < 1000 && frameQueue.size; i++) {
      frame();
      expect(button()).not.toBeInTheDocument();
    }
    expect(geo.scrollTop).toBe(maxTop());
  });

  it('cancels at once on a wheel-up mid-glide', async () => {
    render(<Harness />);
    scrollTo(0);
    await userEvent.click(button() as HTMLElement);
    frame();
    frame();
    const top = frame();
    fireEvent.wheel(log(), { deltaY: -50 });
    expect(frameQueue.size).toBe(0);
    resize({ scrollHeight: 1400 });
    expect(geo.scrollTop).toBe(top);
  });

  it('cancels the pending frame on unmount', () => {
    const { unmount } = render(<Harness />);
    act(() => {
      geo.scrollHeight += 100;
      notify();
    });
    expect(frameQueue.size).toBe(1);
    unmount();
    expect(frameQueue.size).toBe(0);
  });
});

describe('Conversation — test ids and errors', () => {
  it('stays transparent in the cascade inside <Chat data-testid="chat">', () => {
    render(
      <Chat data-testid='chat'>
        <Conversation>
          <ConversationContent>
            <ConversationEmptyState />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </Chat>,
    );
    expect(log()).toHaveAttribute('data-slot', 'chat-body');
    expect(log()).toHaveAttribute('role', 'log');
    expect(log()).toHaveAttribute('tabindex', '-1');
    expect(log().parentElement).toHaveAttribute('data-slot', 'conversation');
    expect(log().parentElement).not.toHaveAttribute('data-testid');
    expect(screen.getByTestId('chat--empty-state')).toHaveAttribute(
      'data-slot',
      'conversation-empty-state',
    );
    scrollTo(300);
    expect(button()).toHaveAttribute('data-slot', 'conversation-scroll-button');
  });

  it('gives the root an id only when passed, and cascades it', () => {
    render(
      <Conversation data-testid='conv'>
        <ConversationContent tabIndex={0} />
      </Conversation>,
    );
    expect(screen.getByTestId('conv')).toHaveAttribute('data-slot', 'conversation');
    expect(screen.getByTestId('conv--body')).toHaveAttribute('tabindex', '0');
  });

  it('renders the title of ConversationEmptyState, with a default', () => {
    const { rerender } = render(
      <Conversation data-testid='conv'>
        <ConversationEmptyState />
      </Conversation>,
    );
    expect(screen.getByRole('heading', { name: 'How can I help you today?' })).toBeInTheDocument();
    rerender(
      <Conversation data-testid='conv'>
        <ConversationEmptyState title='Ask about attacks' />
      </Conversation>,
    );
    expect(screen.getByRole('heading', { name: 'Ask about attacks' })).toBeInTheDocument();
  });

  it('throws outside a Conversation', () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ConversationScrollButton />)).toThrow('inside <Conversation>');
    expect(() => render(<ConversationContent />)).toThrow('inside <Conversation>');
  });
});
