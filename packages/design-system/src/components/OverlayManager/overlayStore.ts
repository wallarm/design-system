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
  /** Provider mounted, including the remount after a StrictMode replay. */
  attach: () => void;
  /** Provider unmounted: settles everything `undefined`, drops all, and later open() calls resolve `undefined` at once. */
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

  /** Settles an open instance and starts its exit without notifying. False when there was nothing to close. */
  const startClosing = (id: number, result: unknown) => {
    const entry = live.get(id);
    if (!entry || !instances.some(instance => instance.id === id && instance.open)) return false;
    entry.settle(result);
    entry.fallbackTimer = setTimeout(() => remove(id), REMOVE_FALLBACK_MS);
    instances = instances.map(instance =>
      instance.id === id ? { ...instance, open: false } : instance,
    );
    return true;
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
      return new Promise(resolve => {
        // A double click during the first load: the earlier open of this definition gives way.
        for (const [loadingId, loading] of pending) {
          if (loading.definition !== definition) continue;
          pending.delete(loadingId);
          loading.settle(undefined);
        }
        const id = ++lastId;
        pending.set(id, { definition, payload: { ...payload }, settle: resolve });
        definition.load().then(
          Component => insert(id, Component),
          error => failLoad(id, error),
        );
      });
    },
    close: (id, result) => {
      if (startClosing(id, result)) emit();
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
      const open = instances.filter(instance => instance.open);
      for (const { id } of open) startClosing(id, undefined);
      if (open.length > 0) emit();
    },
    setOnError: handler => {
      onError = handler;
    },
    attach: () => {
      detached = false;
    },
    detach: () => {
      detached = true;
      settlePending();
      for (const entry of live.values()) {
        entry.settle(undefined);
        clearTimeout(entry.fallbackTimer);
      }
      live.clear();
      if (instances.length === 0) return;
      instances = [];
      emit();
    },
  };
};
