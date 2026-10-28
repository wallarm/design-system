import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';

import { getRuntime, type LiveChar, RUNTIME_KEY } from '../runtime';

const fakeChar = (
  svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
) => {
  const ticks: number[] = [];
  const ch: LiveChar & { ticks: number[] } = {
    svg,
    visible: true,
    rectDirty: false,
    st: 'idle',
    clips: [],
    ticks,
    tick: (now: number) => void ticks.push(now),
  };
  return ch;
};

const fresh = () => {
  delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
};

describe('document runtime', () => {
  beforeEach(fresh);
  afterEach(() => {
    rs.useRealTimers();
    fresh();
  });

  it('is one object per document, shared by separate module instances', async () => {
    const a = getRuntime();
    rs.resetModules();
    const other = await import('../runtime');
    expect(other.getRuntime).not.toBe(getRuntime); // a second module instance, like a second bundled copy
    const b = other.getRuntime();
    expect(b).toBe(a);
    expect(b.queue).toBe(a.queue);
    expect(b.caches).toBe(a.caches);
    // one id counter: the copies never hand out the same id
    const ids = [a.nextId(), b.nextId(), a.nextId(), b.nextId()];
    expect(new Set(ids).size).toBe(4);
  });

  it('holds the bake caches and the worker for the document', async () => {
    const { retain, release, isRetained } = await import('../bake');
    const { bakeInWorker } = await import('../worker');
    const rt = getRuntime();
    retain('layer');
    expect(rt.caches.retain.get('layer')).toBe(1);
    release('layer');
    expect(isRetained('layer')).toBe(false);
    expect(rt.worker).toBe(null);
    const proto = SVGElement.prototype as unknown as { getBBox?: () => DOMRect };
    void bakeInWorker({ d: 'M0 0Z', col: '#000', P: 1, mat: 'felt', region: [0, 0, 1] }).catch(
      () => undefined,
    );
    delete proto.getBBox;
    expect(typeof rt.worker).toBe('function'); // created on first use, one per document
  });

  it('never repeats an id', () => {
    const rt = getRuntime();
    const ids = Array.from({ length: 500 }, () => rt.nextId());
    expect(new Set(ids).size).toBe(500);
    for (const id of ids) expect(id).toMatch(/^[a-z][\w-]*$/);
  });

  it('runs the frame loop only while a character is registered', () => {
    rs.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const rt = getRuntime();
    const svg = document.body.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    );
    const ch = fakeChar(svg);
    rt.register(ch);
    rs.advanceTimersByTime(100);
    expect(ch.ticks.length).toBeGreaterThan(3);
    expect(rs.getTimerCount()).toBe(1); // the next frame
    rt.unregister(ch);
    expect(rs.getTimerCount()).toBe(0);
    const n = ch.ticks.length;
    rs.advanceTimersByTime(100);
    expect(ch.ticks.length).toBe(n);
    svg.remove();
  });

  it('drops a character whose node left the document, and then stops', () => {
    rs.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const rt = getRuntime();
    const ch = fakeChar(); // never connected
    rt.register(ch);
    rs.advanceTimersByTime(50);
    expect(rt.live.has(ch)).toBe(false);
    expect(rs.getTimerCount()).toBe(0);
  });

  it('follows the reduced-motion setting live, and the off switch', () => {
    const listeners: ((e: { matches: boolean }) => void)[] = [];
    const saved = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    try {
      const rt = getRuntime();
      const seen: boolean[] = [];
      const off = rt.subscribe(() => seen.push(rt.motionOn()));
      expect(rt.motion.reduced).toBe(false);
      for (const l of listeners) l({ matches: true });
      expect(rt.motion.reduced).toBe(true);
      for (const l of listeners) l({ matches: false });
      expect(rt.motion.reduced).toBe(false);
      rt.setMotionEnabled(false);
      expect(rt.motion.enabled).toBe(false);
      rt.setMotionEnabled(true);
      off();
      rt.setMotionEnabled(false);
      expect(seen).toEqual([false, true, false, true]);
    } finally {
      window.matchMedia = saved;
    }
  });

  it('stops ticking while motion is off', () => {
    rs.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const rt = getRuntime();
    const svg = document.body.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    );
    const ch = fakeChar(svg);
    rt.register(ch);
    rs.advanceTimersByTime(50);
    rt.setMotionEnabled(false);
    const n = ch.ticks.length;
    rs.advanceTimersByTime(100);
    expect(ch.ticks.length).toBe(n);
    expect(rs.getTimerCount()).toBe(0);
    rt.setMotionEnabled(true);
    rs.advanceTimersByTime(50);
    expect(ch.ticks.length).toBeGreaterThan(n);
    rt.unregister(ch);
    svg.remove();
  });

  it('clamps the first frame after a hidden tab to the first-frame dt', () => {
    rs.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const rt = getRuntime();
    const svg = document.body.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    );
    const dts: number[] = [];
    const ch = { ...fakeChar(svg), tick: (_: number, dt: number) => void dts.push(dt) };
    rt.register(ch);
    rs.advanceTimersByTime(100);
    const hidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    const before = dts.length;
    rs.advanceTimersByTime(30_000);
    expect(dts.length).toBe(before); // no ticks while hidden
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
    rs.advanceTimersByTime(40);
    expect(dts[before]).toBe(0.016);
    expect(Math.max(...dts)).toBeLessThanOrEqual(0.05);
    if (hidden) delete (document as unknown as Record<string, unknown>).hidden;
    rt.unregister(ch);
    svg.remove();
  });

  it('times each frame for the meter', () => {
    rs.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const rt = getRuntime();
    const svg = document.body.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    );
    const ms: number[] = [];
    rt.onFrame = js => void ms.push(js);
    const ch = fakeChar(svg);
    rt.register(ch);
    rs.advanceTimersByTime(100);
    expect(ms.length).toBeGreaterThan(3);
    rt.onFrame = undefined;
    rt.unregister(ch);
    svg.remove();
  });
});

