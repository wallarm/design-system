import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { RUNTIME_KEY } from '../../lib/agent-characters/runtime';
import { setAgentMotion } from '../AgentAvatar';
import { WallySkeleton } from '../WallySkeleton';
import { ChatGreeting } from './ChatGreeting';
import { ChatHeaderTitle } from './ChatHeaderTitle';

// WDS-203: Wally as its character in the chat (07 §8 step 4, 05 §3.2).
const fresh = () => {
  delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
};
let observers: {
  cb: IntersectionObserverCallback;
  el: Element | null;
  options?: IntersectionObserverInit;
}[] = [];
const saved = globalThis.IntersectionObserver;
class FakeIO {
  entry: (typeof observers)[number];
  constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.entry = { cb, el: null, options };
    observers.push(this.entry);
  }
  observe(el: Element) {
    this.entry.el = el;
  }
  unobserve() {}
  disconnect() {
    observers = observers.filter(o => o !== this.entry);
  }
  takeRecords() {
    return [];
  }
}
/** The greeting's own observer (the runtime has one for live characters too). */
const enterView = () =>
  act(() => {
    for (const o of observers.filter(x => x.options?.threshold === 0.6))
      o.cb(
        [{ isIntersecting: true, target: o.el } as IntersectionObserverEntry],
        o as unknown as IntersectionObserver,
      );
  });
const advance = (ms: number) =>
  act(() => {
    rs.advanceTimersByTime(ms);
  });

beforeEach(() => {
  fresh();
  observers = [];
  globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver;
  rs.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
    ],
  });
});
afterEach(() => {
  rs.useRealTimers();
  globalThis.IntersectionObserver = saved;
  setAgentMotion(true);
  fresh();
});

describe('Wally glyph in the chat header', () => {
  it('ChatHeaderTitle shows the 24 px Wally glyph, optically aligned, not WallyIcon', () => {
    render(<ChatHeaderTitle data-testid='title' />);
    const title = screen.getByTestId('title');
    const g = title.querySelector('[data-slot="agent-glyph"][data-agent="wally"]');
    expect(g).not.toBeNull();
    expect(g).toHaveAttribute('width', '24');
    expect(g).toHaveAttribute('aria-hidden', 'true');
    expect(g?.getAttribute('class')).toContain('translate-y-[var(--oy)]');
    expect(title.querySelector('[data-slot="wally-icon"]')).toBeNull();
    expect(screen.getByTestId('title--wally')).toBe(g);
  });

  it('WallySkeleton follows the header', () => {
    const { container } = render(<WallySkeleton />);
    expect(container.querySelector('[data-slot="agent-glyph"][data-agent="wally"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="wally-icon"]')).toBeNull();
  });
});

describe('Wally in the empty chat greeting', () => {
  it('shows the live 120 px Wally with the contact shadow and no circle plate', () => {
    render(<ChatGreeting title='Hi' data-testid='greeting' />);
    const root = screen.getByTestId('greeting');
    const a = root.querySelector('[data-slot="agent-avatar"][data-agent="wally"]');
    expect(a).not.toBeNull();
    expect(a).toHaveAttribute('width', '120');
    expect(a).toHaveAttribute('data-live');
    expect(a).toHaveAttribute('aria-hidden', 'true');
    expect(a?.querySelector('[data-part~="shd"]')).not.toBeNull();
    expect(root.querySelector('[data-slot="wally-icon"]')).toBeNull();
    expect(screen.getByTestId('greeting--wally')).toBe(a);
  });

  it('says Hello once, 250 ms after the empty chat comes into view', () => {
    const { container } = render(<ChatGreeting title='Hi' />);
    const state = () => container.querySelector('svg')?.getAttribute('data-state');
    advance(1000);
    expect(state()).toBe('idle');
    enterView();
    advance(249);
    expect(state()).toBe('idle');
    advance(1);
    expect(state()).toBe('hello');
    advance(3000);
    expect(state()).toBe('idle');
    enterView();
    advance(500);
    expect(state()).toBe('idle');
  });

  it('shows the static Wally and no Hello with motion off', () => {
    setAgentMotion(false);
    const { container } = render(<ChatGreeting title='Hi' />);
    const svg = () => container.querySelector('svg');
    enterView();
    advance(400);
    expect(svg()?.getAttribute('data-state')).toBe('idle');
    expect(svg()?.hasAttribute('data-live')).toBe(false);
  });
});
