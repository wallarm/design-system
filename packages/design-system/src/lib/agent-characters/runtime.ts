// The document runtime (07 §6.5, D7): the reference page's page-level state — the frame loop and `LIVE`, the
// behaviour budget `ACT`, the inviter slot `INV`, the rect epoch, the IntersectionObserver, the
// bake queue and caches, the id counter — gathered in one object per document. It sits on
// `globalThis[Symbol.for('wallarm.agent-characters')]`, so every bundled copy of the design system on the page
// (a Module Federation remote inside the host) joins the same loop, budget and caches. It holds DOM nodes and data,
// never React objects. `frame()` is the page's `frame` (reference lines 2003–2007), line for line. No cursor follow
// (D10) and so no pointer tracking; listeners and the observer exist only while a character is live.
import type { Baked, BakeRunner } from './bake';
import { createQueue, Lru } from './queue';

/** Bumped only when the contract below changes. */
export const PROTOCOL = 1;
export const RUNTIME_KEY = Symbol.for('wallarm.agent-characters');

/** What the runtime and other characters read from a live character (the page reads these off `LIVE` members). */
export interface LiveChar {
  svg: Element;
  visible: boolean;
  rectDirty: boolean;
  st: string;
  clips: readonly { act?: number; inv?: number; perk?: number; kind?: string; rel?: number }[];
  tick(now: number, dt: number, beat: boolean): void;
}

export interface Runtime {
  protocol: number;
  /** the page's LIVE */
  live: Set<LiveChar>;
  /** at most `cap` idle behaviours at once on the document, starts at least 700 ms apart */
  act: { last: number; cap: number };
  /** one inviter per document, at least 6 s between invites */
  inv: { last: number; owner: LiveChar | null };
  rectEpoch: number;
  /** reduced: the system setting (followed live while subscribed); enabled: the off switch (P7) */
  motion: { reduced: boolean; enabled: boolean };
  queue: ReturnType<typeof createQueue>;
  caches: {
    /** height fields per outline */
    hc: Lru<Float32Array>;
    /** baked layers; an entry a mounted <image> still shows is never evicted */
    bc: Lru<Baked>;
    retain: Map<string, number>;
    inflight: Map<string, Promise<Baked>>;
    /** region() per outline, and its measuring path */
    reg: Map<string, [number, number, number]>;
    measure: SVGPathElement | null;
  };
  /** the bake worker runner, created on first use */
  worker: BakeRunner | null;
  /** Dev and test timing hook (03 §10.5): the loop's JavaScript per frame, in ms. One slot, not a public API:
   *  only measurement code (tests, the Storybook frame meter) sets it. */
  onFrame?: (jsMs: number) => void;
  motionOn(): boolean;
  setMotionEnabled(on: boolean): void;
  /** called on any change of `motion` */
  subscribe(fn: () => void): () => void;
  register(ch: LiveChar): void;
  unregister(ch: LiveChar): void;
  kick(): void;
  frame(t: number): void;
  nextId(): string;
}

