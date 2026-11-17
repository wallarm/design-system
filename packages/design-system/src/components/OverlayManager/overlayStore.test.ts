import { afterEach, describe, expect, it, rs } from '@rstest/core';
import type { InternalOverlayDefinition } from './defineOverlay';
import {
  createOverlayStore,
  type OverlayStore,
  REMOVE_FALLBACK_MS,
  reportOverlayError,
} from './overlayStore';
import type { ErasedOverlayComponent } from './types';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const Overlay = (() => null) as unknown as ErasedOverlayComponent;
const definitionOf = (load: () => Promise<ErasedOverlayComponent>): InternalOverlayDefinition => ({
  load,
  preload: async () => undefined,
});
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

/** A definition whose code is available at once (the store still inserts it a microtask later). */
const eager = () => definitionOf(async () => Overlay);

const newestId = (store: OverlayStore) => {
  const instance = store.getSnapshot().at(-1);
  if (!instance) throw new Error('the snapshot is empty');
  return instance.id;
};

/** Opens an overlay and waits until the store has inserted it. */
const openLoaded = async (
  store: OverlayStore,
  payload?: object,
  definition = eager(),
): Promise<{ result: Promise<unknown>; id: number }> => {
  const result = store.open(definition, payload);
  await flush();
  return { result, id: newestId(store) };
};

