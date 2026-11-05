// The document runtime (07 §6.5, D7): the reference page's page-level state — the frame loop and `LIVE`, the
// behaviour budget `ACT`, the inviter slot `INV`, the pointer `PTR`, the rect epoch, the IntersectionObserver, the
// bake queue and caches, the id counter — gathered in one object per document. It sits on
// `globalThis[Symbol.for('wallarm.agent-characters')]`, so every bundled copy of the design system on the page
// (a Module Federation remote inside the host) joins the same loop, budget and caches. It holds DOM nodes and data,
// never React objects. `frame()` is the page's `frame` (reference lines 2003–2007), line for line.
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
  ptr: { x: number; y: number; t: number };
  rectEpoch: number;
  /** reduced: the system setting, followed live; enabled: the off switch (P7) */
  motion: { reduced: boolean; enabled: boolean; fine: boolean };
  /** containers under an opaque layer (a drawer): characters inside them do not tick */
  occluded: Set<Element>;
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
  /** dev and test timing hook (03 §10.5): the loop's JavaScript per frame, in ms */
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
  const mq = (q: string) =>
    hasDom && typeof window.matchMedia === 'function' ? window.matchMedia(q) : null;
  const RM = mq('(prefers-reduced-motion: reduce)');
  const FINE = mq('(hover:hover) and (pointer:fine)');
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
  const io =
    hasDom && typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
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
        )
      : null;
  const byNode = new WeakMap<Element, LiveChar>();
  const stop = () => {
    looping = false;
    lastT = 0;
    if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
    raf = 0;
  };
  const occludedNode = (n: Element) => {
    for (const o of rt.occluded) if (o.contains(n)) return true;
    return false;
  };

  const rt: Runtime = {
    protocol: PROTOCOL,
    live: new Set(),
    act: { last: 0, cap: 2 },
    inv: { last: -1e9, owner: null },
    ptr: { x: 0, y: 0, t: 0 },
    rectEpoch: 0,
    motion: { reduced: !!RM?.matches, enabled: true, fine: !!FINE?.matches },
    occluded: new Set(),
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
    motionOn: () => rt.motion.enabled && !rt.motion.reduced,
    setMotionEnabled(on) {
      if (rt.motion.enabled === on) return;
      rt.motion.enabled = on;
      if (on) rt.kick();
      else stop();
      notify();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    register(ch) {
      rt.live.add(ch);
      byNode.set(ch.svg, ch);
      io?.observe(ch.svg);
      rt.kick();
    },
    unregister(ch) {
      rt.live.delete(ch);
      io?.unobserve(ch.svg);
      if (rt.inv.owner === ch) rt.inv.owner = null;
      if (!rt.live.size) stop();
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
          rt.live.delete(c);
          io?.unobserve(c.svg);
          continue;
        }
        if (c.visible && !occludedNode(c.svg)) {
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

  if (hasDom) {
    RM?.addEventListener?.('change', e => {
      rt.motion.reduced = e.matches;
      if (rt.motionOn()) rt.kick();
      else stop();
      notify();
    });
    FINE?.addEventListener?.('change', e => {
      rt.motion.fine = e.matches;
    });
    document.addEventListener(
      'pointermove',
      e => {
        rt.ptr.x = e.clientX;
        rt.ptr.y = e.clientY;
        rt.ptr.t = performance.now();
      },
      { passive: true },
    );
    document.documentElement.addEventListener('pointerleave', () => {
      rt.ptr.t = 0;
    });
    window.addEventListener('blur', () => {
      rt.ptr.t = 0;
    });
    const bump = () => {
      rt.rectEpoch++;
    };
    window.addEventListener('scroll', bump, { passive: true });
    window.addEventListener('resize', bump, { passive: true });
    document.addEventListener('visibilitychange', () => {
      lastT = 0;
      lastBeat = 0;
      if (!document.hidden) rt.kick();
    });
  }
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
