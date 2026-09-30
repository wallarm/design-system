import { describe, expect, it, vi } from 'vitest';
import { createPortalRegistry } from './portalRegistry';

const makeHost = () => document.createElement('span');

describe('createPortalRegistry', () => {
  it('starts empty', () => {
    const registry = createPortalRegistry();
    expect(registry.getSnapshot()).toEqual([]);
  });

  it('registers entries with unique increasing ids', () => {
    const registry = createPortalRegistry();
    const hostA = makeHost();
    const hostB = makeHost();

    const a = registry.register(hostA, 'A');
    const b = registry.register(hostB, 'B');

    expect(b).toBeGreaterThan(a);
    expect(registry.getSnapshot()).toEqual([
      { id: a, host: hostA, node: 'A' },
      { id: b, host: hostB, node: 'B' },
    ]);
  });

  it('keeps the snapshot reference stable until a change', () => {
    const registry = createPortalRegistry();
    registry.register(makeHost(), 'A');
    const first = registry.getSnapshot();

    expect(registry.getSnapshot()).toBe(first);

    registry.register(makeHost(), 'B');
    expect(registry.getSnapshot()).not.toBe(first);
    expect(first).toHaveLength(1);
  });

  it('updates the node of an entry', () => {
    const registry = createPortalRegistry();
    const host = makeHost();
    const id = registry.register(host, 'old');

    registry.update(id, 'new');

    expect(registry.getSnapshot()).toEqual([{ id, host, node: 'new' }]);
  });

  it('ignores updates with the same node or an unknown id', () => {
    const registry = createPortalRegistry();
    const id = registry.register(makeHost(), 'same');
    const listener = vi.fn();
    registry.subscribe(listener);
    const before = registry.getSnapshot();

    registry.update(id, 'same');
    registry.update(9999, 'other');

    expect(listener).not.toHaveBeenCalled();
    expect(registry.getSnapshot()).toBe(before);
  });

  it('unregisters entries and ignores unknown ids', () => {
    const registry = createPortalRegistry();
    const a = registry.register(makeHost(), 'A');
    const hostB = makeHost();
    const b = registry.register(hostB, 'B');
    const listener = vi.fn();
    registry.subscribe(listener);

    registry.unregister(a);
    expect(registry.getSnapshot()).toEqual([{ id: b, host: hostB, node: 'B' }]);
    expect(listener).toHaveBeenCalledTimes(1);

    registry.unregister(a);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies subscribers on every change and stops after unsubscribe', () => {
    const registry = createPortalRegistry();
    const listener = vi.fn();
    const unsubscribe = registry.subscribe(listener);

    const id = registry.register(makeHost(), 'A');
    registry.update(id, 'B');
    registry.unregister(id);
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    registry.register(makeHost(), 'C');
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('does not reuse ids after unregister', () => {
    const registry = createPortalRegistry();
    const a = registry.register(makeHost(), 'A');
    registry.unregister(a);
    const b = registry.register(makeHost(), 'B');
    expect(b).not.toBe(a);
  });
});