describe('overlayStore', () => {
  afterEach(() => {
    rs.useRealTimers();
  });

  it('inserts an open instance with its payload once the code loads', async () => {
    const store = createOverlayStore();
    store.open(eager(), { name: 'Jane' });
    expect(store.getSnapshot()).toEqual([]);

    await flush();

    expect(store.getSnapshot()).toEqual([
      { id: expect.any(Number), Component: Overlay, payload: { name: 'Jane' }, open: true },
    ]);
  });

  it('resolves the value passed to close and keeps the instance until removed', async () => {
    const store = createOverlayStore();
    const { result, id } = await openLoaded(store);

    store.close(id, true);

    await expect(result).resolves.toBe(true);
    expect(store.getSnapshot()).toMatchObject([{ id, open: false }]);
    store.remove(id);
    expect(store.getSnapshot()).toEqual([]);
  });

  it('settles once: a later close is a no-op', async () => {
    const store = createOverlayStore();
    const { result, id } = await openLoaded(store);

    store.close(id, true);
    const closing = store.getSnapshot();
    store.close(id, false);

    await expect(result).resolves.toBe(true);
    expect(store.getSnapshot()).toBe(closing);
  });

  it('resolves undefined on close without a value', async () => {
    const store = createOverlayStore();
    const { result, id } = await openLoaded(store);

    store.close(id);

    await expect(result).resolves.toBeUndefined();
  });

  it('drops a closed instance after REMOVE_FALLBACK_MS without an exit signal', async () => {
    const store = createOverlayStore();
    const { id } = await openLoaded(store);
    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    store.close(id);
    rs.advanceTimersByTime(REMOVE_FALLBACK_MS - 1);
    expect(store.getSnapshot()).toHaveLength(1);
    rs.advanceTimersByTime(1);

    expect(store.getSnapshot()).toEqual([]);
  });

  it('remove clears the fallback timer', async () => {
    const store = createOverlayStore();
    const { id } = await openLoaded(store);
    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    store.close(id);
    expect(rs.getTimerCount()).toBe(1);
    store.remove(id);
    expect(rs.getTimerCount()).toBe(0);
    rs.advanceTimersByTime(REMOVE_FALLBACK_MS);

    expect(store.getSnapshot()).toEqual([]);
  });

  it('remove settles an instance that was never closed', async () => {
    const store = createOverlayStore();
    const { result, id } = await openLoaded(store);

    store.remove(id);

    await expect(result).resolves.toBeUndefined();
    expect(store.getSnapshot()).toEqual([]);
  });

  it('replaces an open of the same definition that is still loading', async () => {
    const store = createOverlayStore();
    const gate = deferred<ErasedOverlayComponent>();
    const definition = definitionOf(() => gate.promise);

    const first = store.open(definition, { a: 1 });
    const second = store.open(definition, { a: 2 });
    await expect(first).resolves.toBeUndefined();
    gate.resolve(Overlay);
    await flush();

    expect(store.getSnapshot()).toMatchObject([{ payload: { a: 2 }, open: true }]);
    store.close(newestId(store), 'second');
    await expect(second).resolves.toBe('second');
  });

  it('keeps two instances of the same definition once its code is cached', async () => {
    const store = createOverlayStore();
    const definition = eager();
    const first = await openLoaded(store, undefined, definition);
    const second = await openLoaded(store, undefined, definition);

    expect(store.getSnapshot()).toHaveLength(2);
    store.close(first.id, true);
    store.close(second.id, false);

    await expect(first.result).resolves.toBe(true);
    await expect(second.result).resolves.toBe(false);
  });

  it('resolves undefined, reports and inserts nothing when the loader rejects', async () => {
    const store = createOverlayStore();
    const onError = rs.fn();
    store.setOnError(onError);
    const error = new Error('chunk');

    const result = store.open(definitionOf(() => Promise.reject(error)));

    await expect(result).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
    expect(store.getSnapshot()).toEqual([]);
  });

  it('fail settles undefined, drops the instance and reports', async () => {
    const store = createOverlayStore();
    const onError = rs.fn();
    store.setOnError(onError);
    const { result, id } = await openLoaded(store);
    const error = new Error('render');

    store.fail(id, error);

    await expect(result).resolves.toBeUndefined();
    expect(store.getSnapshot()).toEqual([]);
    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
  });

  it('fail during closing only drops the instance', async () => {
    const store = createOverlayStore();
    const onError = rs.fn();
    store.setOnError(onError);
    const { result, id } = await openLoaded(store);
    const error = new Error('render');
    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    store.close(id, true);
    store.fail(id, error);

    await expect(result).resolves.toBe(true);
    expect(store.getSnapshot()).toEqual([]);
    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
    expect(rs.getTimerCount()).toBe(0);
  });

  it('setCloseKey records the first key and ignores an unchanged one', async () => {
    const store = createOverlayStore();
    await openLoaded(store);

    store.setCloseKey('a');
    store.setCloseKey('a');

    expect(store.getSnapshot()).toMatchObject([{ open: true }]);
  });

  it('setCloseKey closes open instances and drops loading ones created before the change', async () => {
    const store = createOverlayStore();
    const { result: a, id: aId } = await openLoaded(store);
    const gate = deferred<ErasedOverlayComponent>();
    const b = store.open(definitionOf(() => gate.promise));

    store.setCloseKey('a');
    store.setCloseKey('b');

    await expect(a).resolves.toBeUndefined();
    await expect(b).resolves.toBeUndefined();
    expect(store.getSnapshot()).toMatchObject([{ id: aId, open: false }]);
    gate.resolve(Overlay);
    await flush();
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('leaves an instance opened after the key change alone', async () => {
    const store = createOverlayStore();
    store.setCloseKey('a');
    store.setCloseKey('b');

    const { result, id } = await openLoaded(store);

    expect(store.getSnapshot()).toMatchObject([{ id, open: true }]);
    store.close(id, 'kept');
    await expect(result).resolves.toBe('kept');
  });

  it('detach settles everything, drops all and blocks late inserts', async () => {
    const store = createOverlayStore();
    const { result: a } = await openLoaded(store);
    const gate = deferred<ErasedOverlayComponent>();
    const b = store.open(definitionOf(() => gate.promise));

    store.detach();

    await expect(a).resolves.toBeUndefined();
    await expect(b).resolves.toBeUndefined();
    expect(store.getSnapshot()).toEqual([]);
    gate.resolve(Overlay);
    await flush();
    expect(store.getSnapshot()).toEqual([]);
  });

  it('open after detach resolves undefined without loading', async () => {
    const store = createOverlayStore();
    const load = rs.fn(async () => Overlay);

    store.detach();

    await expect(store.open(definitionOf(load))).resolves.toBeUndefined();
    expect(load).not.toHaveBeenCalled();
  });

  it('attach after detach makes the store usable again', async () => {
    const store = createOverlayStore();

    store.detach();
    store.attach();
    store.open(eager());
    await flush();

    expect(store.getSnapshot()).toMatchObject([{ open: true }]);
  });

  it('detach clears the fallback timers', async () => {
    const store = createOverlayStore();
    const { id } = await openLoaded(store);
    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    store.close(id);
    store.detach();

    expect(rs.getTimerCount()).toBe(0);
  });

  it('ignores close, remove and fail for unknown ids', async () => {
    const store = createOverlayStore();
    const onError = rs.fn();
    const listener = rs.fn();
    store.setOnError(onError);
    await openLoaded(store);
    store.subscribe(listener);
    const before = store.getSnapshot();

    store.close(999, true);
    store.remove(999);
    store.fail(999, new Error('late'));

    expect(store.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('keeps the snapshot reference while nothing changes', async () => {
    const store = createOverlayStore();
    const empty = store.getSnapshot();
    expect(store.getSnapshot()).toBe(empty);

    const { id } = await openLoaded(store);
    const loaded = store.getSnapshot();
    expect(loaded).not.toBe(empty);
    expect(store.getSnapshot()).toBe(loaded);

    store.close(id);
    expect(store.getSnapshot()).not.toBe(loaded);
  });

  it('notifies subscribers on insert, close and remove', async () => {
    const store = createOverlayStore();
    const listener = rs.fn();
    const unsubscribe = store.subscribe(listener);

    store.open(eager());
    expect(listener).not.toHaveBeenCalled();
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);

    const id = newestId(store);
    store.close(id);
    expect(listener).toHaveBeenCalledTimes(2);
    store.remove(id);
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    store.open(eager());
    await flush();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});

describe('reportOverlayError', () => {
  afterEach(() => {
    rs.unstubAllGlobals();
    rs.restoreAllMocks();
  });

  it('hands the error to reportError when the environment has it', () => {
    const reportError = rs.fn();
    rs.stubGlobal('reportError', reportError);
    const error = new Error('boom');

    reportOverlayError(error);

    expect(reportError).toHaveBeenCalledExactlyOnceWith(error);
  });

  it('falls back to console.error when there is no reportError', () => {
    rs.stubGlobal('reportError', undefined);
    const consoleError = rs.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new Error('boom');

    reportOverlayError(error);

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
  });
});