describe('runtime listeners (07 §6.4: start on the first live mount, stop after the last unmount)', () => {
  beforeEach(fresh);
  afterEach(fresh);

  const track = () => {
    const live = new Map<string, number>();
    const ios: string[] = [];
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const key = (t: EventTarget, type: string) =>
      t === window || t === document || t === document.documentElement
        ? `${t === window ? 'window' : t === document ? 'document' : 'html'}:${type}`
        : null;
    EventTarget.prototype.addEventListener = function (
      this: EventTarget,
      type: string,
      ...rest: unknown[]
    ) {
      const k = key(this, type);
      if (k) live.set(k, (live.get(k) ?? 0) + 1);
      return (add as (...a: unknown[]) => void).call(this, type, ...rest);
    } as typeof add;
    EventTarget.prototype.removeEventListener = function (
      this: EventTarget,
      type: string,
      ...rest: unknown[]
    ) {
      const k = key(this, type);
      if (k) live.set(k, (live.get(k) ?? 0) - 1);
      return (remove as (...a: unknown[]) => void).call(this, type, ...rest);
    } as typeof remove;
    const IO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class extends IO {
      constructor(cb: IntersectionObserverCallback, o?: IntersectionObserverInit) {
        super(cb, o);
        ios.push('io');
      }
      disconnect() {
        ios.push('disconnect');
      }
    } as typeof IO;
    const mm: string[] = [];
    const savedMM = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      addEventListener: () => void mm.push(`+${q}`),
      removeEventListener: () => void mm.push(`-${q}`),
    })) as unknown as typeof window.matchMedia;
    return {
      active: () => [...live].filter(([, n]) => n > 0).map(([k]) => k),
      ios,
      mm,
      restore() {
        EventTarget.prototype.addEventListener = add;
        EventTarget.prototype.removeEventListener = remove;
        globalThis.IntersectionObserver = IO;
        window.matchMedia = savedMM;
      },
    };
  };

  it('adds nothing until a character goes live, and removes everything after the last', () => {
    const T = track();
    try {
      const rt = getRuntime();
      rt.nextId();
      expect(T.active()).toEqual([]);
      expect(T.ios).toEqual([]);
      expect(T.mm).toEqual([]);
      const svg = document.body.appendChild(
        document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      );
      const a = fakeChar(svg);
      const b = fakeChar(svg);
      rt.register(a);
      rt.register(b);
      expect(T.active().length).toBeGreaterThan(0);
      expect(T.ios).toEqual(['io']);
      rt.unregister(a);
      expect(T.active().length).toBeGreaterThan(0);
      rt.unregister(b);
      expect(T.active()).toEqual([]);
      expect(T.ios).toEqual(['io', 'disconnect']);
      svg.remove();
    } finally {
      T.restore();
    }
  });

  it('listens to the reduced-motion setting only while subscribed', () => {
    const T = track();
    try {
      const rt = getRuntime();
      const off = rt.subscribe(() => undefined);
      expect(T.mm.filter(x => x.startsWith('+'))).toHaveLength(1);
      off();
      expect(T.mm.filter(x => x.startsWith('-'))).toHaveLength(1);
    } finally {
      T.restore();
    }
  });

  it('bumps the rect epoch on a scroll inside a container (capture)', () => {
    const rt = getRuntime();
    const svg = document.body.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    );
    const ch = fakeChar(svg);
    rt.register(ch);
    const box = document.body.appendChild(document.createElement('div'));
    const e0 = rt.rectEpoch;
    box.dispatchEvent(new Event('scroll')); // scroll events do not bubble
    expect(rt.rectEpoch).toBe(e0 + 1);
    rt.unregister(ch);
    box.remove();
    svg.remove();
  });

  it('has no cursor-follow or occlusion surface (D10)', () => {
    const rt = getRuntime() as unknown as Record<string, unknown>;
    expect('ptr' in rt).toBe(false);
    expect('occluded' in rt).toBe(false);
    expect('fine' in (rt.motion as object)).toBe(false);
  });
});