function createRuntime(): Runtime {
  const hasDom = typeof document !== 'undefined';
  const RM =
    hasDom && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  const subs = new Set<() => void>();
  const notify = () => {
    for (const fn of [...subs]) fn();
  };
  let uid = 0;
  let lastT = 0;
  let lastBeat = 0;
  let looping = false;
  let raf = 0;
  const retain = new Map<string, number>();
  const byNode = new WeakMap<Element, LiveChar>();
  const stop = () => {
    looping = false;
    lastT = 0;
    if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
    raf = 0;
  };

  // Document listeners and the IntersectionObserver exist only while a character is live (07 §6.4).
  let io: IntersectionObserver | null = null;
  const bump = () => {
    rt.rectEpoch++;
  };
  const onVisibility = () => {
    lastT = 0;
    lastBeat = 0;
    if (!document.hidden) rt.kick();
  };
  // capture: a scroll inside a container (a list, a drawer) moves the characters too
  const scrollOpts: AddEventListenerOptions = { capture: true, passive: true };
  const attach = () => {
    if (!hasDom) return;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        es => {
          for (const e of es) {
            const c = byNode.get(e.target);
            if (c) {
              c.visible = e.isIntersecting;
              c.rectDirty = true;
              if (e.isIntersecting) rt.kick();
            }
          }
        },
        { rootMargin: '100px' },
      );
    }
    window.addEventListener('scroll', bump, scrollOpts);
    window.addEventListener('resize', bump, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
  };
  const detach = () => {
    stop();
    if (!hasDom) return;
    io?.disconnect();
    io = null;
    window.removeEventListener('scroll', bump, scrollOpts);
    window.removeEventListener('resize', bump);
    document.removeEventListener('visibilitychange', onVisibility);
  };
  const drop = (ch: LiveChar) => {
    rt.live.delete(ch);
    io?.unobserve(ch.svg);
    if (rt.inv.owner === ch) rt.inv.owner = null;
    if (!rt.live.size) detach();
  };
  // The system setting is followed only while someone subscribes; otherwise it is read when asked.
  const onReduced = (e: MediaQueryListEvent) => {
    rt.motion.reduced = e.matches;
    if (rt.motionOn()) rt.kick();
    else stop();
    notify();
  };

  const rt: Runtime = {
    protocol: PROTOCOL,
    live: new Set(),
    act: { last: 0, cap: 2 },
    inv: { last: -1e9, owner: null },
    rectEpoch: 0,
    motion: { reduced: !!RM?.matches, enabled: true },
    queue: createQueue(),
    caches: {
      hc: new Lru<Float32Array>(64),
      bc: new Lru<Baked>(
        256,
        b => URL.revokeObjectURL(b.url),
        k => retain.has(k),
      ),
      retain,
      inflight: new Map(),
      reg: new Map(),
      measure: null,
    },
    worker: null,
    motionOn: () => {
      if (!subs.size && RM) rt.motion.reduced = RM.matches;
      return rt.motion.enabled && !rt.motion.reduced;
    },
    setMotionEnabled(on) {
      if (rt.motion.enabled === on) return;
      rt.motion.enabled = on;
      if (on) rt.kick();
      else stop();
      notify();
    },
    subscribe(fn) {
      if (!subs.size && RM) {
        rt.motion.reduced = RM.matches;
        RM.addEventListener?.('change', onReduced);
      }
      subs.add(fn);
      return () => {
        if (subs.delete(fn) && !subs.size) RM?.removeEventListener?.('change', onReduced);
      };
    },
    register(ch) {
      if (rt.live.has(ch)) return;
      if (!rt.live.size) attach();
      rt.live.add(ch);
      byNode.set(ch.svg, ch);
      io?.observe(ch.svg);
      rt.kick();
    },
    unregister(ch) {
      if (rt.live.has(ch)) drop(ch);
      else if (rt.inv.owner === ch) rt.inv.owner = null;
    },
    /** the loop runs only while a live character is in view */
    kick() {
      if (
        !looping &&
        rt.motionOn() &&
        rt.live.size &&
        typeof requestAnimationFrame === 'function'
      ) {
        looping = true;
        lastT = 0;
        raf = requestAnimationFrame(rt.frame);
      }
    },
    frame(t) {
      raf = 0;
      if (!rt.motionOn()) return stop();
      const t0 = rt.onFrame ? performance.now() : 0;
      const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016);
      lastT = t;
      const beat = t - lastBeat >= 40;
      if (beat) lastBeat = t; // one shared ~20–25 Hz beat, whatever the refresh rate
      let any = false;
      for (const c of rt.live) {
        if (!c.svg.isConnected) {
          drop(c);
          continue;
        }
        if (c.visible) {
          any = true;
          if (!document.hidden) c.tick(t, dt, beat);
        }
      }
      rt.onFrame?.(performance.now() - t0);
      if (any) raf = requestAnimationFrame(rt.frame);
      else stop();
    },
    nextId: () => `k${(++uid).toString(36)}`,
  };
  return rt;
}

/** The document's runtime: the first copy to ask creates it, later copies join it. */
export function getRuntime(): Runtime {
  const g = globalThis as { [RUNTIME_KEY]?: Runtime };
  // ponytail: protocol 1 only. A bump must keep one runtime per document: the newer copy adapts the older
  // registrations instead of starting a second loop (07 §6.5).
  g[RUNTIME_KEY] ??= createRuntime();
  return g[RUNTIME_KEY];
}
