import { createRef, Profiler, StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, render } from '@testing-library/react';
import { getRuntime, RUNTIME_KEY } from '../../lib/agent-characters/runtime';
import { AgentAvatar } from './AgentAvatar';
import { AgentAvatarGroup } from './AgentAvatarGroup';
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

type Clip = { act?: number; inv?: number; rel?: number; t0: number };
const clipsOf = () => [...getRuntime().live].map(c => c.clips as readonly Clip[]);

describe('AgentAvatar idle life, setup states and coverage (WDS-202)', () => {
  it('runs at most two idle behaviours at once across the document, starts at least 700 ms apart', () => {
    render(
      <AgentAvatarGroup>
        <AgentAvatar agent='radar' seed='a' size={72} live />
        <AgentAvatar agent='wally' seed='b' size={72} live />
        <AgentAvatar agent='trim' seed='c' size={72} live />
        <AgentAvatar agent='sift' seed='d' size={120} live />
        <AgentAvatar agent='probe' seed='e' size={120} live />
      </AgentAvatarGroup>,
    );
    const rt = getRuntime();
    const seen = new Set<Clip>();
    const starts: number[] = [];
    let most = 0;
    rt.onFrame = () => {
      let running = 0;
      for (const cs of clipsOf())
        for (const k of cs)
          if (k.act && !k.rel) {
            running++;
            if (!seen.has(k)) {
              seen.add(k);
              starts.push(k.t0);
            }
          }
      most = Math.max(most, running);
    };
    advance(120_000);
    rt.onFrame = undefined;
    expect(starts.length).toBeGreaterThan(20);
    expect(most).toBe(2);
    starts.sort((a, b) => a - b);
    for (let i = 1; i < starts.length; i++)
      expect((starts[i] as number) - (starts[i - 1] as number)).toBeGreaterThanOrEqual(700);
  });

  it('lets one agent invite at a time, glancing at the cue', () => {
    const cueRef = createRef<HTMLButtonElement>();
    const Inviting = () => (
      <div>
        <AgentAvatar agent='mend' seed='i1' size={72} live state='invite' cueRef={cueRef} />
        <AgentAvatar agent='sift' seed='i2' size={72} live state='invite' cueRef={cueRef} />
        <button ref={cueRef} type='button'>
          Set up
        </button>
      </div>
    );
    render(<Inviting />);
    const cue = cueRef.current as HTMLButtonElement;
    cue.getBoundingClientRect = () =>
      ({ left: 300, top: 200, width: 96, height: 32, right: 396, bottom: 232 }) as DOMRect;
    const rt = getRuntime();
    const inviters = new Set<unknown>();
    let invites = 0;
    const seen = new Set<Clip>();
    rt.onFrame = () => {
      for (const c of rt.live)
        for (const k of c.clips as readonly Clip[])
          if (k.inv && !seen.has(k)) {
            seen.add(k);
            inviters.add(c);
            invites++;
          }
    };
    advance(40_000);
    rt.onFrame = undefined;
    expect(invites).toBeGreaterThanOrEqual(2);
    expect(inviters.size).toBe(1);
  });

  it('Cover all: Done at 360 ms, no grey after 480 ms, then the data state', () => {
    const handle = createRef<AgentAvatarHandle>();
    const { container } = render(
      <AgentAvatar
        agent='radar'
        seed='c1'
        size={72}
        live
        hasApplications
        coverage='partial'
        handleRef={handle}
      />,
    );
    const svg = container.querySelector('svg') as SVGSVGElement;
    advance(500);
    expect(svg.hasAttribute('data-ghosting')).toBe(true);
    act(() => handle.current?.coverAll());
    advance(350);
    expect(stateOf(container)).toBe('idle');
    advance(20);
    expect(stateOf(container)).toBe('done');
    advance(95); // 465 ms: the line is still travelling
    expect(svg.hasAttribute('data-ghosting')).toBe(true);
    advance(35); // 500 ms
    expect(svg.hasAttribute('data-ghosting')).toBe(false);
    advance(2500);
    expect(stateOf(container)).toBe('idle');
  });

  it('follows hover and focus on the cue for the crown', () => {
    const cueRef = createRef<HTMLButtonElement>();
    const { container } = render(
      <div>
        <AgentAvatar
          agent='sift'
          seed='h1'
          size={72}
          live
          hasApplications
          coverage='partial'
          cueRef={cueRef}
        />
        <button ref={cueRef} type='button'>
          Cover all
        </button>
      </div>,
    );
    const veilr = container.querySelector('[data-part~="veilr"]') as Element;
    advance(500);
    const rest = Number(veilr.getAttribute('height'));
    act(() => {
      cueRef.current?.dispatchEvent(new Event('focusin', { bubbles: true }));
    });
    advance(1500);
    const up = Number(veilr.getAttribute('height'));
    expect(up).toBeLessThan(rest - 5); // the line rose 35% of the crown
    act(() => {
      cueRef.current?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });
    advance(2500);
    expect(Number(veilr.getAttribute('height'))).toBeCloseTo(rest, 0);
  });

  it('never lands on mount: a card that mounts active draws its state at once', () => {
    const { container } = render(
      <AgentAvatar agent='radar' seed='m1' size={72} live state='idle' />,
    );
    expect(stateOf(container)).toBe('idle');
    advance(50);
    expect(stateOf(container)).toBe('idle');
  });
});
