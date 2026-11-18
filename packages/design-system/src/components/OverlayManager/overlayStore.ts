import type { InternalOverlayDefinition } from './defineOverlay';
import type { ErasedOverlayComponent, OverlayCloseKey } from './types';

/** How long a closed instance waits for its root's exit signal before it is dropped anyway. */
export const REMOVE_FALLBACK_MS = 1000;

export interface OverlayInstance {
  readonly id: number;
  readonly Component: ErasedOverlayComponent;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly open: boolean;
}

export interface OverlayStore {
  subscribe: (listener: () => void) => () => void;
  /** Same array reference until something changes (useSyncExternalStore). */
  getSnapshot: () => readonly OverlayInstance[];
  open: (definition: InternalOverlayDefinition, payload?: object) => Promise<unknown>;
  /** Settles with `result` (the first settle wins), sets `open: false` and starts the removal fallback. */
  close: (id: number, result?: unknown) => void;
  /** Drops the instance after its exit and clears its fallback timer. */
  remove: (id: number) => void;
  /** Render error: settles `undefined` if still pending, drops the instance, calls onError. */
  fail: (id: number, error: unknown) => void;
  /** The first call records the key; a different key sweeps every instance created before it. */
  setCloseKey: (key: OverlayCloseKey) => void;
  setOnError: (onError: (error: unknown) => void) => void;
  /** Reports through this store's current onError: a nested provider without its own reports here. */
  reportError: (error: unknown) => void;
  /**
   * Provider mounted or revealed, including the re-run of a StrictMode replay. Cancels a pending
   * `release`. After a detach (an `<Activity>` reveal), drops the settled instances a microtask
   * later.
   */
  attach: () => void;
  /**
   * Provider's passive cleanup: detaches one microtask later unless `attach` runs first. A
   * StrictMode replay re-attaches synchronously, so only a real unmount detaches.
   */
  release: () => void;
  /**
   * Settles everything `undefined`, and later open() calls resolve `undefined` at once. The
   * snapshot keeps its instances until a re-attach drops them.
   */
  detach: () => void;
}

/** An open() whose code is still loading. It stays out of the snapshot until the load succeeds. */
interface Pending {
  readonly definition: InternalOverlayDefinition;
  readonly payload: Readonly<Record<string, unknown>>;
  /** The promise's `resolve`, so only the first call has an effect. */
  readonly settle: (result: unknown) => void;
}

/** What the store keeps beside an instance of the snapshot. */
interface Live {
  readonly settle: (result: unknown) => void;
  fallbackTimer?: ReturnType<typeof setTimeout>;
}

export const reportOverlayError = (error: unknown) => {
  if (typeof reportError === 'function') {
    reportError(error);
    return;
  }
  // biome-ignore lint/suspicious/noConsole: no reportError in this environment
  console.error(error);
};

