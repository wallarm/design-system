import { createRef, Profiler, StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, render } from '@testing-library/react';
import { getRuntime, RUNTIME_KEY } from '../../lib/agent-characters/runtime';
import { AgentAvatar } from './AgentAvatar';
import type { AgentAvatarHandle } from './useCharacter';

const fresh = () => {
  delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
};
const advance = (ms: number) =>
  act(() => {
    rs.advanceTimersByTime(ms);
  });
const stateOf = (c: HTMLElement) => c.querySelector('svg')?.getAttribute('data-state');

beforeEach(() => {
  fresh();
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
  fresh();
});

describe('AgentAvatar live', () => {
  it('registers one live character with the runtime and leaves nothing after unmount', () => {
    const { container, unmount } = render(
      <StrictMode>
        <AgentAvatar agent='radar' seed='r1' size={72} live />
      </StrictMode>,
    );
    const rt = getRuntime();
    expect(rt.live.size).toBe(1);
    expect(container.querySelector('svg')?.hasAttribute('data-live')).toBe(true);
    advance(500);
    unmount();
    expect(rt.live.size).toBe(0);
    expect(rs.getTimerCount()).toBe(0);
  });

  it('plays Done in full, then shows the data state and reports the beat', () => {
    const handle = createRef<AgentAvatarHandle>();
    const ended: string[] = [];
    const onBeatEnd = (b: string) => void ended.push(b);
    const { container } = render(
      <AgentAvatar
        agent='mend'
        seed='m1'
        size={72}
        live
        state='working'
        handleRef={handle}
        onBeatEnd={onBeatEnd}
      />,
    );
    advance(100);
    act(() => handle.current?.play('done'));
    expect(stateOf(container)).toBe('done');
    advance(1599);
    expect(ended).toEqual([]);
    expect(stateOf(container)).toBe('done');
    advance(601);
    expect(ended).toEqual(['done']);
    expect(stateOf(container)).toBe('working');
  });

  it('queues a data change during a beat until the beat ends', () => {
    const handle = createRef<AgentAvatarHandle>();
    const { container, rerender } = render(
      <AgentAvatar agent='wally' seed='w1' size={72} live handleRef={handle} />,
    );
    advance(100);
    act(() => handle.current?.play('hello'));
    expect(stateOf(container)).toBe('hello');
    advance(300);
    rerender(
      <AgentAvatar agent='wally' seed='w1' size={72} live handleRef={handle} state='needs' />,
    );
    advance(500);
    expect(stateOf(container)).toBe('hello');
    advance(2000);
    expect(stateOf(container)).toBe('needs');
  });

  it('animates a state change without re-rendering React per frame', () => {
    let commits = 0;
    const onRender = () => {
      commits++;
    };
    const ui = (state: 'idle' | 'working') => (
      <Profiler id='a' onRender={onRender}>
        <AgentAvatar agent='sift' seed='s1' size={72} live state={state} />
      </Profiler>
    );
    const { container, rerender } = render(ui('idle'));
    advance(1000);
    const before = commits;
    rerender(ui('working'));
    const transform = container.querySelector('[data-part~="fig"]')?.getAttribute('transform');
    advance(2000);
    expect(commits - before).toBe(1); // the rerender itself, then only the engine
    expect(stateOf(container)).toBe('working');
    expect(container.querySelector('[data-part~="fig"]')?.getAttribute('transform')).not.toBe(
      transform,
    );
  });

  it('plays the activation landing for Not set up → On duty', () => {
    const { container, rerender } = render(
      <AgentAvatar agent='radar' seed='r2' size={72} live state='box' />,
    );
    advance(200);
    rerender(<AgentAvatar agent='radar' seed='r2' size={72} live state='idle' />);
    expect(stateOf(container)).toBe('power');
    advance(1100);
    expect(stateOf(container)).toBe('power');
    advance(100);
    expect(stateOf(container)).toBe('idle');
  });

  it('is static and unregistered under reduced motion, and follows the setting back', () => {
    const listeners: ((e: { matches: boolean }) => void)[] = [];
    let reduced = true;
    const saved = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: q.includes('reduce') ? reduced : false,
      media: q,
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    try {
      const { container } = render(<AgentAvatar agent='trim' seed='t1' size={72} live />);
      const rt = getRuntime();
      expect(rt.live.size).toBe(0);
      expect(container.querySelector('svg')?.hasAttribute('data-live')).toBe(false);
      reduced = false;
      act(() => {
        for (const l of listeners) l({ matches: false });
      });
      expect(rt.live.size).toBe(1);
      act(() => {
        for (const l of listeners) l({ matches: true });
      });
      expect(rt.live.size).toBe(0);
      expect(rs.getTimerCount()).toBe(0);
    } finally {
      window.matchMedia = saved;
    }
  });

  it('plays a static beat for its static length when not live', () => {
    const handle = createRef<AgentAvatarHandle>();
    const ended: string[] = [];
    const onBeatEnd = (b: string) => void ended.push(b);
    const { container } = render(
      <AgentAvatar agent='probe' seed='p1' size={48} handleRef={handle} onBeatEnd={onBeatEnd} />,
    );
    act(() => handle.current?.play('hello'));
    expect(stateOf(container)).toBe('hello');
    advance(1200);
    expect(ended).toEqual(['hello']);
    expect(stateOf(container)).toBe('idle');
  });
});