export const createOverlayStore = (): OverlayStore => {
  let lastId = 0;
  let instances: readonly OverlayInstance[] = [];
  const pending = new Map<number, Pending>();
  const live = new Map<number, Live>();
  const listeners = new Set<() => void>();
  let onError = reportOverlayError;
  let recordedKey: { value: OverlayCloseKey } | undefined;
  let detached = false;
  /** Bumped by every attach, so a release can tell whether one ran after it. */
  let attachCount = 0;

  const emit = () => {
    for (const listener of [...listeners]) listener();
  };

  /** Forgets an instance without notifying. */
  const drop = (id: number) => {
    clearTimeout(live.get(id)?.fallbackTimer);
    live.delete(id);
    instances = instances.filter(instance => instance.id !== id);
  };

  const remove = (id: number) => {
    const entry = live.get(id);
    if (!entry) return;
    entry.settle(undefined);
    drop(id);
    emit();
  };

  /**
   * Starts an open instance's exit without notifying, and returns the call that settles it, or
   * undefined when there was nothing to close. Callers emit first and settle after: a caller that
   * awaits open() and closes the overlay below then lands its close in a later commit, so the
   * focus traps unwind top-down, as with nested overlays.
   */
  const startClosing = (id: number) => {
    const entry = live.get(id);
    if (!entry || !instances.some(instance => instance.id === id && instance.open)) return;
    entry.fallbackTimer = setTimeout(() => remove(id), REMOVE_FALLBACK_MS);
    instances = instances.map(instance =>
      instance.id === id ? { ...instance, open: false } : instance,
    );
    return entry.settle;
  };

  const settlePending = () => {
    for (const entry of pending.values()) entry.settle(undefined);
    pending.clear();
  };

  const insert = (id: number, Component: ErasedOverlayComponent) => {
    const entry = pending.get(id);
    if (!entry) return; // replaced, swept or detached while the code was loading
    pending.delete(id);
    live.set(id, { settle: entry.settle });
    instances = [...instances, { id, Component, payload: entry.payload, open: true }];
    emit();
  };

  const failLoad = (id: number, error: unknown) => {
    const entry = pending.get(id);
    if (!entry) return; // nobody waits for it any more
    pending.delete(id);
    entry.settle(undefined);
    onError(error);
  };

  const detach = () => {
    detached = true;
    settlePending();
    for (const entry of live.values()) {
      entry.settle(undefined);
      clearTimeout(entry.fallbackTimer);
    }
    live.clear();
    // The snapshot stays until a re-attach. An <Activity> that hid the provider reconnects these
    // instances on its reveal; dropping them then, from the snapshot the reveal already rendered,
    // unmounted their roots before zag started them and left its scroll lock on the page.
  };

  return {
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => instances,
    open: (definition, payload) => {
      if (detached) return Promise.resolve(undefined);
      // Before the replace loop, so that a payload that throws (a revoked proxy, a throwing
      // getter) cancels nothing and still resolves instead of rejecting.
      let copy: Readonly<Record<string, unknown>>;
      try {
        copy = { ...payload };
      } catch (error) {
        onError(error);
        return Promise.resolve(undefined);
      }
      return new Promise(resolve => {
        // An earlier open() of this definition that is not inserted yet gives way: a double click
        // during the first load, or two calls a microtask or two apart (StrictMode's doubled mount
        // effect) even when the code is cached.
        for (const [loadingId, loading] of pending) {
          if (loading.definition !== definition) continue;
          pending.delete(loadingId);
          loading.settle(undefined);
        }
        const id = ++lastId;
        pending.set(id, { definition, payload: copy, settle: resolve });
        // Inside the chain, so a loader that throws, or a definition with no load at all (not made
        // by defineOverlay, e.g. a mock), still settles through failLoad.
        new Promise<ErasedOverlayComponent>(resolveLoad => resolveLoad(definition.load())).then(
          Component => insert(id, Component),
          error => failLoad(id, error),
        );
      });
    },
    close: (id, result) => {
      const settle = startClosing(id);
      if (!settle) return;
      emit();
      settle(result);
    },
    remove,
    fail: (id, error) => {
      const entry = live.get(id);
      if (!entry) return;
      entry.settle(undefined);
      drop(id);
      emit();
      onError(error);
    },
    setCloseKey: key => {
      const previous = recordedKey;
      recordedKey = { value: key };
      if (!previous || Object.is(previous.value, key)) return;
      settlePending();
      const settles = instances
        .filter(instance => instance.open)
        .flatMap(({ id }) => startClosing(id) ?? []);
      if (settles.length === 0) return;
      emit();
      for (const settle of settles) settle(undefined);
    },
    setOnError: handler => {
      onError = handler;
    },
    reportError: error => onError(error),
    attach: () => {
      const revived = detached;
      detached = false;
      attachCount++;
      if (!revived) return;
      // A microtask later, after the revealed roots' layout effects queued their start.
      queueMicrotask(() => {
        const kept = instances.filter(instance => live.has(instance.id));
        if (kept.length === instances.length) return;
        instances = kept;
        emit();
      });
    },
    release: () => {
      const releasedAt = attachCount;
      queueMicrotask(() => {
        if (attachCount === releasedAt) detach();
      });
    },
    detach,
  };
};
